# EPFO One

A mobile- and tablet-first React prototype for a clearer EPFO member experience. The Phase 2 information architecture keeps the member home concise and groups actions by the task a member wants to complete: **Employment details**, **Manage funds**, **Requests**, and **Track status**. The prototype uses local data and simulated submissions throughout.

Phase 3 hardens the prototype journey with a resend cooldown and mobile-number correction during mock OTP sign-in, local request persistence across browser refreshes, and downloadable CSV passbooks for the selected employer and financial year.

Phase 4 adds GitHub Pages-compatible hash navigation for shareable employment, requests, profile, and passbook views. Browser Back and Forward navigation now restores the corresponding view, while profile and request-status overlays support Escape and outside-click dismissal.

## Member journeys

### Review an employment and its passbook

1. Sign in with any ten-digit mobile number and six-digit OTP.
2. Choose an employment from the compact cards on member home.
3. Open **Employment details** to review service, balance, and recent contributions.
4. Select **View complete passbook**, then choose a financial year to inspect monthly EPF and EPS entries.
5. Select **Download CSV** to keep an accessible copy of the displayed financial year.

### Transfer or withdraw funds

1. Open an employment and choose **Manage funds**.
2. Select the transfer or withdrawal task.
3. Complete the guided form and review the confirmation before submitting.
4. Return to **Requests** and use **Track status** to follow the request through the applicable milestones.

Submitted mock requests are stored in the browser so that the Requests journey remains intact after refreshing the page. Clearing browser storage restores the original demonstration data.

### Review identity details

The member home masks the UAN so it is not exposed at a glance. Open **Member profile** from the profile menu when the full UAN and related identity details are needed.

### Get help

Open the EPFO One assistant and ask about balances, employment details, managing funds, requests, status tracking, passbooks, or the member profile. Its answers link the question back to the relevant task path. The assistant is a deterministic mock and does not contact an external service.

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
