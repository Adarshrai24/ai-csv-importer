import { Request } from 'express';

const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'text/plain',
  'application/csv',
  'text/x-csv',
  'application/x-csv',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates that the uploaded file is a valid CSV.
 */
export function validateCSVFile(file: Express.Multer.File): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: 'No file uploaded' };
  }

  // Check file extension
  const ext = file.originalname.toLowerCase().split('.').pop();
  if (ext !== 'csv') {
    return {
      valid: false,
      error: `Invalid file extension: .${ext}. Only .csv files are allowed.`,
    };
  }

  // Check MIME type (browsers can be inconsistent, so also accept by extension)
  if (file.mimetype && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    // Some browsers set application/octet-stream for CSV files, allow if extension is csv
    if (file.mimetype !== 'application/octet-stream') {
      return {
        valid: false,
        error: `Invalid file type: ${file.mimetype}. Only CSV files are allowed.`,
      };
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum size is 10MB.`,
    };
  }

  // Check that file is not empty
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  return { valid: true };
}

/**
 * Sanitizes a string value by trimming and removing control characters.
 */
export function sanitize(value: string): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control chars except \t, \n, \r
}
