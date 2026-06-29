// seed を投入する。マスタ + dev users は CSV ローダー（seed-from-csv.mjs）、
// RLS テスト兼デモ用フィクスチャは packages/db/seed/*.sql（昇順）を適用する。
// CSV → SQL の順で流す（20_sample.sql は alice 等のユーザーを前提にするため）。
// 使い方: pnpm db:seed
import { readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedDir = join(root, "packages", "db", "seed");
const composeFile = join(root, "infra", "docker-compose.yml");
const db = process.env.PG_DATABASE ?? "waoon";
const user = process.env.PG_SUPERUSER ?? "postgres";

// 1) マスタ + dev users + デモデータ（--demo）を CSV から投入（非空スキップで冪等）。
execFileSync("node", [join(root, "scripts", "seed-from-csv.mjs"), "--demo"], { stdio: "inherit" });

// 2) フィクスチャ SQL を昇順に適用。
const files = readdirSync(seedDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  const sql = readFileSync(join(seedDir, file), "utf8");
  process.stdout.write(`seeding ${file} ... `);
  execFileSync(
    "docker",
    ["compose", "-f", composeFile, "exec", "-T", "postgres", "psql", "-v", "ON_ERROR_STOP=1", "-U", user, "-d", db],
    { input: sql, stdio: ["pipe", "inherit", "inherit"] },
  );
  console.log("ok");
}
console.log(`done: CSV master/users + ${files.length} seed SQL file(s)`);
