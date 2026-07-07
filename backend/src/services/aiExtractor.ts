import { GoogleGenerativeAI } from '@google/generative-ai';
import { CSVRawRecord, CRMRecord, BatchResult, SkippedRecord } from '../types';
import { getSystemPrompt, getBatchPrompt } from '../prompts/crmExtraction';

const BATCH_SIZE = 20;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * AI Extractor service using Google Gemini.
 * Processes records in batches with retry logic.
 */
export class AIExtractor {
  private model;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.1,       // Low temperature for consistent extraction
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });
  }

  /**
   * Process all records in batches.
   * Returns extracted CRM records and skipped records.
   */
  async processRecords(
    headers: string[],
    records: CSVRawRecord[],
    onProgress?: (batchIndex: number, totalBatches: number) => void
  ): Promise<{ records: CRMRecord[]; skipped: SkippedRecord[] }> {
    const batches = this.createBatches(records);
    const totalBatches = batches.length;

    const allExtracted: CRMRecord[] = [];
    const allSkipped: SkippedRecord[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        const result = await this.processBatchWithRetry(
          headers,
          batch,
          i,
          totalBatches
        );

        allExtracted.push(...result.extracted);
        allSkipped.push(...result.skipped);
      } catch (error) {
        // If a batch completely fails after retries, skip all records in it
        console.error(`Batch ${i + 1}/${totalBatches} failed completely:`, error);
        for (const record of batch) {
          allSkipped.push({
            originalData: record,
            reason: `AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      }

      if (onProgress) {
        onProgress(i + 1, totalBatches);
      }
    }

    return { records: allExtracted, skipped: allSkipped };
  }

  /**
   * Splits records into batches.
   */
  private createBatches(records: CSVRawRecord[]): CSVRawRecord[][] {
    const batches: CSVRawRecord[][] = [];
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      batches.push(records.slice(i, i + BATCH_SIZE));
    }
    return batches;
  }

  /**
   * Process a single batch with exponential backoff retry.
   */
  private async processBatchWithRetry(
    headers: string[],
    batch: CSVRawRecord[],
    batchIndex: number,
    totalBatches: number
  ): Promise<BatchResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await this.processBatch(headers, batch, batchIndex, totalBatches);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `Batch ${batchIndex + 1}/${totalBatches} attempt ${attempt + 1}/${MAX_RETRIES} failed:`,
          lastError.message
        );

        if (attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('All retries exhausted');
  }

  /**
   * Process a single batch by calling Gemini AI.
   */
  private async processBatch(
    headers: string[],
    batch: CSVRawRecord[],
    batchIndex: number,
    totalBatches: number
  ): Promise<BatchResult> {
    const systemPrompt = getSystemPrompt();
    const userPrompt = getBatchPrompt(headers, batch);

    const chat = this.model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will extract CRM records from CSV data following all the specified rules and return valid JSON.' }] },
      ],
    });

    const result = await chat.sendMessage(userPrompt);
    const responseText = result.response.text();

    // Parse the AI response
    const parsed = this.parseAIResponse(responseText, batch);

    return {
      ...parsed,
      batchIndex,
      totalBatches,
    };
  }

  /**
   * Parse and validate the AI response JSON.
   */
  private parseAIResponse(
    responseText: string,
    originalBatch: CSVRawRecord[]
  ): { extracted: CRMRecord[]; skipped: SkippedRecord[] } {
    try {
      // Try to extract JSON from the response
      let jsonText = responseText.trim();

      // Remove markdown code fences if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }

      const data = JSON.parse(jsonText);

      const extracted: CRMRecord[] = (data.extracted || []).map(
        (record: Record<string, unknown>) => this.normalizeCRMRecord(record)
      );

      const skipped: SkippedRecord[] = (data.skipped || []).map(
        (item: Record<string, unknown>) => ({
          originalData: (item.originalData || {}) as CSVRawRecord,
          reason: String(item.reason || 'Unknown reason'),
        })
      );

      return { extracted, skipped };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', responseText.substring(0, 500));

      // If parsing fails, skip all records in this batch
      return {
        extracted: [],
        skipped: originalBatch.map((record) => ({
          originalData: record,
          reason: 'AI returned invalid JSON response',
        })),
      };
    }
  }

  /**
   * Normalize a CRM record ensuring all fields exist and have correct types.
   */
  private normalizeCRMRecord(raw: Record<string, unknown>): CRMRecord {
    return {
      created_at: String(raw.created_at || ''),
      name: String(raw.name || ''),
      email: String(raw.email || ''),
      country_code: String(raw.country_code || ''),
      mobile_without_country_code: String(raw.mobile_without_country_code || ''),
      company: String(raw.company || ''),
      city: String(raw.city || ''),
      state: String(raw.state || ''),
      country: String(raw.country || ''),
      lead_owner: String(raw.lead_owner || ''),
      crm_status: this.validateCRMStatus(String(raw.crm_status || '')),
      crm_note: String(raw.crm_note || ''),
      data_source: this.validateDataSource(String(raw.data_source || '')),
      possession_time: String(raw.possession_time || ''),
      description: String(raw.description || ''),
    };
  }

  /**
   * Validate CRM status against allowed values.
   */
  private validateCRMStatus(status: string): string {
    const allowed = [
      'GOOD_LEAD_FOLLOW_UP',
      'DID_NOT_CONNECT',
      'BAD_LEAD',
      'SALE_DONE',
    ];
    return allowed.includes(status) ? status : 'GOOD_LEAD_FOLLOW_UP';
  }

  /**
   * Validate data source against allowed values.
   */
  private validateDataSource(source: string): string {
    const allowed = [
      'leads_on_demand',
      'meridian_tower',
      'eden_park',
      'varah_swamy',
      'sarjapur_plots',
    ];
    return allowed.includes(source) ? source : '';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
