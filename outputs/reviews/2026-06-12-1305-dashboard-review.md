# コードレビュー: ダッシュボード画面（回答/面談データの集計表示）

- 対象ブランチ: `feature/dashboard`
- 対象差分: 未 commit のワーキングツリー（新規 2 ファイル + modified 2 ファイル）
- 対応 Plan: [outputs/plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md)
- レビュアー: Claude Code (code-reviewer)
- slug: `dashboard`

## レビュー対象ファイル

| ファイル | 種別 | 行数 |
|---|---|---|
| `apps/web/app/api/v1/dashboard/route.ts` | 新規 | 63 |
| `apps/web/app/dashboard/page.tsx` | 新規 | 130 |
| `apps/web/components/layout/navItems.ts` | 変更 | +1 |
| `packages/ui/package.json` | 変更 | +1 (RadarChart deep export) |

---

## 観点別の検証結果

### 1. 集計 SQL の正しさ + RLS スコープ（最重要）

- `count(*) filter (where status = N)` は各リテラル値で正しく分割。`status` は
  `int NOT NULL DEFAULT 100`（`60_answers.sql`）なので null 取りこぼしなし。100/200/400/900
  はドメイン `ANSWER_STATUSES` の全値と一致。**OK**
- `count(*) filter (where interview_at is not null)` = 面談実施数。`interview_at timestamptz`
  は nullable で、実施済みのみ非 null という想定と整合。**OK**
- `health_status is not null` + `group by health_status` は妥当。`health_status` は
  100-999 の nullable int で、未設定を除外して分布を出す意図と一致。`value: 100`（未判定）も
  集計対象に残るが、これは「未判定という状態の件数」として意味があり妥当。**OK**
- `avg((evaluation->>'key')::numeric)` は、`evaluation` が null の行 / 該当キー欠落行を
  `->>'key'` が null にし、`avg` が null を無視する（行を分母から除外する）標準挙動。
  全行 null なら結果も null → page 側で `hasEval=false` に落ちる。**OK**
- **RLS スコープ**: `withUser(claims.sub, ...)` が `sql.begin` で 1 トランザクションを張り、
  冒頭で `set_config('app.user_id', sub, is_local=true)` を実行。同一トランザクション内で
  集計 SQL が走るため `answers_select`（`is_admin() OR respondent_id=uid() OR
  interviewer_id=uid() OR is_answer_viewer(id)`）が効く。admin=全件、それ以外=自分のスライス。
  実機検証（admin total=3 / member total=1）とも一致。**集計に RLS が効いていることを確認。OK**
- SQL は全リテラルでユーザー入力の連結なし。**SQLi なし。OK**

### 2. postgres.js の戻り値変換

- `::int` キャストした列（total / status_* / interviewed / health.count）は postgres.js が
  number で返すが、`Number()` を二重にかけても無害。**OK**
- `avg(...)` は numeric → 文字列で返るため `num()` で `Number()` 変換。`null` は
  `v == null ? null` で温存し、page 側の `?? 0` / `hasEval` 分岐に正しく繋がる。**OK**
- 留意点（BLOCKER ではない）: `Number(s.total)` は `num()` を使わず直接 `Number()`。`::int` で
  必ず非 null なので実害なし。

### 3. ダッシュボードの計算ロジック

- `answered = d.total - (d.byStatus["100"] ?? 0)` = 総数 - 未回答。`?? 0` で欠落ガード。**OK**
- `rate(n)` は `d.total === 0 ? 0 : ...` でゼロ除算ガード済み。**OK**
- `statusMax` / `healthMax` は `Math.max(1, ...)` で max=0 時のゼロ除算を回避。Bar 内でも
  `max === 0 ? 0 : ...` の二重ガードあり。**OK**
- `byStatus` のキーは API 側が数値リテラル（100/200/...）で JSON 化 → JS では文字列キーになり、
  page 側は `String(s.value)` / `"100"` で文字列アクセス。整合。**OK**

### 4. RadarChart の使い方 / hydration

- `data` は `EVAL_ITEMS` から `{label, value}` を 5 点生成。RadarChart は `data.length < 3` で
  「データが不足しています」を返すが、5 点なので常に満たす。**OK**
- `maxValue=5`、評価 null は `?? 0` で 0 点化。`hasEval` で全 null 時は RadarChart 自体を
  描画せず「評価データがありません」に分岐。**OK**
- hydration: `page.tsx` は `"use client"`、データ依存描画は `isLoading` 早期 return の後のみ。
  `useTheme()` はクライアント hook で、SSR と CSR で同じ初期 loading 状態を返すため
  hydration mismatch は起きない。RadarChart も `'use client'`。**OK**

### 5. nav 項目の全ユーザー表示

- `{ id: "dashboard", ... }` を role ガードなしで全ユーザーに表示。集計は RLS で自分のスライスに
  絞られ、employee は自分の回答 1 件分だけを見る。情報漏洩はなく、設計意図と整合。**妥当**
- `iconName: "dashboard"` は `IconName` 型に含まれる（typecheck green が裏付け）。**OK**

### 6. 命名・evergreen

- 不要 import / dead code は見当たらない。`Bar` / `Stat` は局所コンポーネントとして妥当。
- API のレスポンス形式（401 `{ error: "unauthenticated" }` / `{ data: ... }`）は既存ルート
  （users / org / answers / surveys）と完全に一致。**規約遵守。OK**
- 冒頭 WHY コメント（RLS でスコープされる旨）は非自明な制約の説明として適切。evergreen 違反なし。

---

## 指摘

### [BLOCKER]

なし。

### [NICE-TO-HAVE]

- `[NICE-TO-HAVE]` API の `byStatus` キー型: 型注釈 `Record<string, number>` だが
  ソースは数値リテラルキー。実害はないが、page 側の `String(s.value)` アクセスと合わせて
  「キーは文字列で扱う」前提をどこかコメント 1 行にしておくと将来の混乱を避けられる。
  ファイル: `apps/web/app/dashboard/page.tsx:84`

- `[NICE-TO-HAVE]` `Number(s.total)` / `Number(s.interviewed)` は `num()` ヘルパを使わず直接
  `Number()`。`::int` 非 null 保証なので問題ないが、avg 群との一貫性で `num()` 経由に
  揃える選択肢もある（`null` にならない列なので必須ではない）。
  ファイル: `apps/web/app/api/v1/dashboard/route.ts:42-48`

- `[NICE-TO-HAVE]` 評価 null → 0 点化: RadarChart 上で「データなし」と「実際に 0 点」が
  視覚的に区別できない。現状は `hasEval` が全項目 null のときだけ非表示で、一部のみ null の
  ケースは 0 点として描かれる。後続の期間フィルタ実装時に「一部 null」表示方針を Plan の
  残課題として控えておくとよい（当 PR では BLOCKER ではない）。
  ファイル: `apps/web/app/dashboard/page.tsx:38`

これらは差し戻し理由にはならない。残したい項目は Plan の残課題に転記して後続タスク化する。

---

## 最終判定

- **実装判定: APPROVE**

[BLOCKER] なし。集計 SQL は count filter / interview_at / health group by / evaluation avg の
いずれも正しく、RLS スコープが集計に効くことを `withUser` のトランザクション設計と RLS ポリシー
（`answers_select`）の両面から確認。ゼロ除算・null フォールバック・hydration いずれも問題なし。
既存 API 規約・evergreen 方針にも適合。残った指摘は [NICE-TO-HAVE] のみ。

verdict: APPROVE
