import { ScrollArea } from './ScrollArea'

export default {
  title: 'レイアウト/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
内部スクロールするペインのレイアウトプリミティブ。
「外枠は固定して中央だけスクロール」を 1 つの atom に集約する
(左ペイン Sidebar のナビ・ダイアログ本文・固定ヘッダ付きパネル等)。
\`flex-1 min-h-0 overflow-y-auto\` の手書きをやめてここに寄せる。`,
      },
    },
  },
}

// 固定ヘッダ + スクロールするペイン (左ペイン Sidebar と同じ構成)。
export const Default = {
  render: () => (
    <div className="flex h-72 w-64 flex-col rounded-lg border">
      <div className="border-b bg-gray-50 px-3 py-2 text-sm font-semibold">固定ヘッダ</div>
      <ScrollArea className="space-y-1 p-2">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="rounded bg-gray-100 px-3 py-2 text-sm">
            項目 {i + 1}
          </div>
        ))}
      </ScrollArea>
      <div className="border-t bg-gray-50 px-3 py-2 text-sm font-semibold">固定フッタ</div>
    </div>
  ),
}

// 横スクロール。
export const Horizontal = {
  render: () => (
    <ScrollArea axis="horizontal" fill={false} className="w-64 rounded-lg border p-2">
      <div className="flex gap-2">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="shrink-0 rounded bg-gray-100 px-4 py-6 text-sm">
            列 {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
