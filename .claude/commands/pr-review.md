---
description: PR または現在 branch の実装差分をコードレビューする。コード品質・セキュリティ・テスト・運用手順を確認し、Review ファイルを生成する。Plan の計画妥当性は対象外。
---

# /pr-review コマンド

`/pr-review` は、**実装 (PR or 未 commit 差分 or branch 差分)** を
コードレビューするためのコマンド。`.claude/rules/plan-review-workflow.md`
の "コードレビュー" 段階に対応する。Plan そのものの計画妥当性は
`/plan-review` が担当し、本コマンドはコードと運用手順だけを見る。

## このコマンドで行うこと

1. レビュー対象を決定する (引数で指定 or 自動判別)
   - PR 番号 → Gitea API + `tea pr diff` で取得
   - branch 名 → `git diff develop...<branch>` 等で取得
   - 引数なし → 現在 branch の未 commit 差分 + 直近 commit
2. 変更ファイルを Read し、関連する既存コード / Plan を参照する
3. 重大度順 (`CRITICAL` / `HIGH` / `MEDIUM` / `LOW`) で指摘を整理する
4. 各 finding にファイル位置 (`file:line`)、問題内容、推奨修正を記載する
5. `[BLOCKER]` / `[NICE-TO-HAVE]` ラベルで指摘を分類する
6. Review ファイルを `outputs/reviews/YYYY-MM-DD-HHMM-<slug>-review.md`
   (種別: コード) に保存する

## 使い方

```
/pr-review                                  # 現在 branch の差分 (vs develop)
/pr-review <PR番号>                         # 例: /pr-review 91
/pr-review HEAD                             # 直近 commit のみ
/pr-review HEAD~3..HEAD                     # 直近 3 commit
/pr-review <branch>                         # 指定 branch vs develop
/pr-review --staged                         # `git diff --staged` のみ
```

PR 番号指定時は Gitea (`http://<gitea-host>/`) を
叩く。`gh` ではなく `tea` または `curl` を使う (本プロジェクトは Gitea)。

## 出力先

```text
outputs/reviews/YYYY-MM-DD-HHMM-<slug>-review.md
```

- `<slug>` は対応する Plan (あれば) と同じものを使う
- 対応 Plan が無い場合は branch 名末尾を slug に使う
- `YYYY-MM-DD-HHMM` は **Review 作成時刻** を JST で付ける
- メタテーブルの「レビュー種別」は **「実装」** とする
- フォーマットは `outputs/reviews/_template.md` を基準
- 対応 Plan がある場合は Review から Plan へリンクし、Plan 側の
  `レビュー` 欄も更新する

## 保存対象

`/code-review` と同じ基準 (Plan ファイルがある / PR がある / DB・認証・
権限・migration が変わる / セキュリティ影響 / ユーザー指示)。
基準を満たさない軽微な差分はチャット内レビューで完結してよい。

## レビュー観点

### セキュリティ: CRITICAL

- ハードコードされた認証情報、API key、token、password
- SQL injection の可能性 (動的 SQL に未エスケープの値が入る)
- XSS の可能性 (`dangerouslySetInnerHTML` / sanitize 漏れ)
- 入力バリデーション不足 (zod スキーマ等が無い API 入口)
- 脆弱な依存関係
- path traversal の可能性
- 認証・認可 bypass (RLS / API 層のチェックが片方しかない等)

### コード品質: HIGH

- 50 行を超える複雑な関数
- 800 行を超える肥大化したファイル
- ネストが深すぎる処理
- エラーハンドリング不足
- 不要な `console.log` (`apps/web` は構造化ログ `withSpan` 等を使う)
- 放置された `TODO` / `FIXME`
- 新規コードに対するテスト不足

### ベストプラクティス: MEDIUM

- 破壊的 mutation による副作用リスク (`coding-style.md` 違反)
- public API の説明不足
- アクセシビリティ不足
- 変数名・関数名が曖昧
- magic number の説明不足
- 既存パターンから外れた実装

### 運用 / インフラ: 個別判定

- migration / DB schema 変更時の **既存データへの影響**
- compose 変更時の **既存 volume / named volume への影響**
- env 変数追加時の **stg / prod への伝達**
- nginx / proxy 変更時の **既存接続への影響** (CLAUDE.md 参照)

## スコープ外

- **Plan 自体の計画妥当性** → `/plan-review` を使う
- **目的・要件のレベル感** → 計画レビュー段階で詰める
- **アーキテクチャの基本方針** → `architect` agent / 計画レビューで扱う

実装段階で「これ Plan からおかしくないか」と気付いた場合は、コードでは
なく `[BLOCKER]` として「Plan に戻って判断ログを足してほしい」と書く。

## Review 出力フォーマット

```markdown
# Review: <作業名>

| 項目 | 値 |
|---|---|
| 作成日時 | YYYY-MM-DD HH:MM JST |
| レビュアー | Claude Code |
| 対象 Plan | [`plans/YYYY-MM-DD-HHMM-<slug>.md`](../plans/YYYY-MM-DD-HHMM-<slug>.md) |
| ブランチ | `<branch-name or PR-#>` |
| 関連 PR | #xx |
| レビュー種別 | 実装 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE / NEEDS WORK / BLOCKED | この Review 全体として次工程へ進めるか |
| Plan 判定 | N/A | 本 Review では Plan 妥当性は見ない |
| 実装判定 | APPROVE / NEEDS WORK / BLOCKED | コード・設定・テスト・運用手順の妥当性 |
| 記録整理 | OK / FOLLOW-UP / N/A | Plan / docs の drift |

## 指摘事項

| 重大度 | ファイル:行 | 指摘 | 推奨修正 |
|---|---|---|---|
| CRITICAL / HIGH / MEDIUM / LOW | `path/to/file.ts:42` | <問題> | <修正> |

## 実装レビュー

- <コードがシンプルで読めるか>
- <既存パターンに従っているか>
- <エラーハンドリング>
- <ログ / 構造化ログの整合性>
- <テストカバレッジ>

## 運用 / インフラ影響

- <migration の既存データ影響>
- <compose / volume / env への影響>

## 検証

- [ ] `pnpm typecheck` green
- [ ] `pnpm lint` green
- [ ] `pnpm test` green
- [ ] <該当機能の動作確認>

## フォローアップ

- [ ] <別 PR で対応する項目>
```

## 判定基準

- `APPROVE`: `CRITICAL` / `HIGH` がなく、重大な未検証事項もない
- `NEEDS WORK`: 修正推奨の `MEDIUM` 以下、または検証不足
- `BLOCKED`: `CRITICAL` / `HIGH` がある、または安全に merge できない
- `記録整理 = FOLLOW-UP`: 実装安全性には影響しない Plan / docs drift。
  最終判定は下げない

セキュリティ脆弱性があるコードは承認しない。

## 関連

- `/plan-review` — Plan ファイルの計画レビュー
- `/review` — 引数を見て計画 / コードを振り分けるディスパッチャ
- `/code-review` — 旧称。本コマンドの別名として残してよい
- `.claude/agents/code-reviewer.md` — 実装レビュー agent
- `.claude/agents/security-reviewer.md` — セキュリティ特化
- `.claude/rules/plan-review-workflow.md` — レビュー全体の workflow
