// deprovision の安全機構と削除実行。
//
// seed 由来の行だけを消す。判定は CSV の自然キー（code / email / title 等）一致で、
// **マーカー列は持たない**（スキーマ変更を避けるため）。この方式には原理的な限界があり、
// deprovision は「seed 投入後に対象データを画面編集していない環境のリセット」専用とする。
// 画面で編集された seed 行は判定から外れて取り残され、CSV と同一キーの実データは
// seed とみなされうる。
//
// 削除前に 2 段の検査を行う:
//   1) 依存 seed 残存チェック — 依存する側の seed が残っていれば削除コマンドを提示して中断
//   2) 非 seed 参照チェック   — 削除対象を参照する「seed 由来でない行」があれば中断
//
// 検査と DELETE は **ISOLATION LEVEL SERIALIZABLE** の単一トランザクションで実行する。
// READ COMMITTED では検査後に commit された並行トランザクションの行が DELETE に可視化し、
// CASCADE で巻き添えになる（TOCTOU）。
import { die } from "./cli.mjs";
import { sqlInList, sqlStr } from "./psql.mjs";

// 削除対象テーブルを参照する FK を pg_constraint から動的に列挙する。
// 静的なリストにすると将来の FK 追加でチェックを素通りする。
//
// 複合 FK は扱わない。列ごとに独立した 1 列 FK として展開すると
// 「どれか 1 列が一致するだけで参照あり」と誤判定し、無関係な行で削除が止まる（またはその逆）。
// 現行スキーマに複合 FK は無いので、検出したら黙って誤判定せずに die する。
function referencingForeignKeys(psql, tables) {
  const rows = psql(
    `SELECT c.conname, c.confrelid::regclass::text, c.conrelid::regclass::text,
            a.attname, ra.attname,
            CASE c.confdeltype WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL'
                               WHEN 'd' THEN 'SET DEFAULT' ELSE 'NO ACTION' END
       FROM pg_constraint c
       JOIN unnest(c.confkey) WITH ORDINALITY AS fk(attnum, ord) ON true
       JOIN unnest(c.conkey)  WITH ORDINALITY AS lk(attnum, ord) ON lk.ord = fk.ord
       JOIN pg_attribute a  ON a.attrelid = c.confrelid AND a.attnum = fk.attnum
       JOIN pg_attribute ra ON ra.attrelid = c.conrelid  AND ra.attnum = lk.attnum
      WHERE c.contype = 'f'
        AND c.confrelid::regclass::text IN ${sqlInList(tables)};`,
    { capture: true },
  );
  const fks = rows
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [name, target, source, targetCol, sourceCol, onDelete] = line.split("|");
      return { name, target, source, targetCol, sourceCol, onDelete };
    });

  const columnsPerConstraint = new Map();
  for (const fk of fks) {
    columnsPerConstraint.set(fk.name, (columnsPerConstraint.get(fk.name) ?? 0) + 1);
  }
  const composite = [...columnsPerConstraint].filter(([, n]) => n > 1).map(([name]) => name);
  if (composite.length > 0) {
    die(
      `複合 FK には対応していません: ${composite.join(" / ")}。` +
        "参照チェックを列ごとに分解すると誤判定するため中止しました（deprovision.mjs の対応が必要です）",
    );
  }
  return fks;
}

// FK を持たない text / polymorphic 参照。pg_constraint には出ないので明示リストで持つ。
//   survey_targets.target_code … 組織マスタの code を text で保持（target_type で判別）
//   attachments.entity_id      … answers / users / surveys の id を polymorphic に保持
const FK_LESS_REFERENCES = [
  { target: "positions", source: "survey_targets", match: (sel) => `target_type = 'position' AND target_code IN (SELECT code::text FROM ${sel})` },
  { target: "divisions", source: "survey_targets", match: (sel) => `target_type = 'division' AND target_code IN (SELECT code FROM ${sel})` },
  { target: "departments", source: "survey_targets", match: (sel) => `target_type = 'department' AND target_code IN (SELECT code FROM ${sel})` },
  { target: "sections", source: "survey_targets", match: (sel) => `target_type = 'section' AND target_code IN (SELECT code FROM ${sel})` },
  { target: "answers", source: "attachments", match: (sel) => `entity_type IN ('answer', 'interview') AND entity_id IN (SELECT id FROM ${sel})` },
  { target: "users", source: "attachments", match: (sel) => `entity_type = 'user_avatar' AND entity_id IN (SELECT id FROM ${sel})` },
  { target: "surveys", source: "attachments", match: (sel) => `entity_type = 'survey' AND entity_id IN (SELECT id FROM ${sel})` },
];

// 削除計画に含まれる行は「seed 由来」なので参照元として数えない。
// where 内の列は修飾なしで書かれており、単一テーブルのクエリではその表に解決される。
function notSeedRow(sets, table) {
  const own = sets.filter((s) => s.table === table);
  return own.length === 0 ? "true" : `NOT (${own.map((s) => `(${s.where})`).join(" OR ")})`;
}

// 各テーブルの削除対象件数。
export function countTargets(psql, sets) {
  return sets.map((s) => {
    const n = Number(
      psql(`SELECT count(*) FROM public.${s.table} WHERE ${s.where};`, { capture: true }).trim(),
    );
    return { ...s, count: n };
  });
}

// 依存する側の seed がまだ残っていないかを調べる。
export function residualDependents(psql, dependents) {
  return dependents.filter(({ sets }) =>
    sets.some(
      (s) =>
        Number(
          psql(`SELECT count(*) FROM public.${s.table} WHERE ${s.where};`, { capture: true }).trim(),
        ) > 0,
    ),
  );
}

// 「削除対象を参照する seed 由来でない行」を選ぶ条件を組み立てる。
// FK トポロジ（DDL）は事前に読むが、行の検査条件そのものは削除と同一トランザクションで評価する。
export function referenceConditions(psql, sets) {
  const tables = [...new Set(sets.map((s) => s.table))];
  const conditions = [];

  for (const fk of referencingForeignKeys(psql, tables)) {
    for (const s of sets.filter((x) => x.table === fk.target)) {
      conditions.push({
        source: fk.source,
        target: fk.target,
        onDelete: fk.onDelete,
        where: `${fk.sourceCol} IN (SELECT ${fk.targetCol} FROM public.${fk.target} WHERE ${s.where})
                AND ${notSeedRow(sets, fk.source)}`,
      });
    }
  }

  for (const ref of FK_LESS_REFERENCES) {
    for (const s of sets.filter((x) => x.table === ref.target)) {
      conditions.push({
        source: ref.source,
        target: ref.target,
        onDelete: "FK なし(text 参照)",
        where: ref.match(`public.${ref.target} WHERE ${s.where}`),
      });
    }
  }
  return conditions;
}

// 事前提示用の件数。権威ある判定は deleteAll の中（同一トランザクション）で行う。
export function nonSeedReferences(psql, conditions) {
  return conditions
    .map((c) => ({
      ...c,
      count: Number(
        psql(`SELECT count(*) FROM public.${c.source} WHERE ${c.where};`, { capture: true }).trim(),
      ),
    }))
    .filter((c) => c.count > 0);
}

// 参照チェック → DELETE を **SERIALIZABLE の単一トランザクション**で実行する。
// READ COMMITTED では、事前チェック後に commit された並行トランザクションの行が DELETE から
// 可視になり CASCADE で巻き添えになる（TOCTOU）。チェックを別 tx で先に済ませても同じ穴が開くため、
// 検査を DO ブロックとして同じトランザクションに埋め込み、違反があれば RAISE で全体を abort する。
export function deleteAll(psql, sets, conditions, suspendedTriggers = []) {
  const guards = conditions
    .map(
      (c) => `DO $guard$
DECLARE n bigint;
BEGIN
  SELECT count(*) INTO n FROM public.${c.source} WHERE ${c.where};
  IF n > 0 THEN
    RAISE EXCEPTION 'seed 由来でない参照が % 件あります (% -> %)', n, ${sqlStr(c.source)}, ${sqlStr(c.target)};
  END IF;
END
$guard$;`,
    )
    .join("\n");
  const deletes = sets.map((s) => `DELETE FROM public.${s.table} WHERE ${s.where};`).join("\n");
  // ALTER TABLE もトランザクション内なので、abort すれば無効化ごと巻き戻る。
  const disable = suspendedTriggers
    .map((t) => `ALTER TABLE public.${t.table} DISABLE TRIGGER ${t.trigger};`)
    .join("\n");
  const enable = suspendedTriggers
    .map((t) => `ALTER TABLE public.${t.table} ENABLE TRIGGER ${t.trigger};`)
    .join("\n");

  try {
    psql(
      `BEGIN ISOLATION LEVEL SERIALIZABLE;\n${guards}\n${disable}\n${deletes}\n${enable}\nCOMMIT;\n`,
      { captureStderr: true },
    );
  } catch (e) {
    const msg = `${e.message || ""}\n${e.stderr || ""}`;
    if (/could not serialize|40001/.test(msg)) {
      die("並行更新と競合したため削除しませんでした。もう一度実行してください");
    }
    if (/seed 由来でない参照/.test(msg)) {
      die("削除直前に seed 由来でない参照が現れたため中止しました（何も削除していません）");
    }
    // それ以外の SQL エラー（トリガー・制約違反など）も、Node の stack ではなく
    // postgres が出した ERROR 行を見せて止める。何も削除されていない（tx は abort 済み）。
    const pgError = /^ERROR: .*/m.exec(e.stderr ?? "");
    if (pgError) die(`削除に失敗しました（何も削除していません）: ${pgError[0]}`);
    throw e;
  }
}
