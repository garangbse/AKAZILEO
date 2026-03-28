#!/bin/bash

# AKAZILEO - Full Stack Application Launcher
# This script starts the PostgreSQL database, Flask backend, and React frontend

set -e

echo "🚀 Starting AKAZILEO..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Store script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Error handler
error_exit() {
    echo -e "${RED}✗ Error: $1${NC}"
    exit 1
}

# Check if PostgreSQL is running
echo -e "${BLUE}📦 Checking PostgreSQL...${NC}"
if pg_isready -h localhost -p 5432 &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL may not be running. Attempting to start...${NC}"
    # Try to start without sudo (may require user to have passwordless sudo or service auto-start)
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql 2>/dev/null || echo -e "${YELLOW}⚠ Could not auto-start PostgreSQL${NC}"
        sleep 1
    fi
    # Verify again
    if ! pg_isready -h localhost -p 5432 &> /dev/null; then
        echo -e "${YELLOW}⚠ Warning: PostgreSQL may not be accessible${NC}"
    else
        echo -e "${GREEN}✓ PostgreSQL started${NC}"
    fi
fi

# Start Backend
echo ""
echo -e "${BLUE}🔧 Starting Flask Backend...${NC}"
cd "$SCRIPT_DIR/Backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠ Virtual environment not found. Creating...${NC}"
    python3 -m venv venv || error_exit "Failed to create virtual environment"
fi

# Activate virtual environment
source venv/bin/activate || error_exit "Failed to activate virtual environment"

# Check if requirements are installed
if ! python3 -c "import flask, flask_cors, sqlalchemy" 2>/dev/null; then
    echo -e "${YELLOW}⚠ Installing Python dependencies...${NC}"
    pip install --upgrade pip > /dev/null
    pip install -r requirements.txt || error_exit "Failed to install Python dependencies"
fi

# Run Flask app
python3 app.py &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo "   Running on: http://127.0.0.1:5001"

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo ""
echo -e "${BLUE}⚛️  Starting React Frontend...${NC}"
cd "$SCRIPT_DIR/Frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ Node modules not found. Installing dependencies...${NC}"
    npm install || error_exit "Failed to install npm dependencies"
fi

# Start the dev server
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "   Running on: http://localhost:5173"

echo ""
echo "================================"
echo -e "${GREEN}✓ AKAZILEO is running!${NC}"
echo "================================"
echo ""
echo -e "${YELLOW}📍 Access the application:${NC}"
echo "   Frontend: http://localhost:5173"
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
