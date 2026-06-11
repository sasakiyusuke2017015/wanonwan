/**
 * @ui-catalog/core/infra/version
 *
 * バージョン管理 - 互換性チェック、更新検知
 */

export {
  VERSION_REGISTRY,
  checkVersions,
  initUICatalog,
  exportVersionsAsJson,
} from './registry'

export type {
  ComponentName,
  VersionRegistry,
  VersionMismatch,
  VersionCheckResult,
} from './registry'
