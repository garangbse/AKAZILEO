#!/bin/bash

# AKAZILEO - Full Stack Application Launcher
# This script starts the PostgreSQL database, Flask backend, and React frontend

set -e

echo " Starting AKAZILEO..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "${BLUE} Checking PostgreSQL...${NC}"
if sudo systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✓ PostgreSQL is already running${NC}"
else
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
    echo -e "${GREEN}✓ PostgreSQL started${NC}"
fi

# Start Backend
echo ""
echo -e "${BLUE}  Starting Flask Backend...${NC}"
cd "$(dirname "$0")/Backend"
source venv/bin/activate
python3 app.py &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo "   Running on: http://127.0.0.1:5001"

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo ""
echo -e "${BLUE} Starting React Frontend...${NC}"
cd "$(dirname "$0")/Frontend"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "   Running on: http://localhost:5175"

echo ""
echo "================================"
echo -e "${GREEN} AKAZILEO is running!${NC}"
echo "================================"
echo ""
echo -e "${YELLOW} Access the application:${NC}"
echo "   Frontend: http://localhost:5175"
echo "   Backend:  http://127.0.0.1:5001"
echo "   Database: localhost:5432"
echo ""
echo -e "${YELLOW} To stop the application:${NC}"
echo "   Press Ctrl+C to stop both services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✓ Services stopped${NC}"
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Wait for both processes
wait
