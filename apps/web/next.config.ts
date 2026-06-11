import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // workspace package（TS ソース）と ui-catalog を Next 側でトランスパイル
  transpilePackages: ["@waoon/domain", "@waoon/auth", "@ui-catalog/core"],
};

export default nextConfig;
