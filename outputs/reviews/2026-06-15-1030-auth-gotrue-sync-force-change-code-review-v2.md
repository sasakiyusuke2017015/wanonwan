# 再コードレビュー: auth-gotrue-sync-force-change

| 項目 | 値 |
|---|---|
| 種別 | 再コードレビュー（前回コードレビュー NEEDS WORK 反映後） |
| 対象 Plan | [2026-06-14-1455-auth-gotrue-sync-force-change](../plans/2026-06-14-1455-auth-gotrue-sync-force-change.md) |
| 前回コードレビュー | [2026-06-15-1015-auth-gotrue-sync-force-change-code-review](2026-06-15-1015-auth-gotrue-sync-force-change-code-review.md) |
| 判定 | **APPROVE** |

## 確認結果

前回 BLOCKER「非 admin が GoTrue email 更新を発火できる」は解消済み。

- `PUT /api/v1/users/[id]` は GoTrue 更新前の select tx で `app.is_admin()` を確認し、非 admin は 403 で即 return するようになっている。
- admin gate 通過後に `gotrue_id,email` を取得し、対象行なしは 404、email 変更時の `gotrue_id` 欠落は 409 になっている。
- GoTrue → DB の two-write 順序、DB update 0 行/DB 失敗時の best-effort rollback は維持されている。
- `reset-password` も対象行なし=404、対象行ありだが `gotrue_id` 欠落=409 に分離されている。

該当コード:

- [users/[id]/route.ts](../../apps/web/app/api/v1/users/[id]/route.ts): `app.is_admin()` を GoTrue I/O 前に確認。
- [users/[id]/route.ts](../../apps/web/app/api/v1/users/[id]/route.ts): email 変更時のみ GoTrue update、DB 失敗時 rollback。
- [users/[id]/reset-password/route.ts](../../apps/web/app/api/v1/users/[id]/reset-password/route.ts): `found` と `gotrueId` を分けて判定。

## 指摘

[NICE-TO-HAVE] B-0（`app_metadata.must_change_password` が access token claim に載るか）は未検証のまま。

Docker 未起動で runtime 検証未実施とのことなので、受け入れ前に必ず手動で確認すること。崩れる場合は Plan 判断 #2 通り DB カラム方式へピボットが必要。

## 補足

前回確認済みの `forceChangeGuard` 適用範囲、auth allowlist、middleware の `/api` 除外維持、change-password の current PW 確認と access+refresh 差し替え、service_role の扱い、metadata.ts の単一定義について、今回修正で新たな崩れは見当たらない。

verdict: APPROVE
