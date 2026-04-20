import { AXIS_ICON, AXIS_LABEL } from './fallback'
import type { Axis } from './aiClient'

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
    left: '結果が遠い・曖昧',
    right: '小さな進みがすぐ見える',
  },
  {
    key: '意味',
    description: '自分の価値観と繋がっているか',
    left: '価値観から切り離されている',
    right: '価値観と自然に繋がる',
  },
  {
    key: '場',
    description: 'どんな場面・誰と一緒にやっているか',
    left: '比較・中断・評価が多い',
    right: '安全・集中できる',
  },
  {
    key: '身体',
    description: '身体の感覚（緊張／緩み）',
    left: '疲弊・緊張下',
    right: '整い・緩み',
  },
  {
    key: '時間',
    description: '時間に追われているか、余裕があるか',
    left: '追われている・締切直前',
    right: '余裕がある・自分のペース',
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

export function StructureAnalysis() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-slate-700 sm:text-base">
      <section>
        <h2 className="mb-2 text-base font-semibold text-indigo-800 sm:text-lg">
          基本の考え方
        </h2>
        <ul className="space-y-2">
          {PRINCIPLES.map((p, i) => (
            <li
              key={i}
              className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3"
            >
              <p className="font-semibold text-slate-800">{p.title}</p>
              <p className="mt-1 text-slate-700">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-indigo-800 sm:text-lg">
          6つの軸
        </h2>
        <p className="mb-3 text-slate-600">
          ある行為に対する感覚は、この6軸のどこに自分が立っているかで決まります。
        </p>
        <ul className="space-y-3">
          {AXES.map((a) => (
            <li
              key={a.key}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">
                  {AXIS_ICON[a.key]} {AXIS_LABEL[a.key]}
                </span>
                <span className="text-xs text-slate-500">{a.description}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-sm font-medium text-rose-700">
                  {a.left}
                </span>
                <span className="text-indigo-400" aria-hidden="true">
                  ⇄
                </span>
                <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700">
                  {a.right}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-indigo-800 sm:text-lg">
          メカニズム
        </h2>
        <p className="text-slate-600">
          条件を一つでも動かすと、同じ行為の感覚が滑らかに別の側へ動きます。反転は言葉遊びではなく、自分のどの条件を動かすかを選ぶ技術。
        </p>
      </section>
    </div>
  )
}
