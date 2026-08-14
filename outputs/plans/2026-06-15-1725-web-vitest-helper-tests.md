# Plan: apps/web に Vitest 導入 + API ヘルパの unit テスト

| 項目 | 値 |
|---|---|
| 概要 | api-route-helpers 残課題。apps/web に Vitest を導入し parseBody / withActiveUser / checkRateLimit / withServiceRole / metadata の unit テスト（5 files / 13 tests）。test-only |
| ステータス | ✅ 検証完了 |

## 1. 目的 / 非目的

### 目的

apps/web に **Vitest を導入**し、refactor で追加した API ヘルパ（`parseBody` / `withActiveUser` / `checkRateLimit` / `withServiceRole` / `metadata`）の **unit テスト**を書く。401/403/400/429・force-change フラグ読取などの「挙動」を回帰可能にし、今後のリファクタでの drift を機械的に検出する。

### 非目的

| 項目 | 理由 |
|---|---|
| ルート全体の integration テスト（実 DB/GoTrue） | 重い（Docker 要）。本 Plan は軽い unit に絞る。別タスク |
| ESLint / `no-restricted-imports` | 別の後続タスク（lint 基盤が未構築） |
| Playwright E2E | テストピラミッドの別レイヤ |
| カバレッジ閾値の strict 化 | まず回帰の土台を作る。閾値は後 |
| CI への必須化（gate） | まず緑にする。CI 配線は §5 で「任意」 |

## 2. スコープ

### 触る（新規）
- `apps/web/vitest.config.ts` — node 環境 + alias `@ → apps/web ルート` + `server-only` シム。
- `apps/web/lib/api/request.test.ts`
- `apps/web/lib/auth/route.test.ts`
- `apps/web/lib/auth/rate-limit.test.ts`
- `apps/web/lib/auth/service-role.test.ts`
- `apps/web/lib/auth/metadata.test.ts`
- `apps/web/test/server-only-shim.ts`（`server-only` を no-op にする空モジュール。Vitest alias で差し替え）

### 触る（既存）
- `apps/web/package.json` — `devDependencies` に `vitest`、`scripts.test` に `vitest run`（watch は `test:watch`）。
- ルート `package.json`（任意）— `test` 集約に web を含める（§5 で判断）。

### 触らない
- 業務ロジック・ルート実装・production 挙動（テスト追加のみ）。

## 3. セットアップ設計（ハマりどころ）

- **`server-only` import**: `lib/auth/*` は `import "server-only"` を持ち、node 実行で throw する。Vitest の `resolve.alias` で `server-only` → 空モジュール（`apps/web/test/server-only-shim.ts`）に差し替える。
- **`@/` alias**: `resolve.alias` で `@` → `path.resolve(__dirname)`（apps/web ルート）。
- **`next/server`**: `NextResponse` は web 標準ベースで node 環境の Vitest で動く。`.status` と `await res.json()` で検証。
- **依存のモック**:
  - `withActiveUser`（route.ts）は `current-user` から `getCurrentClaims` と `forceChangeGuard` を import。`vi.mock("@/lib/auth/current-user")` で **`getCurrentClaims` だけモック**、`forceChangeGuard` は `importActual` の実物を使う（実ロジックで 403 を検証）。
  - `withServiceRole` は `provisioning.mintServiceRoleToken` を `vi.mock` で固定トークンに。
- **rate-limit の時間依存**: `rateLimit` は `Date.now()` + プロセス内 `buckets` Map を使う。テスト間の bucket 汚染を避けるため **各テストで一意の IP（`x-forwarded-for`）/keyPrefix** を使う。ウィンドウ跨ぎは扱わない（同一ウィンドウ内で count→429 を確認）。
- **environment**: `node`（DOM 不要）。

## 4. テストケース（挙動の核）

- **metadata** (`metadata.test.ts`): `mustChangeAppMetadata(true/false)` が `{must_change_password: bool}`。`readMustChangePassword` が `=== true` のみ真（`"true"`/欠落/null/非 object は false）。
- **parseBody** (`request.test.ts`): 妥当 body → 検証済みデータ。不正 body → 400 + 既定文言「入力が不正です」。第3引数で文言差し替え。JSON 不正（`await req.json()` throw）→ 400。
- **withActiveUser** (`route.test.ts`): `getCurrentClaims=null` → 401 `unauthenticated`・handler 未呼出。`mustChangePassword=true` の claims → 403 `must_change_password`・handler 未呼出。通常 claims → handler が `(req, claims, ctx)` で呼ばれ戻り値を返す。
- **checkRateLimit** (`rate-limit.test.ts`): 上限内は `null`。上限超過で `429` + `Retry-After` ヘッダ。key は `${prefix}:ip:${ip}`（IP は XFF 先頭）。
- **withServiceRole** (`service-role.test.ts`): `mintServiceRoleToken` が呼ばれ、fn が mint されたトークンで呼ばれ、fn の戻り値を返す。

## 5. 実装ステップ

1. `vitest` を apps/web の devDep に追加（`pnpm --filter @wanonwan/web add -D vitest`）。バージョンは packages/ui と揃える（^4）。
2. `apps/web/vitest.config.ts` + `test/server-only-shim.ts` を作成（§3）。`package.json` に `"test": "vitest run"` / `"test:watch": "vitest"`。
3. 5 つの `*.test.ts` を作成（§4）。
4. `pnpm --filter @wanonwan/web test` green を確認。`pnpm --filter @wanonwan/web exec tsc --noEmit` が引き続き green（テストファイル込み）。
5. （任意）ルート `package.json` の集約 `test` に web を含める / CI（`.github/workflows`）に `pnpm --filter @wanonwan/web test` を追加するかは笹木さん判断（本 PR では緑化までに留め、CI 配線は別途でも可）。

## 6. 検証（受け入れ基準）

- `pnpm --filter @wanonwan/web test` が全 green（5 ファイル）。
- `tsc --noEmit` green（テスト込みで型エラー無し）。
- テストが **挙動の核（401/403/400/429・フラグ読取・委譲）** を実際に assert している。
- production コードに変更が無い（テスト/設定のみ）。

## 7. リスクと緩和

| リスク | 影響 | 緩和 |
|---|---|---|
| `server-only` が node で throw | テスト実行不可 | alias で空モジュールに差し替え（§3）。検証で実証 |
| `@/` alias 解決不可 | import エラー | vitest `resolve.alias` 設定。1 テストで早期確認 |
| rate-limit の bucket 汚染でフレーク | テスト不安定 | テストごとに一意 IP/prefix。`Date.now` 跨ぎは扱わない |
| `current-user` 全体モックで `forceChangeGuard` まで潰れる | 403 検証が無意味化 | `importActual` で `forceChangeGuard` 実物を使い `getCurrentClaims` のみモック |
| vitest バージョン不整合（pnpm workspace） | 型/実行差異 | packages/ui と同じ ^4 に揃える |

## 8. 判断ログ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-06-15 | unit テスト（ヘルパ）に限定、ルート integration は別タスク | 実 DB/GoTrue が要る integration は重い。まず軽い回帰土台を作る |
| 2026-06-15 | `server-only` は alias で空モジュール化 | lib/auth/* を node の Vitest で import 可能にする定石 |

## 9. ステータス

- [x] Plan ドラフト完成（本ファイル）
- [x] 計画レビュー → **省略**（test-only・低リスク、笹木さん合意）
- [x] 実装（test/web-vitest-helper-tests）: Vitest 導入 + 5 テスト（13 ケース）
- [x] 検証: `pnpm --filter @wanonwan/web test` green（5 files / 13 tests）/ `tsc --noEmit` green
- [x] コードレビュー → **省略**（test-only。出来上がったテストを笹木さんが PR で確認）
- [x] PR 作成（develop 向け）→ **[PR #27](https://github.com/sasakiyusuke2017015/wanonwan/pull/27) merged**
- [x] 検証完了: test green（CI/ローカル）が回帰の検証。runtime ゲートなし（test-only）
