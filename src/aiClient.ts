import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import type { AIModel } from './aiSettings'

const SYSTEM_PROMPT = `あなたは「反転人間紹介アプリ」の分析アシスタントです。

# フレームワーク

共通軸: 外発・消耗極 ⇄ 内発・報酬極
（外から与えられた動機で消耗する側 ⇄ 内から湧く動機で過程自体が報酬になる側）

4つの層:
- L1 / WHY (動機の源泉): 義務感 ⇄ 好奇心
- L2 / HOW (行動の質): 努力/耐える ⇄ 没頭/楽しむ
- L3 / FEEL (過程での体感): 苦労/我慢 ⇄ フロー/充実
- L4 / VALUE (価値の所在): 結果が全て ⇄ 過程が報酬

8つの条件軸（"axis"の値として使う）:
- "スキルと課題"（技能と難度の釣り合い）
- "自律性"（自分で選べたか）
- "動機の向き"（外発 or 内発）
- "フィードバック"（手応え）
- "意味づけ"（価値観との繋がり）
- "心身コンディション"（疲弊か整いか）
- "環境・文脈"（比較/中断 vs 安全/集中）
- "時間の余白"（追われる vs ペース配分）

# 言葉遣い

- 具体的で温度のある語り口。紋切り型（「〜しました」「大切です」等）を避ける。
- 「親が〜だった」「中学時代に〜」「就職してから〜」のように、生活の手触りのある固有の描写を入れる。
- 1つのストーリーが2〜3文で完結するように凝縮する。
- 「〜だろう」「〜らしい」等の推量で締めて、断定を避ける（推定であることを残す）。
- 出力は必ず指定されたJSONスキーマに沿うこと。余計な前置きや説明文は書かない。`

const AXIS_ENUM = z.enum([
  'スキルと課題',
  '自律性',
  '動機の向き',
  'フィードバック',
  '意味づけ',
  '心身コンディション',
  '環境・文脈',
  '時間の余白',
])

const LAYER_ENUM = z.enum(['L1', 'L2', 'L3', 'L4'])

// ---- 気付き（反転人間の人生経緯）----

const InvertItemSchema = z.object({
  text: z.string().describe('元の項目テキスト'),
  backstory: z
    .string()
    .describe(
      'この行為を愛する（または苦手とする）に至った、反転人間の生活の手触りある経緯を2〜3文で。親や学校・職場、転機となった場面などを具体に。',
    ),
  keyLayer: LAYER_ENUM.describe('最も反転が起きている層'),
  layerShift: z
    .string()
    .describe('その層でどう感覚が傾いているかを1文（例：義務感ではなく好奇心側から手が伸びる）'),
  conditions: z
    .array(
      z.object({
        axis: AXIS_ENUM,
        detail: z.string().describe('その条件が反転人間にどう作用したかの具体描写。1文'),
      }),
    )
    .min(2)
    .max(3)
    .describe('8軸のうち、このケースで最も効いている条件を2〜3個選ぶ'),
})

const InvertResponseSchema = z.object({
  items: z.array(InvertItemSchema),
})

export type InvertResponse = z.infer<typeof InvertResponseSchema>

// ---- 自己分析（ユーザー自身の時系列ストーリー）----

const SelfItemSchema = z.object({
  text: z.string().describe('元の項目テキスト'),
  stages: z
    .array(
      z.object({
        tag: z.enum(['出会い', '積み重ね', '現在']),
        text: z
          .string()
          .describe(
            '2〜3文で、環境・文脈・時間を中心に、この行為に対するユーザーの感覚がどう形成されていったかを推定する。',
          ),
      }),
    )
    .length(3),
  keyLayer: LAYER_ENUM.describe('定着した層'),
})

const SelfResponseSchema = z.object({
  items: z.array(SelfItemSchema),
})

export type SelfResponse = z.infer<typeof SelfResponseSchema>

// ---- 納得（まとめ）----

const TakeawaySchema = z.object({
  points: z
    .array(
      z.object({
        title: z.string().describe('気付きの見出し'),
        body: z.string().describe('1〜2文の本文'),
      }),
    )
    .length(3),
  personalNote: z
    .string()
    .describe('ユーザーの具体項目を1〜2個引用した、個別化された締めくくり1段落（3〜4文）'),
})

export type Takeaway = z.infer<typeof TakeawaySchema>

// ---- API Client ----

function makeClient(apiKey: string) {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

const MAX_TOKENS = 4096

type Pole = 'like' | 'hard'

function poleLabel(p: Pole): string {
  return p === 'like' ? '好き（その行為を愛している）' : '辛い（その行為を苦手・消耗している）'
}

function invertUserPrompt(items: string[], pole: Pole): string {
  const opposite: Pole = pole === 'like' ? 'hard' : 'like'
  return [
    `以下の項目は、あるユーザーが「${poleLabel(opposite)}」と感じている行為です。`,
    `これらを逆に「${poleLabel(pole)}」と感じる別の人間が実在するとして、その人の人生経緯を推定してください。`,
    '',
    '項目:',
    ...items.map((s) => `- ${s}`),
    '',
    '各項目について、フレームワークを踏まえて人生経緯（backstory）、定着した層（keyLayer/layerShift）、効いている条件（conditions）をJSONで返してください。',
  ].join('\n')
}

function selfUserPrompt(items: string[], pole: Pole): string {
  return [
    `以下はあるユーザーが「${poleLabel(pole)}」と感じている行為です。`,
    'なぜその人が今そう感じているのかを、環境・時間・文脈を中心に、過去→積み重ね→現在の3段で推定してください。',
    '',
    '項目:',
    ...items.map((s) => `- ${s}`),
    '',
    '各項目について、3段(tag: 出会い/積み重ね/現在)のstagesと、定着した層(keyLayer)をJSONで返してください。',
  ].join('\n')
}

function takeawayUserPrompt(likeItems: string[], hardItems: string[]): string {
  return [
    'ここまでで、あるユーザーについて反転人間の推定と自己分析を行いました。',
    'ユーザーの具体項目を踏まえ、「気付き→自己分析」の後に腑に落ちる「納得のまとめ」を組み立ててください。',
    '',
    `好きなこと: ${likeItems.length > 0 ? likeItems.map((s) => `「${s}」`).join(' / ') : '（未入力）'}`,
    `辛いこと: ${hardItems.length > 0 ? hardItems.map((s) => `「${s}」`).join(' / ') : '（未入力）'}`,
    '',
    'ルール:',
    '- points は必ず3つ。紋切り型ではなく、反転がなぜ成立するか構造的に示す。',
    '- personalNote は上記の具体項目を1〜2個引用して、ユーザーに向けた個別の所感（3〜4文）を書く。',
    '- 「同じ人間の中に両極が共存している」「違いは経緯であり人柄ではない」のどちらかの角度を必ず含める。',
  ].join('\n')
}

function systemBlocks() {
  // system prompt is stable across calls → cache for repeat usage
  return [
    {
      type: 'text' as const,
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' as const },
    },
  ]
}

export async function generateInvertAI(
  apiKey: string,
  model: AIModel,
  items: string[],
  pole: Pole,
): Promise<InvertResponse> {
  const client = makeClient(apiKey)
  const resp = await client.messages.parse({
    model,
    max_tokens: MAX_TOKENS,
    system: systemBlocks(),
    messages: [{ role: 'user', content: invertUserPrompt(items, pole) }],
    output_config: { format: zodOutputFormat(InvertResponseSchema) },
  })
  if (!resp.parsed_output) {
    throw new Error('AIレスポンスをパースできませんでした')
  }
  return resp.parsed_output
}

export async function generateSelfAI(
  apiKey: string,
  model: AIModel,
  items: string[],
  pole: Pole,
): Promise<SelfResponse> {
  const client = makeClient(apiKey)
  const resp = await client.messages.parse({
    model,
    max_tokens: MAX_TOKENS,
    system: systemBlocks(),
    messages: [{ role: 'user', content: selfUserPrompt(items, pole) }],
    output_config: { format: zodOutputFormat(SelfResponseSchema) },
  })
  if (!resp.parsed_output) {
    throw new Error('AIレスポンスをパースできませんでした')
  }
  return resp.parsed_output
}

export async function generateTakeawayAI(
  apiKey: string,
  model: AIModel,
  likeItems: string[],
  hardItems: string[],
): Promise<Takeaway> {
  const client = makeClient(apiKey)
  const resp = await client.messages.parse({
    model,
    max_tokens: MAX_TOKENS,
    system: systemBlocks(),
    messages: [{ role: 'user', content: takeawayUserPrompt(likeItems, hardItems) }],
    output_config: { format: zodOutputFormat(TakeawaySchema) },
  })
  if (!resp.parsed_output) {
    throw new Error('AIレスポンスをパースできませんでした')
  }
  return resp.parsed_output
}
