import type { Takeaway as TakeawayData, TakeawayPerItem } from '../aiClient'

export function Takeaway({
  takeaway,
  onCopy,
  onReset,
  onBack,
  copied,
  source,
}: {
  takeaway: TakeawayData
  onCopy: () => void
  onReset: () => void
  onBack?: () => void
  copied: boolean
  source: 'ai' | 'fallback'
}) {
  const likePerItem = takeaway.perItem?.filter((p) => p.pole === 'like') ?? []
  const hardPerItem = takeaway.perItem?.filter((p) => p.pole === 'hard') ?? []
  return (
    <article
      id="take-card"
      className="mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50 shadow-lg"
    >
      <header className="border-b border-amber-100 px-5 py-4">
        <p className="text-center text-xs font-medium text-amber-700">
          ステップ4 · 持ち帰る
        </p>
        <h2 className="mt-0.5 text-center text-lg font-semibold text-slate-800">
          🪞 今日の気付き
        </h2>
      </header>
      <div className="space-y-5 px-5 py-5 text-sm leading-relaxed text-slate-700 sm:px-6 sm:py-6 sm:text-base">
        {(likePerItem.length > 0 || hardPerItem.length > 0) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {likePerItem.length > 0 && (
              <PerItemBlock
                tone="like"
                title="💚 好きへの返し"
                items={likePerItem}
              />
            )}
            {hardPerItem.length > 0 && (
              <PerItemBlock
                tone="hard"
                title="💔 辛いへの返し"
                items={hardPerItem}
              />
            )}
          </div>
        )}

        <div className="space-y-3">
          {takeaway.points.map((p, i) => (
            <TakePoint key={i} n={i + 1} title={p.title} body={p.body} />
          ))}
        </div>

        <div className="rounded-xl border border-amber-200 bg-white/80 p-4 text-sm leading-relaxed text-slate-700">
          {takeaway.personalNote}
        </div>
      </div>
      <footer className="flex flex-col gap-2 border-t border-amber-100 bg-amber-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {source === 'fallback' ? 'テンプレート気付き' : 'AI気付き（あなたの回答に基づく）'}
        </p>
        <div className="flex flex-wrap gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              意図を書き直す
            </button>
          )}
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 shadow-sm transition hover:bg-amber-50"
          >
            {copied ? 'コピーしました' : '気付きをコピー'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            もう一度
          </button>
        </div>
      </footer>
    </article>
  )
}

function TakePoint({
  n,
  title,
  body,
}: {
  n: number
  title: string
  body: string
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shadow">
        {n}
      </span>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-slate-700">{body}</p>
      </div>
    </div>
  )
}

function PerItemBlock({
  tone,
  title,
  items,
}: {
  tone: 'like' | 'hard'
  title: string
  items: TakeawayPerItem[]
}) {
  const palette =
    tone === 'like'
      ? 'border-emerald-200 bg-emerald-50/60'
      : 'border-rose-200 bg-rose-50/60'
  return (
    <div className={`rounded-xl border p-3 ${palette}`}>
      <h3 className="mb-2 text-xs font-semibold text-slate-800 sm:text-sm">
        {title}
      </h3>
      <ul className="space-y-2 text-xs sm:text-sm">
        {items.map((it, i) => (
          <li key={i}>
            <p className="font-medium text-slate-800">・{it.text}</p>
            <p className="ml-3 text-slate-700">{it.response}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
