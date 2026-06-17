---
description: ローカル git 状態を対話的に棚卸しして整理し、develop ブランチのクリーンな状態に戻す。未コミット変更・stash・消えた修正・古いブランチ・worktree を 1 つずつ決着させる。
---

# Cleanup コマンド

`/cleanup` は「今どこに居て何をしてたか分からなくなった」「直したはずの
コードが戻っている」「マージ済みブランチが散らかっている」状況をリセットする
ためのコマンド。

ローカルの散らかり方を全部見せて、ユーザーに 1 つずつ判断してもらった上で
`develop` ブランチのクリーンな状態 (リモートと同一) に戻す。

## 前提

- マージ先ブランチは `develop` (`.claude/rules/git-workflow.md` 準拠)
- リモートは GitHub (`origin`)
- 裸の `git stash` は禁止 (消える事故の元なので新規には作らない)
- 「あとで決める」を許さない (放置が散らかりの元)

## ステップ

各ステップで状況を表示してユーザーに確認を取る。**確認なしに削除・破棄・push
は絶対にしない**。

### 1. 現在ブランチの素性チェック

以下を 1 まとめで表示する。

```bash
git status --short                              # 未コミット変更
git branch --show-current                       # 現在ブランチ
git log --oneline -5                            # 直近コミット
git rev-list --left-right --count develop...HEAD # develop との ahead/behind
git branch --merged develop | grep -v develop   # develop に merge 済みか判定用
```

報告する内容:

- 現在ブランチ名
- `develop` から ahead/behind それぞれ何コミットか
- そのブランチが `develop` に既に merge 済みか
- 未コミット変更があるか (あれば次ステップへ)

### 2. 未コミット変更の決着

`git status` で変更があるとき、`git diff` と `git diff --staged` を表示し、
ユーザーに以下のいずれかを選ばせる。

- (a) **取り込む** — commit してこのブランチに残す
  - そのまま続行する場合 commit message を提案して `git commit` する
- (b) **捨てる** — `git restore` / `git clean` で破棄する (要確認)
- (c) **別ブランチに wip 退避** — 新規ブランチを切って `wip:` commit し
  リモートに push する (後で `git switch` で拾える状態)
  - branch 名は `wip/<slug>-YYYYMMDD` のような形式を提案する

**stash は新規に作らない**。stash は中身を忘れる事故の元。退避するなら必ず
wip commit + push (リモートに残す) で行う。

未コミット変更が残ったまま次のステップには進まない。

### 3. stash list の棚卸し

```bash
git stash list
```

既存 stash がある場合、1 件ずつ以下を行う。

```bash
git stash show -p stash@{N}     # 中身を表示
git stash show stash@{N} --stat # 変更ファイルサマリ
```

ユーザーに選ばせる:

- (a) **新規ブランチに apply して退避** — `git stash branch wip/recovered-N stash@{N}`
  で別ブランチ化 → push して PR or 保留できる状態にする
- (b) **drop** — `git stash drop stash@{N}` (本当に消すか確認)

**「保留」は許可しない**。stash list に残し続けると今と同じ問題を再生する。

### 4. 消えた修正の捜索

「直したはずのコードが戻っている」の検出。以下を実行して報告する。

```bash
# 全ローカルブランチを列挙し、develop との diff があるブランチを抽出
git for-each-ref --format='%(refname:short)' refs/heads/ | while read b; do
  if [ "$b" != "develop" ]; then
    count=$(git rev-list --count develop..$b 2>/dev/null)
    if [ "$count" != "0" ] && [ -n "$count" ]; then
      echo "$b: $count commits ahead of develop"
    fi
  fi
done

# 直近 24 時間の reflog (stash drop / branch -D / reset --hard で消えた変更も追える)
git reflog --since="24 hours ago" --date=iso
```

報告内容:

- develop と diff のあるローカルブランチ一覧 (ahead commit 数つき)
- 直近 24h の reflog (HEAD 移動・reset・rebase・stash drop が見える)

ユーザーに「探してる修正がここに見えるか」を確認する。見つかった場合は
そのブランチに `git switch` する選択肢を提示。

### 5. ローカルブランチの棚卸し

以下のカテゴリに分類して列挙する。

```bash
# develop に merge 済み (Squash merge の場合は --merged だけだと拾えないので注意)
git branch --merged develop | grep -v -E '^\*|develop|main'

# リモートが消滅した追跡ブランチ
git fetch --prune
git branch -vv | grep ': gone]'

# develop と diff が無い (内容的に merge 済みと等価)
# ※ 上の merged 判定で漏れた Squash merge ブランチ向けに、cherry や
#   `git log develop..<br> --oneline` が空のものも列挙する
```

カテゴリごとに **一覧をまとめて表示** → ユーザーに「全部消す / 個別に選ぶ /
キャンセル」を選ばせる。

- 削除は `git branch -d <name>` (merged 判定が通るもの)
- merged でないが消したいものは `git branch -D <name>` で **個別に確認**
- リモート追跡が gone のものは `git branch -dr origin/<name>` で remote-tracking
  ref も掃除

PR 未作成のブランチ (未 push or push 済みだが PR なし) を見つけた場合は、
削除前に「これは PR にしますか？」と確認する。Yes なら push + `gh pr create`
で PR 作成手順を提示、No なら削除候補として扱う。

### 6. worktree の棚卸し

```bash
git worktree list
git worktree prune --dry-run
```

各 worktree について:

- パスが存在しないもの → `git worktree prune` で掃除
- パスは存在するが使ってないと判断したもの → ユーザー確認の上
  `git worktree remove <path>`
- main の worktree (リポジトリ本体) は対象外

worktree が 1 つだけ (本体のみ) なら、このステップはスキップして
「worktree なし」と報告する。

### 7. develop 復帰 & 同期

最後に develop に戻る。

```bash
git switch develop
git pull --ff-only
git status                  # クリーンであることを確認
git log --oneline -5        # 最新コミット
```

`git pull --ff-only` が失敗した場合 (develop に未 push commit がある等) は
**自動解決せずに停止** してユーザーに報告する。

### 8. 最終状態の報告

以下を簡潔にまとめて表示する。

```
✅ Cleanup 完了
- 現在ブランチ: develop (リモート origin/develop と同一)
- 未コミット変更: なし
- 残った stash: <件数>
- 削除したローカルブランチ: <一覧>
- 退避した wip ブランチ: <一覧>
- 残っている wip ブランチ: <一覧>
- 直近 reflog の興味深い操作: <あれば>
```

「退避した wip ブランチ」「残っている wip ブランチ」がある場合は、後で拾える
ように **branch 名と要約** をはっきり残す。

## やらないこと

- `git push --force` / `git reset --hard` を **ユーザー確認なしに** 実行しない
- 共有ブランチ (`develop` / `main`) を直接削除・force push しない
- stash を新規作成しない (上述)
- マージ済み判定が曖昧なブランチ (Squash merge で `--merged` に出てこない等)
  を `-D` で自動削除しない。**必ず個別確認**
- リモートブランチを削除しない (`git push origin --delete` は実行しない)

## 中断ルール

以下の状況になったら、自動的に進めずユーザーに判断を委ねる。

- `git pull --ff-only` が失敗
- merge conflict が発生
- 削除対象のブランチに **未 push の commit** がある (PR 未作成の可能性)
- reflog に予想外の `reset --hard` / `branch -D` の痕跡がある
- worktree のパスが存在するが、そこに未コミット変更がある

## 使うタイミング

- 「今どのブランチに居て何してたか分からない」状態になったとき
- 作業区切りで一度クリーンな状態に戻したいとき
- 「直したはずのコードが消えた」と感じたとき
- ローカルにブランチが溜まってきたとき
- PR を merge した直後、ローカルを整える時

## 関連ルール

- `.claude/rules/git-workflow.md` — ブランチ戦略・ブランチ切替時の作業退避
- `.claude/rules/agent-orchestration.md` — 並列稼働制限とブランチ滞留制御
