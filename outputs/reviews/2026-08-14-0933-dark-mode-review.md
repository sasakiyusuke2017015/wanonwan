# Review: ダークモード 3a〜3c（semantic トークン反転 + colorScheme 軸）— コードレビュー

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-08-14 09:33 JST |
| レビュアー | Claude Code |
| 対象 Plan | [`plans/2026-08-14-0025-dark-mode.md`](../plans/2026-08-14-0025-dark-mode.md) |
| ブランチ | `feature/dark-tokens`（未 commit 差分） |
| 関連 PR | 未作成 |
| レビュー種別 | 実装 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE | 初回 HIGH 2 件 / MEDIUM 1 件を修正済み。ブラウザ目視のみマージ後検証に残る |
| Plan 判定 | N/A | 計画妥当性は[計画レビュー](2026-08-14-0043-dark-mode-review.md)で確認済み |
| 実装判定 | APPROVE | 反転境界の設計どおり実装され、dark パレットの内部矛盾を解消した |
| 記録整理 | OK | Plan の判断ログ・ステータスへ反映済み |

> 初回判定は `BLOCKED`（dark パレットの HIGH 2 件）。修正後の再判定として `APPROVE`。

## 指摘事項

| 重大度 | ファイル:行 | 指摘 | 対応 |
|---|---|---|---|
| HIGH [BLOCKER] | `packages/ui/core/styles/tokens.css`（dark ブロック） | **DataTable の zebra が dark で消える**。`--color-bg-subtle` を `#1e293b` にしたが、DataTable の面色は `--color-surface`（[DataTable.module.scss:5](../../packages/ui/core/organisms/DataTable/DataTable.module.scss#L5)）で同じ `#1e293b`。zebra は `.tr:nth-child(even) > .td` の背景（同 :362）なので、面と同値では縞が完全に見えなくなる。light では surface `#fff` / bg-subtle `#f8fafc` で差が付いていた | dark の `--color-bg-subtle` を `#243244`（面より一段明るい）へ変更 |
| HIGH [BLOCKER] | `packages/ui/core/styles/tokens.css`（dark ブロック） | **テーブルの行区切りが dark で消える**。`--color-border-light` を `#1e293b` にしたが、これは `.td` の `border-bottom`（同 :480）で、面色 `--color-surface` と同値のため罫線が見えなくなる。light では `#f1f5f9` vs `#fff` で差が付いていた | dark の `--color-border-light` を `#293548` へ変更。light の border 階層（light → 通常 → primary の順に濃くなる）を dark でも保つ |
| MEDIUM [NICE-TO-HAVE] | `packages/ui/infra/theme/colorSchemeScript.ts` | **pre-paint script にテストが無い**。7 ケース（未設定 / system / 明示 light / 明示 dark × OS 設定、壊れた値）を手元で実行して確認したが、実行結果がリポジトリに残らず回帰を検出できない。FOUC 対策は目視で気付きにくい（一瞬のフラッシュ）ため、壊れても発見が遅れる | `colorSchemeScript.test.ts` を追加し、7 ケースを vitest で固定 |
| LOW [NICE-TO-HAVE] | `packages/ui/infra/theme/atoms.ts` | `systemColorSchemeAtom` の初期値を module 評価時の `matchMedia` で決めているが、`useApplyColorScheme` が mount 直後に `sync()` で同じ値を書き込むため実質冗長。SSR と client で初期値が食い違う入口にもなる | 初期値を `'light'` 固定にし、解決は購読側に一本化 |

## 実装レビュー

- **反転境界**: `[data-theme-mode="dark"]` で semantic トークンだけを上書きし、palette 系（`--color-gray-*` 等）とブランド色（`--color-primary` 系）に触れていない。Plan の三層モデルどおりで、System A（`design.ts` の inline 生成）とは干渉しない。
- **Server / Client 境界**: pre-paint script を React 非依存モジュールへ分離した判断は妥当。`layout.tsx` は Server Component なので、hooks を含むモジュールを import するとビルドが落ちる（実際に落ちて分離した）。専用の export path を切ったのも、バレル経由で hooks を引き込まないための措置として正しい。
- **FOUC 対策**: `<head>` の同期 script で paint 前に属性を確定し、`suppressHydrationWarning` でサーバ HTML との差分警告を抑えている。script は try/catch で握り潰す設計で、失敗しても light にフォールバックするだけ（ページが描画されなくなる事故を避けている）。
- **OS 追従**: `matchMedia` の `change` を購読し、`system` 選択時に追従する。購読を常時張っておく判断（選択を system に戻した瞬間に最新値が要る）も妥当。
- **リセット**: `resetThemeAtom` に `colorSchemeAtom` を追加済みで、「既定に戻す」が明暗も戻す。
- **UI**: `ThemeSettingsModal` を 3 軸 → 4 軸に拡張。既存 `PillSelect` を流用しており独自部品を作っていない（CLAUDE.md の「新規 UI 部品は原則 ui-catalog に吸収」に反しない）。
- **light 不変性**: `--color-bg-primary` `#fff` / `--color-surface` `#fff` / `--color-border` `#e2e8f0` はビルド出力で従来値のまま。ただし `body` の文字色は `#000000` → `#111827` に変わる（笹木さん承認済み・判断ログ記載済み）。

## 運用 / インフラ影響

- **DB / migration / compose / env の変更なし**。
- **localStorage キーが 1 つ増える**（`uiColorScheme`）。既存キーは不変で、未設定時は `system` にフォールバックするため既存ユーザーへの影響はない。
- **Storybook の見た目が変わる**: `prefers-color-scheme` ブロックを削除したため、OS がダークの閲覧者でも常に light になる。VRT の撮影が決定的になる副次的な利点がある（[VRT Plan](../plans/2026-08-14-0020-vrt.md) の flaky 対策と整合）。
- `packages/ui/package.json` の `exports` に 1 エントリ追加（`./infra/theme/colorSchemeScript`）。

## 検証

- [x] `pnpm -r typecheck` green
- [x] `pnpm lint` green
- [x] catalog vitest 1490 passed / 2 skipped
- [x] web / worker vitest green
- [x] `pnpm --filter @waoon/web build` green
- [x] ビルド出力に dark 上書き 16 トークンが出る（`[data-theme-mode=dark]{…}`）
- [x] light 値が従来どおり（`--color-bg-primary:#fff` / `--color-surface:#fff` / `--color-border:#e2e8f0`）
- [x] **配信 HTML から pre-paint script を抽出して 7 ケース実行 → 7/7**（修正後は vitest で固定）
- [ ] **ブラウザでの目視**（この環境にヘッドレスブラウザが無く未実施。マージ後検証へ）
  - [ ] dark で全画面が破綻なく見える
  - [ ] リロード時に明色フラッシュが出ない（低速 CPU）
  - [ ] DataTable の zebra と行区切りが dark で見える（本レビューの HIGH 2 件の実地確認）
  - [ ] `design.ts` の inline 由来の色が 3d まで据え置きであることの切り分け

## フォローアップ

- [ ] `bg-background` / `text-foreground` / `text-muted-foreground` を使う 6 箇所は Tailwind v4 で無効（`--color-background` 等が tokens.css に存在しない）。ダークで反転しない箇所として 3e で拾う。
- [ ] `--color-error-bg`（`#fee2e2`）など 4 系統外の semantic トークンは dark 上書きの対象外。ダーク面の上で明るいままになるため、3e または追加 PR で扱う。
