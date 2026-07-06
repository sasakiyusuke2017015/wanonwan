# 管理一覧のフィルタ/ソート + StatisticPanel

> ステータス: 🟡 実装中（Phase 1+2 実装済み・全一覧対応完了 / PR レビュー待ち）
> 由来: [Status Dashboard「次セッションの起点」#2 見た目の磨き込み](../README.md) の「一覧のフィルタ/ソート + `StatisticPanel`」。

| 項目 | 値 |
|---|---|
| 概要 | 見た目磨き込み #2。AdminListTable に client-side 検索/ソート（`searchKeys`/`sortable`）を汎用追加 + 集計パネル。ロジックは純関数 `filterRows`/`sortRows`（unit test 7 件）。users/surveys/answers 全一覧に適用 + status 別集計を `StatisticList` で表示（StatisticPanel の pie は分析側に委ね軽量化） |
| 一次情報 | [AdminListTable](../../apps/web/components/admin/AdminListTable.tsx) / [InteractiveTable](../../packages/ui/core/organisms/InteractiveTable/InteractiveTable.tsx) / [StatisticPanel](../../packages/ui/core/organisms/StatisticPanel/StatisticPanel.tsx) / 一覧ページ `apps/web/app/(admin)/admin/{users,surveys,answers}/page.tsx` |
| 関連 Review | （未） |
| 関連 PR | （未） |

---

## 1. 目的 / 非目的

### 目的

管理一覧（users / surveys / answers）に次を足して一覧の使い勝手を上げる:

1. **検索フィルタ**: 一覧上部の検索ボックスで指定列を横断 client フィルタ。
2. **ソート**: 列を選んで昇順/降順に client ソート。
3. **集計 StatisticPanel**: 件数・ステータス内訳を一覧上部に表示（surveys/answers は status 別、users は総数）。

AdminListTable に汎用機能として足し、各ページは「どの列を検索/ソート対象にするか」「どの集計を出すか」を宣言するだけにする。

### 非目的

- **サーバ側のページネーション/ソート/検索**（当面データ量は小。client-side のみ。大規模化したら別途）。
- InteractiveTable 本体（`@ui-catalog`）の改修（sort 機能を organism に持たせるのは別スコープ。今回は wrapper 側で完結）。
- 一覧の列定義そのものの変更（既存 columns は維持）。

## 2. 現状コンテキスト（調査結果）

- [AdminListTable](../../apps/web/components/admin/AdminListTable.tsx) は `InteractiveTable` のテーマ適用ラッパ。`columns` + `data` を受けるだけで、**filter/sort/集計は無し**。`mounted` でテーマ hydration mismatch を回避済み。
- `InteractiveTable` の props に `searchColumn?: string | null`（単一列検索）はあるが、**sort 系 prop / header クリックは未公開**（`Column` 型にも `sortable` なし）。→ ソートは wrapper 側で data を並べ替えてから渡す。
- `StatisticPanel`（organism）/ `StatisticList`（molecule, `items: {label,value,labelColor}[]`）/ `StatisticItem`（atom）が存在。status 色マップ内蔵。
- 一覧ページは client component（`useQuery` で取得 → `columns`/`rows` を組んで AdminListTable へ）:
  - users: `code/name/email`（status 無し）
  - surveys: title/status（draft/active/closed）/...（[SURVEY_STATUSES](../../packages/domain/src/survey.ts)）
  - answers: 回答状況 status（[ANSWER_STATUSES](../../packages/domain/src/interview.ts)）

## 3. 実装ステップ

### Phase 1 — AdminListTable に search + sort を汎用追加 + users 適用

1. **純関数を切り出し** `apps/web/lib/table/filter-sort.ts`（テスト可能に）:
   - `filterRows<T>(rows, query, keys): T[]` — `keys` 列の文字列に query を部分一致（大小無視）。query 空なら素通し。
   - `sortRows<T>(rows, key, dir): T[]` — `key` で安定ソート（文字列は localeCompare、数値は数値比較）。`key` 無しなら原順。
   - unit test（filter: 一致/空クエリ/複数列、sort: asc/desc/数値/文字列/安定性）。
2. **AdminListTable に props 追加**（後方互換・全て任意）:
   - `searchKeys?: string[]` — 与えると検索ボックスを表示し client フィルタ。
   - `sortable?: { key: string; label: string }[]` — 与えるとソート UI（列選択 + 昇順/降順トグル）を表示し client ソート。
   - 内部 state（query / sortKey / sortDir）で `filterRows`→`sortRows` を適用した結果を InteractiveTable に渡す。空表示判定（emptyMessage）はフィルタ後件数で行う。
3. **users 一覧に適用**: `searchKeys={["code","name","email"]}`、`sortable=[{code},{name},{email}]`。
4. **users 集計**: 総件数（フィルタ後/全体）を `StatisticPanel`（or 軽量に `StatisticList`）で一覧上部に表示。

### Phase 2 — surveys / answers へ展開 + status 別 StatisticPanel

5. surveys / answers 一覧に search/sort を適用（タイトル・状態・日付など）。
6. **StatisticPanel（status 別）**: surveys は status（下書き/公開/終了）件数、answers は回答状況の件数を色付きで表示。集計はクライアントの取得データから算出（既存の `*_LABEL` / `STATUSES` 定義を流用）。

## 4. 検証

- `pnpm --filter @waoon/web test` green（filter-sort 純関数の unit test 追加）。
- `pnpm lint` / `pnpm -r typecheck` green。
- 手動（Docker 不要・コンポーネント目視できる範囲）: 検索で行が絞られる / ソートで並びが変わる / 集計値が件数と一致。
  - ※実データ取得まで通す確認は Docker 起動が要るため範囲外。純ロジックは unit test で担保。

## 5. リスクと緩和

| リスク | 影響 | 緩和 |
|---|---|---|
| InteractiveTable 内蔵 `searchColumn` と wrapper 検索の二重化 | 挙動の混乱 | wrapper 側に検索を一本化し、`searchColumn` は使わない（渡さない） |
| 仮想化テーブルで行数が動的に変わる（filter/sort 後） | 表示崩れ | data 差し替えのみで列定義は不変。InteractiveTable は data 変化に追従する前提（既存の loading 切替と同様） |
| hydration mismatch（検索 state を SSR と差異） | 警告 | 検索/ソート UI も AdminListTable 内（既に `mounted` パターン）。初期 query 空・初期ソートは安定既定 |
| StatisticPanel が users（status 無し）に過剰 | UI の冗長 | users は総数のみ（StatisticList 軽量表示）。status 別パネルは surveys/answers に限定 |
| 大量データで client ソート/フィルタが重い | 体感低下 | 当面データ量は小。非目的にサーバ side を明記。必要時に移行 |

## 6. 判断ログ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-06-18 | filter/sort は AdminListTable（wrapper）に client-side で実装。InteractiveTable は改修しない | sort が organism 未搭載。wrapper で data を並べ替えれば全一覧が恩恵を受け、ui-catalog の変更を避けられる |
| 2026-06-18 | ロジックは純関数（filterRows/sortRows）に分離して unit test | UI から切り離してテスト可能にする（Docker 不要で挙動を担保） |
| 2026-06-18 | StatisticPanel は status を持つ surveys/answers 中心、users は総数のみ | status 内訳が無い users に色付きパネルは過剰 |
| 2026-06-18 | サーバ side のページング/ソートは非目的 | 当面データ量小。先に UX を出し、必要時に移行 |
| 2026-06-18 | 集計は StatisticPanel（PieChart 同梱）ではなく軽量な `StatisticList` を採用 | 一覧ヘッダの集計は件数の素早い把握が目的。pie chart は分析ダッシュボード側で担う。一覧上部は dot + ラベル + 件数のコンパクト表示が適切 |

## 7. ステータス

- [x] Plan ドラフト完成（本ファイル）
- [x] 計画レビュー / 笹木さん承認（2026-06-18 承認）
- [x] Phase 1 実装（`filter-sort.ts` 純関数 + unit test 7 件 / AdminListTable に searchKeys・sortable 追加 / users 適用 + StatisticList 総数）。typecheck・lint・test green
- [x] Phase 2 実装（surveys/answers に search/sort 展開 + status 別集計を `StatisticList` で表示）
- [ ] コードレビュー
- [ ] PR マージ
- [ ] dashboard 見た目磨き込み #2 の該当項目を消し込み
