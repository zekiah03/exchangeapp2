import {
  AXIS_ICON,
  LAYER_INFO,
  generateNarrative,
  type Narrative,
  type Pole,
} from '../generateNarrative'
import type { InvertResponse } from '../aiClient'
import { AIError, AILoading } from './AIStatus'

type InvertAIState = {
  status: 'loading' | 'ok' | 'error'
  like?: InvertResponse
  hard?: InvertResponse
  error?: string
}

export function InvertCard({
  likeItems,
  hardItems,
  invertAI,
  onCopy,
  onReset,
  onRetry,
  copied,
}: {
  likeItems: string[]
  hardItems: string[]
  invertAI: InvertAIState | null
  onCopy: () => void
  onReset: () => void
  onRetry: () => void
  copied: boolean
}) {
  return (
    <article
      id="invert-card"
      className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
    >
      <header className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-rose-50 px-5 py-4">
        <p className="text-center text-xs font-medium text-slate-500">
          ステップ2 · 気付き
        </p>
        <h2 className="mt-0.5 text-center text-lg font-semibold text-slate-800">
          こんな人間がいます
        </h2>
      </header>
      {invertAI?.status === 'loading' && (
        <AILoading label="反転人間の人生経緯をAIで生成中…" />
      )}
      {invertAI?.status === 'error' && (
        <AIError message={invertAI.error ?? '不明なエラー'} onRetry={onRetry} />
      )}
      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <InvertBlock
          tone="like"
          pole="like"
          title="💚 好きなこと"
          items={hardItems}
          aiItems={invertAI?.status === 'ok' ? invertAI.like?.items : undefined}
        />
        <InvertBlock
          tone="hard"
          pole="hard"
          title="💔 やってて辛いこと"
          items={likeItems}
          aiItems={invertAI?.status === 'ok' ? invertAI.hard?.items : undefined}
        />
      </div>
      <p className="px-5 pb-2 text-center text-xs text-slate-500 sm:px-6">
        {invertAI?.status === 'ok'
          ? 'AIが推定した反転人間の人生経緯を表示しています。'
          : '各項目の下に、構造分析の8軸×4層から推定した「経緯」を表示しています。'}
      </p>
      <footer className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          {copied ? 'コピーしました' : '紹介文をコピー'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          もう一度入力する
        </button>
      </footer>
    </article>
  )
}

function InvertBlock({
  tone,
  pole,
  title,
  items,
  aiItems,
}: {
  tone: 'like' | 'hard'
  pole: Pole
  title: string
  items: string[]
  aiItems?: InvertResponse['items']
}) {
  const palette =
    tone === 'like'
      ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
      : 'border-rose-200 bg-rose-50/60 text-rose-900'
  const aiByText = new Map<string, InvertResponse['items'][number]>()
  aiItems?.forEach((a) => aiByText.set(a.text.trim(), a))
  return (
    <div className={`rounded-xl border p-4 ${palette}`}>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {items.length > 0 ? (
        <ul className="space-y-3 text-sm leading-relaxed">
          {items.map((item, i) => {
            const ai = aiByText.get(item.trim())
            return (
              <li key={i}>
                <div className="flex gap-2 font-medium">
                  <span aria-hidden="true">・</span>
                  <span>{item}</span>
                </div>
                {ai ? (
                  <AINarrativeBlock ai={ai} />
                ) : (
                  <NarrativeBlock
                    narrative={generateNarrative(item, pole)}
                    tone={tone}
                  />
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm italic opacity-60">（未入力）</p>
      )}
    </div>
  )
}

function AINarrativeBlock({ ai }: { ai: InvertResponse['items'][number] }) {
  const layer = LAYER_INFO[ai.keyLayer]
  return (
    <div className="mt-2 ml-4 rounded-lg border border-slate-200 bg-white/80 p-3 text-xs leading-relaxed text-slate-700 sm:text-sm">
      <p className="mb-2 text-slate-800">{ai.backstory}</p>
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">
          {layer.label}
        </span>
        <span className="text-[11px] text-indigo-700">{layer.title}</span>
      </div>
      <p className="mb-2 text-slate-600">{ai.layerShift}</p>
      <ul className="space-y-1">
        {ai.conditions.map((c, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden="true">{AXIS_ICON[c.axis] ?? '·'}</span>
            <span>
              <span className="font-medium text-slate-800">{c.axis}</span>
              <span className="mx-1 text-slate-400">·</span>
              <span>{c.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function NarrativeBlock({
  narrative,
  tone,
}: {
  narrative: Narrative
  tone: 'like' | 'hard'
}) {
  const bg = tone === 'like' ? 'bg-white/70' : 'bg-white/70'
  return (
    <div
      className={`mt-2 ml-4 rounded-lg border border-slate-200 ${bg} p-3 text-xs leading-relaxed text-slate-700 sm:text-sm`}
    >
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">
          {narrative.layer.label}
        </span>
        <span className="text-[11px] text-indigo-700">
          {narrative.layer.title}
        </span>
      </div>
      <p className="mb-2 text-slate-600">{narrative.layer.shift}</p>
      <ul className="space-y-1">
        {narrative.axes.map((a) => (
          <li key={a.key} className="flex gap-2">
            <span aria-hidden="true">{a.icon}</span>
            <span>
              <span className="font-medium text-slate-800">{a.label}</span>
              <span className="mx-1 text-slate-400">·</span>
              <span>{a.narrative}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
