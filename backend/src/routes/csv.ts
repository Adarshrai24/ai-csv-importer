import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseCSV } from '../services/csvParser';
import { AIExtractor } from '../services/aiExtractor';
import { validateCSVFile } from '../utils/validation';
import { ProcessingResult, ErrorResponse } from '../types';

const router = Router();

// Configure multer for file upload (memory storage, 10MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * POST /api/csv/process
 * Upload and process a CSV file in one step.
 * Accepts multipart form data with a 'file' field.
 */
router.post(
  '/process',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
      // Validate file
      if (!req.file) {
        const error: ErrorResponse = {
          success: false,
          error: 'No file uploaded. Please upload a CSV file.',
        };
        res.status(400).json(error);
        return;
      }

      const validation = validateCSVFile(req.file);
      if (!validation.valid) {
        const error: ErrorResponse = {
          success: false,
          error: validation.error || 'Invalid file',
        };
        res.status(400).json(error);
        return;
      }

      // Parse CSV
      const csvResult = parseCSV(req.file.buffer);

      if (csvResult.records.length === 0) {
        const error: ErrorResponse = {
          success: false,
          error: 'CSV file contains no data rows.',
        };
        res.status(400).json(error);
        return;
      }

      // Initialize AI extractor
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        const error: ErrorResponse = {
          success: false,
          error: 'Gemini API key not configured. Set GEMINI_API_KEY in backend/.env',
        };
        res.status(500).json(error);
        return;
      }

      const extractor = new AIExtractor(apiKey);

      // Process with AI
      const { records, skipped } = await extractor.processRecords(
        csvResult.headers,
        csvResult.records
      );

      const processingTime = Date.now() - startTime;

      const result: ProcessingResult = {
        success: true,
        data: {
          records,
          skipped,
          totalImported: records.length,
          totalSkipped: skipped.length,
          totalProcessed: csvResult.records.length,
        },
        processingTime,
      };

      res.json(result);
    } catch (err) {
      console.error('Processing error:', err);
      const error: ErrorResponse = {
        success: false,
        error: 'An error occurred while processing the CSV file.',
        details: err instanceof Error ? err.message : 'Unknown error',
      };
      res.status(500).json(error);
    }
  }
);

/**
 * POST /api/csv/preview
 * Upload a CSV and return parsed headers + rows for preview (no AI processing).
 */
router.post(
  '/preview',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        const error: ErrorResponse = {
          success: false,
          error: 'No file uploaded.',
        };
        res.status(400).json(error);
        return;
      }

      const validation = validateCSVFile(req.file);
      if (!validation.valid) {
        const error: ErrorResponse = {
          success: false,
          error: validation.error || 'Invalid file',
        };
        res.status(400).json(error);
        return;
      }

      const csvResult = parseCSV(req.file.buffer);

      res.json({
        success: true,
        data: {
          headers: csvResult.headers,
          records: csvResult.records,
          totalRows: csvResult.totalRows,
        },
      });
    } catch (err) {
      console.error('Preview error:', err);
      const error: ErrorResponse = {
        success: false,
        error: 'Failed to parse CSV file.',
        details: err instanceof Error ? err.message : 'Unknown error',
      };
      res.status(500).json(error);
    }
  }
);

export default router;
