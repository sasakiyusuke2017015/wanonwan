---
paths:
  - "apps/**/*.ts"
  - "apps/**/*.tsx"
  - "packages/**/*.ts"
  - "packages/**/*.tsx"
---

# 共通パターン

## API レスポンス形式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}
```

## カスタムフック

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

## Repository パターン

```typescript
interface Repository<T> {
  findAll(filters?: Filters): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
}
```

データアクセス層 (`apps/web/src/lib/db/*` / `/api/v1/*`) の **呼び出し元別の使い分け** と **セキュリティ前提** は [`data-access.md`](./data-access.md) に集約。本ファイルは抽象的なパターン例のみ。

## スケルトンプロジェクトの活用

新機能を実装するとき:
1. 実績のあるスケルトンプロジェクトを探す
2. 並列 Agent で選択肢を評価:
   - セキュリティ評価
   - 拡張性分析
   - 関連性スコアリング
   - 実装計画
3. ベストマッチをクローンしてベースに使う
4. 実績のある構造の中で反復する
