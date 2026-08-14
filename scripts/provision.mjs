// dev / stg / prod の seed 投入ディスパッチャ。
//
//   pnpm provision:{env}[:{step}]
//           ↑接続先（compose file / env file / network）  ↑投入する seed
//
// ステップと依存:
//
//   master ──┬── user ──── fixture（dev 専用）
//            └── demo
//
// 依存ステップは自動で先行実行する（`provision:dev:fixture` → master → user → fixture）。
// 実行順序は固定トポロジカル順 master → user → demo → fixture。demo と fixture は
// surveys / answers を共有するため、demo を先に置き（かつ demo の冪等判定を番兵行にして）
// fixture 先行の DB でも demo が誤スキップされないようにしている。
//
// 使い方（host で実行。stack 起動 + migration 適用後）:
//   dev:  pnpm provision:dev                                       （全ステップ）
//   dev:  pnpm provision:dev:demo                                  （demo だけ。master は自動で先行）
//   stg:  pnpm provision:stg  --users-csv /secure/path/staff.csv   （実メールを含む CSV は VCS に置かない）
//   prod: pnpm provision:prod --users-csv /secure/path/staff.csv
import { writeFileSync, chmodSync, existsSync } from "node:fs";
import { die, flag, hasFlag, resolvePath } from "./lib/cli.mjs";
import {
  countTargets,
  deleteAll,
  nonSeedReferences,
  referenceConditions,
  residualDependents,
} from "./lib/deprovision.mjs";
import { parseEnvFile } from "./lib/env.mjs";
import { createGoTrueClient, DEV_JWT_SECRET } from "./lib/gotrue.mjs";
import { createPsql } from "./lib/psql.mjs";
import * as master from "./provision/master.mjs";
import * as user from "./provision/user.mjs";
import * as demo from "./provision/demo.mjs";
import * as fixture from "./provision/fixture.mjs";

const STEPS = {
  master: { module: master, deps: [] },
  user: { module: user, deps: ["master"] },
  demo: { module: demo, deps: ["master"] },
  fixture: { module: fixture, deps: ["user"] },
};

// あるステップを消すときに「まだ残っていてはいけない」ステップ（依存する側）。
const DEPENDENTS = {
  master: ["user", "demo", "fixture"],
  user: ["fixture"],
  demo: [],
  fixture: [],
};

// 固定トポロジカル順。依存解決の結果はこの順に並べ替えて実行する。
const ORDER = ["master", "user", "demo", "fixture"];

// 環境定義。接続先・許可ステップ・既定 bundle・PW ポリシーをここに集約し、
// ステップ実装は env 非依存に保つ。
const ENVS = {
  dev: {
    composeFile: "infra/docker-compose.yml",
    network: "wanonwan",
    allowed: ["master", "user", "demo", "fixture"],
    bundle: ["master", "user", "demo", "fixture"],
    removable: ["master", "user", "demo"],
    defaultUsersCsv: "packages/db/seed/users/users.csv",
    // dev は固定 PW で直接ログインできる（localhost 限定の使い捨て）。
    fixedPassword: "Password1!",
    mustChangePassword: false,
  },
  stg: {
    composeFile: "infra/docker-compose.stg.yml",
    envFile: "infra/.env.stg",
    network: "wanonwan-stg",
    allowed: ["master", "user", "demo"],
    bundle: ["master", "user"],
    // stg/prod の user は実メール・実在人物の GoTrue identity と機微情報（健康状態・面談メモ）を
    // 持つため、user の deprovision は dev のみ。入口ごと塞ぐ。
    removable: ["master", "demo"],
    mustChangePassword: true,
  },
  prod: {
    composeFile: "infra/docker-compose.prod.yml",
    envFile: "infra/.env.prod",
    network: "wanonwan-prod",
    allowed: ["master", "user"],
    bundle: ["master"],
    removable: ["master"],
    mustChangePassword: true,
  },
};

const envName = flag("env");
if (!envName || !ENVS[envName]) {
  die(`--env は ${Object.keys(ENVS).join(" / ")} のいずれかが必要です（指定: ${envName ?? "なし"}）`);
}
const envDef = ENVS[envName];
const isDev = envName === "dev";

const isRemove = hasFlag("remove");

// 削除はステップ指定必須（全削除 alias は作らない）。投入は未指定なら環境の既定 bundle。
if (isRemove && !flag("step")) die("削除には --step が必須です（全削除はできません）");
const requested = flag("step") ? [flag("step")] : envDef.bundle;
for (const step of requested) {
  if (!STEPS[step]) die(`未知のステップです: ${step}（${Object.keys(STEPS).join(" / ")}）`);
  const allowed = isRemove ? envDef.removable : envDef.allowed;
  if (!allowed.includes(step)) {
    die(
      isRemove
        ? `${envName} では ${step} ステップを削除できません（削除可: ${allowed.join(" / ")}）`
        : `${envName} では ${step} ステップを実行できません（許可: ${allowed.join(" / ")}）`,
    );
  }
}

// 依存を再帰的に展開し、固定トポロジカル順へ整列する。
function withDeps(steps) {
  const seen = new Set();
  const visit = (name) => {
    if (seen.has(name)) return;
    seen.add(name);
    STEPS[name].deps.forEach(visit);
  };
  steps.forEach(visit);
  return ORDER.filter((s) => seen.has(s));
}
// 削除は依存を自動で引き込まない（巻き添え削除をしない）。投入だけ依存を先行実行する。
const plan = isRemove ? requested : withDeps(requested);

// 依存で引き込まれたステップが env で許可されていないなら止める（暗黙に禁止ステップを流さない）。
for (const step of plan) {
  if (!isRemove && !envDef.allowed.includes(step)) {
    die(`${envName} で ${step} ステップが依存として必要ですが許可されていません`);
  }
}

// 接続情報と JWT_SECRET。
//   dev     : env ファイルを secret に使わない。process.env ?? dev 既定。psql も --env-file 無し。
//   stg/prod: env ファイル必須。
let envFile, pgSuperuser, pgDatabase, jwtSecret;
if (isDev) {
  pgSuperuser = process.env.PG_SUPERUSER || "postgres";
  pgDatabase = process.env.PG_DATABASE || "wanonwan";
  jwtSecret = process.env.JWT_SECRET ?? DEV_JWT_SECRET;
  // dev 逆ガード: dev 値でなければ die（本番 secret での誤実行を防ぐ）。dev 値でない secret で
  // 署名すると、dev 既定で検証する GoTrue に弾かれ login 不能な orphan になる。
  if (!jwtSecret.includes("dev-only-change-me")) {
    die("dev は dev 既定の JWT_SECRET でのみ使えます（stg/prod は provision:stg / provision:prod）");
  }
} else {
  envFile = resolvePath(flag("env-file") ?? envDef.envFile);
  if (!existsSync(envFile)) {
    die(`env ファイルがありません: ${envFile}（${envName} サーバ上で実行していますか）`);
  }
  const env = parseEnvFile(envFile);
  pgSuperuser = env.PG_SUPERUSER || "postgres";
  pgDatabase = env.PG_DATABASE || "wanonwan";
  jwtSecret = env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.includes("dev-only-change-me")) {
    die("JWT_SECRET が未設定か dev 値です。先に check:secrets を通してください");
  }
}

// 人員 CSV。dev はリポジトリ同梱の CSV、stg/prod は実メールを含むため --users-csv を必須にする。
const usersCsv = flag("users-csv") ?? envDef.defaultUsersCsv;
if (plan.includes("user") && !usersCsv) {
  die("--users-csv は必須です（stg/prod の人員 CSV パス。実メールを含むため VCS に置かない）");
}

const psql = createPsql({
  composeFile: envDef.composeFile,
  envFile,
  user: pgSuperuser,
  database: pgDatabase,
});
// 接続確認を先に 1 回だけ行う。以降の psql 呼び出しは接続できる前提で書けるし、
// stack 未起動という一番ありがちな失敗が Node の stack trace ではなく 1 行で出る。
try {
  psql("SELECT 1;", { capture: true });
} catch {
  die(`${envName} の postgres に接続できません（stack は起動していますか: ${envDef.composeFile}）`);
}

const gotrue = createGoTrueClient({ network: flag("network") ?? envDef.network, jwtSecret });

const options = {
  usersCsv: usersCsv ? resolvePath(usersCsv) : undefined,
  fixedPassword: envDef.fixedPassword,
  mustChangePassword: envDef.mustChangePassword,
};

if (isRemove) {
  const step = plan[0];
  const sets = STEPS[step].module.seedSets({ options });

  // 1) 依存 seed 残存チェック。自動巻き込み削除はしない。
  // 残存判定には residualSets（あれば）を使う。seedSets は削除計画用で人員 CSV を要求するが、
  // 依存の残存を見るだけの場面では CSV が無いことがある（`deprovision:{stg,prod}:master`）。
  const dependents = DEPENDENTS[step].map((name) => {
    const mod = STEPS[name].module;
    return { name, sets: mod.residualSets ? mod.residualSets() : mod.seedSets({ options }) };
  });
  const residual = residualDependents(psql, dependents);
  if (residual.length > 0) {
    console.error(`✗ ${step} に依存する seed が残っています: ${residual.map((r) => r.name).join(" / ")}`);
    for (const r of residual) {
      // fixture は deprovision alias を持たない（dev 専用。作り直しは compose down -v）。
      if (r.name === "fixture") {
        console.error("  fixture は個別削除できません。dev は `pnpm compose:dev:down -v` で作り直してください");
      } else if (!envDef.removable.includes(r.name)) {
        // stg/prod の user のように、そもそも削除入口を塞いでいる依存。実行できない
        // コマンドを案内しないよう、理由を出して手詰まりであることを明示する。
        console.error(`  ${envName} では ${r.name} を削除できません（削除可: ${envDef.removable.join(" / ")}）`);
      } else {
        console.error(`  先に実行してください: pnpm deprovision:${envName}:${r.name} --yes`);
      }
    }
    process.exit(1);
  }

  // 2) 削除対象の提示。
  const targets = countTargets(psql, sets);
  const total = targets.reduce((n, t) => n + t.count, 0);
  console.log(`• ${envName}: ${step} の削除対象`);
  for (const t of targets) console.log(`  ${t.table}: ${t.count} 行`);
  if (total === 0) {
    console.log(`\ndone: deprovision ${envName} ${step} — 対象なし`);
    process.exit(0);
  }

  // 3) 非 seed 参照チェック（事前提示）。権威ある判定は deleteAll の中で同一 tx として再評価する。
  const conditions = referenceConditions(psql, sets);
  const refs = nonSeedReferences(psql, conditions);
  if (refs.length > 0) {
    console.error("\n✗ seed 由来でない行から参照されています。削除を中止しました:");
    for (const r of refs) {
      console.error(`  ${r.source} → ${r.target}: ${r.count} 行（ON DELETE ${r.onDelete}）`);
    }
    console.error("  参照元を先に整理するか、環境ごと作り直してください");
    process.exit(1);
  }

  if (!hasFlag("yes")) {
    console.log("\n削除は実行していません。実行するには --yes を付けてください");
    process.exit(0);
  }

  // DB の外に持つ状態（user なら GoTrue identity）は、DELETE で辿れなくなる前に控える。
  const externalTargets = STEPS[step].module.externalTargets?.({ psql, options }) ?? [];

  deleteAll(psql, sets, conditions, STEPS[step].module.suspendedTriggers?.() ?? []);
  console.log(`\ndone: deprovision ${envName} ${step} — ${total} 行を削除`);

  if (externalTargets.length > 0) {
    const { removed, failed } = STEPS[step].module.removeExternal({ gotrue, targets: externalTargets });
    console.log(`✓ GoTrue identity を ${removed} 件削除`);
    if (failed.length > 0) {
      console.error(`\n✗ GoTrue identity が ${failed.length} 件残りました（手動で削除してください）:`);
      for (const f of failed) console.error(`  ${f.id}: ${f.reason}`);
      console.error("  残したままだと次の provision で同じ email が 422 になり全行失敗します");
      process.exit(1);
    }
  }
  process.exit(0);
}

console.log(`• ${envName}: ${plan.join(" → ")}`);

// 行単位の失敗はここで打ち切るが、直ちに exit はしない。発行済みの一時 PW を下の
// credentials 出力に通してから終了する（作成済みユーザーの PW を落とすと復旧手段が admin
// によるリセットしか無くなる）。
let credentials = [];
let aborted = null;
for (const step of plan) {
  console.log(`\n— ${step} —`);
  const result = STEPS[step].module.provision({ psql, gotrue, options });
  if (step === "user") credentials = result.credentials;
  if (result?.failed > 0) {
    aborted = { step, ...result };
    break;
  }
}

// PW の提示。
//   dev     : 固定 PW なので stdout に出して良い（localhost 限定の使い捨て）。
//   stg/prod: 一時 PW を stdout / CI に出さず 0600 ファイルへ（配布後に削除する運用）。
if (plan.includes("user")) {
  if (isDev) {
    // 新規作成が無くても（再実行で全員 skip でも）dev は固定 PW を毎回案内する。
    console.log(`\n✓ dev ユーザーの初期パスワードは「${envDef.fixedPassword}」（固定・直接ログイン可）`);
  } else if (credentials.length > 0) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const credPath = resolvePath(`provision-credentials-${stamp}.txt`);
    const lines = [
      "# 初期パスワード（一度きり・配布後にこのファイルを削除してください）",
      "# 各ユーザーは初回ログイン時にパスワード変更を求められます（must_change_password）。",
      ...credentials.map((c) => `${c.email}\t${c.password}`),
    ];
    writeFileSync(credPath, lines.join("\n") + "\n", { mode: 0o600 });
    chmodSync(credPath, 0o600); // umask の影響を受けないよう明示
    console.log(`\n✓ 初期パスワードを書き出しました（stdout には出しません）: ${credPath}`);
  }
}

if (aborted) {
  console.error(
    `\n✗ ${aborted.step} ステップで ${aborted.failed} 行が失敗しました` +
      `（作成 ${aborted.created} / スキップ ${aborted.skipped}）。上の ✗ 行を確認してください`,
  );
  process.exit(1);
}

console.log(`\ndone: provision ${envName} — ${plan.join(" / ")}`);
