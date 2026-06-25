# Review: seed の CSV 化 + マスタ管理基盤

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-25 10:31 JST |
| レビュアー | Claude Code（architect + security-reviewer 並列） |
| 対象 Plan | [`plans/2026-06-25-1025-seed-csv-master-admin.md`](../plans/2026-06-25-1025-seed-csv-master-admin.md) |
| ブランチ | TBD |
| 関連 PR | TBD |
| レビュー種別 | 計画 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **NEEDS WORK** | BLOCKER を Plan の判断ログ／非ゴール／検証に反映後、再計画レビューで APPROVE 見込み |
| Plan 判定 | NEEDS WORK | 方向性は妥当だが、計画段階で確定すべき設計決定が 5 件未決 |
| 実装判定 | N/A | 本 Review は実装を見ない |
| 記録整理 | FOLLOW-UP | 下記 BLOCKER を Plan 本体へ反映する |

> architect verdict = NEEDS WORK / security-reviewer verdict = BLOCKED。
> いずれの BLOCKER も「判断ログ + 実装計画の擬似仕様数行」で閉じられ、Plan の全面再構成は不要なため
> **統合最終判定は NEEDS WORK**。ただしセキュリティ B-1（admin 自己昇格）は設計決定が必要で、放置不可。

## 指摘事項

| # | 重大度 | Plan 内位置 | 指摘 | 推奨修正 |
|---|---|---|---|---|
| B-1 | **BLOCKER** | Phase3-8 / 判断ログ「マスタ RLS 不要」 | **admin 自己昇格**。`app.is_admin()` の唯一の源は `positions.code BETWEEN 990 AND 999`（[90_rls_helpers.sql:10-19](../../packages/db/schema/90_rls_helpers.sql#L10-L19)）。positions を admin write の一般 CRUD にすると、admin が ①自分の役職を 990-999 に変更 ②990-999 の役職を新規作成して任意ユーザーに付与、で権限を増やせる。RLS `positions_write`/`users_write` は `is_admin()` のみで値域ガード無し（[99_rls.sql:44-55](../../packages/db/schema/99_rls.sql#L44-L55)）。「マスタ RLS 追加不要」はこの危険を見落としている | API 層 + RLS `WITH CHECK` の両方で 990-999 帯の作成/付与を制限、または「admin 役職の付与は provision/専用経路のみ・マスタ画面から触れない」を非ゴールに明文化。positions Zod に `code` 値域制約を追加 |
| B-2 | **BLOCKER** | Phase1-2 / Phase2-5（`ON CONFLICT DO NOTHING/UPDATE`） | **CSV「単一ソース」と管理画面 CRUD が両立しない**。`DO UPDATE` だと画面編集が再 provision で巻き戻り、`DO NOTHING` だと CSV 修正が反映されない。さらに**画面 DELETE した行が CSV に残ると再 provision でゾンビ復活**。真実の源（CSV/画面/DB）の衝突が未確定 | 「**初回投入=CSV、以後の運用編集=管理画面（DB が真実の源）**」と決め、ローダー/provision は **空テーブルへの初回投入専用（`DO NOTHING`・既存行は UPDATE しない）** に限定。CSV は追加専用・削除は画面のみ、を判断ログに固定 |
| B-3 | **BLOCKER** | step6 / R2 | **N 名一括 GoTrue 発行の部分失敗が未設計**。単純ループ化すると「前半 DB 投入済み / 当該行 GoTrue orphan / 後半未処理」の中間状態になり、再実行が先頭の既存行で `die` して前進しない | 行単位で冪等化: ①各行で email/code 既存ならスキップ（die せず continue）②DB insert 失敗時のみ当該行の GoTrue を cleanup ③全行後に「成功/スキップ/失敗」集計・失敗あれば非ゼロ終了。ガード（JWT_SECRET 等）はループ前に 1 回 |
| B-4 | **BLOCKER** | step6 / R2 | **N 名初期 PW の生成・表示・配布が未設計**。stdout 一括表示は scrollback / リダイレクト先ファイル / CI ログに平文 PW が N 名分残留。1 名運用（[provision.mjs:258-263](../../scripts/provision.mjs#L258-L263)）の N 倍で漏洩面拡大 | 第一候補: 初期 PW を表示せず `mustChange` フラグ + 各人がリセット導線で初期化（users route は既に `mustChangeAppMetadata(true)` 使用 = [users/route.ts:75](../../apps/web/app/api/v1/users/route.ts#L75)）。表示する場合も「stdout のみ・ファイル/CI に出さない」を運用手順化。PW を CSV に書かない |
| B-5 | **BLOCKER** | step1 / 影響ファイル | **stg/prod 実メール(PII)+gotrue_id を VCS にコミットする是非が未判断**。dev 固定値は容認済みだが、stg/prod の人員 CSV が同じ `users.csv` だと実メールがリポジトリに入る | 「VCS commit する `users.csv` は **dev テストユーザーのみ**」と分離。stg/prod 人員 CSV は **コミットしない**（`.gitignore` 追加 or リポジトリ外パスを `--users-csv` で渡す）。gotrue_id 列は dev のみ・stg/prod は空欄で発行後 id 後埋め |
| N-1 | NICE-TO-HAVE | R1 / 影響ファイル | seed-gotrue-dev.mjs の USERS 配列と users.csv が**二重管理**。不一致は login 不能 orphan（= R1 の事故） | seed-gotrue-dev.mjs を users.csv 駆動に変更し単一ソース化。dev PW は .mjs 側マップに残す（CSV に置かない） |
| N-2 | NICE-TO-HAVE | step2 / R3 | **CSV 値の SQL インジェクション面**。psql heredoc は prepared statement 不可。name は日本語・将来カンマ/引用符/改行を含みうる | 全カラムに `sqlStr()` 相当を適用 or `\copy`/`-v` パラメータ方式。CSV パーサは `csv-parse` 採用を確定。テストに `'); DROP` 等を入れる |
| N-3 | NICE-TO-HAVE | Phase3-8 | `/api/v1/org` を 1 ルートで 4 マスタ CRUD は責務肥大 | write はエンティティ別ルート（`/divisions` `/departments` `/sections` `/positions`）へ分割。集約 GET は `/org` に残す |
| N-4 | NICE-TO-HAVE | R6 | DELETE FK 整合に **users からの参照**と**自己参照リスク**が未記載。positions 990-999 削除で全 admin 消失、自分の所属削除で宙吊り | R6 を「子マスタ + users 参照 + 最後の admin position 削除禁止 + 自己所属削除の扱い」に拡張 |

## 妥当性レビュー

- **要件適合**: 4 要件（CSV 化 / マスタ管理画面 / provision 投入 / 順序ローダー）は計画に対応。方向性は妥当。
- **境界**: 非ゴール（20_sample 非 CSV 化・階層 RLS 別 Plan）は明確。ただし **admin 役職の扱い**（B-1）と **stg/prod PII CSV の分離**（B-5）という境界が抜けている。
- **影響範囲**: DB・API・認可・provision はカバー。**認可の昇格面（B-1）** と **機微情報フロー（B-4/B-5）** の掘り下げが不足。マスタ RLS が既存実装済みである確認は正確。
- **過去 Plan との整合**: [provision-dev](../plans/2026-06-25-0101-provision-dev.md) の「B-1: ガード検査変数 = 署名変数を同一 const に」「email/code 独立 die」「dev 固定 UUID と seed 整合」という確定知見と矛盾しない。本 Plan はそれらを N 名へ一般化する形で、provision-dev の判断ログを引き継ぐべき。

## 過去事例からの教訓

- [provision-dev](../plans/2026-06-25-0101-provision-dev.md) 判断ログ: provision は **dev 固定ユーザ（seed-gotrue-dev）と ad-hoc admin（provision）で役割分離**。本 Plan で provision を「N 名一括発行」に拡張すると、この役割分離が崩れる懸念 → dev は引き続き seed-gotrue-dev が担い、provision の N 名一括は **stg/prod の初期人員投入専用** と整理すると整合する（B-5 の CSV 分離とも噛み合う）。
- [dev-gotrue-users-bootstrap](../plans/2026-06-23-0005-dev-gotrue-users-bootstrap.md): 「`auth.users` 直 INSERT せず GoTrue admin API 経由」「id 指定で seed と自動整合」「冪等（既存 422 スキップ）」は本 Plan のローダーでも踏襲すべき確定知見。N-1 の単一ソース化はこの延長。

## 検証（この Review 自体の）

- [x] 対象 Plan を全文 Read 済み
- [x] 関連実装（provision.mjs / db-seed.mjs / seed-gotrue-dev.mjs / 90_rls_helpers.sql / 99_rls.sql / users route / org route）を Read/Grep 済み
- [x] 関連 Plan（provision-dev / dev-gotrue-users-bootstrap）と整合確認済み
- [x] 撤回 Plan との被り確認（該当なし）

## フォローアップ（Plan 側へ反映）

- [ ] B-1: positions 990-999 帯の扱い（API+RLS ガード or 非ゴール明文化）を判断ログ + Phase3-8 に追記
- [ ] B-2: 真実の源を「初回=CSV / 運用=画面(DB)」に確定、ローダーは初回投入専用（DO NOTHING）と判断ログに固定
- [ ] B-3: provision N 名ループの行単位冪等仕様（スキップ/cleanup/集計）を実装計画 6 に追記
- [ ] B-4: 初期 PW を `mustChange` + リセット導線方式に（表示しない）を確定、または stdout 限定運用を PR 本文必須化
- [ ] B-5: VCS commit する users.csv は dev のみ・stg/prod CSV は gitignore/外部パスを判断ログに追記
- [ ] N-1〜N-4: 実装時に拾う（Plan の残課題に列挙）

## Codex 再レビュー追記（2026-06-25）

対象 Plan は本レビュー後に B-1〜B-5 を実装計画・判断ログ・検証へ反映済み
（[`plans/2026-06-25-1025-seed-csv-master-admin.md`](../plans/2026-06-25-1025-seed-csv-master-admin.md)）。
ただし、反映内容を再読した結果、以下 2 点はまだ実装前に閉じる必要がある。

| # | 重大度 | 位置 | 指摘 | 推奨修正 |
|---|---|---|---|---|
| R-B1 | **BLOCKER** | B-2 / Plan Phase1-2 | B-2 の推奨である `DO NOTHING` は「既存行を更新しない」だけで、画面 DELETE 後に CSV に残った行の**ゾンビ復活**は防げない。対象行が DB から消えていれば conflict が発生せず、再 provision / loader で再 INSERT される | 「初回投入専用」を厳密化し、対象テーブルが非空なら users/master 投入を拒否する、または import モードを分ける。運用で CSV を残すなら DELETE tombstone 方式や CSV 削除運用まで明記する |
| R-B2 | **BLOCKER** | B-4 / Plan Phase2-7 | 「初期 PW を表示せず各人がリセット導線で初期化」は、現状実装だけでは導線が不足している。`packages/auth` に `recover()` はあるが、利用者向け forgot/reset 画面や API は見当たらず、既存 reset は admin が初期 PW を受け取る方式（`users/[id]/reset-password`） | provision の非表示 PW 方針を採るなら、利用者が自力で初期化できる recover/reset 導線を本 Plan のスコープへ入れる。入れない場合は、一時 PW の安全な生成・表示・配布方式を別途明記する |

### 状態メモ

- 初回レビューの B-1 / B-3 / B-5 / N-1〜N-4 は、現 Plan への反映方針として概ね妥当。
- 本レビュー本文の `NEEDS WORK` は「初回 Plan 時点」の判定。現在の Plan は一度反映済みだが、上記 R-B1/R-B2 が残るため、再計画レビューなしで実装着手するのはまだ早い。

### R-B1 / R-B2 への対応（2026-06-25 反映済み）

笹木さんの決定に基づき Plan へ反映済み（[plans/2026-06-25-1025-...](../plans/2026-06-25-1025-seed-csv-master-admin.md) 判断ログ・Phase1-2・検証・リスク R4/R2）:

| # | 決定 | 反映先 |
|---|---|---|
| R-B1 | ローダーは `DO NOTHING` ではなく **非空テーブルはスキップ**（行数ガード）。CSV が真実の源になるのは空 DB の初回のみ。画面 DELETE 行のゾンビ復活を物理的に防止 | Phase1-2 / 判断ログ / 検証（DELETE→再 provision で復活しない）/ R4 |
| R-B2 | **一時 PW + mustChange + 0600 ファイル安全配布**（stdout/CI 非出力）。利用者向け forgot/recover 画面・API は別 Plan（非ゴール明記） | Phase2-7 / 非ゴール / 判断ログ / 検証（PW 非漏洩）/ R2 |

→ 初回 5 件 + 再レビュー 2 件の計 7 BLOCKER はすべて Plan に反映。**実装着手は笹木さん承認待ち**。

## Codex 再々レビュー（2026-06-25）

### 判定

| 項目 | 判定 | 理由 |
|---|---|---|
| 最終判定 | **NEEDS WORK（記録整合のみ）** | B-1〜B-5 と R-B1/R-B2 の設計判断は Plan に反映済み。ただし旧方針文が残っており、実装時に誤読される余地がある |
| 実装着手 | **軽微修正後 APPROVE 見込み** | 追加の設計 BLOCKER はなし。下記 C-1/C-2 の文言整理で閉じられる |

### 指摘事項

| # | 重大度 | Plan 内位置 | 指摘 | 推奨修正 |
|---|---|---|---|---|
| C-1 | **MEDIUM** | 検証: stg/prod 行 | Plan は R-B2 で「forgot/recover 導線は本 Plan のスコープ外」「一時 PW + mustChange + 0600 ファイル配布」と決めているが、検証項目にまだ「`mustChange` 付き発行 → リセット導線で初期化可（B-4）」が残っている。これは新方針と矛盾する | 「一時 PW ファイル配布 → 初回ログイン → mustChange で PW 変更可」に修正する |
| C-2 | **MEDIUM** | 判断ログの旧 B-2/B-4 行 | 判断ログに旧方針の「ローダーは `DO NOTHING`」「初期 PW は表示せず `mustChange` + リセット導線」が残り、後続行の R-B1/R-B2 と矛盾している。後続行のほうが最新決定だが、実装者が旧行を拾うリスクがある | 旧行を削除するか、「撤回: 後続 R-B1/R-B2 で改訂」と明記する。最新決定は「非空テーブルはスキップ」「一時 PW + 0600 ファイル配布」に一本化する |

### 確認済み

- B-1 admin 帯昇格防止は API + RLS + pgTAP 検証まで計画されており、設計上の穴は追加で見つからない。
- B-3 の N 名 GoTrue 発行は skip / cleanup / 集計 / 非ゼロ終了まで記載され、部分失敗の再実行性は計画上閉じている。
- R-B1 は「非空テーブルスキップ」でゾンビ復活を防ぐ方針に改訂済み。
- R-B2 は recover 導線を非ゴール化し、一時 PW の安全配布方式へ改訂済み。

### 結論

追加 BLOCKER なし。C-1/C-2 の文言整理後は **APPROVE 相当**として実装着手してよい。
