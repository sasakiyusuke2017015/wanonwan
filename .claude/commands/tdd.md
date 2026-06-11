---
description: テスト駆動開発のワークフローを徹底する。インターフェース定義 → テスト先行 → 最小実装 → リファクタの順で進め、80%+ のカバレッジを担保する。
---

# TDD Command

このコマンドは **tdd-guide** Agent を起動して、テスト駆動開発を徹底させる。

## このコマンドがやること

1. **インターフェース定義** — 型 / interface を先に定義
2. **テスト先行** — まず失敗するテストを書く (RED)
3. **最小実装** — テストが通る最低限のコードを書く (GREEN)
4. **リファクタ** — テストを通したまま改善する (REFACTOR)
5. **カバレッジ確認** — 80%+ を担保する

## 使うタイミング

`/tdd` を使う場面:
- 新機能の実装
- 新規関数 / コンポーネントの追加
- バグ修正 (バグを再現するテストを先に書く)
- 既存コードのリファクタ
- クリティカルなビジネスロジックの構築

## 動作の流れ

tdd-guide Agent は以下を行う:

1. 入出力の **インターフェースを定義**
2. **失敗するテストを書く** (コードがまだ存在しないため)
3. テストを実行し、**正しい理由で失敗していること** を確認
4. テストを通すための **最小実装** を書く
5. テストを実行し、通ることを確認
6. テストを green に保ったまま **リファクタ**
7. カバレッジを確認し、80% 未満ならテストを追加

## TDD サイクル

```
RED → GREEN → REFACTOR → REPEAT

RED:      失敗するテストを書く
GREEN:    通す最小コードを書く
REFACTOR: コードを改善、テストは通したまま
REPEAT:   次の機能 / シナリオへ
```

## 使用例

```
User: /tdd マーケットの流動性スコアを計算する関数が必要

Agent (tdd-guide):
# TDD セッション: Market Liquidity Score Calculator

## Step 1: インターフェース定義 (SCAFFOLD)

```typescript
// lib/liquidity.ts
export interface MarketData {
  totalVolume: number
  bidAskSpread: number
  activeTraders: number
  lastTradeTime: Date
}

export function calculateLiquidityScore(market: MarketData): number {
  // TODO: 実装
  throw new Error('Not implemented')
}
```

## Step 2: 失敗するテストを書く (RED)

```typescript
// lib/liquidity.test.ts
import { calculateLiquidityScore } from './liquidity'

describe('calculateLiquidityScore', () => {
  it('should return high score for liquid market', () => {
    const market = {
      totalVolume: 100000,
      bidAskSpread: 0.01,
      activeTraders: 500,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('should return low score for illiquid market', () => {
    const market = {
      totalVolume: 100,
      bidAskSpread: 0.5,
      activeTraders: 2,
      lastTradeTime: new Date(Date.now() - 86400000) // 1 日前
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeLessThan(30)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('should handle edge case: zero volume', () => {
    const market = {
      totalVolume: 0,
      bidAskSpread: 0,
      activeTraders: 0,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBe(0)
  })
})
```

## Step 3: テスト実行 — 失敗を確認

```bash
npm test lib/liquidity.test.ts

FAIL lib/liquidity.test.ts
  ✕ should return high score for liquid market (2 ms)
    Error: Not implemented

1 test failed, 0 passed
```

✅ 想定どおりテストが失敗。実装に進む準備 OK。

## Step 4: 最小実装 (GREEN)

```typescript
// lib/liquidity.ts
export function calculateLiquidityScore(market: MarketData): number {
  // zero volume のエッジケース
  if (market.totalVolume === 0) {
    return 0
  }

  // 各要素スコアを計算 (0-100 スケール)
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // 直近活動のボーナス
  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(100 - (hoursSinceLastTrade * 10), 0)

  // 加重平均
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.2 +
    recencyScore * 0.1
  )

  return Math.min(Math.max(score, 0), 100) // 0-100 にクランプ
}
```

## Step 5: テスト実行 — 成功を確認

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ 全テストパス!

## Step 6: リファクタ (IMPROVE)

```typescript
// lib/liquidity.ts — 定数化と可読性改善
const WEIGHTS = {
  VOLUME: 0.4,
  SPREAD: 0.3,
  TRADERS: 0.2,
  RECENCY: 0.1,
} as const

const SCALE_FACTORS = {
  VOLUME: 1000,
  SPREAD: 1000,
  TRADERS: 10,
  RECENCY_PENALTY: 10,
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateLiquidityScore(market: MarketData): number {
  if (market.totalVolume === 0) return 0

  const volumeScore = Math.min(market.totalVolume / SCALE_FACTORS.VOLUME, 100)
  const spreadScore = clamp(100 - (market.bidAskSpread * SCALE_FACTORS.SPREAD), 0, 100)
  const traderScore = Math.min(market.activeTraders / SCALE_FACTORS.TRADERS, 100)

  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = clamp(100 - (hoursSinceLastTrade * SCALE_FACTORS.RECENCY_PENALTY), 0, 100)

  const weightedScore =
    volumeScore * WEIGHTS.VOLUME +
    spreadScore * WEIGHTS.SPREAD +
    traderScore * WEIGHTS.TRADERS +
    recencyScore * WEIGHTS.RECENCY

  return clamp(weightedScore, 0, 100)
}
```

## Step 7: テストがまだ通ることを確認

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ リファクタ完了、テストも通っている!

## Step 8: カバレッジを確認

```bash
npm test -- --coverage lib/liquidity.test.ts

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |   100    |   100   |   100

Coverage: 100% ✅ (Target: 80%)
```

✅ TDD セッション完了!
```

## TDD ベストプラクティス

**DO:**
- ✅ 実装より **先に** テストを書く
- ✅ 実装前にテストが **失敗** することを確認する
- ✅ テストを通す最小限のコードだけを書く
- ✅ テストが green になってからリファクタする
- ✅ エッジケースとエラーシナリオを追加する
- ✅ 80%+ カバレッジを狙う (クリティカルコードは 100%)

**DON'T:**
- ❌ テストより先に実装を書く
- ❌ 変更ごとのテスト実行を省略する
- ❌ 一度に大量のコードを書く
- ❌ 失敗するテストを無視する
- ❌ 実装詳細をテストする (振る舞いをテストする)
- ❌ 何でもモックする (Integration テストを優先)

## 含めるべきテスト種別

**Unit Test** (関数レベル):
- ハッピーパス
- エッジケース (empty, null, 最大値)
- エラー条件
- 境界値

**Integration Test** (コンポーネントレベル):
- API エンドポイント
- DB 操作
- 外部サービス呼び出し
- フック付き React コンポーネント

**E2E Test** (`/e2e` コマンドを使う):
- クリティカルなユーザーフロー
- 複数ステップのプロセス
- フルスタック統合

## カバレッジ要件

- 全コードで **最低 80%**
- 以下は **100% 必須**:
  - 金融計算
  - 認証ロジック
  - セキュリティクリティカルなコード
  - コアビジネスロジック

## 重要事項

**MANDATORY**: テストは実装の **前に** 書くこと。TDD サイクル:

1. **RED** — 失敗するテストを書く
2. **GREEN** — 通す実装をする
3. **REFACTOR** — コードを改善する

RED フェーズを **絶対にスキップしない**。テストより先にコードを書かない。

## 他コマンドとの連携

- 先に `/plan` で何を作るか整理する
- `/tdd` でテスト付きで実装する
- ビルドエラーが出たら `/build-fix`
- 実装レビューに `/code-review`
- カバレッジ確認に `/test-coverage`

## 関連 Agent

このコマンドが起動する Agent:
`.claude/agents/tdd-guide.md`

関連 Skill:
`.claude/skills/tdd-workflow/`
