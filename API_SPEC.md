# API Specification

There is no HTTP API. External operations are wrapped by
`app/lib/services/puter.service.ts`.

- Authentication: current user, status, login, logout.
- Files: upload, read, delete.
- AI: resume feedback from an attached private Puter file and typed prompt.
- KV: get, set, delete.

PDF, analysis, and resume services validate inputs and return domain objects or
typed `ApplicationError` instances. Transient uploads and AI calls retry up to
three times with exponential backoff. Invalid files, malformed AI JSON, and
authentication failures are not silently ignored.

