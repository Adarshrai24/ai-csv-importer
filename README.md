# AI-Powered CSV Importer for GrowEasy CRM

An intelligent full-stack application that converts **any CSV format** into standardized GrowEasy CRM records using **Google Gemini AI**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Express](https://img.shields.io/badge/Express-5-grey?style=flat-square&logo=express)
![Gemini](https://img.shields.io/badge/Gemini_AI-2.0_Flash-blue?style=flat-square&logo=google)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

## Features

- **🤖 AI-Powered Extraction** — Intelligently maps arbitrary CSV columns to CRM fields using Google Gemini
- **📎 Drag & Drop Upload** — Beautiful upload interface with drag-and-drop and file picker
- **👁️ Data Preview** — Preview uploaded CSV data in a scrollable table before processing
- **📊 Results Dashboard** — View imported records with status badges, stats, and export
- **🔄 Batch Processing** — Handles large files by processing records in configurable batches
- **♻️ Retry Logic** — Exponential backoff retry for failed AI batches
- **📥 CSV Export** — Export processed CRM records as a clean CSV
- **🌙 Dark Mode** — Beautiful dark glassmorphism UI
- **📱 Responsive** — Works across desktop, tablet, and mobile

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌──────────────┐
│  Next.js Client │ ──────▶ │  Express Server │ ──────▶ │  Gemini AI   │
│  (Port 3000)    │         │  (Port 3001)    │         │  (2.0 Flash) │
│                 │ ◀────── │                 │ ◀────── │              │
│  • Upload       │         │  • Parse CSV    │         │  • Extract   │
│  • Preview      │   JSON  │  • Batch & Send │   JSON  │  • Map Fields│
│  • Results      │         │  • Validate     │         │  • Validate  │
└─────────────────┘         └─────────────────┘         └──────────────┘
```

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | Next.js 16, TypeScript  |
| Backend   | Express 5, TypeScript   |
| AI        | Google Gemini 2.0 Flash |
| CSV Parse | PapaParse (client), csv-parse (server) |
| Styling   | Vanilla CSS (glassmorphism) |

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 18
- **Google Gemini API Key** — Get one free at [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure API Key

```bash
# Create .env file in backend/
cp backend/.env.example backend/.env

# Edit and add your Gemini API key
echo "GEMINI_API_KEY=your_actual_api_key" > backend/.env
echo "PORT=3001" >> backend/.env
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend (port 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

### 4. Open Application

Navigate to [http://localhost:3000](http://localhost:3000)

## API Documentation

### `POST /api/csv/process`

Upload and process a CSV file with AI extraction.

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [ { "name": "...", "email": "...", ... } ],
    "skipped": [ { "originalData": {...}, "reason": "..." } ],
    "totalImported": 5,
    "totalSkipped": 1,
    "totalProcessed": 6
  },
  "processingTime": 3200
}
```

### `POST /api/csv/preview`

Parse a CSV and return headers + rows for preview (no AI processing).

### `GET /api/health`

Health check endpoint.

## CRM Fields Extracted

| Field | Description |
|-------|-------------|
| `created_at` | Lead creation date |
| `name` | Lead name |
| `email` | Primary email |
| `country_code` | Country dialing code |
| `mobile_without_country_code` | Mobile number |
| `company` | Company name |
| `city`, `state`, `country` | Location |
| `lead_owner` | Lead owner |
| `crm_status` | Status (GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE) |
| `crm_note` | Notes, extra contacts |
| `data_source` | Source identifier |
| `possession_time` | Property possession time |
| `description` | Additional details |

## Sample Test Files

The `sample_data/` directory contains test CSVs:

- `test_basic.csv` — Simple CSV with common column names
- `test_complex.csv` — Complex CSV with multiple emails/phones, varied headers

## Project Structure

```
├── frontend/                # Next.js app
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # API client
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── backend/                 # Express API
│   ├── src/
│   │   ├── index.ts         # Server entry
│   │   ├── routes/          # API routes
│   │   ├── services/        # CSV parser, AI extractor
│   │   ├── prompts/         # AI prompt templates
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Validation helpers
│   ├── .env                 # API keys (not committed)
│   └── package.json
│
├── sample_data/             # Test CSV files
├── prompt.md                # Assignment spec
└── README.md
```

## License

MIT
