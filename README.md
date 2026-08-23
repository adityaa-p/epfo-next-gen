# EPFO One

A mobile- and tablet-first React prototype for a clearer EPFO member experience. It includes a mock mobile/OTP login, employer accounts ordered by recency, expandable contribution details, mock claim tracking, and a passbook placeholder.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`). Enter any ten-digit mobile number, then any six-digit OTP to access the mock dashboard.

## Checks

```bash
npm test
npm run lint
npm run format:check
npm run build
```

All data is deliberately local mock data in `src/main.jsx`; no backend or external API is started or required.
