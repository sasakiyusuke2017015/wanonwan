import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "storybook-static/**",
      "node_modules/**",
      "**/*.config.*",
      // 消費側プロジェクト用の eslintrc テンプレート（ui 自身のソースではない）
      "infra/eslint/**",
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // `_` プレフィックスは「意図的に未使用」の慣習（placeholder の props/引数/catch）
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
