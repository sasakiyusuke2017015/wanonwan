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

## 最低カバレッジ: 80%

テスト種別（**すべて必須**）:
1. **Unit テスト** — 個別の関数、ユーティリティ、コンポーネント
2. **Integration テスト** — API エンドポイント、DB 操作
3. **E2E テスト** — クリティカルなユーザーフロー（Playwright）

## テスト駆動開発（TDD）

**必須** ワークフロー:
1. 最初にテストを書く (RED)
2. テスト実行 → **失敗** することを確認
3. 最小限の実装を書く (GREEN)
4. テスト実行 → **成功** することを確認
5. リファクタ (IMPROVE)
6. カバレッジを確認 (80%+)

## テスト失敗のトラブルシュート

1. **tdd-guide** Agent を使う
2. テストの isolation を確認
3. mock が正しいか検証
4. テストではなく実装を直す（テスト自体が間違っているケースを除く）

## Agent サポート

- **tdd-guide** — 新機能では PROACTIVELY 使用。テスト先行を強制
- **e2e-runner** — Playwright による E2E テスト専門
