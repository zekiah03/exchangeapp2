import type { ReflectionResponse } from '../aiClient'
import { AXIS_ICON, AXIS_LABEL } from '../fallback'
import { StructureAnalysis } from '../StructureAnalysis'

export function ReflectionCard({
  reflections,
  onCopy,
  onProceed,
  onBack,
  copied,
  source,
}: {
  reflections: ReflectionResponse
  onCopy: () => void
  onProceed: () => void
  onBack: () => void
  copied: boolean
  source: 'ai' | 'fallback'
}) {
  return (
    <article
      id="see-card"
      className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
    >
      <header className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-rose-50 px-5 py-4">
        <p className="text-center text-xs font-medium text-slate-500">
          ステップ3 · 見る
        </p>
        <h2 className="mt-0.5 text-center text-lg font-semibold text-slate-800">
          教えてくれたことから、見えてくること
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          反転は別人の話ではなく、同じ軸の別の位置にいる、あなた自身。
        </p>
      </header>

      <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
        {reflections.items.map((it, i) => {
          const palette =
            it.pole === 'like'
              ? 'border-emerald-200 bg-emerald-50/40'
              : 'border-rose-200 bg-rose-50/40'
          const tone = it.pole === 'like' ? '💚' : '💔'
          return (
            <section key={i} className={`rounded-xl border p-4 ${palette}`}>
              <div className="mb-2 flex items-baseline gap-2">
                <span aria-hidden="true">{tone}</span>
                <h3 className="text-sm font-semibold text-slate-800 sm:text-base">
                  {it.text}
                </h3>
              </div>

              <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">
                  {AXIS_ICON[it.keyAxis]} {AXIS_LABEL[it.keyAxis]}
                </span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white/90 p-3 text-sm leading-relaxed text-slate-700">
                <p className="mb-3">{it.reflection}</p>
                <div className="border-t border-slate-100 pt-3">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                    🔄 同じ軸の別の位置
                  </p>
                  <p className="text-slate-600">{it.inversion}</p>
                </div>
              </div>
            </section>
          )
        })}

        <section className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
          <header className="mb-3">
            <p className="text-xs font-medium text-indigo-600">
              📐 ところで、これがどういう構造か
            </p>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              いまあなたが立っている軸を、全体の地図に置き直してみます。
            </p>
          </header>
          <StructureAnalysis
            highlightAxes={Array.from(
              new Set(reflections.items.map((it) => it.keyAxis)),
            )}
          />
        </section>
      </div>

      <footer className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {source === 'fallback' ? 'テンプレート反射' : 'AI反射（あなたの回答に基づく）'}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            {copied ? 'コピーしました' : 'コピー'}
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            持ち帰る →
          </button>
        </div>
      </footer>
    </article>
  )
}
