import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: [
      // tsconfig の "@/*": ["./*"] を Vitest でも解決する。
      { find: /^@\/(.+)/, replacement: path.resolve(__dirname, "$1") },
      // lib/auth/* の `import "server-only"` を node 環境で no-op にする。
      { find: /^server-only$/, replacement: path.resolve(__dirname, "test/server-only-shim.ts") },
    ],
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**"],
  },
});
