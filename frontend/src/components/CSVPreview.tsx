'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';

interface CSVPreviewProps {
  file: File;
  onConfirm: () => void;
  onBack: () => void;
}

export default function CSVPreview({ file, onConfirm, onBack }: CSVPreviewProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: Papa.ParseResult<Record<string, string>>) => {
        if (result.errors.length > 0 && result.data.length === 0) {
          setError('Failed to parse CSV: ' + result.errors[0].message);
          setLoading(false);
          return;
        }

        const data = result.data;
        const fields = result.meta.fields || [];

        setHeaders(fields);
        setRows(data);
        setLoading(false);
      },
      error: (err: Error) => {
        setError('Failed to parse CSV: ' + err.message);
        setLoading(false);
      },
    });
  }, [file]);

  // Display up to 100 rows in preview (virtualisation for larger sets)
  const displayRows = useMemo(() => rows.slice(0, 100), [rows]);

  if (loading) {
    return (
      <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '48px' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Parsing CSV...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card animate-fade-in error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-title">Parse Error</p>
        <p className="error-message">{error}</p>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="preview-header">
        <div>
          <h2 className="preview-title">Data Preview</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Review your data before importing
          </p>
        </div>
        <div className="preview-meta">
          <span className="preview-count">
            📊 {rows.length.toLocaleString()} rows
          </span>
          <span className="preview-count">
            📋 {headers.length} columns
          </span>
        </div>
      </div>

      <div className="table-container">
        <div className="table-scroll">
          <table className="data-table" id="csv-preview-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    {index + 1}
                  </td>
                  {headers.map((header) => (
                    <td key={header} title={row[header] || ''}>
                      {row[header] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rows.length > 100 && (
        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          marginTop: 'var(--spacing-md)',
        }}>
          Showing first 100 of {rows.length.toLocaleString()} rows
        </p>
      )}

      <div className="preview-actions">
        <button className="btn btn-secondary" onClick={onBack} id="btn-back">
          ← Back
        </button>
        <button className="btn btn-primary btn-lg" onClick={onConfirm} id="btn-confirm">
          🚀 Confirm Import
        </button>
      </div>
    </div>
  );
}
