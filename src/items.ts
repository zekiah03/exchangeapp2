import type { Pole } from './aiClient'

export type AnswerValue = {
  option: string
  note: string
}

export const EMPTY_ANSWER: AnswerValue = Object.freeze({ option: '', note: '' })

export type AnswersByItem = Record<string, AnswerValue[]>

export function itemKey(pole: Pole, text: string): string {
  return `${pole}::${text.trim()}`
}

export function isAnswered(v: AnswerValue | undefined): boolean {
  if (!v) return false
  return Boolean(v.option.trim() || v.note.trim())
}
