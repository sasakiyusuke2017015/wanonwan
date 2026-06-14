# コードレビュー: auth-gotrue-sync-force-change

| 項目 | 値 |
|---|---|
| 種別 | コードレビュー（未コミット作業ツリー） |
| 対象 Plan | [2026-06-14-1455-auth-gotrue-sync-force-change](../plans/2026-06-14-1455-auth-gotrue-sync-force-change.md) |
| 計画レビュー | [再々計画レビュー v2](2026-06-15-0945-auth-gotrue-sync-force-change-replan-review-v2.md): APPROVE |
| 判定 | **NEEDS WORK** |

## 指摘

[BLOCKER] 非 admin が GoTrue email 更新を発火できる。

`PUT /api/v1/users/[id]` は GoTrue を先に更新してから DB update/RLS に進む設計だが、GoTrue 更新前の select が admin 判定をしていない。`public.users` は認証済みなら select 可能で、write のみ admin 制限なので、非 admin でも対象行の `gotrue_id` と現 email を読める。その後、email が変わるリクエストなら service_role で `gotrue.admin.updateUser(...)` が実行される。

該当箇所:

- [users/[id]/route.ts](../../apps/web/app/api/v1/users/[id]/route.ts): 先行 select が `gotrue_id,email` のみ。
- [users/[id]/route.ts](../../apps/web/app/api/v1/users/[id]/route.ts): GoTrue email 更新が DB update/RLS より前に実行される。
- [99_rls.sql](../../outputs/infra-data/schema/99_rls.sql): `users_select` は認証済み全員、`users_write` は admin。

影響:

- 非 admin が任意ユーザーの GoTrue email を一時的に変更できる。
- DB update が 0 行になった後に rollback される設計だが、rollback 失敗時は「DB=旧 email / GoTrue=攻撃者指定 email」が残る。
- rollback 成功時でも、非 admin に service_role 経由の外部副作用を起こさせている。

修正方針:

- GoTrue を触る前の select tx で `app.is_admin()` を確認し、非 admin は 403 で即 return する。
- `POST /users` や `reset-password` と同様に、外部 I/O 前の admin gate を必須にする。
- その上で `gotrue_id,email` を取得する。存在しない id は 404、`gotrue_id` 欠落は 409 のように分けると扱いやすい。

[NICE-TO-HAVE] `reset-password` の対象 id 不存在と `gotrue_id` 欠落が同じ 409 になる。

`rows[0]?.gotrueId ?? null` に潰しているため、対象 user が存在しない場合も「認証ユーザーが紐付いていません」409 になる。運用上の混乱を避けるなら、admin gate 後に「対象行なし=404」と「対象行ありだが gotrue_id なし=409」を分けるとよい。

[NICE-TO-HAVE] B-0（`app_metadata` が access token claim に載るか）は未検証のままなので、修正後の APPROVE 前に必ず手動ゲートとして実施する。

実装は claim 方式に閉じているため、B-0 が崩れると Plan 判断 #2 通り DB カラム方式へピボットが必要。Docker 未起動で未実施とのことなので、コード修正後の再レビュー/受け入れ時に必ず確認する。

## 確認できた点

- `forceChangeGuard` は業務 API に広く適用され、`auth/login`・`auth/refresh`・`auth/logout`・`auth/me` には誤適用されていない。
- middleware は `/api` matcher 除外を維持しており、認証 API を壊す前回懸念は再発していない。
- change-password は current PW 確認、service_role 更新、フラグ解除後の新 PW 再ログイン、`setSession` による access+refresh 差し替えの順で実装されている。
- service_role JWT は既存 `mintServiceRoleToken` を踏襲し、クライアントへ露出する経路は増えていない。
- `must_change_password` のメタデータキーは `metadata.ts` へ集約され、create/reset/change-password/jwt 抽出で同じヘルパを使っている。

verdict: NEEDS WORK
