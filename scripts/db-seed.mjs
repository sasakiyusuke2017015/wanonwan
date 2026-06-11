// outputs/infra-data/seed/*.sql を昇順に適用する（冪等な ON CONFLICT 前提）。
// 使い方: pnpm db:seed
import { readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedDir = join(root, "outputs", "infra-data", "seed");
const composeFile = join(root, "infra", "docker-compose.yml");
const db = process.env.PG_DATABASE ?? "waoon";
const user = process.env.PG_SUPERUSER ?? "postgres";

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
console.log(`done: ${files.length} seed file(s)`);
