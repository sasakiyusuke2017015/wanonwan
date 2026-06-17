# Git ブランチ運用戦略 & 開発フロー

## 開発フロー（全体）

```
計画・設計           ブランチ作成        コーディング         コミット・プッシュ
キム + 笹木さん  →  Claude Code    →  Claude Code 実装   →  Claude Code
                                       キム 確認

      ↓
PR 作成            CI（自動）          コードレビュー       マージ・デプロイ
Claude Code    →  GitHub Actions →   笹木さん         →  笹木さんが Squash Merge
                  typecheck/build/     + Claude Code       → CD 自動実行
                  pgTAP                レビュー             → 本番確認（笹木さん）
```

**担当まとめ**

| フェーズ | 担当 |
|---|---|
| 計画・設計 | キム + 笹木さん |
| ブランチ作成・コーディング・コミット・PR 作成 | Claude Code（キムが確認） |
| CI | GitHub Actions（自動） |
| コードレビュー・マージ承認 | 笹木さん（+ Claude Code レビュー） |
| CD・本番確認 | 自動 + 笹木さん |

---

## Plan / Review 成果物

大きめの作業では、実装前後の判断を `outputs/` に残す。
詳細は `.claude/rules/plan-review-workflow.md` を参照。

| タイミング | 成果物 | 保存場所 |
|---|---|---|
| 実装前 | Plan output | `outputs/plans/YYYY-MM-DD-HHMM-<slug>.md` |
| PR 前 / レビュー時 | Review output | `outputs/reviews/YYYY-MM-DD-HHMM-<slug>-review.md` |

- Plan と Review は同じ `<slug>` で対応付ける（HHMM はズレてよい）。
- `/plan` と `/code-review` の出力本文は日本語で作成する。
- PR 本文には、保存した Plan / Review へのリンクを貼る。
- typo 修正など軽微な作業は保存不要。チャット内の Plan / Review で完結してよい。

---

## ブランチ戦略

3 層モデル（`feature/*` → `develop` → `main`）

```
feature/xxx  ──┐
feature/yyy  ──┤  Squash Merge → develop ──── Squash Merge → main
fix/zzz      ──┘                              （リリース時）
```

| ブランチ | 役割 | 保護 |
|---|---|---|
| `main` | 本番リリース済みコード | 直 push 禁止・PR 必須 |
| `develop` | 統合ブランチ（次リリース候補） | 直 push 禁止・PR 必須（**例外: `outputs/**` の直 push は許可**） |
| `feature/*` | 機能開発・バグ修正 | 自由 |

> **マージ先は常に `develop`**。`main` へは `develop` からのみマージする。

### `develop` 直 push 例外: `outputs/**`

`outputs/plans/**` / `outputs/reviews/**` / `outputs/README.md` の更新は
**develop に直 push してよい**。理由:

- Plan / Review / dashboard は **長期 document** で、merge 後も検証進捗・
  judgement log・ステータス昇格 (`🟢 マージ済み (検証中)` → `✅ 検証完了`) など、
  事実情報の反映だけで何度も更新される
- これらは **コード差分なしの cosmetic 更新** で、CI の typecheck/lint は
  PR トリガーで走らないため、PR を経由する価値が薄い
- 1 機能あたり 3〜4 本の docs-only PR を笹木さん承認に通すのは過剰

#### 例外の運用ルール

| 操作 | 直 push 可? |
|---|---|
| Plan のステータスチェックボックス更新 (`- [x]` 化) | ✅ |
| dashboard の `🟣` → `🟢` → `✅` 昇格 | ✅ |
| 判断ログ追記 (`判断ログ` 表に行追加) | ✅ |
| Review file 新規追加 / リンク追記 | ✅ |
| Plan の判定・スコープを実質変更する書き換え | ❌ PR 必須 |
| 別ファイル (`apps/**` `packages/**` `.claude/**` `docs/**` `infra/**` `CLAUDE.md`) との **同一 commit** での変更 | ❌ PR 必須 |

つまり「**outputs/** だけが変更ファイルの commit**」だけが直 push 対象。
他ファイルが混ざる場合は通常通り feature/* ブランチ + PR で出す。

#### Claude Code の挙動

Claude Code が `outputs/**` のみの commit を develop に直 push する場合も、
他の destructive 操作と同様に **明示確認は取る** (`.claude/rules/git-workflow.md`
の自律範囲ルールに従う)。直 push が「許可されている」=「無断で実行してよい」
ではない。

---

## ブランチ命名規則

| プレフィックス | 用途 | 例 |
|---|---|---|
| `feature/` | 新機能追加（搭載することは決まっている） | `feature/user-csv-export` |
| `fix/` | バグ修正 | `fix/login-timeout` |
| `docs/` | ドキュメント修正 | `docs/update-readme` |
| `experiment/` | 採用未定の試作・検証（spike）。搭載するか分からないもの | `experiment/mattermost-chat` |

- ケバブケース（小文字 + ハイフン）
- 1 ブランチ = 1 テーマ

### `experiment/` の扱い（採用未定のもの）

「**本採用するか決まっていない**」コードは `feature/` ではなく `experiment/` に置く。`feature/` は「搭載は決定済み、あとは実装と PR を通すだけ」のもの。判断がついていない試作・検証は名前で区別する。

- **develop / main には入れない**。`experiment/` は採用が決まるまで隔離したまま置く（feature ブランチは何日でも放置でき、develop に影響しない）。
- **退避 ≠ 採用**。消えないようにしたいだけなら branch を push（必要なら Draft PR）。push しても Draft PR でも develop には入らない。
- **決定ポイントを持つ**。腐る前に「採用 → `feature/` に rename or rebase して PR」か「不採用 → branch ごと破棄（`git log` / reflog に残る）」を決める。「いつか使うかも」を develop に置きっぱなしにしない（[evergreen.md](./evergreen.md)）。
- 採用が決まった時点で、コミット type は通常どおり `feat` / `fix` 等を使う（`experiment` という commit type は無い。あくまで**ブランチ名**の接頭辞）。

---

## コミットメッセージ規約

```
<type>: <内容（日本語 or 英語）>
```

| type | 用途 |
|---|---|
| `feat` | 新機能追加 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | フォーマット・空白等（動作に影響なし） |
| `refactor` | リファクタリング（機能追加・バグ修正なし） |

例:
```
feat: ユーザー CSV エクスポート機能を追加
fix: ログインタイムアウト時のエラーハンドリングを修正
docs: CLAUDE.md に起動手順を追記
```

---

## PR 規約

| 項目 | 内容 |
|---|---|
| **マージ先** | `develop`（`main` への直接 PR は禁止） |
| **マージ方式** | Squash Merge |
| **必須条件** | CI（typecheck / lint）通過 + 笹木さん承認 |
| **レビュアー** | 笹木さん（必須）+ Claude Code（補助） |
| **ブランチ削除** | マージ後に削除 |

### PR 作成手順

```powershell
# 1. main から最新の develop を取得
git switch develop && git pull

# 2. feature ブランチを作成
git switch -c feature/xxx

# 3. 実装 → コミット
git add <files>
git commit -m "feat: xxx"

# 4. develop に rebase してから push
git rebase develop
git push -u origin feature/xxx

# 5. GitHub で PR 作成（develop 向け）。gh CLI を使う場合:
gh pr create --base develop --title "feat: xxx" --reviewer sasakiyusuke2017015
```

### develop → main のマージ（リリース時）

```powershell
# develop が CI グリーン & 動作確認済みの状態で
# GitHub 上で develop → main の PR を作成し Squash Merge
```

---

## Claude Code の自律範囲（commit / push / PR は明示確認）

ユーザーがリアルタイムで追えない操作は、Claude Code が **明示確認なしに勝手に
実行しない**。

判定基準は「**VSCode のソース管理パネル (Source Control) でリアルタイムに
状態変化を追えるか**」。

- VSCode 左の **ソース管理パネル**は変更を `Staged Changes` / `Changes` に
  分け、ファイル横に `M` (modified) / `A` (added) / `U` (untracked) などの
  ラベルを出す。**ファイル編集と `git add` はここに即時反映される** ので、
  「何を変更したか / 何を stage したか」が一目で見える。
  → ここまでは **追えるので Claude Code が自律実行して構わない**。
- **`git commit` した瞬間、対象ファイルはソース管理パネルから消える**。
  「コミットされた」事実は分かるが、**どの単位で束ねたか / どんな message を
  付けたかは Bash 出力を読まないと追えない**。勝手に commit されると、
  「いつ何が締まったか」「どう束ねられたか」が後から確認しづらくなる。
  → **明示確認なしに commit しない**。
- **`git push` と `gh pr create` はワーキングツリーを変えない**。状態が
  変わるのはリモート (GitHub) 側だけで、ソース管理パネルには何も出ない。
  さらに他人 (笹木さん) に通知が飛ぶ shared state でもある。
  → **コマンドとして明示的に呼ばれたときだけ実行する**。

### 線引き

| 操作 | 自律実行 | 備考 |
|---|---|---|
| ファイル編集 | ✅ してよい | ソース管理パネルに `M` / `U` として即時表示 |
| `git add` | ✅ してよい | `Staged Changes` に移動するのが見える |
| `git commit` | ❌ **必ず確認** | パネルから消えるため後から追いにくい。message 案を見せて Yes/No を取る |
| `git push` | ❌ **必ず確認** | リモートに出た瞬間、パネルに出ない情報になる |
| `gh pr create` / GitHub PR 作成 | ❌ **必ず確認** | 笹木さんに通知が飛ぶ shared state |
| `git push --force` / `--force-with-lease` | ❌ **必ず確認** | 上書きリスクがあるので個別確認 |
| `git switch` / `git pull --ff-only` | ✅ してよい | ローカルかつ可逆。ただし未 push commit がある場合は下記参照 |
| `git branch -d` / `-D` | ❌ **必ず確認** | reflog で復元可だが事故りやすい |
| `git restore` / `git clean` | ❌ **必ず確認** | 不可逆 |

### 例外: 明示コマンドの中

ユーザーが `/cleanup` のような **整理目的の明示コマンド** を呼んだ場合、その
コマンドの仕様として push / PR をステップに含めて良い。ただしその中でも
個別アクションの実行前にはやはり確認を取る (= 「黙って一気にやる」のではなく
「ステップとして組み込まれている」状態)。

ユーザーが当該タスクのスコープで「push まで一気にやって」と明示した場合は
従う。その許可は当該タスクに限定され、次のタスクには引き継がない。

### 未 push commit を残したまま branch 切替しない

`git switch` で別ブランチに移る前に、現在ブランチの **未 push commit を
ユーザーに報告** する。`git fetch` の結果リモートの同名ブランチが merge 済み
だった場合は、**自動で先に進まずに停止して報告** する。

```
⚠ 注意: 現在ブランチ docs/xxx にローカル commit が N 個あります (未 push)。
   リモート origin/docs/xxx は既に develop に merge 済みです (#87)。
   このまま別ブランチに切り替えると、ローカル commit はこのブランチに
   置き去りになります。
   選択肢:
   (a) 別ブランチに wip commit として持ち出す
   (b) develop に rebase して新 PR を立てる
   (c) このまま切り替える (commit は元ブランチに残る)
```

**Why:** 同名のリモートブランチが merge 済みなのに気付かず、ローカルだけに
commit が浮いた状態で別ブランチに移動すると、その commit はどこにも push
されないまま忘れられる。「直したはずのコードが消えた」事故の典型例。

---

## CI（GitHub Actions）

- ファイル: `.github/workflows/ci.yml`（CD は `.github/workflows/cd.yml`）
- トリガー: `develop` / `main` への PR 作成・更新時 / push 時
- チェック内容:
  - `pnpm -r typecheck`（TypeScript 型チェック）
  - `pnpm --filter @waoon/web build`（web ビルド）
  - `pnpm test:db`（pgTAP / RLS。DB スタックを起動して実行）

CI が失敗したままのブランチはマージ不可。

---

## ブランチ切替時の作業退避

複数の feature ブランチを行き来する場合、未コミット変更の扱いには以下のルールを守る:

- **裸の `git stash` を使わない**。メッセージなし stash は数日で何だったか分からなくなり、`stash list` が増えるほど「直したはずの修正がどこかに消えた」事故の元になる。
- どうしても stash を使うなら **必ず `-m` でメッセージを付ける**:
  ```powershell
  git stash push -m "feature/xxx: API レスポンス型の修正途中"
  ```
- 推奨は **`wip:` commit + Draft PR**。作業途中でもブランチに commit してリモートに push し、GitHub で Draft PR を立ち上げる。ダッシュボードに「やりかけのタスク」が可視化されるので埋もれない。元のブランチに戻ったら `git reset HEAD~` で wip commit を剥がして作業継続できる。
- 並行作業が頻繁に必要なら **`git worktree`** を使い、別ディレクトリとしてブランチを物理的に分離する。VSCode を複数ウィンドウで開けるので、コンテナ / 依存関係 / TS Server の状態も分離できる:
  ```powershell
  git worktree add ../waoon-wip feature/xxx
  ```

エージェントを複数稼働させる場合のブランチ・PR 滞留制御は [`agent-orchestration.md`](./agent-orchestration.md#2-並列稼働の制限) も参照。

### リモート (GitHub) に push できないときはブランチを増やさない

GitHub が落ちている / ネットワーク不通で **push できない間は、新規ブランチを切らず 1 本に commit を積む**。テーマが違う作業が来ても push 復旧までは同じブランチでよい。

**Why:** push できない = ローカル commit がどこにも退避されない状態。この間にブランチを分けると未 push commit が複数ブランチに散らばり、「直したはずの修正が消えた」事故 (未 push commit の置き去り) を誘発する。退避先 (リモート) が無いうちは 1 ブランチにまとめておくのが最もロストしにくい。

- ブランチ名と中身のテーマがズレても気にしない (push 復旧時の整理で吸収する)
- **復旧後に整理する**: そのまま push して PR を出すか、正しい名前の feature ブランチ (develop 起点) を切って `git cherry-pick <sha> <sha>` で commit を移す。ローカル commit なので無劣化でやり直せる

---

## 日常的な rebase（develop との同期）

develop に他のマージが入った場合:

```powershell
git switch develop && git pull
git switch feature/xxx
git rebase develop
# 競合時: ファイルを修正 → git add → git rebase --continue
git push --force-with-lease
```

- `--force-with-lease`: 安全な force push（他者の変更を上書きしない）
