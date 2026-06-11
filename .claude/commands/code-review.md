# Code Review コマンド

`/code-review` は、未コミット差分または PR 対象差分を確認し、
品質・セキュリティ・保守性の観点で日本語レビューを作成するコマンド。
保存対象のレビューは `outputs/reviews/` に出力する。

> **新規利用者は `/pr-review` (実装コードレビュー専用) を推奨**。
> `/code-review` は別名として残しているが、新しい振り分けロジック
> (`/review` ディスパッチャ → `/plan-review` / `/pr-review`) に従う方が
> 計画レビューとの境界が明確になる。両者の出力は同形式。

## このコマンドで行うこと

1. `git diff --name-only HEAD` で変更ファイルを確認する
2. 対応する Plan がある場合は、同じ `<slug>` と Review 作成時刻の `YYYY-MM-DD-HHMM` で Review ファイルを作成する
3. 変更内容を読み、重大度順に指摘事項を整理する
4. 各 finding にファイル位置、問題内容、推奨修正を記載する
5. `CRITICAL` または `HIGH` がある場合は `BLOCKED` とする

## 出力先

保存対象の Review は、次の場所に日本語で出力する。

```text
outputs/reviews/YYYY-MM-DD-HHMM-<slug>-review.md
```

- `<slug>` は対応する Plan と同じものを使う
- `YYYY-MM-DD-HHMM` は Review 作成時刻を JST で付ける（対応 Plan の HHMM とはズレてよい）
- フォーマットは `outputs/reviews/_template.md` を基準にする
- Review から対応する Plan へリンクする
- Review 作成後、可能なら Plan 側の `レビュー` 欄も更新する

## 保存対象

以下のいずれかに当てはまる場合は、チャットだけでなく Review ファイルを作成する。

- 対応する保存済み Plan がある
- PR 作成前または PR レビュー中である
- DB / API / 認証 / 権限 / CI / デプロイに影響する変更がある
- セキュリティ、権限、データ整合性、migration に関わる変更がある
- ユーザーがレビュー出力の保存を求めている

軽微な修正で Plan がない場合は、ユーザーが明示しない限りチャット内レビューで完結してよい。

## レビュー観点

### セキュリティ: CRITICAL

- ハードコードされた認証情報、API key、token、password
- SQL injection の可能性
- XSS の可能性
- 入力バリデーション不足
- 脆弱な依存関係
- path traversal の可能性
- 認証・認可 bypass

### コード品質: HIGH

- 50 行を超える複雑な関数
- 800 行を超える肥大化したファイル
- ネストが深すぎる処理
- エラーハンドリング不足
- 不要な `console.log`
- 放置された `TODO` / `FIXME`
- 新規コードに対するテスト不足

### ベストプラクティス: MEDIUM

- 破壊的 mutation による副作用リスク
- public API の説明不足
- アクセシビリティ不足
- 変数名・関数名が曖昧
- magic number の説明不足
- 既存パターンから外れた実装

## Review 出力フォーマット

Review ファイルは、原則として以下の見出しを含める。

```markdown
# Review: <作業名>

| 項目 | 値 |
|---|---|
| 作成日時 | YYYY-MM-DD HH:MM JST |
| レビュアー | Claude Code |
| 対象 Plan | [`plans/YYYY-MM-DD-HHMM-<slug>.md`](../plans/YYYY-MM-DD-HHMM-<slug>.md) |
| ブランチ | `<branch-name or TBD>` |
| 関連 PR | TBD |
| レビュー種別 | Plan / 実装 / 再評価 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE / NEEDS WORK / BLOCKED | この Review 全体として次工程へ進めるか |
| Plan 判定 | APPROVE / NEEDS WORK / BLOCKED / N/A | 計画・スコープ・リスク整理の妥当性 |
| 実装判定 | APPROVE / NEEDS WORK / BLOCKED / N/A | コード・設定・テスト・運用手順の妥当性 |
| 記録整理 | OK / FOLLOW-UP / NEEDS WORK / N/A | Plan / Review / docs の古い記述や drift |

## 指摘事項

## Plan レビュー

## 実装レビュー

## 検証

## フォローアップ
```

## 判定基準

- `APPROVE`: `CRITICAL` / `HIGH` がなく、重大な未検証事項もない
- `NEEDS WORK`: 修正推奨の `MEDIUM` 以下、または検証不足が残っている
- `BLOCKED`: `CRITICAL` / `HIGH` がある、または安全に merge できない
- `記録整理 = FOLLOW-UP`: 実装安全性には影響しない Plan / docs の古い記述。最終判定は下げない。

過去の判定を残す場合は `初回判定` / `対応後判定` と明記し、現在の `最終判定` と混同させない。

セキュリティ脆弱性があるコードは承認しない。
