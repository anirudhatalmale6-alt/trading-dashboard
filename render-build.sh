#!/usr/bin/env bash
set -e

# Install backend dependencies
cd backend
pip install -r render_requirements.txt

# Build frontend
cd ../frontend
npm install
npm run build

# Copy built frontend to backend static dir
cp -r dist ../backend/static

echo "Build complete!"
