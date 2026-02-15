/**
 * WER (Word Error Rate) Calculator Utilities
 * Implements Levenshtein distance algorithm for word-level alignment
 */

export interface AlignmentToken {
  reference: string;
  hypothesis: string;
  type: 'correct' | 'substitution' | 'deletion' | 'insertion';
}

export interface WERResult {
  wer: number;
  mer: number;
  wil: number;
  hits: number;
  substitutions: number;
  deletions: number;
  insertions: number;
  totalWords: number;
  alignment: AlignmentToken[];
}

/**
 * Normalize text: lowercase, trim, collapse whitespace
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Split text into words
 */
function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized.split(' ').filter(word => word.length > 0);
}

/**
 * Calculate Levenshtein distance matrix for word alignment
 */
function levenshteinMatrix(ref: string[], hyp: string[]): number[][] {
  const m = ref.length;
  const n = hyp.length;
  
  // Initialize matrix
  const matrix: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    matrix[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (ref[i - 1] === hyp[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]; // Match
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // Deletion
          matrix[i][j - 1] + 1,     // Insertion
          matrix[i - 1][j - 1] + 1  // Substitution
        );
      }
    }
  }
  
  return matrix;
}

/**
 * Backtrack through the matrix to get alignment
 */
function getAlignment(ref: string[], hyp: string[], matrix: number[][]): AlignmentToken[] {
  const alignment: AlignmentToken[] = [];
  let i = ref.length;
  let j = hyp.length;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && ref[i - 1] === hyp[j - 1]) {
      // Match
      alignment.unshift({
        reference: ref[i - 1],
        hypothesis: hyp[j - 1],
        type: 'correct'
      });
      i--;
      j--;
    } else if (i > 0 && j > 0 && matrix[i][j] === matrix[i - 1][j - 1] + 1) {
      // Substitution
      alignment.unshift({
        reference: ref[i - 1],
        hypothesis: hyp[j - 1],
        type: 'substitution'
      });
      i--;
      j--;
    } else if (j > 0 && matrix[i][j] === matrix[i][j - 1] + 1) {
      // Insertion
      alignment.unshift({
        reference: '',
        hypothesis: hyp[j - 1],
        type: 'insertion'
      });
      j--;
    } else if (i > 0 && matrix[i][j] === matrix[i - 1][j] + 1) {
      // Deletion
      alignment.unshift({
        reference: ref[i - 1],
        hypothesis: '',
        type: 'deletion'
      });
      i--;
    } else {
      // Should not reach here
      break;
    }
  }
  
  return alignment;
}

/**
 * Calculate WER and related metrics
 */
export function calculateWER(groundTruth: string, transcription: string): WERResult {
  // Tokenize both texts
  const refWords = tokenize(groundTruth);
  const hypWords = tokenize(transcription);
  
  if (refWords.length === 0) {
    throw new Error('Ground truth is empty after normalization');
  }
  
  // Calculate Levenshtein distance matrix
  const matrix = levenshteinMatrix(refWords, hypWords);
  
  // Get alignment
  const alignment = getAlignment(refWords, hypWords, matrix);
  
  // Count errors
  let hits = 0;
  let substitutions = 0;
  let deletions = 0;
  let insertions = 0;
  
  alignment.forEach(token => {
    switch (token.type) {
      case 'correct':
        hits++;
        break;
      case 'substitution':
        substitutions++;
        break;
      case 'deletion':
        deletions++;
        break;
      case 'insertion':
        insertions++;
        break;
    }
  });
  
  const totalWords = refWords.length;
  const totalErrors = substitutions + deletions + insertions;
  
  // Calculate WER (Word Error Rate)
  const wer = totalErrors / totalWords;
  
  // Calculate MER (Match Error Rate)
  // MER = (S + D + I) / (S + D + I + H)
  const mer = totalErrors / (totalErrors + hits);
  
  // Calculate WIL (Word Information Lost)
  // WIL = (S + D) / (S + D + H)
  const wil = (substitutions + deletions) / totalWords;
  
  return {
    wer: Math.min(wer, 1), // Cap at 1.0 (100%)
    mer: Math.min(mer, 1),
    wil: Math.min(wil, 1),
    hits,
    substitutions,
    deletions,
    insertions,
    totalWords,
    alignment
  };
}

/**
 * Calculate WER for multiple line pairs
 */
export function calculateWERMultiLine(groundTruthLines: string[], transcriptionLines: string[]): WERResult {
  // Combine all lines
  const gtText = groundTruthLines.join(' ');
  const transText = transcriptionLines.join(' ');
  
  return calculateWER(gtText, transText);
}

/**
 * Calculate per-line WER statistics
 */
export function calculatePerLineWER(groundTruthLines: string[], transcriptionLines: string[]) {
  const minLength = Math.min(groundTruthLines.length, transcriptionLines.length);
  const results: WERResult[] = [];
  
  for (let i = 0; i < minLength; i++) {
    const result = calculateWER(groundTruthLines[i], transcriptionLines[i]);
    results.push(result);
  }
  
  return results;
}