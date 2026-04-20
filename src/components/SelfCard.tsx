import {
  LAYER_INFO,
  generateStory,
  type Pole,
  type Story,
} from '../generateNarrative'
import type { SelfResponse } from '../aiClient'
import { AIError, AILoading } from './AIStatus'

type SelfAIState = {
  status: 'loading' | 'ok' | 'error'
  like?: SelfResponse
  hard?: SelfResponse
  error?: string
}

export function SelfCard({
  likeItems,
  hardItems,
  selfAI,
  onCopy,
  onClose,
  onRetry,
  copied,
}: {
  likeItems: string[]
  hardItems: string[]
  selfAI: SelfAIState | null
  onCopy: () => void
  onClose: () => void
  onRetry: () => void
  copied: boolean
}) {
  return (
    <article
      id="self-card"
      className="mt-4 overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-lg"
    >
      <header className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 px-5 py-4">
        <p className="text-center text-xs font-medium text-indigo-600">
          ステップ3 · 自己分析
        </p>
        <h2 className="mt-0.5 text-center text-lg font-semibold text-indigo-900">
          あなたはなぜそう感じているか
        </h2>
        <p className="mt-1 text-center text-xs text-indigo-700/80">
          環境・時間・文脈を中心に、過去→積み重ね→現在の3段で推定しています。
        </p>
      </header>
      {selfAI?.status === 'loading' && (
        <AILoading label="あなたの経緯をAIで紐解き中…" />
      )}
      {selfAI?.status === 'error' && (
        <AIError message={selfAI.error ?? '不明なエラー'} onRetry={onRetry} />
      )}
      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <SelfBlock
          tone="like"
          pole="like"
          title="💚 好きなこと"
          items={likeItems}
          aiItems={selfAI?.status === 'ok' ? selfAI.like?.items : undefined}
        />
        <SelfBlock
          tone="hard"
          pole="hard"
          title="💔 やってて辛いこと"
          items={hardItems}
          aiItems={selfAI?.status === 'ok' ? selfAI.hard?.items : undefined}
        />
      </div>
      <footer className="flex flex-col gap-2 border-t border-indigo-100 bg-indigo-50/40 px-5 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {copied ? 'コピーしました' : '紐解き文をコピー'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          閉じる
        </button>
      </footer>
    </article>
  )
}

function SelfBlock({
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
  aiItems?: SelfResponse['items']
}) {
  const palette =
    tone === 'like'
      ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
      : 'border-rose-200 bg-rose-50/60 text-rose-900'
  const aiByText = new Map<string, SelfResponse['items'][number]>()
  aiItems?.forEach((a) => aiByText.set(a.text.trim(), a))
  return (
    <div className={`rounded-xl border p-4 ${palette}`}>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {items.length > 0 ? (
        <ul className="space-y-3 text-sm leading-relaxed">
          {items.map((item, i) => {
            const ai = aiByText.get(item.trim())
            const story: Story = ai
              ? {
                  layer: {
                    key: ai.keyLayer,
                    label: LAYER_INFO[ai.keyLayer].label,
                    title: LAYER_INFO[ai.keyLayer].title,
                  },
                  stages: ai.stages.map((s) => ({ tag: s.tag, text: s.text })),
                }
              : generateStory(item, pole)
            return (
              <li key={i}>
                <div className="flex gap-2 font-medium">
                  <span aria-hidden="true">・</span>
                  <span>{item}</span>
                </div>
                <StoryBlock story={story} />
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
