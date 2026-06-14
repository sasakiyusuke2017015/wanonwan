# 計画レビュー: auth-gotrue-sync-force-change

| 項目 | 値 |
|---|---|
| 種別 | 計画レビュー（実装前 Plan レビュー） |
| 対象 Plan | [2026-06-14-1455-auth-gotrue-sync-force-change](../plans/2026-06-14-1455-auth-gotrue-sync-force-change.md) |
| 実施 | 2026-06-15 09:30 JST |
| レビュアー | code-reviewer / security-reviewer / architect の読み取り専用 Agent を並列起動し統合 |
| slug | `auth-gotrue-sync-force-change` |

## 判定

| 軸 | 値 |
|---|---|
| 最終判定 | **NEEDS WORK** |
| Plan 判定 | NEEDS WORK |
| 実装判定 | N/A（コード未着手） |
| 記録整理 | OK |

> 初回判定 = NEEDS WORK。BLOCKER 6 件はいずれも「設計の方向性は正しいが、実装前に Plan へ明記すべき具体」で、
> コード未着手のため修正コストは低い。**本 Review 発行後、Plan は §8 判断ログ（2026-06-15 行）の通り全 BLOCKER を反映済み**。
> 再計画レビューで確認する。

## BLOCKER（実装前に Plan へ反映すべき設計穴）

### B-1. force-change が middleware（ページ層）だけで API を素通りする
- 出どころ: security / architect
- middleware は `matcher` で `/api` を除外（[middleware.ts:33](../../apps/web/middleware.ts#L33)）。force-change をページリダイレクトのみで構成すると、`must_change_password` 持ちの有効トークンで `/api/v1/*` を直接叩け、全業務 API が通る。`getCurrentClaims()` は token 有効性しか見ない（[current-user.ts:6-14](../../apps/web/lib/auth/current-user.ts#L6-L14)）。
- 影響: 初期 PW を握った攻撃者が UI を介さず全機能にアクセス + change-password で PW を固定し乗っ取り完成。
- 修正: **API 層ゲート**（非 allowlist を 403）+ middleware を `/api` までカバー。CLAUDE.md「認可は API 層が主」と整合させる。→ Plan 判断 #6 / Step 4 に反映。

### B-2. 判断 #2 のフォールバック「毎回 admin getUser」が Edge middleware で成立しない
- 出どころ: architect
- claim が token に載らなかった場合の代替が「毎回 admin getUser」だが、Edge runtime で (a) 全遷移に同期 HTTP 往復、(b) service_role mint 可否不明、(c) 同じ GoTrue 設定なら getUser にも載らない可能性、で破綻。検証失敗時に Plan ごと作り直しになる。
- 修正: フォールバックを **`public.users.must_change_password` カラム + レイアウト/API 判定** に差し替え（真実源は 1 つに固定し両持ちしない）。→ Plan 判断 #2 / Step 3-B0 に反映。

### B-3. change-password に current password 確認が無い
- 出どころ: architect / security
- `{ newPassword }` のみで認証必須だけだと、XSS / 端末放置でセッションを奪った攻撃者が PW を掌握＝乗っ取り。汎用セルフ変更と兼用なら特に危険。
- 修正: **current PW 必須**（`signInWithPassword` で本人確認）。force-change でも直前に初期 PW を打つため UX 負荷は軽微。→ Plan 判断 #7 / Step 5 に反映。

### B-4. 再ログインの session 差し替えが access のみだと旧 refresh からフラグ復活
- 出どころ: code-reviewer / security
- 判断 #5 の方向（解除→再ログイン→setSession）は正しいが、`setSession` に access だけ渡すと旧 refresh が残り、失効後の refresh でフラグ付き世代が復活し得る。reset 後の claim 伝播も検証対象に無い。
- 修正: `signInWithPassword` の戻り session（**access+refresh 両方**）を `setSession` に渡すと明記。reset 後 refresh で反映されることを検証項目に追加（B-1）。→ Plan 判断 #5 / Step 5 / §6 B-1 に反映。

### B-5. change-password / reset のレートリミット方針が未記載
- 出どころ: code-reviewer / security（明示的に「やる/やらない」を決めれば NICE 降格可）
- change-password は内部で `signInWithPassword` を叩くため GoTrue 増幅面。login/refresh はレートリミット済み（[login/route.ts:15-17](../../apps/web/app/api/v1/auth/login/route.ts#L15-L17)）。
- 修正: change-password に **IP レートリミットを入れる**（`rateLimit` 流用）。reset は admin ゲートありで当面なし。→ Plan 判断 #8 に反映。

### B-6. email 同期の DB unique violation が 409 にマップされるか未確認
- 出どころ: code-reviewer
- GoTrue 422/409 → 409 変換は記載済みだが、DB 側 unique violation が `mapDbError` で 409 に落ちるかは未確認。DB 事前 dup select と GoTrue 制約の責務重複も整理が要る。
- 修正: `public.users.email` の unique 制約 + `mapDbError` の 409 マップを検証項目に追加。責務を GoTrue/DB の unique 制約に置く。→ Plan Step 2 / §6 A-2 に反映。

## NICE-TO-HAVE（後続で拾う／Plan に取り込み済みのもの含む）

- `must_change_password` キー定数の `lib/auth/metadata.ts` 集約を「任意→**必須**」化（typo によるサイレント事故防止）。→ Plan §2 / Step 2-0 に反映。
- email 同期の **tx 境界明記**（select 用 tx を閉じてから GoTrue → 別 tx で update）。→ Step 2-1 に反映。
- ロールバック三重障害（GoTrue 成功・DB 失敗・ロールバック失敗）時の「DB=旧・ログイン=新」要手動修復をリスク表に明記。→ §7 に反映。
- 既存ユーザー一括 force-change を残課題に（reset ロジック再利用で bulk 化可能）。→ §9 残課題に反映。
- change-password のエラー順序を best-effort（PW 変更確定後の再ログイン失敗で詰ませない）。→ Step 5 に反映。
- newPassword 確認入力の責務分担（new==confirm は UI、長さは API）。→ Step 5 に反映。
- B-0 検証手段の具体化（Cookie の access token をデコード）。→ Step 3-B0 に反映。
- jwt の strict 型ガード（`=== true`、`Boolean()` で緩めない）。→ Step 3-2 に反映。

## 各論点への回答（要約）

- email 同期順序（GoTrue→DB + best-effort ロールバック）: **妥当**。B-6 と tx 境界を詰める。
- change-password の解除→再ログイン順: **強制ループは回避できる**。ただし B-4（refresh 差し替え）が前提。
- reset 専用エンドポイント分離: **妥当**（契約分離の一貫適用）。
- Step 依存順序（client→A→B）: **正しい**。漏れなし。
- フラグ保存先 app_metadata（service_role 限定）: **妥当**。ただし B-1 を塞がないと「改ざん不可だが無視可能」になる。

## 実施した検証

- 関連既存コード（users routes / packages/auth / jwt / middleware / provisioning / session / rate-limit / current-user）を 3 視点で読み、Plan の前提が現状コードと一致することを確認。
- GoTrue v2.189.0 が JWT claim に `app_metadata` を載せる蓋然性は高い（`role` が既に token 由来で取れている）が、**実トークンでの確認は未実施**（Plan Step 3-B0 の実装時検証に委譲）。
- ギャップ: 実装が無いため動作検証は不可。B-0（claim 搭載）の実機確認が真実源方式の分岐を決めるため最重要。

## 対応 Plan へのリンク

[2026-06-14-1455-auth-gotrue-sync-force-change](../plans/2026-06-14-1455-auth-gotrue-sync-force-change.md)
