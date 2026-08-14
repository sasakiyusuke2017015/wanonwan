# Plan Review: provision を dev/stg/prod 3 環境対応にする

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-25 01:30 JST |
| レビュアー | Claude Code（architect agent） |
| 対象 Plan | [`plans/2026-06-25-0101-provision-dev.md`](../plans/2026-06-25-0101-provision-dev.md) |
| レビュー種別 | 計画 |

## 判定

| 軸 | 初回判定 | 対応後判定 |
|---|---|---|
| 最終判定 | NEEDS WORK | **APPROVE** |
| Plan 判定 | NEEDS WORK | **APPROVE** |
| 実装判定 | N/A | N/A（未実装） |
| 記録整理 | OK | OK |

> 履歴: 初回計画レビューで BLOCKER 2 件 → Plan 修正 → 再計画レビューで APPROVE。

## 初回 BLOCKER（対応済み）

- **B-1**: dev 逆ガードが検査する secret = 実際に GoTrue 署名に使う secret の一致保証が曖昧だった。
  → 対応: 実装計画 step 3 で**単一 `const JWT_SECRET`**（ガード＝署名で同一変数・二重管理禁止）を明記。
  検証に「`JWT_SECRET` 未 export の素の dev で `provision:dev` → 発行ユーザ login 200」を追加（実署名一致を E2E で担保）。
- **B-2**: `--dev` 非指定で dev compose を渡すと network が `wanonwan-stg` にフォールバックする危険。
  → 対応: step 2 で `--dev` は network=`wanonwan` 強制、step 4 で「`--dev` 無し + dev compose は die」「`--dev` + 非 dev compose は die」。
  検証に「`--dev` 無しで dev compose 直実行 → die」を追加。stg/prod の既存判定は温存。

## NICE-TO-HAVE（反映済み / 実装時メモ）

- N-1 dev+env-file 優先順位（process.env 優先・dev は env 無視）/ N-2 --dev+非dev compose 矛盾 die /
  N-3 email+code 独立 die / N-4 CI・dev:up 非組込み / N-5 役割分担コメント → いずれも step/検証/判断ログに反映。
- **N-6（実装時に重点確認）**: `flag()` 改修（値なし `--dev` + 値欠落の誤認防止）が **stg/prod 既存呼び出し**
  （`--compose-file ... --env-file ... --email ...`）を壊さないこと。コードレビューで回帰確認する。
- **N-7**: dev ガードの意義（dev 値でない secret で署名すると GoTrue 検証に失敗＝login 不能 orphan になる）を
  コメントに一言。B-1 と対の関係。

## verdict

APPROVE（実装着手可。N-6 を実装/コードレビューで重点確認）
