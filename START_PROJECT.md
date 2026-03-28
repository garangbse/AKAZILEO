# 🚀 AKAZILEO - One-Command Project Launcher

This project can now be launched entirely with a single command!

## Quick Start

### First Time Setup
```bash
./setup.sh
```
This checks for all dependencies (Python, Node.js, PostgreSQL) and installs them if needed.

### Launch Everything
```bash
./run.sh
```

This single command will:
- ✅ Check and start PostgreSQL database
- ✅ Start Flask backend API (http://127.0.0.1:5001)
- ✅ Start React frontend (http://localhost:5173)
- ✅ Auto-install dependencies if missing
- ✅ Handle graceful shutdown with Ctrl+C

## What Was Fixed

### CORS Issue
**Problem**: Frontend on port 5173 couldn't communicate with backend on port 5001
- Error: "Access to fetch... blocked by CORS policy"

**Solution**: Updated `Backend/app.py` to allow port 5173 in development mode

### Port Configuration
- Frontend runs on: **http://localhost:5173** (Vite default)
- Backend runs on: **http://127.0.0.1:5001** 
- Database runs on: **localhost:5432**

## Script Details

### `run.sh` - Main Launcher
- Starts all services automatically
- Creates virtual environment if missing
- Installs dependencies if missing
- Provides colored output for easy debugging
- Gracefully handles Ctrl+C shutdown

### `setup.sh` - Dependency Checker
- Verifies Python 3, Node.js, PostgreSQL installed
- Creates virtual environment
- Installs all Python and npm dependencies
- Safe to run multiple times

## Stopping the Project
Press **Ctrl+C** to cleanly stop all services

## Manual Commands (if needed)

### Backend only:
```bash
cd Backend
source venv/bin/activate
python3 app.py
```

### Frontend only:
```bash
cd Frontend
npm run dev
```

### Database:
```bash
sudo systemctl start postgresql   # Start
sudo systemctl stop postgresql    # Stop
```

## Environment Variables

You can customize behavior with environment variables:

```bash
# Change backend port
PORT=5002 ./run.sh

# Change dev CORS origins (production)
CORS_ORIGINS="https://yourfrontend.com" ./run.sh

# Change Flask environment
FLASK_ENV=production ./run.sh
```

## Troubleshooting

### "PostgreSQL not responsive"
```bash
sudo systemctl start postgresql
```

### "Port already in use"
```bash
lsof -i :5001    # Find process on port 5001
kill -9 <PID>    # Kill it
```

### "npm install fails"
```bash
cd Frontend
npm cache clean --force
npm install
```

### "Python dependencies fail"
```bash
cd Backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
