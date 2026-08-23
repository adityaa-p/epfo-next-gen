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

## Deploy to GitHub Pages

The included GitHub Actions workflow deploys the production build whenever a change is pushed to `main` (or when manually run from the Actions tab). It uses a repository-aware Vite base path, so the deployed app works at `https://<github-username>.github.io/<repository-name>/` without affecting local development.

1. Push this repository to GitHub and make `main` the production branch.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`, then open the **Deploy to GitHub Pages** workflow to monitor the deployment.

The workflow runs formatting, linting, tests, and the production build before uploading `dist` to GitHub Pages. For a custom domain or root-domain site, set the workflow's `BASE_PATH` build environment variable to `/`.
