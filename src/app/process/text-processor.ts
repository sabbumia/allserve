/**
 * Text Processing Utilities
 * Cleans transcripts by removing repeated words and symbols
 */

export interface ProcessingResult {
  original: string;
  cleaned: string;
  changes: {
    removedRepeatedPhrases: number;
    removedRepeatedWords: number;
    removedRepeatedChars: number;
    removedSymbols: number;
  };
}

/**
 * Clean transcript text by removing repeated patterns and symbols
 */
export function cleanTranscript(text: string): ProcessingResult {
  if (!text || text.trim() === '') {
    return {
      original: text,
      cleaned: text,
      changes: {
        removedRepeatedPhrases: 0,
        removedRepeatedWords: 0,
        removedRepeatedChars: 0,
        removedSymbols: 0,
      },
    };
  }

  const original = text;
  let cleaned = text;
  let changes = {
    removedRepeatedPhrases: 0,
    removedRepeatedWords: 0,
    removedRepeatedChars: 0,
    removedSymbols: 0,
  };

  // Step 1: Remove '>>' symbols
  const beforeSymbolRemoval = cleaned;
  cleaned = cleaned.replace(/>>/g, '');
  const symbolMatches = (beforeSymbolRemoval.match(/>>/g) || []).length;
  changes.removedSymbols = symbolMatches;

  // Step 2: Remove multi-word phrases repeated 3+ times
  // Pattern: Match 1-5 consecutive words repeated 3+ times
  const phrasePattern = /\b((?:\S+\s+){1,4}\S+)(?:\s+\1){2,}\b/g;
  let prevText = null;
  let phraseIterations = 0;
  
  while (prevText !== cleaned && phraseIterations < 10) {
    prevText = cleaned;
    const phraseMatches = cleaned.match(phrasePattern);
    if (phraseMatches) {
      changes.removedRepeatedPhrases += phraseMatches.length;
    }
    cleaned = cleaned.replace(phrasePattern, '$1');
    phraseIterations++;
  }

  // Step 3: Remove single words repeated 3+ times
  const wordPattern = /\b(\S+)(?:\s+\1){2,}\b/g;
  prevText = null;
  let wordIterations = 0;
  
  while (prevText !== cleaned && wordIterations < 10) {
    prevText = cleaned;
    const wordMatches = cleaned.match(wordPattern);
    if (wordMatches) {
      changes.removedRepeatedWords += wordMatches.length;
    }
    cleaned = cleaned.replace(wordPattern, '$1');
    wordIterations++;
  }

  // Step 4: Remove character sequences repeated 3+ times (e.g., "হেহেহেহে" → "হেহে")
  // Pattern: Match any 2+ characters repeated 3+ times consecutively
  const charPattern = /(.{2,}?)\1{2,}/g;
  prevText = null;
  let charIterations = 0;
  
  while (prevText !== cleaned && charIterations < 10) {
    prevText = cleaned;
    const charMatches = cleaned.match(charPattern);
    if (charMatches) {
      changes.removedRepeatedChars += charMatches.length;
    }
    cleaned = cleaned.replace(charPattern, '$1');
    charIterations++;
  }

  // Step 5: Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return {
    original,
    cleaned,
    changes,
  };
}

/**
 * Process CSV content (array of objects)
 */
export function processCSVData(
  data: Array<Record<string, any>>,
  transcriptColumn: string = 'transcript'
): Array<Record<string, any>> {
  return data.map((row) => {
    if (row[transcriptColumn]) {
      const result = cleanTranscript(row[transcriptColumn]);
      return {
        ...row,
        [transcriptColumn]: result.cleaned,
        [`${transcriptColumn}_original`]: result.original,
      };
    }
    return row;
  });
}

/**
 * Parse CSV text to array of objects
 */
export function parseCSV(csvText: string): Array<Record<string, any>> {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data: Array<Record<string, any>> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Handle CSV with quoted fields
    const values = parseCSVLine(line);
    const row: Record<string, any> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    data.push(row);
  }

  return data;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Convert array of objects back to CSV text
 */
export function toCSV(data: Array<Record<string, any>>): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvLines: string[] = [];

  // Add header row
  csvLines.push(headers.join(','));

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = String(row[header] || '');
      // Escape quotes and wrap in quotes if contains comma or newline
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvLines.push(values.join(','));
  });

  return csvLines.join('\n');
}

/**
 * Batch process multiple text entries
 */
export function batchCleanTexts(texts: string[]): ProcessingResult[] {
  return texts.map((text) => cleanTranscript(text));
}

/**
 * Get processing statistics
 */
export function getProcessingStats(results: ProcessingResult[]) {
  const totalChanges = results.reduce(
    (acc, result) => {
      acc.removedRepeatedPhrases += result.changes.removedRepeatedPhrases;
      acc.removedRepeatedWords += result.changes.removedRepeatedWords;
      acc.removedRepeatedChars += result.changes.removedRepeatedChars;
      acc.removedSymbols += result.changes.removedSymbols;
      return acc;
    },
    {
      removedRepeatedPhrases: 0,
      removedRepeatedWords: 0,
      removedRepeatedChars: 0,
      removedSymbols: 0,
    }
  );

  const totalProcessed = results.length;
  const totalModified = results.filter(
    (r) => r.original !== r.cleaned
  ).length;

  return {
    totalProcessed,
    totalModified,
    unchangedCount: totalProcessed - totalModified,
    ...totalChanges,
  };
}