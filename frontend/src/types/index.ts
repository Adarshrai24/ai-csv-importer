/**
 * CRM record fields as defined by GrowEasy CRM format.
 */
export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

/**
 * A record that was skipped during extraction.
 */
export interface SkippedRecord {
  originalData: Record<string, string>;
  reason: string;
}

/**
 * CSV preview data returned from parsing.
 */
export interface CSVPreviewData {
  headers: string[];
  records: Record<string, string>[];
  totalRows: number;
}

/**
 * Result from the AI processing endpoint.
 */
export interface ProcessingResult {
  success: boolean;
  data: {
    records: CRMRecord[];
    skipped: SkippedRecord[];
    totalImported: number;
    totalSkipped: number;
    totalProcessed: number;
  };
  processingTime: number;
}

/**
 * Application step states.
 */
export type AppStep = 'upload' | 'preview' | 'processing' | 'results';
