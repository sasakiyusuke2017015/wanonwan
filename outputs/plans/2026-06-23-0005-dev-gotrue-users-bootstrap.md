# Plan: dev の GoTrue ユーザ作成を再現可能にする（dev:up でログインできる状態に）

| 項目 | 値 |
|---|---|
| 概要 | クリーンな `pnpm dev:up`（特に `compose:dev:down -v` で volume 破棄した後）から |
| ステータス | ✅ 検証完了 |
| PR | [#53](https://github.com/sasakiyusuke2017015/wanonwan/pull/53)（merged） |
| Review | [計画レビュー](../reviews/2026-06-23-0030-dev-gotrue-users-bootstrap-review.md) / [コードレビュー](../reviews/2026-06-23-0045-dev-gotrue-users-bootstrap-code-review.md) |

## 目的

クリーンな `pnpm dev:up`（特に `compose:dev:down -v` で volume 破棄した後）から
**`admin@example.com` / `Admin1234!` でログインできない**。原因は、`db:seed` が
`public.users`（`gotrue_id` 固定 UUID）だけを作り、**GoTrue 側の `auth.users`
（パスワード）を作る自動ステップが無い**こと。GoTrue ユーザは「過去に手で作って
volume に残っていた」だけで、volume を消すと復活しない。

[docs/CONTRIBUTING.md:42](../../docs/CONTRIBUTING.md) は「seed 済みログイン:
`admin@example.com` / `Admin1234!`」と書いており、**実態と乖離（オンボーディングのバグ）**。

dev の GoTrue ユーザ作成を **決定的・冪等** にし、`dev:up` 一発でログインできる状態にする。

## 現状コンテキスト（起動検証 2026-06-22 で判明）

- `db:seed`（[10_users.sql](../../packages/db/seed/10_users.sql)）は `public.users` のみ。
  `gotrue_id` は固定 UUID をハードコード（admin=`cb427b54-…`, alice=`00000000-…-0a11ce` 等）。
  コメントに「admin の gotrue_id は *dev で作成した* GoTrue ユーザの id」と明記＝手動前提。
- `auth.users` は volume 破棄後 0 行。`dev:up` は `compose:dev:up → db:migrate → db:seed → web` で、
  GoTrue ユーザ作成を含まない。`provision.mjs` は stg/prod 用（ランダム PW・dev secret を拒否）。
- **検証で確認した事実**:
  - GoTrue admin API（`POST /admin/users`、service_role JWT）は **`id` 指定を受け付ける**
    （seed の固定 UUID をそのまま GoTrue 側 id にできる → seed との整合が自動で取れる）。
  - dev の JWT secret は compose 既定 `dev-only-change-me-please-32bytes-minimum`（`infra/.env` なし）。
  - 手動で GoTrue admin を作り `public.users.gotrue_id` を合わせると、login→`/me`（`isAdmin:true`）
    →未ログイン 401 まで正常。**認証実装自体は健全**で、欠落は「dev ユーザ作成手段」のみ。
- **派生して判明した docs 不整合**: CONTRIBUTING / 検証チェックリストは
  `admin@example.com` + `member@example.com`（Member1234!）と書くが、seed の実体は
  `admin` / `alice` / `bob` / `carol`。`member@example.com` は存在しない。→ 本 Plan で整理する。

## スコープ

### やること
- dev 用 GoTrue ユーザ作成スクリプト `scripts/seed-gotrue-dev.mjs` を新設
  - service_role JWT を dev secret で mint → `POST /admin/users` を **id 指定 + email_confirm:true** で実行
  - 対象は seed/10_users.sql のユーザと **同じ email / 固定 UUID**（admin/alice/bob/carol）
  - **冪等**（既存なら 422 等をスキップ）。dev compose（`localhost:9999`）前提
- `package.json`: `dev:up` の連鎖に組み込み（`db:migrate` → **seed:gotrue:dev** → `db:seed` → web）+
  単体実行用 `seed:gotrue:dev` を追加
- dev 既定パスワードを確定し docs と一致させる（admin=`Admin1234!` 等）
- `docs/CONTRIBUTING.md` のログインユーザ記述を
  **seed 実体に合わせて修正**（`member@example.com` 問題の解消: seed に追加する or docs を alice 等に直す）
- `seed/10_users.sql` のコメントを「手動作成前提」から実態に更新
- docs 修正対象は `member@example.com` の出現箇所すべて（計画レビュー指摘 6）

### やらないこと
- stg/prod の provisioning（`provision.mjs`）は変更しない（dev 専用の話）
- GoTrue の docker 設定変更（`MAILER_AUTOCONFIRM` 等）はしない
- `auth.users` への直接 INSERT はしない（GoTrue admin API 経由＝スキーマ/バージョン非依存で安全）
- **CI（ci.yml）には `seed:gotrue:dev` を組み込まない**。CI は `db:migrate`→`db:seed`→`test:db`(pgTAP)
  を個別実行し、pgTAP は `public.users` 固定 UUID だけで RLS 検証する＝GoTrue ユーザ不要。意図的に
  非組み込み（計画レビュー指摘 2。揺り戻し防止）

## 実装計画
1. `scripts/seed-gotrue-dev.mjs`:
   - dev secret で service_role JWT を mint（provision.mjs の `mintServiceRoleToken` と同等）
   - ユーザ定義（email / 固定 UUID / password / name）を seed と一致する形で配列化
   - 各ユーザを `POST http://localhost:9999/admin/users`（`id` 指定 + `email_confirm:true`）。
     **「既存ユーザ」を表すレスポンス（コード/本文）でのみスキップ**し、弱い PW / バリデーション
     不正等のその他 422 は**失敗扱いで非ゼロ終了**（成功と誤報告しない。計画レビュー指摘 1）
   - **dev secret ガード**: mint に使う JWT secret が dev 既定値（`dev-only-change-me-...`）でなければ
     即 die（`provision.mjs:48` の逆ガード。stg/prod GoTrue 誤爆の多層防御。計画レビュー指摘 3）
   - GoTrue host/port は dev 既定（localhost:9999）。GoTrue 未 healthy 時は握りつぶさず失敗
2. `package.json` に `seed:gotrue:dev` 追加し、`dev:up` に挿入。
3. dev パスワード確定 → docs（CONTRIBUTING / 検証チェックリスト）と seed コメントを整合。
4. `member@example.com` の扱いを決定（→ 判断ログ）。

## 検証
- [x] `compose:dev:down -v` → クリーン作り直し → migrate→seed:gotrue:dev→db:seed →
      `admin@example.com`/`Admin1234!` で login 200 + `wanonwan-access`/`wanonwan-refresh` Cookie + `/me` `isAdmin:true`
- [x] 一般ユーザ alice でも login 200 / `/me` `isAdmin:false`
- [x] `seed:gotrue:dev` 2 回実行で冪等（2 回目は created 0 / skipped 4）
- [x] `seed/10_users.sql` の `gotrue_id` と GoTrue 側 id が **全 4 ユーザ一致**（手動同期不要）
- [x] docs のログインユーザ記述を seed 実体に統一（CONTRIBUTING / verification / outputs/README の 3 箇所、member→alice）
- [x] turbo verify（typecheck/lint/build/test）10 タスク green
- [ ] **異常系**: 弱い PW 等の 422 を「既存」と区別し失敗で止める（コードで分岐実装済み。実発火テストは未実施）
- [ ] **GoTrue 未 healthy 時**に失敗で止まる（接続失敗で die 実装済み。実発火テストは未実施）
- [ ] **CI が従来どおり green**（`seed:gotrue:dev` 非組み込み。PR 後に確認）
- [ ] stg/prod の `provision.mjs` 経路に影響がない（未変更。stg/prod 実環境での確認は笹木さん）

## リスク
| リスク | 影響 | 緩和 |
|---|---|---|
| dev スクリプトが誤って stg/prod GoTrue を叩く | 本番ユーザ汚染 | host を dev 既定（localhost:9999）に固定。dev secret 前提を明示。env 上書きは慎重に |
| GoTrue バージョン差で `id` 指定が将来効かなくなる | dev ユーザ id 不一致 | 検証で id 一致を確認。効かない場合は「作成後 returned id で public.users を更新」にフォールバック |
| 既存ユーザがある dev で二重作成 | エラー | 既存（409/422）スキップで冪等化 |
| dev パスワードがリポジトリに平文で入る | dev 限定なので許容 | dev 専用・固定値であることをコメント明記（stg/prod は provision のランダム PW） |

## 判断ログ
| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-06-23 | GoTrue admin API（id 指定）で dev ユーザを作る。`auth.users` 直 INSERT はしない | id 指定が効くことを実機確認。admin API 経由なら GoTrue のスキーマ/バージョンに非依存で安全。seed の固定 UUID とも自動整合 |
| 2026-06-23 | dev パスワードは固定値をリポジトリに置く | dev 専用の利便性優先。stg/prod は provision のランダム PW で別管理のため漏洩リスクは dev に閉じる |
| 2026-06-23 | `member@example.com` 問題 = **案B 採用**（docs を seed 実体 alice に合わせる）。計画レビュー推奨 | alice/bob/carol は RLS 否定テスト用に役割設計済み（carol=無関係）で、member 追加は pgTAP 前提を濁す。存在しないユーザを docs に書き続けない（evergreen）。一般ユーザ例は `alice@example.com` に統一 |
| 2026-06-23 | CI に `seed:gotrue:dev` を組み込まない（意図的） | 計画レビュー指摘 2。CI は pgTAP のみで GoTrue ユーザ不要。CI を壊さず、後の揺り戻しを防ぐため明記 |
| 2026-06-23 | 422 は「既存」のみスキップ、その他は失敗。dev secret ガードを入れる | 計画レビュー指摘 1/3。弱い PW を成功と誤報告しない / stg・prod GoTrue 誤爆を多層防御 |

## ステータス
- [x] 計画レビュー（[APPROVE](../reviews/2026-06-23-0030-dev-gotrue-users-bootstrap-review.md)。architect agent。BLOCKER なし。NICE-TO-HAVE 7 件を本 Plan に反映済み）
- [x] Plan 承認（笹木さん）
- [x] 実装（seed-gotrue-dev.mjs + dev:up 組み込み + docs 案B）
- [x] コードレビュー（[APPROVE](../reviews/2026-06-23-0045-dev-gotrue-users-bootstrap-code-review.md)。code-reviewer agent。BLOCKER なし / NICE-TO-HAVE 2 件 LOW）
- [x] PR 作成 → 笹木さんマージ承認 → merge（[#53](https://github.com/sasakiyusuke2017015/wanonwan/pull/53)）
- [x] **マージ後検証**（2026-06-23・dev スタック）: `compose:dev:down -v` からのクリーン作り直しで `pnpm dev:up` が通り、`admin@example.com` / `alice@example.com` ともログイン 200・`/me` のロール正・誤 PW / 未認証は 401。`turbo run typecheck` / web test / `pnpm test:db`（pgTAP）green。stg・prod への影響なし（dev 専用スクリプト）
