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

const AXIS_QUESTIONS: Record<Axis, { like: string; hard: string }> = {
  選択: {
    like: 'これに最初に手を伸ばしたのは、自分から？ それとも誰かに勧められて？',
    hard: 'これを最初に始めたのは、自分で選んで？ それとも頼まれて／必要に迫られて？',
  },
  手応え: {
    like: 'やっていて、進んでいる手応えは何で感じていますか？',
    hard: 'やっていて、進んでいる手応えはありますか？ それとも曖昧？',
  },
  意味: {
    like: 'これをやることは、自分の大切なものや価値観と繋がっている感じがしますか？',
    hard: 'これをやることは、自分の大切なものや価値観と繋がっている感じがしますか？',
  },
  場: {
    like: '主にどんな場面で、誰と一緒にこれをやっていますか？',
    hard: '主にどんな場面で、誰と一緒にこれをやることになっていますか？',
  },
  身体: {
    like: 'やっているとき、身体はどう感じていますか？（呼吸・肩・胸あたり）',
    hard: 'やっているとき、身体はどう感じていますか？（呼吸・肩・胸あたり）',
  },
  時間: {
    like: 'やっているとき、時間に追われていますか？ それとも余裕がありますか？',
    hard: 'やっているとき、時間に追われていますか？ それとも余裕がありますか？',
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
      questions: axes.map((axis) => ({
        axis,
        question: AXIS_QUESTIONS[axis][pole],
      })),
    }
  }
  return {
    items: [
      ...items.like.map((t) => build(t, 'like')),
      ...items.hard.map((t) => build(t, 'hard')),
    ],
  }
}

export function buildFallbackReflections(
  answered: AnsweredItem[],
): ReflectionResponse {
  const items: ItemReflection[] = answered.map((it) => {
    const filled = it.answers.filter((a) => a.answer.trim().length > 0)
    const keyAxis: Axis =
      filled[0]?.axis ?? it.answers[0]?.axis ?? pickAxes(`${it.pole}::${it.text}`, 1)[0]
    const reflection =
      filled.length > 0
        ? `教えてくれた「${filled[0].answer.trim()}」から見えるのは、いまの${it.pole === 'like' ? '好き' : '辛さ'}が${AXIS_LABEL[keyAxis]}の側面と結びついている、という傾向です。`
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
  const axisHint = dominantAxis ? `特に${AXIS_LABEL[dominantAxis]}が今は効いて見えます。` : ''
  const personalNote =
    sampleLike && sampleHard
      ? `いま「${sampleLike}」は手が伸びて、「${sampleHard}」は消耗している。${axisHint}でも軸を変えれば位置も動く。今日のひとつの問いは、「${sampleHard}」のどの条件なら少し緩むか、です。`
      : `今日のひとつの問いは、自分が一番効いていると感じた軸を、半歩だけ別の側に置けるか、です。${axisHint}`
  return { points, personalNote }
}
