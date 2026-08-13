# Plan: provision/seed 体系の 2 軸再編（(de)provision:{env}[:{step}]）

| 項目 | 値 |
|---|---|
| 概要 | seed/provision 3 スクリプトを「環境 × ステップ + 依存グラフ + deprovision」の単一体系へ再編 |
| ステータス | ⚪ 実装待ち |
| 前提 Plan | [provision-dev](2026-06-25-0101-provision-dev.md) / [seed-csv-master-admin](2026-06-25-1025-seed-csv-master-admin.md) |
| PR | |
| Review | [計画レビュー](../reviews/2026-07-07-1424-provision-steps-review.md) |

## 目的

seed / provision が 3 スクリプト（provision / seed-from-csv / seed-gotrue-dev + db-seed）に分散し、
「何をどこまで投入したか」「一部だけ入れ直す / 消す」ができない。これを
`pnpm (de)provision:{環境}[:{ステップ}]` の 2 軸コマンド体系（ステップ依存グラフ・冪等・
seed 由来のみの安全な削除つき）へ再編する。

## スコープ

### やること

- ステップ分解と依存グラフの導入（`master` → `user` / `demo`、`user` → `fixture`）
- ディスパッチャ [`scripts/provision.mjs`](../../scripts/provision.mjs) の書き換え
  （env 定義テーブル + ステップ引数 + 依存自動投入 + `--remove`）
- ステップ実装を `scripts/provision/` 配下に分割、共通部品を `scripts/lib/` へ
- deprovision の新規実装（依存 seed 残存チェック / 非 seed 参照チェック / SERIALIZABLE
  トランザクション / `--yes` 確認）
- `package.json` alias の整備、CI の Seed ステップ差し替え
- 旧スクリプト・旧 alias の削除、docs（CONTRIBUTING / troubleshooting / README /
  `packages/db/package.json` description）更新

### やらないこと（スコープ外）

- DB スキーマ変更（FK の ON DELETE 変更・seed マーカー列の追加はしない）
- seed CSV の内容変更（[`packages/db/seed/csv/`](../../packages/db/seed/csv/) のデータは現状維持）
- MinIO / avatar 系ステップ（waoon は MinIO 未採用）
- compose 起動時の自動 provision（one-shot 連携は将来検討）

## 現状コンテキスト（2026-07-07 時点）

| 現行 | 役割 | 行き先 |
|---|---|---|
| [`scripts/provision.mjs`](../../scripts/provision.mjs)（312 行） | マスタ投入 + 人員 CSV → GoTrue 発行 + `public.users` 紐付け | ディスパッチャ + `user` ステップ |
| [`scripts/seed-from-csv.mjs`](../../scripts/seed-from-csv.mjs)（331 行） | マスタ 5 表 + dev users + `--demo`（アンケート/回答/スケジュール） | `master` / `user` / `demo` ステップ |
| [`scripts/seed-gotrue-dev.mjs`](../../scripts/seed-gotrue-dev.mjs)（126 行） | dev 固定 5 ユーザの GoTrue 同期 | `user` ステップ（dev）に統合し廃止 |
| [`scripts/db-seed.mjs`](../../scripts/db-seed.mjs)（34 行） | CI/dev 用: CSV 投入 + [`20_sample.sql`](../../packages/db/seed/20_sample.sql) | `fixture` ステップに統合し廃止 |

- CI（[`ci.yml`](../../.github/workflows/ci.yml)）は dev compose 全スタックを `--wait` で起動後に
  `db:migrate` → `db:seed` → `test:db` を実行。gotrue サービスは既定 profile + healthcheck
  ありのため、CI 上でも healthy 状態で利用可能。
- dev のログインユーザーが 2 系統ある: `users.csv` の固定 5 ユーザ（CI / RLS テスト用、
  `db:seed` + `seed:gotrue:dev`）と [`provision-users.example.csv`](../../infra/provision-users.example.csv)
  の padmin/pmember（[CONTRIBUTING](../../docs/CONTRIBUTING.md) 記載のログイン導線、`provision:dev`）。
- FK の `ON DELETE CASCADE` は junction テーブル（answer_viewers / answer_interview_candidates /
  user_interview_candidates / survey_questions / survey_targets.survey_id）に限られ、コア FK
  （users→組織マスタ、answers→users/publications、publications→surveys、schedules→users 等）は
  すべて NO ACTION（= 参照があれば削除は失敗する）。ただし (a) junction 行は CASCADE で
  黙って巻き添え削除される、(b) **FK を持たない参照**が 2 つある
  （[survey_targets.target_code](../../packages/db/schema/40_surveys.sql#L48-L52) は組織マスタの
  code を text で保持 / attachments.entity_id は polymorphic）ため、「FK が実データを守る」
  前提には立てない。
- demo CSV の参照はマスタ（positions / sections）と demo ユーザー（`demo01`〜`demo06` / `demomgr`）
  のみで、`users.csv` のユーザーには依存しない（全行確認済み）。`20_sample.sql` は alice / bob に
  依存し、WHERE NOT EXISTS / ON CONFLICT で冪等。
- pgTAP テスト（7 本）の前提は users.csv 5 ユーザ + 20_sample.sql + マスタで充足し、
  demo データに依存するテストはない。
- マスタ/デモ投入は「非空スキップ（初回投入専用）」。画面で削除した行が CSV から復活するのを防ぐ
  意図的設計（[seed-csv-master-admin 判断ログ](2026-06-25-1025-seed-csv-master-admin.md)）。

## 設計

### コマンド体系

```text
pnpm (de)provision:{env}[:{step}]
        ↑接続先（compose file / env file / network）   ↑投入・削除する seed
```

| env | compose | env ファイル | 実行場所 |
|---|---|---|---|
| dev | `infra/docker-compose.yml` | なし（compose 既定値 + dev ガード現行維持） | ローカル |
| stg | `infra/docker-compose.stg.yml` | `infra/.env.stg` | stg サーバ |
| prod | `infra/docker-compose.prod.yml` | `infra/.env.prod` | prod サーバ |

### ステップと依存

```text
master ──┬── user ──── fixture（dev 専用）
         └── demo
```

| ステップ | 内容 | 依存 | 冪等性 |
|---|---|---|---|
| `master` | 組織マスタ 5 表（divisions/departments/sections/positions/urgency_levels） | なし | テーブル単位・非空スキップ（現行踏襲） |
| `user` | 人員 CSV → GoTrue 発行 + `public.users`。dev は `users.csv` 固定 5 ユーザ + 固定 PW、stg/prod は `--users-csv` 必須 + ランダム PW + must_change + **0600 ファイル出力（stdout/CI に出さない。現行維持）** | master | 行単位（現行踏襲） |
| `demo` | demo_users + surveys/questions/survey_questions/survey_publications/answers/schedules | master | **ステップ単位・番兵行（`users.code='demo01'`）の存在チェック** |
| `fixture` | `20_sample.sql`（RLS テスト兼デモ、alice / bob 依存） | user | SQL 自体が冪等（WHERE NOT EXISTS / ON CONFLICT） |

- 依存ステップは投入時に自動で先行実行する（`provision:dev:fixture` → master → user → fixture）。
- **実行順序は固定トポロジカル順 master → user → demo → fixture**。demo と fixture は
  surveys / answers を共有するため、(a) demo の冪等判定を共有テーブルの rowCount ではなく
  demo 番兵行に変更し、(b) 順序も demo 先行に固定する（二重防御）。これにより
  `provision:dev:fixture` を先に流した DB へ後から `provision:dev` を流しても demo は投入される。
- demo ステップは **単一トランザクションで投入**する（部分失敗時に番兵行だけ残り、
  再実行が誤スキップして中途半端な状態が固定されるのを防ぐ）。
- 既定 bundle: `provision:dev` = 全ステップ / `provision:stg` = master + user / `provision:prod` = master のみ。
- 許可マトリクス: demo は dev/stg のみ、fixture は dev のみ。範囲外は DB 接続前に `exit 1`。
- ユーザー発行は 3 環境とも同一経路（GoTrue admin API → `public.users` INSERT、失敗時 GoTrue cleanup）。
  dev は `users.csv` の固定 gotrue_id を GoTrue の `id` に渡す。JWT_SECRET の
  「逆ガード検査 secret = 署名 secret の単一 const」原則（[provision-dev](2026-06-25-0101-provision-dev.md)）は
  `scripts/lib/gotrue.mjs` で維持する。curl コンテナのイメージは **タグ固定**（`latest` を使わない）。
- 環境差（PW ポリシー・既定 CSV・許可ステップ）はディスパッチャの env 定義テーブルに集約し、
  ステップ実装は env 非依存にする。

### deprovision の安全機構

- ステップ指定必須（`deprovision:dev` のような全削除 alias は作らない）。さらに
  **削除対象の件数・テーブル一覧を表示し、`--yes` フラグなしでは削除を実行しない**。
- **依存 seed 残存チェック（全依存ノードに適用）**: 依存する側の seed が残っていれば削除コマンドを
  提示して `exit 1`。master 削除時は user/demo/fixture、user 削除時は fixture の残存を検査する。
  fixture は deprovision alias を持たないため、user 削除時に fixture 行（20_sample.sql 由来）が
  残っていれば「dev は `docker compose down -v` で作り直す」案内を出して止める。
  自動巻き込み削除はしない。
- **非 seed 参照チェック**: 検査対象は (a) [`pg_constraint`](https://www.postgresql.org/docs/15/catalog-pg-constraint.html)
  から**動的に列挙**した「削除対象テーブルへの CASCADE FK」、(b) FK を持たない text 参照の
  **明示リスト**（`survey_targets.target_code` / `attachments.entity_id`）。静的な FK リストに
  依存しない（将来の FK 追加でチェック漏れしない）。seed 由来でない参照が 1 件でもあれば
  参照元テーブル・件数を表示して `exit 1`。
- **トランザクションは `ISOLATION LEVEL SERIALIZABLE`** で「参照チェック → DELETE」を実行する。
  READ COMMITTED では単一トランザクションでもチェック後の並行 commit が DELETE に可視化し
  巻き添えになる（TOCTOU）。シリアライゼーション失敗時は削除せず「再実行してください」で終了。
- **seed 由来判定の限界（運用契約）**: seed 行は CSV の自然キー（code / email / title 等）で
  特定する。answers / publications 等に UNIQUE 自然キーはないため、**画面で編集された seed 行は
  判定から外れて取り残され、CSV と同一キーの実データは seed とみなされうる**。deprovision は
  「seed 投入後に対象データを画面編集していない環境のリセット」専用とし、判定マーカー列の追加
  （スキーマ変更）はしない。この限界は docs にも明記する。
- **`deprovision:{stg,prod}:user` は提供しない**。stg/prod の user は実メール・実在人物の
  GoTrue identity + 機微情報（answers の健康状態・面談メモ）を持ち、リスクは同質。
  user の deprovision は dev のみ。
- `fixture` の deprovision は対象外（dev 専用。作り直しは `compose down -v`）。

### ファイル構成（目標）

```text
scripts/
├── provision.mjs            ディスパッチャ（env 定義・ステップ解決・依存グラフ・--remove）
├── provision/
│   ├── master.mjs           各ステップ: provision() / deprovision() をエクスポート
│   ├── user.mjs
│   ├── demo.mjs
│   └── fixture.mjs
└── lib/
    ├── env.mjs              （既存）
    ├── psql.mjs             compose exec psql ラッパ・SQL エスケープ
    ├── csv.mjs              CSV 読込・code→id 解決サブクエリ
    └── gotrue.mjs           service_role JWT・admin API クライアント（単一 const 原則を維持）
```

### package.json alias

| 用途 | dev | stg | prod |
|---|---|---|---|
| 既定投入 | `provision:dev` | `provision:stg` | `provision:prod` |
| 1 ステップ投入 | `provision:dev:{master,user,demo,fixture}` | `provision:stg:{master,user,demo}` | `provision:prod:{master,user}` |
| 1 ステップ削除 | `deprovision:dev:{master,user,demo}` | `deprovision:stg:{master,demo}` | `deprovision:prod:master` |

削除する alias: `db:seed` / `seed:gotrue:dev`（CI は `provision:dev` に差し替え）。
`db:migrate` / `db:psql` / `test:db` は現状維持。

## 実装計画

1 PR で出す。commit は **Phase 1: provision 再編（現行と挙動同等）+ CI 差し替え** →
**Phase 2: deprovision 新規** の順に分けて積み、レビューで分離検証できるようにする。

1. `feature/provision-steps` ブランチを develop から作成
2. 共通部品を `scripts/lib/`（psql / csv / gotrue）へ切り出し（既存 3 スクリプトからの抽出）
3. ステップ実装 `scripts/provision/{master,user,demo,fixture}.mjs`（provision 側のみ。
   demo の冪等判定を番兵行方式へ変更する以外は現行と同等動作）
4. ディスパッチャ `provision.mjs` 書き換え（env 定義テーブル・固定トポロジカル順の依存自動投入・
   許可マトリクス・未知ステップ die。dev の JWT_SECRET 逆ガード / network 強制は現行維持）
5. `package.json` alias 整備 + [`ci.yml`](../../.github/workflows/ci.yml) の Seed ステップを
   `provision:dev` に差し替え（ここまで Phase 1）
6. deprovision 実装（依存 seed 残存チェック → 非 seed 参照チェック → SERIALIZABLE + `--yes`。Phase 2）
7. 旧ファイル削除: `db-seed.mjs` / `seed-gotrue-dev.mjs` / `seed-from-csv.mjs` /
   `provision-users.example.csv`。[`packages/db/package.json`](../../packages/db/package.json) の
   description から `db:seed` 記載を除去
8. docs 更新: [CONTRIBUTING](../../docs/CONTRIBUTING.md)（ログイン導線を `admin@example.com` /
   `Admin1234!` に変更・**dev は全ユーザー同一 PW `Admin1234!` に統一**〔`seed-gotrue-dev.mjs` の
   alice 等の個別 PW は廃止〕・コマンド表・**ステップ別の再実行時挙動**〔user は CSV 追加行が入る /
   master・demo は非空・番兵スキップで入らない〕・deprovision の運用契約）/
   [troubleshooting](../../docs/troubleshooting.md) / [README](../../README.md)
9. 検証（下記）→ self-review → コードレビュー依頼

## 検証

dev（ローカル）で以下を順に確認。Linux 限定コマンドは compose exec 内のみ。

```bash
docker compose -f infra/docker-compose.yml down -v   # 空状態から
pnpm compose:dev:up                                   # 起動 + migrate
pnpm provision:dev                                    # 全ステップ投入
pnpm provision:dev                                    # 再実行 → 全スキップ（冪等）
pnpm deprovision:dev:demo                             # --yes なし → 削除されないことを確認
pnpm deprovision:dev:demo --yes                       # demo のみ削除される
pnpm provision:dev:demo                               # demo だけ再投入できる
pnpm deprovision:dev:master --yes                     # user/demo 残存 → die + 案内を確認
pnpm test:db                                          # pgTAP（CI 相当）
```

- `admin@example.com` / `Admin1234!` で Web ログインできる（GoTrue 同期の確認）。
  `alice@example.com` も同一 PW でログインできる（個別 PW 廃止・統一 PW の確認）
- **順序・番兵の確認**: 空 DB から `provision:dev:fixture`（master → user → fixture が自動投入）→
  続けて `provision:dev` で **demo が投入される**こと（fixture 先行でも demo が誤スキップしない）
- **env ガードの回帰（逆テスト）**: dev 値でない JWT_SECRET を与えた `provision:dev` が die /
  stg env ファイルの secret が dev 値のとき `provision:stg` が die（check:secrets 相当の既存挙動維持）
- 実データ混在時の deprovision 拒否: demo publication に手動で回答を 1 件作成 →
  `deprovision:dev:demo --yes` が参照チェックで die することを確認
- `deprovision:dev:user --yes` が fixture 残存の検出で die し、`compose down -v` を案内することを確認
- CI グリーン（Seed 差し替え後の全パイプライン）
- stg / prod は次回サーバ作業時に `provision:stg` / `provision:prod` を検証（マージ後検証項目）。
  **stg での deprovision 検証が済むまで、stg/prod では deprovision を実行しない**

## リスク

| リスク | 緩和策 |
|---|---|
| junction FK の CASCADE / FK なし text 参照により deprovision が非 seed 行を巻き添え・孤児化 | 参照チェックは pg_constraint 動的列挙 + FK なし参照の明示リスト。SERIALIZABLE で TOCTOU を排除し、`--yes` 必須 + 削除対象の事前表示。dev で実データ混在シナリオを検証項目に含める |
| seed 由来判定（自然キー）の偽陽性・偽陰性 | 「画面編集していない環境のリセット専用」という運用契約を docs に明記。逸脱環境では deprovision を使わない |
| CI の Seed 差し替えで GoTrue 発行が増え、失敗点・所要時間が増加 | compose `--wait` で healthy 担保済み。発行は 5 ユーザのみで軽微。curl イメージはタグ固定で pull の非決定性を排除 |
| dev ログイン導線の変更（padmin/pmember 廃止）で手元手順が壊れる | docs を同一 PR で更新。固定 PW `Admin1234!` は不変 |
| stg/prod での動作がマージ時点で未検証 | 3 環境同一経路の設計 + dev で全シナリオ検証。stg/prod はマージ後検証項目として追跡し、検証完了まで stg/prod で deprovision を実行しない |
| 旧 alias 削除による呼び出し漏れ | リポジトリ全体を grep して `db:seed` / `seed:gotrue:dev` 参照を一掃（evergreen 準拠） |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-07-07 | ステップは master → {user, demo}、user → fixture の 4 つ | demo CSV はマスタ + demo ユーザーのみ参照し user 非依存。fixture（20_sample.sql）は alice/bob 依存 |
| 2026-07-07 | `provision:prod` 既定は master のみ。demo/fixture は prod 禁止 | 本番アンケートアプリにデモデータを入れない現行方針の明文化 |
| 2026-07-07 | deprovision は自前の非 seed 参照チェックで拒否する | コア FK は NO ACTION だが、junction FK の CASCADE 巻き添えと FK なし text 参照（survey_targets.target_code / attachments.entity_id）は FK では守れない。FK 変更は業務側の削除挙動に影響するため不採用 |
| 2026-07-07 | dev ユーザーを `users.csv` 固定 5 ユーザに一本化し、`provision-users.example.csv`（padmin/pmember）と `seed-gotrue-dev.mjs` を廃止 | dev のログインユーザーが 2 系統あり二重管理。RLS テスト・CI・手動 dev を同一ユーザー集団に揃える |
| 2026-07-07 | user の deprovision は dev のみ（`deprovision:{stg,prod}:user` は提供しない） | stg/prod の user は実メール・実在人物 + 機微情報（健康状態・面談メモ）で、stg も prod と同質のリスク。入口ごと塞ぐ |
| 2026-07-07 | master の冪等性はテーブル単位・非空スキップを維持 | 行単位 upsert にすると画面で削除した行が CSV から復活する。部分的な入れ直しは deprovision → provision で実現する |
| 2026-07-07 | 実行順序を master → user → demo → fixture に固定し、demo の冪等判定を番兵行（`demo01`）方式へ変更 | demo と fixture が surveys/answers を共有し、rowCount 判定では fixture 先行時に demo が誤スキップされる（計画レビュー B-1） |
| 2026-07-07 | deprovision は SERIALIZABLE + pg_constraint 動的列挙 + FK なし参照の明示リスト + `--yes` 確認で実行 | READ COMMITTED では単一トランザクションでも TOCTOU を防げない。静的 FK リストは将来の FK 追加で漏れる（計画レビュー B-2） |
| 2026-07-07 | seed 由来判定は自然キー一致のままとし、限界を運用契約（画面編集していない環境のリセット専用）で吸収。マーカー列は導入しない | UNIQUE 自然キーのないテーブルで確実な判定にはスキーマ変更が必要になり、スコープ外（計画レビュー B-3） |
| 2026-07-07 | CI の Seed に GoTrue 発行を組み込む — [dev-gotrue-users-bootstrap](2026-06-23-0005-dev-gotrue-users-bootstrap.md) の「CI には意図的に組み込まない」決定を反転 | 当時は db:seed が GoTrue 不要で完結していた。現在の CI は compose 全スタックを `--wait` で起動し GoTrue healthy が保証される。user ステップ一本化後に CI 専用の直 INSERT 経路を残す方が二重管理（計画レビュー B-5） |
| 2026-07-07 | stg で demo ステップを許可 — [app-shell-legacy-look](2026-06-28-2212-app-shell-legacy-look.md) の「provision:stg に --demo を渡さない」決定を反転 | 旧決定の意図は「本番にデモを入れない」。新体系では demo は stg の既定 bundle に含まれず明示ステップ opt-in で、prod では引き続き禁止のため意図は維持される（計画レビュー B-5） |
| 2026-07-07 | 1 PR で出す（Phase 分割 PR にしない）。commit を「provision 再編（挙動同等）」→「deprovision 新規」の順に分離 | alias 体系が中間状態になる期間を作らない。commit 分離でリファクタと新規機能をレビュー上分離できる（計画レビュー N-6） |
| 2026-07-07 | `docs/技術選定/_techmemo-decoded.md` の `db:seed` 言及は更新しない | 技術選定メモの decode 原本 = 歴史文書で evergreen の対象外（計画レビュー N-8） |

## 残課題（任意）

- compose one-shot（起動時自動 provision）との連携は将来検討（元体系の §3 相当）
- seed 由来判定を確実化する seed registry（投入行 id を記録する管理テーブル）は、
  deprovision の利用頻度が上がったら別 Plan で検討

## ステータス

- [ ] 計画確定
- [ ] 実装完了
- [ ] レビュー完了
- [ ] PR 作成
- [ ] マージ後検証
  - [ ] dev: 検証節の全シナリオ
  - [ ] CI: Seed 差し替え後のグリーン
  - [ ] stg: `provision:stg`（次回サーバ作業時）
  - [ ] prod: `provision:prod`（次回サーバ作業時）
  - [ ] stg: deprovision（demo 投入 → 削除）の実地検証。完了まで stg/prod で deprovision 禁止
