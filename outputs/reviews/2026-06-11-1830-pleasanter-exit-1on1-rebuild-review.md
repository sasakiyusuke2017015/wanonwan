# Review: Pleasanter 排除 + 旧 1on1 ドメインの新スタック再構築（計画レビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-11 18:30 JST |
| レビュアー | Claude Code |
| 対象 Plan | [`plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md`](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md) |
| ブランチ | TBD（GitHub: `sasakiyusuke2017015/wanonwan`） |
| 関連 PR | TBD |
| レビュー種別 | 計画 |

## 判定

| 項目 | 初回判定 | 対応後判定（最終） | スコープ / 意味 |
|---|---|---|---|
| 最終判定 | NEEDS WORK | **APPROVE** | BLOCKER 2 件が Plan に反映され解消 |
| Plan 判定 | NEEDS WORK | **APPROVE** | 認可機構（RLS 伝播 / API・RLS 責務分担）が明記された |
| 実装判定 | N/A | N/A | 本 Review では実装は見ない |
| 記録整理 | FOLLOW-UP | **OK** | Phase 6 を `.github/workflows/` に整合済み |

> **更新 (2026-06-11 18:30)**: 下記 BLOCKER 2 件は Plan の §3.3 / Phase 1 / Phase 2 / 判断ログに
> 反映済み（[Plan 判断ログ](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md#9-判断ログ)）。
> 対応後の最終判定は **APPROVE**。以下の指摘内容は履歴として残す。

## 指摘事項

| 重大度 | Plan 内位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| **BLOCKER** | §4 / Phase 1–2（認可機構） | **RLS にユーザーコンテキストを渡す機構が未定義**。DB アクセスは `app_user` 1 本（API 経由）なので、`auth.uid()` 相当が「誰のリクエストか」を知る仕組みがないと RLS が常に空 or 全通しになる。`SET LOCAL request.jwt.claims` / `set_config()` をトランザクション単位で注入する、または `current_setting()` を読む `app.current_user_id()` を定義する等の**伝播方式を Plan に明記**する必要がある。ここが未定だと Phase 2 の RLS/pgTAP が机上で破綻する | Phase 1 に「API→DB のリクエストごとに JWT クレーム（gotrue sub）を `SET LOCAL` し、RLS は `app.current_user_id()` で参照する」設計を 1 節追加。pgTAP もこの前提でシナリオを書く |
| **BLOCKER** | §3.3 / §4 / Phase 2（階層認可の責務分担） | **組織階層の閲覧範囲（課長=同課・部長=同部…）を RLS と API のどちらで担うかが未決**。技術メモは「RLS はシンプルに保ち業務ロジックを持ち込まない／主認可は API 層」。一方 §5 Phase2-3 は「RLS=ロール別+カスタム」とあり、階層判定を RLS に寄せると複雑化・JOIN 性能・テスト困難に直結。さらに閲覧範囲は `answer_viewers`/`answer_interview_candidates`（中間）にも依存し、RLS で表現すると重い | Plan に責務分担を明記: **階層・面談候補・閲覧者の絞り込みは API 層（zod+関数）が主**、**RLS は「本人 / admin / 明示的 viewer」の最小ガード**に限定、と決める。これにより pgTAP の対象も「本人可・他人不可・admin 全件・viewer 可」に収束する |
| NICE-TO-HAVE | §5 Phase 4 / Phase 1 | 管理者がユーザー新規作成する際の **GoTrue identity 発行フロー（service_role 経由 / 初期パスワード発行 / `users.gotrue_id` 紐付けの順序）** が未記述。seed ユーザーの GoTrue provisioning も同様 | Phase 1 に「GoTrue admin API で identity 作成→`users` に gotrue_id を保存」の provisioning スクリプト方針を 1 行追加 |
| NICE-TO-HAVE | §5 Phase 6 | Phase 6 が `.gitea/workflows/` のままで、§10 残課題の「実体は GitHub」と不整合 | Phase 6 を `.github/workflows/` に直すか、「Git ホスト確定後に確定」と明示 |
| NICE-TO-HAVE | §1 非ゴール / §5 Phase 5 | 「見た目踏襲」の**受け入れ基準が無い**（VRT は非ゴール）。踏襲できたかの判定が主観になる | Phase 5 に「旧画面のスクショと並べ目視確認」程度の軽量受け入れ基準を 1 行 |
| NICE-TO-HAVE | 全体 | フル移植スコープに対し **粒度別の規模感／マイルストーンゲート**が無い。Phase 間の「ここまでで一旦リリース可能ライン」が見えにくい | §5 末尾に「Phase 4 完了=管理者運用可能ライン、Phase 5 完了=回答者公開ライン」のゲートを明示 |
| NICE-TO-HAVE | 付録A answers | 回答本体を `answer_json`(jsonb) で持つ一方 questions は正規化。集計・検索を JSON 側に頼ると後で重い | 「MVP は JSON 保持、設問別の集計要件が出たら回答明細テーブルへ正規化」と判断ログに残す |

## 妥当性レビュー

- **要件適合**: タスク要件（Pleasanter 完全排除 / Docker+Postgres / 管理者2画面=一覧・編集・新規 / 回答者フル移植 / 見た目踏襲）はすべて Plan に対応節がある。✔
- **スコープ境界**: 旧コードは参照のみ・流用しない、非ゴール（実データ移行/AI/MinIO/MFA/VRT/2テーマ）が明示され、後で揉めにくい。✔
- **影響範囲**: DB / API / 認可 / CI / デプロイは網羅。ただし**認可は「モデル」は書けているが「機構」が抜けている**（上記 BLOCKER 2 件）。migration（スキーマ前進のみ）は方針あり。
- **データモデル**: 付録A で Pleasanter 実 site_package（22 サイト）の汎用カラム（ClassA–L 等）を命名済みカラムへ正確に対応付け済み。多値（面談候補/閲覧者）の中間テーブル正規化も妥当。✔ 一次情報に忠実。
- **見落とし無いか**: 認可機構（BLOCKER）以外では、GoTrue provisioning と CI ホストの軽微な未整合のみ。重大な抜けは無い。
- **類似/撤回 Plan**: 本リポジトリ初の Plan のため重複なし。旧 1on1 の `POSTGRESQL_DIRECT_ACCESS_PLAN.md`（Pleasanter 脱却検討）と方向性は整合（むしろ前進）。

## 過去事例からの教訓

- 旧 1on1 自身が「REST 200 件制限・内部ロジック依存」で Pleasanter 直 PG 接続に踏み切っていた（[POSTGRESQL_DIRECT_ACCESS_PLAN.md](../../docs/99_archive/legacy-1on1/docs/POSTGRESQL_DIRECT_ACCESS_PLAN.md)）。**Plan はこの教訓を「Pleasanter 完全排除＝純正 Postgres」へと正しく昇華**している。
- 旧実装はロールを JWT に載せつつルーター層で未活用、認可は `canAccessAnswer()` 等の個別関数頼みだった。**新 Plan が「API 層で認可を主担」とするのは旧の暗黙知の明文化**として妥当。ただし RLS をどこまで効かせるか（BLOCKER 2）を決めないと、旧と同じ「認可がコードに散る」状態を RLS 側に作りかねない。

## 検証（この Review 自体の）

- [x] 対象 Plan を全文 Read 済み
- [x] 一次情報（site_package_2026_04.json / 技術選定メモ / 旧コード構造）を確認済み
- [x] 認可・RLS・GoTrue 連携の整合性を重点確認
- [x] 撤回 Plan との被り確認（初 Plan のため無し）

## フォローアップ（Plan 側へ反映依頼）

- [ ] **BLOCKER①**: RLS へのユーザーコンテキスト伝播方式（`SET LOCAL` + `app.current_user_id()` 等）を Phase 1 に明記
- [ ] **BLOCKER②**: 階層認可の責務分担（API 主 / RLS は最小ガード）を §3.3・Phase 2 に明記し、pgTAP 対象を収束
- [ ] GoTrue provisioning フローを Phase 1 に 1 行追加
- [ ] Phase 6 を `.github/workflows/` に整合（or ホスト確定待ちと明記）
- [ ] 見た目踏襲の軽量受け入れ基準（Phase 5）
- [ ] マイルストーンゲート（Phase 4=管理者運用可能 / Phase 5=回答者公開）

---

**最終判定: APPROVE（対応後）** — 初回 NEEDS WORK の BLOCKER 2 件（RLS のユーザーコンテキスト伝播 / 階層認可の API・RLS 責務分担）は Plan に反映済み。骨子・スコープ・データモデルは妥当で、実装フェーズ（笹木さん承認後）へ進めてよい。NICE-TO-HAVE は Plan の判断ログ／残課題に収容済み。
