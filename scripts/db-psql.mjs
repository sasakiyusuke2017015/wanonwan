// postgres コンテナへ対話 psql で入る。接続先は env ファイル（既定 infra/.env）から取る。
// 使い方: pnpm db:psql / ENV_FILE=infra/.env.stg COMPOSE_FILE=infra/docker-compose.stg.yml pnpm db:psql
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

execFileSync(
  "docker",
  [
    "compose", "--env-file", envFile, "-f", composeFile, "exec", service,
    "psql", "-U", requireEnv(env, "PG_SUPERUSER"), "-d", requireEnv(env, "PG_DATABASE"),
  ],
  { stdio: "inherit" },
);
