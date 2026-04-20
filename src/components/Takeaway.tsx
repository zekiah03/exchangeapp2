import type { Takeaway as AITakeaway } from '../aiClient'

export function Takeaway({
  likeItems,
  hardItems,
  ai,
}: {
  likeItems: string[]
  hardItems: string[]
  ai?: AITakeaway
}) {
  const sampleLike = likeItems[0]
  const sampleHard = hardItems[0]
  const hasBoth = Boolean(sampleLike && sampleHard)

  const points = ai
    ? ai.points.map((p) => ({ title: p.title, body: p.body }))
    : [
        {
          title: '同じ軸の上の別の極',
          body: '反転人間とあなたは、別々の人間に見えて、実は同じ8軸の上に並んでいる。義務⇄好奇心 / 努力⇄没頭 / 苦労⇄フロー / 結果⇄過程。',
        },
        {
          title: '違いを作ったのは経緯',
          body: 'あなたと反転人間の違いは「人間の性分」ではなく、スキルの釣り合い・自律性・環境・時間の余白といった、出会った条件の差から来ている。',
        },
        {
          title: '反転は操作の選択肢',
          body: '条件を一つでも整え直すと、同じ行為は別の極に滑らかに動く。反転は言葉遊びではなく、どの層を動かすかを選ぶ技術。',
        },
      ]

  return (
    <article
      id="takeaway-card"
      className="mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 shadow-lg"
    >
      <header className="border-b border-amber-100 px-5 py-4">
        <p className="text-center text-xs font-medium text-amber-700">
          ステップ4 · 納得
        </p>
        <h2 className="mt-0.5 text-center text-lg font-semibold text-slate-800">
          🪞 ここまでの気づき
        </h2>
      </header>
      <div className="space-y-4 px-5 py-5 text-sm leading-relaxed text-slate-700 sm:px-6 sm:py-6 sm:text-base">
        {points.map((p, i) => (
          <TakePoint key={i} n={i + 1} title={p.title} body={p.body} />
        ))}

        {ai ? (
          <div className="rounded-xl border border-amber-200 bg-white/80 p-4 text-sm leading-relaxed text-slate-700">
            {ai.personalNote}
          </div>
        ) : (
          hasBoth && (
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
          )
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
