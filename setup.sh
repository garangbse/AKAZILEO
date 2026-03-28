#!/bin/bash

# AKAZILEO - Setup Script
# This script checks and installs all prerequisites for running the project

echo "🔧 AKAZILEO Setup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track setup status
SETUP_FAILED=0

# 1. Check Python
echo -e "${BLUE}Checking Python...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    echo -e "${GREEN}✓ Python ${PYTHON_VERSION} found${NC}"
else
    echo -e "${RED}✗ Python3 not found${NC}"
    echo "  Install with: sudo apt-get install python3 python3-pip python3-venv"
    SETUP_FAILED=1
fi

# 2. Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ Node ${NODE_VERSION} and npm ${NPM_VERSION} found${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "  Install from: https://nodejs.org/ or run: sudo apt-get install nodejs npm"
    SETUP_FAILED=1
fi

# 3. Check PostgreSQL
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo -e "${GREEN}✓ ${PG_VERSION} found${NC}"
    
    if sudo systemctl is-active --quiet postgresql 2>/dev/null || pg_isready -h localhost -p 5432 &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL service is active${NC}"
    else
        echo -e "${YELLOW}⚠ PostgreSQL is installed but not running${NC}"
        echo "  Start with: sudo systemctl start postgresql"
    fi
else
    echo -e "${RED}✗ PostgreSQL not found${NC}"
    echo "  Install with: sudo apt-get install postgresql postgresql-contrib"
    SETUP_FAILED=1
fi

# 4. Check and setup Backend
echo ""
echo -e "${BLUE}Setting up Backend...${NC}"
cd "$(dirname "$0")/Backend"

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠ Creating Python virtual environment...${NC}"
    python3 -m venv venv || { echo -e "${RED}✗ Failed to create venv${NC}"; SETUP_FAILED=1; }
fi

if [ -d "venv" ]; then
    source venv/bin/activate
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install --upgrade pip > /dev/null 2>&1
    if pip install -r requirements.txt > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install backend dependencies${NC}"
        SETUP_FAILED=1
    fi
    deactivate
fi

# 5. Check and setup Frontend
echo ""
echo -e "${BLUE}Setting up Frontend...${NC}"
cd "$(dirname "$0")/Frontend"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    if npm install > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
        SETUP_FAILED=1
    fi
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

# Summary
echo ""
echo "================================"
if [ $SETUP_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "You can now run the project with:"
    echo "  ${GREEN}./run.sh${NC}"
else
    echo -e "${RED}✗ Setup incomplete. Please fix the issues above.${NC}"
fi
