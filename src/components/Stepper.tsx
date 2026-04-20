const STEPS = [
  { key: 'input', label: '入力' },
  { key: 'insight', label: '気付き' },
  { key: 'self', label: '自己分析' },
  { key: 'accept', label: '納得' },
] as const

export function Stepper({ reached }: { reached: number }) {
  return (
    <ol
      aria-label="進捗"
      className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-3 shadow-sm backdrop-blur"
    >
      {STEPS.map((step, i) => {
        const num = i + 1
        const state =
          num < reached ? 'done' : num === reached ? 'active' : 'pending'
        return (
          <li
            key={step.key}
            className="flex flex-1 items-center gap-2"
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <div className="flex flex-1 items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1 transition ${
                  state === 'done'
                    ? 'bg-indigo-600 text-white ring-indigo-600'
                    : state === 'active'
                      ? 'bg-white text-indigo-700 ring-indigo-500'
                      : 'bg-slate-50 text-slate-400 ring-slate-300'
                }`}
                aria-hidden="true"
              >
                {state === 'done' ? '✓' : num}
              </span>
              <span
                className={`text-xs font-medium sm:text-sm ${
                  state === 'pending' ? 'text-slate-400' : 'text-slate-700'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`hidden h-px flex-1 sm:block ${
                  num < reached ? 'bg-indigo-400' : 'bg-slate-200'
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
