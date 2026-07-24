// packages/db/snapshot/schema.sql を再生成する（保守コマンド）。
//
// snapshot は「migrations を空 DB へ順次適用した結果」の pg_dump。真実は migrations 側で、
// これは生成物。migration を足したら `pnpm db:snapshot` で再生成し、コミットする。
// CI が「再生成して diff が出ないこと」を検証する（drift 検査）。
//
// 使い捨てコンテナで生成する理由: pg_cron は cron.database_name（=waoon、Dockerfile.db で固定）
// の DB でしか CREATE できず、0001_initial が cron.schedule() を呼ぶため、生成は waoon という名の
// DB に対して行う必要がある。dev の waoon DB を壊さないよう別コンテナを立てて捨てる。
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dbDir = join(root, "packages", "db");
const bootstrap = join(dbDir, "schema", "00_bootstrap.sql");
const migrationsDir = join(dbDir, "migrations");
const outFile = join(dbDir, "snapshot", "schema.sql");

const IMAGE = "waoon-postgres:15";
const CONTAINER = "waoon-snapshot-tmp";

function docker(args, opts = {}) {
  return execFileSync("docker", args, { encoding: "utf8", ...opts });
}
function psqlExec(sql) {
  return docker(
    ["exec", "-i", CONTAINER, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "waoon"],
    { input: sql, stdio: ["pipe", "inherit", "inherit"] },
  );
}
function cleanup() {
  try {
    docker(["rm", "-f", CONTAINER], { stdio: "ignore" });
  } catch {
    /* 既に無ければ無視 */
  }
}

const migrations = readdirSync(migrationsDir)
  .filter((f) => /^\d{4}_.*\.sql$/.test(f))
  .sort()
  .map((f) => ({ version: f.replace(/\.sql$/, ""), file: join(migrationsDir, f) }));

cleanup();
docker([
  "run", "-d", "--name", CONTAINER,
  "-e", "POSTGRES_DB=waoon",
  "-e", "POSTGRES_PASSWORD=postgres",
  IMAGE,
]);

try {
  // 起動待ち（pg_isready）。
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      docker(["exec", CONTAINER, "pg_isready", "-U", "postgres", "-d", "waoon"], { stdio: "ignore" });
      ready = true;
      break;
    } catch {
      execFileSync("sleep", ["1"]);
    }
  }
  if (!ready) throw new Error("postgres が起動しませんでした");

  // 1) bootstrap（ロール/スキーマ/拡張）。
  psqlExec(readFileSync(bootstrap, "utf8"));

  // 2) migrations を順次適用し、schema_migrations を作成・記入する。
  psqlExec(`CREATE TABLE IF NOT EXISTS public.schema_migrations (
    version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());`);
  for (const m of migrations) {
    process.stdout.write(`applying ${m.version} ... `);
    const record = `INSERT INTO public.schema_migrations(version) VALUES ('${m.version}');`;
    psqlExec(`BEGIN;\n${readFileSync(m.file, "utf8")}\n${record}\nCOMMIT;`);
    console.log("ok");
  }

  // 3) pg_dump（構造のみ）。pgmq のキュー実体テーブルは pg_extension_config_dump 登録により
  //    「data は dump・structure は extension 所有で非 dump」となり、replay で壊れる。schema ごと
  //    除外し、キューは pgmq.create() で再現する（下記）。
  const raw = docker([
    "exec", CONTAINER, "pg_dump", "--schema-only", "--no-owner", "--exclude-schema=pgmq",
    "-U", "postgres", "-d", "waoon",
  ]);

  // 実在キューを読み、snapshot 適用時に冪等再作成する（キュー名をハードコードしない）。
  const queues = docker(
    ["exec", "-i", CONTAINER, "psql", "-tA", "-U", "postgres", "-d", "waoon"],
    { input: "SELECT queue_name FROM pgmq.list_queues() ORDER BY queue_name;" },
  )
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  writeFileSync(outFile, normalize(raw, migrations, queues));
  console.log(`done: ${outFile} を再生成（${migrations.length} migration(s)）`);
} finally {
  cleanup();
}

// pg_dump 出力を決定的にし、bootstrap 済み DB へも再適用できる形へ正規化する。
function normalize(dump, migrations, queues) {
  const lines = dump.split(/\r?\n/).filter((line) => {
    // \restrict / \unrestrict はランダムトークン付きで毎回変わる（決定性を壊す）。
    if (/^\\(un)?restrict\b/.test(line)) return false;
    // pg_dump / server バージョン行は環境依存。
    if (/^-- Dumped (from|by)/.test(line)) return false;
    // --exclude-schema=pgmq でも残る pgmq 実体テーブル/シーケンスの ACL 等を落とす
    // （pgmq は bootstrap の拡張 + 下記 pgmq.create で完結。ここに dump 由来行を残さない）。
    if (/pgmq\.(q_|a_)/.test(line) || /Schema: pgmq;/.test(line)) return false;
    // COMMENT ON EXTENSION は拡張バージョンごとの説明文字列を含む。apt 版が僅かに変わると
    // 本文と無関係にここだけ変化し drift 検査を誤検知させるため落とす（拡張の有無は本文で担保）。
    if (/^COMMENT ON EXTENSION /.test(line)) return false;
    return true;
  });

  const body = lines
    .join("\n")
    // bootstrap(initdb) が既に作る auth/app/pgmq スキーマと衝突しないよう IF NOT EXISTS を付す。
    .replace(/^CREATE SCHEMA (?!IF NOT EXISTS)/gm, "CREATE SCHEMA IF NOT EXISTS ")
    // bootstrap が placeholder として作る app.current_user_id() / app.is_admin() と衝突しないよう
    // 全関数を OR REPLACE 化する（新規関数には無害）。
    .replace(/^CREATE FUNCTION /gm, "CREATE OR REPLACE FUNCTION ")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();

  const header = [
    "-- 生成物: `pnpm db:snapshot` が再生成する。手で編集しない。",
    "-- 真実は packages/db/migrations/*.sql。空 DB の高速初期化と CI drift 検査に使う。",
    "",
  ].join("\n");

  // pgmq キューの冪等再作成（pg_dump では復元できない実体テーブルを pgmq.create で作る）。
  const queueSql = queues.length
    ? "\n\n-- pgmq キュー（pg_dump 対象外。実体を pgmq.create で冪等再作成）\n" +
      queues
        .map(
          (q) =>
            `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pgmq.list_queues() WHERE queue_name = '${q}')` +
            ` THEN PERFORM pgmq.create('${q}'); END IF; END $$;`,
        )
        .join("\n")
    : "";

  // schema_migrations の data を末尾に付与（適用済み version を snapshot 適用で自動記入）。
  const inserts =
    "\n\n-- 適用済み migration の記録（snapshot 適用で schema_migrations を埋める）\n" +
    migrations
      .map((m) => `INSERT INTO public.schema_migrations(version) VALUES ('${m.version}');`)
      .join("\n") +
    "\n";

  return `${header}${body}\n${queueSql}${inserts}`;
}
