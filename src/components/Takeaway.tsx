import type {
  ReflectionResponse,
  Takeaway as TakeawayData,
  TakeawayPerItem,
} from '../aiClient'
import { AXIS_LABEL, AXIS_SIDE_LABEL } from '../fallback'

export function Takeaway({
  takeaway,
  reflections,
  onCopy,
  onReset,
  onBack,
  copied,
  source,
}: {
  takeaway: TakeawayData
  reflections: ReflectionResponse
  onCopy: () => void
  onReset: () => void
  onBack?: () => void
  copied: boolean
  source: 'ai' | 'fallback'
}) {
  const likePerItem = takeaway.perItem?.filter((p) => p.pole === 'like') ?? []
  const hardPerItem = takeaway.perItem?.filter((p) => p.pole === 'hard') ?? []

  // Pattern-break detection (理論§5.4 予測3): pole and axisSide don't align.
  // 好き なのに 外発・消耗側 (left) / 辛い なのに 内発・報酬側 (right)
  const discoveries = reflections.items.filter(
    (it) =>
      (it.pole === 'like' && it.axisSide === 'left') ||
      (it.pole === 'hard' && it.axisSide === 'right'),
  )
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
        {discoveries.length > 0 && (
          <DiscoveriesBlock items={discoveries} />
        )}

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

function DiscoveriesBlock({
  items,
}: {
  items: ReflectionResponse['items']
}) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-700">
        ⚡ 発見 — pole と軸位置のズレ
      </p>
      <p className="mb-3 text-xs text-slate-600 sm:text-sm">
        「好きなのに外発・消耗側」「辛いのに内発・報酬側」のように、
        単純な対応からはみ出した項目です。あなたの感覚と条件のあいだに、
        まだ言語化されていない変数が動いている可能性があります。
      </p>
      <ul className="space-y-2">
        {items.map((it, i) => {
          const tone = it.pole === 'like' ? '💚' : '💔'
          const expectedPolePos = it.pole === 'like' ? '内発・報酬側' : '外発・消耗側'
          const actualSideLabel =
            it.axisSide === 'left'
              ? AXIS_SIDE_LABEL[it.keyAxis].left
              : AXIS_SIDE_LABEL[it.keyAxis].right
          return (
            <li key={i} className="rounded-lg border border-indigo-100 bg-white/80 p-3">
              <p className="text-sm">
                <span aria-hidden="true">{tone}</span>
                <span className="ml-1 font-medium text-slate-800">{it.text}</span>
              </p>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                {it.pole === 'like' ? '好き' : '辛い'}なのに、{AXIS_LABEL[it.keyAxis]}軸では「{actualSideLabel}」側にいます。
                （単純な対応では{expectedPolePos}にいるはず）
              </p>
            </li>
          )
        })}
      </ul>
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
