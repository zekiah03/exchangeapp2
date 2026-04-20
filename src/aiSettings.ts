export type AIModel = 'claude-haiku-4-5' | 'claude-sonnet-4-6' | 'claude-opus-4-7'

export type AISettings = {
  apiKey: string
  model: AIModel
}

export const DEFAULT_MODEL: AIModel = 'claude-haiku-4-5'

export const MODEL_LABELS: Record<AIModel, string> = {
  'claude-haiku-4-5': 'Haiku 4.5（安・速）',
  'claude-sonnet-4-6': 'Sonnet 4.6（バランス）',
  'claude-opus-4-7': 'Opus 4.7（最高性能）',
}

const KEY_STORAGE = 'reversed-human.ai.apiKey'
const MODEL_STORAGE = 'reversed-human.ai.model'

export function loadSettings(): AISettings {
  if (typeof window === 'undefined') {
    return { apiKey: '', model: DEFAULT_MODEL }
  }
  try {
    const apiKey = window.localStorage.getItem(KEY_STORAGE) ?? ''
    const rawModel = window.localStorage.getItem(MODEL_STORAGE)
    const model: AIModel =
      rawModel === 'claude-haiku-4-5' ||
      rawModel === 'claude-sonnet-4-6' ||
      rawModel === 'claude-opus-4-7'
        ? rawModel
        : DEFAULT_MODEL
    return { apiKey, model }
  } catch {
    return { apiKey: '', model: DEFAULT_MODEL }
  }
}

export function saveSettings(s: AISettings): void {
  if (typeof window === 'undefined') return
  try {
    if (s.apiKey) {
      window.localStorage.setItem(KEY_STORAGE, s.apiKey)
    } else {
      window.localStorage.removeItem(KEY_STORAGE)
    }
    window.localStorage.setItem(MODEL_STORAGE, s.model)
  } catch {
    // ignore quota errors
  }
}
