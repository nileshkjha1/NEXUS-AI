# ==============================================================================
# NEXUS AI — Enterprise Backend Dockerfile
# Python 3.12, FastAPI, SQLAlchemy, Scikit-learn, FAISS, Uvicorn
# ==============================================================================

FROM python:3.12-slim

# Set performance and security environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install minimal OS dependencies:
# - curl: required for container healthcheck probe
# - libgomp1: required for FAISS OpenMP CPU parallel acceleration
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python production dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source code
COPY backend /app

# Copy historical incident data and evaluation metrics for ML pipelines
COPY data /data

# Expose internal port
EXPOSE 8000

# Container liveness health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Launch database setup/seeder and start production Uvicorn ASGI server
CMD ["sh", "-c", "python -m app.database.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

