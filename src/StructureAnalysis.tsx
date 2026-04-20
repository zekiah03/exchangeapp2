import { AXIS_ICON, AXIS_LABEL } from './fallback'
import type { Axis, AxisSide, Pole } from './aiClient'

const AXES: { key: Axis; description: string; left: string; right: string }[] = [
  {
    key: '選択',
    description: '自分で選んだか、頼まれて／必要に迫られてか',
    left: '頼まれて・必要に迫られて',
    right: '自分で選んだ',
  },
  {
    key: '手応え',
    description: '進んでいる感覚があるか、曖昧か',
    left: '曖昧・見えにくい',
    right: '手応えあり',
  },
  {
    key: '意味',
    description: '自分の価値観と繋がっているか',
    left: '価値観と切り離し',
    right: '価値観と繋がる',
  },
  {
    key: '場',
    description: 'どんな場面・誰と一緒にやっているか',
    left: '比較・中断・評価',
    right: '安全・集中',
  },
  {
    key: '身体',
    description: '身体の感覚（緊張／緩み）',
    left: '緊張・疲弊',
    right: '緩み・整い',
  },
  {
    key: '時間',
    description: '時間に追われているか、余裕があるか',
    left: '追われている',
    right: '余裕あり',
  },
]

const PRINCIPLES: { title: string; body: string }[] = [
  {
    title: '反転は別人の話ではない',
    body: '反転 ＝ 同じ6軸上で、自分が別の条件にいたら感じたかもしれない感覚。あなた自身の中の別の位置です。',
  },
  {
    title: '違いを作るのは「条件」',
    body: 'いまの「好き」と「辛い」は、上の6軸のどれが効いているかで位置が決まります。素質や性分の話ではありません。',
  },
  {
    title: 'AIは推測しない、聞き出す',
    body: 'このアプリのAIはあなたの過去や育ちを断定しません。質問を投げ、あなたが教えてくれた事実だけから反射します。',
  },
]

export type AxisMarker = { pole: Pole; side: AxisSide }

function sideToPercent(side: AxisSide): number {
  if (side === 'left') return 8
  if (side === 'right') return 92
  return 50
}

function markerColor(pole: Pole): string {
  // 好き(like) = emerald, 辛い(hard) = rose
  return pole === 'like' ? 'bg-emerald-500' : 'bg-rose-500'
}

function markerLabel(pole: Pole): string {
  return pole === 'like' ? '💚' : '💔'
}

function AxisBar({ markers }: { markers: AxisMarker[] | undefined }) {
  const list = markers ?? []
  return (
    <div className="relative mt-2 h-7">
      <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-200 via-slate-200 to-emerald-200" />
      <div className="absolute inset-y-0 left-0 flex items-center">
        <span className="h-2 w-2 rounded-full bg-rose-300" aria-hidden="true" />
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <span
          className="h-2 w-2 rounded-full bg-emerald-300"
          aria-hidden="true"
        />
      </div>
      {list.map((m, i) => {
        // stack markers vertically if they overlap on the same side
        const sameSideBefore = list
          .slice(0, i)
          .filter((x) => x.side === m.side).length
        const yOffset = sameSideBefore * 10 // px
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${sideToPercent(m.side)}%`,
              top: `calc(50% - ${yOffset}px)`,
            }}
            aria-label={`${m.pole === 'like' ? '好き' : '辛い'} の位置: ${m.side}`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white shadow ring-2 ring-white ${markerColor(m.pole)}`}
            >
              {markerLabel(m.pole)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function StructureAnalysis({
  markers,
}: {
  markers?: Partial<Record<Axis, AxisMarker[]>>
} = {}) {
  const hasMarkers =
    markers &&
    Object.values(markers).some((arr) => (arr?.length ?? 0) > 0)
  return (
    <div className="space-y-6 text-sm leading-relaxed text-slate-700 sm:text-base">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-indigo-800 sm:text-base">
          6つの軸
        </h2>
        {hasMarkers ? (
          <p className="mb-3 text-xs text-slate-600 sm:text-sm">
            💚 が「好き」項目の位置、💔 が「辛い」項目の位置です。印がない軸は今回聞いていません。
          </p>
        ) : (
          <p className="mb-3 text-xs text-slate-600 sm:text-sm">
            ある行為に対する感覚は、この6軸のどこに自分が立っているかで決まります。
          </p>
        )}
        <ul className="space-y-3">
          {AXES.map((a) => {
            const mk = markers?.[a.key]
            const isHi = mk && mk.length > 0
            return (
              <li
                key={a.key}
                className={`rounded-xl border p-3 transition ${
                  isHi
                    ? 'border-indigo-300 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-200'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                      isHi
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {AXIS_ICON[a.key]} {AXIS_LABEL[a.key]}
                  </span>
                  <span className="text-xs text-slate-500">{a.description}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex shrink-0 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                    {a.left}
                  </span>
                  <span className="inline-flex shrink-0 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                    {a.right}
                  </span>
                </div>
                <AxisBar markers={mk} />
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-indigo-800 sm:text-base">
          基本の考え方
        </h2>
        <ul className="space-y-2">
          {PRINCIPLES.map((p, i) => (
            <li
              key={i}
              className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3"
            >
              <p className="text-sm font-semibold text-slate-800">{p.title}</p>
              <p className="mt-1 text-xs text-slate-700 sm:text-sm">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-slate-600 sm:text-sm">
        条件を一つでも動かすと、同じ行為の感覚が滑らかに別の側へ動きます。反転は言葉遊びではなく、自分のどの条件を動かすかを選ぶ技術。
      </p>
    </div>
  )
}
