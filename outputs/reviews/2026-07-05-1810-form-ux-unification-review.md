# 計画レビュー: フォーム UX 統一（テーマ4）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 18:10 JST |
| 対象 Plan | [2026-07-05-1745-form-ux-unification.md](../plans/2026-07-05-1745-form-ux-unification.md) |
| レビュア | Claude Code エージェント代行（`planner` + `architect` 並列・笹木さん明示指示） |

## Verdict

| 軸 | 判定 |
|---|---|
| 最終判定 | **NEEDS WORK → 対応済み（下記で Plan 改訂）** |
| Plan 判定 | NEEDS WORK（初回）→ 改訂で APPROVE 相当 |
| 実装判定 | N/A（実装前） |
| 記録整理 | OK |

両レビュア（計画妥当性 + 設計妥当性）が**同一の BLOCKER** を独立に指摘。3 PR の切り方・非目標・判断ログ自体は妥当だが、**目玉の「アプリ内遷移ガード」の実装方式が実コードと噛み合っていない**。

## BLOCKER（両者一致）: 「`Link onNavigate` 傍受」ではアプリ内遷移を捕捉できない

確定方針の「Next 16 `Link onNavigate` 傍受」は `<Link>` クリックにしか発火しない。しかしこのアプリの主要遷移は **`router.push`/`router.replace`（プログラム遷移）**:

- サイドナビ [`AppSideNav.tsx:59`](../../apps/web/components/layout/AppSideNav.tsx#L59) `router.push`（判断ログが守りたい対象そのもの）
- 下部タブ [`AppLayout.tsx:193`](../../apps/web/components/layout/AppLayout.tsx#L193)
- ヘッダメニュー [`HeaderUserMenu.tsx:27,59`](../../apps/web/components/layout/HeaderUserMenu.tsx#L27)
- 行クリック（`MasterListView` / `AdminListTable.onRowClick`）
- 各フォームの cancel/success 遷移（`SurveyForm.tsx:105,193` 等）

さらに **popstate（ブラウザ戻る/進む）** が Plan 全体で未考慮。フォームは catalog の router 抽象（`useNavigate`/`nextRouterAdapter`）を経由せず `next/navigation` を直叩きで、**遷移の choke point が一元化されていない**。このまま実装すると「サイドナビ離脱を無言で素通りするガード」= 目的未達になる。

## 改訂方針（この BLOCKER への対応・Plan に反映済み）

1. **ガード付き navigate に一本化**: `apps/web` に `NavigationGuardProvider` + `useGuardedNavigate()` を新設。dirty レジストリを参照し、dirty なら `await confirm()`（ConfirmDialog）→ 確定時のみ実 `router.push`。**AppSideNav / AppLayout（下部タブ）/ HeaderUserMenu / 行クリック / 各フォーム cancel・success の生 `router.push` をここへ移行**する（PR スコープに計上）。
2. 残る素の `<Link>`（パンくず等）は Next 16 `onNavigate` で `preventDefault` して同じ confirm フローに合流。介入点 2 系統を列挙して漏れを潰す。
3. **popstate** は dirty 中に `history.pushState` ダミーを積み、`popstate` で confirm → キャンセル時は再 push で押し戻す定番策を明記。
4. **保存成功時に dirty ベースラインをリセット**してから成功遷移（ガード暴発防止）。
5. **catalog/app 境界**: catalog `useUnsavedGuard({ when })` は **`beforeunload` + dirty 判定ヘルパのみ**（フレームワーク非依存・SSR は effect 内アクセス）。Next 固有の遷移傍受（Provider / guarded navigate / popstate / Link onNavigate / ConfirmDialog 実体）は **apps/web 層**に置く（catalog の RouterAdapter 抽象を壊さない）。
6. dirty 判定は既存 `buildPayload()` / `questionDraftToPayload()` を流用し安定 stringify で比較。`AnswerForm` の `values`（`string[]`）は配列対応が要る。参照等価は使わない。
7. **PR 再分割**: 膨らんだ未保存ガードを独立 PR に切り出し、低リスクのフィードバック統一を先行させる（3 PR → 4 PR。§Plan 参照）。

## NICE-TO-HAVE（Plan に反映）

- 送信成功時の dirty クリア契約を hook 契約に明記（成功遷移がガードに引っかからないように）。
- ガード配線対象フォームを表で確定（`login`/`change-password` は N/A、`AnswerForm` は公開ページ・`beforeunload` の要否を明示）。
- `QuestionForm`/`PublicationForm` を 2 PR で触る（配線→カタログ化）ため「挙動不変で UI のみ差し替え」と明記。
- `InterviewForm` のバリデーション欠落（field error UI 無）の在り処を決める（本テーマでは対応せず別 Plan、と明示）。
- dirty のままキャンセル押下時の確認の扱いをガード方式に含める。
