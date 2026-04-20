import type { Pole } from '../aiClient'
import { EMPTY_ANSWER, itemKey, type AnswerValue } from '../items'

export type IntentionsByItem = Record<string, AnswerValue>

const HARD_OPTIONS = [
  '今のまま受け入れる',
  '条件を少し動かしてみる',
  '距離を置く・やめる',
  'まだ決めない',
  'ほか（補足に書く）',
]

const LIKE_OPTIONS = [
  '今のまま続ける',
  'もっと深める・時間を増やす',
  '別の場でも試してみる',
  'まだ決めない',
  'ほか（補足に書く）',
]

const NEXT_STEP_OPTIONS = [
  '何か1つ自分で選んでみる',
  '場を少し変えてみる',
  '時間の使い方を変える',
  '身体をまず整える',
  '思いつかない・やらない',
]

export function IntentionSheet({
  likeItems,
  hardItems,
  intentions,
  nextStep,
  onIntentionChange,
  onNextStepChange,
  onProceed,
  onBack,
}: {
  likeItems: string[]
  hardItems: string[]
  intentions: IntentionsByItem
  nextStep: AnswerValue
  onIntentionChange: (key: string, partial: Partial<AnswerValue>) => void
  onNextStepChange: (partial: Partial<AnswerValue>) => void
  onProceed: () => void
  onBack: () => void
}) {
  return (
    <article
      id="take-card"
      className="mt-8 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-lg"
    >
      <header className="border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-amber-50 px-5 py-4">
        <p className="text-center text-xs font-medium text-amber-700">
          ステップ4 · 持ち帰る
        </p>
        <h2 className="mt-0.5 text-center text-lg font-semibold text-slate-800">
          で、どうしたい？
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          あなたの意図をもとに、気付きを組み立てます。答えはどれも任意です。
        </p>
      </header>

      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        {hardItems.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-rose-800">
              💔 辛いこと、これから
            </h3>
            <div className="space-y-3">
              {hardItems.map((t) => (
                <IntentionRow
                  key={`hard::${t}`}
                  pole="hard"
                  text={t}
                  value={intentions[itemKey('hard', t)] ?? EMPTY_ANSWER}
                  onChange={(partial) =>
                    onIntentionChange(itemKey('hard', t), partial)
                  }
                  options={HARD_OPTIONS}
                />
              ))}
            </div>
          </section>
        )}

        {likeItems.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-emerald-800">
              💚 好きなこと、これから
            </h3>
            <div className="space-y-3">
              {likeItems.map((t) => (
                <IntentionRow
                  key={`like::${t}`}
                  pole="like"
                  text={t}
                  value={intentions[itemKey('like', t)] ?? EMPTY_ANSWER}
                  onChange={(partial) =>
                    onIntentionChange(itemKey('like', t), partial)
                  }
                  options={LIKE_OPTIONS}
                />
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
          <h3 className="mb-2 text-sm font-semibold text-indigo-800">
            🪜 今夜／明日、1つ試すとしたら？
          </h3>
          <p className="mb-2 text-xs text-slate-600">
            ひとつ選ぶか、自分のことばで。思いつかなければスキップでOK。
          </p>
          <OptionPills
            options={NEXT_STEP_OPTIONS}
            selected={nextStep.option}
            onToggle={(opt) =>
              onNextStepChange({
                option: nextStep.option === opt ? '' : opt,
              })
            }
            tone="indigo"
          />
          <label
            htmlFor="next-step-note"
            className="mb-1 block text-[11px] font-medium text-slate-500"
          >
            自由記入（任意）
          </label>
          <textarea
            id="next-step-note"
            rows={2}
            value={nextStep.note}
            onChange={(e) => onNextStepChange({ note: e.target.value })}
            placeholder="小さく、試しやすい一歩で"
            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
        </section>
      </div>

      <footer className="flex flex-col gap-2 border-t border-amber-100 bg-amber-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">空欄のままでも受け取れます。</p>
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
            className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            気付きを受け取る →
          </button>
        </div>
      </footer>
    </article>
  )
}

function IntentionRow({
  pole,
  text,
  value,
  options,
  onChange,
}: {
  pole: Pole
  text: string
  value: AnswerValue
  options: string[]
  onChange: (partial: Partial<AnswerValue>) => void
}) {
  const palette =
    pole === 'like'
      ? 'border-emerald-200 bg-emerald-50/40'
      : 'border-rose-200 bg-rose-50/40'
  return (
    <div className={`rounded-xl border p-3 ${palette}`}>
      <p className="mb-2 text-sm font-medium text-slate-800">{text}</p>
      <OptionPills
        options={options}
        selected={value.option}
        onToggle={(opt) =>
          onChange({ option: value.option === opt ? '' : opt })
        }
        tone={pole === 'like' ? 'emerald' : 'rose'}
      />
      <textarea
        rows={2}
        value={value.note}
        onChange={(e) => onChange({ note: e.target.value })}
        placeholder="補足（任意）"
        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  )
}

function OptionPills({
  options,
  selected,
  onToggle,
  tone,
}: {
  options: string[]
  selected: string
  onToggle: (opt: string) => void
  tone: 'rose' | 'emerald' | 'indigo'
}) {
  const active = {
    rose: 'border-rose-500 bg-rose-600 text-white',
    emerald: 'border-emerald-500 bg-emerald-600 text-white',
    indigo: 'border-indigo-500 bg-indigo-600 text-white',
  }[tone]
  const hover = {
    rose: 'hover:border-rose-300 hover:bg-rose-50',
    emerald: 'hover:border-emerald-300 hover:bg-emerald-50',
    indigo: 'hover:border-indigo-300 hover:bg-indigo-50',
  }[tone]
  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isSelected = selected === opt
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(opt)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition sm:text-sm ${
              isSelected
                ? `${active} shadow-sm`
                : `border-slate-300 bg-white text-slate-700 ${hover}`
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
