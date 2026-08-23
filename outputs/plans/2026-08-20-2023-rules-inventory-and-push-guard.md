# Plan: 発火しない rules の棚卸し + outputs 直 push ガードの機械化

| 項目 | 値 |
|---|---|
| 概要 | ハーネス育成の第 2 弾。実測で「参照ゼロ・実態と乖離」が確認された rules 4 本と tdd-workflow skill の他プロジェクト残骸を整理し、`outputs/**` 直 push 例外（現在は prose のみ）を CI + hook で機械化する |
| ステータス | ✅ 検証完了 |
| 前提 Plan | [claude-harness-cleanup](2026-08-15-1454-claude-harness-cleanup.md) |
| PR | [step 1](https://github.com/sasakiyusuke2017015/wanonwan/pull/131) / [step 2](https://github.com/sasakiyusuke2017015/wanonwan/pull/132) / [step 3](https://github.com/sasakiyusuke2017015/wanonwan/pull/133) / [step 4](https://github.com/sasakiyusuke2017015/wanonwan/pull/134) / [検証時の訂正](https://github.com/sasakiyusuke2017015/wanonwan/pull/138) |
| Review | [計画レビュー](../reviews/2026-08-20-2030-rules-inventory-and-push-guard-review.md) |

## 目的

前 Plan（ハーネス cleanup）で確立した 2 原則を、残った領域に適用する。

1. **発火しない記述は消す** — rules には固有語ゼロ・参照ゼロのファイルが 5 本（272 行）残っており、
   うち 3 本は実装に存在しない機構を「必須」と書いている（下記実測）
2. **prose より機械化** — `outputs/**` 直 push 例外は [git-workflow.md](../../.claude/rules/git-workflow.md)
   の散文でしか定義されておらず、「outputs 以外が混ざった commit を develop に直 push する」違反を
   誰も機械検知できない

## スコープ

### やること

- `.claude/rules/` の棚卸し候補 5 本の去就決着（performance / patterns / testing / security / coding-style）
- `.claude/skills/tdd-workflow/SKILL.md` の他プロジェクト由来の例示（31 行）を wanonwan ドメインへ書換
- `outputs/**` 直 push ガードの機械化:
  - `scripts/check-direct-push.mjs`（commit 範囲を引数に取りローカルテスト可能）
  - [ci.yml](../../.github/workflows/ci.yml) への配線（develop への push イベント時のみ）
  - PreToolUse hook（`git push` の事前ブロック。**新造 hook 第 1 号**、導入時点で settings.json に配線）
- 上記に伴う [CLAUDE.md](../../CLAUDE.md) / [hooks.md](../../.claude/rules/hooks.md) の記述更新
- **step 4（実装中に発見・追加）**: [auth-patterns.md](../../.claude/rules/auth-patterns.md) /
  [data-access.md](../../.claude/rules/data-access.md) の paths と本文の全面実態化

### やらないこと（スコープ外）

- `.claude/commands/` 21 本・`.claude/agents/` 9 本・`.claude/contexts/` 3 本の棚卸し（別軸のまま）
- 高固有語の rules（git-workflow / plan-review-workflow / evergreen / docs-style /
  agents / agent-orchestration / hooks）の変更（auth-patterns / data-access は当初ここに
  含めていたが、step 4 としてスコープ入り。判断ログ 2026-08-20 参照）
- レートリミット・カバレッジゲート等、**乖離が見つかった機構の実装**（docs を実態に合わせるのが本 Plan。
  機構を実装して docs に追いつかせるなら別 Plan）
- GitHub Rulesets の push 制限（Enterprise 向け機能の可能性が高い。CI + hook で足りる）

## 現状コンテキスト（2026-08-20 時点）

### 棚卸し候補の実測

判定基準は 3 問: **(a) 参照されているか (b) 実態と一致するか (c) モデルが指示なしでもやることか**。

| ファイル | 行数 | 参照 | 実態との乖離（コマンド実測） | 案 |
|---|---|---|---|---|
| [performance.md](../../.claude/rules/performance.md) | 35 | **ゼロ** | 輸入記事の残骸（ultrathink / "rev the engine" / build-error-resolver 誘導）。固有情報は「モデルは agents frontmatter が真実」の 1 点のみ。**`paths:` frontmatter が無く毎セッション常時読込**（35 行 × 全セッションのノイズ） | **削除**（1 点は [agents.md](../../.claude/rules/agents.md) へ 1 行移設） |
| [patterns.md](../../.claude/rules/patterns.md) | 65 | **ゼロ** | `interface ApiResponse` は **実装に存在しない**（`apps/web/src` grep 0 件）。Repository パターンは data-access.md に「集約済み」と自認。スケルトン節は輸入フロー | **削除** |
| [testing.md](../../.claude/rules/testing.md) | 44 | **ゼロ** | 「最低カバレッジ 80%（すべて必須）」だが **カバレッジゲートはどこにも実在しない**（vitest.config / turbo.json に coverage 設定なし） | **実態に書き直し**（実際のテスト実行コマンドと配置。paths: 条件読込は維持） |
| [security.md](../../.claude/rules/security.md) | 47 | 1（auth-patterns） | 「全エンドポイントにレートリミット」は過大。**実装は auth 系 3 エンドポイントのみ**（`lib/auth/rate-limit.ts`。～~当初「未実装」と誤測定 → 判断ログ 2026-08-20 訂正~） | **実態化**（実装済みの範囲を正確に記述） |
| [coding-style.md](../../.claude/rules/coding-style.md) | 81 | 2（pr-review / auth-patterns） | valibot 例は **実採用と一致**（apps/web + packages/storage の package.json で確認） | **存置** |
| [skills/tdd-workflow/SKILL.md](../../.claude/skills/tdd-workflow/SKILL.md) | 409 | commands/tdd.md | 31 行が他プロジェクトのドメイン（`searchMarkets` / `GET /api/markets` 等）。TDD 手順自体は本プロジェクトの実践と一致 | **例示のみ書換**（surveys / answers ドメインへ。構成は維持） |

> 教訓（前 Plan の valibot 件）: 「汎用に見える」だけでは削除根拠にならない。上記の案はすべて
> 実装側を grep した乖離実測に基づく。

### 直 push ガードの前提実測

- develop の履歴は **merge commit 方式**（Squash ではない）。PR 経由の commit は
  merge commit（committer `GitHub <noreply@github.com>`）の背後にぶら下がる
- **committer だけでは直 push を判定できない**: PR #130 の feature commit（41c0743）も
  committer はユーザー。誤検知する
- 正しい判定: `git rev-list --first-parent <before>..<after>` で develop の第一親系列だけを見る。
  この系列上の **親が 1 つの commit = 直 push** として検査する
- 親が 2 つ以上の commit は **committer が `noreply@github.com`（GitHub UI マージの署名）の
  ときだけ** PR マージとして検査対象外にする。**ユーザー committer の merge commit
  （ローカル `git merge` の直 push）は違反として報告**する — 親数だけで skip すると、
  ローカル merge 経由で PR を経ずに non-outputs を develop へ入れる経路が検知をすり抜ける
  （計画レビューで検出）。実測では develop の merge commit は全て GitHub committer
- 直 push commit の変更ファイルが `outputs/README.md` / `outputs/plans/**` / `outputs/reviews/**`
  のみであることを検査（[git-workflow.md](../../.claude/rules/git-workflow.md) の例外規定そのまま）

### hook 新造について

前 Plan は hooks 全削除で決着し、「本プロジェクト固有の hook 新造は別 Plan」とした。本 Plan がそれ。
[hooks.md](../../.claude/rules/hooks.md) の導入条件（Plan/Review 運用を止めない）は満たす:
このガードは `git push` コマンドのみ対象で、`outputs/**` への Write には一切触れない。
**未配線資産を再生産しないため、hook は導入 commit の時点で settings.json に配線する**。

## 実装計画

3 本は相互に独立。並行可能だが、既定の直列運用に従い順に出す。

1. **rules 棚卸し**（`refactor/rules-inventory`）
   - performance.md 削除（「model: は agents frontmatter が真実」を agents.md に 1 行移設）
   - patterns.md 削除
   - testing.md を実態に書き直し。**書くのは実在するコマンドのみ**（`pnpm turbo run test` /
     `pnpm test:db`、テストの配置）。**Playwright は playwright.config が実在しないため書かない**
     （E2E は未整備である旨を現在形で書く。80% ゲートと同型の嘘を再生産しない）
   - security.md を wanonwan の実機構（RLS 6 分類 / GoTrue / presigned URL / check-secrets.mjs）前提に書き直し、
     未実装機構への「必須」を除去
   - coding-style.md は変更なし
2. **tdd-workflow の例示書換**（`refactor/tdd-workflow-examples`）
   - `searchMarkets` 等 31 行を surveys / answers ドメインの例に置換。手順・構成・分量は維持
3. **outputs 直 push ガード**（`feature/outputs-push-guard`）
   - `scripts/check-direct-push.mjs`: 引数 `<before> <after>` の範囲を first-parent で走査。
     親 1 つの commit は diff が outputs 許可パス外を含めば違反、親 2 つ以上は committer が
     `noreply@github.com` のときのみ skip（ユーザー committer の merge は違反として報告）。
     違反は一覧を出して exit 1。`before` が全ゼロ（新規 ref）または祖先でない（force push）
     場合は検査をスキップして警告のみ
   - ci.yml: `if: github.event_name == 'push' && github.ref == 'refs/heads/develop'` のステップを追加し
     `github.event.before` / `github.event.after` を渡す（`fetch-depth: 0` が必要になる点に注意）
   - PreToolUse hook: 現在ブランチが develop かつ `git push` 実行時、`origin/develop..HEAD` に
     outputs 許可パス外の変更があれば block（メッセージで feature ブランチ + PR を案内）
   - [git-workflow.md](../../.claude/rules/git-workflow.md) の例外節と [hooks.md](../../.claude/rules/hooks.md) に
     機械化済みの旨を 1-2 行追記
4. **auth-patterns / data-access の全面実態化**（`refactor/rules-stale-paths`）
   - 両ファイルの paths: を実構造（`apps/web/app/**` / `apps/web/lib/**` / `packages/db/**`）に修正
   - auth-patterns.md 本文: 実在しない helper 4 つ（getSessionUser / requireSessionUser /
     requireActiveRoleApi / requireActiveRolePage）を、実在する認可機構（getCurrentClaims /
     forceChangeGuard / session.ts、「認可は API + RLS、画面ガードは表示のみ」の実パターン）に書換
   - data-access.md 本文: src 参照 12 箇所と packages/db の旧構造参照を実構造に突合して書換
   - **paths の修正と本文の書換は同一 commit で行う**（paths だけ直すと stale 本文が配信され始める）

## 検証

- **1**: 削除・書換後に残存参照ゼロ（`grep -rn "performance\.md\|patterns\.md" CLAUDE.md .claude/`）。
  testing / security の全記述が実在の機構・コマンドを指す（1 項目ずつ実行・grep で突合）
- **2**: `grep -ci 'market\|trading\|clickhouse' SKILL.md` = 0。`/tdd` からの参照が壊れていない
- **3-script**: 実履歴をフィクスチャにしたローカルテスト:
  - 範囲に outputs のみ直 push（例: `d1cf40d`）→ exit 0
  - 範囲に merge commit（例: `5ec06e0`）→ 検査対象外として exit 0
  - 範囲に outputs 外を含む直 push（履歴上に実例なし → テスト用にローカルで range を合成）→ exit 1
- **3-hook**: **新しいセッションで**（settings.json の hooks はセッション開始時に読み込まれるため、
  配線した同一セッションでは発火しない）develop 上に outputs 外を触るダミー commit を作り
  `git push --dry-run` → hook が block。outputs のみの commit → 通過。確認後 `git reset` で破棄
- **3-CI**: マージ後、次回の通常の outputs 直 push（ダッシュボード更新）が緑のまま = 正常系の実地確認。
  **違反系の実地確認は行わない**（develop の CI を意図的に赤くする必要があり、正常系 + ローカル/hook の
  検証で代替。判断ログ参照）
- **4**: 両ファイルが挙げる helper 名・パス・コマンドを 1 つずつ `grep -rn "export.*<名前>"` /
  `ls -d` で実在確認（**探索パス自体の実在を先に確認する**。今回の誤測定の再発防止）。
  paths: の全 glob に実ファイルがマッチすることを確認
- 共通: `pnpm turbo run typecheck lint build test`

## リスク

| リスク | 対応 |
|---|---|
| testing / security の書き直しが新たな「実態と乖離した記述」を生む | 書く内容を「実在するコマンド・実装済み機構」に限定し、検証 1 で 1 項目ずつ突合する |
| hook が正当な push（feature ブランチ等）を誤ブロック | 判定は「現在ブランチ = develop」のときのみ発動。他ブランチは素通し。`git push origin feature:develop` のような変則 push は hook では見逃すが、CI が事後検知する（多層防御） |
| force push や履歴改変で before..after が壊れ、CI ガードが誤爆 | before 全ゼロ / 非祖先はスキップ + 警告に落とす（fail しない）。develop への force push 自体が禁止運用 |
| `fetch-depth: 0` は PR の CI にも効き、全イベントで clone が重くなる | リポジトリ規模的に数秒で受容可。気になる場合はガードステップ内で `git fetch --deepen` する代替を実装時に選ぶ（push イベント時しか履歴を使わない） |
| hook の再導入が「未配線資産」の再発に見える | 導入 commit で settings.json 配線 + hooks.md 更新まで同時に行い、「存在するが繋がっていない」状態を経由しない |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-08-20 | 棚卸しの判定基準を「参照・実態一致・モデル既知」の 3 問とし、全候補で実装側を grep してから案を出した | 前 Plan で「汎用に見える」coding-style.md の valibot 例が実採用と一致していた。見た目の汎用性は削除根拠にならない |
| 2026-08-20 | ガードは CI（事後）+ hook（事前）の両方 | hook はローカルの Claude Code にしか効かず、CI は push 後にしか効かない。単独では穴が残る。hook 新造は前 Plan からの積み残しの消化でもある |
| 2026-08-20 | 直 push 判定は committer ではなく first-parent + 親数 | PR 経由の feature commit も committer はユーザーであることを実測確認（41c0743）。committer 判定は誤検知する |
| 2026-08-20 | CI ガードの違反系は実地確認しない | develop の CI を意図的に赤くする必要がある。スクリプトのローカルテスト（合成 range）+ hook の dry-run 確認で代替する |
| 2026-08-20 | testing.md は削除でなく書き直し | paths: 条件読込によりテストファイル編集時だけ載る枠は有用。嘘（80% ゲート）を消し、実在するコマンドだけ書けば評価枠 (b) を満たせる |
| 2026-08-20 | security.md は独立ファイルのまま実態化（auth-patterns への統合はしない） | auth-patterns からの参照が生きており、統合はリンク付け替えのコストが増えるだけで発火性は変わらない |
| 2026-08-20 | 計画レビューを受け、merge commit の skip 条件に committer 判定を追加 | 親数だけの判定では、ローカル `git merge` の直 push が PR マージと区別できず検知をすり抜ける。GitHub UI マージは committer が `noreply@github.com` になることを実測確認済み |

| 2026-08-20 | **実測の訂正**: security.md の「レートリミット未実装」は誤り。実装は auth 系 3 エンドポイント（login / refresh / change-password）に存在する | grep の探索先を rules の paths から流用した `apps/web/src/`（実在しない）にしており、静かに 0 件が返っていた。#131 に訂正 commit 済み。探索パスの実在確認を検証手順に明文化 |
| 2026-08-20 | step 4 を追加: auth-patterns / data-access の全面実態化（当初は「高固有語なので対象外」） | 両ファイルの paths が旧構造（apps/web/src / packages/db/sql）を指し条件読込が死んでいた。さらに auth-patterns の helper 4 つは repo に存在しない。固有語の多さは実態一致を保証しない。paths だけの修正は stale 本文の配信を始めるため、本文書換とセットで 1 PR にする |
| 2026-08-20 | step 2 のスコープを「例示 31 行」から「実態と矛盾する節を含む書換（構成は維持）」に拡大 | 着手時の精査で、Supabase / Redis / OpenAI の mock 節・jest 記法（実際は Vitest）・80% カバレッジ閾値・pre-commit hook 記述も実態と矛盾していると判明。例示だけ直しても嘘が残る |
| 2026-08-21 | security.md の訂正 commit は #131 マージ後の push だったため、step 4 の [#134](https://github.com/sasakiyusuke2017015/wanonwan/pull/134) で回収 | #131 には訂正が入らなかった。訂正済みの `security.md` を step 4 の実態化と同じ PR に含め、取り残しを解消した |
| 2026-08-23 | マージ後検証で testing.md の乖離を検出し [#138](https://github.com/sasakiyusuke2017015/wanonwan/pull/138) で訂正 | step 1 で書き直した testing.md 自身が `turbo run test` の対象に `packages/ui` を挙げていたが、`turbo run test --dry` の実測では web / worker / storage の 3 つ。ui はテスト 168 ファイルを持つが `test` script を置いていないため走らない。**「実在するコマンドだけ書く」方針で書いたファイルにも乖離が入りうる**ため、検証は grep ではなく実行で突合する必要がある |

## 未確定事項

- hook のブロック時メッセージに `pnpm check:merges` 等の関連導線をどこまで載せるか（軽微）

## ステータス

- [x] 計画確定（[計画レビュー](../reviews/2026-08-20-2030-rules-inventory-and-push-guard-review.md)）
- [x] 1. rules 棚卸し（[#131](https://github.com/sasakiyusuke2017015/wanonwan/pull/131) マージ済み。security.md の訂正はマージ後 push となったため step 4 の #134 で回収）
- [x] 2. tdd-workflow の例示書換（[#132](https://github.com/sasakiyusuke2017015/wanonwan/pull/132) マージ済み。スコープ拡大は判断ログ参照）
- [x] 3. outputs 直 push ガード（script + CI + hook）（[#133](https://github.com/sasakiyusuke2017015/wanonwan/pull/133) マージ済み）
- [x] 4. auth-patterns / data-access の全面実態化（[#134](https://github.com/sasakiyusuke2017015/wanonwan/pull/134) マージ済み。#131 マージ後 push の security.md 訂正も回収）
- [x] **マージ後検証**（2026-08-23 実施）
  - [x] 削除した rules への残存参照ゼロ（`git grep performance.md|patterns.md` は
        auth-patterns.md への部分一致のみ。両ファイルとも不在を確認。
        performance.md から agents.md への 1 行移設も存置を確認）
  - [x] testing / security の全記述が実在の機構を指す（security.md の
        レートリミット 3 エンドポイントは実装と一致。**testing.md は
        `turbo run test` の対象に packages/ui を挙げていたが `--dry` 実測では
        web / worker / storage の 3 つで乖離**。除外理由とともに訂正 →
        [#138](https://github.com/sasakiyusuke2017015/wanonwan/pull/138)）
  - [x] hook が develop 上の outputs 外 push を block し、feature ブランチの push を素通しする
        （同一の non-outputs commit で、develop = exit 2 でブロック・
        feature ブランチ = exit 0 で素通しを実測。push 以外の Bash も素通し）
  - [x] マージ後最初の outputs 直 push で CI ガードが緑（`d803e53` / `cdc35d8` の
        outputs のみ直 push が 2 回とも verify success）
