'use client'

import { useState } from 'react'
import { cn } from '../../utils/cn'
import { Modal } from '../Modal/Modal'
import { Button } from '../../molecules/Button'
import { Checkbox } from '../../atoms/Checkbox'
import { Text } from '../../atoms/Text'

export interface CheckboxItem {
  id: string
  label: string
  description?: string
}

export interface ModalCheckboxListProps {
  isOpen: boolean
  title: string
  description?: string
  items: CheckboxItem[]
  onConfirm: (selectedIds: string[]) => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  requireSelection?: boolean
  className?: string
}

export function ModalCheckboxList({
  isOpen,
  title,
  description,
  items,
  onConfirm,
  onCancel,
  confirmText = '確認',
  cancelText = 'キャンセル',
  requireSelection = false,
  className,
}: ModalCheckboxListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((item) => item.id)))
    }
  }

  const handleConfirm = () => {
    onConfirm([...selected])
    setSelected(new Set())
  }

  const handleCancel = () => {
    setSelected(new Set())
    onCancel()
  }

  const isConfirmDisabled = requireSelection && selected.size === 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      maxWidth="400px"
    >
      <div className={cn('flex flex-col max-h-[60vh]', className)} data-component="modal-checkbox-list">
        {description && (
          <Text as="p" size="xs" variant="muted" className="px-5 pb-2">{description}</Text>
        )}

        {/* Select all */}
        <div className="px-5 py-2 border-b border-(--color-border)/50">
          <Checkbox
            label="すべて選択"
            checked={selected.size === items.length}
            onChange={handleSelectAll}
            size="small"
          />
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {items.map((item) => (
            <div key={item.id} className="py-2 hover:bg-(--color-hover-bg) rounded px-1 -mx-1">
              <Checkbox
                label={item.label}
                checked={selected.has(item.id)}
                onChange={() => handleToggle(item.id)}
              />
              {item.description && (
                <Text as="p" size="xs" variant="muted" className="ml-6 mt-0.5">{item.description}</Text>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-(--color-border)">
          <Button variant="outline" size="small" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            variant="primary"
            size="small"
            disabled={isConfirmDisabled}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
