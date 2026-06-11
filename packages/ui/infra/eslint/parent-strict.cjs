/**
 * 複製先プロジェクトの src/ui/ ゾーンを ui-catalog 規約で縛るための ESLint 設定。
 *
 * 使い方（例）:
 *
 *   // .eslintrc.cjs
 *   module.exports = {
 *     overrides: [
 *       {
 *         files: ['src/ui/**\/*.{ts,tsx}'],
 *         extends: ['./infra/eslint/parent-strict.cjs'],
 *       },
 *     ],
 *   }
 *
 * 縛るもの:
 *   - 深い import 禁止（ui-catalog の内部実装に依存しない）
 *   - プロジェクト固有モジュールの import 禁止（業務ロジック混入の防止）
 *
 * 縛らないもの（現状）:
 *   - 依存方向違反（atoms → molecules）— カスタムルールが必要、後日
 *   - ビジネスロジック検出（fetch / axios 禁止）— プロジェクト依存度が高い、後日
 *
 * スタイル方針について:
 *   ui-catalog は Tailwind v4 を主、SCSS Module を併用する方針のため、
 *   Tailwind className の使用を ESLint で禁止しない。
 */

module.exports = {
  rules: {
    // ui-catalog の公開 entry より深い import を禁止する
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@ui-catalog/core/*/*'],
            message:
              'ui-catalog の深い内部パスへの import は禁止。公開 entry（@ui-catalog/core/atoms など）を使ってください。',
          },
          {
            group: ['@/*', '~/*'],
            message:
              'src/ui/ 配下ではプロジェクト固有モジュールの import を禁止。業務ロジックは props で受け取ってください。',
          },
        ],
      },
    ],
  },
}
