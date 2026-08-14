---
description: レビューのディスパッチャ。引数や現在の git 状態を見て /plan-review (計画レビュー) or /pr-review (コードレビュー) に振り分ける。Wanonwan は GitHub (`gh` を使う) で運用。
---

# /review コマンド (ディスパッチャ)

`/review` は **レビューのフロント** として、引数や現在の git 状態を見て
適切な専門レビューコマンドへ振り分けるディスパッチャ。実体のレビューは
`/plan-review` (計画レビュー)、`/pr-review` (Claude 視点コードレビュー) が
担当する。

## 振り分けロジック

| 引数 | 振り分け先 | 例 |
|---|---|---|
| `<数字>` | `/pr-review <数字>` | `/review 91` |
| `<file>.md` (`outputs/plans/` 配下) | `/plan-review <file>` | `/review outputs/plans/2026-05-22-1054-add-clean-scripts.md` |
| `plans/<slug>` | `/plan-review <slug>` | `/review plans/add-clean-scripts` |
| `plan <slug>` | `/plan-review <slug>` | `/review plan add-clean-scripts` |
| `pr <数字>` | `/pr-review <数字>` | `/review pr 91` |
| `--plan` / `--code` フラグ | 強制指定 | `/review --code` |
| 引数なし | **自動判別** (下記) | `/review` |

### 引数なしのときの自動判別

以下の順で評価し、最初に該当したものを使う:

1. **未 commit 差分がある** (`git status --short` が non-empty) →
   `/pr-review` (`--staged` + untracked を含めて見る)
2. **現在 branch が `develop` / `main` ではない && open PR が存在する** →
   `/pr-review <その PR 番号>` (`gh pr list` で取得)
3. **現在 branch が `develop` / `main` ではない && open PR は無い** →
   `/pr-review` (`git diff develop...HEAD` で見る)
4. **現在 branch が `develop` / `main`** → `outputs/plans/` から
   `mtime` 最新の Plan (`_template.md` を除く) を選んで `/plan-review`

自動判別の結果はユーザーに **必ず確認** してから走らせる:

```
> 現在 branch が feature/xxx で未 commit 差分が 3 ファイルあるので、
> `/pr-review` (未 commit 差分対象) を走らせます。よろしいですか? [Y/n]
```

明示的に振り分け先を指定したい場合は `--plan` / `--code` または直接
`/plan-review` / `/pr-review` を呼ぶ。

## Wanonwan 固有の前提

- **GitHub プロジェクト** (`sasakiyusuke2017015/wanonwan`)。
  PR 番号取得・差分取得は `gh` CLI を使う (**`gh pr list`** / **`gh pr diff <番号>`**)
- **`develop` ベース**。`main` への直接 PR は禁止
- レビュアー Agent 起動時は `.claude/rules/agent-orchestration.md` §4 の
  **プロンプトテンプレート**を必ず含める (現行スタック前提・スコープ制約)

## オーケストレーション

引数の判別後、対象が複雑だと判断したら **`/orchestrate` パターン**で
複数の専門 reviewer を **読み取り専用で並列起動** してよい。例:

- DB / 認可 / migration を含む実装 →
  `code-reviewer` + `security-reviewer` + `architect` を並列起動
- UI / a11y / Storybook を含む実装 →
  `code-reviewer` + `architect` を並列起動

ただし以下を守る:
- 並列起動するのは **読み取り専用 (Review 系) のみ**
  (`.claude/rules/agent-orchestration.md` §2)
- 結果統合は **メイン Claude が責任を持つ** (専任 orchestrator agent はない)
- 重複した指摘は 1 つに集約、矛盾した指摘は両論併記して笹木さんに判断を仰ぐ

## 出力

直接の出力は **振り分け先コマンドの出力**。Review ファイルが生成される
場合は `outputs/reviews/YYYY-MM-DD-HHMM-<slug>-review.md` (種別は計画 or
実装)。

## 使い分けの目安

| 状況 | コマンド |
|---|---|
| Plan を書き終わって計画段階の妥当性を見たい | `/plan-review` (or `/review plan <slug>`) |
| PR を出した後に Claude 視点でコードレビューしたい | `/pr-review <PR番号>` (or `/review <PR番号>`) |
| 未 commit の作業差分を見せたい | `/pr-review` (or `/review`) |
| どっちか分からない / どっちもあるかも | `/review` (ディスパッチャに任せる) |

## 関連

- `/plan-review` — Plan ファイル専用 (計画妥当性)
- `/pr-review` — 実装専用 (Claude 視点、コード品質・セキュリティ・運用)
- `/code-review` — 旧称。`/pr-review` の別名として残してよい
- `.claude/rules/plan-review-workflow.md` — 計画レビュー / コードレビューの
  2 段階モデル
- `.claude/rules/agent-orchestration.md` — レビュー収束ルール・並列起動制限
- `.claude/commands/orchestrate.md` — 並列実行パターン (Parallel Phase)

> 本ディスパッチャはプロジェクトスコープ (`.claude/commands/review.md`) で
> 定義されているため、Claude Code ビルトインの `/review` を上書きする。
> プロジェクト外の `/review` 呼び出し (個人 home 等) は影響を受けない。
