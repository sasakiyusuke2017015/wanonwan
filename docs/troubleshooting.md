# トラブルシュート — Wanonwan ローカル開発

「何かおかしくなった時のやり直し方」を現在形で記す（特定バージョンからの移行手順は書かない。
[evergreen.md](../.claude/rules/evergreen.md)）。

## `required variable X is missing a value` / `✗ X が未設定です`

env ファイルが無い（または必要なキーが欠けている）。compose もスクリプトも既定値を
持たないので、接続情報は必ず env で明示する。

```powershell
Copy-Item infra/.env.example infra/.env
Copy-Item apps/web/.env.example apps/web/.env.local
```

`.env.example` に無いキーを要求された場合は、そのキーを `.env.example` 側にも追加する
（dev で必要な値は example が常に網羅している状態を保つ）。

## 完全に作り直したい / DB がおかしい

DB ボリュームごと破棄して作り直す:

```bash
pnpm compose:dev:down -v   # コンテナ + 名前付きボリューム(wanonwan_db-data) を削除
pnpm compose:dev:up        # 起動(--wait) → migrate → web（端末を専有）
pnpm provision:dev         # 別端末で: 組織マスタ + ユーザ投入
```

`-v` がデータ消去の肝。`-v` なしの `pnpm compose:dev:down` はコンテナを落とすだけで
ボリューム（データ）は残る。`compose:dev:down` は web（ポート 3000 を掴む `next dev`）も
合わせて止める（web は Docker コンテナでないため別途 kill する）。

## 起動が固まる / postgres に繋がらない

- `pnpm compose:dev:up` は `--wait` で postgres / gotrue が healthy になるまで待つ。途中で
  失敗したら `pnpm compose:dev:logs` でコンテナログを確認する。
- ポート競合（`5432` / `9999` / `3000` が他プロセスで使用中）の場合は、そのプロセスを
  止めるか、`infra/.env` で `PG_PORT` / `GOTRUE_PORT` を変える。

## seed が壊れた気がする

seed は冪等（`ON CONFLICT`）なので再実行で壊れない。状態が怪しいときは上の
「完全に作り直したい」で初期化する。

## マイグレーションを当て直したい

スキーマ SQL は冪等（`IF NOT EXISTS` / `CREATE OR REPLACE`）。`pnpm db:migrate` を
再実行すれば最新 SQL が再適用される。構造ごとリセットしたいときは作り直しを使う。
