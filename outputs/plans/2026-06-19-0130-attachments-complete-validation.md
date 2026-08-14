# 添付の complete 実体検証 + アバター置換の安全化（レビュー HIGH 対応）


| 項目 | 値 |
|---|---|
| 概要 | [triage レビュー](../reviews/2026-06-19-0038-plans-review-triage.md) の添付 HIGH/MEDIUM 修正。complete は `HeadObject` でサーバ真値検証（不在422/超過413/不許可415、size は実測）+ presign 前に MIME allowlist + 最大20MB（`policy.ts` unit5）。avatar は作成時に旧を消さず **complete 成功時に置換**（unique index を status=200 限定に変更）。一覧/DL を status=200 限定 |
| ステータス | ✅ 検証完了 |
| PR | [#48](https://github.com/sasakiyusuke2017015/wanonwan/pull/48)（merged） |

## 1. 目的

添付基盤（#40/#41/#44 マージ済み）に残る、Plan の受け入れ基準（§3/§6）未達の実害を塞ぐ。

- **#3 [HIGH]**: complete がクライアント申告 `sizeBytes` だけで `status=200` にできる（実体未検証）。presign に MIME/サイズ上限なし。
- **#4 [HIGH]**: アバター置換が「作成時に旧を削除」→ 新 upload 未完了で旧 avatar を失う。
- **#5 [MEDIUM]**: 一覧/ダウンロードが `status=200` に絞っておらず、未完了添付が混ざる。

## 2. 設計

### #3 実体検証 + server-side ポリシー

- `apps/web/lib/storage/policy.ts`（純関数）: `MAX_ATTACHMENT_BYTES`、`ALLOWED_CONTENT_TYPES`、
  `isAllowedContentType` / `isWithinMaxSize`。unit test で固定。
- `presign.ts` に `headObject(client, bucket, key)`（存在=メタ / 不在=null）。
- **POST 作成**: `contentType` が allowlist 外なら 415（presign 前に弾く）。
- **PATCH complete**: id の `object_key` を RLS スコープで取得 → `HeadObject` で
  実体検証（不在=422 / サイズ超過=413 / MIME 不許可=415）→ `size_bytes` は**実測値**を入れて `status=200`。
  クライアント `sizeBytes` は信用しない（body 不要化）。

### #4 アバターは complete で置換

- `attachments_one_avatar_per_user` index を **`status=200` 限定**に変更
  （pending と confirmed が共存できる。`65_attachments.sql` を DROP+CREATE で migrate）。
- **POST 作成**: avatar の事前 DELETE を撤去（pending を作るだけ）。
- **PATCH complete**: avatar のとき、確定 tx 内で**先に旧行（同 entity・id 違い）を DELETE → 自分を 200 に**。
  新 upload が HeadObject で確認できて初めて旧が消える。旧 object は DELETE トリガ→worker で本体掃除。

### #5 status フィルタ

- 一覧 GET: `and status = 200`。ダウンロード GET(`[id]`): `and status = 200`（pending は 404）。

## 3. 検証

- unit: `policy.ts`（allowlist / サイズ境界）。typecheck/lint/test green。
- pgTAP: avatar index が `100+200` 共存を許し `200+200` を弾く（admin context）。
- **runtime（Docker・笹木さん）**: 実 upload→complete で実サイズ反映 / 未完了で 422 / 上限超過 413 /
  avatar 変更を途中放棄しても旧 avatar が残る / 一覧に pending が出ない。

## 4. 判断ログ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-06-19 | complete は `HeadObject` でサーバ真値検証。client `sizeBytes` は廃止 | レビュー #3: 申告だけで 200 化は改ざん可能 |
| 2026-06-19 | avatar unique index を `status=200` 限定にし、置換は complete 成功時 | レビュー #4: 作成時削除は新未完了で旧を失う |
| 2026-06-19 | MIME allowlist + 最大 20MB を server-side 固定 | レビュー #3: presign に上限がない |

## 5. ステータス

- [x] Plan ドラフト
- [x] 実装（`policy.ts`+unit5 / `headObject` / POST=MIME 415・avatar 事前削除撤去 / PATCH=HeadObject 検証(422/413/415)+avatar は complete で置換 / GET 一覧・DL を status=200 限定 / 65 index を status=200 限定に DROP+CREATE / client は sizeBytes 送信を廃止）。typecheck・lint・web test 69 green
- [x] pgTAP（avatar index の 100+200 共存 / 200+200 違反）— [`avatar_unique_confirmed.test.sql`](../../packages/db/tests/avatar_unique_confirmed.test.sql) が `pnpm test:db` の対象に入り、develop の CI が success
- [x] **runtime 検証（dev / Docker）**（2026-06-24・API 経由。検証データは全削除済み）
  - [x] 実 upload → complete で実サイズ反映（complete 応答 `sizeBytes` がサーバ実測値。client からの申告 size は廃止済み）
  - [x] 未完了（object 不在）で complete → **422**
  - [x] 上限超過（21MB）で complete → **413**
  - [x] MIME allowlist 違反 → presign で **415**（complete 側 415 は防御多重として code 上存在）
  - [x] 一覧 / download に pending（`status=100`）が出ない
  - [x] avatar は complete 成功時に置換（2 枚 upload 後も `status=200` は 1 件）。**「complete せず途中放棄した場合に旧 avatar が残る」経路は未実施**（置換が complete 契機であることをコードで確認して代替）
