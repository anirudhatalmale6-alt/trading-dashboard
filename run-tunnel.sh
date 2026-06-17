#!/bin/bash
while true; do
    HOME=/tmp cloudflared tunnel --no-autoupdate --config /tmp/cf-empty.yml --url http://127.0.0.1:9050 2>&1
    echo "Tunnel died, restarting in 5 seconds..."
    sleep 5
done
