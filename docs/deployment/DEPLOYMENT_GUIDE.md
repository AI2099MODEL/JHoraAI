# JHoraAI Version 1.0 - Production Deployment Guide

This guide provides deployment instructions for hosting the JHoraAI professional application on public-facing cloud networks.

---

## 1. Architectural Structure
JHoraAI is a full-stack, modular application comprised of:
1. **Frontend (Client SPA)**: React, built using Vite, configured with Tailwind CSS.
2. **Backend (Express Proxy)**: Express server proxying API requests to secure high-precision astrology runtimes, hiding keys and preventing CORS blockages.

---

## 2. Frontend Deployment Options

### A. Cloudflare Pages
1. **Build Settings**:
   * **Framework Preset**: Vite / None
   * **Build Command**: `npm run build`
   * **Build Output Directory**: `dist`
2. **Environment Variables**:
   * Set `NODE_ENV` to `production`.
3. **Routing Fallback**:
   * Create a `_redirects` file in your `public/` directory with the content:
     ```text
     /* /index.html 200
     ```

### B. Vercel
1. **Build Settings**:
   * Vercel will automatically detect the Vite build pipeline.
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
2. **SPA Configuration (`vercel.json`)**:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## 3. Backend Deployment (Node/Express Container)

For full-stack deployments where Express serves the frontend assets and proxies API requests (e.g., Google Cloud Run, Heroku, Render):

### A. Container Requirements
- **Node.js**: Version 18 or higher is recommended.
- **Port Ingress**: The application binds strictly to port `3000` on host `0.0.0.0`.
- **Protocol**: HTTPS is mandatory for secure transfer of geolocation and profile credentials.

### B. Environment Variables
Configure these secrets securely in your server panel (do NOT commit to source control):
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_secured_gemini_api_token
```

### C. Build and Start Sequence
```bash
# 1. Install dependencies
npm install

# 2. Compile static assets and bundle the server
npm run build

# 3. Spin up the production server
npm start
```

---

## 4. Production Routing, CORS, and Caching
* **CORS Settings**: Express routes are configured with strict headers restricting API endpoint usage to the host domain.
* **Asset Caching**: The server serves static files using aggressive caching policies for assets, and `no-cache` for `index.html` to ensure instant application updates.
* **HTTPS Enforcement**: Use Express middleware or load balancer redirection rules to force secure SSL/TLS channels for all traffic.
