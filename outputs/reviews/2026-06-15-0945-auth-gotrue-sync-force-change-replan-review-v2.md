# 再々計画レビュー: auth-gotrue-sync-force-change

| 項目 | 値 |
|---|---|
| 種別 | 再々計画レビュー（再計画レビュー NEEDS WORK 反映後） |
| 対象 Plan | [2026-06-14-1455-auth-gotrue-sync-force-change](../plans/2026-06-14-1455-auth-gotrue-sync-force-change.md) |
| 前回レビュー | [2026-06-15-0930-auth-gotrue-sync-force-change-replan-review](2026-06-15-0930-auth-gotrue-sync-force-change-replan-review.md) |
| 判定 | **APPROVE** |

## 確認結果

前回 BLOCKER「middleware を `/api` まで広げると認証 API が壊れる」は、実装前 Plan として解消済み。

- `middleware.ts` はページ専用のままにし、`/api` の matcher 除外を維持する方針へ改訂されている。
- force-change enforcement は API 層ゲート単独に戻され、非 allowlist の業務 API を 403 JSON で拒否する設計になっている。
- `auth/login` と `auth/refresh` はゲート対象外と明記され、未ログイン login / access 失効 + refresh cookie の refresh が route に届く検証（B-3b）も追加されている。
- 前回 NICE の `claims.email` 欠落時 401 も Step 5 に反映済み。

この構成なら、前回懸念した「middleware の API 介入で login/refresh が route に届かない」問題を避けつつ、初回レビューの「API 直叩きで force-change をバイパスできる」問題も API 層ゲートで塞げる。

## 指摘

[NICE-TO-HAVE] §7 リスク表に旧方針の文言が 1 箇所残っている。

`force-change が API を素通り` の緩和欄が「API 層ゲート + middleware を `/api` までカバー」のままになっている。判断 #6 と Step 4 は正しく「API 層ゲート単独 + middleware はページのみ」に改訂済みなので、実装者が古い方針を拾わないよう、§7 も同じ表現に揃えるとよい。

これは Step 4 / 判断 #6 / 検証 B-3b の主要指示が明確なため差し戻し対象ではない。

## 補足

DB カラムフォールバック時のページ判定については、Step 3-B0 に「レイアウト Server Component + API ゲートで DB から行う」「middleware の Edge では DB を読まない」と明記されているため、現時点では追加 BLOCKER なし。

verdict: APPROVE
