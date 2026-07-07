'use client';

import React, { useCallback, useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onRemoveFile: () => void;
}

export default function FileUpload({
  onFileSelect,
  selectedFile,
  onRemoveFile,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file && file.name.toLowerCase().endsWith('.csv')) {
        onFileSelect(file);
      } else {
        alert('Please upload a valid CSV file.');
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="animate-fade-in-up">
      <div
        id="upload-zone"
        className={`upload-zone ${isDragOver ? 'dragover' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="csv-file-input"
        />

        <div className="upload-icon">
          {selectedFile ? '✓' : isDragOver ? '⬇' : '📄'}
        </div>

        {selectedFile ? (
          <>
            <p className="upload-title">File Ready</p>
            <div className="file-info">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{formatSize(selectedFile.size)}</span>
              <button
                className="file-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile();
                  if (inputRef.current) inputRef.current.value = '';
                }}
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="upload-title">
              {isDragOver ? 'Drop your CSV here' : 'Drag & drop your CSV file'}
            </p>
            <p className="upload-subtitle">
              or{' '}
              <span className="upload-browse">browse</span> to choose a file
              <br />
              <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'inline-block' }}>
                Supports any CSV format · Max 10MB
              </small>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
