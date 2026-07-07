'use client';

import React, { useState, useCallback } from 'react';
import { AppStep, ProcessingResult } from '@/types';
import { processCSV } from '@/lib/api';
import FileUpload from '@/components/FileUpload';
import StepIndicator from '@/components/StepIndicator';
import CSVPreview from '@/components/CSVPreview';
import ProgressBar from '@/components/ProgressBar';
import ResultsTable from '@/components/ResultsTable';

export default function Home() {
  const [step, setStep] = useState<AppStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setStep('preview');
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setStep('upload');
    setError(null);
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (!file) return;

    setStep('processing');
    setError(null);

    try {
      const processingResult = await processCSV(file);
      setResult(processingResult);
      setStep('results');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setStep('preview');
    }
  }, [file]);

  const handleReset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setResult(null);
    setError(null);
  }, []);

  const handleBackToUpload = useCallback(() => {
    setStep('upload');
    setError(null);
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">⚡ GrowEasy CRM</div>
        <h1 className="app-title">AI CSV Importer</h1>
        <p className="app-subtitle">
          Upload any CSV file and let AI intelligently extract CRM lead information
        </p>
      </header>

      {/* Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* Main Content */}
      <div className="glass-card">
        {/* Error Banner */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(255, 107, 107, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              marginBottom: 'var(--spacing-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <strong style={{ color: 'var(--danger)' }}>Error: </strong>
              <span style={{ color: 'var(--text-secondary)' }}>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <FileUpload
            onFileSelect={handleFileSelect}
            selectedFile={file}
            onRemoveFile={handleRemoveFile}
          />
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && file && (
          <CSVPreview
            file={file}
            onConfirm={handleConfirmImport}
            onBack={handleBackToUpload}
          />
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && <ProgressBar />}

        {/* Step 4: Results */}
        {step === 'results' && result && (
          <ResultsTable result={result} onReset={handleReset} />
        )}
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          marginTop: 'var(--spacing-2xl)',
          paddingBottom: 'var(--spacing-xl)',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
        }}
      >
        Powered by Google Gemini AI · Built with Next.js & Express
      </footer>
    </div>
  );
}
