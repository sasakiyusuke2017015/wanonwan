# Review: .claude ハーネス層の未配線設定を片付ける + ダッシュボード drift 検知

| 項目 | 値 |
|---|---|
| 対象 Plan | [`plans/2026-08-15-1454-claude-harness-cleanup.md`](../plans/2026-08-15-1454-claude-harness-cleanup.md) |
| 種別 | 計画レビュー |
| 対象 | develop (1e9a198) 時点の `.claude/` / `scripts/` / `.github/workflows/ci.yml` |
| レビュアー | Claude Code |
| verdict | **APPROVE**（初回判定 NEEDS WORK → 対応後判定 APPROVE。下記「対応履歴」） |

## サマリ

Plan が挙げる実測値（allow 75 件 / hook 14 個 / `.sh` 4 本 186 行 / skills 11 本 / MCP 15 サーバ /
commands 21 本 / agents 9 本）はすべてコマンドで再現でき、現状把握に誤りはない。
問題の切り取り方（「動いていない」ではなく「配線した瞬間に運用と衝突する」）も妥当。

差し戻す理由は 2 点。**permission の 3 層構造が Plan にも検証にも入っていないため
step 1 の検証がそのままでは成立しない**こと、**step 2 と step 3 が Plan の主張と違って
独立ではない**こと。いずれも計画段階の修正で解消でき、方針そのものの変更は不要。

## 判定スコープ

| 軸 | 初回判定 | 対応後判定 |
|---|---|---|
| 最終判定 | NEEDS WORK | **APPROVE** |
| Plan 判定 | NEEDS WORK | **APPROVE** |
| 実装判定 | N/A | N/A |
| 記録整理 | FOLLOW-UP | **OK** |

## 対応履歴

初回判定 `NEEDS WORK` の BLOCKER 3 件と NICE-TO-HAVE 6 件は、
同日 Plan 側に反映済み。未確定事項 3 件も笹木さんの決裁を得て判断ログへ移動した。

| 決定事項 | 結論 | Review の推奨との一致 |
|---|---|---|
| hooks | 全削除 | 一致 |
| allow | **全削除**（恒常コマンドも残さない） | **不一致**。Review は「恒常コマンドは `*` 付きで残す」を推奨したが、笹木さんの判断で全削除。「何が必要かを推測ではなく実際の prompt 発生で確定させる」方針。prompt 増は step 1 の検証で頻度を記録して積み直す運用でカバーする |
| MCP | ディレクトリごと削除 | 一致 |
| step 4 の方式 | `--check` の新規実装（`git diff --exit-code` 方式は不採用） | Review は両論併記＋判断ログ要求。PowerShell 5.1 での手元再現性を理由に判断ログへ記載済み |

以下の Findings は初回判定時点の記録。すべて Plan に反映済み。

## Findings

### [BLOCKER] permission が 3 層でマージされることが Plan に無く、step 1 の検証が成立しない

Plan は `.claude/settings.json`（75 件）だけを対象にしているが、実際に効く allow は 3 層のマージ。

| 層 | ファイル | 実測 | git 管理 |
|---|---|---|---|
| project | [.claude/settings.json](../../.claude/settings.json) | allow 75 件 | 追跡 |
| local | `.claude/settings.local.json` | allow 1 件（`Bash(git pull *)`） | [.gitignore:17](../../.gitignore#L17) で除外 |
| user | `~/.claude/settings.json` | allow 11 件（`Bash(node -e ' *)` 等、別プロジェクト stamak の一回性コマンド多数）+ `additionalDirectories` | リポジトリ外 |

Plan の検証項目「掃除後のセッションで `git push` / `gh pr create` が確認を求められる」は、
project 層を掃除しても他 2 層に同等の許可が残っていれば **成立しない**。
今回の実測では 3 層とも `git push` / `gh pr` を持たないので結果的には通るが、
**「project 層を消した」ことと「prompt が出る」ことの因果が検証で担保されていない**のが問題。

**推奨修正:**

- 「やらないこと」に `settings.local.json` と `~/.claude/settings.json` は対象外（前者は
  .gitignore 済み・後者はリポジトリ外）と明記し、境界を確定する
- 検証手順を「3 層すべてに `git push` / `gh pr` が無いことを確認したうえで、
  実セッションで prompt が出ること」に書き換える
- あわせて現状コンテキストの表に上記 3 層を載せる（今の表は project 層だけを全体像として提示している）

### [BLOCKER] step 2（hooks 削除）と step 3（skills 整理）は独立ではない

Plan は「順に独立して出せる」（[:62](../plans/2026-08-15-1454-claude-harness-cleanup.md#L62)）
としているが、hooks と skills は実体で結合している。

1. [.claude/hooks/hooks.json:148](../../.claude/hooks/hooks.json#L148) の Stop hook が
   `./skills/continuous-learning/evaluate-session.sh` を呼んでいる。**hooks.json が skills を参照している**
2. 逆向きに、hook 経由でしか起動しない `.sh` が skills 配下に 2 本ある:
   - `.claude/skills/continuous-learning/evaluate-session.sh`（上記 Stop hook 専用）
   - `.claude/skills/strategic-compact/suggest-compact.sh`（PreToolUse hook から `./hooks/strategic-compact/suggest-compact.sh` として呼ばれる版と対）

つまり **step 2 で hooks を削除すると、step 3 の削除リストに載っていない
`continuous-learning` / `strategic-compact` の `.sh` が dead code になる**。
[evergreen.md](../../.claude/rules/evergreen.md) の「dead code を見つけたら削除する」に照らすと、
step 3 の対象は Plan が挙げる 5 本（`clickhouse-io` / `project-guidelines-example` +
rules 重複 3 本）では足りない。

**推奨修正:**

- 「1 と 4 は互いに無関係」は正しいが、**2 → 3 の順序依存を明記**する（2 を先に出し、3 で残骸を回収）
- step 3 の対象に「hook 削除で orphan になる `.sh`」を追加する。skill 本体（SKILL.md）を
  残すか消すかは、hook なしで意味を持つかで個別判断

### [BLOCKER] 「厳選して配線」案のコストが未評価のまま、削除案と対等に並んでいる

Plan は hooks を「削除 or 本プロジェクト用に配線」の二択として未確定事項に置いているが、
配線案のコストが見積もられていないため、この Review で決着させる材料が揃っていない。

現 `hooks.json` の matcher は式形式:

```
"matcher": "tool == \"Bash\" && tool_input.command matches \"(npm run dev|pnpm( run)? dev|...)\""
```

一方 settings.json に配線する hooks の matcher は、ツール名で絞って条件はスクリプト側に置く形式で、
**この式形式をそのまま移せる保証がない**。加えて command が `./hooks/...` / `./skills/...` の
相対パスで、解決起点がプロジェクトルートである保証もない。
つまり「配線」は設定の移動ではなく **14 個の書き直し** になる可能性が高い。

これは Plan 自身の「やらないこと」の 1 つ目
（**hooks を新規に設計して書き起こすこと**、[:33](../plans/2026-08-15-1454-claude-harness-cleanup.md#L33)）
に該当する。Plan のスコープ定義から論理的に **削除が導かれる**。

**推奨修正:** 未確定事項から外し、判断ログに「配線は書き直しでありスコープ外の定義に該当するため削除」
として移す。配線案を残すなら、先に matcher 形式の実地検証を Plan の step 0 として置く。

### [NICE-TO-HAVE] `--check` を新規実装せず、既存の「生成 + `git diff --exit-code`」パターンに揃えられる

[ci.yml:46-50](../../.github/workflows/ci.yml#L46-L50) の Snapshot drift check が既にこの形:

```yaml
- name: Snapshot drift check
  run: |
    pnpm db:snapshot
    git diff --exit-code -- packages/db/snapshot/schema.sql \
      || { echo "::error::snapshot が migrations と不一致。…"; exit 1; }
```

`outputs/README.md` も同じ「生成物」なので、`node scripts/gen-outputs-readme.mjs` →
`git diff --exit-code -- outputs/README.md` で **スクリプト変更ゼロ**で同じ検知ができる。
CI の 2 つの drift 検査が同型になる利点もある。

一方 `--check` には「手元で CI と同じ判定を再現できる」利点があり、
[docs-style.md](../../.claude/rules/docs-style.md) の PowerShell 制約下では
`git diff --exit-code` の `||` チェーンを手元で真似しにくいので、こちらにも理がある。

**推奨修正:** どちらでもよいが、**選んだ理由を判断ログに残す**。両案が存在することが
Plan に見えていないのが今の問題。

### [NICE-TO-HAVE] `gen-outputs-readme.mjs` の exit 1 が 2 つの意味を持つ

現状 Plan ヘッダ不備で `exit 1`（[:70-74](../../scripts/gen-outputs-readme.mjs#L70-L74)）。
`--check` を同じ `exit 1` で足すと、CI ログで「ヘッダ不備」と「README 未再生成」を区別できない。
Snapshot drift check に倣って `::error::` で対処法を出し分ける。

### [NICE-TO-HAVE] マージ後検証「意図的に 1 行ずらして確認」を develop でやると develop の CI が赤くなる

[ci.yml:3-8](../../.github/workflows/ci.yml#L3-L8) のトリガは
`pull_request: [develop, main]` **と** `push: [develop, main]`。
`outputs/**` は develop 直 push が許可されている（[git-workflow.md](../../.claude/rules/git-workflow.md)）ため、
drift 検知の動作確認を develop 上でやると develop の CI が赤くなる。

**推奨修正:** 検証項目を「step 4 の feature ブランチの PR 上で、わざと README を 1 行ずらした
commit を積んで CI が落ちることを確認 → 直して緑を確認」に変更する。develop を汚さない。

なお Plan がリスク表で挙げている非対称（直 push は事後検知）はこの変更後も残る。
それは意図どおりなので判断ログに残せば足りる。

### [NICE-TO-HAVE] `rules/hooks.md` の記述が現時点で事実と異なる

[.claude/rules/hooks.md:9](../../.claude/rules/hooks.md#L9) は
「## 現状の Hooks（`~/.claude/settings.json` に定義）」として 9 個の hook を列挙しているが、
実測した `~/.claude/settings.json` に `hooks` キーは存在しない（キーは
`permissions` / `agentPushNotifEnabled` / `model` / `switchModelsOnFlag` のみ）。

Plan の step 2 に hooks.md 更新は入っているが、**削除案を採った場合に hooks.md 自体を
消すのか「hooks は未使用」と書き換えるのかが未定**。hooks 種別の一般解説（PreToolUse /
PostToolUse / Stop）と TodoWrite の節が同居しているファイルなので、丸ごと削除は行き過ぎ。

**推奨修正:** step 2 に「hooks.md は『現状の Hooks』節のみ削除し、種別解説と
Auto-Accept / TodoWrite の節は残す」と粒度を書く。

### [NICE-TO-HAVE] `.claude/contexts/` の扱いがスコープ外リストに無い

「やらないこと」は commands 21 本 / agents 9 本 / CODEMAPS を挙げているが、
CLAUDE.md の `.claude 構成` 表に載っている `contexts/`（3 本）が対象内とも外とも書かれていない。
step 2 で CLAUDE.md の同表を触るので、そのとき判断を迫られる。一行足しておけば揉めない。

## 妥当性レビュー

- **目的**: 「配線した瞬間に壊れる状態の解消」は測定可能で、達成条件が明確。良い
- **現状把握**: 全数値をコマンドで再現確認。誤りなし。hooks 衝突 4 件も実物と一致
  （`.md` ブロック / tmux / `git push` の `read -r` / Prettier・tsc）
- **影響範囲**: DB / API / 認可 / migration / デプロイへの影響なしという暗黙の前提は正しい。
  CI への影響は step 4 のみで、Plan も把握している
- **抜け**: permission 3 層（BLOCKER 1）と hooks↔skills 結合（BLOCKER 2）。
  いずれも `.claude/` 内部の話で、Plan の視野が `.claude/settings.json` 単体に寄っていたのが原因
- **リスク表**: 4 件とも実在するリスクを正しく捉えている。特に「allow を削りすぎ」への
  「settings.json は可逆」という緩和は妥当

## 未確定事項への回答

Plan の 3 件について、この Review としての推奨。採否は笹木さんの決裁。

| 未確定事項 | 推奨 | 根拠 |
|---|---|---|
| hooks を削除するか配線するか | **削除** | 配線は 14 個の書き直しであり、Plan 自身の「やらないこと」に該当（BLOCKER 3）。Prettier / tsc は turbo + CI で既に担保。履歴は git log に残る |
| allow をどこまで残すか | **恒常コマンドは `*` 付きで残す**（全削除しない） | 全削除は prompt 増で作業が止まり、その場で足し直す＝再学習コストを払うだけ。`git push` / `gh pr` / `git commit` 系のみ確実に削除して rules と整合させる |
| `mcp-servers.json` を残すか消すか | **ファイルごと削除** | 15 サーバ全てが `YOUR_*_HERE` のテンプレート値で、動く設定が 1 つも無い。参照は [CLAUDE.md:84](../../CLAUDE.md#L84) の 1 行のみ。必要になれば公式ドキュメントから引ける |

## 過去事例からの教訓

- 「毎セッション投入されるものを削る」という同じ動機の先行 Plan が
  [docs-style.md:94](../../.claude/rules/docs-style.md#L94) から参照されているが、
  **リンク先 `outputs/plans/2026-05-22-1140-claude-md-slimming-and-rules-paths-scope.md` は実在しない**
  （`outputs/plans/` の最古は `2026-06-11-1730`）。ハーネス層の drift の実例そのものなので、
  本 Plan の step 2（docs 更新）に「docs-style.md の当該 dangling link を実在する根拠に貼り替えるか
  リンクを外す」を足すのが自然。教訓の参照自体はできなかった
- 直前の env フォールバック撤廃（PR #117）で「判定基準を CLAUDE.md に明文化してから削る」
  という進め方を採った。本 Plan の step 1 も同じく **「一回性は消す / 恒常は `*` で残す」を
  原則として先に固定**しており、同じ型に乗っている。原則をどこに書き残すか（CLAUDE.md か
  Plan の判断ログか）だけ決めておくとよい

## 検証（この Review 自体の）

- [x] 対象 Plan を全文 Read 済み
- [x] Plan の全実測値をコマンドで再現確認（allow 75 / hook 14 / `.sh` 4 本 186 行 /
      skills 11 / MCP 15 / commands 21 / agents 9）
- [x] permission 3 層（project / local / user）を実読
- [x] `hooks.json` の全 14 エントリを matcher + command 先頭で列挙し、衝突と skills 参照を確認
- [x] [ci.yml](../../.github/workflows/ci.yml) のトリガと verify job の全ステップを確認
- [x] 削除対象への外部参照を grep（`clickhouse` / `mcp-servers` / `project-guidelines-example`）
- [x] 撤回 Plan との被り確認（ハーネス層を扱う撤回 Plan は無し）
- [x] Plan / rules 内のファイル参照の実在確認（[docs-style.md:94](../../.claude/rules/docs-style.md#L94)
      に dangling link 1 件を発見）
- [ ] hooks の matcher 式形式が settings.json で受理されるかの実地検証（BLOCKER 3。
      削除案を採るなら不要）

## フォローアップ

すべて Plan（2026-08-15）へ反映済み。

- [x] BLOCKER 1: permission 3 層をスコープと検証に反映（現状コンテキストに専用表 + 検証の 1 番）
- [x] BLOCKER 2: step 2 → 3 の順序依存を明記し、step 3 の対象に orphan `.sh` を追加
- [x] BLOCKER 3: hooks の去就を判断ログへ移し、未確定事項の節を削除
- [x] NICE-TO-HAVE: `--check` を採る理由を判断ログに記載
- [x] NICE-TO-HAVE: マージ後検証を develop から step 4 の feature ブランチ PR 上に移動
- [x] NICE-TO-HAVE: hooks.md は「現状の Hooks」節のみ削除と粒度を明記、contexts/ をスコープ外に追加
- [x] NICE-TO-HAVE: `--check` の終了コードを `::error::` で出し分ける方針を step 4 に記載
- [x] NICE-TO-HAVE: [docs-style.md:94](../../.claude/rules/docs-style.md#L94) の dangling link 是正を step 2 に追加
