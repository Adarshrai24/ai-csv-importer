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
  crm_status: CRMStatus | string;
  crm_note: string;
  data_source: DataSource | string;
  possession_time: string;
  description: string;
}

/**
 * Allowed CRM status values.
 */
export type CRMStatus =
  | 'GOOD_LEAD_FOLLOW_UP'
  | 'DID_NOT_CONNECT'
  | 'BAD_LEAD'
  | 'SALE_DONE';

/**
 * Allowed data source values.
 */
export type DataSource =
  | 'leads_on_demand'
  | 'meridian_tower'
  | 'eden_park'
  | 'varah_swamy'
  | 'sarjapur_plots';

/**
 * A raw CSV record — arbitrary key-value pairs.
 */
export interface CSVRawRecord {
  [key: string]: string;
}

/**
 * Result of CSV parsing.
 */
export interface CSVParseResult {
  headers: string[];
  records: CSVRawRecord[];
  totalRows: number;
}

/**
 * Result from a single AI extraction batch.
 */
export interface BatchResult {
  extracted: CRMRecord[];
  skipped: SkippedRecord[];
  batchIndex: number;
  totalBatches: number;
}

/**
 * A record that was skipped during extraction.
 */
export interface SkippedRecord {
  originalData: CSVRawRecord;
  reason: string;
}

/**
 * Complete processing result returned to the frontend.
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
 * Error response shape.
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}
