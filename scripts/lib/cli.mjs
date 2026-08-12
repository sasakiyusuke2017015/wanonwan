// コマンドライン引数の最小パーサとリポジトリルート解決。provision ディスパッチャと各ステップで共有する。
import { dirname, join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// 値なしフラグ（例: --dev）。
export function hasFlag(name, argv = process.argv) {
  return argv.includes(`--${name}`);
}

// 値ありフラグ。値が欠落（次トークンが別フラグ or 末尾）なら undefined を返し、
// `--users-csv --dev` のように次のフラグを値として誤認しない。
export function flag(name, argv = process.argv) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const value = argv[i + 1];
  if (value === undefined || value.startsWith("--")) return undefined;
  return value;
}

export function resolvePath(p) {
  return isAbsolute(p) ? p : join(root, p);
}

export function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}
