import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // workspace package を TS ソースのまま取り込む
  transpilePackages: ["@waoon/domain", "@waoon/auth"],
  // ui-catalog を submodule + link: で取り込んだら "@ui-catalog/core" を追加する
};

export default nextConfig;
