import { useMemo, useState } from 'react'
import './App.css'
import { SettingsDrawer } from './SettingsDrawer'
import { loadSettings, type AISettings } from './aiSettings'
import {
  generateQuestionsAI,
  generateReflectionAI,
  generateTakeawayAI,
  type AnsweredItem,
  type IntentionItem,
  type ItemReflection,
  type NextStep,
  type QuestionsResponse,
  type ReflectionResponse,
  type Takeaway as TakeawayData,
} from './aiClient'
import {
  buildFallbackQuestions,
  buildFallbackReflections,
  buildFallbackTakeaway,
  type PoleItems,
} from './fallback'
import { Stepper } from './components/Stepper'
import { AILoading, AIError } from './components/AIStatus'
import { QuestionSheet } from './components/QuestionSheet'
import {
  EMPTY_ANSWER,
  itemKey,
  type AnswerValue,
  type AnswersByItem,
} from './items'
import { ReflectionCard } from './components/ReflectionCard'
import { Takeaway } from './components/Takeaway'
import {
  IntentionSheet,
  type IntentionsByItem,
} from './components/IntentionSheet'
import { Logo } from './Logo'
import { Intro } from './components/Intro'

type Step = 'words' | 'ask' | 'see' | 'take'
type Source = 'ai' | 'fallback'

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

type Stage<T> = {
  data: T | null
  source: Source | null
  loading: boolean
  error: string | null
}

const EMPTY_STAGE = Object.freeze({
  data: null,
  source: null,
  loading: false,
  error: null,
}) as Stage<never>

function freshStage<T>(): Stage<T> {
  return EMPTY_STAGE as Stage<T>
}

function isEmpty<T>(s: Stage<T>): boolean {
  return s.data === null && !s.loading && s.source === null && s.error === null
}

function App() {
  const [like, setLike] = useState('')
  const [hard, setHard] = useState('')
  const [step, setStep] = useState<Step>('words')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<AISettings>(() => loadSettings())

  const [questions, setQuestions] = useState<Stage<QuestionsResponse>>(freshStage)
  const [answers, setAnswers] = useState<AnswersByItem>({})
  const [reflections, setReflections] = useState<Stage<ReflectionResponse>>(freshStage)
  const [intentions, setIntentions] = useState<IntentionsByItem>({})
  const [nextStep, setNextStep] = useState<AnswerValue>(EMPTY_ANSWER)
  const [takeaway, setTakeaway] = useState<Stage<TakeawayData>>(freshStage)
  const [takeawayPhase, setTakeawayPhase] = useState<'plan' | 'received'>('plan')

  const [copiedReflection, setCopiedReflection] = useState(false)
  const [copiedTakeaway, setCopiedTakeaway] = useState(false)

  const likeItems = useMemo(() => splitLines(like), [like])
  const hardItems = useMemo(() => splitLines(hard), [hard])
  const poleItems: PoleItems = useMemo(
    () => ({ like: likeItems, hard: hardItems }),
    [likeItems, hardItems],
  )
  const canStart = likeItems.length > 0 || hardItems.length > 0

  const resetFlow = () => {
    if (
      isEmpty(questions) &&
      isEmpty(reflections) &&
      isEmpty(takeaway) &&
      step === 'words'
    ) {
      return
    }
    setQuestions(freshStage())
    setAnswers({})
    setReflections(freshStage())
    setIntentions({})
    setNextStep(EMPTY_ANSWER)
    setTakeaway(freshStage())
    setTakeawayPhase('plan')
    setStep('words')
  }

  const handleLikeChange = (v: string) => {
    setLike(v)
    resetFlow()
  }

  const handleHardChange = (v: string) => {
    setHard(v)
    resetFlow()
  }

  const handleSettingsSaved = (s: AISettings) => {
    setSettings(s)
    resetFlow()
  }

  const scrollTo = (id: string) => {
    if (typeof window === 'undefined') return
    window.requestAnimationFrame(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const runQuestions = async () => {
    if (questions.data) return
    if (!settings.apiKey) {
      setQuestions({
        data: buildFallbackQuestions(poleItems),
        source: 'fallback',
        loading: false,
        error: null,
      })
      return
    }
    setQuestions({ data: null, source: null, loading: true, error: null })
    try {
      const data = await generateQuestionsAI(settings.apiKey, settings.model, poleItems)
      setQuestions({ data, source: 'ai', loading: false, error: null })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setQuestions({
        data: buildFallbackQuestions(poleItems),
        source: 'fallback',
        loading: false,
        error: msg,
      })
    }
  }

  const buildAnswered = (q: QuestionsResponse): AnsweredItem[] =>
    q.items.map((it) => {
      const k = itemKey(it.pole, it.text)
      const arr = answers[k] ?? []
      return {
        text: it.text,
        pole: it.pole,
        answers: it.questions.map((qq, qi) => {
          const v = arr[qi] ?? EMPTY_ANSWER
          return {
            axis: qq.axis,
            question: qq.question,
            selectedOption: v.option,
            note: v.note,
          }
        }),
      }
    })

  const runReflections = async (q: QuestionsResponse) => {
    const answered = buildAnswered(q)
    if (!settings.apiKey) {
      setReflections({
        data: buildFallbackReflections(answered),
        source: 'fallback',
        loading: false,
        error: null,
      })
      return answered
    }
    setReflections({ data: null, source: null, loading: true, error: null })
    try {
      const data = await generateReflectionAI(settings.apiKey, settings.model, answered)
      setReflections({ data, source: 'ai', loading: false, error: null })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setReflections({
        data: buildFallbackReflections(answered),
        source: 'fallback',
        loading: false,
        error: msg,
      })
    }
    return answered
  }

  const buildIntentionItems = (): IntentionItem[] => {
    const out: IntentionItem[] = []
    for (const t of likeItems) {
      const v = intentions[itemKey('like', t)]
      if (v) out.push({ text: t, pole: 'like', option: v.option, note: v.note })
      else out.push({ text: t, pole: 'like', option: '', note: '' })
    }
    for (const t of hardItems) {
      const v = intentions[itemKey('hard', t)]
      if (v) out.push({ text: t, pole: 'hard', option: v.option, note: v.note })
      else out.push({ text: t, pole: 'hard', option: '', note: '' })
    }
    return out
  }

  const runTakeaway = async (
    answered: AnsweredItem[],
    refs: ItemReflection[],
    intentionItems: IntentionItem[],
    step: NextStep,
  ) => {
    if (!settings.apiKey) {
      setTakeaway({
        data: buildFallbackTakeaway(answered, refs, intentionItems, step),
        source: 'fallback',
        loading: false,
        error: null,
      })
      return
    }
    setTakeaway({ data: null, source: null, loading: true, error: null })
    try {
      const data = await generateTakeawayAI(
        settings.apiKey,
        settings.model,
        answered,
        refs,
        intentionItems,
        step,
      )
      setTakeaway({ data, source: 'ai', loading: false, error: null })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setTakeaway({
        data: buildFallbackTakeaway(answered, refs, intentionItems, step),
        source: 'fallback',
        loading: false,
        error: msg,
      })
    }
  }

  const handleStart = () => {
    if (!canStart) return
    setStep('ask')
    scrollTo('ask-card')
    void runQuestions()
  }

  const handleAnswerChange = (
    key: string,
    qIndex: number,
    partial: Partial<AnswerValue>,
  ) => {
    setAnswers((prev) => {
      const arr = (prev[key] ?? []).slice()
      const current = arr[qIndex] ?? EMPTY_ANSWER
      arr[qIndex] = {
        option: partial.option ?? current.option,
        note: partial.note ?? current.note,
      }
      return { ...prev, [key]: arr }
    })
    if (reflections.data) setReflections(freshStage())
    if (takeaway.data) setTakeaway(freshStage())
  }

  const handleProceedToSee = async () => {
    if (!questions.data) return
    setStep('see')
    scrollTo('see-card')
    setCopiedReflection(false)
    if (!reflections.data) {
      await runReflections(questions.data)
    }
  }

  const handleProceedToTake = () => {
    if (!questions.data || !reflections.data) return
    setStep('take')
    setTakeawayPhase('plan')
    scrollTo('take-card')
  }

  const handleIntentionChange = (
    key: string,
    partial: Partial<AnswerValue>,
  ) => {
    setIntentions((prev) => {
      const current = prev[key] ?? EMPTY_ANSWER
      return {
        ...prev,
        [key]: {
          option: partial.option ?? current.option,
          note: partial.note ?? current.note,
        },
      }
    })
    if (takeaway.data) setTakeaway(freshStage())
  }

  const handleNextStepChange = (partial: Partial<AnswerValue>) => {
    setNextStep((prev) => ({
      option: partial.option ?? prev.option,
      note: partial.note ?? prev.note,
    }))
    if (takeaway.data) setTakeaway(freshStage())
  }

  const handleReceiveTakeaway = async () => {
    if (!questions.data || !reflections.data) return
    setCopiedTakeaway(false)
    setTakeawayPhase('received')
    scrollTo('take-card')
    if (!takeaway.data) {
      const answered = buildAnswered(questions.data)
      await runTakeaway(
        answered,
        reflections.data.items,
        buildIntentionItems(),
        nextStep,
      )
    }
  }

  const handleBackToPlan = () => {
    setTakeawayPhase('plan')
    scrollTo('take-card')
  }

  const handleBackToWords = () => {
    setStep('words')
    scrollTo('input-heading')
  }

  const handleBackToAsk = () => {
    setStep('ask')
    scrollTo('ask-card')
  }

  const handleReset = () => {
    setStep('words')
    setQuestions(freshStage())
    setAnswers({})
    setReflections(freshStage())
    setIntentions({})
    setNextStep(EMPTY_ANSWER)
    setTakeaway(freshStage())
    setTakeawayPhase('plan')
    scrollTo('input-heading')
  }

  const buildReflectionCopy = (r: ReflectionResponse): string => {
    const blocks = r.items.map((it) => {
      const tone = it.pole === 'like' ? '💚' : '💔'
      return `${tone} ${it.text}\n  ${it.reflection}\n  🔄 ${it.inversion}`
    })
    return `教えてくれたことから、見えてくること\n\n${blocks.join('\n\n')}`
  }

  const buildTakeawayCopy = (t: TakeawayData): string => {
    const points = t.points
      .map((p, i) => `${i + 1}. ${p.title}\n   ${p.body}`)
      .join('\n\n')
    return `今日の気付き\n\n${points}\n\n${t.personalNote}`
  }

  const handleCopyReflection = async () => {
    if (!reflections.data) return
    try {
      await navigator.clipboard.writeText(buildReflectionCopy(reflections.data))
      setCopiedReflection(true)
      setTimeout(() => setCopiedReflection(false), 1800)
    } catch {
      setCopiedReflection(false)
    }
  }

  const handleCopyTakeaway = async () => {
    if (!takeaway.data) return
    try {
      await navigator.clipboard.writeText(buildTakeawayCopy(takeaway.data))
      setCopiedTakeaway(true)
      setTimeout(() => setCopiedTakeaway(false), 1800)
    } catch {
      setCopiedTakeaway(false)
    }
  }

  const stepNum = step === 'words' ? 1 : step === 'ask' ? 2 : step === 'see' ? 3 : 4

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/40 to-indigo-100/50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div className="text-left">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                反転
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                自分の中の別の位置を見にいく
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:text-sm"
            aria-haspopup="dialog"
            aria-expanded={showSettings}
            title={settings.apiKey ? 'AIキー設定済み' : 'AIキー未設定（テンプレート生成）'}
          >
            <span aria-hidden="true">⚙️</span>
            <span className="ml-1">設定</span>
            {settings.apiKey && (
              <span
                aria-hidden="true"
                className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle"
              />
            )}
          </button>
        </header>

        {step === 'words' && <Intro />}

        <Stepper reached={stepNum} />

        <section
          aria-labelledby="input-heading"
          className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6"
        >
          <h2
            id="input-heading"
            className="mb-4 text-sm font-semibold text-slate-700 sm:text-base"
          >
            ① ことば — 好きと辛いを書きだす
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
                onChange={(e) => handleLikeChange(e.target.value)}
                placeholder={LIKE_PLACEHOLDER}
                rows={6}
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
                onChange={(e) => handleHardChange(e.target.value)}
                placeholder={HARD_PLACEHOLDER}
                rows={6}
                className="w-full resize-y rounded-lg border border-rose-200 bg-rose-50/40 px-3 py-2 text-base text-slate-800 placeholder-rose-300 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                {hardItems.length} 項目 · 1行1つ
              </p>
            </div>
          </div>
        </section>

        {step === 'words' && (
          <div className="mt-6 flex flex-col items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className="rounded-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 px-8 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              🎙 きかれてみる
            </button>
            <p className="text-xs text-slate-500">
              {canStart
                ? '次のステップで、AIが選択肢つきの質問を返してきます。'
                : 'まず「好き」か「辛い」のどちらかに1行でも書くと進めます。'}
            </p>
          </div>
        )}

        {step !== 'words' && questions.loading && (
          <article className="mt-8 rounded-2xl border border-indigo-200 bg-white p-2 shadow-lg">
            <AILoading label="あなたへの質問を組み立てています…" />
          </article>
        )}

        {step !== 'words' && questions.data && (
          <>
            {step === 'ask' && (
              <>
                {questions.error && (
                  <div className="mt-6">
                    <AIError
                      message={questions.error}
                      onRetry={() => {
                        setQuestions(freshStage())
                        void runQuestions()
                      }}
                    />
                  </div>
                )}
                <QuestionSheet
                  questions={questions.data}
                  answers={answers}
                  onAnswerChange={handleAnswerChange}
                  onProceed={handleProceedToSee}
                  onBack={handleBackToWords}
                  proceedLabel="見にいく →"
                  source={questions.source ?? 'fallback'}
                />
              </>
            )}

            {(step === 'see' || step === 'take') && reflections.loading && (
              <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                <AILoading label="教えてくれたことから、反射を組み立てています…" />
              </article>
            )}

            {step === 'see' && reflections.data && (
              <>
                {reflections.error && (
                  <div className="mt-6">
                    <AIError
                      message={reflections.error}
                      onRetry={() => {
                        setReflections(freshStage())
                        if (questions.data) void runReflections(questions.data)
                      }}
                    />
                  </div>
                )}
                <ReflectionCard
                  reflections={reflections.data}
                  onCopy={handleCopyReflection}
                  onProceed={handleProceedToTake}
                  onBack={handleBackToAsk}
                  copied={copiedReflection}
                  source={reflections.source ?? 'fallback'}
                />
              </>
            )}

            {step === 'take' && reflections.data && takeawayPhase === 'plan' && (
              <IntentionSheet
                likeItems={likeItems}
                hardItems={hardItems}
                intentions={intentions}
                nextStep={nextStep}
                onIntentionChange={handleIntentionChange}
                onNextStepChange={handleNextStepChange}
                onProceed={handleReceiveTakeaway}
                onBack={handleBackToAsk}
              />
            )}

            {step === 'take' && reflections.data && takeawayPhase === 'received' && (
              <>
                {takeaway.loading && (
                  <article className="mt-8 rounded-2xl border border-amber-200 bg-white p-2 shadow-lg">
                    <AILoading label="気付きを組み立てています…" />
                  </article>
                )}
                {takeaway.error && (
                  <div className="mt-4">
                    <AIError
                      message={takeaway.error}
                      onRetry={() => {
                        setTakeaway(freshStage())
                        if (questions.data && reflections.data) {
                          const answered = buildAnswered(questions.data)
                          void runTakeaway(
                            answered,
                            reflections.data.items,
                            buildIntentionItems(),
                            nextStep,
                          )
                        }
                      }}
                    />
                  </div>
                )}
                {takeaway.data && (
                  <Takeaway
                    takeaway={takeaway.data}
                    onCopy={handleCopyTakeaway}
                    onReset={handleReset}
                    onBack={handleBackToPlan}
                    copied={copiedTakeaway}
                    source={takeaway.source ?? 'fallback'}
                  />
                )}
              </>
            )}
          </>
        )}

        <footer className="mt-12 flex flex-col items-center gap-2 text-center text-xs text-slate-400">
          <Logo size={20} />
          <p>反転は別人の話ではなく、同じ軸の別の位置にいる、あなた自身。</p>
        </footer>
      </div>

      {showSettings && (
        <SettingsDrawer
          onClose={() => setShowSettings(false)}
          onSaved={handleSettingsSaved}
        />
      )}
    </div>
  )
}

export default App
