'use client';

import React, { useState, useMemo } from 'react';
import { CRMRecord, SkippedRecord, ProcessingResult } from '@/types';

interface ResultsTableProps {
  result: ProcessingResult;
  onReset: () => void;
}

const CRM_FIELDS: { key: keyof CRMRecord; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'country_code', label: 'Code' },
  { key: 'mobile_without_country_code', label: 'Mobile' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'crm_status', label: 'Status' },
  { key: 'lead_owner', label: 'Lead Owner' },
  { key: 'crm_note', label: 'Notes' },
  { key: 'data_source', label: 'Source' },
  { key: 'created_at', label: 'Created At' },
  { key: 'possession_time', label: 'Possession' },
  { key: 'description', label: 'Description' },
];

const STATUS_STYLES: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: 'badge-success',
  DID_NOT_CONNECT: 'badge-warning',
  BAD_LEAD: 'badge-danger',
  SALE_DONE: 'badge-info',
};

const STATUS_LABELS: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: 'Good Lead',
  DID_NOT_CONNECT: 'No Connect',
  BAD_LEAD: 'Bad Lead',
  SALE_DONE: 'Sale Done',
};

export default function ResultsTable({ result, onReset }: ResultsTableProps) {
  const [showSkipped, setShowSkipped] = useState(false);

  const { records, skipped, totalImported, totalSkipped, totalProcessed } = result.data;
  const processingTime = (result.processingTime / 1000).toFixed(1);

  // Export records as CSV
  const handleExport = () => {
    const csvHeaders = CRM_FIELDS.map((f) => f.key).join(',');
    const csvRows = records.map((record) =>
      CRM_FIELDS.map((f) => {
        const val = record[f.key] || '';
        // Escape commas and quotes in CSV
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    );

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'groweasy_crm_import.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Summary Stats */}
      <div className="results-summary">
        <div className="stat-card">
          <div className="stat-value imported">{totalImported}</div>
          <div className="stat-label">Imported</div>
        </div>
        <div className="stat-card">
          <div className="stat-value skipped">{totalSkipped}</div>
          <div className="stat-label">Skipped</div>
        </div>
        <div className="stat-card">
          <div className="stat-value total">{totalProcessed}</div>
          <div className="stat-label">Total Processed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value time">{processingTime}s</div>
          <div className="stat-label">Processing Time</div>
        </div>
      </div>

      {/* Records Table */}
      {records.length > 0 && (
        <>
          <div className="results-header">
            <h3 className="results-title" style={{ color: 'var(--success)' }}>
              ✓ Imported Records
            </h3>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleExport}
                id="btn-export"
              >
                📥 Export CSV
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onReset}
                id="btn-new-import"
              >
                + New Import
              </button>
            </div>
          </div>

          <div className="table-container">
            <div className="table-scroll">
              <table className="data-table" id="results-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                    {CRM_FIELDS.map((field) => (
                      <th key={field.key}>{field.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {index + 1}
                      </td>
                      {CRM_FIELDS.map((field) => (
                        <td key={field.key} title={record[field.key] || ''}>
                          {field.key === 'crm_status' ? (
                            <span className={`badge ${STATUS_STYLES[record.crm_status] || 'badge-info'}`}>
                              {STATUS_LABELS[record.crm_status] || record.crm_status}
                            </span>
                          ) : (
                            record[field.key] || '—'
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Skipped Records */}
      {skipped.length > 0 && (
        <div className="skipped-section">
          <button
            className="skipped-toggle"
            onClick={() => setShowSkipped(!showSkipped)}
            id="btn-toggle-skipped"
          >
            <span className={`skipped-toggle-icon ${showSkipped ? 'open' : ''}`}>▶</span>
            {skipped.length} Skipped Record{skipped.length !== 1 ? 's' : ''}
          </button>

          {showSkipped && (
            <div className="skipped-list animate-fade-in">
              {skipped.map((item, index) => (
                <div key={index} className="skipped-item">
                  <div className="skipped-reason">⚠ {item.reason}</div>
                  <div className="skipped-data">
                    {JSON.stringify(item.originalData).substring(0, 200)}
                    {JSON.stringify(item.originalData).length > 200 ? '...' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 'var(--spacing-2xl)',
      }}>
        <button className="btn btn-primary btn-lg" onClick={onReset} id="btn-import-another">
          🔄 Import Another File
        </button>
      </div>
    </div>
  );
}
