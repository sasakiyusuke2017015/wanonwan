# API 堅牢化: ESLint 立ち上げ + 認証プリミティブ import ガード + 挙動不変 integration test

> 親 Plan: [api-route-helpers](2026-06-15-1610-api-route-helpers.md) の §残課題（2 項目）を消化する。

| 項目 | 値 |
|---|---|
| 概要 | api-route-helpers 残課題。認証プリミティブ（getCurrentClaims/getAccessToken/getRefreshToken/verifyAccessToken）の直 import を `no-restricted-imports` で禁止（認可漏れの構造的防止）+ 挙動不変 integration test。前提として apps/web に ESLint flat config を新設し root lint/CI に配線 |
| ステータス | 🟢 マージ済み（検証中） |
| PR | ESLint+import ガード: [#32](https://github.com/sasakiyusuke2017015/waoon/pull/32)（merged） / integration test: [#34](https://github.com/sasakiyusuke2017015/waoon/pull/34)（merged） |

---

## 1. 目的 / 非目的

### 目的

1. **認可漏れの構造的防止**: 業務 API route が認証プリミティブ（`getCurrentClaims` / `getAccessToken` / `getRefreshToken` / `verifyAccessToken`）を直 import するのを **`no-restricted-imports` で禁止**し、認可は必ず `withActiveUser` 経由に強制する。新規 route での書き忘れ＝認可漏れを lint で機械的に検出する。
2. **挙動の固定**: API ゲートの現行挙動（rate-limit `429` → 認証 `401` → バリデーション `400` の順、`/me` の 2 種 401、admin 以外 `403`）を **integration test** で固定し、将来のリファクタで drift しないようにする。

前提として、**apps/web に ESLint が未設定**（root `lint` は placeholder echo）なので、(1) の前に **ESLint flat config を立ち上げる**。

### 非目的

- 既存コードの大規模スタイル整形・全 lint ルール適用（最小構成で立ち上げ、ガード rule を主目的とする。広いルールセットは後続）。
- `packages/ui` の lint 復旧（別スコープ。今回は apps/web のみ）。
- `app/page.tsx`（SSR Server Component）への適用（API route ではない。今回スコープ外）。
- E2E / ブラウザ検証（Docker 起動が要る範囲は対象外）。

## 2. 現状コンテキスト（調査結果）

- ESLint: ルート/apps/web に config・依存なし。`package.json` の `lint` は `echo`。`packages/ui` に `eslint . --ext` script があるが config 不在で実質非稼働。
- Next 16.2.9 / React 19。`next lint` は Next 15+ で非推奨 → **ESLint CLI + flat config** が現行作法。
- 認証プリミティブ（ban 対象、すべて export 確認済み）:
  - `getCurrentClaims` ← [lib/auth/current-user.ts](../../apps/web/lib/auth/current-user.ts)
  - `getAccessToken` / `getRefreshToken` ← [lib/auth/session.ts](../../apps/web/lib/auth/session.ts)
  - `verifyAccessToken` ← [lib/auth/jwt.ts](../../apps/web/lib/auth/jwt.ts)
- service_role は安全ラッパ `withServiceRole` のみ export（raw mint 非公開）→ ban 不要。`withServiceRole` を admin route 限定にするかは §6 判断ログで扱う（今回は見送り候補）。
- これらを **直 import している API route は auth 配下のみ**（業務 route は #26 で `withActiveUser` 経由化済み）:
  - `auth/me`（verifyAccessToken, getAccessToken）/ `auth/logout`（getAccessToken）/ `auth/refresh`（getRefreshToken）/ `auth/change-password`（getCurrentClaims）
  - → これらは認証の実装本体で **正当**。allowlist 対象。**業務 route の違反は 0 件**（ガードは現状を固定するだけ）。
- Vitest は #27 で導入済み（apps/web: `test` = `vitest run`）。helper の unit test は存在するが、route レベルの挙動テストは無い。

## 3. 実装ステップ

### Phase 1 — ESLint 立ち上げ + import ガード（PR-A: `chore/eslint-import-guard`）

1. apps/web に依存追加（devDependencies）: `eslint` / `typescript-eslint` / `@eslint/js`。
2. `apps/web/eslint.config.mjs`（flat config）を新設:
   - base: `@eslint/js` recommended + `typescript-eslint` recommended（**型情報なし**＝高速・低ノイズで開始）。
   - 共通 `no-restricted-imports`（error）: 上記 4 シンボルを `@/lib/auth/*` パス指定 + 相対パス `patterns` の両方で禁止。
   - `files: ["app/api/**/route.ts"]` に限定して適用（または全体 ban + 下記 allowlist override）。
   - allowlist override（ban 解除）: `app/api/v1/auth/{me,logout,refresh,change-password}/route.ts`。
   - `ignores`: `.next`, `node_modules`, ビルド生成物, `**/*.test.ts`（テストは別途）。
3. `apps/web/package.json` に `"lint": "eslint ."` を追加。
4. ルート `package.json` の `lint` を `pnpm --filter @waoon/web lint` に置換（echo 廃止）。
5. 立ち上げで出た違反を解消（**ガード rule は error 固定**。それ以外で多発するルールは warn 降格 or 無効化して「CI green + ガード有効」を最優先）。
6. CI [.github/workflows/ci.yml](../../.github/workflows/ci.yml) に `pnpm lint` ステップを追加（typecheck の後）。
7. 検証: 業務 route にわざと `getCurrentClaims` 直 import を足すと lint error、allowlist の auth route では出ないことを確認 → 戻す。

### Phase 2 — 挙動不変 integration test（PR-B: `test/api-gate-integration`）

8. route handler を関数として呼び、依存（gotrue / session cookie / rate-limit store）をモックして挙動を検証:
   - **順序**: rate-limit 超過で `429`（認証前）→ 未認証で `401` → 認証済みだが body 不正で `400`。
   - **/me**: アクセストークン無しの 401 と、トークン不正の 401（2 種）を別ケースで。
   - **admin ゲート**: 非 admin の `403`。
9. `pnpm --filter @waoon/web test` で green。CI は既に test を回すか確認し、無ければ追加（#27 の範囲を確認）。

## 4. 検証

- `pnpm --filter @waoon/web lint` が green、かつガード rule が業務 route で発火する（手動で違反を入れて確認）。
- `pnpm -r typecheck` green。
- `pnpm --filter @waoon/web test` green（Phase 2 の新規テスト含む）。
- CI（PR）で lint / typecheck / build / test / pgTAP が通る。
- **Docker 不要**で全工程完結（実起動・受け入れ検証は範囲外）。

## 5. リスクと緩和

| リスク | 影響 | 緩和 |
|---|---|---|
| typescript-eslint recommended が既存コードを多数 flag | スコープ肥大（lint 修正地獄） | 型情報なし recommended で開始。ノイズ rule は warn/off に落とし、**ガード rule のみ error**。目的は「ガード稼働 + CI green」であって全クリーンではない |
| 相対パス・再 export 経由で ban を回避される | ガードの穴 | `paths`（`@/lib/auth/*`）+ `patterns`（`**/lib/auth/{current-user,session,jwt}`）の二重指定。再 export 元（`lib/auth/route.ts` 等）からの間接取得は許容（ラッパ経由＝正当） |
| allowlist が広すぎ/狭すぎ | 誤検出 or 漏れ | allowlist は **4 auth route ファイル名**に限定。business 化した `me/surveys` 等は対象外（業務扱い、§2 の分類に従う） |
| integration test の route handler モックが脆い | テストの保守コスト | handler を直接 import し、Request/cookie/gotrue を最小モック。E2E ではなく「ゲート分岐の単体的検証」に留める |
| Next 16 と eslint/flat config のバージョン整合 | 立ち上げ失敗 | eslint v9 系 + typescript-eslint v8 系の組合せで固定。`next` プラグインは入れない（churn 回避） |

## 6. 判断ログ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-06-17 | ESLint は **最小構成（型情報なし recommended + ガード rule）** で立ち上げる。`eslint-config-next` は入れない | 目的は認可ガードの機械化。広いルールセットは既存違反の大量修正を招きスコープが膨らむ。next プラグインは a11y/react rule で churn |
| 2026-06-17 | ban 対象は session/claims プリミティブ 4 シンボルに限定。`withServiceRole` は ban しない | raw service_role mint は非公開で `withServiceRole` が安全な公開面。admin route 限定化は過剰検出リスクがあり今回見送り（必要なら後続で allowlist 方式） |
| 2026-06-17 | スコープを `app/api/**/route.ts` に限定。`app/page.tsx` は対象外 | 親 Plan の意図は API route の認可漏れ防止。SSR ページのセッション読みは別概念で、今回は触らない |
| 2026-06-17 | PR を 2 本に分割（ガード / test） | 依存も性質も別（lint 立ち上げ vs テスト追加）。レビュー単位を小さく保つ |

## 7. ステータス

- [x] Plan ドラフト完成（本ファイル）
- [x] 計画レビュー / 笹木さん承認（2026-06-17 承認）
- [x] Phase 1 実装（ESLint flat config + `no-restricted-imports` ガード + root lint + CI lint ステップ）。`pnpm lint` / `pnpm -r typecheck` green、違反 0・ガード発火を確認
- [ ] Phase 1 コードレビュー
- [ ] Phase 2 実装（integration test）
- [ ] Phase 2 コードレビュー
- [ ] PR-A / PR-B マージ
- [ ] 親 Plan の §残課題チェックを消し込み
