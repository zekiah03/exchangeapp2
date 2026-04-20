import { useMemo, useState } from 'react'
import './App.css'
import { StructureAnalysis } from './StructureAnalysis'
import {
  formatNarrativeAsText,
  generateNarrative,
  type Narrative,
  type Pole,
} from './generateNarrative'

type TabKey = 'like' | 'hard' | 'analysis'

const LIKE_PLACEHOLDER = `絵を描くこと
細かい仕様書を読むこと
長距離を走ること`

const HARD_PLACEHOLDER = `人前で話すこと
同じ作業の繰り返し
数字を扱うこと`

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function App() {
  const [tab, setTab] = useState<TabKey>('like')
  const [like, setLike] = useState('')
  const [hard, setHard] = useState('')
  const [showCard, setShowCard] = useState(false)
  const [copied, setCopied] = useState(false)

  const likeItems = useMemo(() => splitLines(like), [like])
  const hardItems = useMemo(() => splitLines(hard), [hard])

  const canInvert = likeItems.length > 0 || hardItems.length > 0

  const introText = useMemo(() => {
    const renderBlock = (items: string[], pole: Pole) => {
      if (items.length === 0) return '（未入力）'
      return items
        .map((s) => {
          const n = generateNarrative(s, pole)
          return `・${s}\n${formatNarrativeAsText(n)}`
        })
        .join('\n\n')
    }
    const likeBlock = renderBlock(hardItems, 'like')
    const hardBlock = renderBlock(likeItems, 'hard')
    return `こんな人間がいます\n\n💚 好きなこと\n${likeBlock}\n\n💔 やってて辛いこと\n${hardBlock}`
  }, [likeItems, hardItems])

  const handleInvert = () => {
    if (!canInvert) return
    setShowCard(true)
    setCopied(false)
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const el = document.getElementById('invert-card')
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(introText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const handleReset = () => {
    setShowCard(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/40 to-indigo-100/50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
            反転人間紹介アプリ
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            あなたが辛いと感じることを、好きだと感じる人間がどこかに実在する。
          </p>
        </header>

        <nav
          role="tablist"
          aria-label="入力タブ"
          className="flex gap-1 rounded-xl border border-slate-200 bg-white/70 p-1 shadow-sm backdrop-blur"
        >
          <TabButton
            active={tab === 'like'}
            onClick={() => setTab('like')}
            activeClass="bg-emerald-100 text-emerald-800 shadow-sm"
            id="tab-like"
            controls="panel-like"
          >
            💚 好きなこと
          </TabButton>
          <TabButton
            active={tab === 'hard'}
            onClick={() => setTab('hard')}
            activeClass="bg-rose-100 text-rose-800 shadow-sm"
            id="tab-hard"
            controls="panel-hard"
          >
            💔 辛いこと
          </TabButton>
          <TabButton
            active={tab === 'analysis'}
            onClick={() => setTab('analysis')}
            activeClass="bg-indigo-100 text-indigo-800 shadow-sm"
            id="tab-analysis"
            controls="panel-analysis"
          >
            📐 構造分析
          </TabButton>
        </nav>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
          {tab === 'like' && (
            <Panel id="panel-like" labelledBy="tab-like">
              <label
                htmlFor="like-input"
                className="mb-2 block text-sm font-medium text-emerald-800"
              >
                あなたの好きなこと（1行1項目）
              </label>
              <textarea
                id="like-input"
                value={like}
                onChange={(e) => setLike(e.target.value)}
                placeholder={LIKE_PLACEHOLDER}
                rows={8}
                className="w-full resize-y rounded-lg border border-emerald-200 bg-emerald-50/40 px-3 py-2 text-base text-slate-800 placeholder-emerald-300 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="mt-2 text-xs text-slate-500">
                {likeItems.length} 項目
              </p>
            </Panel>
          )}

          {tab === 'hard' && (
            <Panel id="panel-hard" labelledBy="tab-hard">
              <label
                htmlFor="hard-input"
                className="mb-2 block text-sm font-medium text-rose-800"
              >
                やってて辛いこと（1行1項目）
              </label>
              <textarea
                id="hard-input"
                value={hard}
                onChange={(e) => setHard(e.target.value)}
                placeholder={HARD_PLACEHOLDER}
                rows={8}
                className="w-full resize-y rounded-lg border border-rose-200 bg-rose-50/40 px-3 py-2 text-base text-slate-800 placeholder-rose-300 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
              />
              <p className="mt-2 text-xs text-slate-500">
                {hardItems.length} 項目
              </p>
            </Panel>
          )}

          {tab === 'analysis' && (
            <Panel id="panel-analysis" labelledBy="tab-analysis">
              <StructureAnalysis />
            </Panel>
          )}
        </section>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleInvert}
            disabled={!canInvert}
            className="rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            反転する
          </button>
        </div>

        {showCard && (
          <article
            id="invert-card"
            className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
          >
            <header className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-rose-50 px-5 py-4">
              <h2 className="text-center text-lg font-semibold text-slate-800">
                こんな人間がいます
              </h2>
            </header>
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <InvertBlock
                tone="like"
                pole="like"
                title="💚 好きなこと"
                items={hardItems}
              />
              <InvertBlock
                tone="hard"
                pole="hard"
                title="💔 やってて辛いこと"
                items={likeItems}
              />
            </div>
            <p className="px-5 pb-2 text-center text-xs text-slate-500 sm:px-6">
              各項目の下に、構造分析の8軸×4層から推定した「経緯」を表示しています。
            </p>
            <footer className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                {copied ? 'コピーしました' : '紹介文をコピー'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                もう一度入力する
              </button>
            </footer>
          </article>
        )}

        <footer className="mt-12 text-center text-xs text-slate-400">
          同じ行為でも、名前の付け方で意味は反転する。
        </footer>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  activeClass,
  children,
  id,
  controls,
}: {
  active: boolean
  onClick: () => void
  activeClass: string
  children: React.ReactNode
  id: string
  controls: string
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-controls={controls}
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition sm:text-base ${
        active ? activeClass : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}

function Panel({
  id,
  labelledBy,
  children,
}: {
  id: string
  labelledBy: string
  children: React.ReactNode
}) {
  return (
    <div role="tabpanel" id={id} aria-labelledby={labelledBy}>
      {children}
    </div>
  )
}

function InvertBlock({
  tone,
  pole,
  title,
  items,
}: {
  tone: 'like' | 'hard'
  pole: Pole
  title: string
  items: string[]
}) {
  const palette =
    tone === 'like'
      ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
      : 'border-rose-200 bg-rose-50/60 text-rose-900'
  return (
    <div className={`rounded-xl border p-4 ${palette}`}>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {items.length > 0 ? (
        <ul className="space-y-3 text-sm leading-relaxed">
          {items.map((item, i) => (
            <li key={i}>
              <div className="flex gap-2 font-medium">
                <span aria-hidden="true">・</span>
                <span>{item}</span>
              </div>
              <NarrativeBlock
                narrative={generateNarrative(item, pole)}
                tone={tone}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm italic opacity-60">（未入力）</p>
      )}
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

export default App
