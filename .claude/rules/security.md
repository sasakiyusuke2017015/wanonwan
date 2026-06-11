---
paths:
  - "apps/web/src/app/api/**"
  - "apps/web/src/lib/auth/**"
  - "apps/web/src/lib/db/**"
  - "packages/db/sql/**"
  - "packages/db/src/**"
  - "infra/**"
  - "scripts/**"
---

# セキュリティガイドライン

## コミット前の必須チェック

**いかなるコミットの前にも** 以下を確認:
- [ ] ハードコードされた秘密情報がない（API キー、パスワード、トークン）
- [ ] すべてのユーザー入力がバリデーションされている
- [ ] SQL インジェクション対策（パラメータ化クエリ）
- [ ] XSS 対策（HTML のサニタイズ）
- [ ] CSRF 対策が有効
- [ ] 認証 / 認可が検証済み
- [ ] 全エンドポイントにレートリミット
- [ ] エラーメッセージから機密情報が漏れていない

## 秘密情報の管理

```typescript
// NEVER: ハードコードされた秘密情報
const apiKey = "sk-proj-xxxxx"

// ALWAYS: 環境変数経由
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## セキュリティ問題発見時の対応手順

セキュリティ上の問題を見つけたら:
1. 即座に **STOP**
2. **security-reviewer** Agent を使う
3. CRITICAL を先に修正してから続行
4. 漏洩した秘密情報はローテーション
5. 同種の問題がないかコードベース全体を確認
