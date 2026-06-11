'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { eventModalAtom, activeSlotAtom, eventsAtom } from '../../hooks/calendar/calendar'
import { format } from 'date-fns'
import { Button, Input } from '../../molecules'
import { TextArea } from '../../atoms'
import { colors } from '../../tokens'
import { TimeSelect } from '../../molecules/TimeSelect/TimeSelect'
import { ColorPicker, EVENT_COLORS } from '../../molecules/ColorPicker/ColorPicker'
import { PillSelect } from '../../molecules/PillSelect/PillSelect'
import { DayOfWeekPicker } from '../../molecules/DayOfWeekPicker/DayOfWeekPicker'
import { IconPicker } from '../../molecules/IconPicker/IconPicker'
import type { CalendarEvent, EventMode, DayOfWeek } from '../../types/calendar'
import { resolveOriginalEvent } from '../../utils/calendar/repeatUtils'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const labelClass = 'text-xs text-text-secondary font-medium'

interface EventModalProps {
  readonly persistEvent: (event: CalendarEvent) => Promise<void>
  readonly removeEvent: (id: string) => Promise<void>
}

export function EventModal({ persistEvent, removeEvent }: EventModalProps) {
  const [modal, setModal] = useAtom(eventModalAtom)
  const setActiveSlot = useSetAtom(activeSlotAtom)
  const allEvents = useAtomValue(eventsAtom)
  const titleRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState('')
  const [startDateStr, setStartDateStr] = useState('')
  const [endDateStr, setEndDateStr] = useState('')
  const [mode, setMode] = useState<EventMode>('normal')
  const [repeatDays, setRepeatDays] = useState<readonly DayOfWeek[]>([])
  const [startMin, setStartMin] = useState(9 * 60)
  const [endMin, setEndMin] = useState(10 * 60)
  const [color, setColor] = useState<string>(EVENT_COLORS[0]!.value)
  const [icon, setIcon] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const lockedPos = useRef<{ top?: number; left?: number; right?: number } | null>(null)
  const [posReady, setPosReady] = useState(false)

  // Calculate position once when modal opens, lock it in a ref
  useLayoutEffect(() => {
    if (!modal.isOpen) {
      lockedPos.current = null
      setPosReady(false)
      return
    }

    const panelW = 380
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = 12
    const targetDay = modal.date.toDateString()

    let targetRect: DOMRect | null = null

    for (const col of document.querySelectorAll('[data-date]')) {
      if (new Date((col as HTMLElement).dataset.date!).toDateString() === targetDay) {
        targetRect = col.getBoundingClientRect()
        break
      }
    }

    if (!targetRect) {
      for (const cell of document.querySelectorAll('[data-month-date]')) {
        if (new Date((cell as HTMLElement).dataset.monthDate!).toDateString() === targetDay) {
          targetRect = cell.getBoundingClientRect()
          break
        }
      }
    }

    if (!targetRect) {
      const el = document.querySelector('.border-primary')
      if (el) targetRect = el.getBoundingClientRect()
    }

    if (targetRect) {
      const anchorY = Math.max(margin, (vh - 500) / 2)
      if (targetRect.right + margin + panelW < vw) {
        lockedPos.current = { top: anchorY, left: targetRect.right + margin }
      } else if (targetRect.left - margin - panelW > 0) {
        lockedPos.current = { top: anchorY, right: vw - targetRect.left + margin }
      } else {
        lockedPos.current = null
      }
    } else {
      lockedPos.current = null
    }

    requestAnimationFrame(() => setPosReady(true))
  }, [modal.isOpen, modal.date])

  useEffect(() => {
    if (modal.isOpen) {
      // 繰り返しイベントは仮想インスタンスの可能性があるので元イベントを使う
      const editing = modal.editingEvent ? resolveOriginalEvent(modal.editingEvent, allEvents) : null
      if (editing) {
        setTitle(editing.title)
        setStartDateStr(format(editing.startTime, 'yyyy-MM-dd'))
        setEndDateStr(format(editing.endTime, 'yyyy-MM-dd'))
        setMode(editing.repeat ? 'repeat' : editing.allDay ? 'allDay' : 'normal')
        setRepeatDays(editing.repeat ?? [])
        setStartMin(editing.startTime.getHours() * 60 + editing.startTime.getMinutes())
        setEndMin(editing.endTime.getHours() * 60 + editing.endTime.getMinutes())
        setColor(editing.color)
        setIcon(editing.icon)
        setDescription(editing.description ?? '')
        setSubmitted(false)
      } else {
        const d = format(modal.date, 'yyyy-MM-dd')
        const ed = modal.endDate ? format(modal.endDate, 'yyyy-MM-dd') : d
        setTitle('')
        setStartDateStr(d)
        setEndDateStr(ed)
        setMode('normal')
        setRepeatDays([])
        setStartMin(modal.hour * 60)
        // endHour=24 は 24:00（翌日0時）として扱う
        setEndMin((modal.endHour ?? Math.min(modal.hour + 1, 24)) * 60)
        setColor(EVENT_COLORS[0]!.value)
        setIcon(undefined)
        setDescription('')
        setSubmitted(false)
      }
      requestAnimationFrame(() => titleRef.current?.focus())
    }
  }, [modal.isOpen, modal.date, modal.hour, modal.endHour, modal.endDate, modal.editingEvent, allEvents])

  const close = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }))
    setActiveSlot(null)
  }, [setModal, setActiveSlot])

  const handleDelete = useCallback(async () => {
    if (!modal.editingEvent) return
    try {
      await removeEvent(modal.editingEvent.id)
      close()
    } catch (error) {
      throw new Error(`Failed to delete event: ${error}`)
    }
  }, [modal.editingEvent, removeEvent, close])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitted(true)
      const allDayMode = mode === 'allDay'
      const titleEmpty = !title.trim()
      const timeInvalid = !allDayMode && endMin <= startMin && (mode === 'repeat' || startDateStr === endDateStr)
      const dateRangeInvalid = startDateStr > endDateStr
      const repeatEmpty = mode === 'repeat' && repeatDays.length === 0
      if (titleEmpty || timeInvalid || dateRangeInvalid || repeatEmpty) return

      // YYYY-MM-DD をローカル日付として解釈（UTC解釈のズレを防ぐ）
      const [sy, sm, sd] = startDateStr.split('-').map(Number)
      const [ey, em, ed] = endDateStr.split('-').map(Number)
      const startTime = new Date(sy!, sm! - 1, sd!)
      const endTime = new Date(ey!, em! - 1, ed!)

      if (mode === 'allDay') {
        startTime.setHours(0, 0, 0, 0)
        endTime.setHours(23, 59, 59, 999)
      } else {
        startTime.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0)
        endTime.setHours(Math.floor(endMin / 60), endMin % 60, 0, 0)
        if (mode !== 'repeat' && endTime <= startTime) {
          endTime.setDate(endTime.getDate() + 1)
        }
      }

      try {
        await persistEvent({
          id: modal.editingEvent?.id ?? generateId(),
          title: title.trim(),
          startTime,
          endTime,
          color,
          allDay: mode === 'allDay' || undefined,
          repeat: mode === 'repeat' && repeatDays.length > 0 ? repeatDays : undefined,
          icon: icon || undefined,
          description: description.trim() || undefined,
        })
        close()
      } catch (error) {
        throw new Error(`Failed to save event: ${error}`)
      }
    },
    [title, startDateStr, endDateStr, mode, repeatDays, startMin, endMin, color, icon, description, modal.editingEvent, persistEvent, close]
  )

  useEffect(() => {
    if (!modal.isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [modal.isOpen, close])

  if (!modal.isOpen) return null

  const allDay = mode === 'allDay'
  const isTitleEmpty = title.trim().length === 0
  const isTimeInvalid = !allDay && endMin <= startMin && (mode === 'repeat' || startDateStr === endDateStr)
  const isDateRangeInvalid = startDateStr > endDateStr
  const isRepeatDaysEmpty = mode === 'repeat' && repeatDays.length === 0
  const errorBorder: React.CSSProperties = { borderColor: '#dc2626', boxShadow: 'inset 0 0 0 1px #dc2626' }
  const validationErrors: string[] = []
  if (isTitleEmpty) validationErrors.push('タイトルを入力してください')
  if (isRepeatDaysEmpty) validationErrors.push('曜日を選択してください')
  if (isDateRangeInvalid) validationErrors.push('終了日は開始日より後にしてください')
  if (isTimeInvalid) validationErrors.push('終了時刻は開始時刻より後にしてください')

  const pos = lockedPos.current
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const availableH = pos ? vh - pos.top! - 12 : vh * 0.8
  const panelMaxH = `${Math.max(availableH, 200)}px`
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const panelStyle: React.CSSProperties = isMobile
    ? { position: 'fixed', inset: 0, width: '100%', height: '100%', maxHeight: '100vh', zIndex: 10000, borderRadius: 0 }
    : pos
    ? { position: 'fixed', top: `${pos.top}px`, left: pos.left !== undefined ? `${pos.left}px` : undefined, right: pos.right !== undefined ? `${pos.right}px` : undefined, width: '380px', maxHeight: panelMaxH, zIndex: 10000 }
    : { width: '380px', maxHeight: '80vh' }

  return (
    <div
      data-component="EventModal"
      style={{
        position: 'fixed', inset: 0, display: 'flex',
        alignItems: pos ? 'flex-start' : 'center',
        justifyContent: pos ? 'flex-start' : 'center',
        backgroundColor: posReady ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0)',
        transition: 'background-color 0.2s ease-out', zIndex: 10000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div
        ref={panelRef}
        style={{
          ...panelStyle,
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column' as const,
          opacity: posReady ? 1 : 0,
          transform: posReady ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(6px)',
          transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: `1px solid ${colors.border.primary}` }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: colors.text.primary, margin: 0 }}>
            {modal.editingEvent ? 'イベントを編集' : 'イベントを追加'}
          </h3>
          <button
            type="button"
            onClick={close}
            className="flex items-center justify-center w-8 h-8 border-none bg-transparent cursor-pointer rounded-lg text-text-secondary hover:bg-surface-hover transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* タイトル */}
              <div>
                <div className={labelClass} style={{ marginBottom: '4px', color: submitted && isTitleEmpty ? colors.danger : undefined }}>タイトル</div>
                <Input ref={titleRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトルを追加" size="large" style={submitted && isTitleEmpty ? errorBorder : undefined} />
              </div>

              {/* モード選択 */}
              <PillSelect
                options={[
                  { value: 'normal', label: '時間指定' },
                  { value: 'allDay', label: '終日' },
                  { value: 'repeat', label: '繰り返し' },
                ]}
                value={mode}
                onChange={(v) => setMode(v as typeof mode)}
              />

              {/* 繰り返し曜日 */}
              {mode === 'repeat' && (
                <div>
                  <div className={labelClass} style={{ marginBottom: '6px', color: submitted && isRepeatDaysEmpty ? colors.danger : undefined }}>曜日</div>
                  <DayOfWeekPicker value={repeatDays} onChange={setRepeatDays} />
                </div>
              )}

              {/* 日時 */}
              {allDay ? (
                <div>
                  <div className={labelClass} style={{ marginBottom: '4px', color: submitted && isDateRangeInvalid ? colors.danger : undefined }}>期間</div>
                  <div className="flex items-center gap-2">
                    <Input type="date" value={startDateStr} onChange={(e) => { setStartDateStr(e.target.value); if (e.target.value > endDateStr) setEndDateStr(e.target.value) }} size="small" />
                    <span className="text-text-secondary text-sm">-</span>
                    <Input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} size="small" style={submitted && isDateRangeInvalid ? errorBorder : undefined} />
                  </div>
                </div>
              ) : mode === 'repeat' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div className={labelClass} style={{ marginBottom: '4px', color: submitted && isDateRangeInvalid ? colors.danger : undefined }}>期間</div>
                    <div className="flex items-center gap-2">
                      <Input type="date" value={startDateStr} onChange={(e) => { setStartDateStr(e.target.value); if (e.target.value > endDateStr) setEndDateStr(e.target.value) }} size="small" />
                      <span className="text-text-secondary text-sm">-</span>
                      <Input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} size="small" style={submitted && isDateRangeInvalid ? errorBorder : undefined} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ flex: 1 }}>
                      <div className={labelClass} style={{ marginBottom: '4px' }}>開始時刻</div>
                      <TimeSelect
                        value={startMin}
                        onChange={(m) => {
                          setStartMin(m)
                          if (endMin <= m) setEndMin(Math.min(m + 60, 24 * 60))
                        }}
                      />
                    </div>
                    <span className="text-text-secondary text-sm" style={{ marginTop: '20px' }}>-</span>
                    <div style={{ flex: 1 }}>
                      <div className={labelClass} style={{ marginBottom: '4px', color: submitted && isTimeInvalid ? colors.danger : undefined }}>
                        終了時刻
                      </div>
                      <TimeSelect value={endMin} onChange={setEndMin} error={submitted && isTimeInvalid} />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className={labelClass} style={{ marginBottom: '4px' }}>開始日時</div>
                  <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                    <Input type="date" value={startDateStr} onChange={(e) => { setStartDateStr(e.target.value); if (e.target.value > endDateStr) setEndDateStr(e.target.value) }} size="small" />
                    <TimeSelect
                      value={startMin}
                      onChange={(m) => {
                        setStartMin(m)
                        if (endMin <= m && startDateStr === endDateStr) setEndMin(Math.min(m + 60, 24 * 60))
                      }}
                    />
                  </div>
                  <div className={labelClass} style={{ marginBottom: '4px', color: submitted && (isTimeInvalid || isDateRangeInvalid) ? colors.danger : undefined }}>
                    終了日時
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} size="small" style={submitted && isDateRangeInvalid ? errorBorder : undefined} />
                    <TimeSelect value={endMin} onChange={setEndMin} error={submitted && isTimeInvalid} />
                  </div>
                </div>
              )}

              {/* アイコン */}
              <div>
                <div className={labelClass} style={{ marginBottom: '4px' }}>アイコン</div>
                <IconPicker value={icon} onChange={setIcon} />
              </div>

              {/* カラー */}
              <div>
                <div className={labelClass} style={{ marginBottom: '4px' }}>カラー</div>
                <ColorPicker value={color} onChange={setColor} allowCustom nowrap />
              </div>

              {/* 説明 */}
              <div>
                <div className={labelClass} style={{ marginBottom: '4px' }}>説明</div>
                <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="説明を追加" rows={4} size="small" />
              </div>
            </div>

            {submitted && validationErrors.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {validationErrors.map((msg) => (
                  <div key={msg} style={{ fontSize: '11px', color: colors.danger }}>※ {msg}</div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              {modal.editingEvent ? (
                <Button variant="danger" leftIcon="trash" onClick={handleDelete}>削除</Button>
              ) : <div />}
              <Button type="submit" variant="primary" leftIcon="save" >保存</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
