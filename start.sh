#!/bin/bash

echo "🚀 Wiz AI Launcher"

case "$1" in
    backend)
        echo "Starting backend..."
        cd ~/wiz-ai/backend && node server.js
        ;;
    frontend)
        echo "Starting frontend..."
        cd ~/wiz-ai/frontend && npm run dev
        ;;
    all)
        echo "Starting backend..."
        cd ~/wiz-ai/backend && node server.js &
        sleep 3
        echo "Starting frontend..."
        cd ~/wiz-ai/frontend && npm run dev
        ;;
    stop)
        echo "Stopping services..."
        pkill -f "node server.js"
        pkill -f "next"
        ;;
    *)
        echo "Usage: ./start.sh [backend|frontend|all|stop]"
        ;;
esac
