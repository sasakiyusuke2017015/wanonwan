---
paths:
  - "outputs/**/*.md"
---

# Plan / Review Workflow

Use this rule whenever a task needs a durable implementation plan or a durable
review record.

## Roles

| 役割 | 担当 |
|---|---|
| Plan 作成 | Claude Code |
| 実装 | Claude Code |
| Review | Codex |
| マージ承認 | 笹木さん（最終決裁） |

Claude Code は Plan を書き、実装し、**コードレビュー** が APPROVE になったら
PR を出す。Review は **計画レビュー**（Plan 完成後）と **コードレビュー**
（実装完了後）の 2 段階で Codex に依頼する。Claude Code 自身でも軽い
self-review はするが、saved Review file の作成は Codex が一次担当。

> **Codex レビューの起動は笹木さん（レビュー依頼元）が手動で行う。** Claude Code は
> self-review（チャット内）までを担当し、`codex` CLI を自分から起動しない。
> Claude Code は笹木さんが回した Codex の結果（`outputs/reviews/` に配置された
> Review ファイル）を受け取り、指摘反映と Plan / dashboard への反映のみ引き取る。
> 例外は、ユーザーが当該タスクで明示的に「Codex を起動して」と指示した場合に限る。

## Storage

| Artifact | Path |
|---|---|
| Plan output | `outputs/plans/YYYY-MM-DD-HHMM-<slug>.md` |
| Review output | `outputs/reviews/YYYY-MM-DD-HHMM-<slug>-review.md` |

- `YYYY-MM-DD-HHMM` は各ファイルの作成時刻を JST で付ける。Plan と Review の
  HHMM はズレて構わない（Review の方が後の時刻になるのが自然）。
- `<slug>` は Plan と対応する Review で **同じ slug** を使う（ペアリングの根拠）。
- `<slug>` は branch 名の末尾に合わせる。branch が未定なら作業内容を kebab-case
  で短く付ける。

## Language

Write saved Plan and Review files in Japanese by default.
Severity labels such as `CRITICAL`, `HIGH`, `MEDIUM`, and `LOW` may remain in
English for consistency with review tooling.

## Save Criteria

Create a Plan file when any of these apply:

- The task touches multiple files or packages.
- The task changes DB schema, API contracts, authentication, authorization, CI,
  deployment, or production behavior.
- The user asks for Plan Mode, planning, architecture, or approval before coding.
- The implementation has meaningful risks or trade-offs.

Create a Review file when any of these apply:

- A saved Plan exists.
- A PR is being prepared or reviewed.
- Security, permissions, data integrity, or migration behavior changed.
- The user asks for review.

For tiny edits, keep the Plan / Review in chat and do not create files unless
the user explicitly asks for a durable record.

## Plan File Requirements

Base new Plan files on `outputs/plans/_template.md`.
Each Plan must include:

- Header table: 概要（ダッシュボード 1 行サマリ）/ ステータス（凡例 enum 1 個）/
  前提 Plan / PR / Review（PR・Review は **リンクのみ**。verdict や PR 状態の文字列は書かない）.
- Goal and non-goals.
- Scope boundaries.
- Current context with links, dated in the heading（例: `## 現状コンテキスト（2026-07-07 時点）`）.
- Ordered implementation steps.
- Verification commands or manual checks.
- Risks and mitigations.
- `判断ログ` for scope or approach changes（未確定事項は決着したらここへ移動し、
  未確定事項の節からは消す）.
- Status checklist（ヘッダ enum の詳細内訳）.

After review or PR creation, add the Review / PR **links** to the Plan header and
regenerate the dashboard.

## Review File Requirements

Base new Review files on `outputs/reviews/_template.md`.
Each Review must include:

- A final verdict: `APPROVE`, `NEEDS WORK`, or `BLOCKED` — written **once**, in the
  header table（本文で再掲しない。Plan / README へも複製しない）.
- A verdict scope table separating `最終判定` from `Plan 判定`, `実装判定`, and
  `記録整理` where applicable. Use `N/A` for scopes that were not reviewed.
- Findings first, ordered by severity.
- File and line references for code findings whenever possible.
- Suggested fix for every blocking or high-priority finding.
- Verification performed and any gaps.
- Link back to the matching Plan.

### Verdict semantics

- `APPROVE`: no `CRITICAL` / `HIGH` findings remain, and there is no major
  verification gap for the reviewed scope.
- `NEEDS WORK`: `MEDIUM` or lower fixes are recommended, or verification is
  incomplete enough that the reviewed scope should be updated before handoff.
- `BLOCKED`: any `CRITICAL` / `HIGH` finding remains, or it is not safe to
  merge / implement / operate.

### Verdict scope axes

| 軸 | 取り得る値 | スコープ / 意味 |
|---|---|---|
| 最終判定 | `APPROVE` / `NEEDS WORK` / `BLOCKED` | この Review 全体として次工程へ進めるか |
| Plan 判定 | `APPROVE` / `NEEDS WORK` / `BLOCKED` / `N/A` | 計画・スコープ・リスク整理の妥当性 |
| 実装判定 | `APPROVE` / `NEEDS WORK` / `BLOCKED` / `N/A` | コード・設定・テスト・運用手順の妥当性 |
| 記録整理 | `OK` / `FOLLOW-UP` / `NEEDS WORK` / `N/A` | Plan / Review / docs の古い記述や drift |

`記録整理 = FOLLOW-UP` は **実装安全性に影響しない docs drift** に使う。最終判定は
下げない。Plan の「残課題」または Review file の末尾に書き出して後追いタスクと
して扱う。

### 過去判定の扱い

過去の verdict を Review file に残すときは `初回判定` / `対応後判定` のように
**履歴であることを明記** する。現在の `最終判定` と混同される位置に historical
`NEEDS WORK` text を残してはならない。

## Workflow

1. Decide whether the task needs durable Plan / Review files using the criteria
   above.
2. **Claude Code** creates the Plan.
3. **Codex** creates a 計画レビュー Review file referencing the Plan.
4. If the 計画レビュー is `APPROVE`, proceed. If `NEEDS WORK` or `BLOCKED`, go back
   to step 2 to update the Plan's `判断ログ` and request a re-review.
5. If the user requested explicit approval, or the scope is large, **Claude Code**
   waits for 笹木さん / user approval before implementing.
6. **Claude Code** implements against the approved Plan.
7. Run relevant verification (`pnpm typecheck` / `pnpm lint` / `pnpm test` 等).
8. **Codex** creates a コードレビュー Review file referencing the Plan and the
   implementation.
9. If the コードレビュー is `APPROVE`, proceed. If `NEEDS WORK` or `BLOCKED`, go
   back to step 6 to address findings and request a re-review.
10. **Claude Code** updates the Plan header (status enum and links), then regenerates
    the dashboard (`node scripts/gen-outputs-readme.mjs`) in the same PR.
11. **Claude Code** opens the PR. **笹木さん** does final merge approval.

Do not silently rewrite old decisions. If the approach changes, append a row to
`判断ログ` with the date and reason.

## レビュー収束ルール

Step 4 と Step 9 の往復（NEEDS WORK / BLOCKED → 再修正 → 再レビュー）を
収束させるための取り決めは [`agent-orchestration.md`](./agent-orchestration.md#1-レビュー収束ルール)
に集約している。要点だけ抜粋:

- レビュアーは指摘を `[BLOCKER]` と `[NICE-TO-HAVE]` にラベル分けする。
- `[BLOCKER]` がなければ verdict は `APPROVE`。`[NICE-TO-HAVE]` だけを理由に
  差し戻さない。残したい指摘は Plan の「残課題」または `判断ログ` に書き出す。
- 往復が収束しない場合は笹木さんに「打ち切って進めてよいか」を明示確認する。
- レビュアー Agent 起動時は **現行スタックは所与の前提** として扱わせる
  （代替ライブラリ / 全面リファクタの提案は依頼しない）。
- 依頼プロンプトに含めるテンプレートは
  [`agent-orchestration.md` §4](./agent-orchestration.md#4-レビュアー-agent-起動時のプロンプトテンプレート)
  にある。

## ステータスダッシュボード

`outputs/README.md` は **自動生成の生成物**（手編集禁止）。各 Plan ヘッダの
概要 / ステータス / PR / Review を投影する。再生成:

```bash
node scripts/gen-outputs-readme.mjs
```

一次ソースは **各 Plan ヘッダ**（概要 = ダッシュボード 1 行サマリ / ステータス = 下記凡例の
enum 1 個 / PR・Review = リンクのみ）。Plan 末尾の「ステータス」チェックリストは
ヘッダ enum の詳細内訳。設計は
[`06-final-design`](../../outputs/plans/2026-07-06-plan-doc-model/06-final-design.md)。

Review は単独のテーブルでは持たず、Plan ヘッダの `Review` 欄に種別ラベル付きリンクで列挙する
（計画レビュー / コードレビュー / コード v2 レビュー等）。verdict 文字列は書かない
（verdict の一次は Review file）。

### ステータス凡例

Plan ライフサイクル（作成中 → レビュー → 承認）と Code ライフサイクル
（実装中 → レビュー → PR → merge）を 1 列にまとめて表す。Review 単体のステータスは
持たず、コードレビューが差し戻しのときは対応 Plan を 🟧 コード差し戻しにする。

この表をステータス表示の唯一の定義とする。README の凡例や Plan 一覧表には下表の
`ステータス` にある表示名・絵文字だけを使い、Review file の verdict である
`APPROVE` / `NEEDS WORK` / `BLOCKED` は表示名に混ぜない。

| ステータス | 意味 | 推奨アクション |
|---|---|---|
| 📝 計画作成中 | Plan 未作成 / 作成途中 | Claude Code が Plan を完成させ、Codex に計画レビュー依頼 |
| 🔵 計画レビュー待ち | Plan ドラフト完了、Codex の計画レビュー待ち | Codex が計画レビューを実施 |
| 🟠 計画差し戻し | 計画レビューで差し戻された | Claude Code が指摘を反映 → Codex に再計画レビュー依頼 |
| ⚪ 実装待ち | Plan 承認済、実装未着手 | Claude Code が実装着手 |
| 🟡 実装中 | Claude Code が実装中 / 一部 Phase 残り | 残 Phase の実装 → 完了したら Codex にコードレビュー依頼 |
| 🟦 コードレビュー待ち | 実装完了、Codex のコードレビュー待ち | Codex がコードレビューを実施 |
| 🟧 コード差し戻し | コードレビューで差し戻された | Claude Code が指摘を反映 → Codex に再コードレビュー依頼 |
| 🟣 マージ承認待ち | PR 提出済み、笹木さんマージ承認待ち | 笹木さんレビュー → Squash Merge |
| 🟢 マージ済み（検証中） | merge は終わったが、実起動確認や別環境検証など Plan 末尾の検証項目に未チェックが残る | 残った検証チェックを実施し、全て埋まったら ✅ 検証完了 へ |
| ✅ 検証完了 | Plan 末尾の検証チェックがすべて埋まり、後続作業なし | なし（クローズ） |
| ❌ 撤回 | merge 前に方針転換などで撤回。Plan は履歴として残す | なし（クローズ） |

`🟢 マージ済み（検証中）` と `✅ 検証完了` を分ける理由は、merge が即「動作 OK」を
意味しないため。stg / 別 OS / E2E 等の事後検証が残っていることが多く、その状況を
後から見て追えるよう、Plan 本体の「ステータス」セクションに **検証項目のチェックボックス**
を持つ。Dashboard は Plan ヘッダの enum を反映する。

Review file 上の判定値（verdict）との対応は次の通り。

| Review verdict | ステータスダッシュボードでの扱い |
|---|---|
| `APPROVE` | 計画レビューなら ⚪ 実装待ち、コードレビュー後なら 🟣 マージ承認待ち |
| `NEEDS WORK` | 対象に応じて 🟠 計画差し戻し または 🟧 コード差し戻し |
| `BLOCKED` | 対象に応じて 🟠 計画差し戻し または 🟧 コード差し戻し |

### 更新ルール

- Plan ヘッダ（概要 / ステータス / PR / Review）を更新したら、同じ commit / PR で
  `node scripts/gen-outputs-readme.mjs` を実行して README を再生成する。
  **README を手で編集しない**（生成器が Plan ヘッダの不備を検出したら fail するので、
  直すのは Plan 側）。
- 新しい Review file を保存したら、対応 Plan ヘッダの `Review` 欄に種別ラベル付き
  **リンクのみ** 追記（`[コードレビュー](../reviews/<file>.md)` 等）→ 再生成。
- ダッシュボードは全 Plan を列挙する（完了 Plan も削除しない。履歴は git log）。

### 検証チェックボックス (`🟢 マージ済み (検証中)` → `✅ 検証完了`)

Plan ファイル末尾の「ステータス」セクションには、merge 後の動作確認を
チェックボックスで持つ。後からレビュアーが「どこまで動作確認済みか」が一発で
分かるようにする。

例:

```markdown
## ステータス

- [x] Plan 承認済み
- [x] 実装完了
- [x] コードレビュー完了
- [x] PR merge 済み (#77)
- [ ] **マージ後検証**
  - [ ] Linux 環境で実起動 OK
  - [ ] Windows 環境で実起動 OK
  - [ ] avatar upload + delete が成功 (dual endpoint 経路)
  - [ ] stg サーバで `mv infra/.env.stg .env.stg` 実施済み
```

- 検証項目に「**未検証環境を明示する**」のは OK（例: 「macOS は所有者なし、未検証で
  クローズ」）。チェック外し続けるのではなく、`- [ ] macOS: 担当者なしのためスキップ`
  と書いて納得感を残す
- すべての検証チェックが付いた時点で Plan ヘッダのステータスを
  `🟢 マージ済み（検証中）` → `✅ 検証完了` に上げ、README を再生成する
- Plan 立ち上げ時点では検証項目はまだ書かなくて良い。実装計画の `## 検証` 節を
  そのままチェックボックスに移すか、merge 直前で必要十分な項目を改めて整理する
