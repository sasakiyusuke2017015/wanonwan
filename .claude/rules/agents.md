# Agent オーケストレーション

## 利用可能な Agent

`.claude/agents/` 配下:

| Agent | 目的 | 使うタイミング |
|-------|------|------|
| planner | 実装計画立案 | 複雑な機能・リファクタ |
| architect | システム設計 | アーキテクチャ判断 |
| tdd-guide | テスト駆動開発 | 新機能・バグ修正 |
| code-reviewer | コードレビュー | コードを書いた直後 |
| security-reviewer | セキュリティ分析 | コミット前 |
| build-error-resolver | ビルドエラー修正 | ビルド失敗時 |
| e2e-runner | E2E テスト | クリティカルなユーザーフロー |
| refactor-cleaner | dead code 削除 | コードメンテナンス |
| doc-updater | ドキュメント更新 | docs を更新するとき |

## モデル選択

各 agent が使うモデルは `.claude/agents/*.md` frontmatter の `model:` を単一の真実とする。
モデル名・ティア比較表を rules に複製しない（モデル世代の更新のたびに陳腐化するため）。

## 即座に Agent を使う場面

ユーザー指示なしで自動的に使う:
1. 複雑な機能要求 → **planner** Agent
2. 書いた / 修正した直後のコード → **code-reviewer** Agent
3. バグ修正・新機能 → **tdd-guide** Agent
4. アーキテクチャ判断 → **architect** Agent

## 並列 Task 実行

**既定は直列**。1 タスク = 1 ブランチ = 1 PR を回し切ってから次に進む。複数の編集系 Agent を同時稼働させて並列に PR を投げる運用は、明示許可とスコープ宣言があるときだけ許可する。詳細・例外条件は [`agent-orchestration.md`](./agent-orchestration.md#2-並列稼働の制限) を参照。

**例外:** 読み取り専用の `Explore` / `general-purpose` による調査・検索タスクは副作用がないので並列起動して構わない（むしろ推奨）:

```markdown
# OK: 読み取り専用の並列調査
3 つの Explore Agent を並列起動:
1. Agent 1: auth 周りの実装場所を grep
2. Agent 2: キャッシュ層のファイル構成を調査
3. Agent 3: utils.ts の呼び出し元を列挙

# NG: 編集 / コミット系の並列稼働 (明示許可とスコープ宣言なしの場合)
3 つの実装 Agent を並列起動して同時に PR を出す
```

## 複数視点での分析

複雑な問題には、役割分担した sub-agent を使う:
- 事実確認レビュアー
- シニアエンジニア
- セキュリティ専門家
- 一貫性レビュアー
- 冗長性チェッカー

これらを並列で動かしてよいのは **すべて読み取り専用（Review 系）** の場合に限る。実装系 Agent を含むなら [`agent-orchestration.md`](./agent-orchestration.md#2-並列稼働の制限) の条件を満たすこと。

## レビュアー Agent の運用

`code-reviewer` / `security-reviewer` 等のレビュアー Agent を起動するときは、指摘トリアージ（`[BLOCKER]` / `[NICE-TO-HAVE]`）、スコープ制約、verdict の明示など、レビュー往復を収束させるための共通ルールがある。詳細とプロンプトテンプレートは [`agent-orchestration.md`](./agent-orchestration.md#1-レビュー収束ルール) を参照。

### レビューコマンドの使い分け

レビュー系のコマンドは 3 つ。引数を見て自動振り分けする `/review` をフロントに、専門コマンドを 2 つに分けている。

| コマンド | 対象 | 段階 (`plan-review-workflow.md` の) |
|---|---|---|
| `/review` | 引数で自動振り分け (PR 番号 / Plan ファイル / 未 commit 差分) | dispatcher |
| `/plan-review` | `outputs/plans/` 配下の Plan ファイル | **計画レビュー** |
| `/pr-review` | PR or branch 差分 or 未 commit 差分 (Claude 視点) | **コードレビュー** |
| `/code-review` | `/pr-review` の旧称・別名 | コードレビュー |

`/orchestrate` の "Parallel Phase" パターンと組み合わせて、`code-reviewer` + `security-reviewer` + `architect` を並列起動するのは `/pr-review` の中から行う。専任 orchestrator agent は存在しないので、メイン Claude が振り分け + 結果統合の責任を持つ。
