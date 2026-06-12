// Token approximation: 1 token ≈ 4 characters (GPT tokenizer average for English)
const CHARS_PER_TOKEN = 4;
const TARGET_CHUNK_TOKENS = 200;
const OVERLAP_TOKENS = 30;
const TARGET_CHUNK_CHARS = TARGET_CHUNK_TOKENS * CHARS_PER_TOKEN; // 800
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN;           // 120

export interface TextChunk {
  content: string;
  estimatedTokens: number;
}

/**
 * Splits text into overlapping chunks of approximately TARGET_CHUNK_TOKENS tokens,
 * respecting sentence boundaries. Adjacent chunks share roughly OVERLAP_TOKENS
 * tokens of context to avoid losing meaning at split points.
 */
export function chunkText(text: string): TextChunk[] {
  const normalised = text.trim();
  if (!normalised) return [];

  const sentences = splitIntoSentences(normalised);
  const chunks: TextChunk[] = [];
  let currentSentences: string[] = [];
  let currentLength = 0;

  for (const sentence of sentences) {
    const sentenceLen = sentence.length + 1; // +1 for the joining space

    // Flush the current chunk when adding this sentence would exceed the target
    // — but only if there is already content (never produce an empty chunk).
    if (currentLength + sentenceLen > TARGET_CHUNK_CHARS && currentSentences.length > 0) {
      chunks.push(buildChunk(currentSentences));

      // Carry the tail of the current chunk forward as the overlap window.
      const overlapSentences: string[] = [];
      let overlapLength = 0;
      for (let i = currentSentences.length - 1; i >= 0; i--) {
        const len = currentSentences[i].length + 1;
        if (overlapLength + len > OVERLAP_CHARS) break;
        overlapLength += len;
        overlapSentences.unshift(currentSentences[i]);
      }

      currentSentences = overlapSentences;
      currentLength = overlapLength;
    }

    currentSentences.push(sentence);
    currentLength += sentenceLen;
  }

  if (currentSentences.length > 0) {
    chunks.push(buildChunk(currentSentences));
  }

  return chunks;
}

function buildChunk(sentences: string[]): TextChunk {
  const content = sentences.join(' ').trim();
  return { content, estimatedTokens: Math.ceil(content.length / CHARS_PER_TOKEN) };
}

function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by whitespace,
  // or on paragraph breaks (two or more newlines).
  return text
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}
