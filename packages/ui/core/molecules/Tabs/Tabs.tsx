'use client'

import { useState, type ReactNode } from 'react'
import { useOperationLog } from '../../../infra/devtools'
import styles from './Tabs.module.scss'

export interface Tab {
  id: string
  label: string
  content: ReactNode
}

export interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  activeTab?: string
  onTabChange?: (id: string) => void
  className?: string
  tabClassName?: string
  panelClassName?: string
}

export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActive,
  onTabChange,
  className,
  tabClassName,
  panelClassName,
}: TabsProps) {
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

  const panelClasses = [styles.tabs__panel, panelClassName].filter(Boolean).join(' ')

  return (
    <div data-component="tabs" className={className}>
      <div className={styles.tabs__list} role="tablist">
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
      <div role="tabpanel" className={panelClasses}>
        {current?.content}
      </div>
    </div>
  )
}
