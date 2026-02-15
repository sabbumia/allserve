'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, Wand2, Download, BarChart3, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cleanTranscript, processCSVData, parseCSV, toCSV, getProcessingStats, ProcessingResult } from './text-processor';
import { ProcessingResults } from './ProcessingResults';

type InputMode = 'text' | 'csv';

export default function ProcessPage() {
  // Input State
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [inputText, setInputText] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<Array<Record<string, any>>>([]);
  const [transcriptColumn, setTranscriptColumn] = useState<string>('transcript');
  
  // Results State
  const [processedText, setProcessedText] = useState<string>('');
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [processingStats, setProcessingStats] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  // Handle CSV File Upload
  const handleCSVUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseCSV(content);
        
        if (parsed.length === 0) {
          setError('CSV file is empty or invalid');
          return;
        }
        
        setCsvData(parsed);
        
        // Auto-detect transcript column
        const headers = Object.keys(parsed[0]);
        const transcriptCol = headers.find(h => 
          h.toLowerCase().includes('transcript') || 
          h.toLowerCase().includes('text')
        ) || headers[0];
        
        setTranscriptColumn(transcriptCol);
        setError('');
      } catch (err) {
        setError(`Error parsing CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading CSV file');
    };
    
    reader.readAsText(file);
  }, []);

  // Handle Text Processing
  const handleProcessText = useCallback(() => {
    if (!inputText.trim()) {
      setError('Please enter text to process');
      return;
    }

    setProcessing(true);
    setError('');

    setTimeout(() => {
      const result = cleanTranscript(inputText);
      setProcessedText(result.cleaned);
      setProcessingResult(result);
      setProcessing(false);
    }, 100);
  }, [inputText]);

  // Handle CSV Processing
  const handleProcessCSV = useCallback(() => {
    if (csvData.length === 0) {
      setError('Please upload a CSV file first');
      return;
    }

    if (!transcriptColumn) {
      setError('Please select a transcript column');
      return;
    }

    setProcessing(true);
    setError('');

    setTimeout(() => {
      const processed = processCSVData(csvData, transcriptColumn);
      
      // Get processing results for stats
      const results = csvData.map(row => 
        cleanTranscript(row[transcriptColumn] || '')
      );
      
      const stats = getProcessingStats(results);
      
      setCsvData(processed);
      setProcessingStats(stats);
      setProcessing(false);
    }, 100);
  }, [csvData, transcriptColumn]);

  // Download Processed CSV
  const handleDownloadCSV = useCallback(() => {
    const csv = toCSV(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', csvFile ? csvFile.name.replace('.csv', '_cleaned.csv') : 'processed_output.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [csvData, csvFile]);

  // Reset Everything
  const handleReset = () => {
    setInputText('');
    setProcessedText('');
    setProcessingResult(null);
    setCsvFile(null);
    setCsvData([]);
    setProcessingStats(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Wand2 className="w-10 h-10 text-purple-600" />
            Text Post-Processing
          </h1>
          <p className="text-gray-600">Clean transcripts by removing repeated words and unwanted symbols</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Mode Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Processing Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setInputMode('text')}
              className={`p-6 rounded-lg border-2 transition-all ${
                inputMode === 'text'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <FileText className={`w-8 h-8 mx-auto mb-2 ${inputMode === 'text' ? 'text-purple-600' : 'text-gray-400'}`} />
              <h3 className="font-semibold text-gray-900 mb-1">Single Text</h3>
              <p className="text-sm text-gray-600">Process individual text entries</p>
            </button>

            <button
              onClick={() => setInputMode('csv')}
              className={`p-6 rounded-lg border-2 transition-all ${
                inputMode === 'csv'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <BarChart3 className={`w-8 h-8 mx-auto mb-2 ${inputMode === 'csv' ? 'text-purple-600' : 'text-gray-400'}`} />
              <h3 className="font-semibold text-gray-900 mb-1">CSV File</h3>
              <p className="text-sm text-gray-600">Batch process CSV data</p>
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {inputMode === 'text' ? 'Input Text' : 'Upload CSV File'}
          </h2>

          {inputMode === 'text' ? (
            // Text Input Mode
            <div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here to clean repeated words and symbols..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  {inputText.length} characters
                </p>
                <button
                  onClick={handleProcessText}
                  disabled={!inputText.trim() || processing}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Process Text
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // CSV Upload Mode
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors mb-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                  id="csv-file-upload"
                />
                <label htmlFor="csv-file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">Click to upload CSV file</p>
                  <p className="text-sm text-gray-500">CSV files only</p>
                  {csvFile && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-700 font-medium">{csvFile.name}</span>
                      <span className="text-xs text-purple-600">({csvData.length} rows)</span>
                    </div>
                  )}
                </label>
              </div>

              {csvData.length > 0 && (
                <div className="space-y-4">
                  {/* Column Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Transcript Column
                    </label>
                    <select
                      value={transcriptColumn}
                      onChange={(e) => setTranscriptColumn(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {Object.keys(csvData[0]).map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview (First 3 rows)</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                          <tr>
                            {Object.keys(csvData[0]).slice(0, 5).map((header) => (
                              <th key={header} className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-100">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {csvData.slice(0, 3).map((row, idx) => (
                            <tr key={idx}>
                              {Object.keys(csvData[0]).slice(0, 5).map((header) => (
                                <td key={header} className="px-3 py-2 text-gray-600 max-w-xs truncate">
                                  {String(row[header]).substring(0, 50)}
                                  {String(row[header]).length > 50 && '...'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Process Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleProcessCSV}
                      disabled={processing}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {processing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          Process CSV
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Section */}
        {(processingResult || processingStats) && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-4">
              {inputMode === 'csv' && csvData.length > 0 && (
                <button
                  onClick={handleDownloadCSV}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Cleaned CSV
                </button>
              )}
              <button
                onClick={handleReset}
                className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reset
              </button>
            </div>

            {/* Display Results */}
            <ProcessingResults
              mode={inputMode}
              processingResult={processingResult}
              processingStats={processingStats}
              processedText={processedText}
            />
          </div>
        )}
      </div>
    </div>
  );
}