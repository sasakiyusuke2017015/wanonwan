# Plan: Pleasanter 排除 + 旧 1on1 ドメインの新スタック再構築

| 項目 | 値 |
|---|---|
| ステータス | ⚪ 実装待ち（計画レビュー対応後 APPROVE / 笹木さん承認待ち） |
| slug | `pleasanter-exit-1on1-rebuild` |
| 作成 | 2026-06-11 17:30 JST |
| 関連 PR / レビュー | [計画レビュー](../reviews/2026-06-11-1830-pleasanter-exit-1on1-rebuild-review.md) |
| git repo | `https://github.com/sasakiyusuke2017015/waoon.git`（**GitHub**） |
| 一次情報 | [doc/_techmemo-decoded.md](../../doc/_techmemo-decoded.md) / [doc/legacy-1on1/](../../doc/legacy-1on1/) / [付録A](#付録a-pleasanter-実スキーマ--新スキーマ対応) |

> 本 Plan は **計画ドラフト**。実装着手前に笹木さん承認を待つ（[plan-review-workflow.md](../../.claude/rules/plan-review-workflow.md)）。

---

## 1. ゴール / 非ゴール

### ゴール

旧 **1on1（アンケート／面談）アプリ**を、技術選定メモのスタックで **新規再構築**する。

- **Pleasanter を完全排除**（データストア・管理 UI・バッチ・権限の役割すべて）。
- データ永続化は **PostgreSQL 15 + 拡張群**（Docker、自前 Dockerfile）。
- 認証は **GoTrue**（旧: 自前 JWT + メモリ token-store を置換）。
- 認可は **RLS を最終ガード**、主認可は **API 層**（Next.js API Routes / Server Actions）。
- DB アクセスは **必ず API 経由**（SDK 直叩き・View 直公開・RPC は不採用）。
- **管理者用「ユーザー管理」「アンケート管理」画面を新規作成**（各：一覧・編集・新規作成）。Pleasanter 管理画面の代替。
- 旧 1on1 の **回答者主要フロー（ログイン→アンケート一覧→回答→面談）をフル移植**。
- 見た目は **ui-catalog + テーマシステムを踏襲**（submodule + `link:` 取り込み）。
- 構成は **モノレポ（pnpm workspace）**、dev/stg/prod を Docker Compose で統一。

### 非ゴール（今回スコープ外。Phase 2 / 将来）

| 項目 | 理由 |
|---|---|
| 既存 Pleasanter **実データ移行スクリプト** | 決定: スキーマ + アプリ再構築のみ。初期データは seed。実データ移行は別タスク |
| AI 機能（FAQ/メンター/レコメンド）・LLM 基盤・pgvector | 技術メモで「検討中（確度40）」。MVP 外 |
| MinIO / 添付ファイル | 旧 1on1 に必須機能なし。将来検討（確度60） |
| MFA | GoTrue で将来有効化。Coming Soon 表示のみ |
| reg-suit ビジュアル回帰 / Playwright VRT | 将来検討（確度55-60） |
| 2 テーマ（ビジネス/モダン）切替 | 将来検討（確度60）。テーマ機構自体は踏襲するが切替 UI は後 |
| 旧 schedule / job（Pleasanter バッチ）の完全再現 | コアは pg_cron + pgmq に置換するが、旧 `/api/jobs/*` の ad-hoc API は移植しない |

---

## 2. スコープ境界

- **触る**: 新規モノレポ一式（`apps/web` / `packages/*` / `infra/` / `outputs/infra-data/` / ルート設定 / `.gitea/workflows/`）。
- **触らない（参照のみ）**: [doc/legacy-1on1/](../../doc/legacy-1on1/)（旧コードは読むだけ。コピー流用はしない＝技術メモ「モックは見た目確認のみ・実装は新規」に準拠）。
- **前提（所与）**: Next.js 16 / React 19 / Postgres15 / GoTrue / ui-catalog / TanStack Query / Tailwind v4。代替スタックは検討しない。

---

## 3. 現状コンテキスト（解読サマリ）

旧 1on1 を 4 つの読み取り専用エージェントで解析した結果の要点。詳細は各レポート（本セッションの分析）と下記ファイル。

### 3.1 旧アプリの構造

- **apps/web**: React 19 + **Vite SPA**（react-router v7 / Jotai / TanStack Query / valibot / Tailwind v4 / `@ui-catalog/core`）。
- **apps/api**: **Hono** ベースの API（esbuild）。`infrastructure/pleasync.ts` で **Pleasanter REST + Pleasanter の PostgreSQL に直接接続**（200 件制限回避）。
- **libs/domain**: valibot バリデータ + 型 + Pleasanter アダプタ。
- **infra/pleasanter**: サイト定義 JSON（SiteId マッピング）。

### 3.2 ドメインモデル（Pleasanter SiteId → 新テーブル候補）

| 旧（Pleasanter） | SiteId | 新 Postgres テーブル（候補） | 主な内容 |
|---|---|---|---|
| ユーザーマスタ | 27924 | `users` | code/name/email/役職コード/所属(本部/部/課) |
| アンケートマスタ | 27917 | `surveys` | タイトル/設問集/AI プロンプト/対象区分/定員 |
| 質問マスタ | 27916 | `questions` | 設問文/回答形式/選択肢/必須/ソート順 |
| 掲載設定（Issues） | 27918 | `survey_publications` | 掲載状況/開始・完了日時/対象アンケート |
| 回答結果 | 27919 | `answers` | 回答状況/回答者/回答JSON/面談日/面談者/健康状態/評価 |
| スケジュール（Issues） | 27929 | `schedules` | 面談日時・イベント |
| 区分マスタ群 | 33485 等 | `org_units` / enum / seed | 本部/部/課/役職/面談方式 |

- **関連**: User 1—N Answer、Survey 1—N Publication、Publication 1—N Answer、Survey 1—N Question、Answer N—N User（回答者/面談者/面談候補/閲覧者）。
- **非自明な制約**（移行時に再設計すべき点）:
  - 面談候補・閲覧者は **JSON 配列で多値保存** → 正規化（中間テーブル）推奨。
  - 回答状況は `100→200→[400]→900` の遷移制約、掲載状況は 100/150/160/200/900/910/990。
  - 評価は固定 5 項目（満足度/業務負荷/職場環境/人間関係/ストレス）。

### 3.3 認証・認可の現状 → 移行方針

- 現状: 自前 JWT（access15分 / refresh7日）+ **メモリ token-store** + bcrypt（初期平文混在）。認可は **役職コード→ロール→静的 config**。ルーター層では role 未活用、`canAccessAnswer()` 等で個別判定（IDOR 対策）。
- 移行: 認証は **GoTrue**（token-store 廃止、refresh/recover を委譲）。ロールは下記 5 段階を **RLS + API 層**で表現。`users.gotrue_id` で GoTrue identity と業務 user を紐付け。

旧ロール（組織階層ベース。技術メモの「受講者/制作者/審査者」は ai-education 用なので waoon では採用しない）:

| ロール | 役職コード | 閲覧範囲 |
|---|---|---|
| employee | 300–499 | 自分 + 自分が面談者の回答 |
| section_head | 500–699 | + 同課 |
| department_head | 700–899 | + 同部 |
| division_head | 900–989 | + 同本部 |
| **admin** | 990–999 | 全件 + 管理画面 |

**認可の責務分担（確定）**: 技術メモ「主認可は API 層 / RLS は最小ガード・業務ロジックを持ち込まない」に従う。

- **API 層（主認可）**: 組織階層の絞り込み（同課/同部/同本部）・面談候補・面談内容閲覧者による可視範囲は、
  zod + TypeScript 関数（`canAccessAnswer()` 相当、旧 1on1 のロジックを移植）で **クエリ条件として** 表現する。
  単体テスト可能で、階層 JOIN を RLS に押し込まない。
- **RLS（最終ガード）**: 「**本人 / admin / 明示的 viewer**」の最小パターンのみ。API のバグや経路漏れで
  他人の行が出ないことを保証する二重防御。階層判定は RLS に持ち込まない。
- これにより pgTAP の対象は「本人可・他人不可・admin 全件・viewer 可」に収束する。

### 3.4 見た目（踏襲対象）

- **テーマ 3 軸**: 色（emerald 等）/ 形（sharp 等 = radius）/ 背景（paper 等）。Jotai + localStorage 永続化、`useThemeConfig(component)` で参照。
- **レイアウト骨格**: `AppLayout`（Header / SubHeader(タブ) / SideNav / BottomTabBar / Footer）。`useNavigationItems()` でナビ動的生成。
- **一覧の定石**: コンテナ(`index.tsx`)＋プレゼン(`layout.tsx`)分離、`hooks.tanstack.ts`、`tableColumns.tsx`（accessor/label/filter/render）、`InteractiveTable` or `CardGrid` + `StatisticPanel` + `LoadingZone`。
- **フォームの定石**: モード切替（edit/preview/review）、`useMutation`、`useAlert`/`useConfirm`、valibot スキーマ。
- → **新管理画面はこの定石をそのまま踏襲**（一覧=InteractiveTable、編集/新規=FormField+valibot+useMutation）。

---

## 4. 目標アーキテクチャ

技術メモ「README: 5 コンテナ構成」準拠（MinIO は今回除外し 4 コンテナ）。

```
External (HTTPS)
   → nginx (TLS終端・ルーティング・rate-limit)
   → apps/web (Next.js 16 App Router: UI + API Routes + Server Actions + lib/auth)
        → postgres (5432, public/auth/pgmq schema, RLS, pg_cron, pgmq)
        → gotrue   (9999, 認証エンジン, auth schema のみ)
```

- **DB ユーザ権限分離**: `supabase_auth_admin`(auth schema) / `app_user`(public schema) / `postgres`(migration)。
- **認証フロー**: web `/api/v1/auth/login` → GoTrue `/token` ラップ。middleware で jose 検証。RLS は `auth.uid` で `users.gotrue_id` を参照。
- **マイグレーション**: `outputs/infra-data/schema/*.sql`（純正 DDL）+ `99_rls.sql`。前進のみ（down は書かない）。`pnpm db:migrate`。
- **非同期**: 通知・将来の AI ジョブは pgmq + pg_cron（MVP では枠だけ）。

---

## 5. 実装フェーズ（順序付き）

> 各フェーズ末尾の【検証】【担当エージェント/スキル】はオーケストレーション計画（§7）と対応。

### Phase 0 — モノレポ基盤 ⟦必須⟧

1. pnpm workspace 初期化（`apps/web` / `packages/auth` / `packages/domain`）。`pnpm-workspace.yaml` / `turbo`（任意）/ ルート `tsconfig.base.json` / ESLint / Prettier。
2. ui-catalog を **このリポジトリへ clone してベンダリング**（`packages/ui` = `@ui-catalog/core`、nested `.git` 除去、waoon 内で管理）。
   submodule は採用しない（判断ログ参照）。**本配線（Tailwind v4 対応 / SCSS=sass / peerDeps）は専用ステップ**で行い、
   それまでは pnpm workspace から除外（`!packages/ui`）して install を軽量に保つ。
3. Next.js 16 App Router 雛形 + Tailwind v4（ui-catalog プリセット共有）+ ThemeRoot（テーマ 3 軸の踏襲）。
4. `pnpm` scripts 統一（`dev` / `db:up` / `db:migrate` / `db:seed` / `db:psql` / `test` / `test:db` 等）。
- 【検証】`pnpm dev` でトップが描画 / `pnpm typecheck` 緑。
- 【担当】architect（構成）→ Claude 実装 → code-reviewer。

### Phase 1 — DB スタック + 認証基盤 ⟦必須⟧

1. `infra/data/Dockerfile.db`（postgres:15-bookworm + pgvector/pg_cron/pgtap/pgmq）+ compose（postgres / gotrue / nginx）。`docker compose build db`。
2. schema: `auth`(GoTrue) / `public`(業務) / `pgmq`。DB ユーザ権限分離。
3. `packages/auth`: GoTrue HTTP API への薄ラッパ（login/refresh/recover/logout、約200行、fetch 直叩き）。
4. `apps/web` middleware（jose 検証）+ `/api/v1/auth/*`。`users.gotrue_id` 連携。
5. **RLS ユーザーコンテキスト伝播（必須・認可の土台）**: DB アクセスは `app_user` 1 本（API 経由）なので、
   RLS が「誰のリクエストか」を知る機構を最初に固める。
   - API/Server Action は DB トランザクション開始時に検証済み JWT の `sub`（gotrue id）を
     `SET LOCAL app.current_user = '<gotrue_id>'`（or `request.jwt.claims`）で注入する。
   - RLS は安定関数 `app.current_user_id()`（`current_setting('app.current_user', true)` → `users.id` 解決）と
     `app.is_admin()` を参照する。直接の DB 接続にこの設定が無ければ RLS は **何も返さない**（fail-closed）。
   - この関数群を `99_rls.sql` の先頭に定義し、pgTAP は `SET LOCAL` 前提でシナリオを書く。
6. **GoTrue provisioning**: ユーザー作成は GoTrue admin API（service role）で identity 発行 →
   発行された sub を `users.gotrue_id` に保存 → 初期パスワード方針（強制変更フラグ）を決める。seed ユーザーも同経路。
- 【検証】login→JWT 取得→保護ルート到達。`SET LOCAL` 有/無で RLS の返却が変わることを pgTAP で確認。
- 【担当】security-reviewer（認証経路・RLS 伝播）必須 / tdd-guide。

### Phase 2 — データモデル + RLS ⟦必須⟧

1. DDL をドメイン別ファイルに（`10_users.sql` / `20_surveys.sql` / `30_answers.sql` / `40_schedules.sql` / `00_org.sql`）。多値（面談候補/閲覧者）は中間テーブルで正規化。
2. enum / ステータス（回答状況・掲載状況・健康状態・面談方式・評価5項目）を型 or マスタ seed 化。
3. `99_rls.sql`: 先頭に `app.current_user_id()` / `app.is_admin()`（Phase 1-5 で定義）。全業務テーブルに RLS。
   **RLS は最小パターン（本人 / admin / 明示的 viewer）に限定**し、組織階層の絞り込みは API 層が担う（§3.3 確定）。
4. pgTAP: 各テーブル代表シナリオ（本人可・他人不可・admin 全件・viewer 可）。`SET LOCAL` 前提。
5. seed（`infra-data/seed/*.sql`）: 組織マスタ・サンプルユーザー・サンプルアンケート。
- 【検証】`pnpm test:db` 全 RLS パターン緑。
- 【担当】architect（スキーマ/RLS 設計）→ tdd-guide（pgTAP）→ security-reviewer。

### Phase 3 — API 層（業務） ⟦必須/優先⟧

1. zod スキーマ + DTO を DDL 起点に整備（`packages/domain`）。
2. API Routes / Server Actions:
   - users（一覧/詳細/作成/更新、パスワードは GoTrue 経由）
   - surveys（一覧/詳細/作成/更新）+ questions
   - survey_publications（掲載 CRUD）
   - answers（一覧/詳細/回答提出/保存/面談実施/委任）
   - dashboard（統計/グラフ）
3. 認可は API 層（zod + ロール/所有者判定）、RLS は二重防御。
- 【検証】Vitest + Docker Compose 統合テスト。`canAccessAnswer` 相当の IDOR テスト。
- 【担当】tdd-guide → code-reviewer → security-reviewer（IDOR/認可）。

### Phase 4 — 管理者画面（新規） ⟦必須⟧ ★ユーザー要望の中心

旧 Pleasanter 管理画面の代替。**admin ロールのみ**（RLS + ルートガード）。一覧/編集/新規の 3 点セットを踏襲定石で。

1. **ユーザー管理** `/admin/users`
   - 一覧: InteractiveTable（code/name/email/所属/役職/ロール、フィルタ・検索）。
   - 新規 `/admin/users/new`・編集 `/admin/users/[id]/edit`: FormField + valibot（name/email/所属本部部課/役職コード）。作成時 GoTrue identity 同時発行 + 初期パスワード。
2. **アンケート管理** `/admin/surveys`
   - 一覧: アンケート + 掲載状況。
   - 新規/編集: アンケート定義（タイトル・設問構成・対象区分・AI プロンプト枠・定員）+ 掲載設定（開始/完了/状況）。設問は dnd 並び替え（旧 `@dnd-kit` 踏襲）。
- 【検証】admin/非 admin の表示・操作差分 E2E。バリデーション。
- 【担当】tdd-guide → code-reviewer / security-reviewer（権限境界） → e2e-runner。

### Phase 5 — 回答者主要フロー（フル移植） ⟦必須/優先⟧

旧 pages を App Router ルートへ再配置（コピーせず新規実装、見た目踏襲）。

| 旧 page | 新ルート | 区分 |
|---|---|---|
| Auth/Login | `/login` | 必須 |
| Survey/List | `/surveys` | 必須 |
| Survey/Detail（回答） | `/surveys/[publishId]` | 必須 |
| Answer/List | `/answers` | 必須 |
| Answer/Detail（面談） | `/answers/[id]` | 必須 |
| Dashboard | `/dashboard` | 優先 |
| Schedule | `/schedule` | 優先 |
| Chat/Project/Attendance 等 | `/*`（Coming Soon 枠） | 任意 |

- AI 生成（ストリーミング）は **枠のみ**（SSE 配線は Phase 2 機能扱い、ボタンは Coming Soon）。
- **見た目踏襲の受け入れ基準**: 各画面で旧 1on1 のスクショと並べて目視確認（レイアウト骨格・テーマ 3 軸・一覧/フォーム定石が再現できていること）。VRT 自動化は将来。
- 【検証】ログイン→回答→面談の E2E 1〜3 本。
- 【担当】tdd-guide → e2e-runner → code-reviewer。

> **マイルストーンゲート**: Phase 4 完了 = **管理者運用可能ライン**（ユーザー/アンケートを管理画面で投入できる）。
> Phase 5 完了 = **回答者公開ライン**（ログイン→回答→面談が通る）。Phase 6 で CI/デプロイを締める。

### Phase 6 — CI / デプロイ ⟦優先⟧

1. **`.github/workflows/`**（実リポジトリは GitHub）: typecheck / lint / test / test:db（pgTAP）/ build。
2. compose dev/stg/prod（stg/prod 同一構成）。`pnpm db:migrate` を CI/CD で。
3. nginx prod 設定。
- 【検証】CI 緑 / stg 起動確認。
- 【担当】build-error-resolver（CI 緑化）/ doc-updater。

---

## 6. 優先度 × 実現性の検証（ユーザー指定の観点）

| 領域 | 優先度 | 実現性 | 根拠 / リスク |
|---|---|---|---|
| Docker + Postgres 基盤 | 必須 | **高** | 技術メモ確度95、旧構成にも PG 直接接続実績あり |
| GoTrue 認証移行 | 必須 | **中** | 旧の自前 JWT/token-store から移行。GoTrue 単体運用 + RLS 連携の配線が肝。確度90 |
| RLS（組織階層認可） | 必須 | **中** | 階層閲覧（課/部/本部）はカスタム RLS。pgTAP で網羅必須。確度85-95 |
| API 一本化 | 必須 | **高** | 確度100。旧 Hono ロジックを Next.js API へ移すだけ（ストアが REST→SQL に変わる） |
| 管理者 2 画面（一覧/編集/新規） | 必須 | **高** | 踏襲定石が明確（InteractiveTable + FormField）。新規 CRUD なので素直 |
| 回答者フル移植 | 必須/優先 | **中** | Vite SPA → App Router の移植量が大。状態(Jotai)・ルーティング再設計が必要 |
| ui-catalog 取り込み | 必須 | **中** | submodule + link: の配線、Next.js `transpilePackages`、SCSS Modules 同梱の検証が要 |
| データモデル正規化 | 必須 | **中** | 多値 JSON（面談候補/閲覧者）を中間テーブル化する設計判断が必要 |
| AI 生成 / pgvector | 任意 | 低（今回外） | 確度40。Coming Soon 枠のみ |
| 実データ移行 | 任意（今回外） | 低 | 移行元 DB 接続前提。別タスク |

**結論**: 必須レンジは実現性 中〜高。最大リスクは (a) GoTrue×RLS の認可配線、(b) Vite→Next.js 移植量、(c) ui-catalog 取り込み。いずれも Phase 1-2 で先に潰す設計。

---

## 7. オーケストレーション計画（エージェント / スキル）

| フェーズ | 主スキル | 協働エージェント |
|---|---|---|
| 設計詰め | `/plan` → `/plan-review` | **architect**（構成/スキーマ/RLS）, **planner**（順序） |
| 実装 | `/tdd` | **tdd-guide**（テスト先行） |
| 認証/権限 | — | **security-reviewer**（必須: 認証経路・IDOR・RLS 漏れ） |
| 直後レビュー | `/pr-review` | **code-reviewer**（毎 Phase） |
| 管理/回答フロー | `/e2e` | **e2e-runner**（主要フロー 1-3 本） |
| CI 緑化 | `/build-fix` | **build-error-resolver** |
| ドキュメント | `/update-docs` | **doc-updater** |

- **直列原則**（[agent-orchestration.md](../../.claude/rules/agent-orchestration.md)）: 1 Phase = 1 ブランチ = 1 PR。編集系エージェントの並列は不可。読み取り調査（Explore）は並列可。
- レビュー収束: `[BLOCKER]` 解消で APPROVE。

---

## 8. リスクと緩和

| リスク | 影響 | 緩和 |
|---|---|---|
| GoTrue×RLS の認可配線ミス | 情報漏洩 | Phase 1-2 で先行。pgTAP 全テーブル + security-reviewer 必須 |
| Vite→Next.js 移植の量 | 工数超過 | Phase 分割。回答者フローは「枠先行→中身差し替え」（技術メモ Coming Soon 原則） |
| ui-catalog 取り込みの相性（SCSS Modules / transpilePackages） | ビルド不能 | Phase 0 で最小ページ描画を受け入れ基準に |
| 多値データの正規化漏れ | 後で破壊的変更 | Phase 2 でスキーマ確定、`no-backward-compat` 前提で一気に |
| Docker HMR が効かない | 開発体験劣化 | 技術メモ M-0624（WATCHPACK_POLLING 等）を Phase 0 受け入れ基準に |
| スコープ肥大（フル移植） | 期間長期化 | 必須→優先→任意で線引き。任意は Coming Soon |

---

## 9. 判断ログ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-06-11 | waoon の対象ドメインは **旧 1on1（アンケート/面談）**。技術メモは **スタック/思想のみ**採用（コース/認定の例示ドメインは不採用） | タスク 1 の明示要件（Pleasanter 排除・アンケート管理画面・回答者フロー踏襲） |
| 2026-06-11 | MVP スコープ = **回答者主要フローまで含むフル移植 + 管理者2画面** | ユーザー回答 |
| 2026-06-11 | **実データ移行は今回スコープ外**（schema + 再構築のみ、seed で開始） | ユーザー回答 |
| 2026-06-11 | ui-catalog は **submodule + link:** で取り込み | ユーザー回答（技術メモ準拠） |
| 2026-06-11 | ロールは旧 1on1 の **組織階層 5 段階**を採用（技術メモの受講者/制作者/審査者は不採用） | ドメイン不一致のため |
| 2026-06-11 | 新スキーマは **Pleasanter 実 site_package を一次情報**に設計（[付録A](#付録a-pleasanter-実スキーマ--新スキーマ対応)） | ユーザー提示（`site_package_2026_04.json`） |
| 2026-06-11 | 実リポジトリは **GitHub**（Gitea ではない）。CI は `.github/workflows/`、PR は `gh` | ユーザー提示の repo URL |
| 2026-06-11 | 計画レビュー BLOCKER①対応: RLS ユーザーコンテキストは **`SET LOCAL` + `app.current_user_id()`**（fail-closed）で伝播（Phase 1-5） | [計画レビュー](../reviews/2026-06-11-1830-pleasanter-exit-1on1-rebuild-review.md) |
| 2026-06-11 | 計画レビュー BLOCKER②対応: **階層認可は API 層が主、RLS は本人/admin/viewer の最小ガード**に確定（§3.3） | 技術メモ「RLS に業務ロジックを持ち込まない」に整合 |
| 2026-06-11 | 回答本体は MVP で `answer_json`(jsonb) 保持。設問別集計要件が出たら明細テーブルへ正規化 | 計画レビュー NICE-TO-HAVE |
| 2026-06-11 | ブランチ戦略は **3 層 `feature→develop→main`**（git-workflow.md）に統一。技術メモの GitHub Flow は不採用 | ユーザー決定 |
| 2026-06-11 | git init 済（`main` / origin=GitHub）。`doc/legacy-1on1/` は `.gitignore` | ユーザー決定 |
| 2026-06-11 | ui-catalog は **submodule をやめ、`packages/ui` に clone してベンダリング**（waoon 内で管理） | ユーザー決定（「submodule はまわりくどい」） |
| 2026-06-11 | Phase 0 のスタックを固定: Next.js 16.2.9 / React 19.2.7 / Tailwind 4.3 / TS 5.9 / pnpm 10.15。install/typecheck/build green | 実装時の registry 最新で確定 |
| 2026-06-11 | ui-catalog 統合は Phase 0 から分離（**v3 preset⇔Tailwind v4 差・SCSS(sass)・peerDeps** の解消が必要なため専用ステップ化） | 統合リスク回避 |
| 2026-06-11 | ui 本配線完了（`feature/ui-catalog-wiring`）。`tokens.css` は v4 `@theme` ネイティブ（v3 preset は未使用）、SCSS は `sass`、peer は旧 1on1 相当を導入、`transpilePackages` に `@ui-catalog/core`。`/ui-demo` で build green | 実装で確定 |
| 2026-06-11 | apps/web は ui ソースを Next が型チェックするため `noUncheckedIndexedAccess:false`、base から `verbatimModuleSyntax` 撤去（ui は strict だが両者未使用）。自社 packages(domain/auth) は base のまま厳格 | ui ソース整合のため |
| 2026-06-11 | Phase 1 インフラ PR（`feature/db-auth-stack`）: postgres15 自前 image（pgvector/pg_cron/pgtap/pgmq、pgmq はソースビルド）+ GoTrue `supabase/auth:v2.189.0` + 権限分離(app_user/supabase_auth_admin) + RLS context helper + `pnpm db:*`。起動検証 green。`packages/auth` ラッパ / Next middleware / provisioning は次 PR | スコープ分割（インフラ→アプリ層） |
| 2026-06-11 | RLS の GUC 名は **`app.user_id`**（`app.current_user` は予約語 `current_user` と衝突し `SET LOCAL` で構文エラー）。API は `SET LOCAL app.user_id = '<gotrue sub>'` を注入、`app.current_user_id()` が参照（未設定→NULL で fail-closed）。pg_cron は preload 後に `db:migrate` で作成 | 実装で判明 |
| 2026-06-11 | Phase 1 後半（アプリ層、`feature/auth-app-layer`）: `packages/auth`(GoTrue HTTP 薄ラッパ) + `apps/web` の lib/auth(jose 検証/httpOnly cookie) + `/api/v1/auth/{login,logout,refresh,me}` + `middleware`(未認証→/login) + /login ページ。**ログインループを実機検証**（未認証307→login 200+cookie→/me 200→保護トップ200→誤パス401）。access の `sub` が Phase 2 RLS の `app.user_id` 値 | 実装・検証 green |
| 2026-06-11 | `users.gotrue_id` provisioning は Phase 2（users テーブル作成後）へ。env 検証は build 落ち回避のため import 時 throw をやめ実行時（production で secret 必須） | 依存順 / next build 都合 |
| 2026-06-11 | Phase 2 データモデル+RLS（`feature/data-model-rls`）: 付録A に沿い org/users/surveys/questions/publications/answers/schedules + 中間テーブル(多値正規化)。RLS は本人/admin/viewer の最小ガード、組織階層は API 層。`app.is_admin()` を users×positions(役職コード990-999) に接続。db:seed/test:db 追加。pgTAP 全 PASS | 実装・検証 green |
| 2026-06-11 | answers ⇄ answer_viewers の RLS 相互参照で**無限再帰**が出たため、横参照を **SECURITY DEFINER 関数**(app.is_answer_viewer / owns_or_interviews_answer / interviews_answer)で RLS バイパスして解消 | 実装で判明 |
| 2026-06-11 | Phase 3 API 層（`feature/api-layer`）: DB クライアント(postgres.js, app_user) + `withUser(sub)` が `set_config('app.user_id', sub, true)` を注入＝**Phase1 認証 × Phase2 RLS を実コードで接続**。users API(一覧/詳細/作成/更新) + domain valibot。実機検証: admin は create 201、member(一般)は **403(RLS 42501)**、一覧は両者可、未認証 401 | 実装・検証 green |
| 2026-06-11 | bigint PK は postgres.js が文字列で返す（JS 精度回避）。API レスポンスでは id が string。フロント/型側で吸収する（必要なら数値化） | postgres.js 仕様 |
| 2026-06-11 | Phase 4-a 管理者「ユーザー管理」画面（`feature/admin-users`）: 一覧/新規/編集 + admin ガード(/me に isAdmin 追加) + org マスタ API。TanStack Query + Tailwind。実機検証 green。アンケート管理 + surveys API は次 PR | タスク1 中心要件 |
| 2026-06-11 | 管理画面 UI は当面 **Tailwind 機能 UI**（ui-catalog の organisms barrel は codemirror/marked peer 未導入のため）。InteractiveTable 等の ui-catalog 適用は Phase 5（見た目仕上げ）or organism-peer 導入後 | 統合コスト回避 |
| 2026-06-11 | Phase 4-b 管理者「アンケート管理」画面（`feature/admin-surveys`）: 一覧/新規/編集 + surveys API(CRUD)。**タスク1の管理者2画面が両方完成**。設問ビルダ/掲載管理は後続 | タスク1 中心要件 |
| 2026-06-11 | Phase 6 CI（`feature/ci`）: GitHub Actions で install/typecheck/build/pgTAP を自動化。CI green（~2分）。pnpm 版二重指定を packageManager 一本化で解消 | develop 保護の土台 |
| 2026-06-11 | Phase 4-c 設問ビルダ（`feature/survey-questions`）: questions API(追加/編集/削除/並び替え) + QuestionsEditor を survey 編集に統合。choices は jsonb(`tx.json`)。実機で CRUD/reorder/RLS(member 403) green。掲載管理(publications)は次 | アンケート実用化 |
| 2026-06-11 | Phase 4-d 掲載管理（`feature/survey-publications`）: publications API(CRUD) + PublicationsEditor を survey 編集に統合。状態(100-990)+期間。実機 green。これでアンケート→設問→掲載が揃い回答者フローが実データで動く | アンケート公開 |
| 2026-06-11 | Phase 5-a 回答者フロー（`feature/respondent-flow`）: /me/surveys(実施中一覧) + /publications/[id]/detail + answer 提出 API、/surveys と /surveys/[publishId] ページ(設問7形式レンダリング)。実機で 一覧→回答→保存→見直し green、回答の respondent=本人(RLS)。面談/ダッシュボード/見た目踏襲(ui-catalog本格適用)は後続 | 旧 1on1 の核 |
| 2026-06-11 | Phase 5-b 面談フロー（`feature/interview-flow`）: answers API(一覧/詳細/面談記録) + /admin/answers 一覧・詳細(回答内容 + InterviewForm: 日時/方式/健康状態/評価5項目/メモ/次回)。**RLS は本人にも UPDATE を許すため、面談記録は API 層で admin/面談者に限定**（回答者は 403）。実機検証で回答者の不正記録を阻止 = 主認可(API)/最終ガード(RLS) の二層を実証 | 1on1 のもう半分 |
| 2026-06-12 | 見た目踏襲 第1増分（基盤のみ, `feature/app-shell-theme`）: テーマ3軸(色/形/背景)を @ui-catalog の theme atom で配線 + AppLayout シェル(Header/SubHeader/SideNav/Footer/BackgroundTexture + モバイル下部タブ) + useNavigationItems(isAdmin で admin 項目出し分け) + テーマ切替モーダル。AppFrame が /login・/ui-demo を bare に、他は全ページにシェルを被せる。SSR=既定テーマ→mount後に保存テーマの mounted ゲートで hydration mismatch 回避。実機: admin ログイン→home/surveys/admin が200でシェル描画、/login bare、code-reviewer APPROVE | 機能が揃ったので質(見た目)を上げる |
| 2026-06-12 | **テーマ切替UI(色/形/背景パネル)を前倒し採用**（Plan 非ゴール「2テーマ切替＝将来検討」から繰り上げ） | ユーザー指示（基盤に含める） |
| 2026-06-12 | ui-catalog の **organisms/templates barrel を import しない**方針を確立。barrel は MarkdownEditor(codemirror peer 未導入) や CalendarPage(SSR で window 参照) を巻き込みビルド不能になるため、ベンダリング package.json に必要分のみ deep export(Modal/BackgroundTexture/Header/SubHeader/SideNav/Footer) を追加して個別 import する | 実装で判明（barrel 回避） |
| 2026-06-12 | 見た目踏襲 第2増分（管理一覧の定石化, `feature/admin-lists-uicatalog`）: 管理3一覧(users/surveys/answers)を素の table から @ui-catalog の InteractiveTable へ。再利用ラッパ AdminListTable(テーマ適用 + mounted ゲート + loading/empty/error + 行クリック遷移)を新設し、各ページは列定義(COLUMNS)+行データ map のみ。InteractiveTable も deep export 追加。実機: 200・SSRクラッシュ無し、code-reviewer APPROVE | 見た目踏襲の続き(一覧定石) |
| 2026-06-12 | 見た目踏襲 第3増分（フォーム定石化, `feature/admin-forms-uicatalog`）: 管理3フォーム(User/Survey/Interview)を素の Tailwind から ContentBlock(セクション)+FormField+Input/Select/TextArea/Checkbox+Button へ。共通 FormActions 新設。ContentBlock deep export 追加。フォームは (admin) ガード配下でクライアント描画のみ＝SSR されないため mounted ゲート不要 | 見た目踏襲の続き(フォーム定石) |
| 2026-06-12 | **@ui-catalog の Select は value!==undefined かつ options 未一致で先頭に自動フォールバックする**。未選択を空文字 `""` で渡すと先頭値に化ける回帰（コードレビュー BLOCKER B-1）。**未選択 Select には `value={form.X \|\| undefined}` を渡す**（空文字→undefined で Select の早期 return に乗せる）。再レビュー APPROVE | 実装で判明（Select 仕様） |
| 2026-06-12 | 見た目踏襲 第4増分（回答者フロー定石化, `feature/respondent-flow-uicatalog`）: AnswerForm を ContentBlock+FormField+Radio/Select/Checkbox/TextArea/Input へ（設問7形式）。送信前に必須未回答チェック。/surveys 一覧を Card グリッド+Badge へ。select 設問にも B-1 の `\|\| undefined` 対応。新規 deep export 無し（#17 部品を再利用）。実機 200・code-reviewer APPROVE | 見た目踏襲の続き(回答者フロー) |
| 2026-06-12 | **GoTrue provisioning 実装**（`feature/user-provisioning`）: ユーザー作成時に GoTrue admin API で identity 発行 → `users.gotrue_id` 紐付け（作成ユーザーがログイン不可だった穴を解消）。service_role トークンは jose 都度発行(exp 60s)、初期パスワードはサーバ生成(CSPRNG)し作成レスポンスで一度だけ返す。**GoTrue 発行前に app.is_admin() で 403**＋insert 時 RLS が最終ガード、失敗時は admin.deleteUser で orphan 掃除。実機: 非admin 403/作成 201+PW/作成ユーザーのログイン成功/重複 409。security 🟢LOW + code APPROVE | 実害の大きい穴を優先解消 |
| 2026-06-12 | 初期パスワードは **システム生成（一度だけ表示）** 方式（dev に SMTP 無しでリカバリメール方式が使えないため） | ユーザー決定 |
| 2026-06-12 | 認証レートリミット（`feature/auth-rate-limit`）: login(10/分)/refresh(30/分) に **IP 単位・固定ウィンドウのプロセス内メモリ limiter**（429+Retry-After）。email 単位は採らない（被害者 email を叩くアカウントロック DoS 回避）。プロセス内メモリは単一 next start 前提＝本番はエッジ(nginx)/Redis が本命。XFF は信頼 proxy 配下でのみ信頼。実機: 200→401×2→429。security 🟢LOW + code APPROVE | security.md「全EPにレートリミット」充足(MVP) |
| 2026-06-12 | 日時 tz 修正（`feature/datetime-jst`）: timestamptz に対し datetime-local(JST 壁時計)を**そのまま保存していたため実 instant が 9h ずれ**（掲載の実施中ウィンドウが UTC基準でズレ、表示も slice で UTC を見せ往復一致して気付きにくい）。`lib/datetime` で **JST(+09:00 固定)⇄UTC ISO** 変換を入れ、保存は jstInputToUtcIso・編集表示は utcIsoToJstInput・一覧は formatJstDateTime。API/DB は無改修（絶対時刻を素通し）。実機: 入力15:30→DB 06:30Z→表示15:30。code-reviewer APPROVE | データ整合（instant ズレ）修正 |

---

## 10. 残課題（後続タスク）

- 実データ移行スクリプト（Pleasanter DB → 新 Postgres）。
- AI 機能（FAQ/メンター）+ pgvector + LLM 基盤の Plan。
- MinIO / 添付・MFA / 2 テーマ切替 / reg-suit VRT。
- 旧 `/api/jobs/*`（Pleasanter バッチ）の pg_cron + pgmq 置換詳細設計。
- `.claude/rules/*`（git-workflow.md 等）の **Gitea / `tea` 前提の記述を GitHub / `gh` へ読み替え更新**
  （ブランチ戦略は 3 層のまま、ホスト固有記述のみ）。CI は `.github/workflows/`。
- ~~ui-catalog（`packages/ui`）の本配線~~ → **完了**（`feature/ui-catalog-wiring`）。「見た目踏襲」（Phase 5）の土台が立った。
  - ~~① テーマ 3 軸（色/形/背景）の配線~~ → **完了**（`feature/app-shell-theme`、AppLayout シェル + テーマ切替UI）。
  - 残: ② **各ページの ui-catalog 定石化**（一覧→InteractiveTable/CardGrid、フォーム→ContentBlock/FormField/valibot）。基盤の上に増分 PR で進める。
  - 残: ③ MarkdownEditor/MathView 等を使う場合の追加 peer（codemirror/katex/marked）と、それを使う organism の deep export 追加。
- `.claude/rules/*` の `zod`→`valibot` 等、ai-education 由来の例の waoon スタックへの読み替え。
- ~~**認証エンドポイントのレートリミット**~~ → **API 層で実装済み**（`feature/auth-rate-limit`、login/refresh の IP 単位 in-memory limiter）。残: 本番のエッジ(nginx)/Redis 化、分散攻撃 / credential stuffing 対策（captcha 等）、信頼 proxy での実 IP 注入。
- ~~**`users.gotrue_id` provisioning**~~ → **完了**（`feature/user-provisioning`、作成時に GoTrue identity 発行 + gotrue_id 紐付け + 初期パスワード生成）。残: 編集時の email/password の GoTrue 同期、初回ログイン後の force-change。
- ~~**日時の timezone 処理**: 掲載の datetime-local 入力が UTC 保存で表示ズレ~~ → **完了**（`feature/datetime-jst`、`lib/datetime` で JST⇄UTC 変換）。残: schedules 等に datetime UI を足す際も同ヘルパを使う、`datetime.ts` の Vitest 単体テスト。

---

## 11. 検証コマンド（実装後に使う）

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:db
pnpm dev
```

---

## 付録A: Pleasanter 実スキーマ → 新スキーマ対応

一次情報: [doc/legacy-1on1/infra/pleasanter/site_package_2026_04.json](../../doc/legacy-1on1/infra/pleasanter/site_package_2026_04.json)（22 サイト）。
Pleasanter は汎用カラム（`ClassA–Z` / `NumA–Z` / `DateA–Z` / `DescriptionA–Z` / `CheckA–Z`）に
意味を後付けする方式。下表でその対応を解き、新スキーマの命名済みカラムへ落とす。
**多値（`{choices}` の複数選択）は中間テーブルへ正規化**する。

### サイト構成（親子）

```
アンケート設定(27915) ─ アンケートマスタ(27917) / 質問マスタ(27916) / 回答結果(27919) / 掲載設定(27918)
                        └ 区分(Wikis): 回答状況/健康状態/掲載状況/面談方式 → enum
ユーザー設定(27920)  ─ ユーザーマスタ(27924)
                        └ 区分(Wikis): 本部(27925)/部(27923)/課(27921)/役職(27922) → 組織マスタ
エージェント設定(27926) ─ エージェントマスタ(27927) / AIモデル区分(27928)   ← Phase 2(AI)
スケジュール(27929, Issues)
```

### users ← ユーザーマスタ(27924)

| Pleasanter | 新カラム | 備考 |
|---|---|---|
| ClassA ユーザーコード | `code` | |
| ClassB 名前 | `name` | |
| ClassE メールアドレス | `email` | GoTrue identity と一致 |
| ClassC 役職 | `position_id` | 役職コードが**ロール判定の源**（§3.3） |
| ClassD/G/I 所属本部/部/課 | `division_id`/`department_id`/`section_id` | 組織マスタ FK |
| ClassH 追加面談候補 | → `user_interview_candidates`（中間） | 多値正規化 |
| ClassF 初期パスワード / ClassL 変更済 | （列廃止） | **GoTrue へ委譲** |
| CheckA アカウントロック / NumA 連続失敗 | （列廃止） | **GoTrue へ委譲** |
| DateA 最終ログイン日時 | `last_login_at` | GoTrue 由来でも可 |
| — | `gotrue_id` | **新規**。GoTrue identity 連携キー |

### surveys ← アンケートマスタ(27917) / questions ← 質問マスタ(27916)

| Pleasanter (survey) | 新カラム |
|---|---|
| ClassA 使用質問 | → `survey_questions`（中間 M:N） |
| Status 利用状況 / NumA 定員 | `status` / `capacity` |
| ClassF 認証要否 / ClassG AI使用要否 | `requires_auth` / `uses_ai` |
| ClassB/E/H/I 対象 役職/本部/部/課 | `survey_targets`（中間, 配信対象） |
| Description A/C/D/E/F・ClassC/D・AttachmentsA | AI プロンプト/モデル/資料 → **列は持つが Phase 2 で使用** |

| Pleasanter (question) | 新カラム |
|---|---|
| Body 質問内容 | `body` |
| ClassA 回答形式 | `answer_type`（ラジオ/セレクト/チェック/テキスト/テキストエリア/電話/郵便） |
| DescriptionA 選択肢 | `choices` (jsonb) |
| NumA ソート順 / CheckA 必須 / CheckB 追加記入欄 | `sort_order` / `required` / `has_extra_field` |
| ClassD 評価項目 / NumC 重み / ClassC タグ | `eval_item` / `weight` / `tags` |

### survey_publications ← 掲載設定(27918, Issues)

| Pleasanter | 新カラム |
|---|---|
| ClassA アンケート選択 | `survey_id` (FK) |
| Status 掲載状況 | `status`（100未掲載/150予約/160処理中/200実施中/900完了/910保留/990エラー。**200 のみ回答受付**） |
| StartTime / CompletionTime | `start_at` / `end_at` |
| ProgressRate 回答率 | 集計（view or 算出列） |
| ClassX/Y バッチ開始月/四半期 | `schedules` 連携（pg_cron） |

### answers ← 回答結果(27919, Results)

| Pleasanter | 新カラム | 備考 |
|---|---|---|
| ClassB 回答者 | `respondent_id` (FK) | |
| ClassC 掲載設定 | `publication_id` (FK) | |
| Status 回答状況 | `status` | 100未回答→200回答済→[400調整済]→900完了 |
| DescriptionC アンケート内容JSON | `answer_json` (jsonb) | |
| DateA 回答日 / DateB 面談日 | `answered_at` / `interview_at` | |
| ClassD 面談者 / ClassE 健康状態 / ClassF 面談方式 | `interviewer_id` / `health_status` / `interview_method` | 方式: 1対面/2Web/3電話 |
| ClassG 面談候補 | → `answer_interview_candidates`（中間） | **多値正規化** |
| ClassH 面談内容閲覧者 | → `answer_viewers`（中間） | **多値正規化**。RLS の閲覧範囲に直結 |
| DescriptionH 評価結果JSON | `evaluation` (jsonb) | 満足度/業務負荷/職場環境/人間関係/ストレス |
| DescriptionG 面談メモ / DescriptionI 次回アクション | `interview_memo` / `next_action` | |
| DescriptionA/B/D/E AI生成 | （列は持つ） | Phase 2 |

### schedules ← スケジュール(27929, Issues)

`start_at`/`end_at`/`all_day`(CheckA)/`color`(ClassA)/`icon`(ClassB)/`event_type`(ClassC)/
繰り返し(ClassD 曜日, DateA/B 期間)/`created_by`(ClassE)。

### 組織マスタ ← 本部/部/課/役職（Wikis）

`org_units`（本部・部・課の階層）+ `positions`（役職、コードで保持しロール判定に使用）。
区分マスタは **seed 投入**（技術メモ「マスタは SQL シード、編集 UI は任意」）。

### AI（Phase 2）← エージェントマスタ(27927) / AIモデル区分(27928)

`ai_agents` / モデル enum。MVP では列・枠のみ、UI は Coming Soon。

---

## ステータス

- [x] Plan ドラフト完成（本ファイル）
- [x] 計画レビュー（[初回 NEEDS WORK → 対応後 APPROVE](../reviews/2026-06-11-1830-pleasanter-exit-1on1-rebuild-review.md)、BLOCKER 2 件解消済み）
- [ ] 笹木さん承認（大規模のため実装前に明示承認）
- [x] git init + GitHub リモート設定 + ブランチ戦略確定（3 層 / `doc/legacy-1on1` ignore）
- [ ] Phase 0–6 実装
- [ ] コードレビュー
- [ ] PR merge
- [ ] マージ後検証
