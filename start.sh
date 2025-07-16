#!/bin/bash

# Render startup script for Sleep Debt Predictor
echo "🚀 Starting Sleep Debt Predictor deployment..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Download required model files
echo "📥 Downloading model files..."
python download_model.py

# Start the FastAPI server
echo "🌐 Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
