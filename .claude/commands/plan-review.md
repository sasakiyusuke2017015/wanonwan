---
description: 保存対象の Plan ファイル (outputs/plans/) を計画レビューする。スコープ/リスク/手順/判断ログの妥当性を確認し、Review ファイルを生成する。実装には踏み込まない。
---

# /plan-review コマンド

`/plan-review` は、`outputs/plans/YYYY-MM-DD-HHMM-<slug>.md` に保存された
Plan を **計画レビュー**するためのコマンド。実装の中身ではなく、**計画
そのものの妥当性**を判定する (`.claude/rules/plan-review-workflow.md` の
"計画レビュー" 段階に対応)。

## このコマンドで行うこと

1. 対象 Plan ファイルを Read する (引数で指定 or 直近の更新を自動選択)
2. Plan の必須要素 (目的・スコープ・現状コンテキスト・実装計画・検証・
   リスク・判断ログ・ステータス) が揃っているか確認する
3. Plan の **計画としての妥当性**を以下の観点でレビューする
   - 目的・スコープの曖昧さ
   - 抜けている影響範囲 (DB / API / 認可 / migration / CI / デプロイ)
   - 過小評価されているリスク
   - 検証手順が不足している箇所
   - 手順の順序や粒度
   - 判断ログに残すべき trade-off の見落とし
   - 過去の類似 Plan / 撤回された Plan からの教訓の活用
4. `[BLOCKER]` / `[NICE-TO-HAVE]` ラベルで指摘を分類する
5. Review ファイルを `outputs/reviews/YYYY-MM-DD-HHMM-<slug>-review.md`
   (種別: 計画) に保存する

## 使い方

```
/plan-review                                    # 直近更新の Plan を自動選択
/plan-review <slug>                             # slug で指定 (例: add-clean-scripts)
/plan-review outputs/plans/<file>.md            # フルパスで指定
/plan-review --latest                           # 直近更新の Plan を明示選択
```

引数なしの場合、`outputs/plans/` から `mtime` 最新の Plan (`_template.md`
を除く) を選ぶ。曖昧さを避けたい場合は slug かパスを渡す。

## 出力先

```text
outputs/reviews/YYYY-MM-DD-HHMM-<slug>-review.md
```

- `<slug>` は対象 Plan と同じ
- `YYYY-MM-DD-HHMM` は **Review 作成時刻** を JST で付ける
  (対象 Plan の HHMM とはズレてよい)
- メタテーブルの「レビュー種別」は **「計画」** とする
- フォーマットは `outputs/reviews/_template.md` を基準
- Review から対象 Plan へリンクする
- Review 作成後、対象 Plan の `レビュー` 欄に Review への相対リンクを
  追記する

## 計画レビュー観点

### 計画妥当性: BLOCKER 候補

- **目的が曖昧** で何を持って「達成」とするか測れない
- **対象/対象外の境界が抜けている** ため、後で「やる/やらない」で揉める
- **DB / API / 認可 / migration / CI / デプロイ** への影響が Plan に
  書かれていない (実装段階で発見すると手戻りが大きい)
- **既存 Plan / 撤回 Plan との重複・矛盾** が見落とされている
- **検証手順が空** または "動作確認する" レベルで具体性がない
- セキュリティ・データ整合性に関わる変更で **判断ログが空**

### 計画妥当性: NICE-TO-HAVE

- 手順の粒度が粗い / 細かすぎる
- リスク表に書ける trade-off が本文中に埋もれている
- 関連ファイル / 関連 Plan へのリンクが少ない
- 検証チェックボックスの順序

### 過去事例の参照

- `outputs/plans/` の過去 Plan で類似テーマがあれば、そこでの判断ログを
  引用して「同じ轍を踏んでいないか」確認する
- 撤回された Plan (例: `2026-05-21-0516-pgbouncer-tls-proxy`) の撤回理由
  と被っていないか確認する

## Review 出力フォーマット

Review ファイルは `outputs/reviews/_template.md` の構造に従い、以下を
含める。

```markdown
# Review: <作業名>

| 項目 | 値 |
|---|---|
| 作成日時 | YYYY-MM-DD HH:MM JST |
| レビュアー | Claude Code |
| 対象 Plan | [`plans/YYYY-MM-DD-HHMM-<slug>.md`](../plans/YYYY-MM-DD-HHMM-<slug>.md) |
| ブランチ | `<branch-name or TBD>` |
| 関連 PR | TBD |
| レビュー種別 | 計画 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE / NEEDS WORK / BLOCKED | この Review 全体として次工程へ進めるか |
| Plan 判定 | APPROVE / NEEDS WORK / BLOCKED | 計画・スコープ・リスク整理の妥当性 |
| 実装判定 | N/A | 本 Review では実装は見ない |
| 記録整理 | OK / FOLLOW-UP / N/A | Plan 本体の文書整合性 |

## 指摘事項

| 重大度 | Plan 内位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| BLOCKER / NICE-TO-HAVE | `## スコープ` 等 | <問題> | <修正案> |

## 妥当性レビュー

- <Plan は要件に合っているか>
- <スコープ・対象外の境界は明確か>
- <影響範囲の見落としは無いか>
- <類似 Plan / 撤回 Plan との重複は無いか>

## 過去事例からの教訓

- <類似 Plan からの引用と、その教訓が反映されているか>

## 検証 (この Review 自体の)

- [ ] 対象 Plan を全文 Read 済み
- [ ] 関連ファイル (実装対象、関連 Plan、関連 Rule) を grep 済み
- [ ] 撤回された Plan との被り確認済み

## フォローアップ

- [ ] <Plan 側に反映してほしい修正>
```

## 判定基準

`.claude/rules/plan-review-workflow.md` "Verdict semantics" に従う。

- `APPROVE`: `BLOCKER` 級の指摘なし、計画として実装に進めて良い状態
- `NEEDS WORK`: `BLOCKER` ではないが計画段階で詰めておくべき指摘あり
- `BLOCKED`: 計画段階で破綻している (目的が曖昧、影響範囲未把握など)

**実装の品質** (コード品質・テスト・セキュリティ脆弱性) は本コマンドの
スコープ外。実装後は `/pr-review` で別途レビューする。

## 関連

- `/pr-review` — 実装 (PR / branch 差分) のコードレビュー
- `/review` — 引数を見て計画 / コード / PR を振り分けるディスパッチャ
- `.claude/commands/plan.md` — `/plan` で Plan を作成する側
- `.claude/rules/plan-review-workflow.md` — 計画レビュー / コードレビューの
  2 段階モデル
- `.claude/rules/agent-orchestration.md` — レビュー収束ルール
