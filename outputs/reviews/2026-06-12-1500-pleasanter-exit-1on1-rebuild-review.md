# Review: Pleasanter 排除 + 1on1 再構築（マイルストーン計画レビュー / Phase 6 焦点）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-12 15:00 JST |
| レビュアー | Claude Code（architect エージェント） |
| 対象 Plan | [`plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md`](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md) |
| ブランチ | develop（Phase 0–5 マージ済み） |
| 関連 PR | #1–23 merged |
| レビュー種別 | 計画（再レビュー・Phase 6 焦点） |

> 初回計画レビューは [2026-06-11-1830](2026-06-11-1830-pleasanter-exit-1on1-rebuild-review.md)（Phase 0–5 計画、対応後 APPROVE）。
> 本 Review は **Phase 0–5 実装完了後のマイルストーン再レビュー**で、前向きに残る **Phase 6（デプロイ基盤）** の計画妥当性に焦点を当てる。

## 判定

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **NEEDS WORK** | Phase 6（デプロイ基盤）の計画が「安全に実装着手できる粒度」に未達。Phase 0–5 は実装で妥当性裏付け済み |
| Plan 判定 | **NEEDS WORK** | デプロイ方式 / secrets / nginx / GoTrue prod / migration 運用 / prod provisioning が §5 Phase 6 の 3 行に圧縮され未決 |
| 実装判定 | N/A | 本 Review は計画のみ |
| 記録整理 | OK | header・末尾チェックリストは実態へ棚卸し済み（CI ✅ / 残=デプロイ基盤の区別も反映） |

Phase 0–5 は APPROVE 相当（実装・コードレビュー・security APPROVE で裏付け）。**残る Phase 6 のデプロイ基盤のみが計画として薄い** → 独立 Plan へ切り出して詰めるのが収束先。

## 指摘事項

§5 Phase 6 は実質 3 項目（CI ✅ / compose stg-prod / nginx）。観点 1–7 が未記述。

| 重大度 | Plan 内位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| BLOCKER B-1 | §5 Phase 6-2 / §4 | **デプロイ先 / CD 方式が未定義**。どのホストに、どう配布するか（image build→registry→host pull→migrate→up）が無い。`apps/web` の prod Dockerfile も未存在（compose は postgres/gotrue のみ、web は dev 直起動） | CD の 1 シーケンスを明記（push型/pull型の決定、web の image 化、各 step を Actions/host のどちらが担うか） |
| BLOCKER B-2 | §4 / 判断ログ欠如 | **secrets 管理 + dev フォールバックの prod 遮断**。compose が `${JWT_SECRET:-dev-only-change-me...}` 等で default を持つ → prod で env 渡し忘れても **dev secret で默って起動**。`.env.stg/.prod` の供給経路も未定 | prod compose は `${VAR:?required}` で未設定なら起動失敗。secrets 供給元（GH Actions Secrets→host）を決定。`dev-only-change-me` が prod に出ない CI/起動時チェック |
| BLOCKER B-3 | §4 / §5 Phase 6-3 / 判断ログ(レートリミット) | **nginx の具体 + rate-limit 責務の二重未整理**。TLS 入手/更新・upstream・XFF 付与が未記述。API 層 limiter が既存で「本番は nginx/Redis が本命」とあるが nginx と API のどちらが正か未決 | TLS 方式（certbot/持込）、nginx `limit_req` を一次にするか（移譲/多層）、nginx が XFF をセットし API が信頼する経路を明記 |
| BLOCKER B-4 | §5 Phase 6（記述なし）/ 判断ログ(初期PW) | **GoTrue prod 設定 + SMTP**。現状 SMTP 無し・`MAILER_AUTOCONFIRM=true`。SMTP 有無で recover/force-change/運用が変わる（残課題に force-change 未対応） | prod GoTrue ブロック追加：SMTP 入れる/入れない決定、recover 方針（メール非依存=admin 再発行のみ等）、`SITE_URL`/`API_EXTERNAL_URL` を prod ドメインへ |
| BLOCKER B-5 | §4 / §5 Phase 6-2 | **prod migration 運用 + バックアップ/リストアが未記述**。前進のみ(down 無し)で失敗時の扱い不明、backup 方針ゼロ | migration は CD の web 起動前 step / 失敗時は fix-forward と明記。日次 `pg_dump` + リストア手順を 1 段落 |
| BLOCKER B-6 | 非ゴール / Phase 1-6 判断ログ | **prod の seed/provisioning**。`10_users.sql` は GoTrue UUID 手書き=dev 専用で prod では identity 無し→ログイン不能ユーザーが入るだけ。`provision.mjs` 未存在 | prod 初期化を別経路に明言：org マスタ seed のみ流す + admin 1 名を GoTrue admin API で発行（provision スクリプト）。手書き UUID ユーザーは prod に流さない |
| NICE-TO-HAVE N-1 | §1 非ゴール | stg/prod 構築直後の初期状態（org seed + admin のみ、業務データ空）が未明文化（B-6 と表裏） | 独立 Plan の前提に「初期状態 = 空 + admin 1 名」を 1 行 |
| NICE-TO-HAVE N-2 | §4 アーキ図 | web がアーキ図にはあるが dev compose に web service 無し（dev は host 直起動）。prod は web もコンテナ化が必要 | 「dev=host 直起動 / prod=web もコンテナ」の非対称を独立 Plan で明示（B-1 と一体） |

## 妥当性レビュー

- **Phase 0–5**: 要件（Pleasanter 排除・管理2画面・回答者フル移植・見た目踏襲）を満たし実装・マージ済み。計画妥当性は実行で裏付け済み。
- **Phase 6 の境界**: CI（#10）は master 内で完結。残るデプロイ基盤は secrets/TLS/migration 運用/backup/prod provisioning という**独立した意思決定の束**で、3 行では収まらない。
- **影響範囲の見落とし**: B-2（secrets）・B-5（backup）・B-6（prod provisioning）は「建てる」前提なら必須なのに Plan に無い。最優先は **B-2（dev secret の prod 遮断＝セキュリティ事故）** と **B-6（建てたが誰もログインできない）**。

## 推奨: Phase 6 デプロイ基盤を独立 Plan へ切り出す

- master Plan は機能再構築（ドメイン）の Plan として実質クローズ間際。インフラ/運用は関心が別レイヤ（[evergreen.md](../../.claude/rules/evergreen.md) 関心分離と整合）。
- 新 Plan `outputs/plans/YYYY-MM-DD-HHMM-deploy-infra.md` の章立て案（観点に対応）:
  1. デプロイ先 / CD パイプライン（B-1, N-2） 2. secrets 管理 + dev フォールバック遮断（B-2）
  3. nginx（TLS / ルーティング / rate-limit 責務）（B-3） 4. GoTrue prod（SMTP/recover/force-change）（B-4）
  5. migration 運用 + backup/restore（B-5） 6. prod provisioning（admin 発行）（B-6）
- master Plan 側は Phase 6 を「CI ✅ / デプロイ基盤は別 Plan `deploy-infra` へ分離」に置換 → master は ✅ 検証完了へ（残るブラウザ手動確認 1 件を除く）。

## 過去事例からの教訓

- `outputs/plans/` は本 master Plan **1 本のみ**。撤回（❌）Plan・類似 Plan は無し → 重複/被りリスク無し。
- 初回計画レビューの BLOCKER 2 件（RLS コンテキスト伝播 / 階層認可の責務分担）は判断ログで解消済み、本 Phase 6 指摘とは別系統。デプロイ基盤 BLOCKER は本レビューが初出。

## 検証（この Review 自体の）

- [x] 対象 Plan を全文 Read 済み
- [x] 関連ファイル（dev compose / .env.example / 10_users.sql / CI / 初回 review）grep 済み
- [x] 撤回 Plan との被り確認済み（Plan は 1 本のみ、撤回なし）

## フォローアップ

- [ ] **Phase 6 デプロイ基盤を独立 Plan（`deploy-infra`）へ切り出し**、観点 1–7（B-1〜B-6 + N-1/N-2）を章立てに詰める
- [ ] master Plan §5 Phase 6 を「CI ✅ / デプロイ基盤は別 Plan へ分離」に置換、判断ログ 1 行追記
- [ ] 新 Plan は **B-2（secrets 遮断）/ B-6（prod admin provisioning）** を最優先で詰める
