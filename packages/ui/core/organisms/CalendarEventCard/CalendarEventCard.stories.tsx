import { CalendarEventCard } from './CalendarEventCard'

export default {
  title: 'カレンダー/イベント/CalendarEventCard',
  component: CalendarEventCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'タイムライン表示とコンパクト表示の2モードを持つイベントカード。',
      },
    },
  },
}

const noop = () => {}

export const Timeline = {
  render: () => (
    <div style={{ position: 'relative', width: '400px', height: '300px' }}>
      <CalendarEventCard
        title="チームミーティング"
        startLabel="10:00"
        endLabel="11:00"
        top={0}
        height={80}
        color="#4f46e5"
      />
    </div>
  ),
}

export const TimelineWithIcon = {
  render: () => (
    <div style={{ position: 'relative', width: '400px', height: '300px' }}>
      <CalendarEventCard
        title="デザインレビュー"
        startLabel="14:00"
        endLabel="15:30"
        top={0}
        height={120}
        color="#059669"
        icon="palette"
      />
    </div>
  ),
}

export const TimelineOverlapping = {
  render: () => (
    <div style={{ position: 'relative', width: '400px', height: '300px' }}>
      <CalendarEventCard
        title="デザインレビュー"
        startLabel="14:00"
        endLabel="15:30"
        top={0}
        height={120}
        color="#059669"
        leftPercent={0}
        widthPercent={50}
      />
      <CalendarEventCard
        title="1on1"
        startLabel="14:30"
        endLabel="15:00"
        top={40}
        height={60}
        color="#dc2626"
        leftPercent={50}
        widthPercent={50}
        zColumn={1}
      />
    </div>
  ),
}

export const TimelineShort = {
  render: () => (
    <div style={{ position: 'relative', width: '400px', height: '200px' }}>
      <CalendarEventCard
        title="15分のクイックコール"
        startLabel="09:00"
        endLabel="09:15"
        top={0}
        height={14}
        color="#f59e0b"
      />
    </div>
  ),
}

export const TimelineDragging = {
  render: () => (
    <div style={{ position: 'relative', width: '400px', height: '200px' }}>
      <CalendarEventCard
        title="ドラッグ中のイベント"
        startLabel="09:00"
        endLabel="10:00"
        top={0}
        height={80}
        color="#4f46e5"
        isDragging
      />
    </div>
  ),
}

export const TimelineHovered = {
  render: () => (
    <div style={{ position: 'relative', width: '400px', height: '200px' }}>
      <CalendarEventCard
        title="ホバー中のイベント"
        startLabel="09:00"
        endLabel="10:00"
        top={0}
        height={80}
        color="#4f46e5"
        isHovered
      />
    </div>
  ),
}

export const TimelineWithDelete = {
  render: () => (
    <div style={{ position: 'relative', width: '400px', height: '200px' }}>
      <CalendarEventCard
        title="削除可能なイベント"
        startLabel="09:00"
        endLabel="10:00"
        top={0}
        height={80}
        color="#dc2626"
        onDelete={noop}
      />
    </div>
  ),
}

export const Compact = {
  render: () => (
    <div style={{ width: '200px' }}>
      <CalendarEventCard
        variant="compact"
        title="終日イベント"
        color="#8b5cf6"
      />
    </div>
  ),
}

export const CompactWithIcon = {
  render: () => (
    <div style={{ width: '200px' }}>
      <CalendarEventCard
        variant="compact"
        title="誕生日"
        color="#ec4899"
        icon="cake"
      />
    </div>
  ),
}

export const CompactWithDelete = {
  render: () => (
    <div style={{ width: '200px' }}>
      <CalendarEventCard
        variant="compact"
        title="削除可能なイベント"
        color="#f59e0b"
        onDelete={noop}
      />
    </div>
  ),
}

export const CompactDragging = {
  render: () => (
    <div style={{ width: '200px' }}>
      <CalendarEventCard
        variant="compact"
        title="ドラッグ中"
        color="#4f46e5"
        isDragging
      />
    </div>
  ),
}

export const CompactHovered = {
  render: () => (
    <div style={{ width: '200px' }}>
      <CalendarEventCard
        variant="compact"
        title="ホバー中"
        color="#059669"
        isHovered
      />
    </div>
  ),
}

export const ColorVariants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '200px' }}>
      {[
        { title: 'インディゴ', color: '#4f46e5' },
        { title: 'エメラルド', color: '#059669' },
        { title: 'レッド', color: '#dc2626' },
        { title: 'パープル', color: '#8b5cf6' },
        { title: 'アンバー', color: '#f59e0b' },
        { title: 'ピンク', color: '#ec4899' },
        { title: 'シアン', color: '#06b6d4' },
      ].map(({ title, color }) => (
        <CalendarEventCard
          key={color}
          variant="compact"
          title={title}
          color={color}
        />
      ))}
    </div>
  ),
}
