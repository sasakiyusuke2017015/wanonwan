# 計画レビュー: api-route-helpers

| 項目 | 値 |
|---|---|
| 種別 | 計画レビュー（実装前 refactor Plan） |
| 対象 Plan | [2026-06-15-1610-api-route-helpers](../plans/2026-06-15-1610-api-route-helpers.md) |
| 由来 Plan | [2026-06-14-1455-auth-gotrue-sync-force-change](../plans/2026-06-14-1455-auth-gotrue-sync-force-change.md) |
| 判定 | **NEEDS WORK** |

## 指摘

[BLOCKER] auth allowlist の分類が粗く、`withUser` に寄せると現行 auth ルートの契約を壊す。

Plan は allowlist を `withUser` または現状維持としつつ、設計方針では `me/logout/change-password` を「401 のみの `withUser`」と書いている。しかし現行 auth ルートは同じ allowlist でも前提が違う。

- `auth/login`: 未ログインで叩くため user wrapper 不可。
- `auth/refresh`: access cookie が無い/失効した状態でも refresh cookie だけで成立するため user wrapper 不可。
- `auth/logout`: access token が無い/失効していても cookie を消して `{ ok: true }` を返す契約。`withUser` に乗せると 401 になり、clearSession できない可能性がある。
- `auth/me` / `auth/change-password`: valid access は必要だが force-change では allow するため、401-only wrapper が合う。

この Plan は pure refactor かつ「status/body/message 不変」を掲げているため、allowlist を 1 種類にまとめる設計は実装前に分ける必要がある。最低限、以下の分類を Plan に明記すること。

- `withActiveUser`: 業務 API。valid access + force-change 403。
- `withAdmin`: admin 業務 API。`withActiveUser` を内包してから admin gate。
- `withAuthUser` / `withSessionUser`: `auth/me` と `auth/change-password` 用。valid access のみ、force-change bypass。
- `login`: wrapper なし、または rate-limit + parseBody のみ。
- `refresh`: refresh-cookie 専用。access-user wrapper なし。
- `logout`: optional access。token が無くても clearSession して `{ ok: true }` を維持。

[NICE-TO-HAVE] `withUser` という名前は既存 DB helper `withUser` と衝突する。

既存 `apps/web/lib/db/client.ts` の `withUser` は RLS コンテキスト用 tx helper で、多くの route が既に使っている。新規 `lib/auth/route.ts` にも `withUser` を置くと、同一ファイルで auth wrapper と DB tx helper を alias し続けることになり、refactor の可読性目的とぶつかる。`withAuthUser` / `withSessionUser` など、役割が分かる名前にするとよい。

[NICE-TO-HAVE] `withAdmin` は `withActiveUser` を内包すると明記するとよい。

admin ルートも業務 API なので、force-change 中の admin が admin API を叩けてはいけない。Plan の意図は読み取れるが、`withAdmin = valid access + forceChangeGuard + requireAdmin` の順序を明文化すると、実装時に `withUser + requireAdmin` と誤って組む余地が減る。

[NICE-TO-HAVE] `withServiceRole` は endpoint-specific なエラー変換を奪わない設計にする。

service_role 呼び出しは create / email update / reset / change-password / cleanup / rollback で status・message・best-effort の扱いが違う。Plan の「統一エラー処理」は pure refactor と衝突しやすいので、`withServiceRole` は原則「短命 token を mint して fn に渡す」までに留め、409/502 や best-effort の response mapping は呼び出し側に残す、など責務を切ると安全。

[NICE-TO-HAVE] 移行漏れ検出は grep だけでなく allowlist 表と突合する形にするとよい。

`getCurrentClaims` 直呼びが残っていないことだけでは、「業務 API が誤って auth allowlist wrapper に乗った」ケースを検出しにくい。`route.ts` 全一覧を、public/refresh/logout/auth-user/business/admin に分類した表を Plan に足し、Step 4 の検証で全 export をその表と照合すると、目的である認可漏れ防止により近い。

## 確認できた点

- #1〜#5 を対象にし、#6 `mapDbError` try/catch 撤去を見送る取捨選択は妥当。DB 層責務の拡大を避ける判断は refactor のスコープとして自然。
- Next.js App Router の route handler に高階関数を適用する方向自体は現実的。export する関数は `(req, ctx)` のままにし、inner handler に `(req, claims, ctx)` を渡す設計なら、`params: Promise<...>` も型で透過できる。
- PR #25 マージ後に着手する順序は適切。同じ route 群を触るため、先にやるとコンフリクトとレビュー差分のノイズが大きい。

verdict: NEEDS WORK
