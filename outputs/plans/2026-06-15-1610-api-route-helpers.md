# Plan: API ルートの boilerplate を関数合成で集約（認証/admin ラッパ + parseBody + service_role + rate-limit）

| 項目 | 値 |
|---|---|
| ステータス | 🟦 コードレビュー APPROVE（実装完了・PR 作成へ。#25 マージ後着手済み） |
| slug | `api-route-helpers` |
| 作成 | 2026-06-15 16:10 JST |
| 担当 | Claude Code + 笹木さん |
| ブランチ | `refactor/api-route-helpers` |
| 関連 PR / レビュー | 計画レビュー 3 本（NEEDS WORK→NEEDS WORK→APPROVE）/ [コードレビュー(Agent)](../reviews/2026-06-15-1710-api-route-helpers-code-review.md): **APPROVE** |
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
| 1 | 認証 prelude（`getCurrentClaims` + 401 + `forceChangeGuard`） | 31 / 21 ファイル | §3 のラッパ分類（`withActiveUser` / `withSessionUser`、login/refresh/logout は別扱い） |
| 2 | admin ゲート（`select app.is_admin()` + 403） | 3（users POST/PUT/reset） | `withAdmin`（= `withActiveUser` 内包 + `requireAdmin`） |
| 3 | service_role 呼び出し（`mintServiceRoleToken()` + `gotrue.admin.X` + try/catch） | 6 / 4 ファイル | `withServiceRole(fn)`（**mint して fn に渡すまで**。response mapping は呼び出し側） |
| 4 | 入力 parse（`try { v.parse } catch { 400 }`） | 15 / 15 ファイル | `parseBody(req, Schema)` → data か 400 Response |
| 5 | rate-limit prelude（`getClientIp` + `rateLimit` + `tooManyRequests`） | 3（login/refresh/change-pw） | auth 系ラッパに畳む or `checkRateLimit(req, key, limit)` |

> #6（`catch (e) { return mapDbError(e) }` 33 箇所）は**今回見送り**（非目的）。

### 触る（予定）

- 新規 `apps/web/lib/auth/route.ts`（`withActiveUser` / `withSessionUser` / `withAdmin` / `withOptionalUser`）。**既存 DB helper `withUser`（lib/db/client.ts の RLS tx）と名前衝突しないこと**。
- 新規 or 既存拡張 `apps/web/lib/auth/service-role.ts`（`withServiceRole`：短命 token を mint して fn に渡すだけ）。
- 新規 `apps/web/lib/api/request.ts`（`parseBody`）。
- `apps/web/app/api/v1/**/route.ts`（全ルート移行）。auth ルートは §3 の分類・個別対応に従う（`login`=ラッパ無し / `refresh`=refresh 専用 / `logout`=`withOptionalUser` / `change-password`=`withSessionUser`+本体維持 / **`me`=対象外**）。

---

## 3. 設計方針

### ラッパ分類（計画レビューで細分化）

auth ルートは「同じ allowlist でも前提が違う」ため **1 種類にまとめない**。挙動不変のため次の分類で実装する。名前は既存 DB helper `withUser`（`lib/db/client.ts` の RLS tx）と衝突しないものにする。

| ラッパ | 用途 | 認証要件 | force-change |
|---|---|---|---|
| `withActiveUser(fn)` | 業務 API（大多数） | valid access 必須（無ければ 401） | **403 で弾く** |
| `withAdmin(fn)` | admin 業務 API | **`withActiveUser` を内包** → さらに admin gate | 403（内包）→ 非 admin 403 |
| `withSessionUser(fn)` | `auth/change-password`（`me` は下記 B-1 で対象外） | valid access 必須（401） | **bypass（許可）** |
| `withOptionalUser(fn)` | `auth/logout` | access 無/失効でも **`clearSession` して `{ ok: true }`** | — |
| （ラッパ無し） | `auth/login` | 未ログインで叩く | — |
| （refresh 専用） | `auth/refresh` | **refresh cookie のみで成立**（access 不要） | — |

- **`withAdmin = valid access + forceChangeGuard + requireAdmin` の順を明文化**（`withSessionUser + requireAdmin` と誤組みしない）。force-change 中の admin が admin API を叩けないこと。
- **claims はラッパ経由でしか得られない**: business/admin ハンドラ本体は `getCurrentClaims` を直接呼ばない＝ガード適用を強制する（書き忘れ＝認可漏れを構造的に防ぐ）。
- **挙動不変**: status / body / メッセージを 1:1 維持（401/403/400/409/429・`{ ok: true }` の出し分け）。**login/refresh/logout の現行契約を壊さない**。
- **Next 16 の型**: export 関数は `(req, ctx)` のまま、inner handler に `(req, claims, ctx)` を渡す。`params: Promise<…>` はジェネリクスで透過。
- **service_role（#3）は「mint して fn に渡す」までに留める**: 409/502・best-effort・rollback の response mapping は endpoint ごとに違う（create / email update / reset / change-password / cleanup / rollback）ので**呼び出し側に残す**。統一エラー処理にはしない（pure refactor と衝突するため）。粒度は**ハンドララッパでなくインライン呼び出し型** `await withServiceRole(token => …)`（users POST は create + orphan cleanup で **2 回 mint** するため）。`mapDbError` の try/catch もそのまま残す（#6 見送りと整合）。

### auth ルート個別対応（再計画レビュー2で確定）

実コード（#25）の挙動を 1:1 で保つため、以下は素朴なラッパ適用をしない:

- **B-1 `auth/me` はラッパ対象外（独自実装維持）**: `me` は `getCurrentClaims` を使わず `getAccessToken`+`verifyAccessToken` 直書きで **2 種 401**（token 無=`unauthenticated` / verify 失敗=`invalid token`）+ リッチ body を返す。`withSessionUser`（null 一律）に乗せると body/メッセージが drift するので**現状維持**（allowlist 例外）。
- **B-2 `auth/change-password` は順序維持**: **rate-limit(429) を最外**に → `withSessionUser`(claims) → `claims.email` 欠落 401 → `parseBody` の順。ラッパは claims を渡すだけで、rate-limit・email 欠落 401・service_role は **route 本体に残す**（429/401 の優先順位を反転させない）。
- **admin 判定は各 route の tx 内に残す**: admin 3 ルート（users POST / PUT / reset-password）は現状 `app.is_admin()` を **tx 内で他クエリと同一ラウンドトリップ**で評価し **403** を返す（PUT も #25 で 403 に統一済み）。`withAdmin` を「valid access + forceChangeGuard」に留め、**admin 403 判定はラッパ層に持ち上げない**（持ち上げると `select app.is_admin()` が 1 本増えて挙動・性能が drift する）。`withAdmin` は実質「業務ラッパ + 後段の admin gate を route 本体の tx に委ねる」とし、§2 #2 の集約は「重複コメント/定型の整理」に留める。
- **`withOptionalUser`(logout) の責務**: ラッパは optional claims を渡すだけ。`clearSession` + `{ ok: true }` と best-effort `signOut`（token 有効時のみ）は **route 本体**が持つ（clearSession 責務をラッパと本体で二重化しない）。

---

## 4. 実装ステップ（順序付き）

> 各ステップ後に `pnpm typecheck` を回し、**移行のたびにレスポンス不変**を確認する。

### Step 0 — 前提
- PR #25 がマージ済みであること。`develop` を pull して `refactor/api-route-helpers` を切る。

### Step 1 — ヘルパ/ラッパの実装（ルートは未変更）
1. `lib/api/request.ts`: `parseBody(req, Schema, errorMessage?)`（成功で data、失敗で 400 Response）。**400 文言は route ごとに違う**（users=「入力が不正です」/ login=「メールアドレスとパスワードを入力してください」/ change-password=「現在のパスワードと…12文字以上…」）ため、**文言を引数化して現状維持**する。
2. `lib/auth/service-role.ts`: `withServiceRole(fn)`（**mint → fn(token) まで**。response mapping は呼び出し側。インライン型で複数回 mint 可）。
3. `lib/auth/route.ts`: §3 の `withActiveUser` / `withSessionUser` / `withAdmin` / `withOptionalUser`（型と 401/403/`{ok:true}` の出し分け）。**既存 `withUser`（db）と名前衝突させない**。`withOptionalUser`(logout) は **claims ではなく raw access token を渡す**（`gotrue.signOut(token)` は raw token が要る・token 有効時のみ best-effort・例外は握って `{ ok: true }`）。
- 【検証】単体で typecheck green。

### Step 2 — parseBody 移行（#4）
- 15 箇所の `v.parse` + 400 を `parseBody` に置換。メッセージ文言は現状維持。

### Step 3 — service_role 集約（#3）
- create / PUT / reset / change-password の `mintServiceRoleToken` + `gotrue.admin.X` を `withServiceRole` 経由へ。

### Step 4 — 認証/admin ラッパ移行（#1 #2）
1. **全 `route.ts` を分類表に起こす**（#25 で実ルート確定済み・23 ファイル/34 export）。分類の一次キーは**パス名でなく `/auth/` 配下か否か**:
   - `public`=`auth/login` / `refresh`=`auth/refresh` / `logout`=`auth/logout`（`withOptionalUser`） / `session`=`auth/change-password`（`withSessionUser`+本体維持） / **`bespoke`=`auth/me`（対象外）**。
   - `admin`=`users` POST・`users/[id]` PUT・`users/[id]/reset-password`（`withAdmin` + admin 403 は tx 内維持）。
   - `business`=上記以外すべて（`withActiveUser`）。**罠: `me/surveys` は名前に `me` を含むが business**（auth の `me` ではない）。
2. 表に従い移行。`me` は触らない。**F-1**: `users/[id]/route.ts` PUT の先頭コメント `…非 admin は対象 0 行 → 404 相当`（実コードは 403）をこの移行のついでに修正する。
- 【検証】全 export を**分類表と 1:1 照合**（一次検証）。grep は補助とし、検出語を `getCurrentClaims` だけでなく **`getAccessToken` / `verifyAccessToken` / `getRefreshToken`** にも広げる（`me` のように低レベル直呼びの認証を見逃さない）。business/admin にガード漏れが無いこと、business が誤って session/bespoke に乗っていないことを確認。

### Step 5 — rate-limit 畳み込み（#5）
- login/refresh/change-password の prelude を auth 系ラッパ or `checkRateLimit` に集約。

---

## 5. 検証（受け入れ基準）

- `pnpm typecheck` green / `next build` green。
- **挙動不変**: drift しやすい代表ケースは**軽い integration test を必須**（手動目視だけにしない）。特に:
  - **`me` の 2 種 401**（token 無=`unauthenticated` / verify 失敗=`invalid token`）+ リッチ body が不変。
  - **`change-password` の 429（rate-limit 最外）→ 401 → email 欠落 401 → 400** の順が不変。
  - 未認証 401 / force-change 持ちの業務 API 403 / allowlist（me/change-password/logout）通過。
  - admin 必須ルートの非 admin **403**（PUT も 403）。
  - 入力不正 **400 の文言が route ごとに不変**（users / login / change-password）。重複 409 / レートリミット 429。
  - `login`/`refresh`/`logout` の契約（未ログイン/失効でも所定動作・`{ ok: true }`）。
  - admin precheck（`app.is_admin()`）と dup チェックが **同一 `withUser` クロージャ（同一 tx/snapshot）内に残る**こと（tx 分割の drift を拾う）。
- 全 `route.ts` の export を Step 4 の**分類表と 1:1 照合**（business/admin に `getCurrentClaims` 直呼びが残らない＝ガード漏れ無し／business が誤って `withSessionUser` に乗っていない）。
- **auth ルートの契約維持**: `login`（未ログインで 200/401）・`refresh`（access 無でも refresh cookie で成立）・`logout`（token 無でも `clearSession` + `{ ok: true }`）・`me`/`change-password`（force-change でも到達）。

---

## 6. リスクと緩和

| リスク | 影響 | 緩和 |
|---|---|---|
| ルート移行漏れ | ガード欠落＝認可漏れ | Step 4 で全 export を grep 確認。CI typecheck + 目視 |
| 挙動 drift（status/メッセージ変化） | 既存クライアント/テスト破壊 | §5 の before/after 突合。文言は現状維持を原則 |
| Next の handler 型（params Promise）とジェネリクス | 型エラー・実行時不整合 | Step 1 で型を固め、params 有無の両ルートで検証 |
| #25 未マージで着手しコンフリクト | 手戻り | Step 0 で #25 マージを前提条件に明記 |
| 過度な抽象化 | 可読性低下 | #6 は見送り。価値の高い 5 パターンに限定 |
| **新規 route でのガード書き忘れ**（grep+目視は新規に効かない） | 認可漏れ | 一次は分類表照合だが構造的強制ではない。**残課題（別タスク）**: `app/api/**/route.ts` から `getCurrentClaims`/`getAccessToken`/`verifyAccessToken`/`getRefreshToken` **および `mintServiceRoleToken`** の直 import を `no-restricted-imports` で禁止（allowlist は eslint override で `auth/me` 等に限定）。service_role 直 import 禁止は「admin ゲート無しで GoTrue admin を叩く新規穴」も塞ぐ |
| auth ルートの個別挙動を素朴にラッパ化（me の 2 種 401・change-password の 429/401 順・admin 403/404） | 挙動 drift＝pure refactor 失敗 | §3 の auth ルート個別対応（me 対象外・change-password 順序維持・admin は tx 内）。§5 で integration test 必須化 |

---

## 7. 判断ログ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-06-15 | force-change PR の per-route ガードを高階ラッパへ集約する別 PR を起こす | 20 ルート直書きは新規ルートで書き忘れ＝認可漏れリスク。claims をラッパ経由限定にして構造的に防ぐ |
| 2026-06-15 | 対象を #1+#2 / #3 / #4 / #5 に確定、#6（mapDbError try/catch）は見送り | 実測（§2）で費用対効果を評価。#6 は既に helper 集約済みで撤去は侵襲的 |
| 2026-06-15 | 着手は PR #25 マージ後 | #25 と同一ファイル（20+ ルート）を触るためコンフリクト回避 |
| 2026-06-15 | 計画レビュー（Codex）**NEEDS WORK** を反映: **allowlist を 1 ラッパにまとめず細分化**（§3 の 6 分類）。`withActiveUser`/`withAdmin`/`withSessionUser`/`withOptionalUser` + login/refresh 個別。`withUser` 名は既存 DB helper と衝突するので不使用。`withServiceRole` は mint まで・response mapping は呼び出し側。Step 4 に**ルート分類表との照合**を追加 | Codex BLOCKER: login(未ログイン)/refresh(refresh cookie のみ)/logout(token 無でも clearSession+ok)/me・change-password(force-change bypass) は前提が別で、401-only ラッパに寄せると現行契約を壊す。NICE（命名衝突・admin 内包順・service_role 責務・分類表照合）も反映 |
| 2026-06-15 | 再計画レビュー2（Agent 3 視点・#25 実コード照合）**NEEDS WORK** を反映 | BLOCKER: **B-1 `me` はラッパ対象外**（2 種 401+リッチ body の drift）/ **B-2 `change-password` は rate-limit 最外の順序維持**。admin は **tx 内 403 判定をラッパに持ち上げない**（PUT も #25 で 403 統一・security の 404 前提は誤読を訂正）。NICE: 分類表の一次キーは `/auth/` 配下・`me/surveys` は business / 検出語を `getAccessToken` 等に拡張 / `withServiceRole` はインライン型 / `withOptionalUser` の clearSession 責務 / integration test 必須 / 新規 route 用 CI lint を残課題に。[再計画レビュー2](../reviews/2026-06-15-1640-api-route-helpers-replan-review.md) |
| 2026-06-15 | 実装時: **ラッパは `withActiveUser` 1 種に集約**（`withSessionUser`/`withAdmin`/`withOptionalUser` は作らない） | change-password は rate-limit を最外に保つ必要があり wrapper で auth を前置すると順序が反転（B-2）→ 本体維持。me は独自実装（B-1）。logout は `getAccessToken` ベースで元々 getCurrentClaims 不使用→据え置き。admin は 403 を tx 内に残すため withActiveUser で足りる。結果、追加ラッパは不要で `withActiveUser` のみが残った（コードレビュー Agent 2 視点 APPROVE で確認） |
| 2026-06-15 | コードレビュー（Agent: code+security）**APPROVE**。挙動不変・ガード漏れ無しを全 route で確認 | [コードレビュー](../reviews/2026-06-15-1710-api-route-helpers-code-review.md)。残: Plan §5 の integration test は後続（FOLLOW-UP）、新規 route 用 `no-restricted-imports` は §残課題 |

---

## 8. ステータス

- [x] Plan ドラフト完成（本ファイル）
- [x] **計画レビュー（Codex）** → [NEEDS WORK](../reviews/2026-06-15-1625-api-route-helpers-review.md)（allowlist 細分化）
- [x] 指摘反映（§3 ラッパ 6 分類・命名衝突回避・service_role 責務・分類表照合）
- [x] **再計画レビュー2（Agent 3 視点・#25 実コード）** → [NEEDS WORK](../reviews/2026-06-15-1640-api-route-helpers-replan-review.md)
- [x] 指摘反映（me 対象外 / change-password 順序 / admin は tx 内 / 分類表キー / 検出拡張 / serviceRole 粒度 / test 必須 / CI lint 残課題）
- [x] **再々計画レビュー（Agent: code+security）** → [APPROVE](../reviews/2026-06-15-1655-api-route-helpers-replan-review-v2.md)（残 NICE は Step 1/§5 に反映）
- [x] PR #25 マージ確認 → 着手
- [x] （F-1）`users/[id]/route.ts` PUT 先頭コメントを実コード(403)に合わせて修正（本 refactor で対応済み）
- [x] Step 1〜5 実装（refactor/api-route-helpers・5 コミット）
- [x] 検証: typecheck green / build green（挙動不変は静的精査で確認）
- [x] **コードレビュー（Agent: code+security）** → [APPROVE](../reviews/2026-06-15-1710-api-route-helpers-code-review.md)
- [ ] PR 作成（develop 向け）→ 笹木さんマージ承認
- [ ] （後続）挙動不変の軽い integration test（429→401→400 順 / me の 2 種 401 / admin 403 等）
- [ ] （後続）新規 route のガード強制: `no-restricted-imports` で認証プリミティブ直 import を禁止（allowlist override）
