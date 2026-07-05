# コードレビュー: 未保存離脱ガード基盤（テーマ4 PR-B）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 18:52 JST |
| 対象 | 未コミット作業ツリー（`feature/form-unsaved-guard`） |
| 種別 | コードレビュー（実装レビュー） |
| 対応 Plan | [フォーム UX 統一（テーマ4）](../plans/2026-07-05-1745-form-ux-unification.md) §PR-B |
| レビュアー | Claude Code エージェント代行（`code-reviewer` + `architect` 並列） |

## 最終判定

| 軸 | 判定 | 補足 |
|---|---|---|
| 最終判定 | **NEEDS WORK（architect）→ BLOCKER 2 件を反映 → APPROVE 相当** | code-reviewer は APPROVE、architect が BLOCKER 2 件を検出。両方修正済み |
| Plan 判定 | N/A | 計画レビューは 2026-07-05-1810 版で実施済み |
| 実装判定 | APPROVE（対応後） | 下記 BLOCKER 2 件を修正 |
| 記録整理 | OK | |

> 初回 verdict: code-reviewer=**APPROVE** / architect=**NEEDS WORK**（BLOCKER 2 件）→ 対応後 **APPROVE 相当**

対話挙動（サイドナビ離脱・戻る・暴発しない）は笹木さん手動検証前提。

## architect が検出した BLOCKER（反映済み）

### [BLOCKER→修正済] パンくず「ホーム」が未ガードの素の SPA Link
`AppLayout` のヘッダは catalog `Breadcrumb` を使っており、これは `InternalLink → nextRouterAdapter → next/link` で**素の SPA 遷移**する。前方一致 active 判定で全フォームページにパンくずが 2 件出るため、dirty なフォーム上で「ホーム」を押すと `beforeunload`（SPA では非発火）・`guardedNavigate`・popstate のいずれも通らず**確認なしに /dashboard へ遷移し編集が消える**。機能の中核保証（silent loss なし）を破っていた。
→ **修正**: パンくずをアプリ層で描画し、非最終要素を `guardedNavigate` するボタンに置換（`AppLayout.tsx`）。catalog `Breadcrumb` import を除去。

### [BLOCKER→修正済] popstate 確認中の多重 back による resolver レース
ダイアログ表示中に戻るを連打すると 2 回目の popstate が `confirmLeave` を呼び `resolverRef` を上書き、先行 Promise が宙吊り + センチネルを貫通して確認なし離脱しうる。
→ **修正**: `confirmLeave` は in-flight の Promise があれば再利用（`pendingRef`）。`onPopState` に確認中フラグを入れ、ダイアログ表示中の back はセンチネルを積み直して無効化（`NavigationGuardProvider.tsx`）。下記 Findings #1・#2 の一部もこの修正で解消。

以下は code-reviewer の静的レビュー結論（Findings #1・#2 は上記 BLOCKER 対応で解消済み）。

---

## 総評

catalog（`beforeunload` のみ）と apps 層（Next 依存の遷移傍受）の責務分離は Plan の設計意図どおりに実装されており、境界は正しく守られている。重点観点 6 点を精査した結果、ランタイムクラッシュ・データ消失につながる BLOCKER は検出せず。特に「保存成功時の暴発」は成功遷移が plain `router.push`（ガード非経由）である設計により構造的に回避されており healthy。

以下は挙動の磨き込み余地（すべて fail-safe 側 = 過剰ガードや軽微な履歴汚れで、データ損失は起きない）を `[NICE-TO-HAVE]` として列挙する。

---

## Findings

### [NICE-TO-HAVE] popstate センチネル履歴が dirty のトグルで蓄積しうる
ファイル: `apps/web/components/navigation/NavigationGuardProvider.tsx:86-101`

`blocked` が false→true になるたび `window.history.pushState`（センチネル）を積むが、true→false（保存・リバート・アンマウント）時の cleanup はリスナ解除のみで、積んだセンチネルは history に残る。

- 実害は小さい: `isDirty` は boolean 値なので、入力中（既に dirty）は effect 依存が変化せず追加のセンチネルは積まれない。蓄積は「dirty→クリーン→dirty」を繰り返した場合のみで、その回数だけ「戻る」が余分に必要になる程度。クラッシュではない。
- また guardedNavigate で離脱確定した場合も直前のセンチネルが 1 つ history に残り、遷移先で「戻る」を 1 回余分に要する。

改善案（任意）: センチネルを積んだ位置を ref で記録し cleanup 時に巻き戻す／もしくは「センチネルは常に高々 1 つ」を保証する。手動検証で back 挙動が実用上問題なければ現状のままでも可。

### [NICE-TO-HAVE] confirmLeave の resolver 上書きで先行 Promise が宙吊りになりうる
ファイル: `apps/web/components/navigation/NavigationGuardProvider.tsx:60-73, 89-98`

`confirmLeave` は毎回 `resolverRef.current` を上書きする。ダイアログ表示中（例: サイドナビクリックで `guardedNavigate` が resolve 待ち）に、モーダルを跨いでブラウザの戻るボタンが押されて `onPopState` → `confirmLeave` が再度呼ばれると、先の resolver が上書きされ `guardedNavigate` 内の `await confirmLeave()` が永久に解決されない（＝そのナビゲーションが黙って握り潰される）。

- fail-safe 側: 握り潰されても遷移しないだけでデータ損失はない。ConfirmDialog がモーダルオーバーレイなら pointer 操作は塞がれるため、発火は「ダイアログ表示中に物理戻るボタン」という狭いレース。
- 改善案（任意）: 既に `resolverRef.current` が存在する状態で `confirmLeave` が呼ばれたら、新規 Promise を作らず進行中の Promise を共有する。

### [NICE-TO-HAVE] InterviewForm の評価値が数値↔文字列コアーションで過剰 dirty 判定
ファイル: `apps/web/components/admin/InterviewForm.tsx:44-59, 145-148` / `apps/web/lib/forms/dirty.ts:6-22`

`baseline.evaluation` はサーバ由来の `Record<string, number>`（数値）だが、ユーザーが評価欄を編集すると `e.target.value`（文字列）が入る。`stableStringify` は型を区別するため `3`（baseline）と `"3"`（編集後）が別物と判定される。

- 結果: 評価値を一度触って元の数値に戻しても dirty 扱いになり、離脱時に確認ダイアログが出る。過剰ガード（fail-safe 側）でガード漏れではない。
- 他フォーム（Survey/User/Master/Question/Publication）は state を最初から文字列で統一保持しているため、この問題は InterviewForm の evaluation に固有。
- 改善案（任意）: 比較前に evaluation を submit payload と同じ正規化（数値コアーション・空除外）に通してから比較する。もしくは baseline も文字列表現で保持する。

### [NICE-TO-HAVE] AnswerForm の checkbox 配列は順序差で過剰 dirty 判定になりうる
ファイル: `apps/web/components/survey/AnswerForm.tsx:41-49` / `apps/web/lib/forms/dirty.ts:11-12`

`stableStringify` は配列順序を保持する（設計どおり）。checkbox トグル実装が選択肢定義順を維持していれば問題ないが、選択解除→再選択で挿入順が変わると集合として同一でも dirty 判定になる。

- fail-safe 側（過剰ガード）。checkbox 生成が `choices.map` の一定順を保つなら実害なし。
- 改善案（任意・必要時のみ）: multi-select 値に限り比較前ソートする。ただし「配列は順序保持」方針との一貫性を優先するなら現状維持でよい。

---

## 良かった点（設計として正しく効いている箇所）

- 成功時暴発の構造的回避: 成功パスはすべて plain `router.push` / `router.refresh`（ガード非経由）。`guardedNavigate` は cancel/ナビ導線のみ。`setBaseline`/`setInitialForm` の適用タイミングに関わらずダイアログが出ないことが保証される（`SurveyForm.tsx:114`, `UserForm.tsx:130`, `MasterForm.tsx:92`, `InterviewForm.tsx:81`, `AnswerForm.tsx:167`）。
- SSR 安全性: `useUnsavedGuard`（`useUnsavedGuard.ts:16-26`）・Provider の history 操作（`NavigationGuardProvider.tsx:86-101`）はすべて effect / イベントハンドラ内。`confirmLeave` 自体は window を触らない。ConfirmDialog は narrow import でバレル経由の副作用を回避。
- フック規約: `useUnsavedChangesGuard`（`useUnsavedChangesGuard.ts:11-19`）は `useId` ベースの安定 blocker id + 安定 callback 依存。`isDirty` は boolean なので入力中の再登録チャーンが起きない。
- dirty ヘルパの健全性: `isDirtyPayload` はキー順非依存・配列順保持・undefined/null 同一視。フォーム state を一貫して文字列保持することで submit payload の Number 化差が比較に混入しない（InterviewForm の evaluation を除く）。
- PublicationsEditor の暴発回避: 編集フォームは保存成功で `setEditingId(null)` によりアンマウント → `removeBlocker` で確実にガード解除（`PublicationsEditor.tsx:81-86`）。追加フォームは `setDraft(initial)` で dirty クリア（`PublicationsEditor.tsx:173`）。
- 配線網羅: シェルのナビ（AppSideNav / 下部タブ / ロゴ Link `onNavigate` / HeaderUserMenu の change-password・logout）が漏れなく `guardedNavigate`/`confirmLeave` へ移行。logout は「セッション破棄前に確認」の順序が正しい（`HeaderUserMenu.tsx:26-27`）。一覧行クリックが未ガードなのは dirty state を持たないため意図どおり。

---

## 検証

- 実装者報告: `pnpm turbo run typecheck lint build test` = 10/10 green（web test 71・うち dirty.test 9）。
- 本レビューはロジックの静的レビュー。対話挙動（サイドナビ離脱・戻る・暴発なし・beforeunload）は未検証で、Plan の手動検証項目で笹木さんが確認する前提。
- `dirty.test.ts` はキー順・ネスト・配列順・undefined/null を網羅。ただし上記 [NICE-TO-HAVE] の数値↔文字列コアーションケースのテストは未追加。追加を推奨（fail-safe 側なので BLOCKER ではない）。

## 残課題（後続タスク候補）

- ~~confirmLeave の多重呼び出し時に進行中 Promise を共有~~ → **対応済み**（`pendingRef` + popstate 確認中フラグ）。
- ~~パンくず「ホーム」の未ガード遷移~~ → **対応済み**（アプリ層でガード付き描画）。
- popstate センチネルが dirty トグル / guardedNavigate 確定後に history に残りうる（fail-safe = 戻るが余分に 1 回。多重 back のすり抜けは修正済み）。手動検証で back 挙動に問題があれば「センチネル高々 1 つ」保証を追加。
- InterviewForm evaluation の数値↔文字列コアーションによる過剰 dirty（fail-safe。元値に戻しても確認が出る）。比較前正規化 + テストは後続。
- multi-select（checkbox）順序差の扱い方針（現状は「配列は順序保持」で一貫）。
- Provider の confirm/registry レース（resolver 再利用）の jsdom 自動テスト追加（現状は手動検証委譲）。
