<!-- 自動生成。手編集しない。再生成: node scripts/gen-outputs-readme.mjs -->

# outputs — Plan / Review ダッシュボード

Plan は [`plans/`](plans/)、Review は [`reviews/`](reviews/) に保存する。運用ルールは
[`.claude/rules/plan-review-workflow.md`](../.claude/rules/plan-review-workflow.md)、
本ダッシュボードの設計は [`06-final-design`](plans/2026-07-06-plan-doc-model/06-final-design.md)。

各行は **Plan ヘッダ（概要 / ステータス / PR / Review）の投影**。値を直したいときは
対象 Plan のヘッダを更新してから再生成する。

## ステータスダッシュボード

| ステータス | Plan | 概要 | PR | Review |
|---|---|---|---|---|
| 🟡 実装中 | [Pleasanter 排除 + 旧 1on1 ドメインの新スタック再構築](plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md) | 旧 1on1 を新スタック(Next.js/Postgres/GoTrue/RLS)で再構築。Phase 0–5 + 見た目踏襲 + provisioning/レートリミット/日時tz + Dashboard/Schedule までマージ済。残=デプロイ基盤（別 Plan へ分離） | — | — |
| 🟢 マージ済み（検証中） | [デプロイ基盤（stg/prod compose + nginx + CD + prod provisioning）](plans/2026-06-12-1530-deploy-infra.md) | 親 Plan の Phase 6 を独立化。secrets 遮断 / web image / nginx(TLS,rate-limit) / CD / GoTrue prod / prod admin provisioning / backup | — | — |
| ✅ 検証完了 | [編集時の GoTrue 同期 + 初回ログイン後の force-change](plans/2026-06-14-1455-auth-gotrue-sync-force-change.md) | 親 Plan「認証の残」A+B。admin の email/password 変更を GoTrue へ同期（admin client に updateUser 追加）+ 初回 PW の強制変更（force-change を API 層ゲートで enforce、middleware はページ誘導） | — | — |
| ✅ 検証完了 | [API ルートの boilerplate を関数合成で集約（認証/admin ラッパ + parseBody + service_role + rate-limit）](plans/2026-06-15-1610-api-route-helpers.md) | force-change PR の per-route ガード直書きを関数合成で集約し、認可ガードを構造的に忘れられなくする pure refactor。withActiveUser / parseBody / withServiceRole / checkRateLimit に集約（27 ファイル・純減 117 行） | — | — |
| ✅ 検証完了 | [apps/web に Vitest 導入 + API ヘルパの unit テスト](plans/2026-06-15-1725-web-vitest-helper-tests.md) | api-route-helpers 残課題。apps/web に Vitest を導入し parseBody / withActiveUser / checkRateLimit / withServiceRole / metadata の unit テスト（5 files / 13 tests）。test-only | — | — |
| 🟢 マージ済み（検証中） | [API 堅牢化: ESLint 立ち上げ + 認証プリミティブ import ガード + 挙動不変 integration test](plans/2026-06-17-2210-api-hardening-lint-guard.md) | api-route-helpers 残課題。認証プリミティブ（getCurrentClaims/getAccessToken/getRefreshToken/verifyAccessToken）の直 import を `no-restricted-imports` で禁止（認可漏れの構造的防止）+ 挙動不変 integration test。前提として apps/web に ESLint flat config を新設し root lint/CI に配線 | ESLint+import ガード: [#32](https://github.com/sasakiyusuke2017015/wanonwan/pull/32)（merged） / integration test: [#34](https://github.com/sasakiyusuke2017015/wanonwan/pull/34)（merged） | — |
| 🟢 マージ済み（検証中） | [フォームのフィールド単位 valibot エラー表示](plans/2026-06-17-2240-form-field-level-errors.md) | 見た目磨き込み #2。送信時の入力エラーを各 `FormField` 下に日本語表示。`fieldErrorsOf`（静的: safeParse+flatten）+ `requiredFieldErrors`（動的: 設問駆動）+ domain 日本語メッセージ。User/Survey/Answer 全フォーム対応（InterviewForm は全 optional で対象外） | Phase1+2: [#33](https://github.com/sasakiyusuke2017015/wanonwan/pull/33)（merged） / Phase3: [#35](https://github.com/sasakiyusuke2017015/wanonwan/pull/35)（merged） | — |
| 🟢 マージ済み（検証中） | [管理一覧のフィルタ/ソート + StatisticPanel](plans/2026-06-18-1115-admin-list-filter-sort-stats.md) | 見た目磨き込み #2。AdminListTable に client-side 検索/ソート（`searchKeys`/`sortable`）を汎用追加 + 集計パネル。ロジックは純関数 `filterRows`/`sortRows`（unit test 7 件）。users/surveys/answers 全一覧に適用 + status 別集計を `StatisticList` で表示（StatisticPanel の pie は分析側に委ね軽量化） | [#36](https://github.com/sasakiyusuke2017015/wanonwan/pull/36)（merged） | — |
| 🟢 マージ済み（検証中） | [添付ファイル基盤（MinIO + presigned URL）](plans/2026-06-18-1330-attachments-minio.md) | presigned URL でブラウザが MinIO へ直接 up/down、API は認可+メタのみ。単一 `attachments` 表(polymorphic)+entity_type 別 RLS。Phase1=storage lib+MinIO compose+表/RLS/pgTAP+面談添付 API/UI。Phase2=回答/資料/アバター+`AttachmentsPanel`共通化。Phase3=stg/prod に MinIO + nginx の storage サブドメイン配線 | Phase1: [#40](https://github.com/sasakiyusuke2017015/wanonwan/pull/40)（merged） / Phase2: [#41](https://github.com/sasakiyusuke2017015/wanonwan/pull/41)（merged） / Phase3: [#44](https://github.com/sasakiyusuke2017015/wanonwan/pull/44)（merged） | — |
| 🟢 マージ済み（検証中） | [AI 機能: 面談メンター提案 + 自由記述の要約/分析（Claude + pgvector）](plans/2026-06-18-1900-ai-pgvector-mentor-summary.md) | Phase A=Claude(`@anthropic-ai/sdk`/Sonnet 4.6)で面談要約（`lib/ai`+`POST /answers/[id]/summary`+UI、merged）。Phase B=pgvector RAG メンター提案（**自前ホスト埋め込み** TEI/e5-small・profile ai・社外送信なし、lazy 生成、`POST /answers/[id]/mentor`+UI、key/URL 未設定で無効）。**いずれもキー/URL 未設定で外部送信ゼロ** | Phase A: [#42](https://github.com/sasakiyusuke2017015/wanonwan/pull/42)（merged） / Phase B: [#43](https://github.com/sasakiyusuke2017015/wanonwan/pull/43)（merged） / 再land fix: [#49](https://github.com/sasakiyusuke2017015/wanonwan/pull/49)（merged） | — |
| 🟢 マージ済み（検証中） | [非同期/定期ジョブ基盤（pg_cron + pgmq）](plans/2026-06-18-2030-async-jobs-pgmq-pgcron.md) | 拡張だけ入っていた pgmq/pg_cron に実働基盤。Phase1=**添付の孤児掃除**（status 100 の古い行を pg_cron 純 SQL で定期削除。`app.is_stale_attachment`純関数+`app.gc_stale_attachments` SECURITY DEFINER・30分毎）。Phase2a=pgmq キュー + DELETE enqueue トリガ + 専用 Node worker(`apps/worker`)で MinIO 本体削除（parseGcMessage unit 8・superuser 接続・at-least-once）。Phase2b=Dockerfile.worker（pnpm deploy→type-stripping・docker build 実機確認）+ CD の worker image build/push + stg/prod compose の worker サービス | Phase1: [#45](https://github.com/sasakiyusuke2017015/wanonwan/pull/45)（merged） / Phase2a: [#46](https://github.com/sasakiyusuke2017015/wanonwan/pull/46)（merged） / Phase2b: [#47](https://github.com/sasakiyusuke2017015/wanonwan/pull/47)（merged） | — |
| ✅ 検証完了 | [添付の complete 実体検証 + アバター置換の安全化（レビュー HIGH 対応）](plans/2026-06-19-0130-attachments-complete-validation.md) | [triage レビュー](reviews/2026-06-19-0038-plans-review-triage.md) の添付 HIGH/MEDIUM 修正。complete は `HeadObject` でサーバ真値検証（不在422/超過413/不許可415、size は実測）+ presign 前に MIME allowlist + 最大20MB（`policy.ts` unit5）。avatar は作成時に旧を消さず **complete 成功時に置換**（unique index を status=200 限定に変更）。一覧/DL を status=200 限定 | [#48](https://github.com/sasakiyusuke2017015/wanonwan/pull/48)（merged） | — |
| 🟢 マージ済み（検証中） | [turbo (Turborepo) 導入 + scripts ergonomics 整理](plans/2026-06-22-1447-turbo-monorepo.md) | monorepo のタスク実行を **turbo (Turborepo)** に統一し、`build` / `lint` / `typecheck` / | [#51](https://github.com/sasakiyusuke2017015/wanonwan/pull/51)（merged） | [計画レビュー](reviews/2026-06-22-1558-turbo-monorepo-review.md) / [コードレビュー](reviews/2026-06-22-1902-turbo-monorepo-review.md) |
| 🟢 マージ済み（検証中） | [@ui-catalog/core に eslint を整備し lint を機能させる](plans/2026-06-22-1626-ui-eslint-setup.md) | `packages/ui`（`@ui-catalog/core`）の `lint` script は `eslint . --ext .ts,.tsx` だが、 | [#50](https://github.com/sasakiyusuke2017015/wanonwan/pull/50)（merged） | [コードレビュー](reviews/2026-06-22-1755-ui-eslint-setup-review.md) |
| 🟢 マージ済み（検証中） | [DB レイヤを outputs/infra-data → packages/db に移す](plans/2026-06-22-1940-db-layer-to-packages.md) | DDL / RLS / seed / pgTAP の実体が `outputs/infra-data/` に置かれているが、`outputs/` は本来 | [#52](https://github.com/sasakiyusuke2017015/wanonwan/pull/52)（merged） | [コードレビュー](reviews/2026-06-22-1951-db-layer-to-packages-review.md) |
| ✅ 検証完了 | [dev の GoTrue ユーザ作成を再現可能にする（dev:up でログインできる状態に）](plans/2026-06-23-0005-dev-gotrue-users-bootstrap.md) | クリーンな `pnpm dev:up`（特に `compose:dev:down -v` で volume 破棄した後）から | [#53](https://github.com/sasakiyusuke2017015/wanonwan/pull/53)（merged） | [計画レビュー](reviews/2026-06-23-0030-dev-gotrue-users-bootstrap-review.md) / [コードレビュー](reviews/2026-06-23-0045-dev-gotrue-users-bootstrap-code-review.md) |
| 🟢 マージ済み（検証中） | [provision を dev/stg/prod 3 環境対応にする（provision:dev 追加）](plans/2026-06-25-0101-provision-dev.md) | `pnpm provision:stg` / `provision:prod` はあるが **`provision:dev` が無い**。`scripts/provision.mjs` | [#55](https://github.com/sasakiyusuke2017015/wanonwan/pull/55)（merged） | [計画レビュー](reviews/2026-06-25-0130-provision-dev-review.md) / [コードレビュー](reviews/2026-06-25-0144-provision-dev-code-review.md) |
| 🟢 マージ済み（検証中） | [seed の CSV 化 + マスタ管理基盤（管理画面 / provision 投入 / 順序ローダー）](plans/2026-06-25-1025-seed-csv-master-admin.md) | seed を手書き SQL から CSV 化し FK 依存順ローダー（非空スキップ=初回投入専用）で投入。provision を 2 モード化（単一 admin / `--users-csv` の N 名一括・行単位冪等・一時 PW を 0600 ファイル + must_change）。組織/役職マスタの CRUD 管理画面（`/admin/org`・`/admin/positions`）を新設 | [#56](https://github.com/sasakiyusuke2017015/wanonwan/pull/56) merged | [計画レビュー](reviews/2026-06-25-1031-seed-csv-master-admin-review.md) / [コードレビュー](reviews/2026-06-25-1431-seed-csv-master-admin-code-review.md) |
| 🟢 マージ済み（検証中） | [権限(認可)と役職(HR)の分離 — users.role 導入](plans/2026-06-25-1558-separate-role-from-position.md) | admin 判定を positions.code 990-999 → `users.role='admin'` へ移行。positions は純粋 HR マスタ化（999 廃止・#56 の昇格ガード撤去）。最後の admin を 0 人にする操作を DB トリガーで拒否。多層防御（RLS + valibot picklist + DB CHECK + トリガー）を pgTAP で担保 | [#57](https://github.com/sasakiyusuke2017015/wanonwan/pull/57) merged | [コードレビュー](reviews/2026-06-25-1627-separate-role-from-position-code-review.md) |
| 🟢 マージ済み（検証中） | [app shell（レイアウト/テーマ）を旧 1on1 の見た目に寄せる](plans/2026-06-28-2212-app-shell-legacy-look.md) | apps/web の app shell の **見た目・動き・アニメーション・デザインを丸ごと旧 1on1 アプリに寄せる**。 | [#59](https://github.com/sasakiyusuke2017015/wanonwan/pull/59)（merged） | [コードレビュー](reviews/2026-06-28-2247-app-shell-legacy-look-review.md) |
| 🟢 マージ済み（検証中） | [設問マスタ（設問バンク）＋ seed 選択肢の文言化](plans/2026-06-29-1327-survey-question-master.md) | 設問を `/admin/questions` のマスタに昇格＋アンケート編集はマスタ設問を「呼ぶ／外す」形へ（link/unlink API・eval_item 入力追加）。radio seed を同意度 5 段階で文言化。緊急度マスタは Phase2/別 Plan に分離（値域 code+label 確定） | PR-A: [#60](https://github.com/sasakiyusuke2017015/wanonwan/pull/60) / PR-B: [#61](https://github.com/sasakiyusuke2017015/wanonwan/pull/61) | [計画(Claude)](reviews/2026-06-29-1352-survey-question-master-review.md) / [計画(Codex)](reviews/2026-06-29-1400-survey-question-master-review.md) / [再計画(Codex)](reviews/2026-06-29-1410-survey-question-master-review.md) / [コード PR-A(Codex)](reviews/2026-06-29-1438-survey-question-master-code-review.md) / [コード PR-B(agent)](reviews/2026-06-29-1512-survey-question-master-code-review-prb.md) |
| 🟢 マージ済み（検証中） | [緊急度マスタ（surveys / answers 共通）](plans/2026-06-29-1537-urgency-master.md) | 緊急度（高/中/低）を共通マスタ化。PR-1=urgency_levels テーブル+RLS+`/admin/urgencies`+API+seed+pgTAP / PR-2=surveys・answers に urgency_id 配線（SurveyForm・InterviewForm に書き手 UI）。設問マスタ Phase2 から分離 | PR-1: [#62](https://github.com/sasakiyusuke2017015/wanonwan/pull/62)（merged）/ PR-2: [#63](https://github.com/sasakiyusuke2017015/wanonwan/pull/63) | [計画(Claude)](reviews/2026-06-29-1612-urgency-master-review.md) / [コード PR-1(agent)](reviews/2026-06-29-1631-urgency-master-code-review-pr1.md) / [コード PR-2(agent)](reviews/2026-06-29-1708-urgency-master-code-review-pr2.md) |
| 🟢 マージ済み（検証中） | [緊急度の一覧表示（admin surveys / answers）](plans/2026-06-29-1740-urgency-list-display.md) | 緊急度（高/中/低）を admin 一覧（surveys / answers）に色付き Badge で表示。一覧 API に urgency_levels を join、色はマスタ段数可変に耐える相対順位方式、ソートは urgencyCode 基準 | [#79](https://github.com/sasakiyusuke2017015/wanonwan/pull/79) | [コードレビュー](reviews/2026-07-06-0739-urgency-list-display-review.md) |
| 🟢 マージ済み（検証中） | [UI フィードバック基盤（Toast 配線・削除確認・ルート境界）](plans/2026-07-05-0101-ui-feedback-foundation.md) | UI/UX 改善テーマ1。catalog 実装済みの Toast/ConfirmDialog をアプリ配線（保存/削除の成功トースト・破壊的操作の確認ダイアログ）+ `global-error`/`error`/`not-found`/`loading` のルート境界新設。Toast は遷移をまたぐ app Provider 方式（catalog に ToastProvider 追加・zIndex 10010） | [#64](https://github.com/sasakiyusuke2017015/wanonwan/pull/64) | [計画レビュー](reviews/2026-07-05-0115-ui-feedback-foundation-review.md) / [コードレビュー](reviews/2026-07-05-0210-ui-feedback-foundation-code-review.md) |
| 🟢 マージ済み（検証中） | [カタログ堅牢化（MarkdownPreview XSS 修正 + モーダルの focus-trap / ARIA）](plans/2026-07-05-0835-ui-catalog-hardening.md) | UI/UX 改善テーマ2。MarkdownPreview の無サニタイズ `dangerouslySetInnerHTML` を DOMPurify で封じ（アプリ未使用の潜在 XSS を catalog 層で無効化）、Modal/Dialog/EventModal に focus-trap + `role="dialog"`/`aria-modal` を付与。ConfirmDialog/AlertDialog はラッパのため自動で恩恵 | [#66](https://github.com/sasakiyusuke2017015/wanonwan/pull/66) | [計画レビュー](reviews/2026-07-05-0840-ui-catalog-hardening-review.md) / [コードレビュー](reviews/2026-07-05-0904-ui-catalog-hardening-code-review.md) |
| 🟢 マージ済み（検証中） | [DataTable 移植（ai_edu 版）+ admin 一覧の乗り換え](plans/2026-07-05-0920-datatable-port.md) | UI/UX 改善テーマ3。ai_edu 実戦検証済みの DataTable（列ヘッダソート/ページネーション/フィルタ/ColumnPicker/行アクション、テスト 1,593 行）を catalog へ移植（PR-A・死蔵の旧 DataTable を置換）→ AdminListTable をアダプタ化して admin 4 一覧 + マスタ 5 画面を乗り換え、apps/web の InteractiveTable 参照をゼロに（PR-B・テーマ追従はアダプタ scoped 注入） | PR-A: [#68](https://github.com/sasakiyusuke2017015/wanonwan/pull/68)（merged）/ PR-B: [#70](https://github.com/sasakiyusuke2017015/wanonwan/pull/70)（merged） | [計画レビュー](reviews/2026-07-05-0925-datatable-port-review.md) / [PR-A コードレビュー](reviews/2026-07-05-1510-datatable-port-code-review.md) |
| 🟢 マージ済み（検証中） | [フォーム UX 統一（テーマ4）](plans/2026-07-05-1745-form-ux-unification.md) | UI/UX 改善テーマ4。3 本柱: (1) 未保存変更の離脱警告（目玉・`beforeunload` + apps の `NavigationGuardProvider`/`useGuardedNavigate` でプログラム遷移集約 + popstate。catalog は beforeunload+dirty のみ）、(2) 成功/エラーフィードバック統一（MasterForm・設問マスタ単体にトースト・エラーはフォーム=インライン/行アクション=トースト）、(3) 生 UI フォームのカタログ化（QuestionForm・PublicationForm・AnswerForm radio/checkbox・認証）。要判断 4 点確定・**計画レビューで 3→4 PR に再分割**・笹木さん承認済み | PR-A: [#71](https://github.com/sasakiyusuke2017015/wanonwan/pull/71) / PR-B: [#72](https://github.com/sasakiyusuke2017015/wanonwan/pull/72) / PR-C1: [#73](https://github.com/sasakiyusuke2017015/wanonwan/pull/73) / PR-C2: [#74](https://github.com/sasakiyusuke2017015/wanonwan/pull/74) / PR-D: [#75](https://github.com/sasakiyusuke2017015/wanonwan/pull/75) | [計画レビュー](reviews/2026-07-05-1810-form-ux-unification-review.md) |
| 🟡 実装中 | [仕上げ（テーマ5・ページタイトル / 公開一覧 UX / ダークモード / VRT）](plans/2026-07-05-2015-finishing-touches.md) | UI/UX 改善テーマ5「仕上げ」。**フェーズ分割**: Phase1 ページタイトル・Phase2 公開一覧 UX（polish・**マージ済み・検証中**）/ Phase3 ダークモード（epic・三層モデル: semantic トークン反転境界 + design.ts 前景調整 + 114 箇所 repoint・FOUC 対策要）/ Phase4 VRT（epic・reg-suit + storycap + MinIO baseline・4-light→3→4-dark の additive 順序）。epic 2 本は着手時に独立サブ Plan 化 | Phase1: [#76](https://github.com/sasakiyusuke2017015/wanonwan/pull/76) merged / Phase2: [#77](https://github.com/sasakiyusuke2017015/wanonwan/pull/77) merged | [計画レビュー](reviews/2026-07-05-2040-finishing-touches-review.md) / [Phase1 コードレビュー](reviews/2026-07-05-2226-finishing-touches-code-review.md) / [Phase2 コードレビュー](reviews/2026-07-05-2300-finishing-touches-phase2-code-review.md) |
| 🟣 マージ承認待ち | [provision/seed 体系の 2 軸再編（(de)provision:{env}[:{step}]）](plans/2026-07-07-1412-provision-steps.md) | seed/provision 3 スクリプトを「環境 × ステップ + 依存グラフ + deprovision」の単一体系へ再編 | [#112](https://github.com/sasakiyusuke2017015/wanonwan/pull/112) | [計画レビュー](reviews/2026-07-07-1424-provision-steps-review.md) / [コードレビュー](reviews/2026-08-13-0120-provision-steps-review.md) / [コードレビュー v2](reviews/2026-08-13-0926-provision-steps-code-review-v2.md) |
| ✅ 検証完了 | [SubHeaderToolbar — DataTable の funnel 開閉 Toolbar を SubHeader chrome に統合](plans/2026-07-07-1430-subheader-toolbar.md) | DataTable (ai_edu 由来) の funnel 開閉 Toolbar と SubHeader の固定 chrome を合成した SubHeaderToolbar を新設し、未使用の ui-catalog 資産 (FilterField / DataCountDisplay / Pagination / SearchBar / ResetButton / Badge / Tooltip / Animated 等) を積極採用してテーブル体験を刷新する | [#81](https://github.com/sasakiyusuke2017015/wanonwan/pull/81)（merged）/ lint fix: [#84](https://github.com/sasakiyusuke2017015/wanonwan/pull/84)（merged）/ Phase 3-2: [#86](https://github.com/sasakiyusuke2017015/wanonwan/pull/86) | [Phase 1](reviews/2026-07-07-1822-subheader-toolbar-review.md) / [Phase 2](reviews/2026-07-07-1920-subheader-toolbar-review.md) / [Phase 3](reviews/2026-07-07-2010-subheader-toolbar-review.md) / [Phase 3-2](reviews/2026-07-14-0151-subheader-toolbar-phase3-2-review.md) |
| ✅ 検証完了 | [ui-catalog 上流最新版の選択的マージ（packages/ui 刷新）](plans/2026-07-16-2354-ui-catalog-upstream-sync.md) | ui-catalog 上流最新版 (ui.zip) を packages/ui へ選択的マージ。上流のみ変更 115 件採用 / wanonwan 独自部品維持 / 衝突 33 件個別マージ / 汎用新規部品のみ採用 | [#97](https://github.com/sasakiyusuke2017015/wanonwan/pull/97) | [計画レビュー](reviews/2026-07-17-0005-ui-catalog-upstream-sync-review.md) / [コードレビュー](reviews/2026-07-17-0040-ui-catalog-upstream-sync-code-review.md) |
| 🟢 マージ済み（検証中） | [マルチロール権限（admin / interviewer / member）とメニューからのロール切替](plans/2026-07-19-1631-interviewer-role.md) | マルチロール権限へ再設計（admin/interviewer/member、member 暗黙保有の `user_roles`・1 人が複数保有可）。ヘッダーメニューの視点切替、面談担当の指名 API + admin UI、担当面談画面を追加。認可 = 保有 union / 切替 = 表示のみ | 基盤: [#98](https://github.com/sasakiyusuke2017015/wanonwan/pull/98) / 切替+担当面談: [#99](https://github.com/sasakiyusuke2017015/wanonwan/pull/99) | [計画レビュー（改訂前版）](reviews/2026-07-19-1643-interviewer-role-review.md) / [計画レビュー（マルチロール改訂版）](reviews/2026-07-19-1701-interviewer-role-review.md) |
| ❌ 撤回 | [左ペインを ui-catalog 新 SidebarNav へ乗せ替え（展開⇄レール切替）](plans/2026-07-21-0224-sidebar-nav-v2.md) | **撤回**（左ペインの `SidebarNav` 単体乗せ替え。実装・検証まで到達したが見た目が要件に届かず、シェルごと刷新する [AppShell/Sidebar 採用](plans/2026-07-23-1357-appshell-sidebar-adoption.md) が後継として完了したため未マージで撤回）。得られた知見（Tailwind v4 で `tailwind.preset.ts` は app ビルドに読まれない / `sidebar-*` トークンは globals.css の `@theme inline` で定義する）は後継 Plan に引き継ぎ済み | TBD | [計画レビュー](reviews/2026-07-21-0235-sidebar-nav-v2-review.md) |
| ✅ 検証完了 | [AppShell / Sidebar 導入とアプリシェル刷新（ui-catalog 上流同期 第 2 弾）](plans/2026-07-23-1357-appshell-sidebar-adoption.md) | ui-catalog 上流の AppShell / Sidebar 基盤（Cookie 永続 + Cmd+B + SSR 対応）を取り込み、apps/web のシェルを Sidebar + TopBar 構成へ全面刷新する。あわせて上流の 46 ファイル修正（DropdownMenu の portal バグ修正含む）を同期 | [#103](https://github.com/sasakiyusuke2017015/wanonwan/pull/103)（Phase A）/ [#104](https://github.com/sasakiyusuke2017015/wanonwan/pull/104)（Phase B） | [計画レビュー 1](reviews/2026-07-23-1410-appshell-sidebar-adoption-review.md) / [計画レビュー 2](reviews/2026-07-23-1435-appshell-sidebar-adoption-review2.md) / [計画レビュー 3](reviews/2026-07-23-1500-appshell-sidebar-adoption-review3.md) / [コードレビュー Phase A](reviews/2026-07-23-1505-appshell-sidebar-phase-a-code-review.md) / [コードレビュー Phase B](reviews/2026-07-23-1540-appshell-sidebar-phase-b-code-review.md) |
| ✅ 検証完了 | [packages/ui の既存テスト 13 失敗を解消する](plans/2026-07-23-2023-ui-catalog-broken-tests.md) | packages/ui に長く放置されている 13 テスト失敗（6 スイート）を、原因を 3 分類に切り分けて解消する。CI ゲート外のため気付かれずに溜まっていたもの | [#105](https://github.com/sasakiyusuke2017015/wanonwan/pull/105) | [コードレビュー](reviews/2026-07-23-2045-ui-catalog-broken-tests-review.md) |
| 🟢 マージ済み（検証中） | [@wanonwan/storage 切り出しと packages/db/seed の用途別再編](plans/2026-07-24-0110-storage-package-db-seed-restructure.md) | web/worker で重複する S3Client を `@wanonwan/storage` へ集約し env を必須検証化。あわせて `packages/db/seed/` を master/users/demo に再編 | [#107](https://github.com/sasakiyusuke2017015/wanonwan/pull/107)（storage） / [#108](https://github.com/sasakiyusuke2017015/wanonwan/pull/108)（db-seed） | [storage コードレビュー](reviews/2026-07-24-1531-storage-package-review.md)（APPROVE） / [db-seed コードレビュー](reviews/2026-07-24-1531-db-seed-layout-review.md)（APPROVE） |
| 🟢 マージ済み（検証中） | [packages/db に migrations/ + snapshot/ を導入](plans/2026-07-24-0210-db-migrations-snapshot.md) | DDL を「migrations が真実・snapshot は生成物」体制へ。本番を止めずに更新でき、空 DB は snapshot で高速初期化 | [#109](https://github.com/sasakiyusuke2017015/wanonwan/pull/109) | [2026-07-24-1146-...-review.md](reviews/2026-07-24-1146-db-migrations-snapshot-review.md)（APPROVE） |
| 🟣 マージ承認待ち | [DataTable 上流機能の選択的手移植（見た目は wanonwan 版を保持）](plans/2026-07-24-1806-datatable-upstream-feature-port.md) | ui-catalog 上流 DataTable の**機能**（テキスト/数値範囲/日付フィルタ・FilterField UI・`Column.sortValue`・`ClientQueryState.defaultSort`・行削除 disabled・`filterDefs.ts`）を wanonwan 版 DataTable へ手移植。SubHeaderToolbar 連携・DataCountDisplay/Pagination の catalog 化など wanonwan 独自の見た目は保持する | [#110](https://github.com/sasakiyusuke2017015/wanonwan/pull/110) | [コードレビュー](reviews/2026-07-24-1848-datatable-upstream-feature-port-review.md) |
| 🟣 マージ承認待ち | [プロジェクト名を waoon → wanonwan に全面改称](plans/2026-08-13-0107-rename-wanonwan.md) | プロジェクト名 waoon を **Wanonwan** へ全面改称。npm パッケージ名 / env 変数 / DB 名 / MinIO バケット / compose project / Cookie / コンテナイメージ / 全ドキュメント（`outputs/` 履歴含む）を一括置換し、env キー改名で fail-open する `check-secrets.mjs` を fail-closed 化する | [#117](https://github.com/sasakiyusuke2017015/waoon/pull/117) | [計画レビュー](reviews/2026-08-13-0113-rename-wanonwan-review.md) / [コードレビュー](reviews/2026-08-14-1125-rename-wanonwan-code-review.md) |
| ⚪ 実装待ち | [VRT（reg-suit + 撮影層 + CI）](plans/2026-08-14-0020-vrt.md) | 仕上げ Phase 4 のサブ Plan。reg-suit + 撮影層（catalog 171 stories + app ページ）で light baseline を敷き、ダークの 143 箇所トークン置換の差分を検出できる状態にする。compare はローカル baseline で成立させ、リモート共有と CI 自動化のみ stg MinIO 待ち | — | [計画レビュー](reviews/2026-08-14-0043-vrt-review.md) |
| 🟡 実装中 | [ダークモード（semantic トークン反転 + colorScheme 軸）](plans/2026-08-14-0025-dark-mode.md) | 仕上げ Phase 3 のサブ Plan。反転境界を semantic トークン層に引き、`colorScheme` 軸（light/dark/system）+ FOUC 対策を追加。背景テーマ 9 軸とは直交させ、app の 167 箇所のハードコード色を semantic トークンへ repoint する | — | [計画レビュー](reviews/2026-08-14-0043-dark-mode-review.md) / [コードレビュー 3a-3c](reviews/2026-08-14-0933-dark-mode-review.md) |
| 🟡 実装中 | [.claude ハーネス層の未配線設定を片付ける + ダッシュボード drift 検知](plans/2026-08-15-1454-claude-harness-cleanup.md) | `.claude/` に「存在するが繋がっていない設定」（settings.json の allow 75 件・未配線 hooks 14 個・無関係 skills / MCP テンプレ）が溜まっており、配線した瞬間に運用と衝突する状態を解消する。あわせて `gen-outputs-readme.mjs --check` を CI に足し、ダッシュボードの drift を機械検知にする | [step 1](https://github.com/sasakiyusuke2017015/waoon/pull/126) | [計画レビュー](reviews/2026-08-15-1500-claude-harness-cleanup-review.md) |

## 残検証

`🟢 マージ済み（検証中）` の Plan に残っている未チェック項目を全 Plan から集めたもの。
**検証の真実源は各 Plan のチェックボックス**で、この節はその投影。消化したら対応 Plan の
チェックボックスを更新して再生成する（別途チェックリストを作らない）。

### [デプロイ基盤（stg/prod compose + nginx + CD + prod provisioning）](plans/2026-06-12-1530-deploy-infra.md)

- [ ] **マージ後検証**（stg 実環境・笹木さん）
  - [ ] `pnpm check:secrets:stg` が弱い secret（`dev-only-...` 等）を弾き、実値では通る
  - [ ] `infra/.env.stg` を実値で用意し `pnpm compose:stg:up` が起動（未設定 secret で起動失敗することも確認）
  - [ ] CD（develop push）で GHCR build/push → stg deploy、migration が web 起動前に流れる
  - [ ] nginx 経由 HTTPS でトップ描画 / X-Forwarded-For の実 IP 注入が効く / `/api/v1/auth/login` が nginx 一次レートリミットで 429
  - [ ] `pnpm provision:prod`（stg 相当）で admin 発行 → そのアカウントでログイン成功
  - [ ] `backup-db.sh` で dump → 別 DB へ restore 成功
  - [ ] prod でも同手順（`*:prod`）で再現

### [API 堅牢化: ESLint 立ち上げ + 認証プリミティブ import ガード + 挙動不変 integration test](plans/2026-06-17-2210-api-hardening-lint-guard.md)

- [ ] 親 Plan（[pleasanter-exit-1on1-rebuild §10 残課題](plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md#L339)）の該当項目を消し込み

### [フォームのフィールド単位 valibot エラー表示](plans/2026-06-17-2240-form-field-level-errors.md)

- [ ] 親（dashboard）の見た目磨き込み #2 を消し込み

### [管理一覧のフィルタ/ソート + StatisticPanel](plans/2026-06-18-1115-admin-list-filter-sort-stats.md)

- [ ] コードレビュー
- [ ] PR マージ
- [ ] dashboard 見た目磨き込み #2 の該当項目を消し込み

### [添付ファイル基盤（MinIO + presigned URL）](plans/2026-06-18-1330-attachments-minio.md)

- [ ] Phase 1 コードレビュー
- [ ] **マージ後検証（Phase 3・stg/prod 実環境・笹木さん）**
  - [ ] `storage.<domain>` の DNS A レコード + 証明書 SAN に storage 名が入っている
  - [ ] 公開ホスト経由で実 upload / download（SigV4 整合・サブドメイン方式）
  - [ ] `check-secrets` が `MINIO_ROOT_PASSWORD` を必須チェックする

### [AI 機能: 面談メンター提案 + 自由記述の要約/分析（Claude + pgvector）](plans/2026-06-18-1900-ai-pgvector-mentor-summary.md)

- [ ] Plan ドラフト完成（本ファイル）
- [ ] **§3.1 プライバシー方針の組織/笹木さん承認**（最優先ブロッカー）
- [ ] §3.2 埋め込みプロバイダ決定 / §3.3 モデル・同期方針確認
- [ ] 計画レビュー / 笹木さん承認
- [ ] Phase A コードレビュー
- [ ] **承認時に確定**: 送信データの最小化/マスキング（§3.1(d)）— 送信 field・文字数・類似件数を確定（レビュー HIGH。有効化前に必須）
- [ ] **マージ後検証: gate on 側** — **§3.1 の組織承認 + 実 API キー待ちでブロック中**（承認が下りるまで実施しない）
  - [ ] gate on で「AI 要約」→ 要約が返る（面談者 / admin のみ・他人 403・空 400・Claude 失敗 502）
  - [ ] `pnpm compose:ai:up` 後「メンター提案」→ 類似過去面談を文脈に提案（`EMBEDDINGS_URL` 設定）
  - [ ] gate on 時もプロンプト本文がサーバログに残らない
  - [ ] stg / prod に key・URL を secret 配備して要約 / メンターが返る。レイテンシとコストが許容範囲

### [非同期/定期ジョブ基盤（pg_cron + pgmq）](plans/2026-06-18-2030-async-jobs-pgmq-pgcron.md)

- [ ] 計画レビュー / 笹木さん承認
- [ ] **Phase 2b runtime 検証（stg 実環境・笹木さん）**
  - [ ] CD で `wanonwan-worker` image が build / push される
  - [ ] migration 後の `dc up -d web worker nginx` で worker が起動し、superuser 接続で pgmq を消化する
  - [ ] 実環境で添付削除 → enqueue → worker が MinIO 本体を削除

### [turbo (Turborepo) 導入 + scripts ergonomics 整理](plans/2026-06-22-1447-turbo-monorepo.md)

- [ ] PR 作成 → 笹木さんマージ承認
- [ ] PR merge
- [ ] マージ後検証（CI green / CD image build）

### [@ui-catalog/core に eslint を整備し lint を機能させる](plans/2026-06-22-1626-ui-eslint-setup.md)

- [ ] PR 作成 → 笹木さんマージ承認
- [ ] PR merge
- [ ] マージ後検証（CI green 確認。ui lint/typecheck は実装時に green 済み）

### [DB レイヤを outputs/infra-data → packages/db に移す](plans/2026-06-22-1940-db-layer-to-packages.md)

- [ ] PR 作成 → 笹木さんマージ承認
- [ ] PR merge
- [ ] マージ後検証（CD で image SQL 非混入 / CI green）

### [provision を dev/stg/prod 3 環境対応にする（provision:dev 追加）](plans/2026-06-25-0101-provision-dev.md)

- [ ] PR 作成 → 笹木さんマージ承認
- [ ] PR merge
- [ ] マージ後検証（CI green / stg・prod は実環境で別途）

### [seed の CSV 化 + マスタ管理基盤（管理画面 / provision 投入 / 順序ローダー）](plans/2026-06-25-1025-seed-csv-master-admin.md)

  - [ ] **ブラウザ手動確認**: `/admin/org`（本部/部/課）・`/admin/positions` の一覧/新規/編集/削除（笹木さん）

### [権限(認可)と役職(HR)の分離 — users.role 導入](plans/2026-06-25-1558-separate-role-from-position.md)

  - [ ] **ブラウザ手動確認**: ユーザー編集の「権限（管理者/一般）」トグル（笹木さん）

### [app shell（レイアウト/テーマ）を旧 1on1 の見た目に寄せる](plans/2026-06-28-2212-app-shell-legacy-look.md)

- [ ] ブラウザ目視（dev 起動、全画面の崩れ確認）
- [ ] レビュー → PR → develop マージ

### [設問マスタ（設問バンク）＋ seed 選択肢の文言化](plans/2026-06-29-1327-survey-question-master.md)

- [ ] マージ後検証（dev 実機）
  - [ ] クリーン再投入で回答画面の radio が同意度 5 段階で表示
  - [ ] 設問マスタ `/admin/questions` の CRUD（eval_item・選択肢の改行入力）
  - [ ] アンケート編集で「マスタから追加」「外す(unlink)」が効く（他アンケートを巻き込まない）
  - [ ] 非 admin で設問マスタ画面がガードされる（(admin)/layout.tsx + RLS）

### [緊急度マスタ（surveys / answers 共通）](plans/2026-06-29-1537-urgency-master.md)

- [ ] マージ後検証（dev 実機）
  - [ ] `/admin/urgencies` の CRUD（非 admin でガード）
  - [ ] SurveyForm で緊急度を設定 → 保存 → 再表示で保持（編集時に勝手にクリアされない）
  - [ ] 面談記録（InterviewForm）で緊急度を設定 → 保存 → 保持
  - [ ] 未設定（null）で保存できる / 設定済みを「なし」にしてクリアできる
  - [ ] 使用中の緊急度をマスタ削除しようとすると 409

### [緊急度の一覧表示（admin surveys / answers）](plans/2026-06-29-1740-urgency-list-display.md)

- [ ] マージ後検証（dev 実機）
  - [ ] surveys/answers 一覧に緊急度 Badge が出る（高=赤 / 中=黄 / 低=緑、未設定は "—"）
  - [ ] 緊急度でソートできる（低↔高、未設定は端）
  - [ ] マスタ段数を変えても色が破綻しない（相対順位）

### [UI フィードバック基盤（Toast 配線・削除確認・ルート境界）](plans/2026-07-05-0101-ui-feedback-foundation.md)

- [ ] マージ後検証（手動確認チェックを消化）
  - [ ] 保存成功トーストが遷移後の画面で表示される（SurveyForm → 一覧）
  - [ ] 失敗（error）トーストが自動で閉じない
  - [ ] 設問「外す」/ 掲載・添付の削除で ConfirmDialog が出て、キャンセルで何も起きない
  - [ ] 存在しない URL で not-found 画面が出る
  - [ ] ページ内エラーで error.tsx（シェル維持 + 再試行）が出る

### [カタログ堅牢化（MarkdownPreview XSS 修正 + モーダルの focus-trap / ARIA）](plans/2026-07-05-0835-ui-catalog-hardening.md)

- [ ] マージ後検証（手動確認チェックを消化）

### [DataTable 移植（ai_edu 版）+ admin 一覧の乗り換え](plans/2026-07-05-0920-datatable-port.md)

- [ ] マージ後検証（手動確認チェックを消化）

### [フォーム UX 統一（テーマ4）](plans/2026-07-05-1745-form-ux-unification.md)

- [ ] PR-B マージ後の対話挙動を手動検証（サイドナビ離脱 / 戻る / 暴発なし / beforeunload・要 dev 起動）
- [ ] マージ後の手動検証（下記まとめ）
- [ ] 残課題: AttachmentsPanel の file input / QuestionsEditor の並べ替え・行アクションの catalog 化（別途）
- [ ] マージ後検証（手動確認チェックを消化）

### [マルチロール権限（admin / interviewer / member）とメニューからのロール切替](plans/2026-07-19-1631-interviewer-role.md)

- [ ] 笹木さんの再承認（改訂版に対して）
- [ ] **マージ後検証**（dev 実起動 + HTTP/API で 2026-07-19 実施。挙動は全項目 PASS）
  - [ ] ブラウザ目視スポットチェック（切替メニュー・担当面談画面の見た目。笹木さん）

### [@wanonwan/storage 切り出しと packages/db/seed の用途別再編](plans/2026-07-24-0110-storage-package-db-seed-restructure.md)

- [ ] マージ後検証
  - [ ] stg: 添付の up/down と worker GC（`STORAGE_INTERNAL_ENDPOINT` 経由）… 稼働中 stg 環境が必要。CD deploy 再開時に実施

### [packages/db に migrations/ + snapshot/ を導入](plans/2026-07-24-0210-db-migrations-snapshot.md)

- [ ] マージ後検証
  - [ ] stg: snapshot 初回 → 増分 migration の本番相当フロー実証
