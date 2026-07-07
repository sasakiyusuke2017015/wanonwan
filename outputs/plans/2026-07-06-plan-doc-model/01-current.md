# Step 1: 現状整理（as-is）— 実データ検証版

> ⚠ この版は、初版（捏造混入）を**実コマンド検証で作り直した**もの。
> 各事実に「検証方法」を付す。憶測は書かない。初版の誤りは index 決定ログ D10 に記録。

## 検証済みの事実（コマンド付き）

| # | 事実 | 検証方法 |
|---|---|---|
| F1 | Plan は **27 個**、Review は **60 個** | `ls outputs/plans/*.md \| wc -l` / `ls outputs/reviews/*.md \| wc -l` |
| F2 | `outputs/plans/_template.md` と `outputs/reviews/_template.md` は **全ブランチに存在しない** | `git cat-file -e <branch>:outputs/plans/_template.md`（docs/plan-doc-model・develop・feature・main で「なし」） |
| F3 | しかし rules は両テンプレを参照（**宙吊り参照**） | `grep _template .claude/rules/plan-review-workflow.md` → L72, L89 |
| F4 | README は**大きな手管理ダッシュボード**。列 = ステータス / Plan / 概要 / 関連PR・レビュー / 推奨アクション。**概要は Plan ごとの手書き編集内容** | `sed -n '1,40p' outputs/README.md` |
| F5 | 実 Plan ヘッダの項目 = ステータス / slug / 作成 / 担当 / ブランチ / 関連 PR / レビュー / 親Plan / git repo | `sed -n '1,18p' …urgency-master.md` |
| F6 | urgency-list-display Plan は **develop に無い**（①ブランチのみ）。README にも無い | `ls outputs/plans/` に該当なし |

## 検証済みの重複（実在）

実 Plan（urgency-master）で確認した、同じ情報の多重記述:

| 情報 | 記述場所（実測） | 個数 |
|---|---|---|
| **ステータス** | Plan ヘッダ「ステータス」/ Plan 末尾「## ステータス」チェックリスト / README 行 | **3** |
| **PR 番号** | Plan ヘッダ「関連 PR」/ README 行（+ GitHub が実体） | 2+ |
| **レビュー verdict** | Plan ヘッダ「レビュー」/ Review ファイル / README 行 | 3 |
| **定型メタ**（担当 / git repo） | 全 Plan ヘッダに同一値 | 27× |

→ 「状態機械な情報（ステータス・PR・verdict）が手書きで複数箇所に複製されている」ことは**実在・検証済み**。

## drift について（正確に）

- urgency-master は Plan ヘッダ・Plan 末尾・README の3箇所とも **整合**（drift していない）。
- **マージ済み資産の中に、検証済みの drift 実例は今のところ見つかっていない。**
- したがって現状の問題は「drift が起きている」ではなく、
  **「状態機械な情報を手書き複製している構造 ＝ drift の危険を常に抱えている」** と述べるのが正確。
  （複製が増えるほど、更新漏れ1回で drift する。thinking-log C の一般原理。）

## 課題（検証済みに限定）

- **課題 F3（宙吊りテンプレ）**: rules が参照する `_template.md` / `reviews/_template.md` が存在しない。
  新規 Plan/Review 作成時に「基にせよ」と言われた雛形が無い。**実害あり・要修正**。
- **課題（状態の3重持ち）**: ステータスが Plan ヘッダ・Plan 末尾・README の3箇所。手書き同期で drift 危険。
- **課題（定型ノイズ）**: 担当 / git repo / slug が全 Plan で同一値。情報量ゼロ。
- **課題（README の性質）**: README は状態機械（ステータス・PR）と不変（編集的な概要）が**混在した手書き表**。
  状態列は生成向き、概要列は手書き維持が必要 → 「全自動生成」は単純には成立しない（Step 4 の R1 設計に影響）。

## この版が初版から訂正した点

- Plan/Review 数: 「12 / 11」→ **27 / 60**
- `_template.md`: 「plans 側は有る」→ **両方欠落**（初版の agent 訂正が誤りだった）
- drift 実例: 「urgency-list-display が3層 drift」→ **捏造。撤回**。実例は未確認、構造的危険として記述
- README: 「12行の簡素な表」→ **約20行・リッチな手書き概要を持つ大表**

## 確認事項

1. この検証済み現状で Step 1 を**再確定**してよいか
2. 「drift 実例は未確認、重複は実在・drift は構造的危険」という**正確な言い換え**を受け入れるか
3. README R1 は「状態列のみ生成・概要列は手書き保持」へ**設計修正**が必要（Step 4 差し戻し）— これを認識するか
