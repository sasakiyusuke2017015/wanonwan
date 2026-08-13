// user ステップ: 人員 CSV → GoTrue 発行 + public.users / user_roles への紐付け。
//
// 3 環境とも同一経路（GoTrue admin API → public.users INSERT、DB 失敗時は GoTrue を cleanup）。
// 冪等性は行単位: email / code のいずれかが既存なら skip する。CSV に行を足して再実行すると
// 差分だけが入る。
//
// 環境差（固定 PW / ランダム PW + must_change、既定 CSV）はディスパッチャが options で渡し、
// 本ステップは env を知らない。
import { basename } from "node:path";
import { parseRoles, readCsv } from "../lib/csv.mjs";
import { generateInitialPassword } from "../lib/gotrue.mjs";
import { refSubquery, sqlInList, sqlStr } from "../lib/psql.mjs";

function toTarget(r, csvLabel) {
  return {
    email: r.email,
    name: r.name,
    code: r.code,
    gotrueId: r.gotrue_id || undefined,
    roles: parseRoles(r.roles, `${csvLabel} ${r.code}`),
    positionCode: r.position_code,
    divisionCode: r.division_code,
    departmentCode: r.department_code,
    sectionCode: r.section_code,
  };
}

// options: { usersCsv, fixedPassword?, mustChangePassword }
// 戻り値の credentials は「新規発行した行」のみ。提示方法（stdout / 0600 ファイル）は呼び出し側の責務。
export function provision({ psql, gotrue, options }) {
  // エラー文言は実際に読んだファイルを指す（stg/prod は --users-csv で別ファイルを渡す）。
  const csvLabel = basename(options.usersCsv);
  const targets = readCsv(options.usersCsv).map((r) => toTarget(r, csvLabel));
  const credentials = [];
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const t of targets) {
    if (!t.email || !t.code) {
      console.error(`✗ email / code が空の行をスキップ: ${JSON.stringify(t)}`);
      failed++;
      continue;
    }

    // 既存チェックは GoTrue 発行の前に行う（email / code を独立に確認）。
    const dup = psql(
      `SELECT count(*) FROM public.users WHERE email = ${sqlStr(t.email)} OR code = ${sqlStr(t.code)};`,
      { capture: true },
    ).trim();
    if (dup !== "0") {
      console.log(`• 既存（スキップ）: ${t.email}`);
      skipped++;
      continue;
    }

    const password = options.fixedPassword ?? generateInitialPassword();
    let gotrueId;
    try {
      const body = {
        email: t.email,
        password,
        email_confirm: true,
        user_metadata: { name: t.name },
        app_metadata: { must_change_password: options.mustChangePassword },
      };
      if (t.gotrueId) body.id = t.gotrueId; // dev の固定 UUID。未指定なら GoTrue 採番
      gotrueId = gotrue.createUser(body);
    } catch (e) {
      console.error(`✗ ${t.email} の GoTrue 発行に失敗: ${e.stdout || e.message}`);
      failed++;
      continue;
    }

    // public.users + user_roles は同一 tx（片方だけ入った中途半端を残さない）。
    // 失敗時は当該行の GoTrue を掃除して orphan を残さない。
    try {
      const roleInserts = t.roles
        .map(
          (role) => `
      INSERT INTO public.user_roles (user_id, role)
      SELECT id, ${sqlStr(role)} FROM public.users WHERE email = ${sqlStr(t.email)};`,
        )
        .join("");
      psql(`
        BEGIN;
        INSERT INTO public.users (gotrue_id, code, name, email, position_id, division_id, department_id, section_id)
        SELECT ${sqlStr(gotrueId)}::uuid, ${sqlStr(t.code)}, ${sqlStr(t.name)}, ${sqlStr(t.email)},
          ${refSubquery("positions", t.positionCode)}, ${refSubquery("divisions", t.divisionCode)},
          ${refSubquery("departments", t.departmentCode)}, ${refSubquery("sections", t.sectionCode)};${roleInserts}
        COMMIT;
      `);
    } catch (e) {
      console.error(`✗ ${t.email} の public.users insert に失敗。GoTrue を掃除します: ${e.message}`);
      try {
        gotrue.deleteUser(gotrueId);
      } catch {
        console.error(`  GoTrue orphan cleanup 失敗: gotrue_id=${gotrueId}（手動削除してください）`);
      }
      failed++;
      continue;
    }

    console.log(`• 作成: ${t.email}`);
    credentials.push({ email: t.email, password });
    created++;
  }

  // 失敗しても throw しない。発行済みの一時 PW を呼び出し側が書き出してから中断できるようにする
  // （途中で throw すると、作成済みユーザーの PW が失われて誰もログインできなくなる）。
  return { created, skipped, failed, credentials };
}

// seed 由来の行 = 人員 CSV の email に一致する users 行と、その user_roles 行。
// user_roles は user ステップ自身が投入するため seed 由来として削除計画に含める。
// 一方 answer_viewers / user_interview_candidates 等の CASCADE junction は画面操作でしか
// 作られないため計画に含めない（残っていれば非 seed 参照として検出され、削除が中止される）。
export function seedSets({ options }) {
  const emails = sqlInList(readCsv(options.usersCsv).map((r) => r.email));
  return [
    { table: "user_roles", where: `user_id IN (SELECT id FROM public.users WHERE email IN ${emails})` },
    { table: "users", where: `email IN ${emails}` },
  ];
}

// 依存残存チェック専用の集合。`deprovision:{stg,prod}:master` は人員 CSV を持たない
// （stg/prod では user が removable でないため --users-csv を要求しない）ので、
// seedSets を使うと readCsv(undefined) でクラッシュする。
// user ステップが入れた行は必ず gotrue_id を持ち、demo の users 行は gotrue_id NULL なので、
// これを CSV 非依存の識別子として使う。
export function residualSets() {
  return [{ table: "users", where: "gotrue_id IS NOT NULL" }];
}

// 削除中だけ止めるトリガー。
//
// trg_prevent_last_admin_removal は「最後の admin を消させない」ための行トリガーで、
// 稼働中のシステムを守るものだが、user ステップ全体の撤去は admin を含めて 0 人にするのが
// 正しい終状態なので必ず衝突する（止めないと deprovision:{env}:user は常に失敗する）。
// 削除と同一トランザクション内でのみ無効化し、commit / rollback のどちらでも元に戻す。
export function suspendedTriggers() {
  return [{ table: "user_roles", trigger: "trg_prevent_last_admin_removal" }];
}

// user ステップは DB の外（GoTrue）にも状態を持つ。public.users を消した後では gotrue_id を
// 辿れないため、削除前に対象を控える。
export function externalTargets({ psql, options }) {
  const emails = sqlInList(readCsv(options.usersCsv).map((r) => r.email));
  return psql(
    `SELECT gotrue_id FROM public.users WHERE email IN ${emails} AND gotrue_id IS NOT NULL;`,
    { capture: true },
  )
    .trim()
    .split("\n")
    .filter(Boolean);
}

// DB 削除の後に GoTrue identity を消す。ここを飛ばすと auth.users が残り、次の
// provision で createUser が 422 になって全行失敗する（`compose down -v` 以外に復旧手段が無い）。
// DB を先に消すのは、途中で失敗したときに「DB に居るのにログインできない行」を作らないため。
// 残った identity は id を提示して手動削除に委ねる。
export function removeExternal({ gotrue, targets }) {
  const failed = [];
  for (const id of targets) {
    try {
      gotrue.deleteUser(id);
    } catch (e) {
      failed.push({ id, reason: e.stdout || e.message });
    }
  }
  return { removed: targets.length - failed.length, failed };
}
