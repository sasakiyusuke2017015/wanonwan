// outputs/infra-data/schema/*.sql を昇順に postgres コンテナへ適用する（idempotent）。
// 00_bootstrap.sql は初回 initdb.d でも実行されるが、IF NOT EXISTS / CREATE OR REPLACE で冪等。
// 使い方: pnpm db:migrate
import { readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaDir = join(root, "outputs", "infra-data", "schema");
const composeFile = join(root, "infra", "docker-compose.yml");
const db = process.env.PG_DATABASE ?? "waoon";
const user = process.env.PG_SUPERUSER ?? "postgres";

const files = readdirSync(schemaDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.log("no schema files found");
  process.exit(0);
}

for (const file of files) {
  const sql = readFileSync(join(schemaDir, file), "utf8");
  process.stdout.write(`applying ${file} ... `);
  execFileSync(
    "docker",
    [
      "compose",
      "-f",
      composeFile,
      "exec",
      "-T",
      "postgres",
      "psql",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      user,
      "-d",
      db,
    ],
    { input: sql, stdio: ["pipe", "inherit", "inherit"] },
  );
  console.log("ok");
}

console.log(`done: ${files.length} file(s) applied`);
