#!/bin/bash
cd /var/lib/freelancer/projects/40519512/backend
export DATABASE_URL=sqlite:///./trading.db
export SECRET_KEY=tradedash-prod-key-2026
while true; do
    /var/lib/freelancer/projects/40519512/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 9050 2>&1
    echo "Server crashed, restarting in 5 seconds..."
    sleep 5
done
