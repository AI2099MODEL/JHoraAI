# JHoraAI Professional Production Deployment Guide
This document serves as the operational guide and runbook for deploying the **JHoraAI Professional** frontend client to **Cloudflare Pages** with full Continuous Integration/Continuous Deployment (CI/CD) via GitHub.

---

## 1. Cloudflare Pages Deployment Guide
Cloudflare Pages provides a high-performance static hosting architecture with global edge replication, automatic HTTPS, and integrated serverless redirect and header engines.

### Setup Steps (One-Time)
1.  **Log into Cloudflare Dashboard:** Go to [dash.cloudflare.com](https://dash.cloudflare.com) and navigate to **Workers & Pages**.
2.  **Create a New Project:** Click **Create Application** &rarr; select the **Pages** tab &rarr; click **Connect to Git**.
3.  **Authorize GitHub:** Link your GitHub account and select your repository (`VedicAstro` or `JHoraAI`).
4.  **Configure Build & Deployment Settings:**
    *   **Project Name:** `jhoraai-professional`
    *   **Production Branch:** `main` (Every push to this branch will trigger an auto-deployment)
    *   **Framework Preset:** `Vite` (or `None`)
    *   **Build Command:** `npm run build`
    *   **Build Output Directory:** `dist`
    *   **Root Directory:** `/`
5.  **Inject Environment Variables:** Navigate to **Project Settings** &rarr; **Environment Variables** (see Section 3 for values).
6.  **Click Save and Deploy:** Cloudflare will spin up a container, install dependencies, compile the Vite app, and assign a public `*.pages.dev` URL.

---

## 2. GitHub Deployment Workflow
You can configure a GitHub Actions workflow to run automatic test compilations and lint checks before pushing changes to your production deployment branch.

Create the file `.github/workflows/pages-ci.yml` in your repository with the following contents:

```yaml
name: JHoraAI Production CI Check

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Setup Node.js (v20)
      uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'

    - name: Install Dependencies
      run: npm ci

    - name: Run Build (Production Verification)
      run: npm run build
      env:
        VITE_FIREBASE_API_KEY: "placeholder"
        VITE_FIREBASE_AUTH_DOMAIN: "placeholder.firebaseapp.com"
        VITE_FIREBASE_PROJECT_ID: "placeholder"
        VITE_FIREBASE_STORAGE_BUCKET: "placeholder.appspot.com"
        VITE_FIREBASE_MESSAGING_SENDER_ID: "123456"
        VITE_FIREBASE_APP_ID: "1:123:web:abc"
        VITE_JHORA_API_URL: "https://api.placeholder.com"
```

*Note: Since Cloudflare Pages integrates directly with your GitHub repository, you do not need GitHub Actions to push files to Cloudflare. GitHub triggers Cloudflare's internal build container automatically upon push.*

---

## 3. Environment Variable Guide
All client-side environment variables MUST be prefixed with `VITE_` so that the Vite compiler can inject them securely into the output bundle.

| Variable Name | Required? | Source Location / Purpose |
|---|---|---|
| **`VITE_FIREBASE_API_KEY`** | Yes | Firebase Console &rarr; Project Settings &rarr; Web App Config. Auth key. |
| **`VITE_FIREBASE_AUTH_DOMAIN`** | Yes | Your Firebase Project Domain (e.g. `yourproject.firebaseapp.com`). |
| **`VITE_FIREBASE_PROJECT_ID`** | Yes | Your unique Firebase Project ID (e.g., `jhora-ai-prod`). |
| **`VITE_FIREBASE_STORAGE_BUCKET`** | Yes | Storage bucket URL for user profile photos or exports. |
| **`VITE_FIREBASE_MESSAGING_SENDER_ID`**| Yes | Numeric ID used for Cloud Messaging subscriptions. |
| **`VITE_FIREBASE_APP_ID`** | Yes | Web App App ID (unique string). |
| **`VITE_JHORA_API_URL`** | Yes | The HTTPS endpoint of your self-hosted `VedicAstro` / JHora API backend. |

---

## 4. Production Checklist (Pre-Flight)
Before launching `JHoraAI Professional` to your public users:
*   [ ] **Authorized Redirect URIs:** Add your custom Cloudflare domain (e.g. `jhoraai.com` and `jhoraai-professional.pages.dev`) to the **Authorized Domains** list in the Firebase Console under **Authentication &rarr; Settings**.
*   [ ] **CORS Settings on Backend:** Ensure your VedicAstro API backend server allows headers from your custom Pages domain.
*   [ ] **Service Worker Build:** Ensure `/sw.js` and `/manifest.json` are present inside the `dist` folder after running `npm run build`.
*   [ ] **PWA Audit:** Verify that Lighthouse audits pass for "PWA Installability" (requires HTTPS, which Cloudflare provides automatically).

---

## 5. Rollback Procedure
If a production deployment introduces critical errors or calculation inconsistencies, you can roll back instantly with zero downtime.

1.  **Navigate to Deployments:** Open the Cloudflare Dashboard &rarr; **Workers & Pages** &rarr; select **jhoraai-professional**.
2.  **View All Deployments:** Under the **Deployments** tab, scroll down to find the last known stable deployment.
3.  **Rollback/Promote:** Click the **three dots** icon next to the stable deployment &rarr; click **Rollback to this deployment** (or **Promote to Production**).
4.  **Confirm Rollback:** Cloudflare will immediately route all edge traffic to the selected historical container. This rollback takes effect globally in under **1 second** with zero downtime.
