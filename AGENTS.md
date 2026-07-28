# Agent Instructions

Treat this repository as production software. User instructions take precedence,
followed by the specifications in this repository and the official tutorial
workflow.

- Keep dependencies flowing from UI to hooks, services, repositories, providers,
  and external SDKs.
- Never call Puter directly from a route or reusable component.
- Keep temporary form and page state local. Zustand is reserved for Puter
  initialization and authentication.
- Use strict TypeScript. Do not introduce `any`, duplicate domain types, secrets,
  or business logic in UI components.
- Validate PDFs before processing, AI output before persistence, and ownership
  before reading a stored analysis.
- Every asynchronous screen must handle loading, success, error, empty, and retry
  states where applicable.
- Preserve accessible labels, keyboard operation, visible focus styles, and
  responsive behavior from 320px upward.
- Run `npm run typecheck` and `npm run build` before committing.

