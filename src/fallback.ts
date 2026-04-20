import type {
  AnsweredItem,
  Axis,
  ItemQuestions,
  ItemReflection,
  Pole,
  QuestionsResponse,
  ReflectionResponse,
  Takeaway,
} from './aiClient'

export type PoleItems = { like: string[]; hard: string[] }

const ALL_AXES: Axis[] = ['選択', '手応え', '意味', '場', '身体', '時間']

export const AXIS_LABEL: Record<Axis, string> = {
  選択: '選択',
  手応え: '手応え',
  意味: '意味',
  場: '場',
  身体: '身体',
  時間: '時間',
}

export const AXIS_ICON: Record<Axis, string> = {
  選択: '🧭',
  手応え: '🔁',
  意味: '🧵',
  場: '🏠',
  身体: '🌤',
  時間: '⏳',
}

type QuestionDef = { question: string; options: string[] }

const AXIS_QUESTIONS: Record<Axis, { like: QuestionDef; hard: QuestionDef }> = {
  選択: {
    like: {
      question: 'これに最初に手を伸ばしたきっかけは？',
      options: [
        '自分から興味を持って始めた',
        '誰かに勧められて始めた',
        '必要に迫られて始めた',
        'よく覚えていない',
      ],
    },
    hard: {
      question: 'これを最初にやることになったきっかけは？',
      options: [
        '自分で選んで始めた',
        '頼まれて／指示されて',
        '必要に迫られて',
        'よく覚えていない',
      ],
    },
  },
  手応え: {
    like: {
      question: 'やっていて、進んでいる手応えはある？',
      options: [
        '明確にある',
        'ゆるやかにある',
        '曖昧なときもある',
        'あまり気にしていない',
      ],
    },
    hard: {
      question: 'やっていて、進んでいる手応えはある？',
      options: [
        'ある',
        '曖昧・見えにくい',
        'ほとんど感じない',
        '場合による',
      ],
    },
  },
  意味: {
    like: {
      question: '自分の大切なこと・価値観と繋がっている感じは？',
      options: [
        'しっかり繋がっている',
        'ゆるく繋がっている',
        'あまり意識していない',
        '切り離されている感じ',
      ],
    },
    hard: {
      question: '自分の大切なこと・価値観と繋がっている感じは？',
      options: [
        '切り離されている',
        'ほとんど繋がらない',
        '場面によっては繋がる',
        '本来は繋がるはずなのに',
      ],
    },
  },
  場: {
    like: {
      question: '主にどんな場面でやっている？',
      options: [
        '一人で集中しているとき',
        '気の合う相手と一緒',
        '大勢の中',
        '場面はいろいろ',
      ],
    },
    hard: {
      question: '主にどんな場面でやっている？',
      options: [
        '評価・比較の場',
        '中断されやすい場',
        '大勢の前で',
        '特定の相手との場',
      ],
    },
  },
  身体: {
    like: {
      question: 'やっているとき、身体はどんな感じ？',
      options: [
        '肩が緩んでいる',
        '前のめりで集中',
        '呼吸が深い',
        'あまり意識していない',
      ],
    },
    hard: {
      question: 'やっているとき、身体はどんな感じ？',
      options: [
        '肩・胸が固い',
        '呼吸が浅い',
        '疲労を感じる',
        'あまり意識していない',
      ],
    },
  },
  時間: {
    like: {
      question: '時間の感覚は？',
      options: [
        '自分のペースで進められる',
        '気づけば時間が経っている',
        '短い時間でも味わえる',
        '場合による',
      ],
    },
    hard: {
      question: '時間の感覚は？',
      options: [
        '締切に追われている',
        '他の用事に圧迫される',
        '時間が長く感じる',
        '場合による',
      ],
    },
  },
}

const AXIS_INVERSION_HINT: Record<Axis, string> = {
  選択: '自分で選び直せる距離感だったら',
  手応え: '小さな進みがすぐ目に見える形だったら',
  意味: '自分の大切なものと繋がる文脈で出会えていたら',
  場: '比較や中断の少ない場で関われていたら',
  身体: '身体が緩んだ状態で触れられていたら',
  時間: '追われずに自分のペースで関われていたら',
}

function fnv1a(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function pickAxes(seed: string, count: number): Axis[] {
  const h = fnv1a(seed)
  const pool = [...ALL_AXES]
  const out: Axis[] = []
  let s = h || 1
  for (let i = 0; i < count && pool.length > 0; i++) {
    s = (Math.imul(s ^ (s >>> 15), 0x85ebca6b) ^ 0x9e3779b9) >>> 0
    const idx = s % pool.length
    out.push(pool[idx])
    pool.splice(idx, 1)
  }
  return out
}

export function buildFallbackQuestions(items: PoleItems): QuestionsResponse {
  const build = (text: string, pole: Pole): ItemQuestions => {
    const axes = pickAxes(`${pole}::${text}`, 2)
    return {
      text,
      pole,
      questions: axes.map((axis) => {
        const def = AXIS_QUESTIONS[axis][pole]
        return {
          axis,
          question: def.question,
          options: def.options,
        }
      }),
    }
  }
  return {
    items: [
      ...items.like.map((t) => build(t, 'like')),
      ...items.hard.map((t) => build(t, 'hard')),
    ],
  }
}

function summarizeAnswer(a: AnsweredItem['answers'][number]): string {
  const opt = a.selectedOption.trim()
  const note = a.note.trim()
  if (opt && note) return `${opt}（${note}）`
  if (opt) return opt
  if (note) return note
  return ''
}

export function buildFallbackReflections(
  answered: AnsweredItem[],
): ReflectionResponse {
  const items: ItemReflection[] = answered.map((it) => {
    const filled = it.answers.filter(
      (a) => a.selectedOption.trim() || a.note.trim(),
    )
    const keyAxis: Axis =
      filled[0]?.axis ??
      it.answers[0]?.axis ??
      pickAxes(`${it.pole}::${it.text}`, 1)[0]
    const firstSummary = filled[0] ? summarizeAnswer(filled[0]) : ''
    const reflection =
      firstSummary
        ? `教えてくれた「${firstSummary}」から見えるのは、いまの${it.pole === 'like' ? '好き' : '辛さ'}が${AXIS_LABEL[keyAxis]}の側面と結びついている、という傾向です。`
        : `「${it.text}」は、${AXIS_LABEL[keyAxis]}の側面が効きやすい行為です。`
    const inversion = `もし${AXIS_INVERSION_HINT[keyAxis]}、同じ行為でも別の感覚に動く余地があります。`
    return {
      text: it.text,
      pole: it.pole,
      reflection,
      inversion,
      keyAxis,
    }
  })
  return { items }
}

export function buildFallbackTakeaway(
  answered: AnsweredItem[],
  reflections: ItemReflection[],
): Takeaway {
  const sampleLike = answered.find((a) => a.pole === 'like')?.text
  const sampleHard = answered.find((a) => a.pole === 'hard')?.text
  const dominantAxis = reflections[0]?.keyAxis
  const points = [
    {
      title: '同じ軸の上の別の位置',
      body: '好きと辛いは別の人間の話ではなく、同じ6軸の上で自分が今どこに立っているか、の違いです。',
    },
    {
      title: '違いを作っているのは条件',
      body: '選択・手応え・意味・場・身体・時間。どの条件が今そう傾けているのか、が見える化のカギです。',
    },
    {
      title: '反転は条件の付け替え',
      body: '条件を一つでも動かすと、同じ行為の感覚は滑らかに別の側へ動きます。反転は別人の話ではなく、自分自身の操作の選択肢。',
    },
  ]
  const axisHint = dominantAxis
    ? `特に${AXIS_LABEL[dominantAxis]}が今は効いて見えます。`
    : ''
  const personalNote =
    sampleLike && sampleHard
      ? `いま「${sampleLike}」は手が伸びて、「${sampleHard}」は消耗している。${axisHint}でも軸を変えれば位置も動く。今日のひとつの問いは、「${sampleHard}」のどの条件なら少し緩むか、です。`
      : `今日のひとつの問いは、自分が一番効いていると感じた軸を、半歩だけ別の側に置けるか、です。${axisHint}`
  return { points, personalNote }
}
