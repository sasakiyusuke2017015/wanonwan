# packages/db/seed

空 DB を「使える状態」にするための初期データ置き場。CSV を唯一の編集対象とし、
[`scripts/provision/`](../../../scripts/provision/) の各ステップが psql 経由で投入する。

## 構成

```
seed/
├─ master/        組織マスタ。全環境（dev/stg/prod）に投入する
│  └─ divisions.csv → departments.csv → sections.csv → positions.csv → urgency_levels.csv
├─ users/         dev の人員 CSV（ロール網羅の 36 アカウント。一部は gotrue_id 固定）
│  └─ users.csv
├─ demo/          dev / stg の画面確認用デモデータ
│  └─ demo_users.csv / surveys.csv / questions.csv / survey_questions.csv
│     survey_publications.csv / answers.csv / schedules.csv
└─ 20_sample.sql  pgTAP が前提にするフィクスチャ（SQL。fixture ステップが流す）
```

`master/` は FK 依存順（上記の並び）に投入する。親は `code` 列で参照し、id は
IDENTITY 任せで INSERT 時にサブクエリ解決する。

## 投入経路

投入は `pnpm (de)provision:{env}[:{step}]` の 2 軸コマンドに一本化されている。

```
pnpm provision:{env}[:{step}]
             ↑接続先          ↑投入する seed
```

| ステップ | 対象 | 依存 | dev | stg | prod |
|---|---|---|---|---|---|
| `master` | `master/*.csv` | — | ✅ | ✅ | ✅ |
| `user` | 人員 CSV → GoTrue 発行 + `public.users` | `master` | ✅ | ✅ | ✅ |
| `demo` | `demo/*.csv` | `master` | ✅ | ✅ | ❌ |
| `fixture` | `20_sample.sql` | `user` | ✅ | ❌ | ❌ |

- ステップ未指定（`pnpm provision:dev`）は環境の既定 bundle を流す。
  dev = 全ステップ / stg = `master` + `user` / prod = `master` のみ。
- 依存ステップは自動で先行実行する（`provision:dev:fixture` → master → user → fixture）。
- 実行順序は **master → user → demo → fixture** に固定。demo と fixture は surveys / answers を
  共有するため、demo を先に置き、かつ demo の冪等判定を番兵行にしている。
- stg/prod の人員 CSV は実メールを含むため VCS に置かず、`--users-csv <path>` で渡す。
  一時パスワードは stdout ではなく 0600 ファイルへ書き出す。

## 削除（deprovision）

```
pnpm deprovision:{env}:{step} --yes
```

| | dev | stg | prod |
|---|---|---|---|
| 削除できるステップ | `master` / `user` / `demo` | `master` / `demo` | `master` |

- **ステップ指定は必須**。全削除の alias は用意しない。
- `--yes` が無ければ**削除対象の件数を表示するだけ**で何も消さない。
- 依存する側の seed が残っていれば中断し、先に実行すべきコマンドを案内する
  （`master` を消す前に `user` / `demo` / `fixture` が無いこと）。**自動巻き込み削除はしない**。
- 削除対象を参照する **seed 由来でない行**が 1 件でもあれば中断する。検査は
  `pg_constraint` から動的に列挙した FK と、FK を持たない text 参照
  （`survey_targets.target_code` / `attachments.entity_id`）の両方を見る。
- 検査と DELETE は `ISOLATION LEVEL SERIALIZABLE` の単一トランザクションで実行する。
- `fixture` は個別削除できない（dev 専用。作り直しは `pnpm compose:dev:down -v`）。
- `deprovision:{stg,prod}:user` は**提供しない**。stg/prod の user は実在人物の GoTrue identity と
  機微情報（健康状態・面談メモ）を持つため、入口ごと塞いでいる。

### 運用契約: 「画面編集していない環境のリセット」専用

seed 由来かどうかは CSV の自然キー（`code` / `email` / `title` 等）一致で判定する。
マーカー列は持たない（スキーマ変更を避けるため）。したがって:

- **画面で編集された seed 行**は判定から外れ、削除されずに取り残される
- **CSV と同一キーの実データ**は seed とみなされうる

deprovision は「seed 投入後に対象データを画面編集していない環境のリセット」に限って使う。
逸脱した環境では使わず、環境ごと作り直す。

## 冪等性

| ステップ | 判定 |
|---|---|
| `master` | テーブル単位の**非空スキップ** |
| `user` | **行単位**。email / code が既存なら skip（CSV に足した行だけ入る） |
| `demo` | **番兵行**（`users.code='demo01'`）の存在。投入は単一トランザクション |
| `fixture` | SQL 自体が `WHERE NOT EXISTS` / `ON CONFLICT` で冪等 |

`master` / `demo` を `ON CONFLICT DO NOTHING` の upsert にしていないのは、**管理画面で削除した行は
conflict せず再 INSERT されてしまい、消したはずのデータが復活する**ため。UI の編集を CSV へ
書き戻す機能は無く、CSV → DB の一方向でよい。

作り直したいときは fresh init する（PowerShell 5.1 では `&&` が使えないため 1 コマンドずつ実行）:

```bash
pnpm compose:dev:down -v
pnpm compose:dev:up
pnpm provision:dev
```

## CSV の仕様

- 文字コードは UTF-8。ヘッダ必須・列の順不同可。値は前後空白を trim する。
- ヘッダは基本的に **DB 列名**。親参照だけ `<親テーブル単数形>_code`（例: `division_code`）。
- 数値列（`positions.code` / `urgency_levels.code` 等）は空欄にしない。整数でなければ投入前に落ちる。
- `users.csv` の `roles` 列はセミコロン区切りで**上位ロールのみ**書く（`admin` / `interviewer`）。
  member は全員が暗黙保有するため書かない。
- `users.csv` の `gotrue_id` は空なら GoTrue が採番する。`admin1` / `interviewer1` / `member1` /
  `member2` だけは **固定 UUID** を持ち、pgTAP が `SET LOCAL app.user_id` に同じ値を直接
  埋め込んでいる。この 4 行の `gotrue_id` を変えると RLS テストが意味を失う。

## 追加・更新するには

1. 該当 CSV を編集する（master を増やすときは FK 依存順に注意）。
2. `pnpm provision:{env}[:{step}]` を実行する。
3. `master` / `demo` は既に入っていればスキップされる。反映したい場合は fresh init する。

新しいマスタテーブルを足すときは、CSV に加えて
[`scripts/provision/master.mjs`](../../../scripts/provision/master.mjs) の `TABLES` に
定義（テーブル名・列・行 → 値の組み立て）を追加する。
