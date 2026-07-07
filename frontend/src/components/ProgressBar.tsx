'use client';

import React from 'react';

interface ProgressBarProps {
  message?: string;
}

export default function ProgressBar({ message }: ProgressBarProps) {
  return (
    <div className="processing-container animate-fade-in">
      <div className="spinner" />
      <h2 className="processing-title">Processing with AI</h2>
      <p className="processing-subtitle">
        {message || 'Extracting CRM data using Google Gemini...'}
      </p>

      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: '60%' }}
        />
      </div>

      <p className="progress-text">
        This may take a moment depending on file size
      </p>

      <div style={{
        marginTop: 'var(--spacing-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
        }}>
          <span style={{ animation: 'pulse 2s ease-in-out infinite' }}>●</span>
          Parsing CSV records
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
        }}>
          <span style={{ animation: 'pulse 2s ease-in-out infinite 0.5s' }}>●</span>
          Mapping fields with AI
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
        }}>
          <span style={{ animation: 'pulse 2s ease-in-out infinite 1s' }}>●</span>
          Validating CRM records
        </div>
      </div>
    </div>
  );
}
