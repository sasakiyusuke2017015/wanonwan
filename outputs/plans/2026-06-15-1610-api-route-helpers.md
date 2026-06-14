# Plan: API ルートの boilerplate を関数合成で集約（認証/admin ラッパ + parseBody + service_role + rate-limit）

| 項目 | 値 |
|---|---|
| ステータス | 🔵 計画レビュー待ち（**着手は PR #25 マージ後**＝同一ファイル衝突回避） |
| slug | `api-route-helpers` |
| 作成 | 2026-06-15 16:10 JST |
| 担当 | Claude Code + 笹木さん |
| ブランチ | `refactor/api-route-helpers`（未作成） |
| 関連 PR / レビュー | TBD |
| 依存 | [PR #25](https://github.com/sasakiyusuke2017015/waoon/pull/25)（force-change）マージ後。#25 と同じ 20+ ルートを再度触るため |
| 由来 | force-change PR で導入した per-route `forceChangeGuard` 直書き（20 ルート）を見て「高階ラッパで集約し、他の反復 boilerplate にも展開すべき」となった。[auth-gotrue-sync-force-change Plan §9 残課題](2026-06-14-1455-auth-gotrue-sync-force-change.md) |

> **継承ではなく関数合成（higher-order function）**で行う。Next.js App Router の route handler は
> export された関数で、claims を「ラッパ経由でしか得られない」形にすることで**ガードを構造的に
> 忘れられなくする**のが本質的な狙い（セキュリティ）。

---

## 1. 目的 / 非目的

### 目的

API ルートに散在する反復 boilerplate を関数合成で集約し、(a) 認可ガードの**書き忘れ＝認可漏れ**を構造的に防ぎ、(b) ノイズを減らして可読性を上げる。**挙動は不変**（pure refactor）。

### 非目的

| 項目 | 理由 |
|---|---|
| レスポンス（status / body）の変更 | pure refactor。before/after で同一であることを担保する |
| 新エンドポイント追加・業務ロジック変更 | スコープ外 |
| #6 `mapDbError` の try/catch 撤去 | `withUser` 側でエラーを握る改修が侵襲的（DB 層の責務拡大）。既に `mapDbError` で集約済みのため今回は見送り |
| RLS / DDL / GoTrue 設定の変更 | 認可ロジックは変えない |

---

## 2. スコープ（実測ベース・2026-06-15 時点）

`apps/web/app/api` 実測。#25 マージ後はそれ込みの数になる。

| # | パターン | 箇所 | 対応 |
|---|---|---|---|
| 1 | 認証 prelude（`getCurrentClaims` + 401 + `forceChangeGuard`） | 31 / 21 ファイル | `withActiveUser(handler)` / allowlist 用 `withUser(handler)` |
| 2 | admin ゲート（`select app.is_admin()` + 403） | 3（users POST/PUT/reset） | `withAdmin(handler)` または `requireAdmin(tx)` ヘルパ |
| 3 | service_role 呼び出し（`mintServiceRoleToken()` + `gotrue.admin.X` + try/catch） | 6 / 4 ファイル | `withServiceRole(fn)` か自動 mint する admin クライアント |
| 4 | 入力 parse（`try { v.parse } catch { 400 }`） | 15 / 15 ファイル | `parseBody(req, Schema)` → data か 400 Response |
| 5 | rate-limit prelude（`getClientIp` + `rateLimit` + `tooManyRequests`） | 3（login/refresh/change-pw） | auth 系ラッパに畳む or `checkRateLimit(req, key, limit)` |

> #6（`catch (e) { return mapDbError(e) }` 33 箇所）は**今回見送り**（非目的）。

### 触る（予定）

- 新規 `apps/web/lib/auth/route.ts`（`withActiveUser` / `withUser` / `withAdmin`）。
- 新規 or 既存拡張 `apps/web/lib/auth/service-role.ts`（`withServiceRole` / admin client ラッパ）。
- 新規 `apps/web/lib/api/request.ts`（`parseBody`）。
- `apps/web/app/api/v1/**/route.ts`（全ルート移行）。`auth/login` `auth/refresh` `auth/logout` `auth/me` は allowlist（force-change ガード無し）として `withUser` または現状維持。

---

## 3. 設計方針

- **claims はラッパ経由でしか得られない**: `withActiveUser(async (req, claims, ctx) => …)`。ハンドラ本体が `getCurrentClaims` を直接呼ばない形にし、ガード適用を強制する。
- **allowlist は別ラッパ**: force-change 中でも叩ける `auth/*`（me/logout/change-password）は 401 のみの `withUser`。これにより「業務ルート＝`withActiveUser` / admin 必須＝`withAdmin`」と型で意図が見える。
- **挙動不変**: 既存の status / body / メッセージを 1:1 で維持（特に 401/403/400/409/429 の出し分け）。
- **Next 16 の型**: handler 第3引数で `{ params: Promise<…> }` を透過させる（ジェネリクスで params 有無を吸収）。
- **service_role**: `mintServiceRoleToken` の使い捨て・サーバ内のみは踏襲。client へ渡す経路は増やさない。

---

## 4. 実装ステップ（順序付き）

> 各ステップ後に `pnpm typecheck` を回し、**移行のたびにレスポンス不変**を確認する。

### Step 0 — 前提
- PR #25 がマージ済みであること。`develop` を pull して `refactor/api-route-helpers` を切る。

### Step 1 — ヘルパ/ラッパの実装（ルートは未変更）
1. `lib/api/request.ts`: `parseBody(req, Schema)`（成功で data、失敗で 400 Response）。
2. `lib/auth/service-role.ts`: `withServiceRole(fn)`（mint → fn(client/token) → 統一エラー処理）。
3. `lib/auth/route.ts`: `withUser` / `withActiveUser` / `withAdmin`（型と 401/403 の出し分け）。
- 【検証】単体で typecheck green。

### Step 2 — parseBody 移行（#4）
- 15 箇所の `v.parse` + 400 を `parseBody` に置換。メッセージ文言は現状維持。

### Step 3 — service_role 集約（#3）
- create / PUT / reset / change-password の `mintServiceRoleToken` + `gotrue.admin.X` を `withServiceRole` 経由へ。

### Step 4 — 認証/admin ラッパ移行（#1 #2）
- 業務ルート（21 ファイル）を `withActiveUser` / `withAdmin` へ。allowlist を `withUser` へ。
- **全 route export を grep し移行漏れゼロを確認**（未移行＝ガード欠落）。

### Step 5 — rate-limit 畳み込み（#5）
- login/refresh/change-password の prelude を auth 系ラッパ or `checkRateLimit` に集約。

---

## 5. 検証（受け入れ基準）

- `pnpm typecheck` green / `next build` green。
- **挙動不変**: 主要ルートで before/after の status・body・エラーメッセージが一致（手動 or 軽い integration test）。特に:
  - 未認証 401 / force-change 持ちの業務 API 403 / allowlist 通過。
  - admin 必須ルートの非 admin 403。
  - 入力不正 400 / 重複 409 / レートリミット 429。
- 全 `route.ts` の export が新ラッパ経由（grep で `getCurrentClaims` の直接呼び出しが業務ルートに残っていない）。

---

## 6. リスクと緩和

| リスク | 影響 | 緩和 |
|---|---|---|
| ルート移行漏れ | ガード欠落＝認可漏れ | Step 4 で全 export を grep 確認。CI typecheck + 目視 |
| 挙動 drift（status/メッセージ変化） | 既存クライアント/テスト破壊 | §5 の before/after 突合。文言は現状維持を原則 |
| Next の handler 型（params Promise）とジェネリクス | 型エラー・実行時不整合 | Step 1 で型を固め、params 有無の両ルートで検証 |
| #25 未マージで着手しコンフリクト | 手戻り | Step 0 で #25 マージを前提条件に明記 |
| 過度な抽象化 | 可読性低下 | #6 は見送り。価値の高い 5 パターンに限定 |

---

## 7. 判断ログ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-06-15 | force-change PR の per-route ガードを高階ラッパへ集約する別 PR を起こす | 20 ルート直書きは新規ルートで書き忘れ＝認可漏れリスク。claims をラッパ経由限定にして構造的に防ぐ |
| 2026-06-15 | 対象を #1+#2 / #3 / #4 / #5 に確定、#6（mapDbError try/catch）は見送り | 実測（§2）で費用対効果を評価。#6 は既に helper 集約済みで撤去は侵襲的 |
| 2026-06-15 | 着手は PR #25 マージ後 | #25 と同一ファイル（20+ ルート）を触るためコンフリクト回避 |

---

## 8. ステータス

- [x] Plan ドラフト完成（本ファイル）
- [ ] **計画レビュー（Codex）**（#25 マージ前でも可）
- [ ] PR #25 マージ確認 → 着手
- [ ] Step 1〜5 実装（refactor/api-route-helpers）
- [ ] 検証: typecheck / build green + 挙動不変の突合
- [ ] コードレビュー（Codex）
- [ ] PR 作成（develop 向け）→ 笹木さんマージ承認
