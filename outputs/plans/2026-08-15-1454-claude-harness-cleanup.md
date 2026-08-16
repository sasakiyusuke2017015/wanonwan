# Plan: .claude ハーネス層の未配線設定を片付ける + ダッシュボード drift 検知

| 項目 | 値 |
|---|---|
| 概要 | `.claude/` に「存在するが繋がっていない設定」（settings.json の allow 75 件・未配線 hooks 14 個・無関係 skills / MCP テンプレ）が溜まっており、配線した瞬間に運用と衝突する状態を解消する。あわせて `gen-outputs-readme.mjs --check` を CI に足し、ダッシュボードの drift を機械検知にする |
| ステータス | 🟢 マージ済み（検証中） |
| 前提 Plan | なし |
| PR | [step 1](https://github.com/sasakiyusuke2017015/waoon/pull/126) / [step 2](https://github.com/sasakiyusuke2017015/waoon/pull/127) / [step 3](https://github.com/sasakiyusuke2017015/waoon/pull/128) / [step 4](https://github.com/sasakiyusuke2017015/waoon/pull/129) |
| Review | [計画レビュー](../reviews/2026-08-15-1500-claude-harness-cleanup-review.md) |

## 目的

`.claude/` の設定資産を「今このリポジトリで実際に効いているもの」だけに揃える。

現状の危険は「動いていない」ことではなく、**未配線の設定が本プロジェクトの運用と
矛盾したまま存在していること**。誰かが配線した瞬間に壊れる（例: `.md` 作成をブロックする
hook は `outputs/plans/**` 運用を止める）。[evergreen.md](../../.claude/rules/evergreen.md) を
`.claude/` 自身にも適用する。

## スコープ

### やること

- [.claude/settings.json](../../.claude/settings.json) の `permissions.allow` を**全削除**
- [.claude/hooks/](../../.claude/hooks/)（`hooks.json` + `*/*.sh`）の**全削除**
- `.claude/skills/` のうち本プロジェクトに無関係・rules と重複するもの、および
  hooks 削除で orphan になる `.sh` の削除
- `.claude/mcp-configs/`（`mcp-servers.json`）の**ファイルごと削除**
- [scripts/gen-outputs-readme.mjs](../../scripts/gen-outputs-readme.mjs) に `--check` を追加し、
  CI の verify job に配線
- 上記に合わせた [CLAUDE.md](../../CLAUDE.md) の `.claude 構成` 表、
  [rules/hooks.md](../../.claude/rules/hooks.md)、[rules/docs-style.md](../../.claude/rules/docs-style.md) の更新

### やらないこと（スコープ外）

- **hooks を新規に設計して書き起こすこと**。本 Plan は「今ある未配線の資産の去就を決める」まで。
  本プロジェクト固有の hook を新造するなら別 Plan（例: outputs 直 push ガード、console.log 監査）
- **`.claude/settings.local.json`**（[.gitignore:17](../../.gitignore#L17) で除外済み・個人設定）と
  **`~/.claude/settings.json`**（リポジトリ外のユーザ設定）。どちらも本リポジトリの管理対象外。
  ただし step 1 の検証では**実際に効く 3 層のマージ結果**を確認する（下記「検証」）
- `.claude/commands/` 21 本 / `.claude/agents/` 9 本 / `.claude/contexts/` 3 本の棚卸し
  （別軸。今回は settings / hooks / skills / MCP のみ）
- `docs/CODEMAPS` の新設（[update-codemaps](../../.claude/commands/update-codemaps.md) が参照する実体が無い問題は別 Plan）
- 並列エージェント / workflows（グラフ層）の導入
- 長期メモリ運用の整備

## 現状コンテキスト（2026-08-15 時点）

| 対象 | 実測値 | 問題 |
|---|---|---|
| [.claude/settings.json](../../.claude/settings.json) | `permissions.allow` **75 件**、他のキーは無し（hooks 設定なし） | 大半が過去セッションの一回性コマンド（`Bash(unzip -l 1on1-main.zip)` / `Bash(cp -r claude-setting/.claude .claude)` / 特定 SHA の grep / commit message 完全一致など）。**`Bash(git push *)` と `Bash(gh pr *)` が許可されており、[git-workflow.md](../../.claude/rules/git-workflow.md) の「push / PR 作成は必ず明示確認」と矛盾する** |
| [.claude/hooks/hooks.json](../../.claude/hooks/hooks.json) | hook **14 個**（PreToolUse 5 / PostToolUse 4 / Stop 3 / PreCompact 1 / SessionStart 1）+ `.sh` 4 本（186 行） | settings.json に未配線。中身は別プロジェクト由来で、配線すると本プロジェクトと衝突する（下記「hooks の衝突内訳」）。さらに [hooks.json:148](../../.claude/hooks/hooks.json#L148) が `./skills/continuous-learning/evaluate-session.sh` を参照しており、skills と結合している |
| [.claude/skills/](../../.claude/skills/) | **11 本** | `clickhouse-io`（ClickHouse 不使用）/ `project-guidelines-example`（テンプレの例そのもの）が無関係。`coding-standards` / `backend-patterns` / `frontend-patterns` は [rules/](../../.claude/rules/) と内容が重複。`continuous-learning/evaluate-session.sh` と `strategic-compact/suggest-compact.sh` は **hook 経由でしか起動しない** |
| [.claude/mcp-configs/mcp-servers.json](../../.claude/mcp-configs/mcp-servers.json) | **15 サーバ**（github / supabase / vercel / railway / cloudflare×4 / clickhouse / firecrawl / memory / sequential-thinking / context7 / magic / filesystem） | 全て `YOUR_*_HERE` のテンプレート値で、動く設定が 1 つも無い。supabase / vercel / railway / cloudflare / clickhouse は本プロジェクトの採用スタック（Docker + 自前 Postgres + GoTrue + MinIO）に無関係 |
| [rules/hooks.md](../../.claude/rules/hooks.md) | 「## 現状の Hooks（`~/.claude/settings.json` に定義）」として 9 個を列挙 | **事実と異なる**。`~/.claude/settings.json` に `hooks` キーは存在しない |
| [rules/docs-style.md:94](../../.claude/rules/docs-style.md#L94) | `plans/2026-05-22-1140-claude-md-slimming-and-rules-paths-scope.md` へのリンク | **リンク先が実在しない**（`outputs/plans/` の最古は `2026-06-11-1730`） |
| [scripts/gen-outputs-readme.mjs](../../scripts/gen-outputs-readme.mjs) | `--stdout` あり（[:12](../../scripts/gen-outputs-readme.mjs#L12)）。Plan ヘッダ不備なら `exit 1`（[:70-74](../../scripts/gen-outputs-readme.mjs#L70-L74)） | `--check`（生成物が最新かの検証）が無く、README 再生成忘れを検知できない |
| [.github/workflows/ci.yml](../../.github/workflows/ci.yml) | トリガは `pull_request: [develop, main]` **と** `push: [develop, main]`。verify job で `turbo run typecheck lint build test` → snapshot drift → DB スタック → pgTAP | ドキュメント生成物の drift 検査は snapshot（`packages/db/snapshot/schema.sql`）だけ |

### permission は 3 層でマージされる

実際に効く allow は次の 3 層のマージ結果。本 Plan が変更するのは project 層のみ。

| 層 | ファイル | 実測（2026-08-15） | 本 Plan の対象 |
|---|---|---|---|
| project | `.claude/settings.json` | allow **75 件** | ✅ 全削除する |
| local | `.claude/settings.local.json` | allow 1 件（`Bash(git pull *)`） | ❌ .gitignore 済み・個人設定 |
| user | `~/.claude/settings.json` | allow 11 件（別プロジェクト由来の一回性コマンド中心）+ `additionalDirectories` | ❌ リポジトリ外 |

現時点では 3 層のいずれにも `git push` / `gh pr` / `git commit` は無い（project 層の 2 件を消せば
マージ結果からも消える）。この前提は実装時に再確認する。

### hooks の衝突内訳（配線すると壊れるもの）

| hook | 衝突 |
|---|---|
| `.md` / `.txt` の Write をブロック（README / CLAUDE / AGENTS / CONTRIBUTING 以外） | **`outputs/plans/**` `outputs/reviews/**` `docs/**` が書けなくなる**。Plan/Review 運用が停止する |
| dev サーバの tmux 外実行をブロック / tmux 推奨 | 第一級環境が **Windows + PowerShell 5.1**（[docs-style.md](../../.claude/rules/docs-style.md)）なので前提が成立しない |
| `git push` 前に `read -r` で入力待ち | 非対話セッションでハングする。エディタを開く行はコメントアウト済みで実質無効 |
| PostToolUse の Prettier / tsc | 有用な候補だが、turbo + CI で既に担保されている |
| 全体 | matcher が `tool == "Bash" && tool_input.command matches "..."` の式形式で、settings.json が受け取る形式と異なる。command も `./hooks/...` の相対パス。**配線 = 14 個の書き直し** |

## 実装計画

1 と 4 は互いに独立。**2 → 3 は順序依存**（2 の hooks 削除で orphan になる `.sh` を 3 で回収する）。

1. **settings.json の allow 全削除**（`refactor/claude-settings-allowlist`）
   - `permissions.allow` を空配列にする（ファイル自体は残し、今後の追加先を確保）
   - 消える許可のうち `Bash(git push *)` / `Bash(gh pr *)` は、
     [git-workflow.md](../../.claude/rules/git-workflow.md) の「push / PR 作成は必ず明示確認」と
     矛盾していたもの。**削除が rules との整合につながる**
2. **hooks の全削除**（`refactor/claude-hooks-decision`）
   - `.claude/hooks/hooks.json` と `.claude/hooks/*/`（`.sh` 4 本）を削除
   - [CLAUDE.md](../../CLAUDE.md) の `.claude 構成` 表から `hooks/` 行を削除
   - [rules/hooks.md](../../.claude/rules/hooks.md) は **「現状の Hooks」節のみ削除**。
     hook 種別の一般解説（PreToolUse / PostToolUse / Stop）、Auto-Accept、TodoWrite の節は残す
   - [rules/docs-style.md:94](../../.claude/rules/docs-style.md#L94) の dangling link を
     実在する根拠に貼り替えるか、リンクを外す
3. **skills / MCP テンプレの整理**（`refactor/claude-skills-mcp`）— **2 の後**
   - `clickhouse-io` / `project-guidelines-example` を削除
   - rules と重複する `coding-standards` / `backend-patterns` / `frontend-patterns` を統合 or 削除
   - **2 で orphan になった `.sh` を回収**:
     `continuous-learning/evaluate-session.sh`（Stop hook 専用）、
     `strategic-compact/suggest-compact.sh`（PreToolUse hook 専用）。
     SKILL.md 本体を残すかは、hook 無しで意味を持つかで個別判断
   - `.claude/mcp-configs/` をディレクトリごと削除し、[CLAUDE.md:84](../../CLAUDE.md#L84) の行も削除
4. **`gen-outputs-readme --check` + CI 配線**（`feature/outputs-readme-check`）
   - `--check`: 生成結果と `outputs/README.md` を突合し、差分があれば diff を出して終了コードを返す
   - 既存の「Plan ヘッダ不備 → `exit 1`」と区別できるよう、
     [ci.yml](../../.github/workflows/ci.yml) の Snapshot drift check に倣って
     `::error::` で対処法（`node scripts/gen-outputs-readme.mjs` を実行してコミット）を出す
   - `ci.yml` の verify job、Snapshot drift check の隣に 1 ステップ追加

## 検証

- **1**: `.claude/settings.json` / `.claude/settings.local.json` / `~/.claude/settings.json` の
  **3 層すべて**に `git push` / `gh pr` / `git commit` の allow が無いことを確認したうえで、
  実セッションで `git push` が **確認を求められる**こと。あわせて `pnpm` / `docker compose` /
  `git switch` で prompt が出る頻度を記録する（次セッションで足し戻す判断材料にする）
- **2**: `.claude/hooks/` 不在で通常セッションが動く。`outputs/plans/xxx.md` の Write が
  ブロックされない（現在も未配線なので回帰確認）
- **3**: 削除した skill / MCP を参照している箇所が無い
  （`grep -rn "clickhouse-io\|mcp-servers\|mcp-configs\|project-guidelines-example" CLAUDE.md .claude docs`）
- **4**: Plan ヘッダを 1 行変えて `node scripts/gen-outputs-readme.mjs --check` が **非ゼロ終了**、
  再生成後に **exit 0**。CI 上の確認は **step 4 の feature ブランチの PR で行う**
  （わざと README をずらした commit を積んで CI が落ちる → 直して緑を確認）。
  `ci.yml` は `push: [develop, main]` にも反応するため、develop 上で試すと develop の CI が赤くなる
- 共通: `pnpm turbo run typecheck lint build test`

## リスク

| リスク | 対応 |
|---|---|
| allow 全削除で permission prompt が急増し、作業が止まる | 想定内のコスト（判断ログ参照）。step 1 の検証で prompt の頻度を記録し、**恒常的に効くものだけを次セッション以降に `*` 付きで積み直す**。settings.json は可逆 |
| hooks を消すと「いつか使う」資産を失う | `git log` に残る（[evergreen.md](../../.claude/rules/evergreen.md) の「必要になった時点で拾える」）。別プロジェクト由来なので原本も残っている |
| 2 と 3 を別 PR にすると、間の期間だけ orphan `.sh` が残る | 順序を 2 → 3 に固定し、3 を間を置かず出す。気になるなら 2 と 3 を 1 PR にまとめてよい |
| `--check` を CI に足すと、Plan だけ更新して README 再生成を忘れた PR が落ちる | それが目的。ただし **`outputs/**` の develop 直 push は PR を経ないため事後検知になる**（push トリガの CI で落ちる）。この非対称は許容する |
| skills 削除が他プロジェクトの `.claude` 設定と乖離する | 本リポジトリは wanonwan 固有に寄せる方針（CLAUDE.md の注記どおり）。汎用テンプレは元プロジェクト側が持つ |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-08-15 | ハーネス層の掃除を、ループ機械化（`--check`）やグラフ層（workflows）より**先**に置く | 未配線の設定は「配線した瞬間に壊れる」時限爆弾。特に `.md` ブロック hook は Plan/Review 運用を止める。土台を直してから上に積む |
| 2026-08-15 | hooks は**削除を既定案**とし、書き直しは別 Plan に切る | 「今ある資産の去就決着」と「本プロジェクト用 hook の設計」は別の作業。混ぜると Plan が肥大化し、削除だけでも得られる安全性が遅れる |
| 2026-08-15 | 計画レビューを受け、hooks は**全削除で確定** | matcher が式形式・command が相対パスのため、配線は 14 個の書き直しになる。これは本 Plan の「やらないこと」1 つ目（hooks を新規に設計して書き起こす）に該当する。Prettier / tsc は turbo + CI で既に担保 |
| 2026-08-15 | allow は**全削除**で確定（恒常コマンドを残す案は不採用） | 「何が本当に必要か」を残存リストの推測ではなく、実際の prompt 発生で確定させる。prompt 増は一時的なコストとして受け入れ、step 1 の検証で頻度を記録して積み直す |
| 2026-08-15 | `mcp-servers.json` は**ディレクトリごと削除**で確定 | 15 サーバ全てが `YOUR_*_HERE` のテンプレート値で、動く設定が 1 つも無い。GitHub 操作は `gh` CLI で足りており、MCP を使う具体的用途が無い。必要になれば公式ドキュメントから引ける |
| 2026-08-15 | step 4 は `git diff --exit-code` 方式ではなく **`--check` の新規実装**を採る | 既存の Snapshot drift check（生成 + `git diff --exit-code`）と同型にする案もあったが、`--check` は手元で CI と同じ判定を単一コマンドで再現できる。[docs-style.md](../../.claude/rules/docs-style.md) のとおり第一級環境が PowerShell 5.1 で、`||` チェーンを手元で真似しにくい |
| 2026-08-15 | 計画レビューで step 2 → 3 の順序依存が判明し、「順に独立して出せる」を撤回 | [hooks.json:148](../../.claude/hooks/hooks.json#L148) が skills 配下のスクリプトを参照しており、hooks 削除で `.sh` 2 本が dead code になる |

## ステータス

- [x] 計画確定（[計画レビュー](../reviews/2026-08-15-1500-claude-harness-cleanup-review.md)）
- [x] 1. settings.json の allow 全削除（[#126](https://github.com/sasakiyusuke2017015/waoon/pull/126) マージ済み）
- [x] 2. hooks の全削除 + docs 更新（[#127](https://github.com/sasakiyusuke2017015/waoon/pull/127) マージ済み）
- [x] 3. skills / MCP テンプレの整理（2 の後）（[#128](https://github.com/sasakiyusuke2017015/waoon/pull/128) マージ済み）
- [x] 4. `gen-outputs-readme --check` + CI 配線（[#129](https://github.com/sasakiyusuke2017015/waoon/pull/129) マージ済み）
- [ ] マージ後検証
  - [x] 2026-08-16 permission 3 層（project / local / user）に `git push` / `gh pr` / `git commit` の allow が
        無いことをコマンドで確認。本セッションの push / PR 作成はすべて明示確認を経て実行した
  - [x] 2026-08-16 `outputs/plans/**` `outputs/reviews/**` への Write が本セッション中に多数成功
  - [x] 2026-08-16 削除した skill / MCP への参照を `CLAUDE.md` `.claude/` `docs/` `.github/` `scripts/` で
        grep → 0 件
  - [x] 2026-08-16 [#129](https://github.com/sasakiyusuke2017015/waoon/pull/129) 上で実測。README を手編集した
        commit で `Dashboard drift check` が `exit 2` + `::error::` 付きで fail（1m17s、DB スタック前）、
        再生成した次の commit で pass（2m40s）
  - [ ] allow 全削除後に頻出した prompt を記録し、積み直す対象を決めた
        （本セッションは Bash が自動承認される設定で走っており prompt が観測できなかった。
        通常の対話セッションで改めて計測する）
