import React, { useState } from 'react';
import { CheckCircle, XCircle, TrendingDown, FileText, Info, Copy, CopyCheck } from 'lucide-react';
import { NormalizationResult } from './text-normalizer';

interface NormalizationResultsProps {
  normalizationResult?: NormalizationResult | null;
  lineResults?: any;
  normalizedText: string;
  originalText: string;
}

export function NormalizationResults({
  normalizationResult,
  lineResults,
  normalizedText,
  originalText,
}: NormalizationResultsProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedNormalized, setCopiedNormalized] = useState(false);

  const handleCopy = async (text: string, type: 'original' | 'normalized') => {
    await navigator.clipboard.writeText(text);
    if (type === 'original') {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedNormalized(true);
      setTimeout(() => setCopiedNormalized(false), 2000);
    }
  };
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-blue-600" />
          Normalization Statistics
        </h3>

        {normalizationResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-3xl font-bold text-orange-600">
                  {normalizationResult.changes.zeroWidthCharsRemoved}
                </p>
                <p className="text-sm text-gray-600 mt-1">Zero-Width Chars</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-3xl font-bold text-purple-600">
                  {normalizationResult.changes.nonBreakingSpacesRemoved}
                </p>
                <p className="text-sm text-gray-600 mt-1">Non-Breaking Spaces</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-3xl font-bold text-blue-600">
                  {normalizationResult.changes.unicodeNormalized ? 'Yes' : 'No'}
                </p>
                <p className="text-sm text-gray-600 mt-1">Unicode Normalized</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-3xl font-bold text-green-600">
                  {normalizationResult.stats.charactersRemoved}
                </p>
                <p className="text-sm text-gray-600 mt-1">Chars Removed</p>
              </div>
            </div>

            {/* Length Comparison */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Length Comparison</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Original: </span>
                  <span className="font-semibold text-gray-900">{normalizationResult.stats.originalLength} chars</span>
                </div>
                <div>
                  <span className="text-gray-600">Normalized: </span>
                  <span className="font-semibold text-gray-900">{normalizationResult.stats.normalizedLength} chars</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {lineResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-3xl font-bold text-blue-600">{lineResults.summary.totalLines}</p>
                <p className="text-sm text-gray-600 mt-1">Total Lines</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-3xl font-bold text-green-600">{lineResults.summary.modifiedLines}</p>
                <p className="text-sm text-gray-600 mt-1">Modified</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-3xl font-bold text-gray-600">{lineResults.summary.unchangedLines}</p>
                <p className="text-sm text-gray-600 mt-1">Unchanged</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-3xl font-bold text-orange-600">
                  {lineResults.summary.totalZeroWidthCharsRemoved}
                </p>
                <p className="text-sm text-gray-600 mt-1">Zero-Width</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-3xl font-bold text-purple-600">
                  {lineResults.summary.totalNonBreakingSpacesRemoved}
                </p>
                <p className="text-sm text-gray-600 mt-1">NBSP</p>
              </div>
            </div>

            {/* Total Characters */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Overall Changes</h4>
              <p className="text-sm text-gray-600">
                Total characters removed: <span className="font-semibold text-gray-900">{lineResults.summary.totalCharactersRemoved}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Text Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Before & After Comparison
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Text */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <h4 className="font-semibold text-gray-700">Original Text</h4>
              </div>
              <button
                onClick={() => handleCopy(originalText, 'original')}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition-all"
              >
                {copiedOriginal ? (
                  <><CopyCheck className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Copied!</span></>
                ) : (
                  <><Copy className="w-3.5 h-3.5" />Copy</>
                )}
              </button>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono max-h-96 overflow-y-auto">
                {originalText}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {originalText.length} characters | {originalText.split('\n').length} lines
            </p>
          </div>

          {/* Normalized Text */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-gray-700">Normalized Text</h4>
              </div>
              <button
                onClick={() => handleCopy(normalizedText, 'normalized')}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-green-200 hover:border-green-300 bg-white hover:bg-green-50 text-green-700 transition-all"
              >
                {copiedNormalized ? (
                  <><CopyCheck className="w-3.5 h-3.5 text-green-500" /><span>Copied!</span></>
                ) : (
                  <><Copy className="w-3.5 h-3.5" />Copy</>
                )}
              </button>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono max-h-96 overflow-y-auto">
                {normalizedText}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {normalizedText.length} characters | {normalizedText.split('\n').length} lines
              {originalText.length > normalizedText.length && (
                <span className="ml-2 text-green-600 font-medium">
                  (-{originalText.length - normalizedText.length} chars)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Identical Check */}
        {originalText === normalizedText && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800 font-medium">
                Text is already normalized - no changes needed!
              </p>
            </div>
          </div>
        )}

        {/* Changes Summary */}
        {originalText !== normalizedText && (normalizationResult || lineResults) && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Changes Applied:
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {normalizationResult && (
                <>
                  {normalizationResult.changes.zeroWidthCharsRemoved > 0 && (
                    <li>✓ Removed {normalizationResult.changes.zeroWidthCharsRemoved} zero-width character(s)</li>
                  )}
                  {normalizationResult.changes.nonBreakingSpacesRemoved > 0 && (
                    <li>✓ Replaced {normalizationResult.changes.nonBreakingSpacesRemoved} non-breaking space(s)</li>
                  )}
                  {normalizationResult.changes.unicodeNormalized && (
                    <li>✓ Normalized Unicode to NFC form</li>
                  )}
                  {normalizationResult.changes.whitespaceNormalized && (
                    <li>✓ Normalized whitespace (removed extra spaces)</li>
                  )}
                </>
              )}
              {lineResults && (
                <>
                  <li>✓ Processed {lineResults.summary.totalLines} line(s)</li>
                  <li>✓ Modified {lineResults.summary.modifiedLines} line(s)</li>
                  {lineResults.summary.totalZeroWidthCharsRemoved > 0 && (
                    <li>✓ Removed {lineResults.summary.totalZeroWidthCharsRemoved} zero-width character(s)</li>
                  )}
                  {lineResults.summary.totalNonBreakingSpacesRemoved > 0 && (
                    <li>✓ Replaced {lineResults.summary.totalNonBreakingSpacesRemoved} non-breaking space(s)</li>
                  )}
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Normalization Info */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Normalization Process:</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">1.</span>
            <p><strong>Unicode Normalization (NFC):</strong> Converts text to Canonical Decomposition followed by Canonical Composition</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">2.</span>
            <p><strong>Zero-Width Characters:</strong> Removes U+200B (ZWSP), U+200C (ZWNJ), U+200D (ZWJ), U+FEFF (BOM)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">3.</span>
            <p><strong>Non-Breaking Spaces:</strong> Replaces U+00A0 with regular spaces (U+0020)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">4.</span>
            <p><strong>Whitespace Cleanup:</strong> Collapses multiple spaces and trims leading/trailing whitespace</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Perfect for:</strong> Bengali text, ASR outputs, web-scraped content, copy-pasted text with hidden characters
          </p>
        </div>
      </div>

      {/* Line-by-Line Preview (for multi-line results) */}
      {lineResults && lineResults.lines.length <= 10 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Line-by-Line Changes</h3>
          <div className="space-y-3">
            {lineResults.lines.map((line: NormalizationResult, index: number) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  line.original === line.normalized
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-500">Line {index + 1}</span>
                  {line.original !== line.normalized && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded">Modified</span>
                  )}
                </div>
                {line.original !== line.normalized && (
                  <div className="space-y-1 text-xs">
                    <div className="text-gray-600">
                      <span className="font-medium">Before:</span> {line.original || '(empty)'}
                    </div>
                    <div className="text-gray-800">
                      <span className="font-medium">After:</span> {line.normalized || '(empty)'}
                    </div>
                  </div>
                )}
                {line.original === line.normalized && (
                  <div className="text-xs text-gray-600">
                    {line.original || '(empty line)'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}