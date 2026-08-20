---
paths:
  - "apps/web/app/api/**"
  - "apps/web/lib/auth/**"
  - "apps/web/lib/db/**"
  - "packages/db/**"
  - "infra/**"
  - "scripts/**"
---

# セキュリティガイドライン

認可・認証・データアクセスの一次情報は以下。本ファイルはチェックリストと導線のみ持つ。

| 内容 | 一次情報 |
|---|---|
| 認可の設計（API 層が主、RLS が最終ガード） | [CLAUDE.md](../../CLAUDE.md) 絶対方針 |
| 認証フロー（GoTrue JWT + Cookie） | [auth-patterns.md](./auth-patterns.md) |
| データアクセス層と SQL の書き方 | [data-access.md](./data-access.md) |

## コミット前の必須チェック

- [ ] ハードコードされた秘密情報がない（API キー、パスワード、トークン）
- [ ] 接続情報の env にフォールバック既定値を持たせていない（未設定なら即失敗させる）
- [ ] ユーザー入力を valibot でバリデーションしている
- [ ] SQL がパラメータ化されている（[data-access.md](./data-access.md)）
- [ ] 新規業務テーブルに RLS ポリシーがある（pgTAP でテスト。`pnpm test:db`）
- [ ] 未認証で叩ける auth 系エンドポイント（login / refresh / change-password）に
      `checkRateLimit`（[lib/auth/rate-limit](../../apps/web/lib/auth/rate-limit.ts)）を掛けている
- [ ] エラーメッセージ・ログから秘密情報が漏れていない

## 秘密情報の管理

- 秘密情報は env 経由でのみ渡す。stg / prod は `scripts/check-secrets.mjs` が
  `compose:stg:up` / `compose:prod:up` と CD で必須キーを検査する（不足なら起動しない）
- 添付ファイルは MinIO の presigned URL でブラウザ直通信。API は認可とメタ情報のみ扱い、
  ファイル本体を経由しない

## セキュリティ問題発見時の対応手順

1. 即座に **STOP**
2. **security-reviewer** Agent を使う
3. CRITICAL を先に修正してから続行
4. 漏洩した秘密情報はローテーション
5. 同種の問題がないかコードベース全体を確認
