# Review: 面談者ロール（interviewer）の導入と面談担当の割り当てフロー整備

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-19 16:43 JST |
| レビュアー | Claude Code（architect + security-reviewer の並列代行レビューを統合） |
| 対象 Plan | [`plans/2026-07-19-1631-interviewer-role.md`](../plans/2026-07-19-1631-interviewer-role.md) |
| ブランチ | `feature/interviewer-role`（TBD） |
| 関連 PR | TBD |
| レビュー種別 | 計画 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER 0。NICE-TO-HAVE 反映のうえ実装へ進んでよい |
| Plan 判定 | APPROVE | 計画・スコープ・リスク整理は妥当。中核判断（is_interviewer ヘルパ不採用 / admin 限定指名 API / RLS 本体無変更 / トリガ無変更）は実コード照合で裏取り済み |
| 実装判定 | N/A | 本 Review では実装は見ない |
| 記録整理 | FOLLOW-UP | 下記 NICE-TO-HAVE を Plan に反映する（本 Review 作成時に反映済み） |

## 事実照合サマリ

両レビュアーが Plan の参照先ファイル（30_users.sql / 90_rls_helpers.sql / 99_rls.sql / domain/user.ts / interview route / users API / (admin) layout / navItems / UserForm / answers API / publications answer route）を実読し、Plan の現状記述が事実と一致することを確認した。特に:

- 二重定義（SQL CHECK + picklist）の同時変更が必要 → 正しい
- `prevent_last_admin_removal` は 3 値化後も `admin→interviewer` 降格で発火 → 無変更判断は正しい
- 割り当て API は RLS `answers_update`(admin) で通る → RLS 追加不要は正しい
- Phase 4 案 A は **API 変更ゼロで成立**（answers 系 GET は admin ゲートなし + RLS 自動フィルタ、トップレベル新ルートは `(admin)` ガード外）
- self-claim（coalesce）と新指名 API の遷移に矛盾なし
- users POST/PUT は role を passthrough しており 3 値化で変更不要（影響漏れではない）
- 自己昇格経路なし（admin ゲート + RLS users_write）。面談者自身による interviewer_id 付け替えは RLS WITH CHECK が拒否
- 過去 Plan（2026-06-25 separate-role-from-position「1 ユーザー 1 role・将来 picklist 拡張」）と矛盾なし。むしろ想定線上。撤回 Plan との被りなし

## 指摘事項

| # | 重大度 | Plan 内位置 | 指摘 | 推奨修正 |
|---|---|---|---|---|
| A1 | NICE-TO-HAVE | Phase 3 | 割り当て API の **UI 呼び出し元がどの Phase にも無い**（orphaned endpoint）。Phase 4 は interviewer 本人の画面で、admin の割り当て UI ではない | Phase 3 に admin 面談画面（`/admin/answers/[id]`）への担当者 Select 追加を含める |
| A2 | NICE-TO-HAVE | 検証 › pgTAP | `rls_answers.test.sql` に interviewer 割り当て済みケースは**存在しない**（alice=回答者 / bob=閲覧者 / carol=無関係のみ）。「流用」は誤誘導 | 新規 fixture を test transaction 内で作る旨へ文言修正 |
| A3 | NICE-TO-HAVE | Phase 7 ↔ 検証 | seed interviewer が「任意」なのに pgTAP がそれに依存し得る不整合 | pgTAP は tx 内 fixture で自足させ、seed 追加は動作確認用の任意と明確化 |
| A4 | NICE-TO-HAVE | Phase 5 | `/me` は既に `user.role`（GoTrue JWT role="authenticated"）を返しており、業務 role と命名衝突の恐れ | 「業務 role = トップレベル `role`、JWT role = `user.role`」と Plan に明記 |
| A5 | NICE-TO-HAVE | 検証 › Vitest | `me/route.test.ts` は `.toEqual` 完全一致 + withUser モックにも role なし | モック戻り値と期待 JSON の両方へ `role` 追加、と具体化 |
| A6 | NICE-TO-HAVE | スコープ | `users/route.test.ts` 等の 2 値前提アサート有無が未確認 | 影響確認対象に含める |
| A7 | NICE-TO-HAVE | 判断ログ | PR1 merge 後「指名できるが本人向け導線が無い」中間状態の許容が未記載 | 判断ログに明記 |
| S1 | NICE-TO-HAVE | Phase 2 / リスク | **respondent が interviewer_id を書き換えられる RLS 上の穴**。`answers_update` は列レベル保護がなく、respondent の UPDATE で interviewer_id（認可決定列）を任意値にできる。現 API 経路（publications answer route は answer_json/status/answered_at のみ SET）では到達不可だが、「RLS が最終ガード」原則が interviewer_id には成立していない | リスク表 + 残課題に不変条件として明記。堅牢化するなら BEFORE UPDATE トリガ（interviewer_id 変更は admin のみ）を residual 候補に |
| S2 | NICE-TO-HAVE | 判断ログ | **role 降格時の割り当て残留**。X を member へ降格しても `interviewer_id = X` の回答は見え続ける/更新できる（RLS は role を見ない） | 仕様として許容するか、降格時に NULL 化/拒否するかを判断ログに明記。pgTAP に降格後挙動のテスト追加 |
| S3 | NICE-TO-HAVE | Phase 3 | 指名先 role 検証が select→update の 2 段だと TOCTOU（間に降格されると不整合な指名が通る） | role チェックと UPDATE を単一 SQL（`update ... where exists(select 1 from users where id=$1 and role in (...))`）でアトミックに。affected rows=0 を 404/422 に |
| S4 | NICE-TO-HAVE | Phase 3 | respondent 本人を面談担当に指名できる（自分の面談担当が自分） | 無害なので許容 + 判断ログに一行、または `interviewerId <> respondent_id` バリデーション |
| S5 | NICE-TO-HAVE | Phase 1 | CHECK 制約の入れ替えは `DROP CONSTRAINT IF EXISTS` → `ADD` の順で冪等に。既存行（admin/member）は新制約を満たすため行移行不要、と具体化 | Phase 1 に SQL 形を明記 |

## 妥当性レビュー

- 要件（メンバー / 面談する人 / 管理者の 3 権限 + 割り当てフロー）に対しスコープは適合。やらない境界（多対多・階層 RLS・answer_viewers UI・候補テーブル）も明確。
- 影響範囲の見落としは A1（admin 割り当て UI）のみで、他は網羅されている。
- セキュリティ設計の中核（per-answer 可視性の維持、blanket 権限を作らない）は正しく、多層防御（UI ガード + API ゲート + RLS）が保たれる。
- S1/S2 は現スコープで実害はないが、将来の回帰を防ぐため Plan に認識を残すべき（反映済み）。

## 過去事例からの教訓

- [2026-06-25-1558-separate-role-from-position.md](../plans/2026-06-25-1558-separate-role-from-position.md) 判断ログ「多対多/roles マスタは過剰（将来 picklist 拡張で対応）」→ 本 Plan はその想定線上にあり、同じ轍（役職と権限の混同）を踏んでいない。
- 撤回 Plan（2026-05-21-0516-pgbouncer-tls-proxy）との被りなし（対象領域が別）。

## 検証（この Review 自体の）

- [x] 対象 Plan を全文 Read 済み（両エージェント）
- [x] 関連ファイル（実装対象・関連 Plan・関連 Rule）を実読/grep 済み
- [x] 撤回された Plan との被り確認済み

## フォローアップ

- [x] A1〜A7 / S1〜S5 を Plan に反映（2026-07-19 反映済み）
- [ ] 実装後は `/pr-review` でコードレビュー（本 Review は計画のみ）
