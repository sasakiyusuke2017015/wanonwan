# Review: 発火しない rules の棚卸し + outputs 直 push ガードの機械化

| 項目 | 値 |
|---|---|
| 対象 Plan | [`plans/2026-08-20-2023-rules-inventory-and-push-guard.md`](../plans/2026-08-20-2023-rules-inventory-and-push-guard.md) |
| 種別 | 計画レビュー |
| 対象 | develop (544a6ee) 時点の `.claude/rules/` / `.claude/skills/` / `scripts/` / `ci.yml` |
| レビュアー | Claude Code |
| verdict | **APPROVE**（初回判定 NEEDS WORK → 対応後判定 APPROVE。下記「対応履歴」） |

## サマリ

Plan の実測値（棚卸し候補 5 本の行数・参照数・乖離 3 件、tdd-workflow の 31 行、
first-parent 判定の根拠）を全て再現確認した。棚卸しの判定基準 3 問と「実装側 grep
に基づく個別判定」の建付けは、前 Plan の valibot の教訓を正しく引き継いでいる。

差し戻しは 1 点: **直 push ガードの merge commit skip 条件に穴があり、ローカル merge
経由なら PR を経ずに non-outputs を develop へ入れられる**。検知ガードの中核要件に
関わるため BLOCKER とした。修正は committer 条件の追加で軽微。

## 判定スコープ

| 軸 | 初回判定 | 対応後判定 |
|---|---|---|
| 最終判定 | NEEDS WORK | **APPROVE** |
| Plan 判定 | NEEDS WORK | **APPROVE** |
| 実装判定 | N/A | N/A |
| 記録整理 | OK | OK |

## 対応履歴

初回判定の BLOCKER 1 件・NICE-TO-HAVE 4 件は同日 Plan へ反映済み。以下の Findings は
初回判定時点の記録。

## 訂正（2026-08-20・レビュー後の実装中に発覚）

本 Review の「乖離 3 件をすべてコマンドで確認。誤りなし」は**一部誤り**だった。
security.md の「レートリミット未実装（grep 0 件）」は、探索先を実在しない
`apps/web/src/` にした grep の誤測定（実装は `lib/auth/rate-limit.ts` が auth 系
3 エンドポイントで使用中）。レビュー自身も Plan と同じ死んだ paths を物差しに
流用しており、検証が汚染されていた。訂正は #131 の追記 commit と Plan の
判断ログ（2026-08-20）に記録。ApiResponse / カバレッジゲート / playwright.config の
不在は実パスでの再測定でも確認され、判定は維持。

## Findings

### [BLOCKER] merge commit を「親 2 つ以上」だけで skip すると、ローカル merge が検知をすり抜ける

Plan の判定ロジックは「first-parent 系列上の親 1 つの commit = 直 push として検査、
親 2 つ以上 = PR マージとして対象外」。しかしローカルで `git merge feature/x` を実行して
develop へ直 push した場合も merge commit（親 2 つ）が生まれ、**PR を経ていないのに
検査対象外**になる。feature 側の non-outputs 変更は second-parent 側にぶら下がるため
first-parent 検査にも掛からず、ガードの中核要件（PR を経ない non-outputs 混入の検知）に
穴が開く。

実測: develop の merge commit は現状すべて committer `GitHub <noreply@github.com>`
（GitHub UI マージの署名）。ローカル merge の committer はユーザーになるため区別可能。

**推奨修正:** skip 条件を「親 2 つ以上 **かつ** committer email = `noreply@github.com`」に
締める。ユーザー committer の merge commit は違反として報告する。

### [NICE-TO-HAVE] testing.md 書き直しで Playwright を書くと新たな乖離を生む

playwright.config は repo に**実在しない**（`find` 0 件。`e2e-runner` agent と
`/e2e` command は存在するが設定実体なし）。[CLAUDE.md](../../CLAUDE.md) の採用スタック表にも
Playwright が載っており、こちらは「採用方針」の表なので許容範囲だが、testing.md に
「E2E は Playwright（すべて必須）」と書き直すと 80% ゲートと同型の嘘を再生産する。

**推奨修正:** step 1 に「testing.md には実在するコマンド（`pnpm turbo run test` /
`pnpm test:db`）のみ書き、E2E は未整備である旨を現在形で書く」を明記。

### [NICE-TO-HAVE] performance.md は frontmatter なし = 毎セッション常時読込

`paths:` が無いため常時読込されている（35 行 × 全セッション）。削除の妥当性を
**強める**実測なので、現状コンテキストの表に追記しておくと削除根拠が完結する。

### [NICE-TO-HAVE] `fetch-depth: 0` は PR の CI にも効いてしまう

checkout@v4 は現在デフォルト（depth 1）。ガードが必要とする履歴は push イベント時のみ
なので、全イベントで full clone にする代わりに、ガードステップ内で
`git fetch --deepen` するか、`fetch-depth: 0` を受容するかを実装時に選ぶ。
リポジトリ規模的にどちらでも実害は小さい。

### [NICE-TO-HAVE] hook の検証は新セッションで行う必要がある

settings.json の hooks はセッション開始時に読み込まれるため、配線した同一セッション内の
`git push --dry-run` では発火しない可能性が高い。検証 3-hook に「新セッションで確認」を
追記する。

## 妥当性レビュー

- **目的**: 前 Plan の 2 原則（発火しない記述は消す / prose より機械化）の適用として明確。
  達成条件も測定可能
- **実測の再現**: 棚卸し候補の行数・参照数（performance / patterns / testing = 参照ゼロ、
  security = 1、coding-style = 2）、乖離 3 件（ApiResponse 不在 / 80% ゲート不在 /
  レートリミット不在）、check-secrets.mjs の実在、first-parent 判定の根拠
  （41c0743 = PR 経由でも committer はユーザー）をすべてコマンドで確認。誤りなし
- **スコープ境界**: commands / agents / contexts を外し「乖離機構の実装」も外す線引きは
  明確。前 Plan との重複なし（rules は前 Plan のスコープ外だった）
- **hook 新造の建付け**: 「導入 commit で配線まで行う」は前 Plan で潰した未配線問題の
  再発防止として妥当。hooks.md の導入条件（Plan/Review 運用を止めない）も満たす
- **撤回 Plan との被り**: 撤回済みは sidebar-nav-v2 のみで無関係

## 過去事例からの教訓

- 前 Plan の計画レビューが「検証の因果が担保されていない」（permission 3 層）を突いたのと
  同型の穴が、今回は merge commit の skip 条件だった。「検知系の Plan は、すり抜け経路を
  列挙してから判定条件を決める」を今後の計画レビュー観点に加える価値がある
- valibot の教訓（見た目の汎用性は削除根拠にならない）は本 Plan の判定基準 3 問として
  明文化されており、coding-style 存置の判定に実際に効いている

## 検証（この Review 自体の）

- [x] 対象 Plan を全文確認
- [x] 棚卸し候補 5 本 + tdd-workflow の実測値をコマンドで再現
- [x] 乖離 3 件（ApiResponse / カバレッジゲート / レートリミット）の不在を grep で確認
- [x] merge commit の committer を実測（GitHub UI マージ = noreply@github.com）
- [x] playwright.config の不在、check-secrets.mjs の実在を確認
- [x] ci.yml の checkout 設定（fetch-depth 未指定 = depth 1）を確認
- [x] 撤回 Plan との被り確認

## フォローアップ

すべて Plan（2026-08-20）へ反映済み。

- [x] BLOCKER: skip 条件に committer = `noreply@github.com` を追加、ユーザー merge は違反報告
- [x] NICE-TO-HAVE: testing.md の記述対象を実在コマンドに限定、E2E 未整備を現在形で書く方針を明記
- [x] NICE-TO-HAVE: performance.md 常時読込の実測を現状コンテキストに追記
- [x] NICE-TO-HAVE: fetch-depth の代替（`--deepen`）をリスク表に追記
- [x] NICE-TO-HAVE: hook 検証は新セッションで行う旨を検証節に追記
