# コードレビュー: スケジュール画面（共有カレンダー）

- 対象ブランチ: `feature/schedule`
- 対応 Plan: [2026-06-11-1730-pleasanter-exit-1on1-rebuild.md](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md)（slug=schedule）
- レビュー日時: 2026-06-12 14:13
- レビュアー: Claude Code（code-reviewer 視点）
- 前提: API/RLS は実機検証済み。カレンダー対話は手動ブラウザ確認前提。配線・データ整合を重点確認。

## 対象ファイル

- `apps/web/app/api/v1/schedules/route.ts`（GET 一覧 / POST 作成）
- `apps/web/app/api/v1/schedules/[id]/route.ts`（PUT / DELETE）
- `apps/web/components/schedule/ScheduleCalendar.tsx`
- `apps/web/app/schedule/page.tsx`（dynamic ssr:false）
- `apps/web/components/layout/navItems.ts`
- `packages/ui/package.json`（deep export 追加）

---

## サマリ

BLOCKER は検出されなかった。指摘依頼の 6 点はいずれも妥当な判断と確認できた。
SQL は postgres.js のタグ付きテンプレートで全パラメータ化済み、RLS は
作成者/admin write + 認証済み read で WITH CHECK と整合、新規/編集の振り分けは
「サーバ list に id が存在するか」で正しく機能する。残るのは NICE-TO-HAVE のみ。

---

## 確認結果（依頼 6 点）

### 1. CalendarEvent ↔ schedule の map（ISO↔Date）— 妥当

`toEvent` は `new Date(ISO文字列)`、`toPayload` は `toISOString()`。`Date` は
絶対時刻（epoch）であり、`timestamptz` も絶対時刻。両者の往復で tz 変換は不要で、
表示・入力はブラウザのローカル（JST）で行われる。判断は正しい。
EventModal 側も `new Date(y, m-1, d)` でローカル日付として構築しており（UTC 解釈
ズレ回避コメントあり）、`toISOString()` で UTC 化 → DB 格納 → 再取得で
ローカル復元、とラウンドトリップが閉じている。

### 2. persistEvent の「既存 id なら更新 / 無ければ新規」判定 — 正しい

- 編集経路: MonthView が `eventModalAtom.editingEvent` に既存イベント（サーバ由来 id）を
  セット → EventModal が `modal.editingEvent?.id ?? generateId()` で **既存 id を保持** →
  `data.data.some(s => String(s.id) === e.id)` が true → PUT。
- 新規経路: editingEvent 無し → `generateId()`（`Date.now()-random`）→ list に無い → POST。
- ドラッグ移動も `{...original}` / `{...state.event}` で id を保持するため PUT になる（確認済み）。

衝突懸念: 新規 id はサーバ id（bigint の数値文字列）と書式が異なり（`1718...-x7a9b2`）、
かつ POST 後すぐ invalidate でサーバ id に置き換わるため、生成 id が DB の既存 id と
衝突する経路は無い。判定ロジックは健全。

### 3. eventsAtom の同期（二重経路）— 実用上問題なし（NICE-TO-HAVE あり）

`useEffect [data, setEvents]` の `data` は useQuery のレスポンス参照で、再フェッチ毎に
新参照になるため同期は確実に走る。EventModal が編集解決に読む `eventsAtom` は
この同期で最新化される。stale の実害は確認できない。
ただし `events`（62 行のローカル map）と `eventsAtom`（useEffect 内の再 map）で
**同一データを 2 回 map** しており配列インスタンスが二重になる。下記 NICE-TO-HAVE 参照。

### 4. RLS / SQL — 漏れ・SQLi なし

- 全クエリが postgres.js タグ付きテンプレート（`tx\`...${v}...\``）でプレースホルダ化。
  文字列連結は無く SQLi 経路なし。`Number(id)` で id を数値化しており型も安全。
- POST は `created_by = app.uid()`、RLS `WITH CHECK (is_admin() OR created_by = app.uid())` と整合。
- PUT/DELETE は `RETURNING` の行数 0 → 404。他人の行は RLS で不可視のため 0 件 = 404 となり、
  member が admin の予定を更新 → 404 という実機結果と一致。
- GET は `schedules_select`（認証済みは全件）で共有 read。`start_at is null` を除外する
  WHERE もカレンダー要件に沿う。

### 5. ssr:false 化 — 妥当

`@ui-catalog` の calendar atoms（`core/hooks/calendar/calendar.ts`）が
`viewModeBaseAtom = atom(getViewModeFromPath())` で **モジュール評価時に
`window.location.pathname` を読む**。SSR/prerender では `window` が無く落ちる。
barrel 経由でなく直接 deep import しても、この atom はモジュールトップレベルで
評価されるため import するだけで実行される。したがって barrel 回避では解決できず、
コンポーネント全体をクライアント専用に隔離する `dynamic(ssr:false)` は妥当な選択。
（根治は ui-catalog 側で評価を遅延化することだが、これは本 PR スコープ外で別 Issue 相当。）

### 6. deep export 追加 — 妥当

`./organisms/EventModal` は既存 organisms export 群と同じ規約。
`./calendar/state` は内部実装パス（`core/hooks/calendar/calendar.ts`）を
意味的な公開名にエイリアスしており命名は適切。evergreen 観点でも互換記述等は無い。

---

## NICE-TO-HAVE

- **[NICE-TO-HAVE] events の二重 map**: `ScheduleCalendar.tsx` 62 行の
  `const events = (data?.data ?? []).map(toEvent)` と useEffect 内の再 map が重複。
  `const events = useMemo(() => (data?.data ?? []).map(toEvent), [data])` にして
  useEffect では `setEvents(events)`（依存 `[events, setEvents]`）に寄せると
  単一ソース化でき、無駄な再生成も減る。

- **[NICE-TO-HAVE] persistEvent の更新/新規判定の所在**: `data?.data` を直接見るため
  「list 取得前（data 未定義）に保存が走ると常に POST」になりうる。実際は
  `{data && <MonthView/>}` のガードで data 確定後しか描画されないため現状実害は無いが、
  将来 loading 中も操作可能にする変更が入ると前提が崩れる。コメントで前提を明記すると安全。

- **[NICE-TO-HAVE] endAt の終日表現**: 終日イベントを `end_at = 23:59:59.999`（同日内）で
  保持しており、複数日終日や「終了日 = 翌日 0:00」慣習と差が出る可能性。週/日表示・
  繰り返しの作り込みが入る後続フェーズで表現を一度そろえると良い（現状は往復一貫で問題なし）。

- **[NICE-TO-HAVE] title 必須の非対称**: API の valibot は `title` を optional/nullable に
  許容する一方、EventModal は空タイトルを送信前バリデーションで弾く。API 直叩きでは
  無題が作成可能で `toEvent` が `(無題)` 補完する。意図通りなら問題ないが、共有カレンダーで
  無題行を許すかは仕様判断として一度確認しておくとよい。

---

## 最終判定

### 実装判定

**APPROVE** — BLOCKER なし。RLS / SQLi / 新規・編集の振り分け / ISO↔Date 往復 /
ssr:false 隔離 / deep export いずれも妥当。カレンダー対話の最終動作は手動ブラウザ
確認に委ねる前提で、コード配線は正しい。NICE-TO-HAVE は後続タスクで対応可。

### Plan 判定

スケジュール画面は Plan のスコープ内機能として配線・RLS とも整合。週/日表示・
ドラッグ作り込み・繰り返し予定は後続予定であり未達を BLOCKER としない方針に沿う。
