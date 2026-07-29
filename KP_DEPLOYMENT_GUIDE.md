# KP Deployment & Containerization Guide (Phase 16)

This deployment guide details how to build, test, and host the independent FastAPI microservice for the VedicAstro KP stellar calculations engine.

## 1. Directory Structure

Create a new microservice folder or repository:

```
vedicastro-service/
├── Dockerfile
├── requirements.txt
├── main.py
└── app/
    ├── __init__.py
    ├── routers/
    │   ├── __init__.py
    │   └── kp.py
    └── utils/
        └── math.py
```

## 2. Microservice Entry Point (`main.py`)

Using FastAPI:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import kp

app = FastAPI(
    title="VedicAstro KP Engine Service",
    description="Authentic Parashari & Krishnamurti Paddhati calculations API",
    version="1.0.0"
)

# Enable CORS for internal Cloud Run container communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "vedicastro-kp-engine"}

app.include_router(kp.router, prefix="/v1")
```

## 3. Containerization (`Dockerfile`)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

ENV HOST=0.0.0.0
ENV PORT=8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 4. Deploying to Google Cloud Run

To build and deploy the container to Google Cloud:

```bash
# Build using Google Cloud Builds
gcloud builds submit --tag gcr.io/your-project-id/vedicastro-kp-service

# Deploy the container to Cloud Run
gcloud run deploy vedicastro-kp-service \
    --image gcr.io/your-project-id/vedicastro-kp-service \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

Configure `KP_BASE_URL` in your main JHora JHORA application environment pointing to the newly generated Cloud Run service URL.
