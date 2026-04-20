import type { Pole } from './aiClient'

export type AnswersByItem = Record<string, string[]>

export function itemKey(pole: Pole, text: string): string {
  return `${pole}::${text.trim()}`
}
