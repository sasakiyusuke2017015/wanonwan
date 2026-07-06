# Step 4: Review テンプレ新設 + README ダッシュボード再定義

> [02-target](02-target.md) の原則を Review と README に適用する。実装（スクリプト・rules 反映）は Step 6。

## 4-1. Review テンプレ（`reviews/_template.md` 新設）

現行は Review テンプレが**欠落**していた。verdict をヘッダと末尾で2回書く重複もあった。
新版は **verdict の一次はヘッダ1箇所**、Plan 内容の再掲はしない。

```markdown
# Review: <タイトル>

| 項目 | 値 |
|---|---|
| 対象 Plan | <link> |
| 種別 | 計画レビュー / コードレビュー |
| 対象 | <commit or PR link> |
| レビュアー | <Codex / エージェント / 笹木さん> |
| verdict | **APPROVE / NEEDS WORK / BLOCKED**（★verdict の一次。1回だけ） |

## サマリ
<何をレビューしたか。1〜3 行。Plan 内容の再掲はしない>

## 判定スコープ
| 軸 | 判定 |
|---|---|
| 最終判定 | APPROVE / NEEDS WORK / BLOCKED |
| Plan 判定 | … / N/A |
| 実装判定 | … / N/A |
| 記録整理 | OK / FOLLOW-UP / N/A |

## Findings
### [BLOCKER] <...>
### [NICE-TO-HAVE] <...>
```

- 指摘の**解決状態**（状態機械）は、GitHub でレビューしたなら PR review が一次。
  Claude 完結レビューではこのファイルが記録（解決追跡は持たない、という限界を許容）。

## 4-2. README ダッシュボード = R1（生成）

**決定: README は GitHub + Plan から自動生成する生成物にする。手編集しない。**
理由: フェーズ状態・PR 番号（状態機械）の手書き複製が drift の実体だった。生成なら drift ゼロ。

### 生成の設計

- **データ源**:
  - Plan ファイル群 `outputs/plans/*.md`（Plan の存在・末尾チェックリスト・Review リンク）
  - GitHub `gh pr list --json number,state,headRefName,title`（PR 状態・番号）
- **Plan ↔ PR の結合キー**: **slug**。Plan ファイル名の slug ＝ ブランチ `feature/<slug>` の末尾で突合。
  （補助: Plan ヘッダ「PR」欄に一度書いたリンクがあればそれを優先）
- **生成する列**: Plan（リンク）/ フェーズ（下記の導出）/ PR（リンク）/ Review（リンク）
- **フェーズの導出**（状態機械を GitHub から導く。手書きしない）:

  | 条件 | 表示フェーズ |
  |---|---|
  | slug に対応する PR が無い | 計画中 / 実装中（Plan チェックリストの到達点で分岐） |
  | PR が open | レビュー / マージ承認待ち |
  | PR が merged かつ Plan の検証チェック未完 | マージ済み（検証中） |
  | PR が merged かつ 検証チェック完了 | 完了 |

- **生成物であることの明示**: README 冒頭に
  `<!-- 自動生成。手編集しない。生成: pnpm <script> -->` のバナーを置く。
- **生成トリガ**（Step 6 で確定）: 手動スクリプト or CI（PR merge 時に再生成して develop へ）。

### これで解消される現状課題

- 課題 A（urgency の3層 drift）: フェーズ・PR を手書きしなくなるので原理的に消える。
- README と Plan の乖離: README はビルド生成物になり、常に GitHub と Plan から再計算される。

## 未決（Step 5–6 へ）

- 生成スクリプトの実装技術（node / gh / CI 配線）＝ Step 6。
- 既存 12 Plan を新テンプレへ移行するか＝ Step 5。
- `plan-review-workflow.md` の「README は手書き更新」記述を「生成物」に書き換え＝ Step 6。

## 確認事項

1. Review テンプレ（verdict 一次1箇所・Plan 再掲なし）でよいか
2. README 生成の**結合キーを slug（`feature/<slug>` 突合）**にする設計でよいか
3. フェーズ導出表（PR 無/open/merged×検証）でフェーズ分類は足りるか
