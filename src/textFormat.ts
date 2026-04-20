import {
  formatNarrativeAsText,
  formatStoryAsText,
  generateNarrative,
  generateStory,
  type Pole,
} from './generateNarrative'

function renderNarrativeBlock(items: string[], pole: Pole): string {
  if (items.length === 0) return '（未入力）'
  return items
    .map((s) => `・${s}\n${formatNarrativeAsText(generateNarrative(s, pole))}`)
    .join('\n\n')
}

function renderStoryBlock(items: string[], pole: Pole): string {
  if (items.length === 0) return '（未入力）'
  return items
    .map((s) => `・${s}\n${formatStoryAsText(generateStory(s, pole))}`)
    .join('\n\n')
}

export function buildIntroText(likeItems: string[], hardItems: string[]): string {
  const likeBlock = renderNarrativeBlock(hardItems, 'like')
  const hardBlock = renderNarrativeBlock(likeItems, 'hard')
  return `こんな人間がいます\n\n💚 好きなこと\n${likeBlock}\n\n💔 やってて辛いこと\n${hardBlock}`
}

export function buildSelfText(likeItems: string[], hardItems: string[]): string {
  const likeBlock = renderStoryBlock(likeItems, 'like')
  const hardBlock = renderStoryBlock(hardItems, 'hard')
  return `あなたはなぜそう感じているか\n\n💚 好きなこと\n${likeBlock}\n\n💔 やってて辛いこと\n${hardBlock}`
}
