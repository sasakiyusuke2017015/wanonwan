# 再計画レビュー: auth-gotrue-sync-force-change

| 項目 | 値 |
|---|---|
| 種別 | 再計画レビュー（初回 Plan Review NEEDS WORK 反映後） |
| 対象 Plan | [2026-06-14-1455-auth-gotrue-sync-force-change](../plans/2026-06-14-1455-auth-gotrue-sync-force-change.md) |
| 初回レビュー | [2026-06-15-0930-auth-gotrue-sync-force-change-review](2026-06-15-0930-auth-gotrue-sync-force-change-review.md) |
| 判定 | **NEEDS WORK** |

## 確認結果

初回レビューの BLOCKER 6 件そのものは、Plan の判断ログ・Step・検証項目に反映済み。

- force-change は API 層 enforcement 主体へ引き上げ、middleware も `/api` までカバーする方針になっている。
- claim フォールバックは毎回 admin getUser ではなく、`public.users.must_change_password` カラム方式へ差し替えられている。真実源を片方に固定する方針も明記済み。
- change-password は current password 必須になっている。
- 再ログイン後の session 差し替えは access+refresh 両方を `setSession` へ渡す方針になっている。reset 後の claim 伝播も検証対象に追加済み。
- change-password には IP レートリミットを入れる方針になっている。
- email 同期の DB unique violation は `mapDbError` 経由で 409 に落とす確認が Plan に追加済み。tx 境界も明記済み。

## 指摘

[BLOCKER] `/api` を middleware 対象に戻す副作用で、認証 API が壊れる可能性がある。

Plan は `/api` を matcher に含める方針だが、現行 middleware は access cookie が無い、または失効している場合に `/login` へ redirect する。現在 `/api` は matcher で除外されているため問題化していないが、Plan 通りに `/api` を含めると、未ログインで叩く `/api/v1/auth/login` と、refresh cookie だけで成立する `/api/v1/auth/refresh` が route に届かない。

該当コード:

- [middleware.ts](../../apps/web/middleware.ts): access cookie 不在時に `/login` redirect。
- [login/route.ts](../../apps/web/app/api/v1/auth/login/route.ts): 未ログイン状態で呼ぶ必要がある。
- [refresh/route.ts](../../apps/web/app/api/v1/auth/refresh/route.ts): access cookie なし/失効後でも refresh cookie で呼ぶ必要がある。

Plan には、middleware の `/api` 分岐をページ redirect と分けることを明記する必要がある。具体的には、`/api/v1/auth/login` と `/api/v1/auth/refresh` は force-change 判定以前に素通しし、非 auth API でも HTML redirect ではなく JSON 401/403 を返す方針にする。検証にも以下を追加する。

- 未ログインで `/api/v1/auth/login` が route へ届く。
- access cookie なし/失効、refresh cookie ありで `/api/v1/auth/refresh` が route へ届く。
- API リクエストでは `/login` redirect を返さない。

[NICE-TO-HAVE] `change-password` の current PW 確認に使う `claims.email` 欠落時の扱いを明記するとよい。

`AuthClaims.email` は型上 optional なので、実装時に `claims.email` 欠落時は 401/再ログイン扱いにする、または `sub` から現 email を解決する方針を Plan に一文足すと、異常系が詰まる。

## 補足

DB 側の unique violation については、既存 `mapDbError` が Postgres `23505` を 409 に変換しているため、Plan の A-2 は現行実装と噛み合っている。

verdict: NEEDS WORK
