/**
 * 開発環境専用デバッグユーティリティ（日本語対応 & 時間計測付き)
 */

// 時間計測用のマップ
const timers = new Map<string, number>();

export const debugLog = (data: unknown, label: string) => {
  if (process.env.NODE_ENV === 'development') {
    const time = new Date().toLocaleTimeString('ja-JP');
    console.log(`🔍 【${label}】 (${time})`, data);
  }
};

export const debugLogGroup = (label: string, callback: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`📊 【${label}】`);
    callback();
    console.groupEnd();
  }
};

export const debugCompare = (
  rawData: unknown,
  processedData: unknown,
  label: string = 'データ比較'
) => {
  if (process.env.NODE_ENV === 'development') {
    const time = new Date().toLocaleTimeString('ja-JP');
    console.group(`⚖️ 【${label}】 (${time})`);
    console.log('📥 生データ:', rawData);
    console.log('📤 処理済データ:', processedData);

    // データ数の比較
    if (Array.isArray(processedData)) {
      console.log(`📊 処理結果: ${processedData.length}件のデータを生成`);
    }

    console.groupEnd();
  }
};

// 時間計測開始
export const debugTimeStart = (processName: string) => {
  if (process.env.NODE_ENV === 'development') {
    timers.set(processName, window.performance.now());
    console.log(`⏱️ 【処理開始】 ${processName}`);
  }
};

// 時間計測終了
export const debugTimeEnd = (processName: string) => {
  if (process.env.NODE_ENV === 'development') {
    const startTime = timers.get(processName);
    if (startTime) {
      const duration = (window.performance.now() - startTime) / 1000;
      const emoji = duration < 0.1 ? '⚡' : duration < 0.5 ? '🔥' : '🐌';
      console.log(
        `${emoji} 【処理完了】 ${processName}: ${duration.toFixed(3)}s`
      );
      timers.delete(processName);
    }
  }
};

// 時間計測付きデータ処理
export const debugWithTime = <T>(
  processName: string,
  data: T,
  label: string
): T => {
  if (process.env.NODE_ENV === 'development') {
    debugTimeStart(processName);
    debugLog(data, label);
    debugTimeEnd(processName);
  }
  return data;
};

// ─────────────────────────────────────────────────────────
// コンポーネント操作ログ
// ─────────────────────────────────────────────────────────

/**
 * コンポーネントのマウント/レンダリングをログ出力
 * @example debugRender('LoginButton', { state: 'ready', variant: 'success' })
 */
export const debugRender = (componentName: string, props?: Record<string, unknown>) => {
  if (process.env.NODE_ENV === 'development') {
    const time = new Date().toLocaleTimeString('ja-JP');
    if (props) {
      console.log(`🎨 [${componentName}] rendered (${time})`, props);
    } else {
      console.log(`🎨 [${componentName}] rendered (${time})`);
    }
  }
};

// アクション別の絵文字マッピング
const ACTION_EMOJIS: Record<string, string> = {
  click: '🖱️',
  change: '✏️',
  focus: '🎯',
  blur: '💨',
  submit: '📤',
  open: '📂',
  close: '📁',
  select: '☑️',
  toggle: '🔀',
  expand: '⬇️',
  collapse: '⬆️',
  hover: '👆',
  mount: '🔌',
  unmount: '🔓',
  error: '❌',
  success: '✅',
};

/**
 * ユーザーインタラクションをログ出力
 * @example debugAction('LoginButton', 'click', { state: 'ready' })
 */
export const debugAction = (
  componentName: string,
  action: string,
  details?: Record<string, unknown>
) => {
  if (process.env.NODE_ENV === 'development') {
    const time = new Date().toLocaleTimeString('ja-JP');
    const emoji = ACTION_EMOJIS[action] ?? '🔹';
    if (details) {
      console.log(`${emoji} [${componentName}] ${action} (${time})`, details);
    } else {
      console.log(`${emoji} [${componentName}] ${action} (${time})`);
    }
  }
};

/**
 * 状態変化をログ出力
 * @example debugStateChange('LoginButton', 'state', 'ready', 'authenticating')
 */
export const debugStateChange = (
  componentName: string,
  stateName: string,
  from: unknown,
  to: unknown
) => {
  if (process.env.NODE_ENV === 'development') {
    const time = new Date().toLocaleTimeString('ja-JP');
    console.log(`🔄 [${componentName}] ${stateName}: ${String(from)} → ${String(to)} (${time})`);
  }
};
