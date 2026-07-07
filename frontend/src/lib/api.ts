import { ProcessingResult } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Upload and process a CSV file through the backend AI pipeline.
 */
export async function processCSV(file: File): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/csv/process`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || `Server error: ${response.status} ${response.statusText}`
    );
  }

  const result: ProcessingResult = await response.json();

  if (!result.success) {
    throw new Error((result as unknown as { error: string }).error || 'Processing failed');
  }

  return result;
}

/**
 * Check backend health.
 */
export async function checkHealth(): Promise<{
  status: string;
  geminiConfigured: boolean;
}> {
  const response = await fetch(`${API_BASE}/api/health`);
  return response.json();
}
