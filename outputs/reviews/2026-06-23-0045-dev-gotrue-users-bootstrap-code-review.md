# Review: dev の GoTrue ユーザ作成（実装）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-23 00:45 JST |
| レビュアー | Claude Code（code-reviewer agent） |
| 対象 Plan | [`plans/2026-06-23-0005-dev-gotrue-users-bootstrap.md`](../plans/2026-06-23-0005-dev-gotrue-users-bootstrap.md) |
| ブランチ | `feature/dev-gotrue-users` |
| 関連 PR | TBD |
| レビュー種別 | 実装 |

## 判定

| 項目 | 判定 |
|---|---|
| 最終判定 | **APPROVE** |
| Plan 判定 | N/A（[計画レビュー](2026-06-23-0030-dev-gotrue-users-bootstrap-review.md)済み） |
| 実装判定 | **APPROVE**（BLOCKER なし。計画レビュー指摘は実装で対応済み） |
| 記録整理 | OK |

## 検証

- [x] クリーン作り直しから admin(`isAdmin:true`)/alice(`isAdmin:false`) ログイン 200
- [x] `seed:gotrue:dev` 冪等（2 回目 created0/skipped4）
- [x] gotrue_id 全 4 ユーザ一致（手動同期不要）
- [x] docs 3 箇所 member→alice 統一
- [x] turbo verify 10 green / 追加 .mjs は prettier 整形済み
- [ ] CI green（PR 後）
- [ ] stg/prod 実環境（provision.mjs 未変更。笹木さん）

## 指摘事項

| 重大度 | ファイル | 指摘 | 対応 |
|---|---|---|---|
| LOW [NICE-TO-HAVE] | `scripts/seed-gotrue-dev.mjs` ↔ `packages/db/seed/10_users.sql` | UUID/パスワードが 2 ファイルで二重管理。将来ユーザ増時に更新漏れで gotrue_id 不一致の恐れ | 現状は相互参照コメントで実害なし。単一定数化は別タスク余地 |
| LOW [NICE-TO-HAVE] | `seed-gotrue-dev.mjs:80` | `isAlreadyExists` 正規表現は GoTrue 文言変更で追従要 | 文言変われば他 422 同様 die して気付ける（安全側）。許容 |

## 実装レビュー（確認済みの良い点）

- **多層ガード**: ①localhost 以外 die（stg/prod GoTrue は内部のみで localhost 非露出）②dev secret 以外 die（`provision.mjs:48` と対）。OR で片方すり抜けても止まる。バイパス実用上なし。
- **JWT mint**: `{role:service_role, aud:authenticated, exp:+60s}` で `provision.mjs` / `provisioning.ts` と整合。HS256/base64url 準拠。
- **冪等性**: 409/422 かつ本文に既存系文言のときのみスキップ。弱い PW 等の 422 は die（ログインできない dev を成功と誤報告しない）。
- **dev:up 順序**: compose(--wait healthy)→migrate→seed:gotrue:dev→db:seed→web。gotrue_id は値一致のみで FK 結合なし＝順序依存なし。
- **エラーハンドリング**: fetch 失敗を捕捉して die、非 2xx 本文は 300 字 truncate。PW は固定値・ログは email のみ・dev 限定。
- **docs 案B**: member→alice を 3 箇所統一、seed 実体と一致。USERS の 4 UUID は seed と完全一致。

verdict: APPROVE
