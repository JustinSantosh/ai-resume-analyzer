# Coding Standards

- Strict TypeScript; use `unknown` rather than `any`.
- PascalCase components, `use`-prefixed hooks, camelCase services and utilities,
  and upper-snake-case constants.
- One responsibility per file and small functions with early returns.
- No direct Puter access from UI, duplicated domain types, global mutable state,
  secrets, production debug logs, or silent error handling.
- Prefer semantic HTML, explicit labels, alt text, keyboard-accessible controls,
  and visible focus states.
- Use Tailwind utilities and shared component classes rather than inline styles.
- Validate external input before persistence and rendering.
- A change is complete only when type checking and the production build pass.

