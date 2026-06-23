# Plan Review: dev の GoTrue ユーザ作成を再現可能にする

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-23 00:30 JST |
| レビュアー | Claude Code（architect agent） |
| 対象 Plan | [`plans/2026-06-23-0005-dev-gotrue-users-bootstrap.md`](../plans/2026-06-23-0005-dev-gotrue-users-bootstrap.md) |
| レビュー種別 | 計画 |

## 判定

| 軸 | 判定 |
|---|---|
| 最終判定 | **APPROVE** |
| Plan 判定 | **APPROVE**（BLOCKER なし。NICE-TO-HAVE は判断ログ/検証へ追記で吸収。再計画レビュー不要） |
| 実装判定 | N/A |
| 記録整理 | OK |

## 総評

根本原因の特定（seed が `public.users` のみ作り `auth.users` を作らない）と解決方針（GoTrue admin API を id 指定で叩き seed 固定 UUID に整合）は実機確認に裏打ちされ妥当。dev 限定スコープ・`provision.mjs` 不変・`auth.users` 直 INSERT 回避・id 指定フォールバックまで筋が良い。BLOCKER なし。

## 指摘（すべて [NICE-TO-HAVE]。★=実装時に確実に拾う「明記必須」）

1. ★ **422 一律スキップは危険**: GoTrue の 422 は「既存ユーザ」だけでなく弱い PW / バリデーション不正でも返る。一律スキップするとログインできない dev を「成功」と誤報告。レスポンス本文/コードで「既存」を判定して分岐し、他の 422 は失敗扱い。
2. ★ **CI 非組み込みを明記**: [.github/workflows/ci.yml](../../.github/workflows/ci.yml) は `dev:up` ではなく `db:migrate`→`db:seed`→`test:db`(pgTAP) を個別実行。`seed:gotrue:dev` は CI に入らない（pgTAP は GoTrue ユーザ不要）。これを「意図的にやらない」と判断ログに明記し揺り戻しを防ぐ。
3. **dev secret ガード**: host 固定だけだと env 上書きで stg/prod を誤爆しうる。mint に使う JWT secret が dev 既定値（`dev-only-change-me-...`）でなければ即 die（`provision.mjs:48` の逆ガード）。多層防御。
4. **gotrue healthy 前提**: `seed:gotrue:dev` は GoTrue healthy 依存（`compose:dev:up --wait` で満たすが）、未 healthy 時に握りつぶさず失敗する観点を検証へ。
5. **フォールバック順序**: returned id で `public.users` を更新する案は、`seed:gotrue:dev`→`db:seed` 順だと update 対象が未作成。発動時は順序/参照を見直す旨を1行補記。
6. **docs 修正の網羅**: `member@example.com` は CONTRIBUTING.md:42 / verification:24 / **outputs/README.md** の3箇所。修正対象に outputs/README.md を含める。
7. **member 問題 = 案B 推奨**（docs を seed 実体 alice に合わせる）。理由: alice/bob/carol は RLS 否定テスト用に役割設計済み（carol=無関係）で、member 追加は pgTAP 前提を濁す。存在しないユーザを docs に書き続けない（evergreen）。一般ユーザ例は `alice@example.com` に統一。

## 確認した良い点
- mint token 形式が `provisioning.ts` / `provision.mjs:55` と同形式で再現性あり
- compose `GOTRUE_MAILER_AUTOCONFIRM:true` と `email_confirm:true` の二重で confirm 確実
- worker は GoTrue 非依存で影響なし。admin API 直作成は force-change を付けず dev 利便性的に正しい

verdict: APPROVE
