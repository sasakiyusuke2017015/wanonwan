/**
 * @ui-catalog/core/organisms
 *
 * molecules の組み合わせ、独立したセクション
 */

// Placeholders
export * from './ComingSoon'

// Dialogs & Modals
export * from './Dialog'
export * from './Modal'
export * from './AlertDialog'
export * from './ConfirmDialog'
export * from './ModalCheckboxList'
export * from './DiffViewer'

// Menus
export * from './DropdownMenu'
export * from './FloatingMenuButton'
export * from './MenuItemList'
export * from './ProfileMenu'

// Feedback
export * from './Toast'
export * from './LoadingZone'
export * from './LoadingOverlay'
export * from './EmptyState'
export * from './Confetti'

// Data
// DataTable の Column は barrel からは出さず subpath (`./DataTable`) から取得する
// （InteractiveTable の Column と名前が衝突するため）
export {
  DataTable,
  type DataTableProps,
  type ClientDataTableProps,
  type ServerDataTableProps,
} from './DataTable'
export * from './InteractiveTable'

// Content
export * from './TitledBlock'
export * from './AdminPageHeader'
export * from './SelectableList'
export * from './CardGrid'
export * from './Ticket'
export * from './ContentBlock'
export * from './DetailHeader'
export * from './ToggleableSection'

// Forms
export * from './AuthFormCard'
export * from './PasswordValidation'

// Charts
export * from './LineChart'
export * from './RadarChart'
export * from './PieChart'

// Navigation
export * from './SortableToggleList'
export * from './SidebarNav'
export * from './FixedTabBar'
export * from './SiteHeaderShell'

// Buttons
export * from './KeyButton'
export * from './LoginButton'
export * from './RefreshButton'

// Decorations
export * from './BackgroundTexture'
export * from './FloatingElements'
export * from './GradientOverlay'

// Statistics
export * from './StatisticPanel'

// Transfer
export * from './TransferList'

// Charts (extended)
export * from './TrendChart'

// Animations (Magic UI)
export * from './BlurFade'
export * from './DotPattern'
export * from './GridPattern'
export * from './ShimmerButton'

// Calendar
export * from './CalendarEventCard'
export * from './EventPopover'
export * from './MonthDayCell'
export * from './DayColumn'
export * from './DayFrame'
export * from './CalendarDragOverlay'
export * from './EventCardContainer'
export * from './EventModal'
export * from './CalendarHeader'
export * from './MonthDragOverlay'
export * from './MonthView'
export * from './Timeline'
export * from './WeekView'
export * from './AgendaView'

// Markdown editor / preview / tag cloud
export * from './MarkdownEditor'
export * from './MarkdownPreview'
export * from './TagCloud'

// Notes-oriented pure UI
export * from './MiniCalendarGrid'
export * from './TocList'
export * from './ArticleGroupList'
export * from './ArticleCard'

// CSV 操作バー
export * from './CsvActionBar'

// 危険な操作 (削除 / 非公開化 / 無効化) の集約セクション
export * from './DangerZone'
