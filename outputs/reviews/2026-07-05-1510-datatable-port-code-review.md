# Review: DataTable 移植（テーマ3 PR-A）コードレビュー

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 15:10 JST |
| レビュアー | code-reviewer エージェント（Codex 手動起動の代行。ユーザー明示指示による） |
| 対象 Plan | [`plans/2026-07-05-0920-datatable-port.md`](../plans/2026-07-05-0920-datatable-port.md) |
| 計画レビュー | [`2026-07-05-0925-datatable-port-review.md`](2026-07-05-0925-datatable-port-review.md)（APPROVE） |
| 対象 | PR #68 / ブランチ `feature/datatable-port`（PR-A = catalog 移植のみ・apps/web 変更ゼロ） |
| レビュー種別 | コードレビュー |

## 判定

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER なし。既存利用箇所の破壊なし、apps/web 影響ゼロを確認 |
| Plan 判定 | N/A | 本 Review はコードレビュー |
| 実装判定 | **APPROVE** | 移植の忠実性・置換の非破壊性ともに問題なし。typecheck / 新規テスト全通過 |
| 記録整理 | OK | Plan とペアリング済み |

## 検証実施結果（レビュアーが実際に走らせた）

- `git diff origin/develop...feature/datatable-port --stat -- apps/web` → **0 件（apps/web 変更ゼロを確定）**
- `pnpm --filter @ui-catalog/core typecheck` → exit 0
- `pnpm --filter @wanonwan/web typecheck` → exit 0（新 catalog に対し既存 apps/web が型破壊なし）
- 新規ロジックテスト（columnVisibility / useDragAutoScroll / calculatePosition / isModifiedClick）→ 54 passed
- 移植コンポーネントテスト（DataTable / DropdownMenu / Pagination / Toggleable）→ 163 passed

## 重点確認への回答

### 1. IconButton 置換の互換性【最重要】

既存利用箇所を grep で全洗い出し（`.stories`/`.test` 除く）、1 つずつ確認:

| 利用箇所 | 渡している onClick | 判定 |
|---|---|---|
| `PWAInstallPrompt.tsx:81,98` | `handleDismiss`（`() => void`） | OK |
| `TabBar.tsx:111` | インライン `(e) => {...}` | OK |
| `DiffViewer.tsx:142` | `onClose`（`() => void`） | OK |
| `Modal.tsx:93` | インライン `() => {...}` | OK |

- **onClick 型変更**（`() => void` → `(e: MouseEvent<HTMLButtonElement \| HTMLAnchorElement>) => void`）: 既存呼び出しはすべて `() => void` かインライン。引数の少ない関数は常に代入可能なため型破壊なし（両 package の typecheck exit 0 が裏付け）。
- **variant 'primary' 追加・href/shimmer 追加**: すべて optional の additive。非破壊。
- **旧挙動の欠落**: 旧版 base の `text-[var(--color-text-muted)]` は新版で variant クラス側へ移動。default/danger/ghost で実効クラスは等価（disabled 時も明示保持）。回帰なし。

### 2. DropdownMenu 置換の互換性

既存利用（MenuItemList / AppLayout / HeaderUserMenu + 新 ColumnPicker）。新 `DropdownMenuProps` は旧 props を全保持し、新規はすべて optional。**prop 上位互換**。`@wanonwan/web` typecheck exit 0 で AppLayout/HeaderUserMenu の破壊なしを確定。

### 3. Select emptyLabel 追加

`emptyLabel?` + `{emptyLabel ?? placeholder}`。未指定時は旧挙動を完全維持。非破壊。

### 4. Icon 追加 5 種（plus/pencil/copy/ban/grip）

新旧アイコン名集合を sort 比較 → 追加 5 種のみ・削除ゼロ。描画方式は既存同様（`styles.stroke` + 0-24 座標系。grip のみ `fill="currentColor"` のドット群）。整合。

### 5. tokens.css の 7 トークン追加

7 トークン追加・既存値の差し替えゼロ・重複定義なし。完全 additive。

### 6. barrel / exports

`organisms/index.ts` は `Column` を意図的に barrel から除外（InteractiveTable の `Column` と衝突回避）し subpath 経由に。`package.json` に `./organisms/DataTable` subpath 追加。設計どおり。

### 7. 移植の忠実性 / spinOnClick 除去

`spinOnClick` は `packages/ui` 全体で参照ゼロ（完全除去）。ColumnPicker/Toolbar は `shimmer` + `customTrigger` に置換され機能欠落なし。import パス誤り・trailing 破壊は typecheck exit 0 と全テスト通過で否定。

## Findings

**[BLOCKER] なし。**

### 残課題（[NICE-TO-HAVE]・差し戻し対象外）

- **N-1（視覚変化・LOW）**: 新 `DropdownMenu` の既定アニメーションが `expandFromTrigger`（移植元 ai_edu と同一の既定値）。PR-A では apps/web 無変更だが、既存の AppLayout ヘッダメニュー / HeaderUserMenu の開閉アニメが視覚的に変わりうる。ランタイムバグではなくテストも通過。
  - **対応**: 移植の忠実性を優先しコードは変更しない。**PR-B のマージ後手動確認に「ヘッダメニュー / ユーザーメニューの開閉見た目に退行がないか」を追加**し、実機で問題があれば PR-B で既定アニメを明示指定する。
- **N-2（LOW）**: `tableCells.tsx` に `'use client'` 無し（移植元 ai_edu でも同じ状態＝移植ミスではない）。client 境界（`DataTableContent` 等）配下でのみ import されるため実害ゼロ。
  - **対応**: 移植の忠実性を保ちそのまま。将来 server component から直接 import する場合に付与する（残課題）。

## リンク

- 対象 Plan: [DataTable 移植（ai_edu 版）+ admin 一覧の乗り換え](../plans/2026-07-05-0920-datatable-port.md)

verdict: APPROVE
