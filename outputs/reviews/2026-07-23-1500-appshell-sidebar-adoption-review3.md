# Review: AppShell / Sidebar 導入とアプリシェル刷新（ui-catalog 上流同期 第 2 弾）— 計画（3 回目）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-23 15:00 JST |
| レビュアー | Claude Code（code-reviewer サブエージェント） |
| 対象 Plan | [`plans/2026-07-23-1357-appshell-sidebar-adoption.md`](../plans/2026-07-23-1357-appshell-sidebar-adoption.md) |
| ブランチ | `feature/ui-catalog-sync-2` |
| 関連 PR | TBD |
| レビュー種別 | 計画（3 回目） |
| verdict | **APPROVE** |

## サマリ

2 回目レビュー（[`2026-07-23-1435`](2026-07-23-1435-appshell-sidebar-adoption-review2.md)）の新規
BLOCKER 4 件と NICE-TO-HAVE 6 件の反映状況を、上流 zip と wanonwan 実ファイルの両方をコマンドで
突き合わせて検証した。**BLOCKER 4 件はすべて実装計画・検証・リスク・判断ログの 4 箇所に一貫して
反映済み**で、反映された技術方針（`--chrome-subheader-h` / `[data-sidebar-state]` スコープ /
media query 上書き / `HeaderUserMenu` の `md:hidden` / `showCheck` による視点切替）は
いずれも実ファイルの構造と照合して**技術的に正しい**。新規 BLOCKER はゼロ。

## 判定スコープ

| 軸 | 判定 |
|---|---|
| 最終判定 | APPROVE |
| Plan 判定 | APPROVE（影響範囲・スクロールモデル・トークン波及・機能後退リスクがすべて計画に落ちている） |
| 実装判定 | N/A（本 Plan 由来のコード差分はまだ無い） |
| 記録整理 | OK（Review リンク追記と dashboard 再生成を実施） |

## 2 回目 BLOCKER の反映状況

| # | 2 回目の指摘 | 検証結果 |
|---|---|---|
| 1 | sticky ヘッダが SubHeader 帯の裏に潜る（`--chrome-subheader-h` 採用） | **反映 OK・技術的に正しい** |
| 2 | モバイルの `--sidebar-w: 0px` を `[data-sidebar-state]` セレクタで上書き | **反映 OK・カスケード解釈も正しい** |
| 3 | モバイルのアカウント導線を TopBar の `HeaderUserMenu`（`md:hidden`）で確保 | **反映 OK・部品の再利用可能性を確認済み** |
| 4 | 視点切替を `SidebarAccountMenu` の `showCheck` で引き継ぐ | **反映 OK・API 面で充足を確認済み** |

NICE-TO-HAVE 6 件（Phase B 見出し / `--topbar-h` のスコープ化 / Modal scroll lock /
残課題節の `bg-background` / 旧 `AppLayout` の移設要素列挙 / スケルトン範囲の拡大）もすべて反映済み。

## 技術検証（今回コマンドで裏取りした点）

| 検証対象 | 結果 |
|---|---|
| `[data-sidebar-state]` スコープが Phase A で apps/web を壊さないか | **壊さない**。属性を付ける実装は `AppShellRoot.tsx` と各 stories のみ。Phase A の apps/web には `AppShellRoot` が無いため `--topbar-h` は未定義のままで、現行の `var(--topbar-h, 0)` フォールバックが維持される |
| スコープ移動で Storybook が壊れないか | **壊れない**。`SidebarShell.stories.tsx` が自前で `data-sidebar-state` を持つため brand 行の `h-[var(--topbar-h)]` は解決する |
| `--chrome-subheader-h` 方式が external toolbar 構成で機能するか | **機能する**。`--dt-toolbar-h` は wrapper 要素へ直書き（external 時 `0px` 固定）だが、`--chrome-subheader-h` は祖先に書けば継承で届き、`calc()` の別項として加算される。別名なので上書き衝突も起きない |
| 帯の可変高（funnel 展開）への追従 | **追従する**。現行 observer の出力先を変えるだけなので、展開時の増分も同じ経路で反映される |
| media query 上書きのカスケード | **正しい**。基底も上書きも specificity 同点で、media query は specificity を加えないため後述が勝つ。Plan は「基底ルールより後ろに追加」と明記しており条件を満たす |
| `md` breakpoint との整合 | **整合**。`max-width: 767px` と `hidden md:block`（768px）の境界が一致し、ズレる帯域がない |
| `HeaderUserMenu` を TopBar で再利用できるか | **できる**。Props は `Header` テンプレート非依存 |
| `SidebarAccountMenu` が視点切替を表現できるか | **できる**。`showCheck` / `error` / `badge` / `onAction(id, {closeMenu})` が実在し、Plan の「追加改修は不要」は正しい |
| `_template.md` 準拠 / 必須要素 | すべて具備。PR / Review 欄はリンクのみで verdict 文字列の複製なし |

## Findings

BLOCKER はゼロ。以下はすべて `[NICE-TO-HAVE]` で、実装時の判断で足りる範囲。

### [NICE-TO-HAVE] `AppShellRoot` は `style` / `ref` を受け取らない

props は `{ className, children }` のみ。`--chrome-subheader-h` は prop 経由では書けないが、
**継承で届けば足りる**ので直下に 1 枚ラッパを置けば解決する。`SidebarShell` の非表示化を
「ラッパ側で行う」と既に書けているので、同じ扱いで足りる。

### [NICE-TO-HAVE] `SidebarAccountMenu` の popover 内部はテーマ 3 軸に追従しない

popover ヘッダは `text-gray-900` 等を直書きしており `--sidebar-*` のブリッジが効かない。
固定の明色背景 + 濃色文字で可読性は担保されるが、検証表「テーマ連動」の判定が popover 内部まで
含むかは曖昧。「popover は上流既定配色のままで可」と割り切るか残課題に積むかを実装時に決める。

### [NICE-TO-HAVE] `SidebarAccountMenu` の `collapsed` prop 供給元が手順に無い

`useAppShell()` の `sidebarState` から導出する。`AppShellProvider` 配下の client 部品なので
自然に解決できる粒度。

## 良い点（維持してほしい判断）

- 2 回目の BLOCKER 4 件を、**現状コンテキスト（根拠）→ 実装手順（対処）→ リスク表（緩和策）→
  判断ログ（経緯）→ 検証表（受け入れ条件）** の 5 箇所に落とし切っている。特に判断ログで
  ページスクロール移行の当初想定（ResizeObserver を畳める）を**撤回した経緯まで追記**した点は、
  `plan-review-workflow.md` の「古い決定を黙って書き換えない」に正しく従っている
- `--chrome-subheader-h` を `calc()` の**新しい項として足す**設計。既存変数を上書きせず加算で
  組むため、内部 toolbar 構成と external toolbar 構成の両方が同じ式で成立する
- 機能後退（モバイルのアカウント導線 / 視点切替）を「リスク」ではなく**具体的な到達確認の
  目視項目**（`multi1` でログイン / 幅 375px）に落とした点。E2E 未導入という制約下で
  再現可能なゲートになっている
- Phase A / B の責務境界を、当初の「A = `packages/ui` 限定」から「B は両方に跨る」へ
  **正直に訂正**した点

## 検証（この Review 自体の）

- [x] Plan 全文 / 1 回目 Review / 2 回目 Review を読了し、指摘 → 反映を行単位で突合
- [x] 上流 `tokens.css` の追加ブロック全文と `data-sidebar-state` の付与元を全文検索で確認
- [x] `--sidebar-w` / `--topbar-h` の参照元を上流 `core` 全体で検索
- [x] `DataTable.module.scss` と `useStickyToolbarOffset.ts` を読み、external toolbar 時の
  `--dt-toolbar-h` `0px` 固定を再確認
- [x] `AppLayout.tsx` の ResizeObserver と `--topbar-h` を設定しない Why コメントを確認
- [x] `HeaderUserMenu.tsx` の Props と唯一の利用元を確認
- [x] 上流 `SidebarAccountMenu.tsx` の `showCheck` / `error` / `badge` / `onAction` の実在を確認
- [x] `_template.md` との突合、`node scripts/gen-outputs-readme.mjs` 実行（成功・33 Plan）
- 検証ギャップ: **ブラウザ実描画は未検証**（sticky の実位置・カスタムプロパティの実カスケード・
  テーマ 3 軸でのコントラスト・Modal scroll lock）。これらは Plan の目視検証表でカバーされる想定。
  上流 46 差分のうち AppShell / Sidebar / tokens / DataTable 以外の中身は個別確認していない

## フォローアップ

- [x] Plan ヘッダの `Review` 欄に本 Review のリンクを追記
- [x] `node scripts/gen-outputs-readme.mjs` を実行して dashboard を再生成
- [x] NICE-TO-HAVE 3 件を Plan の「残課題」へ積む
- [ ] 笹木さん承認 → ステータスを `⚪ 実装待ち` に更新 → Phase A 着手
