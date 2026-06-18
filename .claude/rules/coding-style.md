---
paths:
  - "apps/**/*.ts"
  - "apps/**/*.tsx"
  - "packages/**/*.ts"
  - "packages/**/*.tsx"
  - "scripts/**/*.ts"
  - "scripts/**/*.tsx"
  - "scripts/**/*.mjs"
---

# コーディングスタイル

## イミュータビリティ (CRITICAL)

オブジェクトは **常に新しく作る**、絶対に **mutate しない**:

```javascript
// WRONG: mutation
function updateUser(user, name) {
  user.name = name  // ← 破壊的変更!
  return user
}

// CORRECT: イミュータブル
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## ファイル構成

**小さいファイルを多く** > 大きいファイルを少なく:
- 高凝集・低結合
- 通常 200〜400 行、最大 800 行
- 大きいコンポーネントからユーティリティを切り出す
- 種類別ではなく、機能・ドメイン単位で整理

## エラーハンドリング

エラーは **常に網羅的に** 処理する:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('ユーザー向けの具体的なメッセージ')
}
```

## 入力バリデーション

ユーザー入力は **必ず** バリデーションする:

```typescript
import * as v from 'valibot'

const schema = v.object({
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(150))
})

const validated = v.parse(schema, input)
```

## コード品質チェックリスト

作業完了とする前に:
- [ ] 識別子が読みやすく適切に命名されている
- [ ] 関数が小さい (< 50 行)
- [ ] ファイルが焦点を絞っている (< 800 行)
- [ ] ネストが深すぎない (> 4 階層 NG)
- [ ] 適切なエラーハンドリング
- [ ] `console.log` が残っていない
- [ ] ハードコード値がない
- [ ] mutation していない (イミュータブルパターンを使用)
