# Architecture

The application is a frontend-first React Router application. Puter.js provides
authentication, private cloud files, AI, and key-value storage.

```text
Components/routes
       |
     hooks
       |
    services
       |
 repositories
       |
 Puter adapter
```

Components render props and emit events. Hooks own route orchestration and
transient state. Services validate inputs and implement workflows. Repositories
serialize domain records and enforce key conventions. Only the adapter accesses
`window.puter`.

Authentication is global. Upload forms, processing state, history, and review
data remain local to their routes. PDF.js parses each resume once and produces a
first-page preview. Protected routes redirect to `/auth` and resume reads verify
the authenticated owner's ID.

