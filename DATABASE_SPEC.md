# Database Specification

Puter KV stores application metadata; Puter FS stores PDFs and preview images.

- `resume:{resumeId}` stores owner ID, job context, extracted text, private file
  paths, linked analysis ID, and timestamps.
- `analysis:{analysisId}` stores validated scores, feedback categories, keywords,
  strengths, weaknesses, suggestions, raw structured response, and timestamp.
- `history:{userId}` stores newest-first resume IDs for the dashboard.

The application reads only IDs from the authenticated user's history and verifies
`resume.userId` before returning a review. AI analysis completes before metadata
is stored. Failed workflows clean up uploaded files and partial KV records.

