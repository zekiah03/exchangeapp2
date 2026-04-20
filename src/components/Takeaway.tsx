import type { Takeaway as TakeawayData } from '../aiClient'

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
  return (
    <article
      id="take-card"
      className="mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 shadow-lg"
    >
      <header className="border-b border-amber-100 px-5 py-4">
        <p className="text-center text-xs font-medium text-amber-700">
          ステップ4 · 持ち帰る
        </p>
        <h2 className="mt-0.5 text-center text-lg font-semibold text-slate-800">
          🪞 今日の気付き
        </h2>
      </header>
      <div className="space-y-4 px-5 py-5 text-sm leading-relaxed text-slate-700 sm:px-6 sm:py-6 sm:text-base">
        {takeaway.points.map((p, i) => (
          <TakePoint key={i} n={i + 1} title={p.title} body={p.body} />
        ))}

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
