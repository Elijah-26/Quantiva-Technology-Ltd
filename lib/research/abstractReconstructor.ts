/**
 * OpenAlex stores abstracts as inverted index: word -> positions in sequence.
 */
export function reconstructAbstract(invertedIndex: Record<string, number[]> | null | undefined): string {
  if (!invertedIndex || typeof invertedIndex !== 'object') return ''
  const words: string[] = []
  for (const [word, positions] of Object.entries(invertedIndex)) {
    if (!Array.isArray(positions)) continue
    for (const pos of positions) {
      if (typeof pos === 'number' && pos >= 0) {
        words[pos] = word
      }
    }
  }
  return words.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}
