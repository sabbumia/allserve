'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, Calculator, RefreshCw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { calculateWER, type WERResult } from './wer-utils';
import { DifferenceViewer } from './DifferenceViewer';

export default function WERCalculator() {
  // Ground Truth State (persists until page refresh)
  const [groundTruth, setGroundTruth] = useState<string>('');
  const [gtFileName, setGtFileName] = useState<string>('');
  
  // Transcription State (can be changed multiple times)
  const [transcription, setTranscription] = useState<string>('');
  const [transcriptionFileName, setTranscriptionFileName] = useState<string>('');
  
  // Results State
  const [werResults, setWerResults] = useState<WERResult | null>(null);
  const [error, setError] = useState<string>('');
  
  // UI State
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [transcriptionTab, setTranscriptionTab] = useState<'upload' | 'text'>('upload');

  // Handle Ground Truth File Upload
  const handleGTFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      setError('Please upload a .txt file for ground truth');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setGroundTruth(content);
      setGtFileName(file.name);
      setError('');
      setWerResults(null);
    };
    reader.onerror = () => {
      setError('Error reading ground truth file');
    };
    reader.readAsText(file);
  }, []);

  // Handle Transcription File Upload
  const handleTranscriptionFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      setError('Please upload a .txt file for transcription');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTranscription(content);
      setTranscriptionFileName(file.name);
      setError('');
      
      // Auto-calculate if GT is available
      if (groundTruth) {
        calculateWERScore(groundTruth, content);
      }
    };
    reader.onerror = () => {
      setError('Error reading transcription file');
    };
    reader.readAsText(file);
  }, [groundTruth]);

  // Handle Ground Truth Text Input
  const handleGTTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGroundTruth(e.target.value);
    setGtFileName('');
    setError('');
    setWerResults(null);
  };

  // Handle Transcription Text Input
  const handleTranscriptionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscription(e.target.value);
    setTranscriptionFileName('');
    setError('');
  };

  // Calculate WER Score
  const calculateWERScore = (gt: string, trans: string) => {
    if (!gt.trim()) {
      setError('Please provide ground truth text');
      return;
    }
    if (!trans.trim()) {
      setError('Please provide transcription text');
      return;
    }

    try {
      const result = calculateWER(gt, trans);
      setWerResults(result);
      setError('');
    } catch (err) {
      setError(`Error calculating WER: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setWerResults(null);
    }
  };

  // Handle Calculate Button Click
  const handleCalculate = () => {
    calculateWERScore(groundTruth, transcription);
  };

  // Handle New Transcription
  const handleNewTranscription = () => {
    setTranscription('');
    setTranscriptionFileName('');
    setWerResults(null);
    setError('');
  };

  // Handle Reset All
  const handleResetAll = () => {
    setGroundTruth('');
    setGtFileName('');
    setTranscription('');
    setTranscriptionFileName('');
    setWerResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Calculator className="w-10 h-10 text-indigo-600" />
            WER Calculator
          </h1>
          <p className="text-gray-600">Calculate Word Error Rate between ground truth and transcription</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Ground Truth Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                Ground Truth
              </h2>
              {groundTruth && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Loaded
                </span>
              )}
            </div>

            {/* GT Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload File
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'text'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Paste Text
              </button>
            </div>

            {/* GT Content */}
            {activeTab === 'upload' ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleGTFileUpload}
                  className="hidden"
                  id="gt-file-upload"
                />
                <label htmlFor="gt-file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">Click to upload ground truth file</p>
                  <p className="text-sm text-gray-500">TXT files only</p>
                  {gtFileName && (
                    <p className="mt-3 text-sm text-green-600 font-medium">
                      ✓ {gtFileName}
                    </p>
                  )}
                </label>
              </div>
            ) : (
              <div>
                <textarea
                  value={groundTruth}
                  onChange={handleGTTextChange}
                  placeholder="Paste your ground truth text here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {groundTruth.split('\n').filter(l => l.trim()).length} lines
                </p>
              </div>
            )}
          </div>

          {/* Transcription Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Transcription
              </h2>
              {transcription && (
                <button
                  onClick={handleNewTranscription}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Test
                </button>
              )}
            </div>

            {/* Transcription Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTranscriptionTab('upload')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  transcriptionTab === 'upload'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload File
              </button>
              <button
                onClick={() => setTranscriptionTab('text')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  transcriptionTab === 'text'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Paste Text
              </button>
            </div>

            {/* Transcription Content */}
            {transcriptionTab === 'upload' ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleTranscriptionFileUpload}
                  className="hidden"
                  id="trans-file-upload"
                />
                <label htmlFor="trans-file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">Click to upload transcription file</p>
                  <p className="text-sm text-gray-500">TXT files only</p>
                  {transcriptionFileName && (
                    <p className="mt-3 text-sm text-blue-600 font-medium">
                      ✓ {transcriptionFileName}
                    </p>
                  )}
                </label>
              </div>
            ) : (
              <div>
                <textarea
                  value={transcription}
                  onChange={handleTranscriptionTextChange}
                  placeholder="Paste your transcription text here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {transcription.split('\n').filter(l => l.trim()).length} lines
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleCalculate}
            disabled={!groundTruth || !transcription}
            className="flex-1 bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
          >
            <Calculator className="w-6 h-6" />
            Calculate WER
          </button>
          <button
            onClick={handleResetAll}
            className="bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Reset All
          </button>
        </div>

        {/* Results Section */}
        {werResults && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Word Error Rate</h3>
                <p className="text-3xl font-bold text-red-600">{(werResults.wer * 100).toFixed(2)}%</p>
                <p className="text-xs text-gray-500 mt-1">{werResults.wer.toFixed(4)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Match Error Rate</h3>
                <p className="text-3xl font-bold text-orange-600">{(werResults.mer * 100).toFixed(2)}%</p>
                <p className="text-xs text-gray-500 mt-1">{werResults.mer.toFixed(4)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Word Info Lost</h3>
                <p className="text-3xl font-bold text-purple-600">{(werResults.wil * 100).toFixed(2)}%</p>
                <p className="text-xs text-gray-500 mt-1">{werResults.wil.toFixed(4)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Accuracy</h3>
                <p className="text-3xl font-bold text-green-600">{((1 - werResults.wer) * 100).toFixed(2)}%</p>
                <p className="text-xs text-gray-500 mt-1">{(1 - werResults.wer).toFixed(4)}</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{werResults.hits}</p>
                  <p className="text-sm text-gray-600 mt-1">Correct</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{werResults.substitutions}</p>
                  <p className="text-sm text-gray-600 mt-1">Substitutions</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{werResults.deletions}</p>
                  <p className="text-sm text-gray-600 mt-1">Deletions</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{werResults.insertions}</p>
                  <p className="text-sm text-gray-600 mt-1">Insertions</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{werResults.totalWords}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Words</p>
                </div>
              </div>
            </div>

            {/* Difference Viewer */}
          
                
            <DifferenceViewer
              groundTruth={groundTruth}
              transcription={transcription}
              alignmentResult={werResults.alignment}
              />
              
          </div>
        )}
      </div>
    </div>
  );
}