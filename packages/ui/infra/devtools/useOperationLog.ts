/**
 * 操作ログ Hook
 *
 * UIコンポーネントの操作を記録し、開発環境で出力する
 * - consoleOutput: ブラウザのDevToolsに出力
 * - serverOutput: サーバー（Docker stdout）に出力
 *
 * 使用例:
 * ```tsx
 * const log = useOperationLog('Button')
 * log('click', { variant: 'primary' })
 * ```
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface OperationLogConfig {
  /** ログ出力を有効にするか（デフォルト: 開発環境のみ） */
  enabled?: boolean
  /** ログレベル */
  level?: LogLevel
  /** タイムスタンプを含めるか */
  timestamp?: boolean
  /** コンポーネント名のプレフィックス */
  prefix?: string
  /** コンソール出力 */
  consoleOutput?: boolean
  /** サーバー出力（Docker stdout） */
  serverOutput?: boolean
  /** サーバーログのエンドポイント */
  serverEndpoint?: string
}

/**
 * DevTools設定（main.tsxからの呼び出し用）
 */
export interface DevToolsConfig {
  /** 有効化 */
  enabled?: boolean
  /** 操作ログを出力 */
  logOperations?: boolean
  /** コンソール出力 */
  consoleOutput?: boolean
  /** サーバーログ出力（Docker stdout） */
  serverOutput?: boolean
  /** サーバーログのエンドポイント */
  serverEndpoint?: string
  /** UID生成 */
  generateUids?: boolean
  /** UIDプレフィックス */
  uidPrefix?: string
}

// グローバル設定
let globalConfig: OperationLogConfig = {
  enabled: undefined, // undefined = 自動判定（DEVモード）
  level: 'info',
  timestamp: true,
  prefix: '[ui-catalog]',
  consoleOutput: true,
  serverOutput: false,
  serverEndpoint: '/api/dev/log',
}

/**
 * グローバル設定を更新
 */
export function configureOperationLog(config: Partial<OperationLogConfig>) {
  globalConfig = { ...globalConfig, ...config }
}

/**
 * DevTools設定（main.tsxからの呼び出し用）
 * configureOperationLogのエイリアス + 追加設定
 */
export function configureDevTools(config: DevToolsConfig) {
  globalConfig = {
    ...globalConfig,
    enabled: config.enabled ?? config.logOperations,
    prefix: config.uidPrefix ? `[${config.uidPrefix}]` : globalConfig.prefix,
    consoleOutput: config.consoleOutput ?? globalConfig.consoleOutput,
    serverOutput: config.serverOutput ?? globalConfig.serverOutput,
    serverEndpoint: config.serverEndpoint ?? globalConfig.serverEndpoint,
  }

  if (config.enabled && config.consoleOutput) {
    console.log(`[ui-catalog] DevTools initialized`, {
      logOperations: config.logOperations,
      consoleOutput: config.consoleOutput,
      serverOutput: config.serverOutput,
      uidPrefix: config.uidPrefix,
    })
  }
}

/**
 * ログ出力が有効かどうかを判定
 */
function isEnabled(): boolean {
  if (globalConfig.enabled !== undefined) {
    return globalConfig.enabled
  }
  // Next.jsではprocess.env.NODE_ENVを使用
  return process.env.NODE_ENV === 'development'
}

/**
 * サーバーにログを送信（Docker stdout用）
 */
function sendToServer(
  level: LogLevel,
  component: string,
  action: string,
  data?: Record<string, unknown>
) {
  if (!globalConfig.serverOutput || !globalConfig.serverEndpoint) return

  const payload = {
    level,
    component,
    action,
    data,
    timestamp: new Date().toISOString(),
    prefix: globalConfig.prefix,
  }

  // 非同期で送信（UIをブロックしない）
  fetch(globalConfig.serverEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    // サーバー未起動時などはエラーを無視
  })
}

/**
 * フォーマット済みログを出力
 */
function outputLog(
  level: LogLevel,
  component: string,
  action: string,
  data?: Record<string, unknown>
) {
  if (!isEnabled()) return

  const timestamp = globalConfig.timestamp ? new Date().toISOString() : ''
  const prefix = globalConfig.prefix || ''
  const emoji = getEmoji(action)
  const message = `${prefix} ${emoji} ${component}.${action}`

  // コンソール出力
  if (globalConfig.consoleOutput) {
    const logArgs = timestamp
      ? [message, { timestamp, ...data }]
      : data
        ? [message, data]
        : [message]

    switch (level) {
      case 'error':
        console.error(...logArgs)
        break
      case 'warn':
        console.warn(...logArgs)
        break
      case 'debug':
        console.debug(...logArgs)
        break
      default:
        console.log(...logArgs)
    }
  }

  // サーバー出力
  if (globalConfig.serverOutput) {
    sendToServer(level, component, action, data)
  }
}

/**
 * アクションに応じた絵文字を返す
 */
function getEmoji(action: string): string {
  const emojiMap: Record<string, string> = {
    click: '🖱️',
    change: '✏️',
    focus: '🎯',
    blur: '💨',
    submit: '📤',
    open: '📂',
    close: '📁',
    select: '✅',
    toggle: '🔄',
    hover: '👆',
    mount: '🔌',
    unmount: '🔌',
    error: '❌',
    success: '✅',
  }
  return emojiMap[action] || '📝'
}

/**
 * 操作ログ用のフック
 *
 * @param componentName コンポーネント名
 * @returns ログ出力関数
 */
export function useOperationLog(componentName: string) {
  return (
    action: string,
    data?: Record<string, unknown>,
    level: LogLevel = 'info'
  ) => {
    outputLog(level, componentName, action, data)
  }
}

/**
 * コンポーネント外で使用する場合のログ関数
 */
export function operationLog(
  componentName: string,
  action: string,
  data?: Record<string, unknown>,
  level: LogLevel = 'info'
) {
  outputLog(level, componentName, action, data)
}

export default useOperationLog
