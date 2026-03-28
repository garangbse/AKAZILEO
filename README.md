# 🎯 AKAZILEO

A full-stack web application for task management and freelance work. Built with **React + TypeScript**, **Flask**, **PostgreSQL**, and **Alembic** for database migrations.

---

## ⚡ Quick Start (One Command!)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/AKAZILEO.git
cd AKAZILEO
```

### Step 2: Run Setup (First Time Only)
```bash
chmod +x setup.sh run.sh
./setup.sh
```

This checks and installs all dependencies:
- ✅ Python 3
- ✅ Node.js & npm
- ✅ PostgreSQL
- ✅ Python virtual environment
- ✅ Python packages (Flask, SQLAlchemy, etc.)
- ✅ npm packages (React, TypeScript, etc.)

### Step 3: Launch Everything
```bash
./run.sh
```

That's it! The script starts:
- 🗄️ PostgreSQL database
- 🔧 Flask backend API (`http://127.0.0.1:5001`)
- ⚛️ React frontend (`http://localhost:5173`)

**Access the app:** Open your browser to → **`http://localhost:5173`**

**To stop:** Press `Ctrl+C` in the terminal

---

## 📋 System Requirements

Before you begin, make sure you have:
- **Node.js** v16+ (check: `node --version`)
- **npm** (usually comes with Node.js, check: `npm --version`)
- **Python 3.8+** (check: `python3 --version`)
- **PostgreSQL 10+** (check: `psql --version`)

### ✅ Don't Have These?

**macOS (with Homebrew):**
```bash
brew install node python postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install nodejs npm python3 python3-pip postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
- Download Node.js from https://nodejs.org/
- Download Python from https://www.python.org/
- Download PostgreSQL from https://www.postgresql.org/download/windows/
- Ensure PostgreSQL service is running

---

## 🎬 Detailed Setup Steps

### For New Users (Complete Walkthrough)

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/AKAZILEO.git
cd AKAZILEO
```

#### 2️⃣ Check Prerequisites
Make sure all required software is installed:
```bash
node --version        # Should be v16+
npm --version         # Should be v7+
python3 --version     # Should be 3.8+
psql --version        # Should be 10+
```

#### 3️⃣ Start PostgreSQL (if not already running)
```bash
# macOS/Linux
sudo systemctl start postgresql

# or macOS with Homebrew
brew services start postgresql

# Windows - PostgreSQL usually auto-starts
```

#### 4️⃣ First-Time Setup
```bash
chmod +x setup.sh run.sh
./setup.sh
```

This will:
- Create a Python virtual environment
- Install Python dependencies from `Backend/requirements.txt`
- Install npm dependencies from `Frontend/package.json`

#### 5️⃣ Launch the Application
```bash
./run.sh
```

You should see output like:
```
🚀 Starting AKAZILEO...
✓ PostgreSQL is running
✓ Backend started (PID: 12345)
   Running on: http://127.0.0.1:5001
✓ Frontend started (PID: 12346)
   Running on: http://localhost:5173
✓ AKAZILEO is running!
```

✨ **Open `http://localhost:5173` in your browser**

#### 6️⃣ Stop the Application
Press `Ctrl+C` in the terminal to gracefully stop all services.

---

## 🔄 Running Individual Services

If you need to run services separately:

### Backend Only
```bash
cd Backend
source venv/bin/activate              # Activate virtual environment
pip install -r requirements.txt       # Install dependencies (first time)
python3 app.py
```
Runs on: `http://127.0.0.1:5001`

### Frontend Only
```bash
cd Frontend
npm install                           # Install dependencies (first time)
npm run dev
```
Runs on: `http://localhost:5173`

### Database Only
```bash
# Start
sudo systemctl start postgresql

# Check status
sudo systemctl status postgresql

# Stop
sudo systemctl stop postgresql
```

---

## ❓ Troubleshooting

### Issue: "PostgreSQL is not running"
**Solution:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### Issue: "Port 5001 already in use"
**Solution:** Find and stop the process using that port:
```bash
lsof -i :5001              # Find the process
kill -9 <PID>             # Replace <PID> with the process ID
```

### Issue: "npm: command not found"
**Solution:** Node.js/npm not installed. Install it:
- `brew install node` (macOS)
- `sudo apt-get install nodejs npm` (Ubuntu/Debian)
- Visit https://nodejs.org/ (Windows)

### Issue: "python3: command not found"
**Solution:** Python not installed:
- `brew install python3` (macOS)
- `sudo apt-get install python3 python3-pip` (Ubuntu/Debian)
- Visit https://www.python.org/downloads/ (Windows)

### Issue: "Dependencies installation fails"
**Solution:** Clear and reinstall:
```bash
# Python
cd Backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# npm
cd Frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: "CORS errors in browser console"
**Solution:** Make sure backend is running at `http://127.0.0.1:5001` and frontend at `http://localhost:5173`. The `run.sh` script handles CORS configuration automatically.

---

## 🗄️ Database Migrations

Database migrations are managed using **Alembic**. To apply new migrations:

```bash
cd Backend
source venv/bin/activate
alembic upgrade head
```

To create a new migration after modifying models:

```bash
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

---

## 📁 Project Structure

```
AKAZILEO/
├── setup.sh            # Setup script (checks prerequisites)
├── run.sh              # Launch script (starts everything)
├── START_PROJECT.md    # Additional project launch docs
├── README.md           # This file
├── Backend/            # Flask REST API
│   ├── app.py          # Main Flask application
│   ├── models.py       # SQLAlchemy models
│   ├── requirements.txt # Python dependencies
│   ├── migrations/     # Alembic migrations
│   ├── venv/           # Python virtual environment (auto-created)
│   └── Procfile        # Deployment config
├── Frontend/           # React + TypeScript application
│   ├── src/            # React source code
│   ├── package.json    # npm dependencies
│   ├── vite.config.ts  # Vite configuration
│   └── node_modules/   # npm packages (auto-installed)
└── Procfile            # Root deployment config
```

---

## 🔐 Configuration

### Backend Environment Variables

Default configuration for local development:
- **Database URL:** `postgresql://postgres:akazileo@localhost:5432/akazileo`
- **Port:** `5001`
- **CORS Origins:** Automatically includes `localhost:5173`, `localhost:5174`, `localhost:5175`

To customize, set environment variables before running `./run.sh`:
```bash
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
export PORT=5002
export FLASK_ENV=production
./run.sh
```

### Frontend API Connection

The frontend automatically connects to the backend at:
```
http://127.0.0.1:5001
```

Configure in [Frontend/src/services/api.ts](Frontend/src/services/api.ts) if needed.

---

## 🌐 Application URLs

Once running with `./run.sh`:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://127.0.0.1:5001`
- **Database:** `localhost:5432` (PostgreSQL)

---

## 📚 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Radix UI
- **Backend:** Flask (Python), SQLAlchemy ORM, PostgreSQL
- **Database:** PostgreSQL 10+ with Alembic migrations
- **Authentication:** JWT (JSON Web Tokens)
- **APIs:** RESTful API with Flask

---

## 🎯 Next Steps

1. **Register a new account** at `http://localhost:5173`
2. **Explore the dashboard** to see all features
3. **Create tasks** and browse the marketplace
4. **Build your portfolio** with your projects

---

## Useful Commands

```bash
# Start everything
./run.sh

# Start setup (only needed on first clone)
./setup.sh

# Stop all services
Ctrl+C

# Restart database
sudo systemctl restart postgresql

# Check database connection
psql -U postgres -h localhost -d akazileo

# View PostgreSQL logs
tail -f /var/log/postgresql/postgresql.log

# Clean Python cache
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete
```

---

## ✅ Verification Checklist

After launching with `./run.sh`, verify:
- [ ] Frontend loads without errors at `http://localhost:5173`
- [ ] Backend API is responding at `http://127.0.0.1:5001`
- [ ] PostgreSQL is running on port 5432
- [ ] No CORS errors in browser console
- [ ] You can register and login
- [ ] You can navigate between pages