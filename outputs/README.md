# outputs — Plan / Review ダッシュボード

Plan は [`plans/`](plans/)、Review は [`reviews/`](reviews/) に保存する。運用ルールは
[`.claude/rules/plan-review-workflow.md`](../.claude/rules/plan-review-workflow.md)。

## ステータスダッシュボード

| ステータス | Plan | 概要 | 関連 PR / レビュー | 推奨アクション |
|---|---|---|---|---|
| 🟡 実装中 | [Pleasanter 排除 + 1on1 再構築](plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md) | 旧 1on1 を新スタック(Next.js/Postgres/GoTrue/RLS)で再構築。Phase 0–5 + 見た目踏襲 + provisioning/レートリミット/日時tz + Dashboard/Schedule までマージ済。残=デプロイ基盤（別 Plan へ分離） | [計画(初回)](reviews/2026-06-11-1830-pleasanter-exit-1on1-rebuild-review.md) / [計画(Phase6再)](reviews/2026-06-12-1500-pleasanter-exit-1on1-rebuild-review.md) / 機能別レビューは各 PR。PR #1–23 merged | デプロイ基盤の実装・検証完了後にクローズ |
| 🟢 マージ済み（検証中） | [デプロイ基盤 (stg/prod compose + nginx + CD + provisioning)](plans/2026-06-12-1530-deploy-infra.md) | 親 Plan の Phase 6 を独立化。secrets 遮断 / web image / nginx(TLS,rate-limit) / CD / GoTrue prod / prod admin provisioning / backup | [PR #24](https://github.com/sasakiyusuke2017015/waoon/pull/24) merged / [計画レビュー](reviews/2026-06-12-1545-deploy-infra-review.md): NEEDS WORK / [再計画レビュー v2](reviews/2026-06-12-1600-deploy-infra-review-v2.md): APPROVE / [コードレビュー](reviews/2026-06-12-1648-deploy-infra-code-review.md): BLOCKED / [コードレビュー v2](reviews/2026-06-12-1715-deploy-infra-code-review-v2.md): APPROVE | 笹木さんが stg 実環境でマージ後検証（compose:stg:up / CD / provision / backup）|
| 🟢 マージ済み（検証中） | [編集時の GoTrue 同期 + 初回ログイン後の force-change](plans/2026-06-14-1455-auth-gotrue-sync-force-change.md) | 親 Plan「認証の残」A+B。admin の email/password 変更を GoTrue へ同期（admin client に updateUser 追加）+ 初回 PW の強制変更（force-change を API 層ゲートで enforce、middleware はページ誘導） | [PR #25](https://github.com/sasakiyusuke2017015/waoon/pull/25) merged / コードレビュー(Codex): NEEDS WORK → [再コードレビュー](reviews/2026-06-15-1030-auth-gotrue-sync-force-change-code-review-v2.md): APPROVE | 受け入れ検証（B-0 他）を笹木さん環境で実施 |
| 🟢 マージ済み（検証中） | [API ルートの boilerplate 集約（認証/admin ラッパ + parseBody + service_role + rate-limit）](plans/2026-06-15-1610-api-route-helpers.md) | force-change PR の per-route ガード直書きを関数合成で集約し、認可ガードを構造的に忘れられなくする pure refactor。withActiveUser / parseBody / withServiceRole / checkRateLimit に集約（27 ファイル・純減 117 行） | [PR #26](https://github.com/sasakiyusuke2017015/waoon/pull/26) merged / コードレビュー(Agent): APPROVE | runtime スモーク（#25 の B-0 と同セッションで可） |
| ✅ 検証完了 | [apps/web に Vitest 導入 + API ヘルパ unit テスト](plans/2026-06-15-1725-web-vitest-helper-tests.md) | api-route-helpers 残課題。apps/web に Vitest を導入し parseBody / withActiveUser / checkRateLimit / withServiceRole / metadata の unit テスト（5 files / 13 tests）。test-only | [PR #27](https://github.com/sasakiyusuke2017015/waoon/pull/27) merged / レビュー省略（test-only・合意） | — |
| 🟡 実装中 | [フォームのフィールド単位 valibot エラー表示](plans/2026-06-17-2240-form-field-level-errors.md) | 見た目磨き込み #2。送信時の入力エラーを各 `FormField` 下に日本語表示。共通 helper `fieldErrorsOf`（safeParse+flatten）+ domain スキーマ日本語メッセージ。Phase1 UserForm / Phase2 SurveyForm 実装（InterviewForm は全 optional で対象外、AnswerForm は follow-up） | [PR #33](https://github.com/sasakiyusuke2017015/waoon/pull/33) | AnswerForm を follow-up |
| 🟡 実装中 | [API 堅牢化: ESLint + import ガード + integration test](plans/2026-06-17-2210-api-hardening-lint-guard.md) | api-route-helpers 残課題。認証プリミティブ（getCurrentClaims/getAccessToken/getRefreshToken/verifyAccessToken）の直 import を `no-restricted-imports` で禁止（認可漏れの構造的防止）+ 挙動不変 integration test。前提として apps/web に ESLint flat config を新設し root lint/CI に配線 | [PR #32](https://github.com/sasakiyusuke2017015/waoon/pull/32) Phase1 / [PR #34](https://github.com/sasakiyusuke2017015/waoon/pull/34) Phase2 | Phase 2 まで PR 化済・マージ待ち |

> 全フェーズの決定・ハマりどころ（RLS 無限再帰 / GUC 予約語衝突 / 二層認可など）は
> [Plan の判断ログ](plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md#9-判断ログ)に時系列で記録。次セッションはまずそこを読む。

### 実装進捗

| Phase | 内容 | PR | 状態 |
|---|---|---|---|
| 0 | モノレポ + Next.js 16 + ui-catalog ベンダリング | #1–3 | ✅ merged |
| 1 | Docker(Postgres+拡張) + GoTrue + RLS context | #4, #5 | ✅ merged |
| 2 | データモデル + RLS + pgTAP | #6 | ✅ merged |
| 3 | API 層（DB クライアント + RLS 注入 + users API） | #7 | ✅ merged |
| 4 | 管理者画面: ユーザー管理 / アンケート管理 | #8, #9 | ✅ merged |
| 6 | CI（GitHub Actions: typecheck/build/pgTAP） | #10 | ✅ merged |
| 4+ | 設問ビルダ / 掲載管理 | #11, #12 | ✅ merged |
| 5a | 回答者フロー（実施中一覧→回答→保存） | #13 | ✅ merged |
| 5b | 面談フロー（answers API + 面談記録 + API層認可） | #14 | ✅ merged |
| 見た目1 | 見た目踏襲・基盤（テーマ3軸 + AppLayout シェル + ナビ + テーマ切替UI） | #15 | ✅ merged |
| 見た目2 | 管理一覧の定石化（users/surveys/answers → InteractiveTable + AdminListTable） | #16 | ✅ merged |
| 見た目3 | 管理フォームの定石化（User/Survey/Interview → ContentBlock + FormField + FormActions） | #17 | ✅ merged |
| 見た目4 | 回答者フローの定石化（AnswerForm → ContentBlock+各コントロール / 一覧 → Card+Badge） | #18 | ✅ merged |
| 認証 | ユーザー作成時の GoTrue provisioning（identity 発行 + gotrue_id 紐付け + 初期パスワード生成） | #19 | ✅ merged |
| 認証 | レートリミット（login/refresh の IP 単位 in-memory limiter, 429+Retry-After） | #20 | ✅ merged |
| データ整合 | 日時 tz 修正（datetime-local の JST⇄UTC 変換、掲載/面談の instant ズレ解消） | #21 | ✅ merged |
| 新規画面 | ダッシュボード `/dashboard`（answers 集計: 回答状況/面談実施率/健康分布/評価レーダー、RLS スコープ） | #22 | ✅ merged |
| 新規画面 | スケジュール `/schedule`（schedules CRUD API + @ui-catalog MonthView/EventModal の共有カレンダー、RLS owner/admin write）。[コードレビュー: APPROVE](reviews/2026-06-12-1413-schedule-review.md) | #23 | 🟢 マージ済み（検証中）※カレンダー対話はブラウザ手動確認待ち |

### 次セッションの起点

見た目踏襲（基盤〜管理〜回答者）+ provisioning / レートリミット / 日時tz + ダッシュボード(merged) + スケジュール(レビュー済)。主要画面はほぼ揃った。残り:

1. **スケジュールの手動確認**: カレンダーの対話（日付クリック→作成モーダル / イベント編集 / ドラッグ移動）はブラウザでの動作確認が必要（curl 検証不能のため未確認）。
2. **見た目の磨き込み**: 一覧のフィルタ/ソート + `StatisticPanel`、フォームのフィールド単位 valibot エラー表示、数値 Input の min/max
3. **認証の残**: 編集時の email/password の GoTrue 同期、初回ログイン後の force-change、本番のエッジ(nginx)/Redis レートリミット
4. 周辺: 委任、root scripts 整理（保留中）、実データ移行

### ローカル起動メモ

```bash
pnpm dev:up           # 日常: 起動(--wait) → migrate → seed(冪等) → web 前面（これ 1 本でOK）
# 個別に回したいとき:
pnpm compose:dev:up   # postgres + gotrue（detached, healthy まで待つ）
pnpm db:migrate       # スキーマ適用（冪等）
pnpm db:seed          # admin/member/alice 等（冪等: ON CONFLICT）
pnpm test:db          # pgTAP(RLS)
pnpm dev              # web のみ（env は apps/web/.env.example の既定で動く。差し替えは .env.local）
# データ消去して作り直し: pnpm compose:dev:down -v → pnpm dev:up
```

seed ログイン: `admin@example.com` / `Admin1234!`（管理者）, `member@example.com` / `Member1234!`（一般）
