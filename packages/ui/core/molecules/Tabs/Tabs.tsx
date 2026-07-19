'use client'

import { useState, type ReactElement, type ReactNode } from 'react'
import { useOperationLog } from '../../../infra/devtools'
import styles from './Tabs.module.scss'

export interface PanelTab {
  id: string
  label: string
  content: ReactNode
}

export interface LinkTab {
  id: string
  label: string
  href: string
}

/**
 * 後方互換: 既存呼び出し元向けエイリアス。
 * 新規呼び出しは `PanelTab` / `LinkTab` を直接使うことを推奨。
 */
export type Tab = PanelTab | LinkTab

export type AnchorRenderProps = {
  href: string
  className: string
  'aria-current'?: 'page'
  'data-tab-id': string
  children: ReactNode
}

/**
 * `underline` (既定): 下線で選択状態を示すフラットなタブ。
 * `folder`: フォルダタブ風。アクティブタブが面として浮き上がり、下のパネル面へ地続きに繋がる。
 */
export type TabsVariant = 'underline' | 'folder'

interface BaseTabsProps {
  className?: string
  tabClassName?: string
  variant?: TabsVariant
}

interface PanelTabsProps extends BaseTabsProps {
  mode?: 'panel'
  tabs: PanelTab[]
  defaultTab?: string
  activeTab?: string
  onTabChange?: (id: string) => void
  panelClassName?: string
  /**
   * 全パネルを常時マウントし、非アクティブを `hidden` で隠す（再マウント・enter アニメ
   * 再生なし）。タブ切替でコンテンツの状態を保持したい / 切替を即時にしたいときに使う。
   * 既定 (false) は active パネルのみを `key={active}` で描画し、切替ごとに再マウントする。
   */
  keepMounted?: boolean
}

interface LinkTabsProps extends BaseTabsProps {
  mode: 'link'
  tabs: LinkTab[]
  activeId: string
  /**
   * アンカー要素のレンダラ。Next.js Link 等をインジェクトする用途。
   * 未指定の場合は素の `<a>` にフォールバックする (Storybook 用)。
   */
  renderAnchor?: (props: AnchorRenderProps) => ReactElement
}

export type TabsProps = PanelTabsProps | LinkTabsProps

export function Tabs(props: TabsProps) {
  if (props.mode === 'link') {
    return <LinkModeTabs {...props} />
  }
  return <PanelModeTabs {...props} />
}

function PanelModeTabs({
  tabs,
  defaultTab,
  activeTab: controlledActive,
  onTabChange,
  className,
  tabClassName,
  panelClassName,
  variant = 'underline',
  keepMounted = false,
}: PanelTabsProps) {
  const [internalActive, setInternalActive] = useState(defaultTab ?? tabs[0]?.id)
  const active = controlledActive ?? internalActive
  const log = useOperationLog('Tabs')

  function handleSelect(id: string) {
    const tab = tabs.find((t) => t.id === id)
    log('select', { tabId: id, tabLabel: tab?.label })
    if (!controlledActive) setInternalActive(id)
    onTabChange?.(id)
  }

  const current = tabs.find((t) => t.id === active)

  const getTabClasses = (tabId: string) => {
    const classes = [styles.tabs__tab, tabClassName]
    if (active === tabId) classes.push(styles['tabs__tab--active'])
    return classes.filter(Boolean).join(' ')
  }

  const listClasses = [styles.tabs__list, variant === 'folder' && styles['tabs__list--folder']]
    .filter(Boolean)
    .join(' ')
  const panelClasses = [styles.tabs__panel, panelClassName].filter(Boolean).join(' ')

  return (
    <div data-component="tabs" data-mode="panel" data-variant={variant} className={className}>
      <div className={listClasses} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => handleSelect(tab.id)}
            className={getTabClasses(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {keepMounted ? (
        // 全パネルを常時マウントし hidden で出し分ける。enter アニメ (tabs__panel) は
        // 付けない（hidden→表示のたびに再生されて "大袈裟" になるため）。
        tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            hidden={active !== tab.id}
            className={panelClassName}
          >
            {tab.content}
          </div>
        ))
      ) : (
        <div key={active} role="tabpanel" className={panelClasses}>
          {current?.content}
        </div>
      )}
    </div>
  )
}

function LinkModeTabs({
  tabs,
  activeId,
  renderAnchor,
  className,
  tabClassName,
  variant = 'underline',
}: LinkTabsProps) {
  const log = useOperationLog('Tabs')

  function getTabClasses(tabId: string) {
    const classes = [styles.tabs__tab, tabClassName]
    if (activeId === tabId) classes.push(styles['tabs__tab--active'])
    return classes.filter(Boolean).join(' ')
  }

  const listClasses = [styles.tabs__list, variant === 'folder' && styles['tabs__list--folder']]
    .filter(Boolean)
    .join(' ')

  return (
    <div data-component="tabs" data-mode="link" data-variant={variant} className={className}>
      <div className={listClasses} role="tablist">
        {tabs.map((tab) => {
          const isActive = activeId === tab.id
          const anchorProps: AnchorRenderProps = {
            href: tab.href,
            className: getTabClasses(tab.id),
            'data-tab-id': tab.id,
            children: tab.label,
            ...(isActive ? { 'aria-current': 'page' as const } : {}),
          }
          if (renderAnchor) {
            return (
              <RenderAnchorWrapper
                key={tab.id}
                anchorProps={anchorProps}
                render={renderAnchor}
                onLogSelect={() => log('select', { tabId: tab.id, tabLabel: tab.label, href: tab.href })}
              />
            )
          }
          return (
            <a
              key={tab.id}
              href={anchorProps.href}
              className={anchorProps.className}
              aria-current={anchorProps['aria-current']}
              data-tab-id={anchorProps['data-tab-id']}
              onClick={() => log('select', { tabId: tab.id, tabLabel: tab.label, href: tab.href })}
            >
              {anchorProps.children}
            </a>
          )
        })}
      </div>
    </div>
  )
}

/**
 * renderAnchor 経由でカスタム anchor を描画しつつ、操作ログを横取りするための wrapper。
 *
 * 仕様: `onClick` は middle-click (button=1) / Cmd+click / Ctrl+click / Shift+click
 * でも発火するため、`onLogSelect` は「新タブで開く」も含めた **タブ選択行為全体** を
 * 計上する。SPA 実遷移のみを取りたい場合は別途 modifier 判定が必要 (現状の計測意図では
 * 「新タブで開いた = それも選択行為」と数える方が自然なため judgement なし)。
 *
 * `display: contents` で wrapper の box を消すので flex / grid layout には影響しない。
 */
function RenderAnchorWrapper({
  anchorProps,
  render,
  onLogSelect,
}: {
  anchorProps: AnchorRenderProps
  render: (props: AnchorRenderProps) => ReactElement
  onLogSelect: () => void
}) {
  return (
    <span onClick={onLogSelect} style={{ display: 'contents' }}>
      {render(anchorProps)}
    </span>
  )
}

