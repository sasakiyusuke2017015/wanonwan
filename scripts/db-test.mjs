// outputs/infra-data/tests/*.test.sql を pgTAP テストとして app_user 接続で実行する。
// TAP 出力に "not ok" があれば失敗。使い方: pnpm test:db
import { readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const testsDir = join(root, "outputs", "infra-data", "tests");
const composeFile = join(root, "infra", "docker-compose.yml");
const db = process.env.PG_DATABASE ?? "waoon";
const appPassword = process.env.APP_USER_PASSWORD ?? "app";

const files = readdirSync(testsDir)
  .filter((f) => f.endsWith(".test.sql"))
  .sort();

let failed = 0;
for (const file of files) {
  const sql = readFileSync(join(testsDir, file), "utf8");
  console.log(`\n# ${file}`);
  let out = "";
  try {
    out = execFileSync(
      "docker",
      [
        "compose", "-f", composeFile, "exec", "-T",
        "-e", `PGPASSWORD=${appPassword}`,
        "postgres", "psql", "-X", "-q", "-v", "ON_ERROR_STOP=1",
        "-U", "app_user", "-d", db,
      ],
      { input: sql, encoding: "utf8" },
    );
  } catch (e) {
    out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
    failed++;
  }
  process.stdout.write(out);
  if (/^not ok/m.test(out)) failed++;
}

if (failed > 0) {
  console.error(`\npgTAP: FAILED (${failed})`);
  process.exit(1);
}
console.log(`\npgTAP: all passed (${files.length} file(s))`);
