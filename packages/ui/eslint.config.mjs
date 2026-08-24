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
    // VRT 撮影スクリプトは Node で動くが、page.evaluate / addInitScript に渡す関数は
    // ブラウザ側で実行されるため、両方のグローバルを持つ。
    files: ["infra/vrt/**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        window: "readonly",
        document: "readonly",
        MutationObserver: "readonly",
      },
    },
  },
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
