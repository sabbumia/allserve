import React, { useState } from 'react';
import { CheckCircle, XCircle, TrendingDown, FileText, Copy, CopyCheck } from 'lucide-react';
import { ProcessingResult } from './text-processor';

interface ProcessingResultsProps {
  mode: 'text' | 'csv';
  processingResult?: ProcessingResult | null;
  processingStats?: any;
  processedText?: string;
}

export function ProcessingResults({
  mode,
  processingResult,
  processingStats,
  processedText,
}: ProcessingResultsProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedProcessed, setCopiedProcessed] = useState(false);

  const handleCopy = async (text: string, type: 'original' | 'processed') => {
    await navigator.clipboard.writeText(text);
    if (type === 'original') {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedProcessed(true);
      setTimeout(() => setCopiedProcessed(false), 2000);
    }
  };
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-purple-600" />
          Processing Statistics
        </h3>

        {mode === 'text' && processingResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-3xl font-bold text-yellow-600">
                {processingResult.changes.removedRepeatedPhrases}
              </p>
              <p className="text-sm text-gray-600 mt-1">Repeated Phrases</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-3xl font-bold text-orange-600">
                {processingResult.changes.removedRepeatedWords}
              </p>
              <p className="text-sm text-gray-600 mt-1">Repeated Words</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-3xl font-bold text-red-600">
                {processingResult.changes.removedRepeatedChars}
              </p>
              <p className="text-sm text-gray-600 mt-1">Repeated Chars</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-3xl font-bold text-purple-600">
                {processingResult.changes.removedSymbols}
              </p>
              <p className="text-sm text-gray-600 mt-1">Symbols Removed</p>
            </div>
          </div>
        )}

        {mode === 'csv' && processingStats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-3xl font-bold text-blue-600">{processingStats.totalProcessed}</p>
                <p className="text-sm text-gray-600 mt-1">Total Rows</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-3xl font-bold text-green-600">{processingStats.totalModified}</p>
                <p className="text-sm text-gray-600 mt-1">Modified</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-3xl font-bold text-gray-600">{processingStats.unchangedCount}</p>
                <p className="text-sm text-gray-600 mt-1">Unchanged</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-3xl font-bold text-yellow-600">
                  {processingStats.removedRepeatedPhrases + processingStats.removedRepeatedWords}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Repeats</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-3xl font-bold text-purple-600">{processingStats.removedSymbols}</p>
                <p className="text-sm text-gray-600 mt-1">Symbols</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Detailed Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span className="text-gray-600">Phrases: {processingStats.removedRepeatedPhrases}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-400 rounded"></div>
                  <span className="text-gray-600">Words: {processingStats.removedRepeatedWords}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded"></div>
                  <span className="text-gray-600">Chars: {processingStats.removedRepeatedChars}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded"></div>
                  <span className="text-gray-600">Symbols: {processingStats.removedSymbols}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Comparison (for single text mode) */}
      {mode === 'text' && processingResult && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
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
                  onClick={() => handleCopy(processingResult.original, 'original')}
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
                  {processingResult.original}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {processingResult.original.length} characters
              </p>
            </div>

            {/* Cleaned Text */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold text-gray-700">Cleaned Text</h4>
                </div>
                <button
                  onClick={() => handleCopy(processedText || '', 'processed')}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-green-200 hover:border-green-300 bg-white hover:bg-green-50 text-green-700 transition-all"
                >
                  {copiedProcessed ? (
                    <><CopyCheck className="w-3.5 h-3.5 text-green-500" /><span>Copied!</span></>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" />Copy</>
                  )}
                </button>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono max-h-96 overflow-y-auto">
                  {processedText}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {processedText?.length || 0} characters
                {processingResult.original.length > (processedText?.length || 0) && (
                  <span className="ml-2 text-green-600 font-medium">
                    (-{processingResult.original.length - (processedText?.length || 0)} chars)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Changes Summary */}
          {(processingResult.changes.removedRepeatedPhrases > 0 ||
            processingResult.changes.removedRepeatedWords > 0 ||
            processingResult.changes.removedRepeatedChars > 0 ||
            processingResult.changes.removedSymbols > 0) && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Changes Applied:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {processingResult.changes.removedRepeatedPhrases > 0 && (
                  <li>✓ Removed {processingResult.changes.removedRepeatedPhrases} repeated phrase(s)</li>
                )}
                {processingResult.changes.removedRepeatedWords > 0 && (
                  <li>✓ Removed {processingResult.changes.removedRepeatedWords} repeated word(s)</li>
                )}
                {processingResult.changes.removedRepeatedChars > 0 && (
                  <li>✓ Removed {processingResult.changes.removedRepeatedChars} repeated character sequence(s)</li>
                )}
                {processingResult.changes.removedSymbols > 0 && (
                  <li>✓ Removed {processingResult.changes.removedSymbols} {'>>'} symbol(s)</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Processing Rules Info */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Processing Rules Applied:</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">1.</span>
            <p>Removed <code className="px-1 py-0.5 bg-white rounded text-xs">&gt;&gt;</code> symbols</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">2.</span>
            <p>Removed multi-word phrases repeated 3+ times (e.g., "hello world hello world hello world" → "hello world")</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">3.</span>
            <p>Removed single words repeated 3+ times (e.g., "yes yes yes yes" → "yes")</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">4.</span>
            <p>Removed character sequences repeated 3+ times (e.g., "হেহেহেহে" → "হে")</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">5.</span>
            <p>Cleaned up extra whitespace and trimmed text</p>
          </div>
        </div>
      </div>
    </div>
  );
}