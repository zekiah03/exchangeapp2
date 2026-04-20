// 反転した人間がなぜそう感じるに至ったのか、を
// 構造分析の「8軸 × 4層」から決定的に組み立てる。
// 入力テキストから seed を作り、同じ入力には同じ経緯が返る。

export type Pole = 'like' | 'hard'

export type AxisKey =
  | 'skill'
  | 'autonomy'
  | 'direction'
  | 'feedback'
  | 'meaning'
  | 'condition'
  | 'context'
  | 'time'

export type LayerKey = 'L1' | 'L2' | 'L3' | 'L4'

type AxisEntry = {
  key: AxisKey
  label: string
  icon: string
  likeNarrative: string // 好きになった側の経緯
  hardNarrative: string // 辛くなった側の経緯
}

type LayerEntry = {
  key: LayerKey
  label: string
  title: string
  likeShift: string
  hardShift: string
}

const AXES: AxisEntry[] = [
  {
    key: 'skill',
    label: 'スキルと課題',
    icon: '🎯',
    likeNarrative:
      '小さな場から入り、力量と課題がちょうど釣り合う瞬間にフローが訪れた',
    hardNarrative:
      'いきなり難度の高い場に置かれ、力量が課題に追いつかないまま消耗した',
  },
  {
    key: 'autonomy',
    label: '自律性',
    icon: '🧭',
    likeNarrative: '誰かに命じられてではなく、自分で選び取れる範囲で試せた',
    hardNarrative:
      'やらされる形でしか触れたことがなく、自分の選択にならなかった',
  },
  {
    key: 'direction',
    label: '動機の向き',
    icon: '🌱',
    likeNarrative: '評価のためではなく、純粋な興味や意味の方が先に立っていた',
    hardNarrative:
      '評価や回避のために続けるうちに、動機が外側だけに寄ってしまった',
  },
  {
    key: 'feedback',
    label: 'フィードバック',
    icon: '🔁',
    likeNarrative: '取り組むたび明確な手応えがすぐに返ってくる環境があった',
    hardNarrative: '結果が遠く曖昧で、手応えのないまま時間だけが過ぎた',
  },
  {
    key: 'meaning',
    label: '意味づけ',
    icon: '🧵',
    likeNarrative: '自分の価値観や物語と、この行為が自然につながっていた',
    hardNarrative:
      '自分の価値観から切り離された文脈でだけ、この行為を要求されてきた',
  },
  {
    key: 'condition',
    label: '心身コンディション',
    icon: '🌤',
    likeNarrative: '心身が整っているときに触れられ、行為そのものを味わえた',
    hardNarrative: '疲弊したときに課され続け、行為自体が負荷と結びついた',
  },
  {
    key: 'context',
    label: '環境・文脈',
    icon: '🏠',
    likeNarrative: '比較や中断の少ない、安全で集中できる場でこれに出会った',
    hardNarrative: '評価・比較・中断の多い状況でしか経験を積めなかった',
  },
  {
    key: 'time',
    label: '時間の余白',
    icon: '⏳',
    likeNarrative: '締切に追われず、自分のペースで深めていける余白があった',
    hardNarrative: '常に締切や他の用事に追われ、余裕のない接し方しかできなかった',
  },
]

const LAYERS: LayerEntry[] = [
  {
    key: 'L1',
    label: 'L1 / WHY',
    title: '動機の源泉',
    likeShift: '動機の出発点そのものが「好奇心」側に置かれている',
    hardShift: '動機の出発点が「義務感」側に固定されている',
  },
  {
    key: 'L2',
    label: 'L2 / HOW',
    title: '行動の質',
    likeShift: '関わり方が「没頭・楽しむ」側に寄っている',
    hardShift: '関わり方が「努力・耐える」側に寄っている',
  },
  {
    key: 'L3',
    label: 'L3 / FEEL',
    title: '過程での体感',
    likeShift: '過程で味わう感覚が「フロー・充実」側に傾いている',
    hardShift: '過程で味わう感覚が「苦労・我慢」側に傾いている',
  },
  {
    key: 'L4',
    label: 'L4 / VALUE',
    title: '価値の所在',
    likeShift: '報酬を「過程そのもの」に置いている',
    hardShift: '報酬を「結果」にだけ置かされている',
  },
]

function fnv1a(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function nextSeed(seed: number): number {
  // 線形合同風の撹拌。最後に >>> 0 で必ず unsigned 32bit に正規化する。
  // （0x9e3779b9 >= 2^31 のため、XOR だけだと JS の符号付き扱いで負値になる）
  const x = Math.imul(seed ^ (seed >>> 15), 0x85ebca6b) >>> 0
  return (x ^ 0x9e3779b9) >>> 0
}

function pickIndices(seed: number, poolSize: number, count: number): number[] {
  const pool = Array.from({ length: poolSize }, (_, i) => i)
  const picked: number[] = []
  let s = (seed || 1) >>> 0
  for (let i = 0; i < count && pool.length > 0; i++) {
    s = nextSeed(s)
    const idx = s % pool.length
    picked.push(pool[idx])
    pool.splice(idx, 1)
  }
  return picked
}

export type Narrative = {
  layer: {
    key: LayerKey
    label: string
    title: string
    shift: string
  }
  axes: {
    key: AxisKey
    label: string
    icon: string
    narrative: string
  }[]
}

export function generateNarrative(text: string, pole: Pole): Narrative {
  const seed = fnv1a(`${pole}::${text.trim()}`)
  const layerIdx = nextSeed(seed) % LAYERS.length
  const axisIdxs = pickIndices(seed, AXES.length, 2)

  const layer = LAYERS[layerIdx]

  return {
    layer: {
      key: layer.key,
      label: layer.label,
      title: layer.title,
      shift: pole === 'like' ? layer.likeShift : layer.hardShift,
    },
    axes: axisIdxs.map((i) => {
      const a = AXES[i]
      return {
        key: a.key,
        label: a.label,
        icon: a.icon,
        narrative: pole === 'like' ? a.likeNarrative : a.hardNarrative,
      }
    }),
  }
}

export function formatNarrativeAsText(n: Narrative): string {
  const head = `  [${n.layer.label} / ${n.layer.title}] ${n.layer.shift}`
  const body = n.axes
    .map((a) => `  ${a.icon} ${a.label}: ${a.narrative}`)
    .join('\n')
  return `${head}\n${body}`
}

// ---- 時系列ストーリー版（自分を紐解く用）----
// 環境・文脈・時間・条件を中心に、過去→積み重ね→現在の3幕で語る。

const STORY_LIKE_ENCOUNTER: string[] = [
  '最初にこれに触れたのは、比較や中断の少ない、安全に試せる場だった',
  '最初にこれに触れたのは、誰かに命じられたのではなく、自分で手を伸ばせる距離感だった',
  '最初にこれに触れたのは、自分の意味や価値観と自然に重なる文脈だった',
  '最初にこれに触れたのは、手応えがすぐ返ってくる、ちょうど良い難度の場だった',
]

const STORY_LIKE_ACCUM: string[] = [
  '自分のペースで繰り返すうちに、小さな手応えが少しずつ積み上がっていった',
  '締切に追われない余白の中で、動作と感覚が深く結びついていった',
  '心身が整った瞬間にだけ触れられたので、行為そのものを味わう回路が育った',
  '結果より過程に目が向く関わり方が、気づかぬうちに身についた',
]

const STORY_HARD_ENCOUNTER: string[] = [
  '最初にこれを課されたのは、評価や比較、中断の多い場だった',
  '最初にこれを課されたのは、自分で選んだのではなく、命じられた文脈だった',
  '最初にこれを課されたのは、自分の意味や価値観と切り離された場面だった',
  '最初にこれを課されたのは、結果が遠く曖昧で、手応えを得にくい関わり方だった',
]

const STORY_HARD_ACCUM: string[] = [
  '追われる時間の中で接し続けた結果、余白そのものが失われていった',
  '疲弊したときにも課され続けた結果、行為自体が負荷と強く結びついた',
  '比較と評価の中で繰り返すうちに、自分の感覚が少しずつ鈍っていった',
  '結果だけが問われる関わり方が続き、動機の向きが外側に固定された',
]

const STORY_PRESENT_BY_LAYER_LIKE: Record<LayerKey, string> = {
  L1: '気づけば、義務ではなく好奇心の側から手が伸びるようになっていた',
  L2: '気づけば、努力ではなく没頭の側で関われるようになっていた',
  L3: '気づけば、苦労ではなくフローの側で過程を味わえるようになっていた',
  L4: '気づけば、結果ではなく過程そのものを報酬として感じるようになっていた',
}

const STORY_PRESENT_BY_LAYER_HARD: Record<LayerKey, string> = {
  L1: '今では、義務感に引っ張られないと、これには向かえなくなっている',
  L2: '今では、耐える姿勢でしかこれに関われなくなっている',
  L3: '今では、苦労や我慢の感覚を伴わずには、これに触れられなくなっている',
  L4: '今では、結果だけが価値の置き所に固定されてしまっている',
}

export type StoryStage = {
  tag: string
  text: string
}

export type Story = {
  layer: {
    key: LayerKey
    label: string
    title: string
  }
  stages: StoryStage[]
}

export function generateStory(text: string, pole: Pole): Story {
  const seed = fnv1a(`story::${pole}::${text.trim()}`)
  const s1 = nextSeed(seed)
  const s2 = nextSeed(s1)
  const s3 = nextSeed(s2)

  const encounterPool = pole === 'like' ? STORY_LIKE_ENCOUNTER : STORY_HARD_ENCOUNTER
  const accumPool = pole === 'like' ? STORY_LIKE_ACCUM : STORY_HARD_ACCUM

  const encounter = encounterPool[s1 % encounterPool.length]
  const accum = accumPool[s2 % accumPool.length]

  const layer = LAYERS[s3 % LAYERS.length]
  const presentMap =
    pole === 'like' ? STORY_PRESENT_BY_LAYER_LIKE : STORY_PRESENT_BY_LAYER_HARD
  const present = presentMap[layer.key]

  return {
    layer: { key: layer.key, label: layer.label, title: layer.title },
    stages: [
      { tag: '出会い', text: encounter },
      { tag: '積み重ね', text: accum },
      { tag: '現在', text: present },
    ],
  }
}

export function formatStoryAsText(s: Story): string {
  const lines = s.stages.map((st, i) => {
    if (i === s.stages.length - 1) {
      return `  ◇ ${st.tag} [${s.layer.label} / ${s.layer.title}] — ${st.text}`
    }
    return `  ◇ ${st.tag} — ${st.text}`
  })
  return lines.join('\n')
}
