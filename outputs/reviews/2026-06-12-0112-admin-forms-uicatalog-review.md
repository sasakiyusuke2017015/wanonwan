# コードレビュー: 管理フォーム3つを @ui-catalog へ定石化 (admin-forms-uicatalog)

- 対象ブランチ: `feature/admin-forms-uicatalog`
- 対応 Plan: [outputs/plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md)
- レビュー日時: 2026-06-12 01:12
- レビュー対象（未 commit の working tree 差分）:
  - 新規 `apps/web/components/admin/FormActions.tsx`
  - `apps/web/components/admin/UserForm.tsx`
  - `apps/web/components/admin/SurveyForm.tsx`
  - `apps/web/components/admin/InterviewForm.tsx`
  - `packages/ui/package.json`（`./organisms/ContentBlock` deep export 追加）
  - `.claude/settings.json`（permission 追記のみ・レビュー対象外）

レビュー方針: 指摘は `[BLOCKER]` / `[NICE-TO-HAVE]` にラベル分け。現行スタックは所与の前提。
当 PR で変更していない既存コードの bad practice は指摘しない。

---

## 最終判定（対応後 / 2026-06-12 再レビュー）

- **Plan 判定**: 該当なし（本レビューはコードレビュー）
- **実装判定**: ✅ APPROVE
- **記録整理**: OK。初回 BLOCKER だった B-1 は対応済み（下記「B-1 対応後判定」参照）。
  残る NICE-TO-HAVE（N-1 数値 min/max、N-3 テスト欠如）は後続タスクとして許容。

`@ui-catalog/Select` のフォールバック副作用に対し、未選択の Select へ渡す value を
`form.X || undefined` に変更したことで、空文字 `""` が `undefined` に畳まれ Select の
`value === undefined` 早期 return に乗る。先頭オプションへの強制書き換えが止まり、
B-1 の回帰（未選択が先頭値に化けて保存される）は解消した。新規の別 BLOCKER は無し。

---

## B-1 対応後判定（2026-06-12 再レビュー）

対象差分（working tree、未 commit）:
- `apps/web/components/admin/UserForm.tsx`（positionId / divisionId / departmentId / sectionId の4 Select）
- `apps/web/components/admin/InterviewForm.tsx`（interviewMethod / healthStatus の2 Select）

対応内容: 未選択の Select に渡す `value` を `value={form.X || undefined}`
（InterviewForm は `value={f.X || undefined}`）へ変更。`onChange` は
`(v) => ...(v == null ? "" : String(v))` を維持。

検証（`packages/ui/core/molecules/Select/Select.tsx:157-166` の effect と照合）:

1. **未選択 → undefined → 早期 return**: ✅
   空文字 `""` は falsy なので `form.X || undefined` が `undefined` を返す。
   Select.tsx:161 `if (singleProps.value === undefined) return;` でフォールバック
   effect（163-165 の `onChange(options[0].value)`）に入らず、先頭化が起きない。
   `options.length > 0`（org / method / health ロード済み）でも発火しない。

2. **onChange との往復齟齬**: ✅ なし。
   未選択クリック時 Select は `onChange(undefined)`（Select.tsx:393, 399）を呼び、
   呼び出し側で `v == null ? ""` により state は `""` に戻る。選択時は
   `onChange(optionValue)`（Select.tsx:273）で値が入り、state には `String(v)` が入る。
   state 保持は `""`、Select への受け渡しは `|| undefined` で一貫し、
   選択 → 保存 → 再表示で破綻しない。

3. **値ありケース（既存編集で org 等あり）**: ✅ 壊れていない。
   truthy な ID 値は `|| undefined` を素通りしてそのまま渡る。`toOptions` は
   `value: it.id`(string)、INTERVIEW_METHODS / HEALTH_STATUSES は `String(m.value)` で
   option 側を string 化しており、`options.some((opt) => opt.value === value)` がマッチ。
   フォールバックは走らず Select.tsx:170 で `selectedOption` が解決され正しく表示される。

その他:
- SurveyForm の status Select は `allowEmpty` 無し・初期値が options 内（`"draft"`）の
  ため対象外。変更なしで正しい。
- 型整合: state（`String(initial.X)`）・onChange（`String(v)`）・option（`String(...)`）が
  すべて string で揃っており、`opt.value === value` の厳密比較が成立する。

結論: **B-1 は解消**。新規の別 BLOCKER は検出されず。

---

## 初回判定（履歴 / 2026-06-12 01:12 コードレビュー — BLOCKED）

> 以下は B-1 修正前の初回コードレビュー時点の判定。履歴として残す。
> 現在の最終判定は上部「最終判定（対応後）」を参照。

- **Plan 判定**: 該当なし（本レビューはコードレビュー）
- **実装判定**: ❌ BLOCKED
- **記録整理**: 下記 `[BLOCKER] B-1` の修正後に再レビューで APPROVE 可能。

理由は `@ui-catalog/Select` の「選択値がオプションに無ければ先頭へフォールバック」する
副作用により、`allowEmpty` を付けた Select で「（未選択）」が成立せず、空のまま保存したい
組織所属・面談方式・健康状態が**勝手に先頭値に書き換わって保存される**回帰があるため。
これは設問 #2（既存編集時の初期値）に直接該当し、データ正しさに影響する。

---

## BLOCKER

### [BLOCKER] B-1: allowEmpty な Select が「（未選択）」を保持できず、空値が先頭オプションに化ける

ファイル:
- `apps/web/components/admin/UserForm.tsx`（役職 / 所属本部 / 所属部 / 所属課）
- `apps/web/components/admin/InterviewForm.tsx`（面談方式 / 健康状態）

問題:
`@ui-catalog/core/molecules` の `Select` には、選択中の値が `options` に存在しないとき
先頭オプションへ自動フォールバックする副作用がある。

```tsx
// packages/ui/core/molecules/Select/Select.tsx:157-166
useEffect(() => {
  if (isMultiple) return;
  const singleProps = props as SingleSelectProps<T>;
  if (singleProps.value === undefined) return;        // ← undefined のときだけスキップ
  const valueExists = options.some((opt) => opt.value === singleProps.value);
  if (!valueExists && options.length > 0) {
    singleProps.onChange(options[0].value);           // ← 先頭へ強制
  }
}, [isMultiple, options, props]);
```

本 PR のフォームは未選択を **空文字 `""`** で表現している（`form.positionId = ""` 等）。
`"" !== undefined` なので上記の早期 return に当たらず、`""` は `options` に存在しないため
`options.length > 0`（org / method / health がロード済み）になった瞬間に
`onChange(options[0].value)` が発火する。結果:

- **新規ユーザー作成**: org ロード後、役職・所属本部・所属部・所属課の4つが
  すべて先頭の組織項目に自動セットされる。送信ペイロードは
  `if (form[key]) payload[key] = Number(form[key])` の分岐が truthy になり、
  ユーザーが何も選んでいないのに先頭 ID が送られる。
- **既存ユーザー編集（設問 #2 該当）**: `positionId` 等が空（`null` → `""`）の
  ユーザーを開くと、同じく先頭値に書き換わり、保存すると**意図せず所属が付与される**。
  逆に値が入っている既存ユーザーは `value` が options に存在するためフォールバックせず
  正しく選択表示される（＝空のケースだけが壊れる）。
- **面談記録**: 面談方式・健康状態が未設定の回答を開くと先頭値に化け、
  `f.interviewMethod ? Number(...) : null` が truthy 化して `null` のはずが
  先頭 method/health で保存される。
- **UX**: ユーザーが「（未選択）」を選び直しても `onChange(undefined)` → form が `""` →
  effect が再発火して即座に先頭へ戻る。**「（未選択）」を選択し続けられない。**

この Select は本アプリ初の `@ui-catalog/Select` 採用箇所であり、この挙動は本 PR で
新規に持ち込まれる（既存に前例なし）。typecheck green・HTTP 200・SSR 非クラッシュの
スモークでは表面化しない（描画は壊れず、保存値が変わるだけ）ため見落とされている。

修正方針（いずれか。@ui-catalog 本体は所与なので呼び出し側で吸収するのが軽い）:

(A) 未選択を `""` ではなく `undefined` で表現し、Select の早期 return に乗せる。
form の型と `value` を `string | undefined` にし、表示用に空文字へ畳まない。

```tsx
// 例: UserForm
<Select
  options={toOptions(org?.data.positions)}
  value={form.positionId || undefined}                 // "" を undefined に畳む
  onChange={(v) => set("positionId", v == null ? "" : String(v))}
  allowEmpty
  placeholder="（未選択）"
/>
```

`value={form.positionId || undefined}` とするだけで `""` は `undefined` 扱いになり、
フォールバック effect の `value === undefined` 早期 return に乗るため先頭化が止まる。
`onChange` 側は現状のままで良い（`undefined` → `""` を保持）。InterviewForm の
`interviewMethod` / `healthStatus`、UserForm の org 4項目すべてに適用する。

(B) options 先頭にダミーの空 option（`{ value: "", label: "（未選択）" }`）を入れて
`""` を「存在する値」にする。ただし allowEmpty の空行と二重になりやすく、(A) を推奨。

検証観点（修正後に必ず確認）:
- 既存ユーザー（所属空）を編集 → 保存しても所属が付与されないこと
- 新規ユーザー作成で org 4項目が「（未選択）」のまま送信できること
- 面談記録で方式 / 健康状態を未選択のまま保存 → ペイロードが `null` であること
- 「（未選択）」を明示選択 → 先頭に戻らず維持されること

> 注: SurveyForm の「状態」Select は初期値が `"draft"`（options に存在）で
> `allowEmpty` も付けていないため、このフォールバックは発火しない。**SurveyForm は本件の対象外で問題なし。**

---

## NICE-TO-HAVE

### [NICE-TO-HAVE] N-1: 数値 Input から min/max が落ちている

`SurveyForm.tsx`（定員）と `InterviewForm.tsx`（評価 0〜5）で、置換前の
`<input type="number" min={0} max={5}>` の `min`/`max` が新 `Input` で指定されていない。
`@ui-catalog/Input` は `InputHTMLAttributes` を継承し `...props` を spread するため
`min={0} max={5}` を渡せば従来どおりブラウザ側のクランプが復活する。

```tsx
<Input type="number" min={0} max={5} value={...} onChange={...} borderRadius={shapes.inputRadius} />
```

サーバ valibot 検証は維持されており不正値は弾かれるため BLOCKER ではないが、
入力時点の体験（スピナーの上下限・即時バリデーション）が退行している。

### [NICE-TO-HAVE] N-2: 必須クライアントチェックの妥当性（設問 #4）

HTML `required` 撤去の代替として onSubmit 冒頭で `code/name/email`（UserForm）・`title`
（SurveyForm）を `.trim()` チェックしているのは妥当。サーバ valibot 検証も維持されており
二重防御になっている。フィールド単位のエラー表示は Plan の後続予定であり本 PR の未達は
許容（BLOCKER にしない）。1点だけ、UserForm の email は形式チェックをしていない
（空チェックのみ）が、`<Input type="email">` のネイティブ検証は `required` 撤去で
無効化されている。サーバ valibot が email 形式を検証する前提なら現状で可。後続の
フィールド単位エラー表示で吸収する想定で問題ない。

### [NICE-TO-HAVE] N-3: テストの欠如

3フォームともユニットテストがない。特に B-1 のような「保存ペイロードが意図と一致するか」
は回帰しやすいため、修正後に最低限「未選択のまま保存 → ペイロードに org/method が
含まれない」ことを検証するテストを Plan の残課題に積むことを推奨。

---

## 設問への個別回答

1. **hydration 前提の妥当性**: OK。`app/(admin)/layout.tsx` は `"use client"` で
   `["me"]` クエリの `isLoading` 中はローディング div を返し、フォーム children は
   SSR されない。リポジトリ全体に `HydrationBoundary` / `dehydrate` / `prefetchQuery` は
   存在せず、`["me"]` がサーバ側で seed される経路がないことを確認した。よって
   フォームはクライアント専用で、`useTheme()`（Jotai `useAtomValue`）直接使用でも
   mismatch は起きない。`AdminListTable` のような mounted ゲートは不要という判断は妥当。
   FormActions のコメントの根拠も正しい。
2. **Select の値型・既存初期値**: 値が入っている既存編集は正しく選択表示される
   （`value` が options に存在）。**空値のケースのみ B-1 で破綻**。
3. **Checkbox 配線**: OK。`@ui-catalog/Checkbox` は内部で `props.onChange?.(e)` に
   ネイティブイベントを渡すため `onChange={(e) => ...e.target.checked}` は正しい。
4. **必須チェック**: N-2 のとおり妥当。サーバ valibot 維持も確認。
5. **API ペイロード不変性**: `mutationFn` / `submit` 本体は diff で変更されておらず
   元と同一。ただし B-1 により**入力 state が勝手に変わる**ため、結果として送信値が
   変わる回帰がある（mutationFn のコードは不変だが実害あり）。
6. **ContentBlock deep export**: OK。既存 organisms（Modal / InteractiveTable 等）と
   同じ deep export 形式で `./core/organisms/ContentBlock/index.ts` を指しており、
   barrel 回避方針の継続として正しい。`index.ts` は `ContentBlock` を再 export している。

---

## 検証ステータス

- `pnpm --filter @wanonwan/web typecheck`: green（再現確認済み）
- 実機スモーク（各画面 200 / SSR 非クラッシュ）: 申告どおり。ただし B-1 は保存値の
  問題で 200 スモークでは表面化しない。**B-1 修正後に保存ペイロードの実値検証が必要。**

---

## verdict

APPROVE
