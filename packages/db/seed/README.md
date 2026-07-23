# packages/db/seed

空 DB を「使える状態」にするための初期データ置き場。CSV を唯一の編集対象とし、
[`scripts/seed-from-csv.mjs`](../../../scripts/seed-from-csv.mjs) が psql 経由で投入する。

## 構成

```
seed/
├─ master/        組織マスタ。全環境（dev/stg/prod）に投入する
│  └─ divisions.csv → departments.csv → sections.csv → positions.csv → urgency_levels.csv
├─ users/         dev 専用ユーザー（gotrue_id 固定）
│  └─ users.csv
├─ demo/          dev の画面確認用デモデータ。--demo のときだけ投入する
│  └─ demo_users.csv / surveys.csv / questions.csv / survey_questions.csv
│     survey_publications.csv / answers.csv / schedules.csv
└─ 20_sample.sql  RLS テスト兼デモのフィクスチャ（SQL。db:seed が CSV の後に流す）
```

`master/` は FK 依存順（上記の並び）に投入する。親は `code` 列で参照し、id は
IDENTITY 任せで INSERT 時にサブクエリ解決する。

## 投入経路

| コマンド | 対象 | 用途 |
|---|---|---|
| `pnpm db:seed` | master + users + demo + `20_sample.sql` | dev の一括投入 |
| `pnpm provision:dev` | master（`--no-users`）+ GoTrue 発行ユーザー | dev をユーザー発行込みで初期化 |
| `pnpm provision:{stg,prod}` | master のみ + GoTrue 発行ユーザー | stg/prod の初期化 |

`users/users.csv` は `gotrue_id` を固定値で持つため `public.users` を直接 INSERT できる
（**dev 専用**）。stg/prod のユーザーは GoTrue でアカウント発行が要るため CSV からは投入せず、
[`scripts/provision.mjs`](../../../scripts/provision.mjs) が担当する。

`demo/` は `--demo` を付けたときだけ投入する。`provision:{stg,prod}` は渡さないので本番には入らない。

## 冪等性: 「初回投入専用」

各テーブルは投入前に行数を確認し、**非空ならスキップ**する。CSV が真実の源になるのは
空 DB の初回だけで、運用開始後の再実行は no-op になる。

`ON CONFLICT DO NOTHING` による upsert にはしていない。**管理画面で削除した行は conflict せず
再 INSERT されてしまい、消したはずのデータが復活する**ため。UI の編集を CSV へ書き戻す機能は
無く、CSV → DB の一方向でよい。

作り直したいときは fresh init する:

```bash
pnpm compose:dev:down -v && pnpm compose:dev:up && pnpm db:seed
```

## CSV の仕様

- 文字コードは UTF-8。ヘッダ必須・列の順不同可。値は前後空白を trim する。
- ヘッダは基本的に **DB 列名**。親参照だけ `<親テーブル単数形>_code`（例: `division_code`）。
- 数値列（`positions.code` / `urgency_levels.code` 等）は空欄にしない。整数でなければ投入前に落ちる。
- `users.csv` の `roles` 列はセミコロン区切りで**上位ロールのみ**書く（`admin` / `interviewer`）。
  member は全員が暗黙保有するため書かない。

## 追加・更新するには

1. 該当 CSV を編集する（master を増やすときは FK 依存順に注意）。
2. `pnpm db:seed`（stg/prod は `pnpm provision:{stg,prod}`）を実行する。
3. 既に行があるテーブルはスキップされる。反映したい場合は fresh init する。

新しいマスタテーブルを足すときは、CSV に加えて
[`scripts/seed-from-csv.mjs`](../../../scripts/seed-from-csv.mjs) の `MASTER_TABLES` に
定義（テーブル名・列・行 → 値の組み立て）を追加する。
