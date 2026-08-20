---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-first development (RED-GREEN-REFACTOR) with Vitest (unit / API route) and pgTAP (RLS / SQL).
---

# Test-Driven Development Workflow

テスト先行（RED → GREEN → REFACTOR）を徹底するワークフロー。[/tdd](../../commands/tdd.md) から参照される。

## いつ使うか

- 新機能の実装
- バグ修正（まず再現テストを書いて RED を確認する）
- リファクタリング（挙動を固定してから変更する）

## テストの種類（このリポジトリに実在するもの）

| 種類 | ツール | 実行 | 置き場所 |
|---|---|---|---|
| Unit | Vitest | `pnpm turbo run test`（単体 package は `pnpm --filter @wanonwan/web test`） | 実装ファイルの隣（例: [apps/web/lib/datetime.test.ts](../../../apps/web/lib/datetime.test.ts)） |
| API route | Vitest | 同上 | `route.ts` の隣（例: [change-password/route.test.ts](../../../apps/web/app/api/v1/auth/change-password/route.test.ts)） |
| RLS・SQL | pgTAP | `pnpm test:db`（DB スタック起動が必要） | `packages/db/tests/*.test.sql` |

E2E（Playwright）は採用方針にあるが**現時点では未整備**（playwright.config なし。導入は別 Plan）。

## ワークフロー

1. **ユーザーストーリーを書く**

   ```text
   管理者として、アンケートを部署に公開したい。
   メンバーが面談期間中に回答できるようにするため。
   ```

2. **テストを先に書く**（期待する挙動を固定する）
3. **失敗を確認する（RED）** — `pnpm --filter @wanonwan/web test`
4. **最小限の実装を書く**
5. **成功を確認する（GREEN）**
6. **リファクタする**（テストは触らない）
7. **RLS・スキーマを触ったら pgTAP テストを同じ PR に含める**（`pnpm test:db` で確認）

## テストパターン（実例ベース）

### Unit テスト — 純関数は入出力表で

[apps/web/lib/datetime.test.ts](../../../apps/web/lib/datetime.test.ts) の実例:

```typescript
import { describe, it, expect } from "vitest";
import { jstInputToUtcIso } from "./datetime";

describe("jstInputToUtcIso", () => {
  it("JST 壁時計を UTC ISO に変換する（9 時間引く）", () => {
    expect(jstInputToUtcIso("2026-06-18T09:00")).toBe("2026-06-18T00:00:00.000Z");
  });
  it("空・無効は null", () => {
    expect(jstInputToUtcIso("not-a-date")).toBeNull();
  });
});
```

### API route テスト — 境界を vi.mock で断ち、ゲート順序を固定する

[change-password/route.test.ts](../../../apps/web/app/api/v1/auth/change-password/route.test.ts) の実例（抜粋）:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// 到達しない外部依存はスタブ化して import 時副作用を断つ
vi.mock("@/lib/auth/rate-limit", async (imp) => {
  const actual = await imp<typeof import("@/lib/auth/rate-limit")>();
  return { ...actual, checkRateLimit: vi.fn() };
});
vi.mock("@/lib/auth/current-user", async (imp) => {
  const actual = await imp<typeof import("@/lib/auth/current-user")>();
  return { ...actual, getCurrentClaims: vi.fn() };
});

import { POST } from "./route";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getCurrentClaims } from "@/lib/auth/current-user";

beforeEach(() => {
  vi.mocked(checkRateLimit).mockReset();
  vi.mocked(getCurrentClaims).mockReset();
});

describe("POST /api/v1/auth/change-password ゲート順序", () => {
  it("rate-limit 超過は最外で 429。認証も検証も行わない", async () => {
    vi.mocked(checkRateLimit).mockReturnValue(
      NextResponse.json({ error: "too many" }, { status: 429 }),
    );
    const res = await POST(post({ currentPassword: "x", newPassword: "y".repeat(12) }));
    expect(res.status).toBe(429);
    expect(getCurrentClaims).not.toHaveBeenCalled();
  });
});
```

この実例が示す規約:

- **mock するのは自分の境界**（`@/lib/auth/*` / `@/lib/db/*`）。外部サービスの SDK を
  直接 mock しない（GoTrue は `@/lib/auth/gotrue` の薄ラッパ越しに差し替える）
- **ゲートの順序をテストで固定する**（429 → 401 → 400。後続ゲートが呼ばれないことまで assert）
- `vi.mocked(fn).mockReset()` を `beforeEach` で行い、テスト間の状態共有を断つ

### pgTAP — RLS はロールごとの可視性を SQL で検証

`packages/db/tests/rls_answers.test.sql` 等。RLS 6 分類の各テーブルについて
「このロールで何行見えるか」を assert する。実行は `pnpm test:db`。

## カバレッジ

数値ゲートは**存在しない**（CI は `turbo run test` + pgTAP の成否のみ）。
手元で確認したいときは `pnpm --filter <pkg> exec vitest run --coverage`。
カバレッジの数字より「ゲート順序・境界条件・RLS の可視性」が担保されていることを優先する。

## よくある間違い

- ❌ 実装詳細（内部関数の呼び出し回数など）を assert する
  → ✅ ユーザー可視の挙動（status code / レスポンス / 画面表示）を assert する
- ❌ テストを実装に合わせて直す
  → ✅ 実装をテストに合わせて直す（テスト自体が間違っているケースを除く）
- ❌ RLS を変えたのに pgTAP を触らない
  → ✅ ポリシー変更と同じ PR に `packages/db/tests` の更新を含める
