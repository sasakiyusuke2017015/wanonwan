# Plan: app shell（レイアウト/テーマ）を旧 1on1 の見た目に寄せる

| 項目 | 値 |
|---|---|
| 概要 | apps/web の app shell の **見た目・動き・アニメーション・デザインを丸ごと旧 1on1 アプリに寄せる**。 |
| ステータス | 🟢 承認済み（着手前）— Phase 1〜5 一気通貫 / 動き・アニメ込み忠実再現 |
| slug | `app-shell-legacy-look` |
| 作成 | 2026-06-28 22:12 JST |
| 担当 | Claude Code + 笹木さん |
| ブランチ | `feature/app-shell-legacy-look`（develop `5fb13f4` 起点 / TBD） |
| 関連 PR | TBD |
| レビュー | [コードレビュー](../reviews/2026-06-28-2247-app-shell-legacy-look-review.md)（**APPROVE** / BLOCKER ゼロ、条件: ブラウザ目視） |
| 前提 | ee446f0「見た目踏襲・基盤」で土台は導入済み。本 Plan はその簡略化された部分を旧 1on1 に寄せ直す |

## 目的

apps/web の app shell の **見た目・動き・アニメーション・デザインを丸ごと旧 1on1 アプリに寄せる**。
アイコンの形だけでなく、開閉トランジション・ホバー挙動・メニューのフェードイン等の**モーション全体**を
忠実に再現するのが目的。ee446f0「見た目踏襲・基盤」で UI 部品（Header / SubHeader / SideNav / Footer /
BackgroundTexture）の踏襲は済んでいるが、**サイドナビ・サブヘッダー・本文スクロール・
ヘッダー右メニュー・モーション**が簡略化され、旧 1on1 と体感が変わっている。これを旧の挙動に寄せ直す。

### モーション/アニメーションの出どころ（重要）

旧 1on1 の「動き」は globals.css のキーフレーム（`cardDeal` 等）ではなく、**ほぼ `@waoon/ui` の
モーション部品**から来ている（旧ソース調査: `BlurFade`×13 / `FloatingMenuButton`×8 / `Shimmer`系×8 使用、
一方 `cardDeal` 等のキーフレームは旧 tsx で直接使用 0 = 実質 dead）。
したがって本 Plan は **`@waoon/ui` のモーション部品を shell/主要導線に適用する**ことで動きを寄せる:

| 部品 | 旧での用途 | waoon での適用先 |
|---|---|---|
| `FloatingMenuButton` | サイドナビ開閉ハンバーガー（開閉アニメ） | Phase 1 サイドナビ |
| `BlurFade` | ユーザーメニューの各項目フェードイン（delay 段差） | Phase 3 ヘッダーメニュー |
| `ShimmerButton` | 未ログイン時のログインボタン | （waoon は /login 直行のため適用は任意） |
| `Animated` / `FloatingElements` | カード/リストの出現アニメ・背景演出 | Phase 5 主要画面・背景 |
| サイドナビ `transition` | 開閉時に本文が `transition-all duration-300` で寄る | Phase 1 |

→ globals.css のキーフレームは**コピーしない**（旧でも未使用 = dead CSS。[evergreen.md](../../.claude/rules/evergreen.md)）。
動きは部品で再現する。

旧 1on1 の UI 部品はベンダリング済みの `@waoon/ui`（`packages/ui/core`）に全て存在する
（`FloatingMenuButton` / `BackgroundTexture` / `Header` / `SubHeader` / `SideNav` / `Footer` /
`DropdownMenu` / `MenuItemList` / `Breadcrumb` 等）。**旧ソース（`docs/99_archive/1on1-main.zip`）は
参照のみ・流用しない**方針なので、コードはコピペせず Next.js App Router 構成に合わせて再実装する。

## スコープ

### 現状と旧 1on1 の差分（寄せ直す対象）

| # | 要素 | 旧 1on1 | 現 waoon | 体感差 |
|---|---|---|---|---|
| A | サイドナビ | アイコン主体の縦レール。`FloatingMenuButton`（ハンバーガー）で開閉、本文が `transition` で左に寄る。ホバーでツールチップ。ナビ2件以上で表示 | ラベル付き 240px サイドバー。常時表示・開閉なし | **大** |
| B | サブヘッダー | タブ式（`AppSubHeader` + パンくず）。各画面がタブ/パンくずを供給 | アクティブ画面名のラベルを出すだけ | 中 |
| C | 本文スクロール | `h-screen overflow-hidden`、本文(`<main>`)だけが内側スクロール | `min-h-screen`、ページ全体スクロール | 中 |
| D | ヘッダー右 | ユーザーメニュー（`DropdownMenu`）にテーマ設定/パスワード変更/ログアウトを集約。通知ベル | 歯車 + 「パスワード変更」リンク + ログアウトボタンが並ぶ | 中 |
| E | globals.css | アニメーション群（cardDeal / shimmer / marching-ants 等）あり | body 背景のみの最小構成 | 小〜中 |

### やること（フェーズ分割）

実装は **体感差の大きい順 + リスクの低い順** に段階化し、各段階で `pnpm --filter @waoon/web build` と
ブラウザ目視を挟む。

1. **Phase 1: サイドナビの折りたたみ化（差分 A）**
   - `FloatingMenuButton`（ハンバーガー）を導入し、サイドナビの開閉状態を Jotai atom（`leftPaneOpenAtom` 相当）で管理。
   - 開いている時は本文が `transition` で右に寄る（旧の `ml-[var(--left-pane-width)]`）。
   - ナビ項目が 2 件以上のときだけサイドナビ/ハンバーガーを表示（現状は常に1件以上なので実質常時。`useNavigationItems` の `items.length` で判定）。
   - **旧そっくりに寄せる**（決定）: アイコン主体の縦レール + **ホバーでツールチップ**（レール外に `fixed` 表示）+
     アクティブ項目のハイライト + ホバー時の `backdrop-blur` / 背景うっすら。開閉は `FloatingMenuButton` のアニメ付き。

2. **Phase 2: 本文スクロールモデル（差分 C）**
   - ルートを `h-screen overflow-hidden` にし、`<main>` を内側スクロールへ。
   - **全画面に影響**するため、既存ページ（admin テーブル / dashboard / schedule カレンダー等）が
     高さ前提で崩れないか 1 枚ずつ確認。崩れるページがあれば個別調整。

3. **Phase 3: ヘッダー右メニューの集約（差分 D）**
   - 歯車 + パスワード変更リンク + ログアウトボタンを、旧同様 `DropdownMenu` + `MenuItemList` の
     ユーザーメニューに集約（氏名/メール表示 → テーマ設定 / パスワード変更 / ログアウト）。
   - 通知ベルは旧にあるが waoon に通知機能が無いので**入れない**（dead UI を作らない＝[evergreen.md](../../.claude/rules/evergreen.md)）。

4. **Phase 4: サブヘッダーのタブ/パンくず化（差分 B）**
   - `@waoon/ui` の `SubHeader` をタブ/パンくず対応で使う土台を入れる。
   - ただし各画面がタブ/パンくずを供給する作りが必要で**影響範囲が全ページに及ぶ**ため、
     まずは shell 側の受け口（props でタブ/パンくずを渡せる）だけ用意し、各画面の供給は
     **別 Plan に切り出す**ことを推奨（**未確定事項②**）。

5. **Phase 5: モーション/アニメーションの適用（差分 E）**
   - `@waoon/ui` の `BlurFade` / `Animated` / `FloatingElements` を主要画面の出現演出・背景に適用し、
     旧の「ぬるっと出てくる」体感を再現。
   - サイドナビ開閉・本文の寄り（Phase 1）、ヘッダーメニューの BlurFade（Phase 3）と合わせ、
     アプリ全体の動きを旧に揃える。
   - globals.css のキーフレーム（cardDeal / marching-ants 等）は**コピーしない**（旧でも未使用 = dead）。
     必要な動きは全て `@waoon/ui` 部品で表現する。
   - **Phase 4: サブヘッダー受け口**もこの一気通貫に含める（タブ/パンくずを props で渡せる土台。
     各画面の供給は別 Plan）。

### やらないこと

- 旧 1on1 のページ実装（Chat / Project / Attendance 等、waoon に無い画面）の移植。
- 旧ソースコードのコピペ流用（参照のみ。App Router 構成で再実装する）。
- `@waoon/ui`（ベンダリング済み ui-catalog）本体の改変（不足があれば別途 ui-absorb で対応）。
- 各業務画面側のタブ/パンくず供給（Phase 4 の受け口のみ。本格対応は別 Plan）。

## 現状コンテキスト

- shell 本体: [AppLayout.tsx](../../apps/web/components/layout/AppLayout.tsx)（常時表示サイドバー + ラベルサブヘッダー + `min-h-screen`）
- shell の付け外し: [AppFrame.tsx](../../apps/web/components/layout/AppFrame.tsx)（`/login` 等で shell を外す）
- ナビ定義: [navItems.ts](../../apps/web/components/layout/navItems.ts) / [useNavigationItems.ts](../../apps/web/components/layout/useNavigationItems.ts)
- テーマ設定: [ThemeSettingsModal.tsx](../../apps/web/components/layout/ThemeSettingsModal.tsx)（3 軸: 色/形/背景、Jotai 永続化）
- テーマ基盤: `@waoon/ui` の `infra/theme`（`useTheme` / `useColorTheme` 等）
- 旧 1on1 参照元（流用しない）: `docs/99_archive/1on1-main.zip` 内
  `1on1/apps/web/src/layouts/`（`templates/AppLayout.tsx` / `organisms/AppHeader.tsx` /
  `organisms/AppSubHeader.tsx` / `templates/AppSideNav.tsx` / `organisms/BottomTabBar.tsx`）
- ee446f0 当時の計画レビュー: [app-shell-theme-review](../reviews/2026-06-12-0017-app-shell-theme-review.md)

## 実装計画（手順）

1. `feature/app-shell-legacy-look` を develop 起点で作成。
2. Phase 1（サイドナビ折りたたみ）→ build + 目視 → コミット。
3. Phase 3（ヘッダー右メニュー集約）→ build + 目視 → コミット。※リスク低・独立性高なので先に。
4. Phase 2（スクロールモデル）→ 全画面目視 → 崩れ調整 → コミット。※影響大なので単独コミット。
5. Phase 5（globals.css）→ 必要分のみ → コミット（スキップ可）。
6. Phase 4（サブヘッダー受け口）→ build → コミット（または別 Plan へ）。
7. `/pr-review`（code-reviewer + security 観点）→ 指摘対応 → PR 作成（develop 向け、笹木さん確認）。

## 検証

- `pnpm -r typecheck` / `pnpm --filter @waoon/web build` がグリーン。
- dev 起動（`pnpm compose:dev:up` + provision）でブラウザ目視:
  - サイドナビの開閉・本文の寄り・モバイル下部タブの表示。
  - 各 admin 画面 / dashboard / schedule が崩れない（特に Phase 2 後）。
  - ヘッダー右メニューからテーマ設定 / パスワード変更 / ログアウトが動く。
  - テーマ 3 軸切替が従来どおり効く。
- 旧 1on1 のスクショ（あれば）と並べて見た目の寄り具合を笹木さんが確認。

## リスク

- **R1（中）**: Phase 2 のスクロールモデル変更は全画面に影響。高さ前提でない既存ページが崩れる恐れ。
  → 単独コミット + 全画面目視で早期検知。崩れたら個別 fallback（当該ページのみ従来スクロール）。
- **R2（低）**: `FloatingMenuButton` / `DropdownMenu` 等の `@waoon/ui` API が旧と差異あり得る。
  → 実装前に各コンポーネントの props を `packages/ui/core` で確認してから着手。
- **R3（低）**: テーマ設定をヘッダーメニューに移すと、現状の歯車/リンク前提の E2E・目視手順が変わる。
  → 導線変更は PR 本文に明記。
- **R4（中）**: 「旧そっくり」をどこまで求めるかが曖昧だと往復が発散する。
  → 未確定事項①②を先に確定し、Phase 単位で都度確認して収束させる。

## 未確定事項（確定済み）

- **①サイドナビの形 → 旧そっくり（アイコンレール + ツールチップ + 開閉アニメ）**。アイコンの形だけでなく
  動き・アニメ・デザイン全体を忠実再現する方針（ユーザー指示）。
- **②サブヘッダー（Phase 4）→ 一気通貫に含める**。ただし shell の受け口まで。各画面のタブ/パンくず供給は別 Plan。
- **③スコープの深さ → Phase 1〜5 一気通貫**（ユーザー指示）。

## 判断ログ

| 日時 | 判断 | 理由 |
|---|---|---|
| 2026-06-28 22:12 | 旧ソースはコピペせず再実装 | CLAUDE.md「旧 1on1 は参照のみ・流用しない」 |
| 2026-06-28 22:12 | 通知ベル・marching-ants 等は移植しない | 対応機能が waoon に無い。dead UI/CSS を作らない（evergreen） |
| 2026-06-28 22:12 | Phase 4（サブヘッダー）は受け口のみ／別 Plan 推奨 | 各画面への波及が大きく、本 Plan の主目的（shell の見た目）から外れる |
| 2026-06-28 22:20 | 動き/アニメは globals.css でなく `@waoon/ui` 部品で再現 | 旧でもキーフレームは未使用、動きは BlurFade/FloatingMenuButton 等由来。dead CSS を作らない |
| 2026-06-28 22:20 | ①②③ 確定: 旧そっくり / Phase 4 受け口込み / Phase 1〜5 一気通貫 | ユーザー指示（動き・アニメ・デザイン全体を忠実に） |
| 2026-06-28 22:40 | `@waoon/ui` の `exports` に 4 部品 subpath を追記（BlurFade / FloatingMenuButton / DropdownMenu / MenuItemList） | バレル `@ui-catalog/core/organisms` を import すると window 参照を持つ別 organism を巻き込み prerender が `window is not defined` で失敗。狭い subpath で回避。`やらないこと` の「@waoon/ui 本体改変」に対する逸脱だが、コンポーネント実装は無変更で export plumbing のみ。既存の Modal/BackgroundTexture と同じ形 |
| 2026-06-28 22:40 | 旧 `LogoutButton`（apps/web/app/logout-button.tsx）を削除 | ヘッダーメニュー集約で参照ゼロ = dead code（evergreen） |
| 2026-06-28 23:05 | スコープ拡張: シェルだけでなく**各既存画面のページレベル見た目（レイアウト/デザイン）も旧 1on1 に寄せる**（ユーザー指示「既存画面の中身をもどす／レイアウト・デザイン」） | 当初 Plan は shell 限定だったが、ユーザーの本意は app 全体の見た目復元。対象は「もともとあった機能」＝Home / Dashboard / Surveys 一覧 / Survey 回答 / Schedule / Login / ChangePassword |
| 2026-06-28 23:05 | `@ui-catalog` の router 抽象を Next にブリッジする `nextRouterAdapter` を追加し `RouterProvider` を Providers に配線 | InternalLink / Breadcrumb 等 router 依存の旧部品は RouterProvider 必須（無いと throw）。全画面復元の土台 |
| 2026-06-28 23:05 | Home をカードグリッド（ContentBlock + InternalLink + AdjustmentBanner）に復元。外部インフラリンク（旧サーバ IP / Pleasanter 等）は持ち込まない | 旧 Home 踏襲。Pleasanter 排除方針・waoon 無関係リンクは除外（evergreen） |
| 2026-06-28 23:25 | **「色・背景・雰囲気が違う」の根本原因を特定**: 旧 1on1 の既定テーマは `.env.example` で `rose / sharp / fabric`、waoon は `emerald / soft / wood`（@ui-catalog 汎用デフォルト）。両者は同じ @ui-catalog を使うので chrome は似るが、既定テーマが別物で印象が丸ごと違っていた | ユーザーの「色・背景・雰囲気」回答 + 旧 `.env.example` の実値。これがユーザーの言う「見た目が変わった」の主因 |
| 2026-06-28 23:25 | waoon の `DEFAULT_GLOBAL_THEME` を `rose / sharp / fabric` に変更（packages/ui/infra/theme/types.ts） | 旧 1on1 の既定に一致させる単一ソース変更。SSR・既定・「既定に戻す」が一括で旧に揃う。`getStoredValue` は未保存時のみデフォルト適用なので既存ユーザー影響は最小 |
| 2026-06-28 23:45 | dev デモ seed 追加（当初 packages/db/seed/30_demo.sql の SQL フィクスチャ） | 画面が全 0 で見た目を判断できなかったため。アンケート3/質問/掲載/回答9/スケジュール3 とデモ回答者を投入 |
| 2026-06-29 00:10 | **SQL フィクスチャをやめ CSV 方式に変更**（ユーザー指示「CSV でいれて」）。`30_demo.sql` を削除し、`packages/db/seed/csv/{demo_users,surveys,questions,survey_questions,survey_publications,answers,schedules}.csv` を追加。`seed-from-csv.mjs` に `seedDemo()` を追加（FK は title/body/code で解決） | リポジトリの seed 規約（CSV + seed-from-csv）に統一。半期面談・ストレスチェックにも設問を追加（「設問がありません」の指摘対応） |
| 2026-06-29 00:10 | デモ投入は `--demo` フラグ opt-in。provision:dev / db:seed のみ渡し、provision:stg/prod には渡さない | seed-from-csv は stg/prod の provision からも呼ばれるため、デモが本番に入らないよう明示ガード |
| 2026-06-29 00:45 | アンケート画面を用意済み部品に寄せる。一覧（surveys/page.tsx）を `SurveyCard`（期間/ステータス/ボタン）に、回答ページ（[publishId]）の戻りを `BackButton` に。AnswerForm は既に ContentBlock/FormField/Radio 等で良好なので据え置き | ユーザー指示「全画面なおして まずアンケート画面」。一覧は自前 Card だった |
| 2026-06-29 00:30 | ログイン画面を旧 1on1 + 用意済み部品で作り直し（ユーザー指摘「用意したやつ使え」）。`apps/web/app/login/page.tsx` を 2カラム（左ブランディング rose グラデ / 右フォーム）に。`Input`/`Checkbox`/`Banner`/`LoginButton`/`AuthFormCard` を使用。`@waoon/ui` exports に AuthFormCard / LoginButton subpath 追加 | 旧は素の自前フォームだった。画像アセット（logo/character）は waoon に無いので省略。認証は waoon の email/password に合わせ、remember はメールのみ保存（パスワードは保存しない=旧のセキュリティ的アンチパターンは踏襲しない） |

## ステータス

- [x] ユーザー承認（①②③ 確定）
- [x] Phase 1: サイドナビ折りたたみ（アイコンレール + ツールチップ + 開閉アニメ）— `AppSideNav.tsx` 新規 + `FloatingMenuButton`
- [x] Phase 3: ヘッダー右メニュー集約（DropdownMenu + BlurFade）— `HeaderUserMenu.tsx` 新規、`LogoutButton` 削除
- [x] Phase 2: スクロールモデル（h-screen 内側スクロール）— `AppLayout` ルートを `h-screen overflow-hidden`、main を内側スクロール
- [x] Phase 5: モーション適用 — ヘッダーメニュー BlurFade + 本文を pathname key の BlurFade で画面遷移フェード + サイドナビ/本文の transition
- [x] Phase 4: サブヘッダー受け口（leftOffset 連動。タブ/パンくず各画面供給は別 Plan）
- [x] typecheck / build グリーン
- [ ] ブラウザ目視（dev 起動、全画面の崩れ確認）
- [ ] レビュー → PR → develop マージ
