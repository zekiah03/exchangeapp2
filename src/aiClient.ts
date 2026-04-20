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
    .min(2)
    .max(3),
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
})

const ReflectionResponseSchema = z.object({
  items: z.array(ReflectionItemSchema),
})

export type ReflectionResponse = z.infer<typeof ReflectionResponseSchema>
export type ItemReflection = z.infer<typeof ReflectionItemSchema>

// ---- ④ 持ち帰る ----

const TakeawaySchema = z.object({
  points: z
    .array(
      z.object({
        title: z.string(),
        body: z.string().describe('1〜2文'),
      }),
    )
    .length(3)
    .describe(
      '3点。少なくとも1つは「同じ軸の別の位置」または「条件が動けば感覚も動く」のニュアンスを含めること。',
    ),
  personalNote: z
    .string()
    .describe(
      'ユーザーの具体回答を1〜2個引用した、個別化された締め1段落（3〜4文）。温度のある語り口。',
    ),
})

export type Takeaway = z.infer<typeof TakeawaySchema>

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

type PoleItems = { like: string[]; hard: string[] }

function poleLabel(p: Pole): string {
  return p === 'like' ? '好き' : '辛い'
}

function describeItems(items: PoleItems): string {
  const block = (label: string, arr: string[]) =>
    arr.length > 0
      ? `${label}:\n${arr.map((s) => `- ${s}`).join('\n')}`
      : `${label}: （未入力）`
  return [block('💚 好きなこと', items.like), block('💔 辛いこと', items.hard)].join('\n\n')
}

// ---- ② 質問生成 ----

function questionsUserPrompt(items: PoleItems): string {
  return [
    'ユーザーが書き出した項目です。各項目に対して、6軸から最も関連する2〜3軸を選び、',
    '軸名は出さずに、具体的な日常場面が浮かぶ質問を書いてください。',
    '各質問には3〜5個の選択肢（options）を必ず添えてください。',
    '選択肢は、ユーザーがクリック1回で選べる短いフレーズ（10〜20字）で、その軸の範囲を広げて網羅するようにする。',
    '「どちらとも言えない」「覚えていない」などの中立選択肢を1つ含めてよい。',
    'ユーザーは選択肢を選ぶだけでも、補足を自由記入してもよい想定です。',
    '',
    describeItems(items),
    '',
    '各項目について、items[].text には元の項目テキストをそのまま返し、pole も対応する側を返してください。',
  ].join('\n')
}

export async function generateQuestionsAI(
  apiKey: string,
  model: AIModel,
  items: PoleItems,
): Promise<QuestionsResponse> {
  const client = makeClient(apiKey)
  const resp = await client.messages.parse({
    model,
    max_tokens: MAX_TOKENS,
    system: systemBlocks(),
    messages: [{ role: 'user', content: questionsUserPrompt(items) }],
    output_config: { format: zodOutputFormat(QuestionsResponseSchema) },
  })
  if (!resp.parsed_output) throw new Error('AIレスポンスをパースできませんでした')
  return resp.parsed_output
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

function reflectionUserPrompt(items: AnsweredItem[]): string {
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
    return `[${i + 1}] ${poleLabel(it.pole)}: 「${it.text}」\n${ans}`
  })
  return [
    'ユーザーが質問に答えてくれました（選択肢 + 任意の補足）。事実から反射してください。',
    '',
    ...blocks,
    '',
    '各項目について:',
    '- reflection: 「教えてくれた『〜』から見えるのは、〜に傾く」調で2〜3文。選択肢の文言または補足を可能なら引用する。育ち・経歴は推測しない。',
    '- inversion: 「もし条件が〜だったら／同じ軸の別の位置にいる人は〜」のニュアンスで1〜2文。別人扱いしない。',
    '- keyAxis: 最も効いている軸。',
    '回答が空の項目は、項目テキスト自体から推測しすぎず、簡潔に。',
  ].join('\n')
}

export async function generateReflectionAI(
  apiKey: string,
  model: AIModel,
  items: AnsweredItem[],
): Promise<ReflectionResponse> {
  const client = makeClient(apiKey)
  const resp = await client.messages.parse({
    model,
    max_tokens: MAX_TOKENS,
    system: systemBlocks(),
    messages: [{ role: 'user', content: reflectionUserPrompt(items) }],
    output_config: { format: zodOutputFormat(ReflectionResponseSchema) },
  })
  if (!resp.parsed_output) throw new Error('AIレスポンスをパースできませんでした')
  return resp.parsed_output
}

// ---- ④ 持ち帰る ----

function takeawayUserPrompt(
  items: AnsweredItem[],
  reflections: ItemReflection[],
): string {
  const reflMap = new Map<string, ItemReflection>()
  reflections.forEach((r) => reflMap.set(`${r.pole}::${r.text.trim()}`, r))
  const blocks = items.map((it, i) => {
    const r = reflMap.get(`${it.pole}::${it.text.trim()}`)
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
    ]
      .filter(Boolean)
      .join('\n')
  })
  return [
    'ここまでに集まったユーザー自身の事実と、それに対する反射・反転です。',
    'ユーザーが今日持ち帰れる気付きを points として3つ、個別化された一段落を personalNote として書いてください。',
    '',
    ...blocks,
    '',
    'ルール:',
    '- points は3つ。少なくとも1つは「同じ軸の別の位置」または「条件が動けば感覚も動く」のニュアンスを含める。',
    '- personalNote はユーザーの具体回答を1〜2個引用して3〜4文。温度のある語り口で。',
  ].join('\n')
}

export async function generateTakeawayAI(
  apiKey: string,
  model: AIModel,
  items: AnsweredItem[],
  reflections: ItemReflection[],
): Promise<Takeaway> {
  const client = makeClient(apiKey)
  const resp = await client.messages.parse({
    model,
    max_tokens: MAX_TOKENS,
    system: systemBlocks(),
    messages: [{ role: 'user', content: takeawayUserPrompt(items, reflections) }],
    output_config: { format: zodOutputFormat(TakeawaySchema) },
  })
  if (!resp.parsed_output) throw new Error('AIレスポンスをパースできませんでした')
  return resp.parsed_output
}
