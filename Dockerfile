FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for MT5
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY bot_backend.py .
COPY strategy.py .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/health')"

# Run the application
CMD ["gunicorn", "--worker-class=geventwebsocket.gunicorn.workers.GeventWebSocketWorker", "--bind", "0.0.0.0:5000", "bot_backend:app"]
