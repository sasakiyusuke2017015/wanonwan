# コードレビュー: api-route-helpers (refactor)

| 項目 | 値 |
|---|---|
| 種別 | コードレビュー（pure refactor 実装） |
| 対象 Plan | [2026-06-15-1610-api-route-helpers](../plans/2026-06-15-1610-api-route-helpers.md) |
| 計画レビュー | [再々計画レビュー](2026-06-15-1655-api-route-helpers-replan-review-v2.md): APPROVE |
| レビュアー | Codex トークン切れのため code-reviewer / security-reviewer Agent を並列起動（`git diff develop..HEAD` を全件精査） |
| 対象ブランチ | `refactor/api-route-helpers`（5 コミット・27 ファイル・+249 −366） |

## 判定

| 軸 | 値 |
|---|---|
| 最終判定 | **APPROVE** |
| 実装判定 | APPROVE（pure refactor として全 route 挙動等価） |
| 記録整理 | FOLLOW-UP（Plan §5 の integration test 未追加・判断ログ追記） |

> code-reviewer=APPROVE / security-reviewer=APPROVE。BLOCKER 0。23 route の差分を 1:1 精査し、status/body/メッセージ/分岐順序がすべて移行前と等価と確認。

## 確認できた点

- **挙動不変**: change-password の 429（rate-limit 最外）→ 401 → email 欠落 401 → 400 順、login/change-password の固有 400 文言、admin 403、404/409/502 の出し分けがすべて維持。
- **ガード漏れ無し**: `getCurrentClaims`/`getAccessToken`/`verifyAccessToken`/`getRefreshToken`/`mintServiceRoleToken` の直呼びは business/admin に 0 件。残るのは allowlist（change-password/me/refresh/logout）のみ。`me/surveys`（business）も正しく `withActiveUser`。
- **admin 403 は tx 内維持**: users POST/PUT/reset とも `app.is_admin()` を `withUser` クロージャ内で評価、ラウンドトリップ追加なし。F-1（PUT コメント 404→403）対応済み。
- **service_role 露出**: `withServiceRole` は mint→fn のみ。token のログ混入・使い回し・client 露出なし（`server-only`）。
- **rate-limit 等価**: `checkRateLimit` の key `${prefix}:ip:${ip}`・limit・windowMs が移行前と一致。

## NICE-TO-HAVE / FOLLOW-UP

- `target.gotrueId!`（PUT / reset-password）: ラッパのクロージャ化で型ナローイングが失われ `!` が必要に。早期 return ガード直後でランタイム安全・挙動等価。気になれば `const gotrueId = target.gotrueId; if (!gotrueId) …` でローカル束ねに。**任意**。
- **Plan §5 の integration test（429→401→400 順 / me の 2 種 401 / admin 403 等）が未追加**。typecheck/build green + 静的精査で等価性は高確度確認済みだが、自動テストは別途。→ Plan 残課題へ。
- 未使用となった `withSessionUser`/`withAdmin`/`withOptionalUser` は作らず `withActiveUser` 1 種に集約（change-password/me/logout/admin は素朴なラッパ化を避け本体維持）。→ 判断ログに記録。
- 新規 route のガード書き忘れ防止（`no-restricted-imports`）は Plan §6 残課題のまま（本 PR スコープ外）。

## 対応 Plan へのリンク

[2026-06-15-1610-api-route-helpers](../plans/2026-06-15-1610-api-route-helpers.md)
