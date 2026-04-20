import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { SettingsDrawer } from './SettingsDrawer'
import { loadSettings, type AISettings } from './aiSettings'
import {
  generateInvertAI,
  generateSelfAI,
  generateTakeawayAI,
  type InvertResponse,
  type SelfResponse,
  type Takeaway as AITakeaway,
} from './aiClient'
import { Stepper } from './components/Stepper'
import { AnalysisDrawer } from './components/AnalysisDrawer'
import { InvertCard } from './components/InvertCard'
import { SelfCard } from './components/SelfCard'
import { Takeaway } from './components/Takeaway'
import { buildIntroText, buildSelfText } from './textFormat'

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

type InvertAIState = {
  status: 'loading' | 'ok' | 'error'
  like?: InvertResponse
  hard?: InvertResponse
  error?: string
}

type SelfAIState = {
  status: 'loading' | 'ok' | 'error'
  like?: SelfResponse
  hard?: SelfResponse
  takeaway?: AITakeaway
  error?: string
}

function App() {
  const [like, setLike] = useState('')
  const [hard, setHard] = useState('')
  const [showCard, setShowCard] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showSelf, setShowSelf] = useState(false)
  const [copiedSelf, setCopiedSelf] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<AISettings>(() => loadSettings())
  const [invertAI, setInvertAI] = useState<InvertAIState | null>(null)
  const [selfAI, setSelfAI] = useState<SelfAIState | null>(null)

  const likeItems = useMemo(() => splitLines(like), [like])
  const hardItems = useMemo(() => splitLines(hard), [hard])

  const canInvert = likeItems.length > 0 || hardItems.length > 0
  const canSelf = likeItems.length > 0 || hardItems.length > 0

  const scrollTo = (id: string) => {
    if (typeof window === 'undefined') return
    window.requestAnimationFrame(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const runInvertAI = async () => {
    if (!settings.apiKey) return
    setInvertAI({ status: 'loading' })
    try {
      const [likeRes, hardRes] = await Promise.all([
        hardItems.length > 0
          ? generateInvertAI(settings.apiKey, settings.model, hardItems, 'like')
          : Promise.resolve(undefined),
        likeItems.length > 0
          ? generateInvertAI(settings.apiKey, settings.model, likeItems, 'hard')
          : Promise.resolve(undefined),
      ])
      setInvertAI({ status: 'ok', like: likeRes, hard: hardRes })
    } catch (e) {
      setInvertAI({
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }

  const runSelfAI = async () => {
    if (!settings.apiKey) return
    setSelfAI({ status: 'loading' })
    try {
      const [likeRes, hardRes, takeaway] = await Promise.all([
        likeItems.length > 0
          ? generateSelfAI(settings.apiKey, settings.model, likeItems, 'like')
          : Promise.resolve(undefined),
        hardItems.length > 0
          ? generateSelfAI(settings.apiKey, settings.model, hardItems, 'hard')
          : Promise.resolve(undefined),
        generateTakeawayAI(settings.apiKey, settings.model, likeItems, hardItems),
      ])
      setSelfAI({ status: 'ok', like: likeRes, hard: hardRes, takeaway })
    } catch (e) {
      setSelfAI({
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }

  const handleInvert = () => {
    if (!canInvert) return
    setShowCard(true)
    setCopied(false)
    scrollTo('invert-card')
    if (settings.apiKey && !invertAI) {
      void runInvertAI()
    }
  }

  const handleSelf = () => {
    if (!canSelf) return
    setShowSelf(true)
    setCopiedSelf(false)
    scrollTo('self-card')
    if (settings.apiKey && !selfAI) {
      void runSelfAI()
    }
  }

  useEffect(() => {
    setInvertAI(null)
    setSelfAI(null)
  }, [like, hard, settings.apiKey, settings.model])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildIntroText(likeItems, hardItems))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const handleCopySelf = async () => {
    try {
      await navigator.clipboard.writeText(buildSelfText(likeItems, hardItems))
      setCopiedSelf(true)
      setTimeout(() => setCopiedSelf(false), 1800)
    } catch {
      setCopiedSelf(false)
    }
  }

  const reached = showSelf ? 4 : showCard ? 2 : 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/40 to-indigo-100/50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div className="text-left">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
              反転人間紹介アプリ
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              あなたが辛いと感じることを、好きだと感じる人間がどこかに実在する。
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowAnalysis(true)}
              className="whitespace-nowrap rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:text-sm"
              aria-haspopup="dialog"
              aria-expanded={showAnalysis}
            >
              📐 構造分析
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 sm:text-sm"
              aria-haspopup="dialog"
              aria-expanded={showSettings}
              title={settings.apiKey ? 'AIキー設定済み' : 'AIキー未設定（テンプレート生成）'}
            >
              ⚙️ 設定
              {settings.apiKey && (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle"
                />
              )}
            </button>
          </div>
        </header>

        <Stepper reached={reached} />

        <section
          aria-labelledby="input-heading"
          className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6"
        >
          <h2
            id="input-heading"
            className="mb-4 text-sm font-semibold text-slate-700 sm:text-base"
          >
            1. あなたの好きと辛いを入力
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="like-input"
                className="mb-2 block text-sm font-medium text-emerald-800"
              >
                💚 好きなこと
              </label>
              <textarea
                id="like-input"
                value={like}
                onChange={(e) => setLike(e.target.value)}
                placeholder={LIKE_PLACEHOLDER}
                rows={7}
                className="w-full resize-y rounded-lg border border-emerald-200 bg-emerald-50/40 px-3 py-2 text-base text-slate-800 placeholder-emerald-300 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                {likeItems.length} 項目 · 1行1つ
              </p>
            </div>
            <div>
              <label
                htmlFor="hard-input"
                className="mb-2 block text-sm font-medium text-rose-800"
              >
                💔 やってて辛いこと
              </label>
              <textarea
                id="hard-input"
                value={hard}
                onChange={(e) => setHard(e.target.value)}
                placeholder={HARD_PLACEHOLDER}
                rows={7}
                className="w-full resize-y rounded-lg border border-rose-200 bg-rose-50/40 px-3 py-2 text-base text-slate-800 placeholder-rose-300 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                {hardItems.length} 項目 · 1行1つ
              </p>
            </div>
          </div>
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
          <p className="text-xs text-slate-500">まず反転人間と出会う</p>
        </div>

        {showCard && (
          <>
            <InvertCard
              likeItems={likeItems}
              hardItems={hardItems}
              invertAI={invertAI}
              onCopy={handleCopy}
              onReset={() => setShowCard(false)}
              onRetry={runInvertAI}
              copied={copied}
            />

            {!showSelf && (
              <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <div>
                  <p className="text-xs font-medium text-indigo-600">
                    ステップ3 · 自己分析
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
            <SelfCard
              likeItems={likeItems}
              hardItems={hardItems}
              selfAI={selfAI}
              onCopy={handleCopySelf}
              onClose={() => setShowSelf(false)}
              onRetry={runSelfAI}
              copied={copiedSelf}
            />

            <Takeaway
              likeItems={likeItems}
              hardItems={hardItems}
              ai={selfAI?.status === 'ok' ? selfAI.takeaway : undefined}
            />
          </>
        )}

        <footer className="mt-12 text-center text-xs text-slate-400">
          同じ行為でも、名前の付け方で意味は反転する。
        </footer>
      </div>

      {showAnalysis && (
        <AnalysisDrawer onClose={() => setShowAnalysis(false)} />
      )}
      {showSettings && (
        <SettingsDrawer
          onClose={() => setShowSettings(false)}
          onSaved={(s) => setSettings(s)}
        />
      )}
    </div>
  )
}

export default App
