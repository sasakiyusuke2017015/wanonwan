# コードレビュー: 回答者フローを @ui-catalog 定石へ

- slug: `respondent-flow-uicatalog`
- 対象ブランチ: `feature/respondent-flow-uicatalog`（develop 7f75a50 起点・未コミット作業ツリー）
- 対応 Plan: [2026-06-11-1730-pleasanter-exit-1on1-rebuild.md](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md)
- レビュー実施: 2026-06-12 01:34
- 変更ファイル: `apps/web/components/survey/AnswerForm.tsx` / `apps/web/app/surveys/page.tsx`（+ `.claude/settings.json` の permission 追記）

## 最終判定

| 区分 | 判定 |
|---|---|
| Plan 判定 | 対象外（本レビューはコードレビュー） |
| 実装判定 | ✅ APPROVE |
| 記録整理 | NICE-TO-HAVE を後続課題として末尾に列挙 |

BLOCKER なし。typecheck green、@ui-catalog 各コンポーネントの実 API を確認し、props 適合・挙動とも妥当。指摘はすべて NICE-TO-HAVE。

---

## 確認した観点（依頼項目への回答）

### 1. Select の `value={strVal || undefined}`（#17 B-1 罠への対応）— OK

`Select.tsx` のフォールバックロジック（157-166 行）を確認:

```ts
useEffect(() => {
  if (isMultiple) return;
  const singleProps = props as SingleSelectProps<T>;
  if (singleProps.value === undefined) return;          // ← undefined は即 return
  const valueExists = options.some((opt) => opt.value === singleProps.value);
  if (!valueExists && options.length > 0) {
    singleProps.onChange(options[0].value);              // 先頭フォールバック
  }
}, ...);
```

未選択時に `value={undefined}` を渡せば 161 行で早期 return し、先頭オプションへの自動フォールバックが**発火しない**。`value=""` を渡していた場合は `""` が options に無いため先頭に化けるが、`strVal || undefined` で空文字を `undefined` に潰しているため正しく未選択を保持する。**#17 B-1 への対応は正しく効いている。**

choices に空文字 `""` が含まれるケース: 後述 N-1 参照（実害なし）。

### 2. 必須チェック `isAnswered` — 全形式で妥当

```ts
const isAnswered = (v) => Array.isArray(v) ? v.length > 0 : Boolean(v && v.trim());
```

- radio/select/text/textarea/tel/postal: 文字列。`trim()` 後 truthy で判定 → 妥当。
- checkbox: 配列。`length > 0` → 空配列（未選択）は false で弾ける → **checkbox 必須も正しく弾ける**。
- 値が `undefined`（一度も触っていない設問）: 文字列分岐の `Boolean(v && ...)` で false → 弾ける。

HTML `required` 撤去の代替として機能している。

### 3. Radio の name グルーピング・配線 — OK

`Radio` は `InputHTMLAttributes` を継承し `name` / `checked` を `...props` で素の `<input type="radio">` へ透過する（Radio.tsx 82 行）。`name={q.id}` で設問単位にグルーピングされ、`checked={val === c}` / `onChange={() => setVal(q.id, c)}`（イベント不使用）も妥当。

### 4. Card クリック遷移・Badge variant — OK

- `Card` は `onClick` 指定時に `role="button"` / `tabIndex={0}` / Enter・Space ハンドラを内蔵（Card.tsx 39-42 行）。`onClick={() => router.push(...)}` でキーボード操作も成立。アクセシビリティ良好。
- `Badge` の `variant="success" / "warning"` は `SEMANTIC_TO_COLOR`（green / yellow）にマップされる正規の値。`value` prop 利用も適合。

### 5. API ペイロード不変性・初期値復元 — OK

- 送信は `apiSend(..., { answers: values })` で変更前と完全同一。`setVal` / `toggleCheckbox` は spread でイミュータブルに `values` を更新しており、payload 構造は不変。
- 初期値は `useState<Values>(initial ?? {})` のまま。回答済み復元ロジックは未変更。

### 6. hydration 前提 — 妥当

- `AnswerForm` が乗る `/surveys/[publishId]` は "use client" + useQuery で、フォーム本体はクライアント描画のみ（SSR 時は読み込み中表示）。`useTheme()` 直接利用・mounted ゲート無しは妥当。`FormActions` も同様の前提でコメント済み。
- `/surveys` も "use client" + useQuery で、データ依存部分は描画されないため Card/Badge/Text の SSR mismatch は発生しない。

typecheck（`pnpm --filter @wanonwan/web typecheck`）green を確認。

---

## NICE-TO-HAVE（後続課題・差し戻し理由にしない）

### N-1: select 設問の choices に空文字が混入した場合の取りこぼし

`q.choices` に空文字 `""` が含まれると、`{value: "", label: ""}` という選択肢が生成される。ユーザーがこれを選んでも `strVal=""` → `value={undefined}` に潰れ、再描画で placeholder 表示に戻り、`isAnswered("")` も false 扱いになる（必須なら正規選択しても弾かれる）。

実害は無い: 入力経路の `QuestionsEditor`（`split("\n").map(trim).filter(Boolean)`）が空文字 choice を除去するため、現状空文字 choice は生成され得ない。ただし `@wanonwan/domain` の `choices: v.array(v.string())` はスキーマ層で非空を強制していないため、将来別経路で混入する可能性は残る。

対応案（後続・任意）: domain スキーマで `v.array(v.pipe(v.string(), v.minLength(1)))` 相当に締めるか、AnswerForm 側で `options` 生成時に空文字を除外する。

### N-2: select/textarea/text の onChange での空文字正規化の非対称

select は `onChange={(v) => setVal(q.id, v == null ? "" : String(v))}` で未選択を `""` に正規化して保持する。一方 placeholder 選択（undefined）→ `""` 格納 → 次の描画で `value={undefined}` に戻る往復が発生する。動作は正しいが、未選択を `""` ではなく `undefined`（キー自体を持たない）で保持すれば payload もより素直になる。現状の API（`{answers: values}`）は空文字を許容しているため**変更不要**。整理時の検討メモとして記録。

### N-3: 必須エラーが「どの設問か」を示さない

`setError("未回答の必須項目があります")` は最初の未回答設問を `find` で特定しているが、メッセージは件数・対象を示さない。設問数が多いと利用者がどれを埋めるか分かりにくい。フィールド単位 valibot 導入（後続予定）の際に、対象 FormField への inline error 表示へ寄せるのが自然。Plan の後続スコープに含まれるため本 PR では未達で問題なし。

---

## verdict

APPROVE
