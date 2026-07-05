# Plan: 仕上げ（テーマ5・ページタイトル / 公開一覧 UX / ダークモード / VRT）

> ステータス: 🔵 計画レビュー待ち（ドラフト・要ユーザー判断あり）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 20:15 JST |
| 担当 | Claude Code + 笹木さん |
| ブランチ | Phase 別（下記）・TBD |
| 関連 PR | TBD |
| レビュー | TBD |
| 前提 | テーマ1〜4 マージ済み。テーマ3 で「アプリのテーマは `useTheme()` の runtime prop 方式・catalog は CSS 変数駆動」の食い違いが判明済み（ダークモード設計に直結） |

## 目的

UI/UX 改善テーマ5「仕上げ」。ロードマップの 4 項目を扱う。調査（2026-07-05・Explore 3 並列）で、サイズが**小さな polish 2 本**と**大きな epic 2 本**に分かれることが判明したため、フェーズに分割して直列で回す。

1. **ページタイトル**（polish）— 全ページのタブが `"waoon"` 固定。
2. **公開一覧 UX**（polish）— `/surveys` の空状態・ローディング・エラー・締切訴求・回答状態粒度。
3. **ダークモード**（epic）— 実質未対応。トークン層・状態軸・切替 UI・ハードコード色の CSS 変数化が必要。
4. **VRT**（epic）— Storybook 資産はあるが VRT 未配線。reg-suit + 撮影層 + ストレージ + CI が新規。

## 非目標（このテーマではやらない）

- テーマ system の**色生成ロジック（HSL 動的生成）そのものの作り直し**（ダークは既存生成に isDark 分岐 or CSS 変数上書きで対応）。
- **Chromatic の採用**（技術選定メモは SaaS 非採用・reg-suit 路線。残置の chromatic 依存/script は整理対象）。
- 新しい**色テーマ（emerald 等）の追加**や 2 テーマ（business/modern）構想（将来検討のまま）。
- 公開一覧の**検索/絞り込み/ページネーション**の作り込み（データ増加時の別 Plan。本テーマは空状態/ローディング/締切/回答状態の質改善に留める）。

## 現状コンテキスト（調査で確定）

### ページタイトル
- `app/layout.tsx` の `metadata = { title: "waoon", ... }` のみ。`title.template`（`%s | waoon`）未設定・個別 `metadata`/`generateMetadata` は**ゼロ**。
- `page.tsx` 35 本中 **29 本が `"use client"`** で `metadata` を export 不能。`(admin)/layout.tsx` も `"use client"`（admin ガード）で metadata の受け皿が無い。
- → 全タブが `"waoon"` 固定。

### 公開一覧 `/surveys`（[app/surveys/page.tsx](../../apps/web/app/surveys/page.tsx)）
- 空状態=破線＋一文（CTA なし）/ ローディング=テキスト / エラー=`error.message` 直出し（リトライなし）。
- `SurveyCard` を `sm:grid-cols-2` 止まり。締切は淡色表示のみ（強調/締切順ソートなし。サーバは `p.id desc`）。
- 回答状態は `answerId` 有無の**二値**判定で、取得済みの `answerStatus`（下書き/提出）を未活用 → 下書きも「回答済み」表示・「続きから」導線なし。
- 詳細 `[publishId]/page.tsx` に締切/回答済みバッジの再掲なし。

### ダークモード
- テーマは `色(6)×形(3)×背景(9)` の 3 軸（[design.ts](../../packages/ui/core/constants/design.ts)）で**全て明色前提**。`dark` テーマ・colorScheme 軸は無い（[infra/theme/atoms.ts](../../packages/ui/infra/theme/atoms.ts)）。色は **JS で HSL 生成 → inline style 適用**（CSS 変数でもクラスでもない）。
- `packages/ui/core/styles/globals.css` に `@media (prefers-color-scheme: dark)` があるが**アプリは未 import ＝デッドコード**。`tokens.css` は `@theme static` の単一値のみ（dark 再定義なし）。
- **アプリ側ハードコード色 = 34 ファイル・約 114 箇所**（`text-slate-*`/`bg-white`/`text-gray-*`/`text-red-600`/`border-gray-*` 等）。テーマ atom 非参照のためダーク背景で破綻。
- 技術選定メモ: ダークは `.dark` 別軸で色テーマと直交させる構想（確度 60・未着手）。

### VRT
- Storybook 稼働（**141 stories**・react-vite・a11y/designs addon）。app 側 stories は 0。
- `chromatic` 依存 + `storybook:deploy` script は**残置**（CI 未配線・`.github/workflows/chromatic.yml` 不在）。技術選定メモは Chromatic 非採用・reg-suit 路線。
- reg-suit の設定ファイルは皆無。`test:storybook` は `--project storybook` を指すが project 未定義＝未配線。`packages/ui` に `test` script 無し（CI で ui test スキップ、テーマ1 の CI 修正参照 [[ci-ui-test-exclusion]]）。
- Playwright は未導入。attachments で MinIO は稼働中（[Plan](2026-06-18-1330-attachments-minio.md)）→ VRT ベースライン保管に流用余地。

## スコープ（フェーズ構成）

### Phase 1: ページタイトル（`feature/page-titles`・polish）

| 対象 | 変更 |
|---|---|
| `app/layout.tsx` | `metadata.title` を `{ default: "waoon", template: "%s ｜ waoon" }` に |
| セクション server `layout.tsx`（新設 or 既存の server 化） | admin / surveys 等の route group に静的 `metadata` を持つ server layout を置く。client ページに被せる |
| 動的ページ（`[publishId]`・admin 編集）| `generateMetadata`（server 化できる範囲）or client 用 `useDocumentTitle` フック 1 本で補完 |

### Phase 2: 公開一覧 UX（`feature/public-list-ux`・polish）

| 対象 | 変更 |
|---|---|
| `app/surveys/page.tsx` | 空状態を CTA/導線付きに / ローディングを `SurveyCard` スケルトンに / エラーに再試行（テーマ3 の onRetry 様式）/ `sm:grid-cols-2` → `lg` 多カラム |
| 締切・回答状態 | `answerStatus`（下書き/提出）を活かし「続きから回答」導線・締切強調（本日締切等）・締切順の並び。サーバ `me/surveys` の order を `end_at` 考慮に |
| `[publishId]/page.tsx` | 締切/回答済みバッジの再掲・ローディング/エラーの体裁統一 |

### Phase 3: ダークモード（epic・要個別設計・`feature/dark-mode-*`）

**着手時に §要ユーザー判断 の設計を確定してから。** 想定サブステップ:
- 3a. **トークンのセマンティック 2 系統化**: `tokens.css` に light/dark の `--color-surface`/`--color-text-*`/`--color-border-*`/`--color-bg-*` を定義し、`:root[data-theme-mode="dark"]`（または `.dark`）で上書き。
- 3b. **colorScheme 軸の追加**: `infra/theme` に `colorSchemeAtom`（light/dark/system）+ storage + `<html>` への `data-theme-mode` 付与 + `ThemeSettingsModal` トグル。
- 3c. **design.ts のダーク対応**: `generateColorConfig` に isDark 分岐（前景/背景の明度反転）または CSS 変数化。
- 3d. **ハードコード色の CSS 変数化**: 34 ファイル・114 箇所をセマンティックトークン/`dark:` バリアントへ（最大の作業量・複数 PR に分割）。

### Phase 4: VRT（epic・要個別設計・`feature/vrt-*`）

**着手時に §要ユーザー判断 の路線を確定してから。** reg-suit 路線（方針準拠）の想定:
- 4a. 撮影層（Playwright or `@storybook/test-runner` で storybook-static の各 story を撮影）。
- 4b. reg-suit 設定（`regconfig.json` + keygen/notify/publisher）。ベースライン保管（MinIO 流用 or GH Actions artifact）。
- 4c. CI workflow（storybook build → 撮影 → reg-suit compare → 差分レポート）。
- 4d. 残置 chromatic 依存/script/README 記述の整理（削除 or 明示的 deprecated）。

## 実装計画

Phase 1 → 2（polish・低〜中リスク）を先に回し、Phase 3（ダーク）→ 4（VRT）は各着手前に設計 Plan を詰める（本 Plan の判断ログに追記 or サブ Plan）。各 Phase は複数 PR に割れる。

## 検証

- Phase 1: 各ページのタブタイトルが差別化される（手動 + `generateMetadata` の型）。
- Phase 2: 空/ローディング/エラー/締切/回答状態の各表示（dev 手動）。
- Phase 3: 全画面をダークで目視（コントラスト・破綻なし）。light/dark/system 切替の永続。
- Phase 4: 意図的な差分でレポートが出る / baseline 承認フローが回る。
- 共通: `pnpm turbo run typecheck lint build test`。

## リスク

| リスク | 対応 |
|---|---|
| **ダークは「JS inline style テーマ → CSS 変数テーマ」の設計転換を含み大きい**（テーマ3 で判明した runtime prop vs CSS 変数の食い違いの本丸）| Phase 3 着手前に「inline style を残しつつ dark を CSS 変数で被せる」か「CSS 変数へ全面移行」かを設計判断（§要ユーザー判断）。段階移行を優先 |
| ハードコード色 114 箇所の一括置換は差分が巨大 | Phase 3d を画面群ごとに複数 PR へ分割。VRT（Phase 4）を先に入れられれば置換の安全網になる（順序の検討余地） |
| VRT は撮影/ストレージ/CI が丸ごと新規で重い | reg-suit 路線を確定し、MinIO 流用で新規インフラを最小化。まず一部 stories で PoC |
| `"use client"` ページに metadata を付けられない | server layout で被せる / `useDocumentTitle` フック。動的は generateMetadata を server 側に置ける形へ |
| 公開一覧のサーバ order 変更が既存挙動に影響 | `me/surveys` の order 変更は API テストで担保。締切順は UI 側ソートでも可 |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-07-05 | テーマ5 に polish（タイトル/公開一覧）+ epic（ダーク/VRT）を**全部含める**（笹木さん選択）。ただしフェーズ分割し epic は着手前に個別設計 | ロードマップの「仕上げ」を一体で追う。ただしダーク/VRT は各々単独 Plan 相当の規模のため、フェーズと要判断で分離 |
| 2026-07-05 | Chromatic は採用せず reg-suit 路線（残置依存は整理対象）| 技術選定メモの SaaS 非採用方針 [[ci-ui-test-exclusion]] と整合 |

## 要ユーザー判断（各 Phase 着手前に確定）

1. **Phase 順序**: polish 先行（1→2）で確定。ダーク（3）と VRT（4）の順序は？（VRT を先に入れるとダークの色置換の回帰安全網になる／ダークを先に入れると VRT の baseline がダーク込みになる）
2. **ダークの設計方式**（Phase 3 着手前）: (A) 既存 inline style を残し dark を CSS 変数で被せる段階移行 / (B) テーマを CSS 変数へ全面移行。
3. **VRT の路線・ストレージ**（Phase 4 着手前）: reg-suit + 撮影層（Playwright vs storybook test-runner）+ baseline 保管（MinIO 流用 vs GH artifact）。
4. **ページタイトルの実現手段**: server layout 群 vs client `useDocumentTitle` フック（混在可）。

## ステータス

- [ ] Plan 承認（計画レビュー）
- [ ] 要ユーザー判断（Phase 順序・ダーク方式・VRT 路線・タイトル手段）
- [ ] Phase 1（ページタイトル）実装・レビュー・merge
- [ ] Phase 2（公開一覧 UX）実装・レビュー・merge
- [ ] Phase 3（ダークモード）設計 → 実装（複数 PR）・レビュー・merge
- [ ] Phase 4（VRT）設計 → 実装・レビュー・merge
- [ ] マージ後検証
