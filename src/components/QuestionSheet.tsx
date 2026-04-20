import type { QuestionsResponse } from '../aiClient'
import {
  EMPTY_ANSWER,
  isAnswered,
  itemKey,
  type AnswerValue,
  type AnswersByItem,
} from '../items'

export function QuestionSheet({
  questions,
  answers,
  onAnswerChange,
  onProceed,
  onBack,
  proceedLabel,
  source,
}: {
  questions: QuestionsResponse
  answers: AnswersByItem
  onAnswerChange: (
    key: string,
    qIndex: number,
    partial: Partial<AnswerValue>,
  ) => void
  onProceed: () => void
  onBack: () => void
  proceedLabel: string
  source: 'ai' | 'fallback'
}) {
  const totalAnswered = Object.values(answers).reduce(
    (n, arr) => n + arr.filter(isAnswered).length,
    0,
  )
  return (
    <article
      id="ask-card"
      className="mt-8 overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-lg"
    >
      <header className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 px-5 py-4">
        <p className="text-center text-xs font-medium text-indigo-600">
          ステップ2 · きく
        </p>
        <h2 className="mt-0.5 text-center text-lg font-semibold text-indigo-900">
          少しだけ、教えてください
        </h2>
        <p className="mt-1 text-center text-xs text-indigo-700/80">
          選択肢を選ぶだけでOK。補足は任意。空のまま進めます。
        </p>
      </header>

      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        {questions.items.map((it) => {
          const k = itemKey(it.pole, it.text)
          const palette =
            it.pole === 'like'
              ? 'border-emerald-200 bg-emerald-50/40'
              : 'border-rose-200 bg-rose-50/40'
          const tone = it.pole === 'like' ? '💚' : '💔'
          return (
            <section key={k} className={`rounded-xl border p-4 ${palette}`}>
              <div className="mb-3 flex items-baseline gap-2">
                <span aria-hidden="true">{tone}</span>
                <h3 className="text-sm font-semibold text-slate-800 sm:text-base">
                  {it.text}
                </h3>
              </div>
              <ul className="space-y-4">
                {it.questions.map((q, qi) => {
                  const value = answers[k]?.[qi] ?? EMPTY_ANSWER
                  const noteId = `${k}__${qi}__note`
                  return (
                    <li key={qi}>
                      <p className="mb-2 text-sm font-medium text-slate-700">
                        {q.question}
                      </p>
                      <div
                        role="group"
                        aria-label="選択肢"
                        className="mb-2 flex flex-wrap gap-1.5"
                      >
                        {q.options.map((opt) => {
                          const selected = value.option === opt
                          return (
                            <button
                              key={opt}
                              type="button"
                              aria-pressed={selected}
                              onClick={() =>
                                onAnswerChange(k, qi, {
                                  option: selected ? '' : opt,
                                })
                              }
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition sm:text-sm ${
                                selected
                                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                                  : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                              }`}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                      <label
                        htmlFor={noteId}
                        className="mb-1 block text-[11px] font-medium text-slate-500"
                      >
                        補足（任意）
                      </label>
                      <textarea
                        id={noteId}
                        rows={2}
                        value={value.note}
                        onChange={(e) =>
                          onAnswerChange(k, qi, { note: e.target.value })
                        }
                        placeholder="もっと具体があれば、短く"
                        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      <footer className="flex flex-col items-center gap-2 border-t border-indigo-100 bg-indigo-50/40 px-5 py-4 sm:flex-row sm:justify-between">
        <p className="text-xs text-slate-500">
          {totalAnswered > 0
            ? `${totalAnswered} 件回答 ${source === 'fallback' ? '· テンプレート質問' : '· AI質問'}`
            : `空でも進めます ${source === 'fallback' ? '· テンプレート質問' : '· AI質問'}`}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {proceedLabel}
          </button>
        </div>
      </footer>
    </article>
  )
}
