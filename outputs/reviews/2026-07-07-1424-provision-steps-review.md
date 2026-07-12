# Review: provision/seed 体系の 2 軸再編（計画レビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-07 14:24 JST |
| レビュアー | Claude Code（読み取り専用サブエージェント 3 並列: 事実確認 / 設計妥当性 / 過去 Plan 整合） |
| 対象 Plan | [`plans/2026-07-07-1412-provision-steps.md`](../plans/2026-07-07-1412-provision-steps.md) |
| ブランチ | TBD（`feature/provision-steps` 予定） |
| 関連 PR | TBD |
| レビュー種別 | 計画 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE | 初回指摘（B-1〜B-5 / N-1〜N-9）を Plan に反映後、再レビューで解消を確認 |
| Plan 判定 | APPROVE | 設計妥当性・過去 Plan 整合の両再レビューとも APPROVE |
| 実装判定 | N/A | 本 Review では実装は見ない |
| 記録整理 | OK | 前提 Plan リンク・表記ゆれとも反映済み |

> 判定履歴: **初回判定（2026-07-07 14:24）= NEEDS WORK**（下記指摘事項）→ Plan 改訂
> （B-1〜B-5 + N-1〜N-9 反映）→ **対応後判定（2026-07-07 同日再レビュー）= APPROVE**。
> 以下の「指摘事項」は初回判定時の記録（履歴）。解消状況は末尾「対応後再レビュー」を参照。

## 指摘事項

### [BLOCKER]

| # | Plan 内位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| B-1 | `## 設計 > ステップと依存` | **demo と fixture の実行順序が未定義**。両者は surveys/answers を共有し、demo は `rowCount > 0` の非空スキップ判定のため、依存グラフ上並列な fixture（`20_sample.sql` が surveys に INSERT）が先に走ると `provision:dev` で demo データ一式がスキップされ、デモ画面が空になる。現行 `db:seed` は demo → fixture の順で暗黙に両立している | トポロジカル順に加えて「demo は fixture より先行」の順序制約を明記する。または demo の冪等判定を共有テーブルの rowCount ではなく demo 固有の自然キー存在チェック（`demo01` 方式）へ統一する方針を書く |
| B-2 | `## 設計 > deprovision の安全機構` | **非 seed 参照チェックの仕様が不十分**。(a) 既定の READ COMMITTED では「チェック → DELETE」を単一トランザクションにしても TOCTOU（チェック後に commit された参照が DELETE 時に可視化し巻き添え）を防げない。(b) チェック対象に **FK を持たない参照**が漏れている: `survey_targets.target_code`（[40_surveys.sql:48-52](../../packages/db/schema/40_surveys.sql#L48-L52)、組織マスタ code を text 保持）と `attachments.entity_id`（polymorphic）。FK 列挙ベースの実装だと検出できない | 分離レベル（SERIALIZABLE または削除対象の `SELECT ... FOR UPDATE` 先行ロック）を設計に明記。チェック対象を「CASCADE FK（`pg_constraint` から動的列挙）+ FK なし text 参照（survey_targets / attachments を明示列挙）」と定義する |
| B-3 | `## 設計 > deprovision の安全機構` / `## 判断ログ` | **seed 由来判定（自然キー一致）の偽陽性・偽陰性が未整理**。answers / survey_publications / surveys に UNIQUE 自然キーがなく、画面で編集された seed 行は判定から外れて取り残され、CSV と同一キーの実データは誤って seed とみなされうる。安全機構の根拠が曖昧な自然キー解決に循環依存している | seed 行の確実な識別方法（投入時マーカー等）を検討するか、「編集済み seed 行・同キー実データは対象外/誤削除しうる」という限界と運用契約（実運用で編集された環境では deprovision を使わない）を判断ログに明記する |
| B-4 | `## 設計 > package.json alias` / `## 判断ログ` | **`deprovision:stg:user` を提供している**が、stg の user も実メール・実在人物の GoTrue identity + 機微情報（answers の健康状態・面談メモ）を持ち、リスクは prod と同質。判断ログは prod:user のみ論じ stg:user を素通りしている | stg:user も入口を塞ぐ、または「stg は使い捨て環境であり prod と扱いを分ける」理由を判断ログに明示する |
| B-5 | `## 判断ログ` | **過去 Plan の明示決定を判断ログなしで反転している**（2 件）。(1) CI への GoTrue 発行組み込み: [dev-gotrue-users-bootstrap](../plans/2026-06-23-0005-dev-gotrue-users-bootstrap.md) が「CI には意図的に組み込まない（揺り戻し防止）」と明記。(2) stg への demo 解禁: [app-shell-legacy-look](../plans/2026-06-28-2212-app-shell-legacy-look.md) 判断ログが「provision:stg/prod には --demo を渡さない」と明記 | どちらも反転自体は妥当（CI は compose 全スタック `--wait` 起動済み / stg demo は明示ステップ opt-in で prod 保護は維持）。判断ログに「旧決定 → 反転理由」の行を追加する |

### [NICE-TO-HAVE]

| # | Plan 内位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| N-1 | `## 現状コンテキスト` | 「FK は ON DELETE CASCADE が多用」は過度な一般化。実際は CASCADE は junction テーブル（answer_viewers 等）限定で、コア FK（users→マスタ、answers→users/publications 等）はすべて NO ACTION（削除を止める） | 「CASCADE は junction 限定・コア FK は NO ACTION。それでも junction の黙殺 CASCADE と FK なし text 参照があるため自前チェックが必要」に正確化 |
| N-2 | `## 設計 > deprovision` | 依存 seed 残存チェックの説明が master 削除の例のみ。`deprovision:dev:user` 時の fixture/demo 残存の扱い、NO ACTION FK で DELETE が失敗した際のエラー案内が未定義 | 残存チェックを全依存ノードに適用する旨と、FK 失敗時の案内方針を明記 |
| N-3 | `## 設計 > ステップと依存` | stg/prod user の「一時 PW は stdout/CI に出さず 0600 ファイルのみ」（過去レビューで BLOCKER として確定した安全機構）の維持が明記されていない | リファクタで退行させない旨をステップ表 or 検証項目に 1 行追加 |
| N-4 | `## 検証` | (a) 既存の多層ガード（`--dev`⇔compose 整合 / JWT_SECRET dev 値強制 / network 強制）の逆テストがない。(b) deprovision の並行アクセス異常系は dev 単独で再現できず、stg/prod 検証はマージ後回し | 検証節にガードの逆テストを追加。stg/prod で deprovision を検証するまでの安全策（alias 保留等）を検討 |
| N-5 | `## 設計 > ユーザー発行` | `curlimages/curl:latest` の pull が CI クリティカルパスに入る（レート制限・非決定タグ） | タグ固定をリスク緩和に追加 |
| N-6 | `## 実装計画` | 「振る舞い不変のリファクタ」と「新規の危険機能（deprovision）」が 1 PR に混在 | Phase 分割（1: provision 同等動作 + CI 差し替え / 2: deprovision）を検討、または 1 PR とする理由を判断ログに残す |
| N-7 | `## 実装計画` 8 / docs 更新 | 「CSV に行を追加して再 provision」の挙動がステップで異なる（user は追加される / master・demo は全スキップ）ことの利用者向け説明が薄い | CONTRIBUTING のコマンド表に再実行時挙動の注記を含める旨を明記 |
| N-8 | 表記・参照 | (a) fixture の依存は alice のみでなく **alice/bob**（answer_viewers）。(b) [`packages/db/package.json`](../../packages/db/package.json) description の `db:seed` 記載が手順 7-8 の対象外。(c) `docs/技術選定/_techmemo-decoded.md` の `db:seed` 言及は原本扱いで触らないなら一言 | 表記統一と削除・更新対象への追加 |
| N-9 | ヘッダ `前提 Plan` | 「なし」だが実際は [provision-dev](../plans/2026-06-25-0101-provision-dev.md)（🟡 未クローズ）と [seed-csv-master-admin](../plans/2026-06-25-1025-seed-csv-master-admin.md) の後継 | 前提 Plan 欄に参照リンクを追加（来歴のトレーサビリティ） |

## 妥当性レビュー

- **要件適合**: 2 軸コマンド・依存グラフ・冪等・安全な削除という要件は Plan で網羅されている。ステップ分解（master → {user, demo}, user → fixture）は demo CSV の実参照（demo01〜06 / demomgr のみ、users.csv 非依存を全行確認）と整合し妥当。
- **スコープ境界**: やる/やらないは明確。FK 変更をスコープ外としたのは妥当（ただし N-1 の事実修正が前提）。
- **影響範囲**: CI（gotrue は既定 profile + healthcheck ありで `--wait` 対象、pgTAP 7 テストの前提はすべて master+user+fixture で充足、demo 依存テストなし）、docs、旧資産参照は概ね押さえられている。deprovision の DB 挙動（B-2/B-3）が最大の詰め残し。
- **過去 Plan との重複・矛盾**: 撤回 Plan との被りなし。padmin/pmember・example.csv・seed-gotrue-dev の廃止は判断ログで明示反転済み。未明示の反転が 2 件（B-5）。
- **事実確認**: Plan のファイルパス・行番号・行数の記載はすべて実物と一致。事実主張 7 項目中 6 項目一致、不一致は FK 記述の一般化のみ（N-1）。

## 過去事例からの教訓

- [seed-csv-master-admin レビュー](2026-06-25-1031-seed-csv-master-admin-review.md): 「画面 DELETE 行のゾンビ復活」→ 非空スキップ、「一括発行の部分失敗」→ 行単位冪等 + orphan cleanup、「初期 PW の stdout 残留」→ 0600 ファイル。Plan は前 2 者を「現行踏襲」として吸収済み。0600 は未明記（N-3）。
- [provision-dev レビュー](2026-06-25-0130-provision-dev-review.md): 「逆ガード検査 secret = 署名 secret の単一 const」「compose/network の曖昧フォールバック排除」。env 定義テーブル化は後者を構造的に解消する方向で妥当。前者の維持は実装時に `lib/gotrue.mjs` で担保すること。

## 検証（この Review 自体の）

- [x] 対象 Plan を全文 Read 済み（3 エージェントとも）
- [x] 関連ファイルを実地検証済み: seed CSV 全行（answers/schedules/demo_users の参照コード）、`20_sample.sql` 全文、`packages/db/schema/` の全 REFERENCES（ON DELETE 網羅表作成）、`ci.yml` + `docker-compose.yml`（gotrue profile/healthcheck）、pgTAP 全 7 テストの seed 依存、旧資産参照の全体 grep
- [x] 過去 Plan 全件（29 件）のヘッダ確認、撤回 Plan（1 件・UI テーマ）との被りなしを確認
- [x] seed/provision 関連の過去 Review 4 件の指摘・確定事項を確認

## 対応後再レビュー（2026-07-07・指摘元エージェントによる再判定）

Plan 改訂版を初回指摘元の 2 エージェント（設計妥当性 / 過去 Plan 整合）が再レビューし、
**両者とも APPROVE**。

| 初回指摘 | 解消状況 |
|---|---|
| B-1（demo/fixture 順序） | 解消。固定トポロジカル順 + demo 番兵行判定の二重防御。fixture は `demo01` を作らないため番兵が正しく機能することを確認 |
| B-2（TOCTOU / FK なし参照） | 解消。SERIALIZABLE + 失敗時 abort、pg_constraint 動的列挙 + survey_targets / attachments の明示リスト |
| B-3（seed 由来判定の限界） | 解消。運用契約（画面編集していない環境のリセット専用）+ マーカー不採用の判断ログ + seed registry を残課題化 |
| B-4（deprovision:stg:user） | 解消。stg/prod とも user の deprovision を提供しない方針へ変更 |
| B-5（過去決定の無言反転 2 件） | 解消。判断ログの反転行 2 行が原文の意図を正しく要約していること（誤引用なし）を確認 |
| N-1〜N-9 | すべて反映を確認（FK 記述の正確化 / 残存チェック全ノード適用 / 0600 PW 明記 / 逆テスト追加 / curl タグ固定 / 1 PR + commit 分離の判断ログ化 / 再実行挙動 docs 注記 / 表記統一・参照追加 / 前提 Plan リンク） |

再レビューで新たに挙がった指摘（いずれも [NICE-TO-HAVE]、Plan に反映済み）:

- **番兵行方式の部分失敗**: demo 投入が途中で失敗すると番兵だけ残り再実行が誤スキップする
  → demo ステップを単一トランザクション投入とする旨を Plan に追記。
- **dev 個別 PW の統一による docs drift**: `seed-gotrue-dev.mjs` の個別 PW（`Alice1234!` 等）廃止で
  dev は全ユーザー `Admin1234!` に統一される → docs 更新項目と検証項目（alice ログイン確認）に追記。
  自動テストへの影響なし（E2E spec 実体なし・RLS テストは PW 非依存）を確認済み。

## フォローアップ

- [x] B-1〜B-5 を Plan に反映（設計節の修正 + 判断ログ追記）→ 再レビューで APPROVE
- [x] N-1〜N-9 を Plan に反映
- [x] 再レビューの新規 NICE-TO-HAVE 2 件（demo 単一トランザクション / dev PW 統一の docs 明記）を Plan に反映
