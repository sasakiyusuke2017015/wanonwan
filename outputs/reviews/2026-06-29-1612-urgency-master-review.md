# Review: 緊急度マスタ（計画レビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-29 16:12 JST |
| レビュアー | Claude Code |
| 対象 Plan | [`plans/2026-06-29-1537-urgency-master.md`](../plans/2026-06-29-1537-urgency-master.md) |
| ブランチ | `feature/urgency-master`（TBD） |
| 関連 PR | TBD |
| レビュー種別 | 計画 |
| 備考 | Codex トークン枯渇のため Claude による計画レビュー |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER なし。親 Plan のレビュー教訓を設計に反映済み |
| Plan 判定 | **APPROVE** | スコープ・migration・認可・検証が具体的。NICE-TO-HAVE のみ |
| 実装判定 | N/A | 本 Review は計画段階 |
| 記録整理 | OK | 必須要素そろう。親 Plan との対応も明記 |

## 指摘事項

| 重大度 | Plan 内位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| NICE-TO-HAVE | `## 実装計画` PR-1 step 4 | 緊急度の DELETE は **`mapDeleteError`（FK 参照中 → 409）** を使う点を明記したい。positions ルートの「写し」と書いてあるが、positions DELETE が `mapDeleteError` を使うこと（[positions/[id]/route.ts:60](../../apps/web/app/api/v1/positions/[id]/route.ts#L60)）に依存している。`mapDbError` を誤用すると 400 になり「使用中で消せない」が伝わらない | step 4 に「DELETE は mapDeleteError（使用中は 409）」と 1 行追記 |
| NICE-TO-HAVE | `## スコープ` PR-1 / `urgency_levels` 設計 | `code int UNIQUE` を採るが、緊急度は役職コードのような外部意味を持たない。`code` を管理者に見せる必要があるか（並び順としてのみ使うなら label だけで足りる可能性）。組織/役職マスタとの一貫性を取るなら現状でよい | 現状維持で可。code を「並び順兼一意キー」と Plan に一言補足すると意図が明確 |
| NICE-TO-HAVE | `## 実装計画` PR-2 / seed | demo の surveys / answers に緊急度を 1 件もセットしないと、画面で「緊急度が入った状態」を確認しにくい。`urgency_levels.csv` は入れるが参照側 demo は null のまま | 任意: demo answers の 1〜2 行に urgency を振ると表示確認が楽（FK 解決は refByValue で可能） |
| NICE-TO-HAVE | `## 検証` | PR-2 の「他人の answer に緊急度を設定できない」検証が手動のみ。`answers_update` RLS（admin/本人/面談者）でカバーされるが、pgTAP の回帰に一言入れてもよい | 任意。既存 rls_answers の範囲なので必須ではない |

BLOCKER: **なし**

## 妥当性レビュー

- **要件適合**: 「緊急度を surveys / answers 両方から参照する共通マスタ」「値域 code+label（高/中/低）」という
  確定事項に合致。組織/役職マスタと同型で `MasterListView` に載せる判断は妥当で、専用フォームを避けている。
- **スコープ境界**: 「やらないこと」（絞り込み/集計/装飾/通知/schedules 連携）が明確。PR を
  **PR-1(マスタ本体) / PR-2(参照配線+書き手 UI)** に分け、**列追加と書き手 UI を PR-2 に同梱**することで
  親 Plan レビューの「書き手のない FK = dead column」指摘を構造的に回避できている。良い設計。
- **影響範囲（DB/API/認可/migration）**:
  - migration: `urgency_levels` を **35 番**（surveys 40 / answers 60 より前）で新設し、列追加は
    **`ALTER ... ADD COLUMN IF NOT EXISTS`**。親 Plan のコードレビューで挙がった「CREATE 編集は既存 DB に
    silent no-op」「FK 順序」「ENABLE RLS 明示漏れ」の 3 点をすべて先回りで潰している。検証で確認した
    通り、fresh / 既存 DB どちらでも 35→40→60 の順で FK 参照先が先に存在する。
  - 認可: master write は withActiveUser + RLS WITH CHECK(admin)（既存マスタと同方針）。surveys.urgency は
    surveys_write=admin、answers.urgency は面談記録エンドポイント（`answers_update` = admin/本人/面談者）で
    設定。設定経路の権限が既存 RLS と整合。
  - 削除整合: 使用中マスタの削除を FK RESTRICT + 409（mapDeleteError）で弾く方針は役職マスタと一致。
    `SET NULL` を採らない判断も判断ログにある。
- **検証**: pgTAP（RLS）+ build/typecheck/lint + dev 手動（CRUD/設定/保持/null/削除409）が具体的。
- **未確定事項**: code 割当 / answers の書き手範囲 / 一覧表示要否 の 3 点は実装を止めるものではなく、
  step 着手前に確定すれば足りる粒度。answers の書き手は本文で「面談記録（面談者/admin）」と実質決まっており、
  未確定は「回答者本人にも出すか」の拡張可否のみ。

## 過去事例からの教訓

- **[seed-csv-master-admin（2026-06-25）](../plans/2026-06-25-1025-seed-csv-master-admin.md)**: `MasterListView` +
  `MASTER_CONFIGS` + CSV seed の基盤を確立。緊急度はこの config-driven パターンに素直に乗る想定で、
  教訓（汎用マスタは設定追加で済ませる）を踏襲できている。
- **[separate-role-from-position（2026-06-25）](../plans/2026-06-25-1558-separate-role-from-position.md)**:
  「権限(認可)と HR/業務概念を混ぜない」。緊急度は role と無関係な純粋業務マスタで、admin 判定（users.role）に
  影響しない。混同リスクなし。RLS の master ループに足すだけで write=admin になる点も一致。
- **親 Plan（設問マスタ）のコードレビュー指摘**（RLS ENABLE 漏れ / 冪等 ALTER / FK 順序 / dead column）を
  本 Plan が **設計段階で全て織り込み済み**。同じ轍を踏んでいない。
- 撤回 Plan との重複なし。既存スキーマに urgency/priority 概念は不在（health の「要緊急対応 999」とは別概念で、
  Plan も区別を明記）。`/admin/urgencies`・urgencies API・`urgency_levels` は未存在を確認済み（新規追加で衝突なし）。

## 検証（この Review 自体の）

- [x] 対象 Plan を全文 Read 済み
- [x] 関連ファイル grep 済み（positions ルートの mapDeleteError / 99_rls.sql の answers ポリシー /
  InterviewForm の送信先・フィールド / master-config / schema 番号スロット / urgency 既存物の不在）
- [x] 撤回 Plan・既存 Plan との被り確認済み（被りなし）

## フォローアップ（Plan 側へ反映してほしい修正・任意）

- [ ] [NICE] PR-1 step 4 に「urgencies DELETE は mapDeleteError（使用中 409）」を明記
- [ ] [NICE] `urgency_levels.code` を「並び順兼一意キー」と補足
- [ ] [NICE] demo answers 1〜2 行に urgency をセット（表示確認用）
- [ ] [任意] 着手前に未確定 3 点（code 割当 / 回答者本人の設定可否 / 一覧表示要否）を確定

## verdict

**APPROVE** — BLOCKER なし。親 Plan のレビュー教訓を設計に織り込んでおり、計画として実装に進めてよい。
NICE-TO-HAVE は実装時に取り込めば十分。
