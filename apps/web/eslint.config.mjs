import js from "@eslint/js";
import tseslint from "typescript-eslint";

// 認証プリミティブの直 import を業務 API route で禁止し、認可は必ず
// withActiveUser 経由に強制する（認可漏れの構造的防止）。
// raw な service_role mint は非公開で withServiceRole が安全な公開面のため ban 対象外。
// glob で `@/lib/auth/...` も相対 import も一括検出する（specifier 末尾一致）。
const restrictedAuthPrimitives = {
  patterns: [
    {
      group: ["**/lib/auth/current-user", "**/lib/auth/session", "**/lib/auth/jwt"],
      importNames: ["getCurrentClaims", "getAccessToken", "getRefreshToken", "verifyAccessToken"],
      message: "route では認可を withActiveUser 経由にすること（認証プリミティブの直 import 禁止）。",
    },
  ],
};

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "**/*.config.*"],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    // 業務 API route handler: 認証プリミティブ直 import を禁止
    files: ["app/api/**/route.ts"],
    rules: {
      "no-restricted-imports": ["error", restrictedAuthPrimitives],
    },
  },
  {
    // 認証の実装本体（auth route）はプリミティブの利用が正当 → ガード解除
    files: [
      "app/api/v1/auth/me/route.ts",
      "app/api/v1/auth/logout/route.ts",
      "app/api/v1/auth/refresh/route.ts",
      "app/api/v1/auth/change-password/route.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
);
