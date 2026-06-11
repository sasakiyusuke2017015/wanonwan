/**
 * @ui-catalog/core バージョン管理
 *
 * コンポーネントのバージョンを管理し、アプリ側で期待するバージョンとの差分を検出
 */

/**
 * コンポーネントバージョン定義
 * 各コンポーネントの現在のバージョンを管理
 */
export const VERSION_REGISTRY = {
  // atoms
  Animated: '1.0.0',
  BackButton: '1.0.0',
  BackgroundImage: '1.0.0',
  Badge: '1.1.0',
  Banner: '1.0.0',
  Box: '1.0.0',
  Button: '1.2.0',
  Card: '1.1.0',
  Checkbox: '1.0.0',
  ExternalLink: '1.0.0',
  FileLink: '1.0.0',
  Icon: '1.5.0',
  IconButton: '1.0.0',
  Input: '1.0.0',
  InternalLink: '1.0.0',
  LineChart: '1.0.0',
  Media: '1.0.0',
  RadarChart: '1.0.0',
  Radio: '1.0.0',
  ReplayButton: '1.0.0',
  ResetButton: '1.0.0',
  ResponsiveContainer: '1.0.0',
  Segment: '1.0.0',
  Select: '1.0.0',
  Slider: '1.0.0',
  Stack: '1.0.0',
  Text: '1.0.0',
  TextArea: '1.0.0',
  Toggle: '1.0.0',
  Tooltip: '1.1.0',
  Progress: '1.0.0',

  // adapters
  RouterContext: '1.0.0',

  // templates
  AppShell: '1.0.0',
  Footer: '1.0.0',
  Header: '1.0.0',
  SideNav: '1.0.0',
  SubHeader: '1.0.0',

  // molecules
  Calendar: '1.0.0',
  StatusBar: '1.0.0',
  TreeView: '1.0.0',
  ViewModeToggle: '1.0.0',
  AlertDialog: '1.0.0',
  AuthFormCard: '1.0.0',
  Breadcrumb: '1.1.0',
  CardGrid: '1.0.0',
  ConfirmDialog: '1.0.0',
  DatePicker: '1.0.0',
  Dialog: '1.0.0',
  FloatingMenuButton: '1.0.0',
  FormField: '1.0.0',
  KeyButton: '1.0.0',
  MenuItem: '1.0.0',
  MenuItemList: '1.0.0',
  Modal: '1.0.0',
  PasswordValidation: '1.0.0',
  StarRating: '1.0.0',
  StepIndicator: '1.0.0',
  Toast: '1.0.0',
  FilterField: '1.0.0',
  ActionBreadcrumb: '1.0.0',
  EmptyState: '1.0.0',
  Tabs: '1.0.0',
  ToggleableSection: '1.0.0',

  // organisms
  DataTable: '1.0.0',
  DiffViewer: '1.0.0',
  DotPattern: '1.0.0',
  GridPattern: '1.0.0',
  ModalCheckboxList: '1.0.0',
  ContentBlock: '1.0.0',
  DropdownMenu: '1.0.0',
  FixedTabBar: '1.0.0',
  LoadingOverlay: '1.0.0',
  LoginButton: '1.0.0',
  NumberTicker: '1.0.0',
  ShimmerButton: '1.0.0',
  SortableToggleList: '1.0.0',
  TabBar: '1.1.0',
  DetailHeader: '1.0.0',
  PieChart: '1.0.0',
  LoadingZone: '1.0.0',
  RefreshButton: '1.0.0',

  // 1on1 系
  AdjustmentBanner: '1.0.0',
  ChatFab: '1.0.0',
  DataCountDisplay: '1.0.0',
  DevelopmentBanner: '1.0.0',
  MemberCard: '1.0.0',
  PWAInstallPrompt: '1.0.0',
  QACardList: '1.0.0',
  ScoreBadge: '1.0.0',
  StatisticItem: '1.0.0',
  StatisticList: '1.0.0',
  StatisticPanel: '1.0.0',
  SurveyCard: '1.0.0',

  // organisms (shared)
  InteractiveTable: '1.0.0',
  TransferList: '1.0.0',
  TrendChart: '1.1.0',

  // molecules (calendar)
  ColorPicker: '1.0.0',
  DayOfWeekPicker: '1.0.0',
  IconLabel: '1.0.0',
  IconPicker: '1.0.0',
  MonthEventCard: '1.0.0',
  PillSelect: '1.0.0',
  SpanningBar: '1.0.0',
  TimeSelect: '1.0.0',
  TimeSlotRow: '1.0.0',

  // organisms (calendar)
  CalendarEventCard: '1.1.0',
  EventPopover: '1.1.0',
  MonthDayCell: '1.1.0',
  CalendarDragOverlay: '1.0.0',
  CalendarHeader: '1.0.0',
  DayColumn: '1.0.0',
  DayFrame: '1.0.0',
  EventCardContainer: '1.0.0',
  EventModal: '1.0.0',
  MonthDragOverlay: '1.0.0',
  MonthView: '1.0.0',
  Timeline: '1.0.0',
  WeekView: '1.0.0',

  // atoms (navigation)
  NavItem: '1.0.0',

  // molecules (navigation)
  ContextMenu: '1.0.0',
  ProjectItem: '1.0.0',
  TagItem: '1.0.0',

  // decorations
  BackgroundTexture: '1.0.0',
  GradientOverlay: '1.0.0',
  FloatingElements: '1.0.0',

  // magicui
  BlurFade: '1.0.0',

  // atoms (visualization)
  CountdownRing: '1.0.0',
  MathView: '1.0.0',

  // border-shape components (Chrome 147+ 専用)
  Ticket: '1.0.0',
  ScallopedCard: '1.0.0',
} as const

export type ComponentName = keyof typeof VERSION_REGISTRY
export type VersionRegistry = Record<string, string>

export interface VersionMismatch {
  component: string
  expected: string
  actual: string
  type: 'updated' | 'downgraded'
}

export interface VersionCheckResult {
  mismatches: VersionMismatch[]
  newInLibrary: string[]
  removedFromLibrary: string[]
}

/**
 * バージョンチェックを実行
 *
 * @param expectedVersions アプリ側で期待するバージョン（JSON から読み込み）
 * @param options オプション設定
 * @returns チェック結果
 *
 * @example
 * ```tsx
 * // apps/web/src/main.tsx
 * import { checkVersions } from '@ui-catalog/core'
 * import versions from '../ui-catalog.versions.json'
 *
 * if (import.meta.env.DEV) {
 *   checkVersions(versions)
 * }
 * ```
 */
export function checkVersions(
  expectedVersions: VersionRegistry,
  options?: {
    /** Warning を console に出力するか（デフォルト: true） */
    logWarnings?: boolean
    /** 差分があった場合のコールバック */
    onMismatch?: (mismatch: VersionMismatch) => void
  }
): VersionCheckResult {
  const { logWarnings = true, onMismatch } = options ?? {}

  const mismatches: VersionMismatch[] = []
  const newInLibrary: string[] = []
  const removedFromLibrary: string[] = []

  // ライブラリ側のバージョンをチェック
  for (const [component, actualVersion] of Object.entries(VERSION_REGISTRY)) {
    const expectedVersion = expectedVersions[component]

    if (!expectedVersion) {
      // アプリ側に定義がない（新しいコンポーネント）
      newInLibrary.push(component)
    } else if (expectedVersion !== actualVersion) {
      // バージョン不一致
      const type = compareVersions(actualVersion, expectedVersion) > 0 ? 'updated' : 'downgraded'
      const mismatch: VersionMismatch = {
        component,
        expected: expectedVersion,
        actual: actualVersion,
        type,
      }
      mismatches.push(mismatch)
      onMismatch?.(mismatch)
    }
  }

  // アプリ側にあってライブラリ側にないもの
  for (const component of Object.keys(expectedVersions)) {
    if (!(component in VERSION_REGISTRY)) {
      removedFromLibrary.push(component)
    }
  }

  // コンソール出力
  if (logWarnings && typeof console !== 'undefined') {
    if (mismatches.length > 0) {
      console.group('%c⚠️ @ui-catalog/core バージョン変更検出', 'color: orange; font-weight: bold')
      mismatches.forEach(({ component, expected, actual, type }) => {
        const icon = type === 'updated' ? '📦' : '⬇️'
        console.warn(`  ${icon} ${component}: ${expected} → ${actual}`)
      })
      console.groupEnd()
    }

    if (newInLibrary.length > 0) {
      console.group('%c📦 @ui-catalog/core 新規コンポーネント', 'color: blue; font-weight: bold')
      newInLibrary.forEach((component) => {
        console.info(`  + ${component}: ${VERSION_REGISTRY[component as ComponentName]}`)
      })
      console.groupEnd()
    }

    if (removedFromLibrary.length > 0) {
      console.group('%c🗑️ @ui-catalog/core 削除されたコンポーネント', 'color: red; font-weight: bold')
      removedFromLibrary.forEach((component) => {
        console.warn(`  - ${component}`)
      })
      console.groupEnd()
    }
  }

  return { mismatches, newInLibrary, removedFromLibrary }
}

/**
 * セマンティックバージョンを比較
 * @returns a > b なら正、a < b なら負、等しければ 0
 */
function compareVersions(a: string, b: string): number {
  const parseVersion = (v: string) => v.split('.').map(Number)
  const [aMajor, aMinor, aPatch] = parseVersion(a)
  const [bMajor, bMinor, bPatch] = parseVersion(b)

  if (aMajor !== bMajor) return aMajor - bMajor
  if (aMinor !== bMinor) return aMinor - bMinor
  return aPatch - bPatch
}

/**
 * 現在のバージョン定義を JSON 形式で取得
 * ui-catalog.versions.json の初期生成用
 */
export function exportVersionsAsJson(): string {
  return JSON.stringify(VERSION_REGISTRY, null, 2)
}

/**
 * versions.json の存在を必須にする
 * アプリ側で初期化時に呼び出す
 *
 * @param versionsJson アプリ側の ui-catalog.versions.json の内容
 * @throws versions.json が未定義または空の場合にエラー
 *
 * @example
 * ```tsx
 * // apps/web/src/main.tsx
 * import { initUICatalog } from '@ui-catalog/core'
 * import versions from '../ui-catalog.versions.json'
 *
 * initUICatalog(versions)
 * ```
 */
export function initUICatalog(versionsJson: VersionRegistry | undefined | null): void {
  if (!versionsJson || Object.keys(versionsJson).length === 0) {
    throw new Error(
      `[ui-catalog] ui-catalog.versions.json が必要です。

以下のコマンドで生成してください:
  pnpm --filter @ui-catalog/core export-versions > apps/web/ui-catalog.versions.json

または、手動で VERSION_REGISTRY の内容をコピーしてください。`
    )
  }

  // 開発環境でのみバージョンチェックを実行
  if (process.env.NODE_ENV === 'development') {
    checkVersions(versionsJson)
  }
}
