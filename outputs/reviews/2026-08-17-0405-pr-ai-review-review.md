# Review: PR への AI レビュー自動化（claude-code-action + サブスク認証）

| 項目 | 値 |
|---|---|
| 対象 Plan | [`plans/2026-08-17-0351-pr-ai-review.md`](../plans/2026-08-17-0351-pr-ai-review.md) |
| 種別 | 計画レビュー |
| 対象 | Plan ドラフト（実装前） |
| レビュアー | Claude Code |
| verdict | **APPROVE**（初回判定 NEEDS WORK → BLOCKER 1 件を Plan に反映後、対応後判定で APPROVE） |

## サマリ

L1（PR 自動レビュー + BLOCKER ゲート）の計画妥当性をレビューした。workflow の
イベント設計を机上でトレースし、自己再発火による二重レビュー 1 件（BLOCKER）と、
権限・セキュリティの明記漏れ 3 件（NICE-TO-HAVE）を検出。いずれも Plan に反映済み。

## 判定スコープ

| 軸 | 判定 |
|---|---|
| 最終判定 | APPROVE |
| Plan 判定 | APPROVE |
| 実装判定 | N/A（実装は見ていない） |
| 記録整理 | OK |

## Findings

### [BLOCKER] review job がボット自身の `review:blocked` 付与で再発火し、二重レビューになる（→ 反映済み）

Plan 初稿の review job 条件は「`ai-review` 有 && 非 draft && event != unlabeled」のみ。
このため次の連鎖が起きる:

1. synchronize で review job 実行 → BLOCKER 検出 → `review:blocked` を付与
2. その labeled イベントで**新しい workflow run が発火**（label 付与は action の
   GitHub App トークンで行われるため、`GITHUB_TOKEN` の再発火抑止が効かない）
3. 新 run の条件はすべて真 → **同じレビューがもう一度走る**（quota 2 倍・コメント重複）

修正: labeled イベント時は `github.event.label.name == 'ai-review'` のときだけ
review job を実行する（`review:blocked` の付与/剥がしでは gate のみ動く）。
Plan の実装計画 3 に反映済み。

### [NICE-TO-HAVE] permissions に `issues: write` が無いと label 操作が落ち、gate が fail-open する（→ 反映済み）

PR のラベル操作は内部的に Issues API。公式例の permissions
（`contents: read` / `pull-requests: write` / `id-token: write`）のままだと
`gh pr edit --add-label` が 403 になり得る。その場合レビューコメントは付くが
`review:blocked` が付かず、**gate が常に green（fail-open）**になる。
Plan の検証項目（BLOCKER 仕込み → gate fail）で必ず捕捉される設計なので BLOCKER とは
しないが、設計時点で `issues: write` を明記した。

### [NICE-TO-HAVE] PR 本文経由の prompt injection がリスク表に無い（→ 反映済み）

PR の diff / 本文にレビュアーへの指示を偽装して書き込めば、allowed tools の範囲
（コメント・ラベル操作）で `review:blocked` を外させられる可能性がある。
個人リポジトリで外部コントリビュータ不在・最終マージ承認は人間、のため実害は
限定的だが、前提が変わる（コラボレータ追加）タイミングで見直せるようリスク表に追加した。

### [NICE-TO-HAVE] concurrency の cancel-in-progress で旧 run の gate が未実行のまま終わるケース

review job 中にボットが label を付けると新 run が発火し、旧 run がキャンセルされ得る。
新 run の gate が正しく判定するため**結果は常に正しい**。挙動として知っておけば
よいだけなので Plan には注記不要と判断（本 Review に記録するのみ）。

## 妥当性レビュー

- **目的**: 「レビューの起動と検知を機械に移す」と達成条件が明確。L2/L3 との境界も明示
- **スコープ境界**: saved Review file を生成しない（保存基準を変えない）判断が明記されており、
  [plan-review-workflow.md](../../.claude/rules/plan-review-workflow.md) と矛盾しない
- **影響範囲**: CI のみ。DB / API / 認可 / migration への影響なし。secrets 追加は登録済み
- **検証**: fail 側（BLOCKER 仕込み）と解除側（`ai-review` 外し）の両方向 + quota 実測が
  入っており、fail-open の検出まで含めて具体的
- **重複**: `outputs/plans/` に類似テーマなし。撤回 Plan（sidebar-nav-v2）とも無関係

## 過去事例からの教訓

- [ハーネス cleanup Plan](../plans/2026-08-15-1454-claude-harness-cleanup.md) の教訓
  「未配線・矛盾した設定を置かない」に整合: 本 Plan は workflow・ラベル・ルール追記を
  同一 PR で入れ、設定だけが先行する状態を作らない
- [CD の secrets skip パターン](../../.github/workflows/cd.yml)（secrets 未配備なら
  skip で fail しない）と同型の「無効時は素通し」設計を `ai-review` opt-out に採用している

## 検証（この Review 自体の）

- [x] 対象 Plan を全文 Read 済み
- [x] claude-code-action の inputs / 公式 PR レビュー例を docs（usage.md / solutions.md）で確認済み
- [x] workflow イベント連鎖（synchronize / labeled / unlabeled / ボット起因イベント）を机上トレース済み
- [x] 類似 Plan・撤回 Plan との被り grep 済み（該当なし）

## フォローアップ

- [x] BLOCKER の再発火ガードを Plan 実装計画 3 に反映
- [x] `issues: write` を Plan 実装計画 3 に反映
- [x] prompt injection をリスク表に追加
