#!/bin/bash

# AKAZILEO - Environment Setup Script
# This script sets up a completely isolated Python environment
# Everything installs to ./.venv (not the user's system)

echo "🔧 AKAZILEO Environment Setup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track setup status
SETUP_FAILED=0

# Environment directory
ENV_DIR="./.venv"

# Step 1: Check if Python 3 is available (ONLY requirement)
echo -e "${BLUE}Step 1: Checking Python 3...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found on system${NC}"
    echo "  This is the ONLY system requirement."
    echo "  Install with: sudo apt-get install python3 python3-pip python3-venv"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo -e "${GREEN}✓ Python ${PYTHON_VERSION} found${NC}"

# Step 2: Create isolated Python environment
echo ""
echo -e "${BLUE}Step 2: Creating isolated Python environment at ${ENV_DIR}...${NC}"
if [ -d "$ENV_DIR" ]; then
    echo -e "${YELLOW}⚠ Environment already exists, skipping creation${NC}"
else
    if python3 -m venv "$ENV_DIR"; then
        echo -e "${GREEN}✓ Virtual environment created${NC}"
    else
        echo -e "${RED}✗ Failed to create virtual environment${NC}"
        SETUP_FAILED=1
    fi
fi

# Step 3: Activate environment and install Backend dependencies
echo ""
echo -e "${BLUE}Step 3: Installing Backend dependencies in isolated environment...${NC}"
if [ -d "$ENV_DIR" ]; then
    # Activate virtual environment
    source "$ENV_DIR/bin/activate"
    
    # Upgrade pip
    echo -e "${YELLOW}Upgrading pip...${NC}"
    pip install --upgrade pip > /dev/null 2>&1
    
    # Install Backend requirements
    if [ -f "Backend/requirements.txt" ]; then
        echo -e "${YELLOW}Installing packages from Backend/requirements.txt...${NC}"
        if pip install -r Backend/requirements.txt > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Backend dependencies installed${NC}"
        else
            echo -e "${RED}✗ Failed to install backend dependencies${NC}"
            SETUP_FAILED=1
        fi
    fi
    
    # Deactivate environment
    deactivate
else
    echo -e "${RED}✗ Virtual environment not found${NC}"
    SETUP_FAILED=1
fi

# Step 4: Check for npm/Node (for Frontend)
echo ""
echo -e "${BLUE}Step 4: Checking Node.js for Frontend...${NC}"
if command -v npm &> /dev/null; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ Node ${NODE_VERSION} and npm ${NPM_VERSION} found${NC}"
    
    # Install frontend dependencies
    echo -e "${YELLOW}Installing Frontend dependencies...${NC}"
    cd Frontend
    if npm install > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
        SETUP_FAILED=1
    fi
    cd ..
else
    echo -e "${YELLOW}⚠ Node.js not found - Frontend setup skipped${NC}"
    echo "  (Optional) Install Node.js to run the frontend:"
    echo "  https://nodejs.org/ or run: sudo apt-get install nodejs npm"
fi

# Summary
echo ""
echo "================================"
if [ $SETUP_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Environment setup complete!${NC}"
    echo ""
    echo "All dependencies are installed in the isolated environment: ${ENV_DIR}"
    echo ""
    echo "To activate the environment, run:"
    echo -e "  ${GREEN}source ${ENV_DIR}/bin/activate${NC}"
    echo ""
    echo "Or use the provided run-env.sh script to run everything:"
    echo -e "  ${GREEN}./run-env.sh${NC}"
else
    echo -e "${RED}✗ Setup incomplete. Please fix the issues above.${NC}"
fi
