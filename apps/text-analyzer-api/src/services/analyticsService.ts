import { StringDecoder } from 'string_decoder';
import { listOwnerHistoryItems, AnalysisResult, OwnerHistoryItem } from './dynamoDB';
import { getS3ObjectStream } from './s3Service';


export type AnalyticsItem = {
  fileId: string;
  originalFileName: string;
  status: OwnerHistoryItem['status'];
  createdAt: number;
  updatedAt: number;
  result?: AnalysisResult;
  errorMessage?: string;
};

export const getOwnerAnalytics = async (ownerId: string): Promise<AnalyticsItem[]> => {
  const items = await listOwnerHistoryItems(ownerId);

  return items
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((item) => {
      const base: AnalyticsItem = {
        fileId: item.fileId,
        originalFileName: item.originalFileName,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };

      if (item.status === 'COMPLETED' && item.result) {
        base.result = item.result;
      }

      if (item.status === 'FAILED' && item.errorMessage) {
        base.errorMessage = item.errorMessage;
      }

      return base;
    });
};

export const analyzeS3Object = async (bucket: string, key: string): Promise<AnalysisResult> => {
  const stream = await getS3ObjectStream(bucket, key);
  return await analyzeTextStream(stream);
};

const analyzeTextStream = async (stream: NodeJS.ReadableStream): Promise<AnalysisResult> => {
  let totalWords = 0;
  let totalLength = 0;
  const wordCounts = new Map<string, number>();
  
  // Use StringDecoder: handles multi-byte characters split across chunks better than toString
  const decoder = new StringDecoder('utf-8');
  let carry = '';

  // Use Unicode-aware regex (Letter characters only)
  // 'u' flag for unicode, 'g' for global
  const wordPattern = /\p{L}+/gu; 

  for await (const chunk of stream) {
    // 1. Efficient Decoding
    // decoder.write handles the buffer conversion and multi-byte edge cases
    const chunkText = typeof chunk === 'string' 
      ? chunk 
      : decoder.write(Buffer.from(chunk));

    // 2. Normalize immediately (Memory trade-off: new string, but safer logic)
    // Combining carry here ensures we match words split across chunks
    const combined = (carry + chunkText).toLowerCase();
    
    // 3. Use matchAll (Iterator) instead of match (Array)
    // This prevents allocating a massive array for valid words
    const matchesIterator = combined.matchAll(wordPattern);
    
    let lastMatch: RegExpMatchArray | null = null;

    for (const match of matchesIterator) {
      // If we have a previous match pending processing, process it now
      if (lastMatch) {
        processWord(lastMatch[0], wordCounts);
        totalWords++;
        totalLength += lastMatch[0].length;
      }
      lastMatch = match;
    }

    carry = '';
    
    // 4. Smart Carry Logic
    if (lastMatch) {
      // Check if the last match touches the end of the buffer
      const lastWord = lastMatch[0];
      const matchIndex = lastMatch.index ?? 0;
      const endsAtBoundary = (matchIndex + lastWord.length) === combined.length;

      if (endsAtBoundary) {
        // It touches the end, so it might be incomplete. Carry it.
        carry = lastWord;
      } else {
        // It ended before the buffer limit (e.g. "word ."), so it's complete.
        processWord(lastWord, wordCounts);
        totalWords++;
        totalLength += lastWord.length;
      }
    }
  }

  // Handle remaining carry after stream ends
  // Note: decoder.end() flushes any remaining bytes
  const finalChunk = decoder.end();
  if (carry || finalChunk) {
    const remaining = (carry + finalChunk).toLowerCase();
    const finalMatches = remaining.match(wordPattern); // regular match is fine here for small leftover
    if (finalMatches) {
      for (const word of finalMatches) {
        processWord(word, wordCounts);
        totalWords++;
        totalLength += word.length;
      }
    }
  }

  // Sorting & Results (Unchanged logic, just cleaner)
  const top10Words = [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return {
    totalWords,
    uniqueWords: wordCounts.size,
    avgWordLength: totalWords > 0 ? Number((totalLength / totalWords).toFixed(2)) : 0,
    top10Words
  };
};

function processWord(word: string, map: Map<string, number>) {
  map.set(word, (map.get(word) || 0) + 1);
}
