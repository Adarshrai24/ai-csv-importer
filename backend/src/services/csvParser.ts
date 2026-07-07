import { parse } from 'csv-parse/sync';
import { CSVParseResult, CSVRawRecord } from '../types';
import { sanitize } from '../utils/validation';

/**
 * Parses a CSV buffer into structured records.
 * Handles various delimiters, encodings, and edge cases.
 */
export function parseCSV(buffer: Buffer): CSVParseResult {
  const content = buffer.toString('utf-8');

  // Detect delimiter (comma, semicolon, tab, pipe)
  const delimiter = detectDelimiter(content);

  const rawRecords: CSVRawRecord[] = parse(content, {
    columns: true,           // Use first row as headers
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    delimiter,
    bom: true,               // Handle BOM character
    cast: false,             // Keep everything as strings
    relax_quotes: true,
  });

  // Sanitize all values
  const records = rawRecords.map((record) => {
    const sanitized: CSVRawRecord = {};
    for (const [key, value] of Object.entries(record)) {
      const cleanKey = sanitize(key);
      if (cleanKey) {
        sanitized[cleanKey] = sanitize(value || '');
      }
    }
    return sanitized;
  });

  // Extract headers from the first record
  const headers = records.length > 0 ? Object.keys(records[0]) : [];

  return {
    headers,
    records,
    totalRows: records.length,
  };
}

/**
 * Detects the most likely delimiter used in the CSV content.
 */
function detectDelimiter(content: string): string {
  const firstLines = content.split('\n').slice(0, 5).join('\n');

  const delimiters = [
    { char: ',', count: 0 },
    { char: ';', count: 0 },
    { char: '\t', count: 0 },
    { char: '|', count: 0 },
  ];

  for (const d of delimiters) {
    d.count = (firstLines.match(new RegExp(`\\${d.char}`, 'g')) || []).length;
  }

  delimiters.sort((a, b) => b.count - a.count);

  // Default to comma if no clear winner
  return delimiters[0].count > 0 ? delimiters[0].char : ',';
}
