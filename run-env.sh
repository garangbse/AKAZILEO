#!/bin/bash

# AKAZILEO - Run with Isolated Environment
# This script activates the isolated Python environment and runs the app

ENV_DIR="./.venv"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if environment exists
if [ ! -d "$ENV_DIR" ]; then
    echo -e "${RED}✗ Isolated environment not found at ${ENV_DIR}${NC}"
    echo "Run setup-env.sh first:"
    echo -e "  ${GREEN}./setup-env.sh${NC}"
    exit 1
fi

echo "🚀 Starting AKAZILEO with isolated environment..."
echo "================================"

# Activate the isolated environment
echo -e "${BLUE}Activating isolated environment...${NC}"
source "$ENV_DIR/bin/activate"

# Start Backend
echo -e "${BLUE}Starting Backend (from isolated environment)...${NC}"
cd Backend
python3 app.py &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo "   Running on: http://127.0.0.1:5001"
cd ..

sleep 2

# Start Frontend
echo -e "${BLUE}Starting Frontend...${NC}"
cd Frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "   Running on: http://localhost:5173"
cd ..

echo ""
echo "================================"
echo -e "${GREEN}✓ AKAZILEO is running!${NC}"
echo ""
echo "Open your browser to: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo "================================"

# Handle graceful shutdown
trap "echo -e '\n${YELLOW}Stopping services...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; deactivate; exit 0" INT TERM

# Keep the script running
wait
