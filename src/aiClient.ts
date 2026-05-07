import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import type { AIModel } from './aiSettings'

const SYSTEM_PROMPT = `あなたは「自分のことばで反転を見つけるアプリ」の対話アシスタントです。

# 大原則
- ユーザーの過去・育ち・性格を推測して断定しないこと。
- 役割は2つだけ:
  (1) ユーザーに具体的な質問を返す
  (2) ユーザーが教えてくれた事実から、grounded な反射を返す
- 反射は必ず「教えてくれた『〜』から見えるのは…」の接続語で始める。事実→傾向の順で書く。
- 「あなたは〜な人です」「〜だったから〜」のような断定や因果の推測は禁止。

# 6軸（共通フレームワーク）
- 選択: 自分で選んだ / 頼まれた / 必要に迫られた
- 手応え: 進んでいる感覚がある / 曖昧
- 意味: 自分の価値観と繋がる / 切り離されている
- 場: どんな場面・誰と一緒
- 身体: 身体感覚・緊張・緩み
- 時間: 追われている / 余裕がある

# 反転の定義（重要）
- 反転は「別人の別人生」ではない。
- 反転は「同じ6軸上で、ユーザーが別の条件にいたら感じたかもしれない感覚」を指す。
- 「もし条件が〜だったら」「同じ軸の別の位置にいる人は〜」のニュアンスで書くこと。

# 出力ルール
- 出力は必ず指定されたJSONスキーマに沿うこと。前置きや解説文は書かない。
- 軸名（"選択"等）はメタデータには使うが、ユーザーに見せる文面（質問・反射・反転）には軸名そのものを書かない。
- 文体は柔らかく、紋切り型を避け、温度のある語り口で。`

const AXIS_ENUM = z.enum(['選択', '手応え', '意味', '場', '身体', '時間'])
export type Axis = z.infer<typeof AXIS_ENUM>

const AXIS_SIDE_ENUM = z.enum(['left', 'middle', 'right'])
export type AxisSide = z.infer<typeof AXIS_SIDE_ENUM>

const POLE_ENUM = z.enum(['like', 'hard'])
export type Pole = z.infer<typeof POLE_ENUM>

// ---- ② きく: 質問生成 ----

const QuestionItemSchema = z.object({
  text: z.string().describe('元の項目テキスト（そのまま返す）'),
  pole: POLE_ENUM,
  questions: z
    .array(
      z.object({
        axis: AXIS_ENUM.describe('裏側の軸（メタデータ・ユーザーには見せない）'),
        question: z
          .string()
          .describe(
            '具体的な日常場面が浮かぶ質問。閉じた問いではなく、ユーザーが選択肢から選べば伝わるように書く。軸名そのものは書かない。',
          ),
        options: z
          .array(z.string())
          .min(3)
          .max(5)
          .describe(
            'その質問に対する選択肢を3〜5個。各選択肢は10〜20字程度で短く。軸の範囲を広げて網羅する。「どちらとも言えない」「覚えていない」など中立選択肢を1つ含めてよい。',
          ),
      }),
    )
    .min(1)
    .max(6)
    .describe(
      'この項目に対する質問。2個または3個が理想。必ず6個以内。',
    ),
})

const QuestionsResponseSchema = z.object({
  items: z.array(QuestionItemSchema),
})

export type QuestionsResponse = z.infer<typeof QuestionsResponseSchema>
export type ItemQuestions = z.infer<typeof QuestionItemSchema>

// ---- ③ 見る: 反射＋反転 ----

const ReflectionItemSchema = z.object({
  text: z.string(),
  pole: POLE_ENUM,
  reflection: z
    .string()
    .describe(
      '「教えてくれた『〜』から見えるのは、〜に傾く」調。事実→傾向の順で2〜3文。育ち・経歴は推測しない。',
    ),
  inversion: z
    .string()
    .describe(
      '「もし条件が〜だったら／同じ軸の別の位置にいる人は〜」のニュアンスで、ユーザー自身の別条件下の感覚として書く。別人扱いしない。1〜2文。',
    ),
  keyAxis: AXIS_ENUM.describe('最も効いている軸'),
  axisSide: AXIS_SIDE_ENUM.describe(
    'keyAxis上の位置。left=外発・消耗側（頼まれて/曖昧/切り離し/比較/緊張/追われる）、right=内発・報酬側（自分で選んだ/手応えあり/繋がる/安全/緩み/余裕）、middle=中間または判定不能。ユーザーの選択肢・補足から判定する。',
  ),
})

const ReflectionResponseSchema = z.object({
  items: z.array(ReflectionItemSchema),
})

export type ReflectionResponse = z.infer<typeof ReflectionResponseSchema>
export type ItemReflection = z.infer<typeof ReflectionItemSchema>

// ---- ④ 持ち帰る ----

const TakeawaySchema = z.object({
  perItem: z
    .array(
      z.object({
        text: z.string().describe('元の項目テキスト'),
        pole: POLE_ENUM.describe('その項目の極。他方に触れない。'),
        response: z
          .string()
          .describe(
            'この項目に対する1〜2文の個別返し。ユーザーの意図と反射を踏まえる。反対極の項目には一切触れない。',
          ),
      }),
    )
    .describe('各項目への個別レスポンス。好きと辛いの文面は必ず独立させる。'),
  points: z
    .array(
      z.object({
        title: z.string(),
        body: z.string().describe('1〜2文'),
      }),
    )
    .length(3)
    .describe(
      '3点。構成: ①意図を踏まえた後押し、②明日の一歩への応答、③同じ軸の別の位置の角度。',
    ),
  personalNote: z
    .string()
    .describe(
      'ユーザーの具体回答を1〜2個引用した、個別化された締め1段落（3〜4文）。温度のある語り口。',
    ),
})

export type Takeaway = z.infer<typeof TakeawaySchema>
export type TakeawayPerItem = z.infer<typeof TakeawaySchema>['perItem'][number]

// ---- API client helpers ----

function makeClient(apiKey: string) {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

const MAX_TOKENS = 4096

function systemBlocks() {
  return [
    {
      type: 'text' as const,
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' as const },
    },
  ]
}

function poleLabel(p: Pole): string {
  return p === 'like' ? '好き' : '辛い'
}

// ---- ② 質問生成 ----
// 設計方針: pole（好き/辛い）ごとに独立した API 呼び出しを行い、AI の
// コンテキスト上で両極の分析結果が混在しないようにする。

function questionsUserPrompt(items: string[], pole: Pole): string {
  const header =
    pole === 'like'
      ? 'ユーザーが「好きなこと」として書きだした項目のみです。辛いことは一切含まれていません。'
      : 'ユーザーが「辛いこと」として書きだした項目のみです。好きなことは一切含まれていません。'
  return [
    header,
    '各項目について、6軸から最も関連する軸を選んで質問を生成してください。',
    '',
    '制約（厳守）:',
    '- questions は 1 項目あたり **ちょうど2個または3個**。4個以上にしないこと。',
    '- 各質問に options を **3〜5個** 必ず添える（多くしすぎない）。',
    '- 選択肢は10〜20字の短いフレーズ。軸の範囲を広げて網羅する。',
    '- 軸名（"選択" 等）は出さない。ユーザーは軸を意識しない。',
    '- 「どちらとも言えない」などの中立選択肢を1つ含めてよい。',
    `- すべての項目の pole は必ず "${pole}" とする。反対極に触れない。`,
    '',
    'ユーザーは選択肢をクリックするだけでも、補足を自由記入してもよい想定です。',
    '',
    `${pole === 'like' ? '💚 好きなこと' : '💔 辛いこと'}:`,
    ...items.map((s) => `- ${s}`),
    '',
    '各項目について、items[].text には元の項目テキストをそのまま返してください。',
  ].join('\n')
}

export async function generateQuestionsAI(
  apiKey: string,
  model: AIModel,
  items: string[],
  pole: Pole,
): Promise<QuestionsResponse> {
  if (items.length === 0) return { items: [] }
  const client = makeClient(apiKey)
  const resp = await client.messages.parse({
    model,
    max_tokens: MAX_TOKENS,
    system: systemBlocks(),
    messages: [{ role: 'user', content: questionsUserPrompt(items, pole) }],
    output_config: { format: zodOutputFormat(QuestionsResponseSchema) },
  })
  if (!resp.parsed_output) throw new Error('AIレスポンスをパースできませんでした')
  // 念のため pole をクライアント側で強制上書き（LLM のうっかり防止）
  return {
    items: resp.parsed_output.items.map((it) => ({ ...it, pole })),
  }
}

// ---- ③ 反射生成 ----

export type AnsweredItem = {
  text: string
  pole: Pole
  answers: {
    axis: Axis
    question: string
    selectedOption: string
    note: string
  }[]
}

function formatAnswer(a: AnsweredItem['answers'][number]): string {
  const opt = a.selectedOption.trim()
  const note = a.note.trim()
  const parts: string[] = []
  if (opt) parts.push(`選択: ${opt}`)
  if (note) parts.push(`補足: ${note}`)
  return parts.length > 0 ? parts.join(' / ') : '（無回答）'
}

function reflectionUserPrompt(items: AnsweredItem[], pole: Pole): string {
  const header =
    pole === 'like'
      ? 'ユーザーが「好きなこと」として書いた項目への回答です。辛い項目は含まれていません。反射も好き側だけに集中してください。'
      : 'ユーザーが「辛いこと」として書いた項目への回答です。好き項目は含まれていません。反射も辛い側だけに集中してください。'
  const blocks = items.map((it, i) => {
    const ans =
      it.answers.length > 0
        ? it.answers
            .map(
              (a) =>
                `  - 軸:${a.axis}\n    質問: ${a.question}\n    回答: ${formatAnswer(a)}`,
            )
            .join('\n')
        : '  （回答なし）'
    return `[${i + 1}] 「${it.text}」\n${ans}`
  })
  return [
    header,
    '事実から反射してください。',
    '',
    ...blocks,
    '',
    '各項目について:',
    `- pole は必ず "${pole}" を返す。反対極に触れない。`,
    '- reflection: 「教えてくれた『〜』から見えるのは、〜に傾く」調で2〜3文。選択肢の文言または補足を可能なら引用する。育ち・経歴は推測しない。',
    '- inversion: 「もし条件が〜だったら／同じ軸の別の位置にいる人は〜」のニュアンスで1〜2文。別人扱いしない。',
    '- keyAxis: 最も効いている軸。',
    '- axisSide: ユーザーの回答から判定。left=外発・消耗側 / middle=中間・判定不能 / right=内発・報酬側。',
    '  軸ごとの判定基準:',
    '    選択: left=頼まれて・迫られて / right=自分で選んだ',
    '    手応え: left=曖昧・見えにくい / right=手応えあり',
    '    意味: left=価値観と切り離し / right=価値観と繋がる',
    '    場: left=比較・中断・評価の場 / right=安全・集中できる場',
    '    身体: left=緊張・疲弊 / right=緩み・整い',
    '    時間: left=追われている / right=余裕あり',
    '回答が空の項目は、項目テキスト自体から推測しすぎず、axisSide は middle とし、簡潔に書く。',
  ].join('\n')
}

export async function generateReflectionAI(
  apiKey: string,
  model: AIModel,
  items: AnsweredItem[],
  pole: Pole,
): Promise<ReflectionResponse> {
  if (items.length === 0) return { items: [] }
  const client = makeClient(apiKey)
  const resp = await client.messages.parse({
    model,
    max_tokens: MAX_TOKENS,
    system: systemBlocks(),
    messages: [{ role: 'user', content: reflectionUserPrompt(items, pole) }],
    output_config: { format: zodOutputFormat(ReflectionResponseSchema) },
  })
  if (!resp.parsed_output) throw new Error('AIレスポンスをパースできませんでした')
  return {
    items: resp.parsed_output.items.map((it) => ({ ...it, pole })),
  }
}

// ---- ④ 持ち帰る ----

export type IntentionItem = {
  text: string
  pole: Pole
  option: string
  note: string
}

export type NextStep = {
  option: string
  note: string
}

function formatIntentionOrStep(option: string, note: string): string {
  const o = option.trim()
  const n = note.trim()
  if (o && n) return `${o}（${n}）`
  if (o) return o
  if (n) return n
  return '（未回答）'
}

function takeawayUserPrompt(
  items: AnsweredItem[],
  reflections: ItemReflection[],
  intentions: IntentionItem[],
  nextStep: NextStep,
): string {
  const reflMap = new Map<string, ItemReflection>()
  reflections.forEach((r) => reflMap.set(`${r.pole}::${r.text.trim()}`, r))
  const intMap = new Map<string, IntentionItem>()
  intentions.forEach((it) => intMap.set(`${it.pole}::${it.text.trim()}`, it))

  const blocks = items.map((it, i) => {
    const r = reflMap.get(`${it.pole}::${it.text.trim()}`)
    const intent = intMap.get(`${it.pole}::${it.text.trim()}`)
    const ans =
      it.answers
        .filter((a) => a.selectedOption.trim() || a.note.trim())
        .map((a) => `    ・${a.question} → ${formatAnswer(a)}`)
        .join('\n') || '    （回答なし）'
    return [
      `[${i + 1}] ${poleLabel(it.pole)}: 「${it.text}」`,
      `  回答:\n${ans}`,
      r ? `  反射: ${r.reflection}` : '',
      r ? `  反転: ${r.inversion}` : '',
      intent
        ? `  意図: ${formatIntentionOrStep(intent.option, intent.note)}`
        : '  意図: （未回答）',
    ]
      .filter(Boolean)
      .join('\n')
  })

  const nextStepText = formatIntentionOrStep(nextStep.option, nextStep.note)

  return [
    'ここまでに集まったユーザー自身の事実・反射・意図と、「明日1つ試すとしたら」の一歩です。',
    'これらを踏まえて、perItem（各項目への個別返し）、points（3点のまとめ）、personalNote を書いてください。',
    '',
    ...blocks,
    '',
    `今夜／明日1つ試すとしたら: ${nextStepText}`,
    '',
    'ルール:',
    '- perItem: 各項目に1〜2文の個別返し。pole によって語り口を必ず変えること。',
    '  * pole = like (好き): 「守る／壊さない」フレーミング。',
    '    いまその好きを支えている条件は何か、その条件をどう保つか、を中心に書く。',
    '    動かすことを促さない（既に良い場所にいる）。',
    '  * pole = hard (辛い): 「動かす／緩める」フレーミング。',
    '    どの条件を半歩動かせそうか、を中心に書く。',
    '    全部動かさせない。1つだけ。',
    '  * 反対極の項目に一切触れない。pole は元の項目に合わせて正しく返す。',
    '- points は3つ。構成:',
    '  ① 意図を踏まえた具体的な後押し（辛いがあれば動かす方向、好きしかなければ守る方向）。',
    '  ② 「明日1つ試すとしたら」の一歩への肯定／微調整（書かれていれば引用、なければ軽い提案）。',
    '  ③ 「同じ軸の別の位置」「条件が動けば感覚も動く」の角度を必ず1つ入れる。',
    '- points の body は1〜2文、温度のある語り口。説教っぽくしない。',
    '- personalNote はユーザーの具体回答と意図を必ず1〜2個引用して3〜4文。',
    '  「〜と教えてくれましたね」「〜したいと書いてくれました」のように事実を受けた語り口で。',
    '- 重要な制約: 全軸を右側（内発・報酬側）に寄せることを目標にしない。',
    '  ユーザーが動かしたい1軸を半歩動かす、それで十分という前提で書く。',
    '- 断定や一般論で埋めないこと。',
  ].join('\n')
}

export async function generateTakeawayAI(
  apiKey: string,
  model: AIModel,
  items: AnsweredItem[],
  reflections: ItemReflection[],
  intentions: IntentionItem[],
  nextStep: NextStep,
): Promise<Takeaway> {
  const client = makeClient(apiKey)
  const resp = await client.messages.parse({
    model,
    max_tokens: MAX_TOKENS,
    system: systemBlocks(),
    messages: [
      {
        role: 'user',
        content: takeawayUserPrompt(items, reflections, intentions, nextStep),
      },
    ],
    output_config: { format: zodOutputFormat(TakeawaySchema) },
  })
  if (!resp.parsed_output) throw new Error('AIレスポンスをパースできませんでした')
  return resp.parsed_output
}
