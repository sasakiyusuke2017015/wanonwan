# 再計画レビュー: api-route-helpers

| 項目 | 値 |
|---|---|
| 種別 | 再計画レビュー（計画レビュー NEEDS WORK 反映後） |
| 対象 Plan | [2026-06-15-1610-api-route-helpers](../plans/2026-06-15-1610-api-route-helpers.md) |
| 前回レビュー | [2026-06-15-1625-api-route-helpers-review](2026-06-15-1625-api-route-helpers-review.md)（Codex, NEEDS WORK） |
| レビュアー | Codex トークン切れのため code-reviewer / security-reviewer / architect の読み取り専用 Agent を並列起動し統合（#25 ブランチの実コードを取得して検証） |

## 判定

| 軸 | 値 |
|---|---|
| 最終判定 | **NEEDS WORK** |
| Plan 判定 | NEEDS WORK |
| 実装判定 | N/A（コード未着手） |
| 記録整理 | FOLLOW-UP（#25 の PUT 先頭コメントが実コードと矛盾。下記 F-1） |

> architect=APPROVE / code-reviewer=NEEDS WORK / security-reviewer=NEEDS WORK。前回 BLOCKER（allowlist 細分化）は解消済みと全員確認。
> 今回は Agent が **#25 の実コード**を取得したため、Codex が見られなかった auth ルートの個別挙動に踏み込んだ。

## BLOCKER

### B-1. `auth/me` は `getCurrentClaims` を使わず 401 を 2 種類返す → `withSessionUser` に機械適用すると body drift
- 出どころ: code-reviewer（security も同種を指摘）
- [auth/me/route.ts](../../apps/web/app/api/v1/auth/me/route.ts) は `getAccessToken` + `verifyAccessToken` を直書きし、token 無=`unauthenticated` / verify 失敗=`invalid token` の **2 種 401** + `userId`/`name`/`isAdmin` のリッチ body を返す。`getCurrentClaims` ベースの `withSessionUser`（null 一律）に乗せると 2 メッセージが 1 つに潰れ、Plan の「status/body/message 1:1 不変」に抵触。
- 対応: **`me` はラッパ対象外（独自実装維持）**を §3/§4 に明記（allowlist 例外）。または `withSessionUser` を 2 メッセージ対応にするが、`change-password` と契約が食い違うので me 専用扱いになりやすい→対象外が安全。

### B-2. `change-password` の rate-limit→401→email欠落→parseBody の順がラッパ畳み込みで反転しうる
- 出どころ: code-reviewer（security も指摘）
- [auth/change-password/route.ts](../../apps/web/app/api/v1/auth/change-password/route.ts) は `rateLimit(429)` を `getCurrentClaims(401)` より**先**に評価し、さらに `claims.email` 欠落の独自 401 を持つ。`withSessionUser` が先に 401 を返すと 429/401 の優先順位が反転し、未認証リクエストのレート制限が効かなくなる。
- 対応: §3/§4 に「`change-password` は **rate-limit を最外**に維持 → `withSessionUser`(claims) → email 欠落 401 → parseBody の順」を明文化。ラッパは claims を渡すだけ・独自チェックは route 本体に残す。

## 訂正（security-reviewer の前提誤り）

### （非 BLOCKER）`PUT users/[id]` は #25 で admin ゲート済み・非 admin は 403
- security-reviewer は「PUT に admin ゲート無し・非 admin 404」を BLOCKER としたが、これは**先頭コメントの古い記述に基づく誤読**。#25 実コードの PUT は `app.is_admin()` を tx 内で評価し **403「権限がありません」** を返す（[users/[id]/route.ts](../../apps/web/app/api/v1/users/[id]/route.ts)）。admin 3 ルート（POST/PUT/reset）は**いずれも tx 内 `app.is_admin()` → 403 に統一**されている。
- ただし派生提言は有効: **admin 判定をラッパ層に持ち上げると `select app.is_admin()` のラウンドトリップが 1 本増える**（現行は他クエリと同一 tx に束ねている）。pure refactor では `withAdmin` を「valid access + forceChangeGuard」までにし、**admin 403 判定は各 route の tx 内に残す**のが挙動・性能ともに不変で安全。

### F-1. （記録整理）#25 の PUT 先頭コメントが実コードと矛盾
- [users/[id]/route.ts](../../apps/web/app/api/v1/users/[id]/route.ts) の `// 更新（RLS users_write = admin のみ。非 admin は対象 0 行 → 404 相当）` は、明示 admin ゲート（403）を足した今となっては**誤り**。#25（オープン中）で修正するのが望ましい。

## NICE-TO-HAVE

- **ルート分類表を Plan に今すぐ固定**: #25 で実ルートは確定済み（23 ファイル / 34 export）。分類の一次キーは**パス名でなく `/auth/` 配下か否か**。罠: `/api/v1/me/surveys` は名前に `me` を含むが **business（`withActiveUser`）**であって auth の `me` ではない。
- **移行漏れ検出を拡張**: `getCurrentClaims` 直呼び grep だけだと `me` のように `getAccessToken`/`verifyAccessToken` で認証する route を見逃す。一次検証=分類表との 1:1 照合、grep=補助。検出語に `getAccessToken`/`verifyAccessToken`/`getRefreshToken` も加える。
- **`withServiceRole` の粒度**: users POST は service_role を **2 回 mint**（create + orphan cleanup）。ハンドララッパでなく `await withServiceRole(token => ...)` の**インライン呼び出し型**にして複数回 mint と整合させる。Step 1 で粒度を確定。
- **`withOptionalUser`(logout) の責務明文化**: 「ラッパは optional claims を渡すだけ・`clearSession` と `{ok:true}` は本体」。token 有効時のみ best-effort `signOut`。clearSession 責務をラッパと本体で二重化しない。
- **pure-refactor の検証強化**: §5 が手動目視中心。drift しやすい代表ケース（me の 2 種 401 / change-password の 429→401 順 / admin 403 / force-change 403 / 重複 409 / 429）に**軽い integration test**を必須化。
- **「claims はラッパ経由限定」の構造的強制**: grep+目視は**新規 route には効かない**。残課題に「business/admin の `route.ts` で `getCurrentClaims`/`getAccessToken` 直 import を禁止する CI lint or module 境界」を 1 行（今回スコープ外でも明記）。
- **mapDbError 共存**: Step 3 で service_role を触る users POST 等は `mapDbError` の try/catch を**そのまま残す**と 1 行添える（#6 見送りと矛盾しないように）。
- **由来 Plan リンク**: 由来 Plan（force-change）は #25 ブランチにあり develop 未コミットのため develop 上ではリンク切れに見える。#25 マージ後に解消（記録整理）。

## 確認できた点

- 設計の骨子（関数合成・auth 6 分類・`withServiceRole` は mint まで・`withAdmin` 内包順・命名衝突回避・#25 後着手）は健全。前回 BLOCKER は解消。
- Next 16 の型透過（export 関数は `(req, ctx)` 固定、inner に `(req, claims, ctx)`、`params: Promise<…>` をジェネリクスで透過、引数ゼロ GET も `(req, ctx)` 統一可）は成立（全 export が 4 形に収まる）。
- service_role の露出面は悪化しない（60s 使い捨て・サーバ内のみ・mapping は呼び出し側）。
- force-change bypass は me/change-password/logout に閉じ、business/admin に広がらない。

## 対応 Plan へのリンク

[2026-06-15-1610-api-route-helpers](../plans/2026-06-15-1610-api-route-helpers.md)
