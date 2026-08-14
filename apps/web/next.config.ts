import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
  // workspace package（TS ソース）と ui-catalog を Next 側でトランスパイル
  transpilePackages: ["@wanonwan/domain", "@wanonwan/auth", "@wanonwan/storage", "@ui-catalog/core"],
  // 本番 Docker image 用に最小ランタイム（standalone）を出力する。
  // pnpm モノレポなので tracing root をリポジトリ root に固定し、workspace 依存を取り込む。
  output: "standalone",
  outputFileTracingRoot: join(import.meta.dirname, "../.."),
};

export default nextConfig;
