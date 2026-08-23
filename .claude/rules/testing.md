---
paths:
  - "apps/**/*.test.ts"
  - "apps/**/*.test.tsx"
  - "apps/**/*.spec.ts"
  - "apps/**/*.spec.tsx"
  - "packages/**/*.test.ts"
  - "packages/**/*.test.tsx"
  - "packages/**/*.spec.ts"
  - "packages/**/*.spec.tsx"
  - "apps/**/__tests__/**"
  - "packages/**/__tests__/**"
---

# テスト要件

## 実行コマンド

| コマンド | 対象 |
|---|---|
| `pnpm turbo run test` | Vitest（apps/web / apps/worker / packages/storage） |
| `pnpm test:db` | pgTAP（RLS・SQL。DB スタックが必要） |

CI（[ci.yml](../../.github/workflows/ci.yml)）は両方を実行する。E2E（Playwright）は
採用方針にあるが**現時点では未整備**（playwright.config なし。導入は別 Plan）。

`packages/ui` はテストを持つが `test` script を置いていないため `turbo run test` の
対象外（Storybook 経由の `test:storybook` のみ）。script を足すと turbo が
ベンダリング由来のスイート全体を回すため、CI に載せるのはスイート修復後にする。

## 書き方

- テストは実装と同じ package に置く（`*.test.ts` を実装ファイルの隣に）
- 新機能・バグ修正はテスト先行を推奨（[/tdd](../commands/tdd.md) がワークフローを提供）
- RLS を追加・変更したら pgTAP テストを同じ PR に含める

## テスト失敗のトラブルシュート

1. テストの isolation を確認（他テストの状態に依存していないか）
2. mock が正しいか検証
3. テストではなく実装を直す（テスト自体が間違っているケースを除く）
4. 行き詰まったら **tdd-guide** Agent を使う
