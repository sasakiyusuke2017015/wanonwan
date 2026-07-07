# Plan: 仕上げ（テーマ5・ページタイトル / 公開一覧 UX / ダークモード / VRT）


| 項目 | 値 |
|---|---|
| 概要 | UI/UX 改善テーマ5「仕上げ」。**フェーズ分割**: Phase1 ページタイトル・Phase2 公開一覧 UX（polish・**マージ済み・検証中**）/ Phase3 ダークモード（epic・三層モデル: semantic トークン反転境界 + design.ts 前景調整 + 114 箇所 repoint・FOUC 対策要）/ Phase4 VRT（epic・reg-suit + storycap + MinIO baseline・4-light→3→4-dark の additive 順序）。epic 2 本は着手時に独立サブ Plan 化 |
| ステータス | 🟡 実装中 |
| PR | Phase1: [#76](https://github.com/sasakiyusuke2017015/waoon/pull/76) merged / Phase2: [#77](https://github.com/sasakiyusuke2017015/waoon/pull/77) merged |
| Review | [計画レビュー](../reviews/2026-07-05-2040-finishing-touches-review.md) / [Phase1 コードレビュー](../reviews/2026-07-05-2226-finishing-touches-code-review.md) / [Phase2 コードレビュー](../reviews/2026-07-05-2300-finishing-touches-phase2-code-review.md) |

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

### Phase 3: ダークモード（epic・**着手時に独立サブ Plan** `…-dark-mode.md` を新規作成・`feature/dark-mode-*`）

計画レビューで確定した**三層モデル**（反転境界は semantic トークン層 B）:
- 3a. **反転境界 = System B（semantic トークン）**: `tokens.css` の `--color-surface`/`--color-text-*`/`--color-border-*`/`--color-bg-*` を `[data-theme-mode="dark"]` で上書き。**まず単独 PR で landing し、トグルで catalog（DataTable 等・テーマ3 の scoped 注入もこの層）が反転することを検証**してから 114 へ。
- 3b. **body 地色の semantic 化**: `apps/web/app/globals.css` の `body { background: var(--color-white) }` は反転しない → `--color-bg-primary` 等の semantic surface トークンへ張替（114 の前の土台）。
- 3c. **colorScheme 軸 + FOUC 対策**: `infra/theme` に `colorSchemeAtom`（light/dark/system）+ storage + `ThemeSettingsModal` トグル。**FOUC 対策必須**: `layout.tsx` の `<head>` に pre-paint inline script（localStorage + `matchMedia` を読み paint 前に `<html>` へ `data-theme-mode` 付与）+ `<html suppressHydrationWarning>`。Tailwind v4 の `@custom-variant dark (&:where([data-theme-mode="dark"] *))` を配線（手動トグル + system 選択と `dark:` を両立）。
- 3d. **System A（design.ts inline）は前景のみ調整**: `generateColorConfig(base, isDark)` で前景/neutral のコントラストだけダーク調整し**ブランド色相は保持**（非目標の HSL 非改修と両立）。`themeConfigAtom` の入力に colorScheme を足し inline のまま追従。
- 3e. **ハードコード色 114 箇所**: **semantic トークンへ repoint を第一選択**、`dark:` バリアントは semantic トークンが無い一点ものに限定（golden hammer 回避）。画面群ごとに複数 PR。

### Phase 4: VRT（epic・**着手時に独立サブ Plan** `…-vrt.md` を新規作成・`feature/vrt-*`）

reg-suit 路線（方針準拠）。**Phase 3 と interleave**（下記順序）:
- 4a. **撮影層**: **storycap**（reg-suit 定番・storybook-static を全撮り）を第一候補。**Storybook 10.2 系互換は要 spike**。NG 時は `index.json` + `iframe.html?id=` を Playwright で撮る薄いスクリプトにフォールバック。flaky 対策（アニメ無効化・日付固定・font 待ち）を同梱。
- 4b. **reg-suit 設定**: `reg-keygen-git-hash` + `reg-notify-github` + `reg-publish-s3-plugin`（`customEndpoint` で MinIO）。**baseline の CI 到達性を先に決める**（公開到達可能な stg MinIO バケット + Secrets or 専用 S3。GH artifact は reg-suit のモデルに不適）。
- 4c. **CI workflow**（storybook build → 撮影 → reg-suit compare → 差分レポート）。
- 4d. 残置 chromatic 依存/script/README 記述の整理（削除 or 明示的 deprecated）。
- 4e. **VRT 被覆の決定**（§要判断）: catalog 141 stories のみか、app ページ（Playwright スクショ）まで含むか。**114 箇所は app 側で story 0** のため、catalog VRT では 114 置換を守れない。

**Phase 3 × 4 の順序（安全網が効く interleave）**: **4-light（light で baseline 確立）→ Phase 3 を additive 実装（light レンダリング不変）→ 4-dark（ダーク撮影を新規 image キーで加算）**。安全網の本質は「dark 自体」ではなく「トークン化/置換しても **light が不変**」の担保。ダーク撮影を既存 baseline の上書きでなく新規キー加算にすれば全 story 差分爆発を回避。

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
| ダークは 2 系統（A inline / B semantic）+ 114 箇所の三層 | 反転境界を B（semantic トークン）に引くハイブリッドで段階移行（Phase 3 の三層モデル）。System A は前景のみ isDark 調整 |
| **FOUC / hydration flash**: Jotai は hydration 後 → 初回明色フラッシュ | `layout.tsx` の pre-paint inline script + `suppressHydrationWarning`（Phase 3c）|
| **body 地色が `--color-white` 固定で反転しない** | semantic surface トークンへ張替（Phase 3b・114 の前の土台）|
| **背景テーマ(9) × dark 軸の相互作用**が未定義 | dark を背景軸に直交させるか上書きかを §要判断 で決定 |
| ハードコード色 114 箇所の一括置換は差分が巨大 | Phase 3e を画面群ごとに複数 PR。安全網は「VRT が dark を守る」ではなく「置換しても **light が不変**」の担保（下記順序）|
| **VRT の安全網が 114 に効かない**（114 は app 側・story 0、VRT は catalog 141 stories のみ）| §要判断 で「app ページ Playwright VRT を足す」か「114 は目視+手動確認」を決定 |
| **VRT の CI→MinIO 到達性**（GH runner は private MinIO 不達・service container は run 跨ぎで消える）| baseline を公開到達可能な stg バケット + Secrets か専用 S3 に。`reg-publish-s3` の `customEndpoint`。GH artifact は不適 |
| **VRT flaky**（アニメ・live date・font）で偽陽性 diff | アニメ無効化・日付固定・font 待ちを撮影層に同梱（Phase 4a）|
| VRT × ダークの順序で全 story 差分爆発 | 4-light → Phase3 additive → 4-dark（新規 image キー加算）で回避 |
| `"use client"` ページに metadata を付けられない | server layout で被せる / `useDocumentTitle` フック。動的は generateMetadata を server 側に置ける形へ |
| 公開一覧のサーバ order 変更が既存挙動に影響 | `me/surveys` の order 変更は API テストで担保。締切順は UI 側ソートでも可 |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-07-05 | テーマ5 に polish（タイトル/公開一覧）+ epic（ダーク/VRT）を**全部含める**（笹木さん選択）。ただしフェーズ分割し epic は着手前に個別設計 | ロードマップの「仕上げ」を一体で追う。ただしダーク/VRT は各々単独 Plan 相当の規模のため、フェーズと要判断で分離 |
| 2026-07-05 | Chromatic は採用せず reg-suit 路線（残置依存は整理対象）| 技術選定メモの SaaS 非採用方針と整合 |
| 2026-07-05 | 計画レビュー（代行 planner + architect）: Phase1/2 APPROVE / Phase3/4 は NEEDS WORK を反映（[Review](../reviews/2026-07-05-2040-finishing-touches-review.md)）| ダーク方式を三層モデルに置換 / FOUC・body 地色・`@custom-variant dark`・背景軸×dark をリスク/要判断に追加 / VRT の安全網主張を「light 不変の担保」に修正 + 4-light→3→4-dark の additive 順序 / MinIO CI 到達性を決定項目化 |
| 2026-07-05 | **epic 2 本（ダーク/VRT）は着手時に独立サブ Plan 化**（`…-dark-mode.md` / `…-vrt.md`）。本 Plan は roadmap + Phase1/2 実装 Plan + Phase3/4 意図の位置づけ | 各々 goal/scope/risk/verification を持つ単独 Plan 相当の規模。判断ログ追記では実装ゲートの情報量が不足（architect #C）|
| 2026-07-05 | Phase 1 実装: ルート metadata に `title.template="%s ｜ waoon"` + `useDocumentTitle` フック新設。**AppLayout で `activeLabel`（現在セクション名）を document.title に一括設定** + login/change-password は個別 | 認証ページは全て AppLayout 配下で NAV_ITEMS の prefix match により意味あるセクション名にマップされる（一覧/編集/新規/マスタ配下すべて）。30 ページ個別編集を回避。ページ個別タイトル（編集 vs 一覧）が要る箇所は将来 useDocumentTitle を個別追加 |
| 2026-07-05 | Phase 2 実装: 回答状態は `answers.status >= 200` で提出判定（100=下書き扱い・「続きから回答」導線）。締切訴求は日付粒度・閲覧者ローカル TZ の `deadlineInfo`（本日締切/あとN日/締切超過・提出済みには非表示）。`me/surveys` の order を `end_at asc nulls last` に。スケルトンは `SurveyCardSkeleton` として catalog に吸収 | ドメイン定数 `ANSWER_STATUSES`（100/200/400/900）と整合。コードレビュー初回 NEEDS WORK（BLOCKER: テストが `+09:00` 固定で UTC CI で落ちる）→ テストを TZ 非依存（オフセットなしローカル時刻）に修正して APPROVE。`TZ` env 固定は Windows Node で効かないため不採用 |

| 2026-07-05 | マージ後検証（dev + headless chromium）で 2 バグ発見 → `fix/finishing-touches-followups` | (1) フルロード時に Next のストリーミング metadata が `useDocumentTitle` の設定を約 7ms 後に上書き（MutationObserver 実測）→ hook を head 監視の再設定方式に。(2) SurveyCard の headerColor が CSS クラス名前提でアプリはカラー値を渡しており期間ヘッダーが白地白文字で不可視（従来から）→ 契約を CSS カラー値 + inline style に変更（[followup レビュー](../reviews/2026-07-05-2343-finishing-touches-followups-review.md): APPROVE）|

## 要ユーザー判断

Phase 1/2 は判断不要で着手可。以下は各 epic の**サブ Plan 着手時**に確定（本 Plan の判断ログに追記しつつサブ Plan へ）。

**ダーク（Phase 3 サブ Plan 着手前）**
1. 背景テーマ(9) と dark 軸の関係: **直交**（背景はそのまま・前景/面だけ反転）か、dark 時は背景を上書きするか。
2. FOUC 対策: pre-paint inline script を入れる（推奨）か、初回フラッシュを許容するか。
3. a11y/コントラスト目標: WCAG AA 準拠を目標にするか、今回は目視のみ（AA は別 Plan）か。

**VRT（Phase 4 サブ Plan 着手前）**
4. **被覆範囲**: catalog 141 stories のみか、**app ページ（Playwright スクショ）まで含むか**。「114 置換の安全網が欲しい」なら app 撮影が必須＝スコープ拡大。
5. baseline 保管の CI 到達性: 公開到達可能な stg MinIO バケット + Secrets か、専用 S3 か。
6. 撮影層: storycap（SB10 互換 spike 前提）か Playwright 薄スクリプトか。

**ページタイトル（Phase 1）**: server layout はセクション単位まで（`(admin)/layout.tsx` が client のため）。ページ個別化は `useDocumentTitle` 併用が実質必須 — 併用で確定。

## ステータス

- [x] 計画レビュー（代行 planner + architect）: Phase1/2 APPROVE / Phase3/4 設計指摘を反映（[Review](../reviews/2026-07-05-2040-finishing-touches-review.md)）
- [x] Phase 1（ページタイトル）実装完了（title.template + useDocumentTitle + AppLayout 一括・typecheck/lint/build/test green）
- [x] Phase 1 コードレビュー（代行 code-reviewer・APPROVE・[Review](../reviews/2026-07-05-2226-finishing-touches-code-review.md)）
- [x] Phase 1 merge（笹木さん承認・[#76](https://github.com/sasakiyusuke2017015/waoon/pull/76)）
- [x] Phase 2（公開一覧 UX）実装・コードレビュー（代行・初回 NEEDS WORK→修正反映→APPROVE・[Review](../reviews/2026-07-05-2300-finishing-touches-phase2-code-review.md)）・merge（[#77](https://github.com/sasakiyusuke2017015/waoon/pull/77)）
- [ ] Phase 3（ダークモード）: 独立サブ Plan 作成 + 要判断確定 → 実装（複数 PR）・レビュー・merge
- [ ] Phase 4（VRT）: 独立サブ Plan 作成 + 要判断確定 → 実装・レビュー・merge
- [ ] **マージ後検証（Phase 1/2・dev 実機。2026-07-05 に Claude Code が headless chromium で実施）**
  - [x] ページタイトル: クライアント遷移は正常（`アンケート ｜ waoon`）。**フルロード/リロードで metadata に上書きされ "waoon" に戻るバグを発見** → `fix/finishing-touches-followups` で修正・実機再確認済み
  - [x] 公開一覧: スケルトン / エラー再試行（abort→再試行→復帰）/ 締切バッジ（あと1日・あと2日・遠い締切と提出済みは非表示）/ 下書きの「続きから回答」導線 / 3 カラム / 締切昇順 / StatisticList 3 値
  - [x] 回答ページ: 期間・締切・下書きバッジの再掲 / ローディング・エラー体裁
  - [x] **SurveyCard の期間ヘッダーが白地白文字で不可視のバグを発見**（headerColor の契約不一致・従来から）→ 同 fix ブランチで修正・実機再確認済み
  - [x] **ログイン画面のメール欄 blur で InvalidStateError**（笹木さん報告・catalog `Input` が type を問わず `setSelectionRange` を呼ぶ・テーマ4 由来）→ 同 fix ブランチで selection 対応 type に限定 + 回帰テスト・実機再確認済み
  - [ ] 空状態（EmptyState）: 掲載ゼロの状態が必要なため未検証（seed 環境では常に掲載あり。笹木さん判断でスキップ可）
  - [x] followup fix（タイトル上書き / 期間ヘッダー / Input blur）の PR merge（[#78](https://github.com/sasakiyusuke2017015/waoon/pull/78)）
