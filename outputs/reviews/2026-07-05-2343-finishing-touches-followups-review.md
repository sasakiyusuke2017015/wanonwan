# コードレビュー: 仕上げ フォローアップ（タイトル上書き / SurveyCard 期間ヘッダー / Input blur）

- 対象 Plan: [仕上げ（ページタイトル/公開一覧/ダーク/VRT）](../plans/2026-07-05-2015-finishing-touches.md)
- 対象ブランチ: `fix/finishing-touches-followups`（テーマ5 Phase 1/2 = #76/#77 merged のマージ後検証で発見した表示バグ 2 件 + 笹木さん報告の Input blur 例外の修正）
- レビュー種別: コードレビュー（ステージ済み差分 `git diff --cached`）
- レビュー方針: `[BLOCKER]` / `[NICE-TO-HAVE]`。現行スタック（Next 16 / React 19 / @ui-catalog/core）は所与。当該差分で変更していない既存コードの bad practice は対象外。

## 最終判定

| 軸 | 判定 | 補足 |
|---|---|---|
| 最終判定 | **APPROVE** | `[BLOCKER]` なし。`[NICE-TO-HAVE]` のみ |
| Plan 判定 | N/A | 計画レビューは [2040 review](2026-07-05-2040-finishing-touches-review.md) 済み。本件は Phase 1/2 マージ後の追随修正 |
| 実装判定 | APPROVE | 両修正とも根本原因に正しく対処。実機 + 10/10 green で確認済み |
| 記録整理 | OK | 既存 Plan / dashboard の実装安全性に影響する drift なし |

## 検証内容

- `git diff --cached` の全差分（4 ファイル、+17/-5）を精査。
- `useDocumentTitle` の呼び出し元を grep: `AppLayout.tsx:57`（`activeLabel`）、`login/page.tsx:130`、`change-password/page.tsx:14` の 3 箇所。login / change-password は BARE_PATHS で AppLayout 外のため、**同一ツリーで 2 つの hook が併存しない**ことを確認。
- `headerColor` の使用箇所を grep: アプリ本体は `surveys/page.tsx:107`（`colors.primaryBgColor` を渡す）1 箇所のみ + stories / test。契約変更の影響範囲は差分内で閉じている。
- `SurveyCard.module.scss` の `.header` を確認: `color: #fff` のみで `background` 定義なし。旧実装（`headerColor` を className 連結）ではカラー値がクラス名にならず背景が付かず、白地に白文字で不可視になっていた根本原因を確認。inline `backgroundColor` 方式で解消するのは妥当。

## Findings

### 修正 1: useDocumentTitle（MutationObserver 方式）

観点として依頼された「無限ループ / リーク / パフォーマンス / hook 競合」を個別に確認した。

- **無限ループなし（確認済み）**: `apply` は `document.title !== desired` のときだけ代入する。代入で `<title>` の text node が変化 → observer 再発火 → この時点で `document.title === desired` のため no-op で停止。1 回の余分なコールバックで収束する。
- **リークなし（確認済み）**: cleanup で `observer.disconnect()`。deps `[title]` 変更時も旧 observer を切って再購読するため多重購読にならない。
- **パフォーマンス許容（確認済み）**: `document.head` の subtree を監視するため、ストリーミング / クライアント遷移時の head への style/link 挿入ごとにコールバックが走るが、中身は文字列比較 1 回のみで実質無視できるコスト。title element が Next に一度 remove/再追加されるケースも `childList` で捕捉できるため、head を対象にするのは正しい選択。
- **hook 競合なし（現状）**: 上記のとおり AppLayout ツリー内に `useDocumentTitle` 呼び出しは AppLayout の 1 本のみ。login / change-password は AppLayout 外。よって「別々の desired を持つ 2 observer が互いを上書きし合う」状況は発生しない。

`[NICE-TO-HAVE]`（差し戻さない・後追い可）:

1. **将来の多重呼び出しは無限ループになり得る**: 仮に AppLayout 配下のページが個別に `useDocumentTitle("X")` を呼ぶと、AppLayout の observer（desired="…セクション名"）とページの observer（desired="X ｜ wanonwan"）が互いの書き込みに反応して延々と title を奪い合う（各 observer 単体は収束するが、2 者間では発散）。現状の設計（AppLayout 一括 + BARE_PATHS のみ個別）が崩れると顕在化する潜在リスク。コメントに「同一ツリーで併用しない」前提を一行残すか、AppLayout 側で `data-managed-title` 的な単一管理に寄せる将来対応を Plan の残課題に積むと安全。実装安全性には現状影響しないため後追いで可。

2. **観測スコープの注記**: `subtree: true` で head 全体を見る設計判断（title element の付け替えを捕捉するため）は妥当だが、その意図は既存コメントからは読み取りにくい。「title だけでなく head childList を見るのは Next が title element を差し替えるため」の一文があると次の読者が narrowing を試みて壊すのを防げる。

### 修正 2: SurveyCard headerColor 契約変更

- **契約変更が一貫している（確認済み）**: `headerColor` を「CSS クラス名」→「CSS カラー値」に変更し、`className` 連結（`${styles.header} ${headerColor}`）から inline `style={{ backgroundColor: headerColor }}` に変更。JSDoc（`SurveyCard.tsx:24`）も「CSS カラー値。テーマの primaryBgColor 等を渡す」と更新済みで、呼び出し元 `surveys/page.tsx:107` の `colors.primaryBgColor` と契約が一致。stories（`#2563eb` / `#6b7280`）と test（`#3b82f6`）も hex に追随済み。
- **他呼び出し元への波及なし（確認済み）**: grep 上、アプリ本体の呼び出しは surveys ページ 1 箇所のみ。破壊的変更の取りこぼしなし。

`[NICE-TO-HAVE]`（差し戻さない・後追い可）:

3. **回帰を守るテストがない**: `SurveyCard.test.tsx` は headerColor の描画結果（背景色が inline style に載ること）を assert していない。今回の「白地に白文字」バグはまさにこのテスト欠落で見逃されたクラスの不具合。ヘッダー要素に `style` の `backgroundColor` が反映されることを 1 ケース足すと、将来 className 方式に戻す等のリグレッションを検出できる。例:
   ```tsx
   it('headerColor が期間ヘッダーの背景色に反映される', () => {
     render(<SurveyCard {...defaultProps} headerColor="#3b82f6" />);
     const header = screen.getByText(/期間:/);
     expect(header).toHaveStyle({ backgroundColor: '#3b82f6' });
   });
   ```

### 修正 3: Input の blur で `type="email"` が InvalidStateError（追記・笹木さん実機報告）

ログイン画面のメール欄 blur で `setSelectionRange` が InvalidStateError（アイコンなし分岐の onBlur が type を問わず呼んでいた・テーマ4 由来）。

- **ガードの取りこぼしなし（確認済み）**: `setSelectionRange` を呼ぶのはアイコンなし分岐の 1 箇所のみで、そこを `SELECTABLE_TYPES.has(e.target.type)` でガード。
- **allowlist が仕様と一致（確認済み）**: `text/search/url/tel/password` は WHATWG の selection API 対応 type と一致。`e.target.type` は DOM 正規化済み小文字を返し、未知 type は `"text"` にフォールバックするため安全側。
- **意図の維持（確認済み）**: `scrollLeft = 0`（長い値の先頭巻き戻し）は例外を投げないため全 type で維持。
- **回帰テスト追加（確認済み）**: `type="email"` blur で例外にならず onBlur 発火。jsdom も同例外を投げるため修正前は確実に落ちる意味のあるテスト。

`[BLOCKER]` / `[NICE-TO-HAVE]` なし。

## 残課題（後続タスク）

初回指摘の NICE-TO-HAVE 3 件は同ブランチ内で対応済み:

- ~~NICE-TO-HAVE 1/2~~: `useDocumentTitle` に「同一ツリーで併用しない」前提と head subtree 監視の意図をコメント明記。
- ~~NICE-TO-HAVE 3~~: `SurveyCard` の headerColor 背景反映の回帰テストを追加（11 tests green）。

残課題なし。

## verdict

APPROVE
