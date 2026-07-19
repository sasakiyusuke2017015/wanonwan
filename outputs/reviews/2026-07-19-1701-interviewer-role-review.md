# Review: マルチロール権限 + ロール切替（改訂版 Plan の再レビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-19 17:01 JST |
| レビュアー | Claude Code（architect + security-reviewer の並列代行レビューを統合） |
| 対象 Plan | [`plans/2026-07-19-1631-interviewer-role.md`](../plans/2026-07-19-1631-interviewer-role.md)（マルチロール改訂版） |
| ブランチ | `feature/multi-role`（TBD） |
| 関連 PR | TBD |
| レビュー種別 | 計画 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **NEEDS WORK → 指摘反映済み（再承認待ち）** | エージェント verdict は architect: NEEDS WORK / security: BLOCKED。BLOCKER 全件の推奨修正を Plan に反映済み。実装着手は笹木さんの再承認後 |
| Plan 判定 | 反映後 APPROVE 相当 | 中核設計（認可 = 保有 union / active = 表示のみ / 自己昇格閉塞 / per-answer 可視性維持）は両者とも妥当と評価。BLOCKER は全て「実装前に潰せる具体的欠落」で、Plan 修正で解消 |
| 実装判定 | N/A | 実装はまだ存在しない |
| 記録整理 | OK | 指摘の反映内容は Plan の判断ログに記録済み |

## BLOCKER（4 論点・全て Plan へ反映済み）

| # | 出所 | 指摘 | Plan への反映 |
|---|---|---|---|
| B1 | architect | **seed / provisioning の追随漏れ**。`scripts/seed-from-csv.mjs`（users INSERT に role 列）、`scripts/provision.mjs`（stg/prod 経路。role INSERT + `role in ('admin','member')` ハード検証）、`packages/db/seed/csv/*.csv` が列廃止で壊れる。CSV のマルチロール表現は機械置換でなく設計判断 | Phase 1 に 3 ファイル + CSV 再設計（`roles` 列・セミコロン区切り・上位ロールのみ・空 = member）を明示。検証に動作確認を追加 |
| B2 | architect | **移行 SQL が非冪等**。素の `INSERT ... WHERE role='admin'` → `DROP COLUMN IF EXISTS` は、schema 再適用（2 回目）で存在しない列を参照して失敗 | 移行ブロック全体を `information_schema.columns` の**列存在ガード**で囲む形に修正。pgTAP「schema 2 回適用が成功」を追加 |
| B3 | architect + security(N1) | **トリガの UPDATE バイパス**。BEFORE DELETE のみだと `UPDATE user_roles SET role='interviewer'` で最後の admin を無防備に降格できる（PK 列も UPDATE 可能） | トリガを **BEFORE UPDATE OR DELETE**・旧版と同型の条件（`OLD.role='admin' AND (DELETE OR NEW.role<>'admin')`）に修正。pgTAP に UPDATE 降格拒否を追加 |
| B4 | architect + security(B1) | **全置換 PUT × BEFORE DELETE トリガの誤爆**。唯一の admin が admin を維持したまま他ロールを編集しても、DELETE 時点で「残 admin 0」→ RAISE で tx ごと abort し、**自分のロールを一切編集できなくなる** | users PUT を**差分適用**（除去分のみ DELETE / 追加分のみ INSERT）に変更。admin 継続編集では admin 行を触らずトリガ非発火。deferred constraint trigger 案は不採用（差分適用が単純）。pgTAP「唯一 admin の admin 維持編集が成功」を追加 |

## セキュリティ検証で「穴なし」と確認された点

- **cookie 改ざん / CSRF / 切替 API 悪用**: activeRole はどの認可述語にも入らないため権限は 1mm も広がらない。切替 API は sameSite lax + 401 で cross-site も弾かれる。「認可 = 保有 union / active = 表示のみ」の設計判断は妥当。
- **自己昇格経路**: user_roles RLS(write=admin) + users API の admin ゲートで二重閉塞。`is_admin()` の SECURITY DEFINER 参照で RLS 無限再帰なし。
- **member 暗黙保有**: 現行 RLS に `role='member'` を鍵にする述語は存在せず（認証済み判定 or 本人 id 判定のみ）、暗黙化しても可視範囲は広がらない。
- **CASCADE DELETE 時の行トリガ発火**前提は Postgres 挙動として正しい。
- 前回指摘（respondent の interviewer_id 列書き換え穴 / 剥奪後残留 / TOCTOU）は反映維持を確認。

## NICE-TO-HAVE（反映済み）

- `user_roles` SELECT を「自分の行 + admin 全件」に絞る（admin 名簿を全認証ユーザーへ晒さない）→ Phase 2 と判断ログに反映。
- `/me` は activeRole cookie を信頼せず毎回保有集合と突合・非包含は破棄（不変条件へ格上げ）→ Phase 5 に反映。
- active-role cookie は `baseCookie`（httpOnly / sameSite lax / secure）を再利用 → Phase 5 に反映。
- 既存 pgTAP（rls_positions / rls_urgency_levels）の `role='member'` 前提 stale コメント修正 → 検証節に反映。
- PR1 中間状態（isAdmin のみで roles/activeRole 未提供）の動作確認 → 検証節に反映。
- member 暗黙保有では「メンバー機能を持たない admin 専用アカウント」を表現できない → 残課題に反映。

## 過去事例からの整合

- 2026-06-25「1 ユーザー 1 role」決定を覆す件は、笹木さんの明示指示として判断ログに記録済み（手続き上の問題なし）。
- 撤回 Plan 群との被りなし。

## 検証（この Review 自体の）

- [x] 改訂版 Plan を全文 Read 済み（両エージェント）
- [x] 影響範囲を repo grep で確認（seed / provision / CSV / テスト fixture を含む）
- [x] BLOCKER 全件の推奨修正が Plan に反映されたことを確認

## フォローアップ

- [ ] 笹木さんの再承認（マルチロール改訂 + BLOCKER 反映後の Plan に対して）
- [ ] 実装後は `/pr-review` でコードレビュー
