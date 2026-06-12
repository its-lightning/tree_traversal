# ─────────────────────────────────────────────
# Stage 1 – Build the Vite / React frontend
# ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build          # outputs to frontend/dist


# ─────────────────────────────────────────────
# Stage 2 – Python backend + built assets
# ─────────────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app/backend

# Install Python deps
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source (excludes venv / __pycache__ via .dockerignore)
COPY backend/ ./

# Drop the Vite build into backend/static so Flask can serve it
COPY --from=frontend-builder /app/frontend/dist ./static

# Single exposed port
EXPOSE 8080

# Gunicorn runs the Flask `app` object from app.py on port 8080
CMD ["gunicorn", "--workers", "2", "--bind", "0.0.0.0:8080", "app:app"]
