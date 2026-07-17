# JHoraAI Version 1.0 Release Candidate - Deployment Checklist

Use this checklist to deploy the **JHoraAI Version 1.0 Release Candidate** to production cloud platforms (e.g., Google Cloud Run, Vercel, Render, or other Node.js container hosts).

---

## 1. Pre-Deployment Verification

- [ ] **TypeScript Build Check**: Run `npm run build` locally or in the CI/CD pipeline to confirm error-free compilation of client and server code.
- [ ] **Linter Check**: Run `npm run lint` (`tsc --noEmit`) to verify zero type mismatches or dangling variables.
- [ ] **Metadata Audit**: Confirm `metadata.json` has a descriptive app name, correct frame permissions, and the required `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` capability.

## 2. Infrastructure & Environment Configuration

- [ ] **Container Port Routing**:
  - The production environment must bind exclusively to Port `3000`.
  - The host binding must be `0.0.0.0` (not `localhost`).
- [ ] **Secret Configuration**:
  - [ ] Configure `GEMINI_API_KEY` inside the production hosting secrets/environment variable dashboard.
  - [ ] **CRITICAL**: Do NOT commit actual secrets to `.env` or code repositories.
- [ ] **Node.js Environment**: Set `NODE_ENV=production` in the production runtime container parameters.

## 3. API Gateway Configuration

- [ ] **API Endpoint**:
  - Verify that `server.ts` is configured to target the high-fidelity JHora endpoint: `https://jagannatha-hora-359167915530.europe-west1.run.app`.
- [ ] **SSL/TLS Certification**:
  - Ingress traffic must use HTTPS to ensure secure transfer of location and birth details.

## 4. Build and Launch Phase

- [ ] Run the official build pipeline:
  ```bash
  npm run build
  ```
- [ ] Check that `dist/` contains the fully minified and bundled React assets (including `index.html`).
- [ ] Check that `dist/server.cjs` compiles successfully via esbuild.
- [ ] Launch the server using:
  ```bash
  npm start
  ```
  *(Equivalent to: `node dist/server.cjs`)*

## 5. Post-Deployment Smoke Tests

- [ ] **Load Test**: Open the application URL and ensure the main dashboard renders immediately without infinite spinner overlays.
- [ ] **Geocoding Autocomplete Test**: Type "New Delhi" or "London" in the birth location field and verify suggestion dropdowns populate.
- [ ] **Cast Horoscope Test**: Click "Generate Horoscope" and confirm planetary grids, divisional charts, and dashas render successfully.
- [ ] **Offline Cache Verification**: Disable network adapters (offline mode), reload the app, and verify previously cast profiles load from IndexedDB.
- [ ] **AI Assistant Test**: Enter a valid Gemini API Key in Settings, type a question, and verify the AI analysis loads formatted markdown.
