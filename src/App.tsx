import { useMemo, useState } from 'react'
import './App.css'
import { StructureAnalysis } from './StructureAnalysis'
import {
  formatNarrativeAsText,
  formatStoryAsText,
  generateNarrative,
  generateStory,
  type Narrative,
  type Pole,
  type Story,
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
  const [showSelf, setShowSelf] = useState(false)
  const [copiedSelf, setCopiedSelf] = useState(false)

  const likeItems = useMemo(() => splitLines(like), [like])
  const hardItems = useMemo(() => splitLines(hard), [hard])

  const canInvert = likeItems.length > 0 || hardItems.length > 0
  const canSelf = likeItems.length > 0 || hardItems.length > 0

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

  const selfText = useMemo(() => {
    const renderBlock = (items: string[], pole: Pole) => {
      if (items.length === 0) return '（未入力）'
      return items
        .map((s) => {
          const st = generateStory(s, pole)
          return `・${s}\n${formatStoryAsText(st)}`
        })
        .join('\n\n')
    }
    const likeBlock = renderBlock(likeItems, 'like')
    const hardBlock = renderBlock(hardItems, 'hard')
    return `あなたはなぜそう感じているか\n\n💚 好きなこと\n${likeBlock}\n\n💔 やってて辛いこと\n${hardBlock}`
  }, [likeItems, hardItems])

  const scrollTo = (id: string) => {
    if (typeof window === 'undefined') return
    window.requestAnimationFrame(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleInvert = () => {
    if (!canInvert) return
    setShowCard(true)
    setCopied(false)
    scrollTo('invert-card')
  }

  const handleSelf = () => {
    if (!canSelf) return
    setShowSelf(true)
    setCopiedSelf(false)
    scrollTo('self-card')
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

  const handleCopySelf = async () => {
    try {
      await navigator.clipboard.writeText(selfText)
      setCopiedSelf(true)
      setTimeout(() => setCopiedSelf(false), 1800)
    } catch {
      setCopiedSelf(false)
    }
  }

  const handleReset = () => {
    setShowCard(false)
  }

  const handleResetSelf = () => {
    setShowSelf(false)
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

        <div className="mt-6 flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleInvert}
            disabled={!canInvert}
            className="rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-emerald-500 px-8 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🔄 反転する
          </button>
          <p className="text-xs text-slate-500">
            ステップ1 / 3 · まずは反転人間と出会う
          </p>
        </div>

        {showCard && (
          <>
            <article
              id="invert-card"
              className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
            >
              <header className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-rose-50 px-5 py-4">
                <p className="text-center text-xs font-medium text-slate-500">
                  ステップ1 · 気付き
                </p>
                <h2 className="mt-0.5 text-center text-lg font-semibold text-slate-800">
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

            {!showSelf && (
              <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <div>
                  <p className="text-xs font-medium text-indigo-600">
                    ステップ2 / 3 · 自己分析
                  </p>
                  <p className="mt-1 text-sm font-medium text-indigo-900 sm:text-base">
                    では、あなた自身はなぜそう感じているのか？
                  </p>
                  <p className="mt-1 text-xs text-indigo-700/80">
                    同じ軸で、自分の経緯を過去→積み重ね→現在の3段で紐解きます。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSelf}
                  disabled={!canSelf}
                  className="mt-3 w-full rounded-full border border-indigo-400 bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:mt-0 sm:w-auto"
                >
                  🔍 自分を紐解く →
                </button>
              </div>
            )}
          </>
        )}

        {showSelf && (
          <>
            <article
              id="self-card"
              className="mt-4 overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-lg"
            >
              <header className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 px-5 py-4">
                <p className="text-center text-xs font-medium text-indigo-600">
                  ステップ2 · 自己分析
                </p>
                <h2 className="mt-0.5 text-center text-lg font-semibold text-indigo-900">
                  あなたはなぜそう感じているか
                </h2>
                <p className="mt-1 text-center text-xs text-indigo-700/80">
                  環境・時間・文脈を中心に、過去→積み重ね→現在の3段で推定しています。
                </p>
              </header>
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <SelfBlock
                  tone="like"
                  pole="like"
                  title="💚 好きなこと"
                  items={likeItems}
                />
                <SelfBlock
                  tone="hard"
                  pole="hard"
                  title="💔 やってて辛いこと"
                  items={hardItems}
                />
              </div>
              <footer className="flex flex-col gap-2 border-t border-indigo-100 bg-indigo-50/40 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCopySelf}
                  className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {copiedSelf ? 'コピーしました' : '紐解き文をコピー'}
                </button>
                <button
                  type="button"
                  onClick={handleResetSelf}
                  className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  閉じる
                </button>
              </footer>
            </article>

            <Takeaway likeItems={likeItems} hardItems={hardItems} />
          </>
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

function SelfBlock({
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
              <StoryBlock story={generateStory(item, pole)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm italic opacity-60">（未入力）</p>
      )}
    </div>
  )
}

function StoryBlock({ story }: { story: Story }) {
  const STAGE_COLORS = [
    'bg-slate-100 text-slate-700',
    'bg-indigo-50 text-indigo-700',
    'bg-indigo-100 text-indigo-800',
  ]
  return (
    <div className="mt-2 ml-4 rounded-lg border border-indigo-100 bg-white/70 p-3 text-xs leading-relaxed text-slate-700 sm:text-sm">
      <ol className="space-y-2">
        {story.stages.map((st, i) => {
          const isLast = i === story.stages.length - 1
          return (
            <li key={i} className="flex gap-2">
              <span
                className={`mt-0.5 h-fit rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${STAGE_COLORS[i] ?? ''}`}
              >
                {st.tag}
              </span>
              <div className="flex-1">
                <p className="text-slate-700">{st.text}</p>
                {isLast && (
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                    <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-800">
                      {story.layer.label}
                    </span>
                    <span className="text-[10px] text-indigo-700">
                      {story.layer.title}
                    </span>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Takeaway({
  likeItems,
  hardItems,
}: {
  likeItems: string[]
  hardItems: string[]
}) {
  const sampleLike = likeItems[0]
  const sampleHard = hardItems[0]
  const hasBoth = Boolean(sampleLike && sampleHard)

  return (
    <article
      id="takeaway-card"
      className="mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 shadow-lg"
    >
      <header className="border-b border-amber-100 px-5 py-4">
        <p className="text-center text-xs font-medium text-amber-700">
          ステップ3 · 納得
        </p>
        <h2 className="mt-0.5 text-center text-lg font-semibold text-slate-800">
          🪞 ここまでの気づき
        </h2>
      </header>
      <div className="space-y-4 px-5 py-5 text-sm leading-relaxed text-slate-700 sm:px-6 sm:py-6 sm:text-base">
        <TakePoint
          n={1}
          title="同じ軸の上の別の極"
          body="反転人間とあなたは、別々の人間に見えて、実は同じ8軸の上に並んでいる。義務⇄好奇心 / 努力⇄没頭 / 苦労⇄フロー / 結果⇄過程。"
        />
        <TakePoint
          n={2}
          title="違いを作ったのは経緯"
          body="あなたと反転人間の違いは「人間の性分」ではなく、スキルの釣り合い・自律性・環境・時間の余白といった、出会った条件の差から来ている。"
        />
        <TakePoint
          n={3}
          title="反転は操作の選択肢"
          body="条件を一つでも整え直すと、同じ行為は別の極に滑らかに動く。反転は言葉遊びではなく、どの層を動かすかを選ぶ技術。"
        />

        {hasBoth && (
          <div className="rounded-xl border border-amber-200 bg-white/80 p-4 text-sm">
            <p className="text-slate-700">
              いま、あなたは
              <span className="mx-1 rounded-md bg-emerald-100 px-1.5 py-0.5 font-medium text-emerald-800">
                {sampleLike}
              </span>
              を愛し、
              <span className="mx-1 rounded-md bg-rose-100 px-1.5 py-0.5 font-medium text-rose-800">
                {sampleHard}
              </span>
              に消耗している。
            </p>
            <p className="mt-2 text-slate-700">
              でも、
              <span className="mx-1 rounded-md bg-rose-100 px-1.5 py-0.5 font-medium text-rose-800">
                {sampleLike}
              </span>
              を辛がる人も、
              <span className="mx-1 rounded-md bg-emerald-100 px-1.5 py-0.5 font-medium text-emerald-800">
                {sampleHard}
              </span>
              を愛する人も、同じ構造の別の位置にいるだけ。
            </p>
            <p className="mt-2 text-slate-600">
              違いは経緯で、あなた自身も明日、そちら側に一歩動ける。
            </p>
          </div>
        )}
      </div>
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

export default App
