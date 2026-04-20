import type {
  AnsweredItem,
  Axis,
  AxisSide,
  IntentionItem,
  ItemQuestions,
  ItemReflection,
  NextStep,
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

export const AXIS_SIDE_LABEL: Record<Axis, { left: string; right: string }> = {
  選択: { left: '頼まれて・迫られて', right: '自分で選んだ' },
  手応え: { left: '曖昧・見えにくい', right: '手応えあり' },
  意味: { left: '価値観と切り離し', right: '価値観と繋がる' },
  場: { left: '比較・中断・評価', right: '安全・集中' },
  身体: { left: '緊張・疲弊', right: '緩み・整い' },
  時間: { left: '追われている', right: '余裕あり' },
}

type FallbackOption = { text: string; pos: AxisSide }
type FallbackQuestion = { question: string; options: FallbackOption[] }

const AXIS_QUESTIONS: Record<Axis, { like: FallbackQuestion; hard: FallbackQuestion }> = {
  選択: {
    like: {
      question: 'これに最初に手を伸ばしたきっかけは？',
      options: [
        { text: '自分から興味を持って始めた', pos: 'right' },
        { text: '誰かに勧められて始めた', pos: 'middle' },
        { text: '必要に迫られて始めた', pos: 'left' },
        { text: 'よく覚えていない', pos: 'middle' },
      ],
    },
    hard: {
      question: 'これを最初にやることになったきっかけは？',
      options: [
        { text: '自分で選んで始めた', pos: 'right' },
        { text: '頼まれて／指示されて', pos: 'left' },
        { text: '必要に迫られて', pos: 'left' },
        { text: 'よく覚えていない', pos: 'middle' },
      ],
    },
  },
  手応え: {
    like: {
      question: 'やっていて、進んでいる手応えはある？',
      options: [
        { text: '明確にある', pos: 'right' },
        { text: 'ゆるやかにある', pos: 'right' },
        { text: '曖昧なときもある', pos: 'middle' },
        { text: 'あまり気にしていない', pos: 'middle' },
      ],
    },
    hard: {
      question: 'やっていて、進んでいる手応えはある？',
      options: [
        { text: 'ある', pos: 'right' },
        { text: '曖昧・見えにくい', pos: 'left' },
        { text: 'ほとんど感じない', pos: 'left' },
        { text: '場合による', pos: 'middle' },
      ],
    },
  },
  意味: {
    like: {
      question: '自分の大切なこと・価値観と繋がっている感じは？',
      options: [
        { text: 'しっかり繋がっている', pos: 'right' },
        { text: 'ゆるく繋がっている', pos: 'right' },
        { text: 'あまり意識していない', pos: 'middle' },
        { text: '切り離されている感じ', pos: 'left' },
      ],
    },
    hard: {
      question: '自分の大切なこと・価値観と繋がっている感じは？',
      options: [
        { text: '切り離されている', pos: 'left' },
        { text: 'ほとんど繋がらない', pos: 'left' },
        { text: '場面によっては繋がる', pos: 'middle' },
        { text: '本来は繋がるはずなのに', pos: 'middle' },
      ],
    },
  },
  場: {
    like: {
      question: '主にどんな場面でやっている？',
      options: [
        { text: '一人で集中しているとき', pos: 'right' },
        { text: '気の合う相手と一緒', pos: 'right' },
        { text: '大勢の中', pos: 'left' },
        { text: '場面はいろいろ', pos: 'middle' },
      ],
    },
    hard: {
      question: '主にどんな場面でやっている？',
      options: [
        { text: '評価・比較の場', pos: 'left' },
        { text: '中断されやすい場', pos: 'left' },
        { text: '大勢の前で', pos: 'left' },
        { text: '特定の相手との場', pos: 'middle' },
      ],
    },
  },
  身体: {
    like: {
      question: 'やっているとき、身体はどんな感じ？',
      options: [
        { text: '肩が緩んでいる', pos: 'right' },
        { text: '前のめりで集中', pos: 'right' },
        { text: '呼吸が深い', pos: 'right' },
        { text: 'あまり意識していない', pos: 'middle' },
      ],
    },
    hard: {
      question: 'やっているとき、身体はどんな感じ？',
      options: [
        { text: '肩・胸が固い', pos: 'left' },
        { text: '呼吸が浅い', pos: 'left' },
        { text: '疲労を感じる', pos: 'left' },
        { text: 'あまり意識していない', pos: 'middle' },
      ],
    },
  },
  時間: {
    like: {
      question: '時間の感覚は？',
      options: [
        { text: '自分のペースで進められる', pos: 'right' },
        { text: '気づけば時間が経っている', pos: 'right' },
        { text: '短い時間でも味わえる', pos: 'right' },
        { text: '場合による', pos: 'middle' },
      ],
    },
    hard: {
      question: '時間の感覚は？',
      options: [
        { text: '締切に追われている', pos: 'left' },
        { text: '他の用事に圧迫される', pos: 'left' },
        { text: '時間が長く感じる', pos: 'left' },
        { text: '場合による', pos: 'middle' },
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
          options: def.options.map((o) => o.text),
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

function findOptionSide(
  axis: Axis,
  pole: Pole,
  selected: string,
): AxisSide | null {
  if (!selected.trim()) return null
  const def = AXIS_QUESTIONS[axis][pole]
  const hit = def.options.find((o) => o.text === selected.trim())
  return hit?.pos ?? null
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
    const keyAnswer =
      filled.find((a) => a.axis === keyAxis) ?? filled[0]
    const axisSide: AxisSide = keyAnswer
      ? findOptionSide(keyAnswer.axis, it.pole, keyAnswer.selectedOption) ??
        (it.pole === 'like' ? 'right' : 'left')
      : 'middle'
    const firstSummary = keyAnswer ? summarizeAnswer(keyAnswer) : ''
    const sideLabel =
      axisSide === 'middle'
        ? '中間'
        : axisSide === 'right'
          ? AXIS_SIDE_LABEL[keyAxis].right
          : AXIS_SIDE_LABEL[keyAxis].left
    const reflection = firstSummary
      ? `教えてくれた「${firstSummary}」から見えるのは、いまの${it.pole === 'like' ? '好き' : '辛さ'}が${AXIS_LABEL[keyAxis]}の${sideLabel}側に寄っている、という傾向です。`
      : `「${it.text}」は、${AXIS_LABEL[keyAxis]}の側面が効きやすい行為です。`
    const inversion = `もし${AXIS_INVERSION_HINT[keyAxis]}、同じ行為でも別の感覚に動く余地があります。`
    return {
      text: it.text,
      pole: it.pole,
      reflection,
      inversion,
      keyAxis,
      axisSide,
    }
  })
  return { items }
}

function formatIntention(o: string, n: string): string {
  const opt = o.trim()
  const note = n.trim()
  if (opt && note) return `${opt}（${note}）`
  if (opt) return opt
  if (note) return note
  return ''
}

export function buildFallbackTakeaway(
  _answered: AnsweredItem[],
  reflections: ItemReflection[],
  intentions: IntentionItem[],
  nextStep: NextStep,
): Takeaway {
  const dominantAxis = reflections[0]?.keyAxis
  const axisHint = dominantAxis
    ? `特に${AXIS_LABEL[dominantAxis]}が今は効いて見えます。`
    : ''

  const hardIntent = intentions.find(
    (it) => it.pole === 'hard' && formatIntention(it.option, it.note),
  )
  const likeIntent = intentions.find(
    (it) => it.pole === 'like' && formatIntention(it.option, it.note),
  )
  const step = formatIntention(nextStep.option, nextStep.note)

  // per-item responses — never mix poles
  const perItem = intentions.map((it) => {
    const raw = formatIntention(it.option, it.note)
    if (!raw) {
      return {
        text: it.text,
        pole: it.pole,
        response:
          it.pole === 'like'
            ? '意図は保留のまま、いまある感覚をまず味わってみて。'
            : '無理に決めなくていい。辛さは保留したままでも、手放しません。',
      }
    }
    return {
      text: it.text,
      pole: it.pole,
      response:
        it.pole === 'like'
          ? `「${raw}」と書いてくれました。この好きを支えている条件を1つ、明日も意識に置いておけます。`
          : `「${raw}」と書いてくれました。動かせそうな条件を1つだけ選ぶと、辛さは半歩だけ緩みます。`,
    }
  })

  const intentionPoint = hardIntent
    ? {
        title: 'あなたの意図から',
        body: `辛いものを${formatIntention(hardIntent.option, hardIntent.note)}と書いてくれました。そこから逆算できる条件の動かし方が、今日の具体です。`,
      }
    : likeIntent
      ? {
          title: 'あなたの意図から',
          body: `好きなものを${formatIntention(likeIntent.option, likeIntent.note)}と書いてくれました。いまある良さを守る条件を一つ、明日に持ち込めます。`,
        }
      : {
          title: '意図はあとからでも',
          body: '今日は「どうしたい」を保留にしてOK。寝かせるうちに、自分の中から自然に出てくる意図もあります。',
        }

  const stepPoint = step
    ? {
        title: '明日の一歩',
        body: `「${step}」と書いてくれました。小さいほど試しやすい。半歩で十分です。`,
      }
    : {
        title: '明日の一歩',
        body: '思いつかなければ無理に決めない。「自分で選べる部分」を1つ探すだけでも一歩です。',
      }

  const inversionPoint = {
    title: '同じ軸の別の位置',
    body: `条件を一つ動かせば、同じ行為の感覚は別の側へ滑ります。${axisHint}別人の話ではなく、自分自身の操作の選択肢です。`,
  }

  const points = [intentionPoint, stepPoint, inversionPoint]

  const quoted = [hardIntent, likeIntent].filter(Boolean) as IntentionItem[]
  const personalNote =
    quoted.length > 0
      ? `${quoted
          .map(
            (it) =>
              `${it.pole === 'like' ? '好き' : '辛い'}のほうは「${formatIntention(it.option, it.note)}」と書いてくれました`,
          )
          .join('。')}。${step ? `さらに「${step}」を試すと決めてくれた。` : ''}${axisHint}今日はここまで来られただけで、十分です。`
      : `今日はまだ意図を決めずに置いておく、という選択でも大丈夫。${axisHint}明日また、同じ問いに戻ってこれます。`

  return { perItem, points, personalNote }
}
