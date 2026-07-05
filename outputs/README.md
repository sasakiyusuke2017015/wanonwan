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
| 🟡 実装中 | [フォームのフィールド単位 valibot エラー表示](plans/2026-06-17-2240-form-field-level-errors.md) | 見た目磨き込み #2。送信時の入力エラーを各 `FormField` 下に日本語表示。`fieldErrorsOf`（静的: safeParse+flatten）+ `requiredFieldErrors`（動的: 設問駆動）+ domain 日本語メッセージ。User/Survey/Answer 全フォーム対応（InterviewForm は全 optional で対象外） | [PR #33](https://github.com/sasakiyusuke2017015/waoon/pull/33) merged / Phase3 AnswerForm は新規 PR | Phase 3 を PR 化 |
| 🟡 実装中 | [API 堅牢化: ESLint + import ガード + integration test](plans/2026-06-17-2210-api-hardening-lint-guard.md) | api-route-helpers 残課題。認証プリミティブ（getCurrentClaims/getAccessToken/getRefreshToken/verifyAccessToken）の直 import を `no-restricted-imports` で禁止（認可漏れの構造的防止）+ 挙動不変 integration test。前提として apps/web に ESLint flat config を新設し root lint/CI に配線 | [PR #32](https://github.com/sasakiyusuke2017015/waoon/pull/32) Phase1 / [PR #34](https://github.com/sasakiyusuke2017015/waoon/pull/34) Phase2 | Phase 2 まで PR 化済・マージ待ち |
| 🟡 実装中 | [管理一覧のフィルタ/ソート + StatisticPanel](plans/2026-06-18-1115-admin-list-filter-sort-stats.md) | 見た目磨き込み #2。AdminListTable に client-side 検索/ソート（`searchKeys`/`sortable`）を汎用追加 + 集計パネル。ロジックは純関数 `filterRows`/`sortRows`（unit test 7 件）。users/surveys/answers 全一覧に適用 + status 別集計を `StatisticList` で表示（StatisticPanel の pie は分析側に委ね軽量化） | （未）/ Phase 1+2 実装済（typecheck・lint・test green） | PR 化 |
| 🟢 マージ済み（検証中） | [添付ファイル基盤（MinIO + presigned URL）](plans/2026-06-18-1330-attachments-minio.md) | presigned URL でブラウザが MinIO へ直接 up/down、API は認可+メタのみ。単一 `attachments` 表(polymorphic)+entity_type 別 RLS。Phase1=storage lib+MinIO compose+表/RLS/pgTAP+面談添付 API/UI。Phase2=回答/資料/アバター+`AttachmentsPanel`共通化。Phase3=stg/prod に MinIO + nginx の storage サブドメイン配線 | [#40](https://github.com/sasakiyusuke2017015/waoon/pull/40)+[#41](https://github.com/sasakiyusuke2017015/waoon/pull/41)+[#44](https://github.com/sasakiyusuke2017015/waoon/pull/44) merged | 笹木さん stg 検証（DNS+cert SAN・実 up/download）|
| 🟡 実装中 | [添付の complete 実体検証 + アバター置換の安全化](plans/2026-06-19-0130-attachments-complete-validation.md) | [triage レビュー](reviews/2026-06-19-0038-plans-review-triage.md) の添付 HIGH/MEDIUM 修正。complete は `HeadObject` でサーバ真値検証（不在422/超過413/不許可415、size は実測）+ presign 前に MIME allowlist + 最大20MB（`policy.ts` unit5）。avatar は作成時に旧を消さず **complete 成功時に置換**（unique index を status=200 限定に変更）。一覧/DL を status=200 限定 | [triage レビュー](reviews/2026-06-19-0038-plans-review-triage.md) #3/#4/#5 / 実装済（typecheck・lint・test 69 green）/ 新規 PR | PR 化 → pgTAP は CI・runtime は笹木さん |
| 🟡 実装中 | [AI: 面談メンター提案 + 自由記述の要約/分析（Claude + pgvector）](plans/2026-06-18-1900-ai-pgvector-mentor-summary.md) | Phase A=Claude(`@anthropic-ai/sdk`/Sonnet 4.6)で面談要約（`lib/ai`+`POST /answers/[id]/summary`+UI、merged）。Phase B=pgvector RAG メンター提案（**自前ホスト埋め込み** TEI/e5-small・profile ai・社外送信なし、lazy 生成、`POST /answers/[id]/mentor`+UI、key/URL 未設定で無効）。**いずれもキー/URL 未設定で外部送信ゼロ** | [PR #42](https://github.com/sasakiyusuke2017015/waoon/pull/42) Phase A merged / [PR #43](https://github.com/sasakiyusuke2017015/waoon/pull/43) Phase B | **§3.1 HR データ外部送信の組織承認**が前提。笹木さん runtime（key/URL + `compose:ai:up`）|
| 🟢 マージ済み（検証中） | [非同期/定期ジョブ基盤（pg_cron + pgmq）](plans/2026-06-18-2030-async-jobs-pgmq-pgcron.md) | 拡張だけ入っていた pgmq/pg_cron に実働基盤。Phase1=**添付の孤児掃除**（status 100 の古い行を pg_cron 純 SQL で定期削除。`app.is_stale_attachment`純関数+`app.gc_stale_attachments` SECURITY DEFINER・30分毎）。Phase2a=pgmq キュー + DELETE enqueue トリガ + 専用 Node worker(`apps/worker`)で MinIO 本体削除（parseGcMessage unit 8・superuser 接続・at-least-once）。Phase2b=Dockerfile.worker（pnpm deploy→type-stripping・docker build 実機確認）+ CD の worker image build/push + stg/prod compose の worker サービス | [#45](https://github.com/sasakiyusuke2017015/waoon/pull/45) Phase1 + [#46](https://github.com/sasakiyusuke2017015/waoon/pull/46) Phase2a merged / Phase2b は新規 PR | 笹木さん runtime（cron 登録+実削除 / 添付削除→enqueue→worker が MinIO 本体削除 / CD で worker push+起動）|
| 🟢 マージ済み（検証中） | [seed の CSV 化 + マスタ管理基盤](plans/2026-06-25-1025-seed-csv-master-admin.md) | seed を手書き SQL から CSV 化し FK 依存順ローダー（非空スキップ=初回投入専用）で投入。provision を 2 モード化（単一 admin / `--users-csv` の N 名一括・行単位冪等・一時 PW を 0600 ファイル + must_change）。組織/役職マスタの CRUD 管理画面（`/admin/org`・`/admin/positions`）を新設 | [#56](https://github.com/sasakiyusuke2017015/waoon/pull/56) merged / [計画レビュー](reviews/2026-06-25-1031-seed-csv-master-admin-review.md)（収束 APPROVE 相当）/ [コードレビュー](reviews/2026-06-25-1431-seed-csv-master-admin-code-review.md): APPROVE | 笹木さんが `/admin/org`・`/admin/positions` をブラウザ手動確認 |
| 🟢 マージ済み（検証中） | [権限(role)と役職(position)の分離](plans/2026-06-25-1558-separate-role-from-position.md) | admin 判定を positions.code 990-999 → `users.role='admin'` へ移行。positions は純粋 HR マスタ化（999 廃止・#56 の昇格ガード撤去）。最後の admin を 0 人にする操作を DB トリガーで拒否。多層防御（RLS + valibot picklist + DB CHECK + トリガー）を pgTAP で担保 | [#57](https://github.com/sasakiyusuke2017015/waoon/pull/57) merged / [コードレビュー](reviews/2026-06-25-1627-separate-role-from-position-code-review.md): APPROVE | 笹木さんがユーザー編集の権限トグルをブラウザ手動確認 |
| 🟢 マージ済み（検証中） | [設問マスタ（設問バンク）＋ seed 選択肢の文言化](plans/2026-06-29-1327-survey-question-master.md) | 設問を `/admin/questions` のマスタに昇格＋アンケート編集はマスタ設問を「呼ぶ／外す」形へ（link/unlink API・eval_item 入力追加）。radio seed を同意度 5 段階で文言化。緊急度マスタは Phase2/別 Plan に分離（値域 code+label 確定） | PR-A [#60](https://github.com/sasakiyusuke2017015/waoon/pull/60)・[コード(Codex)](reviews/2026-06-29-1438-survey-question-master-code-review.md) APPROVE / PR-B [#61](https://github.com/sasakiyusuke2017015/waoon/pull/61)・[コード(agent)](reviews/2026-06-29-1512-survey-question-master-code-review-prb.md) APPROVE / 両者 merged | 笹木さんが dev 実機で検証（クリーン再投入の文言表示 / 設問マスタ CRUD / マスタ追加・外す / 非 admin ガード）|
| 🟢 マージ済み（検証中） | [緊急度マスタ（surveys / answers 共通）](plans/2026-06-29-1537-urgency-master.md) | 緊急度（高/中/低）を共通マスタ化。PR-1=urgency_levels テーブル+RLS+`/admin/urgencies`+API+seed+pgTAP / PR-2=surveys・answers に urgency_id 配線（SurveyForm・InterviewForm に書き手 UI）。設問マスタ Phase2 から分離 | PR-1 [#62](https://github.com/sasakiyusuke2017015/waoon/pull/62)・PR-2 [#63](https://github.com/sasakiyusuke2017015/waoon/pull/63) merged / コード [PR-1](reviews/2026-06-29-1631-urgency-master-code-review-pr1.md)・[PR-2](reviews/2026-06-29-1708-urgency-master-code-review-pr2.md) APPROVE | 笹木さんが dev 実機で検証（urgencies CRUD / Survey・Interview で設定保持・クリア / 非 admin ガード）|
| 🟢 マージ済み（検証中） | [UI フィードバック基盤（Toast 配線・削除確認・ルート境界）](plans/2026-07-05-0101-ui-feedback-foundation.md) | UI/UX 改善テーマ1。catalog 実装済みの Toast/ConfirmDialog をアプリ配線（保存/削除の成功トースト・破壊的操作の確認ダイアログ）+ `global-error`/`error`/`not-found`/`loading` のルート境界新設。Toast は遷移をまたぐ app Provider 方式（catalog に ToastProvider 追加・zIndex 10010） | [計画レビュー](reviews/2026-07-05-0115-ui-feedback-foundation-review.md): APPROVE / [コードレビュー](reviews/2026-07-05-0210-ui-feedback-foundation-code-review.md): APPROVE / [PR #64](https://github.com/sasakiyusuke2017015/waoon/pull/64) CI green | 笹木さんが dev 実機で検証（遷移後トースト / 削除確認 / 404 / error 境界）|
| 🟢 マージ済み（検証中） | [カタログ堅牢化（MarkdownPreview XSS 修正 + モーダル focus-trap/ARIA）](plans/2026-07-05-0835-ui-catalog-hardening.md) | UI/UX 改善テーマ2。MarkdownPreview の無サニタイズ `dangerouslySetInnerHTML` を DOMPurify で封じ（アプリ未使用の潜在 XSS を catalog 層で無効化）、Modal/Dialog/EventModal に focus-trap + `role="dialog"`/`aria-modal` を付与。ConfirmDialog/AlertDialog はラッパのため自動で恩恵 | [計画レビュー](reviews/2026-07-05-0840-ui-catalog-hardening-review.md): APPROVE / [コードレビュー](reviews/2026-07-05-0904-ui-catalog-hardening-code-review.md): APPROVE / [PR #66](https://github.com/sasakiyusuke2017015/waoon/pull/66) merged | 笹木さんが dev 実機で検証（Tab 循環 / 復帰 / EventModal）|
| 🟢 マージ済み（検証中） | [DataTable 移植（ai_edu 版）+ 一覧の DataTable 一本化](plans/2026-07-05-0920-datatable-port.md) | UI/UX 改善テーマ3。ai_edu 実戦検証済みの DataTable（列ヘッダソート/ページネーション/フィルタ/ColumnPicker/行アクション、テスト 1,593 行）を catalog へ移植（PR-A・死蔵の旧 DataTable を置換）→ AdminListTable をアダプタ化して admin 4 一覧 + マスタ 5 画面を乗り換え、apps/web の InteractiveTable 参照をゼロに（PR-B・テーマ追従はアダプタ scoped 注入）| [計画レビュー](reviews/2026-07-05-0925-datatable-port-review.md): APPROVE / [PR-A コードレビュー](reviews/2026-07-05-1510-datatable-port-code-review.md): APPROVE（代行）/ [PR-A #68](https://github.com/sasakiyusuke2017015/waoon/pull/68) merged / [PR-B コードレビュー](reviews/2026-07-05-1720-datatable-port-code-review-prb.md): APPROVE（代行）/ [PR-B #70](https://github.com/sasakiyusuke2017015/waoon/pull/70) merged | 笹木さんが dev 実機で検証（テーマ追従 / 列ヘッダソート / ページネーション / 再試行 / 列ピッカー採否）|
| ⚪ 実装待ち（PR-A） | [フォーム UX 統一](plans/2026-07-05-1745-form-ux-unification.md) | UI/UX 改善テーマ4。3 本柱: (1) 未保存変更の離脱警告（目玉・`beforeunload` + apps の `NavigationGuardProvider`/`useGuardedNavigate` でプログラム遷移集約 + popstate。catalog は beforeunload+dirty のみ）、(2) 成功/エラーフィードバック統一（MasterForm・設問マスタ単体にトースト・エラーはフォーム=インライン/行アクション=トースト）、(3) 生 UI フォームのカタログ化（QuestionForm・PublicationForm・AnswerForm radio/checkbox・認証）。要判断 4 点確定・**計画レビューで 3→4 PR に再分割**・笹木さん承認済み | [計画レビュー](reviews/2026-07-05-1810-form-ux-unification-review.md): NEEDS WORK → BLOCKER（遷移ガード方式）反映済み（代行 planner+architect）| Claude Code が PR-A（フィードバック統一）から実装着手 |

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
pnpm compose:dev:up   # 端末1: 起動(--wait) → migrate → web 前面（端末を専有）
pnpm provision:dev    # 端末2: 組織マスタ + ユーザ投入（冪等）
# 個別に回したいとき:
pnpm db:migrate       # スキーマ適用（冪等）
pnpm test:db          # pgTAP(RLS)
pnpm dev              # web のみ（env は apps/web/.env.example の既定で動く。差し替えは .env.local）
# データ消去して作り直し: pnpm compose:dev:down -v → compose:dev:up → provision:dev
```

seed ログイン: `padmin@example.com` / `Admin1234!`（管理者）, `pmember@example.com` / `Admin1234!`（一般）
