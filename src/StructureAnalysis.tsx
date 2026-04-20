type Layer = {
  id: string
  label: string
  title: string
  pairs: { left: string; right: string }[]
}

const LAYERS: Layer[] = [
  {
    id: 'L1',
    label: 'L1 / WHY',
    title: '動機の源泉',
    pairs: [{ left: '義務感', right: '好奇心' }],
  },
  {
    id: 'L2',
    label: 'L2 / HOW',
    title: '行動の質',
    pairs: [
      { left: '努力', right: '没頭' },
      { left: '耐える', right: '楽しむ' },
    ],
  },
  {
    id: 'L3',
    label: 'L3 / FEEL',
    title: '過程での体感',
    pairs: [
      { left: '苦労', right: 'フロー' },
      { left: '我慢', right: '充実' },
    ],
  },
  {
    id: 'L4',
    label: 'L4 / VALUE',
    title: '価値の所在',
    pairs: [{ left: '結果が全て', right: '過程が報酬' }],
  },
]

const CONDITIONS: { axis: string; left: string; right: string }[] = [
  {
    axis: 'スキルと課題',
    left: 'ズレている（易 or 難）→ 退屈/不安',
    right: '釣り合う → フローが起きる',
  },
  {
    axis: '自律性',
    left: 'やらされている・選ばされた',
    right: '自分で選んだ・コントロール感',
  },
  {
    axis: '動機の向き',
    left: '報酬・評価・回避（外から）',
    right: '興味・意味・成長（内から）',
  },
  {
    axis: 'フィードバック',
    left: '結果が遠い・曖昧 → 手応えなし',
    right: '即時に明確な反応 → 没入',
  },
  {
    axis: '意味づけ',
    left: '自分の価値観と切り離されている',
    right: '自分の価値観・物語と繋がる',
  },
  {
    axis: '心身コンディション',
    left: '疲弊・ストレス下 → 同じ行為も苦労化',
    right: '整っている → 同じ行為も没頭化',
  },
  {
    axis: '環境・文脈',
    left: '評価・比較・中断が多い',
    right: '安全・集中できる・邪魔が少ない',
  },
  {
    axis: '時間の余白',
    left: '追われている・締切直前',
    right: '余裕がある・自分のペースで',
  },
]

const MECHANISM_POINTS: string[] = [
  '上の層（WHY）が反転すると、下の層（FEEL・VALUE）が連鎖的に反転する。',
  '逆に、下の層（FEEL）で意図的に名前を付け替えると、上の層（WHY）の捉え方も後から変わりうる。',
  '条件（スキル・自律性・文脈など）を一つでも揃えると、同じ行為のフレームが滑らかに別の極へ移動する。',
  'つまり「反転」は言葉遊びではなく、どの層を操作するかを選ぶ技術に近い。',
]

export function StructureAnalysis() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-slate-700 sm:text-base">
      <section>
        <h2 className="mb-2 text-base font-semibold text-indigo-800 sm:text-lg">
          共通軸
        </h2>
        <p className="mb-3">
          すべての反転ペアは、同じ一本の軸の別の層を指しています。
        </p>
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-rose-50 via-indigo-50 to-emerald-50 p-4">
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:text-center">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-rose-600">
                外発・消耗ベース極
              </div>
              <div className="mt-1 text-xs text-slate-500">
                外から与えられた動機で消耗を伴う
              </div>
            </div>
            <div className="text-indigo-500" aria-hidden="true">
              ⇄
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                内発・報酬ベース極
              </div>
              <div className="mt-1 text-xs text-slate-500">
                内から湧く動機で過程自体が報酬になる
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-indigo-800 sm:text-lg">
          4つの層（どの深さの話か）
        </h2>
        <ul className="space-y-3">
          {LAYERS.map((layer) => (
            <li
              key={layer.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">
                  {layer.label}
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {layer.title}
                </span>
              </div>
              <div className="space-y-1.5">
                {layer.pairs.map((p, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1"
                  >
                    <span className="inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-sm font-medium text-rose-700">
                      {p.left}
                    </span>
                    <span className="text-indigo-400" aria-hidden="true">
                      ⇄
                    </span>
                    <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700">
                      {p.right}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-indigo-800 sm:text-lg">
          どういう条件でどちらに傾くか
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="w-40 px-3 py-2 font-medium">軸</th>
                <th className="px-3 py-2 font-medium text-rose-600">
                  外発・消耗極
                </th>
                <th className="px-3 py-2 font-medium text-emerald-600">
                  内発・報酬極
                </th>
              </tr>
            </thead>
            <tbody>
              {CONDITIONS.map((row) => (
                <tr key={row.axis} className="border-t border-slate-100">
                  <th
                    scope="row"
                    className="whitespace-nowrap px-3 py-2 align-top text-xs font-medium text-slate-700"
                  >
                    {row.axis}
                  </th>
                  <td className="px-3 py-2 align-top text-slate-600">
                    {row.left}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-600">
                    {row.right}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-indigo-800 sm:text-lg">
          メカニズム
        </h2>
        <p className="mb-3 text-slate-600">
          なぜ反転させるだけで体験が変わるのか。
        </p>
        <ul className="space-y-2">
          {MECHANISM_POINTS.map((p, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-3"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white"
              >
                {i + 1}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
