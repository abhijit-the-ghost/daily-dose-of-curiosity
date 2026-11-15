/* ==================================================================
   captionChunks — split narration words into caption chunks at natural
   pauses (gap > 0.32 s), max 6 words per chunk. Shared by every episode.
   Word boundaries come from edge-tts's WordBoundary events; never estimated.
   ================================================================== */

export interface Word { w: string; start: number; end: number }

export interface CaptionChunk {
  words: Word[]
  start: number
  end: number
}

export function buildChunks(words: Word[]): CaptionChunk[] {
  const chunks: CaptionChunk[] = []
  let cur: CaptionChunk | null = null
  let prevEnd = 0
  for (const w of words) {
    const gap = w.start - prevEnd
    if (!cur || gap > 0.32 || cur.words.length >= 6) {
      cur = { words: [], start: w.start, end: w.end }
      chunks.push(cur)
    }
    cur.words.push(w)
    cur.end = w.end
    prevEnd = w.end
  }
  return chunks
}
