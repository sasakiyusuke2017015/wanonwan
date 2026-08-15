// postgres コンテナへ psql で入る。接続先は env ファイル（既定 infra/.env）から取る。
// 使い方: pnpm db:psql / pnpm db:psql -c "select 1" /
//         ENV_FILE=infra/.env.stg COMPOSE_FILE=infra/docker-compose.stg.yml pnpm db:psql
import { execFileSync } from "node:child_process";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, requireEnv } from "./lib/env.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const resolve = (p) => (isAbsolute(p) ? p : join(root, p));

const composeFile = resolve(process.env.COMPOSE_FILE ?? join("infra", "docker-compose.yml"));
const envFile = resolve(process.env.ENV_FILE ?? join("infra", ".env"));
const env = loadEnv(envFile);
const service = process.env.PG_SERVICE ?? "postgres";

// 追加引数（`-c "select 1"` 等）はそのまま psql へ渡す。引数ありは非対話利用なので
// -T を付ける（TTY が無い CI / パイプ経由でも動く）。引数なしの対話利用は TTY が要るため付けない。
const psqlArgs = process.argv.slice(2);
const tty = psqlArgs.length > 0 ? ["-T"] : [];

execFileSync(
  "docker",
  [
    "compose", "--env-file", envFile, "-f", composeFile, "exec", ...tty, service,
    "psql", "-U", requireEnv(env, "PG_SUPERUSER"), "-d", requireEnv(env, "PG_DATABASE"),
    ...psqlArgs,
  ],
  { stdio: "inherit" },
);
