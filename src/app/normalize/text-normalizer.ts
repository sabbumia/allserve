/**
 * Text Normalization Utilities
 * Normalizes Bengali and other Unicode text by removing zero-width characters
 */

export interface NormalizationResult {
  original: string;
  normalized: string;
  changes: {
    zeroWidthCharsRemoved: number;
    nonBreakingSpacesRemoved: number;
    whitespaceNormalized: boolean;
    unicodeNormalized: boolean;
  };
  stats: {
    originalLength: number;
    normalizedLength: number;
    charactersRemoved: number;
  };
}

// Zero-width characters pattern
const ZERO_WIDTH_CHARS = /[\u200B\u200C\u200D\uFEFF]/g;
const NON_BREAKING_SPACE = /\u00A0/g;

/**
 * Normalize Bengali/Unicode text
 * 1. Normalizes Unicode to NFC form
 * 2. Removes zero-width characters (ZWSP, ZWNJ, ZWJ, BOM)
 * 3. Replaces non-breaking spaces with regular spaces
 * 4. Normalizes whitespace (collapse multiple spaces, trim)
 */
export function normalizeBengaliText(text: string): NormalizationResult {
  if (!text) {
    return {
      original: text,
      normalized: text,
      changes: {
        zeroWidthCharsRemoved: 0,
        nonBreakingSpacesRemoved: 0,
        whitespaceNormalized: false,
        unicodeNormalized: false,
      },
      stats: {
        originalLength: 0,
        normalizedLength: 0,
        charactersRemoved: 0,
      },
    };
  }

  const original = text;
  let normalized = text;
  let changes = {
    zeroWidthCharsRemoved: 0,
    nonBreakingSpacesRemoved: 0,
    whitespaceNormalized: false,
    unicodeNormalized: false,
  };

  // Step 1: Unicode normalization to NFC (Canonical Decomposition, followed by Canonical Composition)
  const beforeNFC = normalized;
  normalized = normalized.normalize('NFC');
  changes.unicodeNormalized = beforeNFC !== normalized;

  // Step 2: Remove zero-width characters
  const zeroWidthMatches = normalized.match(ZERO_WIDTH_CHARS);
  changes.zeroWidthCharsRemoved = zeroWidthMatches ? zeroWidthMatches.length : 0;
  normalized = normalized.replace(ZERO_WIDTH_CHARS, '');

  // Step 3: Replace non-breaking spaces with regular spaces
  const nbspMatches = normalized.match(NON_BREAKING_SPACE);
  changes.nonBreakingSpacesRemoved = nbspMatches ? nbspMatches.length : 0;
  normalized = normalized.replace(NON_BREAKING_SPACE, ' ');

  // Step 4: Normalize whitespace (collapse multiple spaces and trim)
  const beforeWhitespace = normalized;
  normalized = normalized.replace(/\s+/g, ' ').trim();
  changes.whitespaceNormalized = beforeWhitespace !== normalized;

  return {
    original,
    normalized,
    changes,
    stats: {
      originalLength: original.length,
      normalizedLength: normalized.length,
      charactersRemoved: original.length - normalized.length,
    },
  };
}

/**
 * Normalize text line by line (for text files)
 */
export function normalizeTextLines(text: string): {
  lines: NormalizationResult[];
  summary: {
    totalLines: number;
    modifiedLines: number;
    unchangedLines: number;
    totalZeroWidthCharsRemoved: number;
    totalNonBreakingSpacesRemoved: number;
    totalCharactersRemoved: number;
  };
} {
  const lines = text.split('\n');
  const results: NormalizationResult[] = [];

  let totalZeroWidthCharsRemoved = 0;
  let totalNonBreakingSpacesRemoved = 0;
  let totalCharactersRemoved = 0;
  let modifiedLines = 0;

  lines.forEach((line) => {
    const result = normalizeBengaliText(line);
    results.push(result);

    if (result.original !== result.normalized) {
      modifiedLines++;
    }

    totalZeroWidthCharsRemoved += result.changes.zeroWidthCharsRemoved;
    totalNonBreakingSpacesRemoved += result.changes.nonBreakingSpacesRemoved;
    totalCharactersRemoved += result.stats.charactersRemoved;
  });

  return {
    lines: results,
    summary: {
      totalLines: lines.length,
      modifiedLines,
      unchangedLines: lines.length - modifiedLines,
      totalZeroWidthCharsRemoved,
      totalNonBreakingSpacesRemoved,
      totalCharactersRemoved,
    },
  };
}

/**
 * Get normalized text from results
 */
export function getNormalizedText(results: NormalizationResult[]): string {
  return results.map((r) => r.normalized).join('\n');
}

/**
 * Detect zero-width characters in text
 */
export function detectZeroWidthChars(text: string): {
  hasZeroWidthChars: boolean;
  locations: Array<{ index: number; char: string; unicode: string }>;
} {
  const locations: Array<{ index: number; char: string; unicode: string }> = [];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    
    if (
      code === 0x200B || // Zero Width Space
      code === 0x200C || // Zero Width Non-Joiner
      code === 0x200D || // Zero Width Joiner
      code === 0xFEFF    // Zero Width No-Break Space (BOM)
    ) {
      locations.push({
        index: i,
        char: char,
        unicode: `U+${code.toString(16).toUpperCase().padStart(4, '0')}`,
      });
    }
  }

  return {
    hasZeroWidthChars: locations.length > 0,
    locations,
  };
}

/**
 * Detect non-breaking spaces in text
 */
export function detectNonBreakingSpaces(text: string): {
  hasNonBreakingSpaces: boolean;
  count: number;
  locations: number[];
} {
  const locations: number[] = [];
  
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 0x00A0) {
      locations.push(i);
    }
  }

  return {
    hasNonBreakingSpaces: locations.length > 0,
    count: locations.length,
    locations,
  };
}

/**
 * Get Unicode normalization form info
 */
export function getUnicodeInfo(text: string): {
  isNFC: boolean;
  isNFD: boolean;
  isNFKC: boolean;
  isNFKD: boolean;
  needsNormalization: boolean;
} {
  return {
    isNFC: text === text.normalize('NFC'),
    isNFD: text === text.normalize('NFD'),
    isNFKC: text === text.normalize('NFKC'),
    isNFKD: text === text.normalize('NFKD'),
    needsNormalization: text !== text.normalize('NFC'),
  };
}

/**
 * Batch normalize multiple texts
 */
export function batchNormalize(texts: string[]): NormalizationResult[] {
  return texts.map((text) => normalizeBengaliText(text));
}

/**
 * Create downloadable text file content
 */
export function createDownloadableContent(results: NormalizationResult[]): string {
  return results.map((r) => r.normalized).join('\n');
}

/**
 * Parse text file content into lines
 */
export function parseTextFile(content: string): string[] {
  return content.split('\n');
}

/**
 * Get detailed character analysis
 */
export function analyzeText(text: string): {
  totalCharacters: number;
  visibleCharacters: number;
  invisibleCharacters: number;
  whitespaceCharacters: number;
  zeroWidthCharacters: number;
  nonBreakingSpaces: number;
  regularSpaces: number;
  newlines: number;
  unicodeInfo: ReturnType<typeof getUnicodeInfo>;
} {
  const zeroWidthInfo = detectZeroWidthChars(text);
  const nbspInfo = detectNonBreakingSpaces(text);
  const unicodeInfo = getUnicodeInfo(text);

  // Count different types of characters
  let regularSpaces = 0;
  let newlines = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') regularSpaces++;
    if (char === '\n') newlines++;
  }

  const zeroWidthCount = zeroWidthInfo.locations.length;
  const nbspCount = nbspInfo.count;
  const whitespaceCharacters = regularSpaces + nbspCount + newlines;
  const invisibleCharacters = zeroWidthCount + nbspCount;

  return {
    totalCharacters: text.length,
    visibleCharacters: text.length - invisibleCharacters - newlines,
    invisibleCharacters,
    whitespaceCharacters,
    zeroWidthCharacters: zeroWidthCount,
    nonBreakingSpaces: nbspCount,
    regularSpaces,
    newlines,
    unicodeInfo,
  };
}

/**
 * Compare original and normalized text
 */
export function compareTexts(original: string, normalized: string): {
  identical: boolean;
  lengthDifference: number;
  characterChanges: number;
  preservedContent: boolean;
} {
  return {
    identical: original === normalized,
    lengthDifference: original.length - normalized.length,
    characterChanges: Array.from(original).filter((char, i) => char !== normalized[i]).length,
    preservedContent: original.replace(/[\s\u200B-\u200D\uFEFF\u00A0]/g, '') === 
                      normalized.replace(/[\s\u200B-\u200D\uFEFF\u00A0]/g, ''),
  };
}