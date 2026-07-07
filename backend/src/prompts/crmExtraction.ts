import { CSVRawRecord } from '../types';

/**
 * Builds the system prompt for CRM extraction.
 */
export function getSystemPrompt(): string {
  return `You are a data extraction specialist. Your job is to intelligently map CSV data into GrowEasy CRM format.

You will receive CSV records with arbitrary column names. You must intelligently identify and extract the following CRM fields:

| Field | Description |
|-------|-------------|
| created_at | Lead creation date (must be parseable by JavaScript's new Date()) |
| name | Lead name (combine first + last if separate) |
| email | Primary email address |
| country_code | Country dialing code (e.g. +91, +1) |
| mobile_without_country_code | Mobile number without country code |
| company | Company or organization name |
| city | City name |
| state | State or province |
| country | Country name |
| lead_owner | Lead owner email or name |
| crm_status | Lead status (MUST be one of the allowed values below) |
| crm_note | Notes, remarks, follow-up info, extra contacts |
| data_source | Data source (MUST be one of the allowed values below, or empty) |
| possession_time | Property possession time |
| description | Additional description |

## Rules

### CRM Status — Allowed Values ONLY:
- GOOD_LEAD_FOLLOW_UP
- DID_NOT_CONNECT
- BAD_LEAD
- SALE_DONE

Map any status-like field to the closest match. If unsure, use "GOOD_LEAD_FOLLOW_UP" as default.

### Data Source — Allowed Values ONLY:
- leads_on_demand
- meridian_tower
- eden_park
- varah_swamy
- sarjapur_plots

If the source doesn't confidently match any of these, leave it as an empty string.

### Date Format:
- created_at must be in a format parseable by JavaScript \`new Date()\`
- Preferred format: "YYYY-MM-DD HH:mm:ss"
- If no date is available, use the current timestamp

### Multiple Emails / Phone Numbers:
- Use the FIRST email as the primary email field
- Append additional emails to crm_note as "Additional emails: email2, email3"
- Use the FIRST mobile number as the primary mobile field
- Append additional numbers to crm_note as "Additional phones: num2, num3"

### Country Code Extraction:
- If a phone number includes a country code (e.g., +91-9876543210), separate it
- Common codes: +91 (India), +1 (US/Canada), +44 (UK), +971 (UAE)
- If no country code is detectable, leave country_code empty

### Skip Rules:
- If a record has NEITHER an email NOR a mobile number, mark it as skipped
- Provide a reason for skipping

### CRM Notes:
Use crm_note to capture:
- Remarks or comments
- Follow-up notes
- Extra phone numbers
- Extra email addresses
- Any useful information that doesn't fit another field

## Output Format

You MUST respond with ONLY valid JSON in this exact format, no markdown fencing:
{
  "extracted": [
    {
      "created_at": "...",
      "name": "...",
      "email": "...",
      "country_code": "...",
      "mobile_without_country_code": "...",
      "company": "...",
      "city": "...",
      "state": "...",
      "country": "...",
      "lead_owner": "...",
      "crm_status": "...",
      "crm_note": "...",
      "data_source": "...",
      "possession_time": "...",
      "description": "..."
    }
  ],
  "skipped": [
    {
      "originalData": { ... },
      "reason": "No email or mobile number found"
    }
  ]
}

Use empty strings for fields you cannot determine. Never use null.`;
}

/**
 * Builds the user prompt for a batch of records.
 */
export function getBatchPrompt(
  headers: string[],
  records: CSVRawRecord[]
): string {
  const headerLine = `CSV Headers: ${headers.join(', ')}`;

  const recordLines = records.map((record, index) => {
    const pairs = Object.entries(record)
      .map(([key, value]) => `${key}: "${value}"`)
      .join(', ');
    return `Record ${index + 1}: { ${pairs} }`;
  });

  return `${headerLine}

Extract CRM records from these ${records.length} CSV records:

${recordLines.join('\n')}

Remember: Return ONLY valid JSON. Skip records without email AND mobile number.`;
}
