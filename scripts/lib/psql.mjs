// docker compose exec psql のラッパと SQL リテラルのエスケープ。
//
// postgres はホストへ公開しないため、SQL は必ず `docker compose exec -T postgres psql` 経由で流す。
// psql の標準入力に SQL を流し込む方式では prepared statement を使えないため、CSV 由来の値は
// すべて本モジュールのエスケープ関数を通してから埋め込む（インジェクション対策）。
import { execFileSync } from "node:child_process";
import { die, resolvePath } from "./cli.mjs";

// 環境（compose file / env file / 接続先）を束ねた psql ランナーを作る。
// ステップ実装は env を知らずにこのランナーだけを受け取る。
export function createPsql({ composeFile, envFile, service = "postgres", user, database }) {
  function args(extra) {
    const out = ["compose"];
    if (envFile) out.push("--env-file", resolvePath(envFile));
    out.push(
      "-f",
      resolvePath(composeFile),
      "exec",
      "-T",
      service,
      "psql",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      user,
      "-d",
      database,
    );
    return out.concat(extra);
  }

  // capture=true は -tA（タプルのみ・非整列）で stdout を返す。
  // captureStderr=true は失敗時のエラー文言で分岐したい呼び出し（deprovision のガード判定）向け。
  // 握り潰さないよう、失敗時は必ず stderr をそのまま出してから投げ直す。
  return function psql(sql, { capture = false, captureStderr = false } = {}) {
    try {
      return execFileSync("docker", args(capture ? ["-tA"] : []), {
        input: sql,
        encoding: "utf8",
        stdio: ["pipe", capture ? "pipe" : "inherit", captureStderr ? "pipe" : "inherit"],
      });
    } catch (e) {
      if (captureStderr && e.stderr) process.stderr.write(e.stderr);
      throw e;
    }
  };
}

export function rowCount(psql, table) {
  return Number(psql(`SELECT count(*) FROM public.${table};`, { capture: true }).trim());
}

// single quote エスケープ。
export const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;

// 値の配列を IN 句のリテラルへ。空配列は「決して一致しない」式にする
// （`IN ()` は構文エラー、`IN (NULL)` は常に UNKNOWN になり意図がぼやけるため）。
export function sqlInList(values) {
  return values.length === 0 ? "(SELECT NULL WHERE false)" : `(${values.map(sqlStr).join(", ")})`;
}

// 空文字 / undefined を SQL NULL に、それ以外を sqlStr に。
export function sqlValOrNull(v) {
  return v === undefined || v === "" ? "NULL" : sqlStr(v);
}

// 親 code を id へ解決するサブクエリ式。空なら NULL（org 列は nullable）。
export function refSubquery(table, code) {
  return code === undefined || code === ""
    ? "NULL"
    : `(SELECT id FROM public.${table} WHERE code = ${sqlStr(code)})`;
}

// 自然キー（title/body 等）で id を引くサブクエリ。col は固定識別子、val はエスケープ。
export function refByValue(table, col, val) {
  return val === undefined || val === ""
    ? "NULL"
    : `(SELECT id FROM public.${table} WHERE ${col} = ${sqlStr(val)} ORDER BY id LIMIT 1)`;
}

// 整数カラム用。生値を補間する前に整数であることを保証する（非数値の混入を SQL 手前で弾く）。
export function intLiteral(raw, label) {
  const n = Number(raw);
  if (!Number.isInteger(n)) die(`${label} が整数ではありません: ${JSON.stringify(raw)}`);
  return String(n);
}

export function intOrNull(raw, label) {
  return raw === undefined || raw === "" ? "NULL" : intLiteral(raw, label);
}

export function tsOrNull(raw) {
  return raw === undefined || raw === "" ? "NULL" : `${sqlStr(raw)}::timestamptz`;
}

// 文字列配列を jsonb 配列リテラルへ。要素は sqlStr でエスケープし text[] 経由で jsonb 化する。
export function jsonbStringArray(values) {
  return values.length === 0
    ? `'[]'::jsonb`
    : `to_jsonb(ARRAY[${values.map(sqlStr).join(", ")}]::text[])`;
}
