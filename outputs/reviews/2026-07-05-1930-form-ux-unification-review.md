# コードレビュー: 生 UI フォームのカタログ化 分割 2/2（テーマ4 PR-C2）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 19:30 JST |
| 対象 | 未コミット作業ツリー（`feature/answer-form-catalog`） |
| 種別 | コードレビュー（実装レビュー） |
| 対応 Plan | [フォーム UX 統一（テーマ4）](../plans/2026-07-05-1745-form-ux-unification.md) §PR-C2 |
| レビュアー | Claude Code エージェント代行（`code-reviewer`） |
| 変更ファイル | `apps/web/components/survey/AnswerForm.tsx` / `apps/web/components/admin/QuestionsEditor.tsx`（+ Plan 追記） |

## 最終判定

| 軸 | 判定 | 補足 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER なし。回答挙動・select 置換の等価性ともに保たれている |
| Plan 判定 | N/A | 計画レビューは 2026-07-05-1810 版で実施済み |
| 実装判定 | **APPROVE** | 下記 NICE-TO-HAVE 3 件は差し戻し理由にしない |
| 記録整理 | OK | Plan の判断ログ・ステータスへの反映済み |

見た目（タイルの選択塗り・コントロールサイズ・Select 幅・「追加」ボタン外観）は
dev 起動が要るため笹木さん手動確認前提。

## 総評

重点観点 4 点を精査した結果、ランタイムクラッシュ・回答データの取りこぼしにつながる
BLOCKER は検出せず。catalog `Radio`/`Checkbox` は `label` 未指定時に生 `<input>`
（`type` 固定）のみを描画し、`name`/`value`/`checked`/`onChange` は `{...props}` で
素通しされるため、選択タイル（外側 `<label>` + テーマ塗り）の意味論・体験は不変。
`Select`/`Button` 置換も従来ロジックと整合している。以下は視覚・軽微な指摘のみ。

---

## Findings

### [NICE-TO-HAVE] QuestionsEditor: catalog Select が `flex-1` を無視して 180px 固定になる

`apps/web/components/admin/QuestionsEditor.tsx:174-185`

`<div className="flex-1">` で囲っているが、catalog `Select` は `width` prop 未指定時に
内部ボタンへ `w-[180px]`（デフォルト）を当てる（`Select.tsx:115` → `:354` の `cn(..., width, ...)`）。
このため wrapper の `flex-1` は効かず、Select は 180px 固定幅になる。旧 `<select className="flex-1">`
は利用可能幅いっぱいに伸びていたため、**マスタ設問ラベル（`body（種別）`）が 180px に切り詰まる視覚的後退**。
ドロップダウン幅もボタン幅（180px）に追従する（`:196` `width: rect.width`）。

修正案（幅を親に合わせる）:

```tsx
<Select
  options={...}
  value={pickId || undefined}
  onChange={(v) => setPickId(v == null ? "" : String(v))}
  allowEmpty
  placeholder="（設問を選択）"
  borderRadius={shapes.inputRadius}
  width="w-full"        // ← 追加。flex-1 wrapper いっぱいに伸ばす
/>
```

（`flex-1` wrapper は残してよい。`width="w-full"` で子が親を満たす。）

### [NICE-TO-HAVE] QuestionsEditor: 「追加」ボタンが CTA 感を失っている

`apps/web/components/admin/QuestionsEditor.tsx:187-193`

旧実装は `bg-gray-900 text-white` の塗りボタン（主アクション見え）だったが、
`variant` 未指定のため catalog `Button` の `default`（グレー系）になる。機能は不変だが、
主アクションとしての視認性は下がる。下の「新規作成して追加」の送信ボタン
（`QuestionForm` の `FormActions`）と塗り・強調が揃うかを手動確認し、必要なら
`variant="primary"` を検討。差し戻し不要（意匠は笹木さん確認事項）。

```tsx
<Button
  variant="primary"        // ← 主アクションとして塗る場合
  disabled={!pickId || link.isPending}
  onClick={() => pickId && link.mutate(Number(pickId))}
  borderRadius={shapes.buttonRadius}
>
  追加
</Button>
```

### [NICE-TO-HAVE] QuestionsEditor: `onClick` の `pickId &&` ガードが冗長

`apps/web/components/admin/QuestionsEditor.tsx:188-189`

`disabled={!pickId || link.isPending}` で pickId 空時はクリック自体が無効化される
（catalog `Button` は disabled 時 onClick を undefined 化。`Button.tsx:135`）。よって
`onClick={() => pickId && link.mutate(...)}` の `pickId &&` は実務上到達しないガード。
害はないので任意。気になれば `onClick={() => link.mutate(Number(pickId))}` に簡素化可。

---

## 参考（スコープ外・FYI）

- **catalog `Select` の自動フォールバック**（`Select.tsx:160-169`）: 単一選択で現在値が
  `options` に無いと先頭 option を `onChange` する挙動。QuestionsEditor では `link` 成功時に
  `setPickId("")`（`:83`）で value を undefined に戻してから `masterOptions` が再計算される
  ため、この effect は early-return し暴発しない。AnswerForm の `select` ケースも同 catalog
  依存だが本 PR の変更対象外。現行スタック所与のため指摘としては挙げない。
- 据え置いた並べ替え ↑↓ / 行アクション（`QuestionsEditor.tsx:139-157`）の catalog 化は
  Plan で残課題化済み。当 PR のスコープ外として指摘対象にしない。

---

## 重点観点への回答

1. **回答挙動の不変性**: OK。radio は `name={q.id}` グループ + controlled `checked` + `value` +
   `onChange={() => setVal(q.id, c)}` が `{...props}` で生 input に素通し（`Radio.tsx:82`）。
   checkbox は `value` + `checked` + `onChange={(e) => toggleCheckbox(q.id, c, e.target.checked)}`
   が同様に素通し（`Checkbox.tsx:87`）。`e.target.checked` も取得可。単一/複数選択とも従来どおり。
   `values` state は spread で不変更新（`AnswerForm.tsx:50-56`）、`isDirtyPayload(values, baseline)`
   の入力型（`string | string[]`）は不変。dirty 判定への影響なし。
2. **catalog Select 置換の等価性**: OK。`pickId`（string）controlled、`value={pickId || undefined}`、
   `onChange` で `null/undefined → ""`、`allowEmpty`+placeholder、`link.mutate(Number(pickId))`
   の整合は保たれる。option の `value: m.id`（string）で T=string 推論も一致。
3. **アクセシビリティ / フォーム意味論**: OK。radio group の `name` 維持、checkbox の `value` 維持、
   外側 `<label>` によるクリック領域と `FormField` のラベル/必須/エラー表示は不変。
4. **型・lint・未使用 import・残 className**: OK。追加 import（`Radio`/`Checkbox`/`Select`/`Button`/`useTheme`）
   はすべて使用。旧 `className="h-4 w-4"` / 生 `<select>`・`<button>` の className は除去済み、残骸なし。

## 検証

- 実施: 差分精査、catalog `Radio`/`Checkbox`/`Select`/`Button` の props 経路確認、Plan 整合確認。
- 依頼元報告: `pnpm turbo run typecheck lint build test` green（web test 71 維持）。
- ギャップ（手動確認）: タイルの選択塗り・コントロールサイズ・**Select の幅（180px 固定 vs full）**・
  「追加」ボタンの外観。dev 起動での目視で確認のこと。

## verdict

APPROVE
