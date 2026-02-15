import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { AlignmentToken } from './wer-utils';

interface DifferenceViewerProps {
  groundTruth: string;
  transcription: string;
  alignmentResult: AlignmentToken[];
}

export function DifferenceViewer({ groundTruth, transcription, alignmentResult }: DifferenceViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showColors, setShowColors] = useState(true);
  const [viewMode, setViewMode] = useState<'inline' | 'sideBySide'>('inline');

  // Group alignment tokens for better readability
  const groupedAlignment = React.useMemo(() => {
    const groups: { tokens: AlignmentToken[]; hasError: boolean }[] = [];
    let currentGroup: AlignmentToken[] = [];
    let hasError = false;

    alignmentResult.forEach((token, index) => {
      if (token.type === 'correct' && currentGroup.length > 0 && hasError) {
        // Start new group if we have errors and hit a correct word
        groups.push({ tokens: currentGroup, hasError });
        currentGroup = [token];
        hasError = false;
      } else {
        currentGroup.push(token);
        if (token.type !== 'correct') {
          hasError = true;
        }
      }

      // Create group every 10 tokens or at the end
      if (currentGroup.length >= 10 || index === alignmentResult.length - 1) {
        groups.push({ tokens: currentGroup, hasError });
        currentGroup = [];
        hasError = false;
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ tokens: currentGroup, hasError });
    }

    return groups;
  }, [alignmentResult]);

  const getTokenColor = (type: string) => {
    if (!showColors) return '';
    
    switch (type) {
      case 'correct':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'substitution':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'deletion':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'insertion':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTokenLabel = (type: string) => {
    switch (type) {
      case 'correct':
        return '✓';
      case 'substitution':
        return '⟷';
      case 'deletion':
        return '✗';
      case 'insertion':
        return '+';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Detailed Alignment & Differences</h3>
            <p className="text-indigo-100 text-sm">
              Word-by-word comparison showing all errors and corrections
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
        </div>

        {/* Controls */}
        {isExpanded && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowColors(!showColors)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {showColors ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showColors ? 'Hide' : 'Show'} Colors
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'inline' ? 'sideBySide' : 'inline')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {viewMode === 'inline' ? 'Side by Side' : 'Inline'} View
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Legend */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded text-xs font-medium">
                  ✓ Correct
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded text-xs font-medium">
                  ⟷ Substitution
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 border border-red-300 rounded text-xs font-medium">
                  ✗ Deletion
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded text-xs font-medium">
                  + Insertion
                </span>
              </div>
            </div>
          </div>

          {/* Alignment Display */}
          {viewMode === 'inline' ? (
            // Inline View
            <div className="space-y-4">
              {groupedAlignment.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className={`p-4 rounded-lg border-2 ${
                    group.hasError ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-gray-50/30'
                  }`}
                >
                  <div className="flex flex-wrap gap-2">
                    {group.tokens.map((token, tokenIndex) => (
                      <div key={`${groupIndex}-${tokenIndex}`} className="inline-flex flex-col items-center">
                        {/* Reference (Ground Truth) */}
                        <div className="text-center mb-1">
                          {token.reference && (
                            <div
                              className={`px-2 py-1 rounded border ${getTokenColor(
                                token.type
                              )} text-xs font-mono`}
                            >
                              {token.reference}
                            </div>
                          )}
                          {!token.reference && token.type === 'insertion' && (
                            <div className="px-2 py-1 text-xs text-gray-400">—</div>
                          )}
                        </div>

                        {/* Arrow/Status */}
                        <div className="text-xs text-gray-400 my-1">
                          {token.type === 'correct' && '↓'}
                          {token.type === 'substitution' && '⟷'}
                          {token.type === 'deletion' && '↓'}
                          {token.type === 'insertion' && '↑'}
                        </div>

                        {/* Hypothesis (Transcription) */}
                        <div className="text-center mt-1">
                          {token.hypothesis && (
                            <div
                              className={`px-2 py-1 rounded border ${getTokenColor(
                                token.type
                              )} text-xs font-mono`}
                            >
                              {token.hypothesis}
                            </div>
                          )}
                          {!token.hypothesis && token.type === 'deletion' && (
                            <div className="px-2 py-1 text-xs text-gray-400">—</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Side by Side View
            <div className="grid grid-cols-2 gap-4">
              {/* Ground Truth Column */}
              <div className="border rounded-lg p-4 bg-green-50/30">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">Ground Truth (Reference)</h4>
                <div className="space-y-2">
                  {alignmentResult.map((token, index) => (
                    <div
                      key={`ref-${index}`}
                      className={`inline-block mr-2 mb-2 px-2 py-1 rounded border text-xs font-mono ${
                        token.reference ? getTokenColor(token.type) : 'bg-gray-100 text-gray-400 border-gray-300'
                      }`}
                    >
                      {token.reference || '—'}
                      {token.type !== 'correct' && (
                        <span className="ml-1 text-xs">{getTokenLabel(token.type)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transcription Column */}
              <div className="border rounded-lg p-4 bg-blue-50/30">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">Transcription (Hypothesis)</h4>
                <div className="space-y-2">
                  {alignmentResult.map((token, index) => (
                    <div
                      key={`hyp-${index}`}
                      className={`inline-block mr-2 mb-2 px-2 py-1 rounded border text-xs font-mono ${
                        token.hypothesis ? getTokenColor(token.type) : 'bg-gray-100 text-gray-400 border-gray-300'
                      }`}
                    >
                      {token.hypothesis || '—'}
                      {token.type !== 'correct' && (
                        <span className="ml-1 text-xs">{getTokenLabel(token.type)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3">Error Examples</h4>
            <div className="space-y-3">
              {/* Substitutions */}
              {alignmentResult.filter(t => t.type === 'substitution').slice(0, 5).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-yellow-700 mb-2">
                    Substitutions (wrong word used):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {alignmentResult
                      .filter(t => t.type === 'substitution')
                      .slice(0, 5)
                      .map((token, index) => (
                        <div
                          key={`sub-${index}`}
                          className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-900"
                        >
                          "<span className="font-semibold text-gray-900">{token.reference}</span>" → "
                          <span className="font-semibold text-yellow-800">{token.hypothesis}</span>"
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Deletions */}
              {alignmentResult.filter(t => t.type === 'deletion').slice(0, 5).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-700 mb-2">Deletions (missing words):</p>
                  <div className="flex flex-wrap gap-2">
                    {alignmentResult
                      .filter(t => t.type === 'deletion')
                      .slice(0, 5)
                      .map((token, index) => (
                        <div
                          key={`del-${index}`}
                          className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-gray-900"
                        >
                          "<span className="font-semibold text-red-800">{token.reference}</span>" was deleted
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Insertions */}
              {alignmentResult.filter(t => t.type === 'insertion').slice(0, 5).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-2">
                    Insertions (extra words added):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {alignmentResult
                      .filter(t => t.type === 'insertion')
                      .slice(0, 5)
                      .map((token, index) => (
                        <div
                          key={`ins-${index}`}
                          className="px-3 py-2 bg-purple-50 border border-purple-200 rounded text-sm text-gray-900"
                        >
                          "<span className="font-semibold text-purple-800">{token.hypothesis}</span>" was inserted
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}