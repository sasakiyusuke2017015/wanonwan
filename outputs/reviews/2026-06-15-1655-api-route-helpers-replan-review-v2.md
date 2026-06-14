# 再々計画レビュー: api-route-helpers

| 項目 | 値 |
|---|---|
| 種別 | 再々計画レビュー（再計画レビュー2 NEEDS WORK 反映後・実装前） |
| 対象 Plan | [2026-06-15-1610-api-route-helpers](../plans/2026-06-15-1610-api-route-helpers.md) |
| 前回レビュー | [2026-06-15-1640-api-route-helpers-replan-review](2026-06-15-1640-api-route-helpers-replan-review.md)（Agent 3 視点, NEEDS WORK） |
| レビュアー | code-reviewer / security-reviewer の読み取り専用 Agent を並列起動（前回 BLOCKER を出した 2 視点。#25 実コードと照合） |

## 判定

| 軸 | 値 |
|---|---|
| 最終判定 | **APPROVE** |
| Plan 判定 | APPROVE |
| 実装判定 | N/A（コード未着手） |
| 記録整理 | FOLLOW-UP（F-1: #25 の PUT 先頭コメントが実コード 403 と矛盾。Plan §8 で追跡中・本 Plan の瑕疵ではない） |

> code-reviewer=APPROVE / security-reviewer=APPROVE。前回 BLOCKER 2 件（B-1 me / B-2 change-password）と admin 派生は、pure refactor・status/body/message 1:1 不変を満たす形で Plan §3「auth ルート個別対応」/ §4 Step 4 / §5 に明記され、#25 実コードと齟齬なしと両者確認。BLOCKER 0。

## 解消確認

- **B-1 `auth/me`**: ラッパ対象外（独自実装維持）と明記。2 種 401（`unauthenticated`/`invalid token`）+ リッチ body が不変。
- **B-2 `auth/change-password`**: rate-limit 最外 → `withSessionUser`(claims) → email 欠落 401 → parseBody の順を明文化。ラッパは claims を渡すだけ・独自チェックは本体。429/401 反転は構造的に発生しない。
- **admin 3 ルート**: tx 内 `app.is_admin()` → 403 を維持（ラッパに持ち上げない＝ラウンドトリップ/tx snapshot の drift 回避）。PUT も #25 で 403 統一。
- **withServiceRole**: インライン型・複数回 mint（users POST = create + cleanup）対応・mapDbError 据え置きが実態と一致。
- **分類表/検出**: 一次キー=`/auth/` 配下、`me/surveys` は business、検出語を `getAccessToken`/`verifyAccessToken`/`getRefreshToken` に拡張。
- **service_role 露出**: 60s 使い捨て・サーバ内のみ・呼び出し直前 mint を維持。悪化なし。force-change bypass は me/change-password/logout に閉じる。

## NICE-TO-HAVE（Plan に反映済み）

- `parseBody(req, Schema, errorMessage?)` で **400 文言を引数化**（users / login / change-password で文言が違うため）。→ Step 1 / §5 に反映。
- `withOptionalUser`(logout) は **claims でなく raw access token を渡す**（`gotrue.signOut(token)` は raw token が要る・例外握って `{ ok: true }`）。→ Step 1 に反映。
- §5 に **admin precheck と dup チェックが同一 `withUser` クロージャ（同一 tx/snapshot）内に残る**ことを追加。→ §5 に反映。
- 新規 route ガードの CI lint を具体化: `no-restricted-imports` で `getCurrentClaims`/`getAccessToken`/`verifyAccessToken`/`getRefreshToken` **+ `mintServiceRoleToken`** の直 import を `app/api/**/route.ts` から禁止（allowlist override）。→ §6 残課題に反映。
- F-1（#25 PUT コメント）: #25 マージ前に修正推奨。→ §8 で追跡。

## 対応 Plan へのリンク

[2026-06-15-1610-api-route-helpers](../plans/2026-06-15-1610-api-route-helpers.md)
