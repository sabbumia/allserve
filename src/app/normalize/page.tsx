'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, Sparkles, Download, AlertCircle, CheckCircle2, RefreshCw, Info } from 'lucide-react';
import { 
  normalizeBengaliText, 
  normalizeTextLines, 
  getNormalizedText,
  analyzeText,
  NormalizationResult 
} from './text-normalizer';
import { NormalizationResults } from './NormalizationResults';

export default function NormalizePage() {
  // Input State
  const [inputText, setInputText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');

  // Results State
  const [normalizedText, setNormalizedText] = useState<string>('');
  const [normalizationResult, setNormalizationResult] = useState<NormalizationResult | null>(null);
  const [lineResults, setLineResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);

  // Handle File Upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      setError('Please upload a .txt file');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setInputText(content);
        setError('');
      } catch (err) {
        setError(`Error reading file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
    };

    reader.readAsText(file);
  }, []);

  // Handle Text Normalization
  const handleNormalize = useCallback(() => {
    if (!inputText.trim()) {
      setError('Please enter text to normalize');
      return;
    }

    setProcessing(true);
    setError('');

    setTimeout(() => {
      // Check if input has multiple lines
      const hasMultipleLines = inputText.includes('\n');

      if (hasMultipleLines) {
        // Process line by line
        const results = normalizeTextLines(inputText);
        setLineResults(results);
        setNormalizedText(getNormalizedText(results.lines));
        setNormalizationResult(null);
      } else {
        // Process as single text
        const result = normalizeBengaliText(inputText);
        setNormalizationResult(result);
        setNormalizedText(result.normalized);
        setLineResults(null);
      }

      setProcessing(false);
    }, 100);
  }, [inputText]);

  // Download Normalized Text
  const handleDownload = useCallback(() => {
    const blob = new Blob([normalizedText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', fileName ? fileName.replace('.txt', '_normalized.txt') : 'normalized_output.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [normalizedText, fileName]);

  // Reset Everything
  const handleReset = () => {
    setInputText('');
    setNormalizedText('');
    setNormalizationResult(null);
    setLineResults(null);
    setFileName('');
    setError('');
    setShowAnalysis(false);
  };

  // Get text analysis
  const textAnalysis = inputText ? analyzeText(inputText) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-blue-600" />
            Text Normalization
          </h1>
          <p className="text-gray-600">Normalize Bengali/Unicode text by removing zero-width characters and invisible spaces</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">What this tool does:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Removes zero-width characters (ZWSP, ZWNJ, ZWJ, BOM)</li>
                <li>Converts non-breaking spaces to regular spaces</li>
                <li>Normalizes Unicode to NFC form</li>
                <li>Cleans up extra whitespace</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Input Mode Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Input Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setInputMode('text')}
              className={`p-6 rounded-lg border-2 transition-all ${
                inputMode === 'text'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <FileText className={`w-8 h-8 mx-auto mb-2 ${inputMode === 'text' ? 'text-blue-600' : 'text-gray-400'}`} />
              <h3 className="font-semibold text-gray-900 mb-1">Paste Text</h3>
              <p className="text-sm text-gray-600">Type or paste text directly</p>
            </button>

            <button
              onClick={() => setInputMode('file')}
              className={`p-6 rounded-lg border-2 transition-all ${
                inputMode === 'file'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-2 ${inputMode === 'file' ? 'text-blue-600' : 'text-gray-400'}`} />
              <h3 className="font-semibold text-gray-900 mb-1">Upload File</h3>
              <p className="text-sm text-gray-600">Upload a .txt file</p>
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Input Text</h2>

          {inputMode === 'file' ? (
            // File Upload Mode
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors mb-4">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="text-file-upload"
                />
                <label htmlFor="text-file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">Click to upload text file</p>
                  <p className="text-sm text-gray-500">TXT files only</p>
                  {fileName && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">{fileName}</span>
                    </div>
                  )}
                </label>
              </div>

              {inputText && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview (First 500 chars)</h3>
                  <pre className="text-sm text-gray-600 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {inputText.substring(0, 500)}
                    {inputText.length > 500 && '...'}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            // Text Input Mode
            <div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your Bengali or Unicode text here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>
          )}

          {/* Input Statistics */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-4 text-xs text-gray-500">
              <span>{inputText.length} characters</span>
              <span>{inputText.split('\n').length} lines</span>
              {textAnalysis && textAnalysis.invisibleCharacters > 0 && (
                <span className="text-orange-600 font-medium">
                  ⚠️ {textAnalysis.invisibleCharacters} invisible characters detected
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                disabled={!inputText}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Info className="w-4 h-4" />
                {showAnalysis ? 'Hide' : 'Show'} Analysis
              </button>
              <button
                onClick={handleNormalize}
                disabled={!inputText.trim() || processing}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Normalize
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Text Analysis */}
        {showAnalysis && textAnalysis && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Text Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Characters</p>
                <p className="text-2xl font-bold text-gray-900">{textAnalysis.totalCharacters}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Visible Characters</p>
                <p className="text-2xl font-bold text-blue-600">{textAnalysis.visibleCharacters}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Invisible Characters</p>
                <p className="text-2xl font-bold text-orange-600">{textAnalysis.invisibleCharacters}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Zero-Width Chars</p>
                <p className="text-2xl font-bold text-purple-600">{textAnalysis.zeroWidthCharacters}</p>
              </div>
            </div>
            
            {textAnalysis.unicodeInfo.needsNormalization && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Text needs Unicode normalization (not in NFC form)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {(normalizationResult || lineResults) && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Normalized Text
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reset
              </button>
            </div>

            {/* Display Results */}
            <NormalizationResults
              normalizationResult={normalizationResult}
              lineResults={lineResults}
              normalizedText={normalizedText}
              originalText={inputText}
            />
          </div>
        )}
      </div>
    </div>
  );
}