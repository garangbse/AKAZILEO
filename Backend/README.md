# AKAZILEO Backend - Setup & Management Guide

This guide covers how to manage the PostgreSQL database, Flask API server, and the complete backend launch sequence.

---

## 📋 Table of Contents

1. [PostgreSQL Server Management](#postgresql-server-management)
2. [Flask App Management](#flask-app-management)
3. [Backend Launch Sequence](#backend-launch-sequence)
4. [How Backend Launch Works](#how-backend-launch-works)
5. [Full System Architecture](#full-system-architecture)
6. [Quick Commands Reference](#quick-commands-reference)
7. [Troubleshooting](#troubleshooting)

---

## 🗄️ PostgreSQL Server Management

PostgreSQL is the database server running on port **5432**. It stores all application data.

### Start PostgreSQL

```bash
# Start the PostgreSQL service
sudo systemctl start postgresql

# Verify it's running (should show "active (running)")
sudo systemctl status postgresql

# Test the connection
psql -U postgres -d akazileo -c "SELECT 1;"
```

### Stop PostgreSQL

```bash
# Stop the PostgreSQL service
sudo systemctl stop postgresql

# Verify it stopped
sudo systemctl status postgresql
```

### Check PostgreSQL Status

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if port 5432 is in use
lsof -i :5432

# Alternative check
netstat -an | grep 5432
```

### PostgreSQL Connection Details

```
Host:     localhost
Port:     5432
Database: akazileo
User:     postgres
Password: akazileo
URL:      postgresql://postgres:akazileo@localhost:5432/akazileo
```

---

## 🚀 Flask App Management

Flask API runs on port **5000** and serves all backend API endpoints.

### Start Flask (Foreground Mode)

**Best for development** - see all logs in real-time

```bash
cd /home/garangbse/AKAZILEO/Backend
source venv/bin/activate
python3 app.py
```

**Output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

Press `Ctrl+C` to stop.

### Start Flask (Background Mode)

**Best for production** - runs without blocking terminal

```bash
cd /home/garangbse/AKAZILEO/Backend && source venv/bin/activate && python3 app.py 2>&1 &
```

**Output:**
```
[1] 12345
```

The number `[1] 12345` is the process ID (PID). Save this if you need to stop it later.

### Stop Flask

#### From Foreground (running in terminal)
```bash
# Press Ctrl+C
```

#### From Background
```bash
# Using the process ID from startup
kill 12345

# Or search and kill by name
pkill -f "python3 app.py"

# Force kill if needed
kill -9 12345
```

### Check Flask Status

```bash
# Check if Flask is running on port 5000
lsof -i :5000

# View all Python processes
ps aux | grep "app.py"

# See if process exists
pgrep -f "python3 app.py"
```

### Flask API Server Details

```
Host:      127.0.0.1 (or localhost)
Port:      5000
Protocol:  HTTP
Debug:     On
Base URL:  http://127.0.0.1:5000
```

---

## 🔄 Backend Launch Sequence

### Complete Startup Process

```
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND STARTUP FLOW                       │
└─────────────────────────────────────────────────────────────┘

STEP 1: Verify PostgreSQL is Running
├─ Command: sudo systemctl status postgresql
├─ Check: Port 5432 listening
└─ Verify: psql -U postgres -d akazileo -c "SELECT 1;"

STEP 2: Navigate to Backend Directory
├─ Command: cd /home/garangbse/AKAZILEO/Backend
└─ Confirm: You see models.py, app.py, requirements.txt

STEP 3: Activate Virtual Environment
├─ Command: source venv/bin/activate
├─ Result: (venv) prefix appears in terminal
└─ Purpose: Use project-specific Python packages

STEP 4: Start Flask Server
├─ Command: python3 app.py
├─ Process:
│  ├─ Loads models.py
│  ├─ Connects to PostgreSQL at localhost:5432
│  ├─ Creates all database tables
│  ├─ Initializes Flask app
│  ├─ Registers 100+ API routes
│  └─ Starts listening on port 5000
│
└─ Success Indicator: "Running on http://127.0.0.1:5000"

STEP 5: Server Ready
├─ API accessible at: http://127.0.0.1:5000
├─ Database connected: akazileo database
└─ Listening for: HTTP requests from frontend
```

---

## 💾 How Backend Launch Works

### Step 1: models.py Loads (Automatic on import)

```python
# models.py lines 7-15

import os
from sqlalchemy import create_engine

# Get database URL from environment or use default
db_url = os.getenv('DATABASE_URL', 
    'postgresql://postgres:akazileo@localhost:5432/akazileo')

# Create connection engine
engine = create_engine(db_url, echo=True)

# Define base class for models
Base = declarative_base()

# Define 11 model classes (User, Task, Portfolio, etc.)
# ... model definitions ...

# Create all tables in database
Base.metadata.create_all(engine)
```

**Result:** ✅ Connected to PostgreSQL, all tables created

---

### Step 2: app.py Loads

```python
# app.py lines 1-24

from flask import Flask, request, jsonify
from models import engine, User, Task, ...  # Import models & connection

# Set database URL for this session
os.environ.setdefault('DATABASE_URL', 
    'postgresql://postgres:akazileo@localhost:5432/akazileo')

# Create Flask application
app = Flask(__name__)

# Configure CORS for frontend (port 5173/5174)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# Set secret key for JWT tokens
app.config['SECRET_KEY'] = 'OiJIUzI1NiIsInR5cCI6IkpXVCJ9'

# Create database session factory
Session = sessionmaker(bind=engine)
```

**Result:** ✅ Flask app created, CORS enabled for frontend

---

### Step 3: Routes Registered

```python
# app.py lines 68+

# User routes
@app.route("/register", methods=["POST"])
@app.route("/login", methods=["POST"])
@app.route("/me", methods=["GET"])
@app.route("/users/search", methods=["GET"])

# Task routes
@app.route("/tasks", methods=["GET", "POST"])
@app.route("/tasks/<int:task_id>", methods=["GET", "PATCH", "DELETE"])
@app.route("/tasks/<int:task_id>/apply", methods=["POST"])

# Portfolio routes
@app.route("/portfolio", methods=["POST"])
@app.route("/portfolio/<int:user_id>", methods=["GET"])

# ... 100+ total routes
```

**Result:** ✅ All API endpoints registered and ready

---

### Step 4: Server Starts

```python
# app.py line 1031

if __name__ == "__main__":
    app.run(debug=True)  # Starts Flask on http://127.0.0.1:5000
```

**Output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

**Result:** ✅ Server listening on port 5000, ready for requests

---

## 🏗️ Full System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                 AKAZILEO FULL SYSTEM                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Browser (User)  Frontend App    Backend API    PostgreSQL   │
│  ===============  =============  ============   ===========  │
│                                                               │
│  localhost:5174 ←→ Vite Dev   ←→ Flask API  ←→ localhost    │
│  (React App)     (Hot Reload)   (HTTP Routes)  :5432         │
│                                                (Database)    │
│                                                               │
│  User Interface   UI Framework   API Endpoints  Data Storage │
│  - Register      - React 18     - /register   - users table  │
│  - Login         - TypeScript   - /login      - tasks table  │
│  - Create Task   - Vite Build   - /tasks      - portfolio    │
│  - Search Users  - Tailwind CSS - /portfolio  - posts        │
│  - View Profile  - Lucide Icons - /posts      - comments     │
│  - Add Portfolio - Hot Module   - /users      - likes        │
│                     Reload      - /search     - more tables  │
│                                                               │
│  ┌─ Communication Flow ─────────────────────────────────────┐
│  │                                                            │
│  │  1. User clicks "Login" in React UI (browser)             │
│  │  2. Frontend sends POST request to Flask API              │
│  │  3. Flask receives at /login endpoint                     │
│  │  4. Flask queries PostgreSQL database                     │
│  │  5. PostgreSQL returns user data                          │
│  │  6. Flask returns JWT token to frontend                   │
│  │  7. Frontend stores token and displays dashboard          │
│  │                                                            │
│  └────────────────────────────────────────────────────────────┘
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Commands Reference

### PostgreSQL Commands

| Task | Command |
|------|---------|
| Start PostgreSQL | `sudo systemctl start postgresql` |
| Stop PostgreSQL | `sudo systemctl stop postgresql` |
| Check status | `sudo systemctl status postgresql` |
| Test connection | `psql -U postgres -d akazileo -c "SELECT 1;"` |
| Check port usage | `lsof -i :5432` |

### Flask Commands

| Task | Command |
|------|---------|
| Start (foreground) | `cd Backend && source venv/bin/activate && python3 app.py` |
| Start (background) | `cd Backend && source venv/bin/activate && python3 app.py 2>&1 &` |
| Stop (foreground) | `Ctrl+C` |
| Stop (background) | `pkill -f "python3 app.py"` |
| Check status | `lsof -i :5000` |

### Combined Commands

| Task | Command |
|------|---------|
| Verify both running | `lsof -i :5432 && lsof -i :5000` |
| Kill both services | `sudo systemctl stop postgresql && pkill -f "python3 app.py"` |
| Check all ports | `netstat -an \| grep LISTEN` |

---

## 🔍 Troubleshooting

### PostgreSQL Won't Start

```bash
# Check if PostgreSQL service exists
sudo systemctl list-unit-files | grep postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# View PostgreSQL logs
sudo journalctl -u postgresql -n 50

# Test direct connection
sudo -u postgres psql -c "SELECT 1;"
```

### Flask Won't Start

```bash
# Check if port 5000 is already in use
lsof -i :5000

# Kill process using port 5000
kill <PID>

# Check for Python errors
python3 app.py  # Run in foreground to see errors

# Verify virtual environment activation
which python3  # Should show venv path
```

### Database Connection Failed

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test connection with correct credentials
psql -U postgres -d akazileo -h localhost -c "SELECT 1;"

# Check PostgreSQL listening on port 5432
sudo netstat -tuln | grep 5432

# Verify database exists
psql -U postgres -c "\l"  # List all databases
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill <PID>

# Kill all Flask processes
pkill -f "python3"  # Warning: kills all Python processes
pkill -f "app.py"   # Safer: kills only app.py processes
```

---

## 📝 Environment Configuration

### Database URL Environment Variable

```bash
# Used by app.py and models.py
export DATABASE_URL="postgresql://postgres:akazileo@localhost:5432/akazileo"

# For production (e.g., Render.com)
# Set in platform's environment variables
```

### Flask Configuration

```python
# app.py configuration
app.config['SECRET_KEY'] = 'OiJIUzI1NiIsInR5cCI6IkpXVCJ9'
app.config['DEBUG'] = True  # Development mode
```

### CORS Configuration

```python
# Frontend origins allowed to make requests
origins=["http://localhost:5173", "http://127.0.0.1:5173"]

# Note: Port 5173 may change to 5174 if port is occupied
```

---

## 🔐 Security Notes

### Never Commit Secrets

- Don't commit `.env` files with credentials
- Don't hardcode passwords (use environment variables)
- Use `.gitignore` to exclude sensitive files

### JWT Token Configuration

- Token expiry: 2 hours (set in `/login` endpoint)
- Secret key: Should be changed in production
- Algorithm: HS256

### Database Access

- Only accept connections from authenticated Flask
- Use environment variables for credentials
- Change default postgres password in production

---

## 📦 Dependencies

### Python Packages (Backend)

```
Flask==3.1.3
Flask-CORS==6.0.2
SQLAlchemy==2.0.46
psycopg2-binary==2.9.9
PyJWT==2.12.1
Werkzeug==3.1.6
```

### View all dependencies

```bash
cat requirements.txt
pip list
```

---

## 📞 Support

### Common API Endpoints

```
POST   /register           - User registration
POST   /login              - User login
GET    /me                 - Get current user
GET    /users/<id>         - Get user profile
GET    /users/search       - Search users
GET    /tasks              - Get all tasks
POST   /tasks              - Create task
GET    /portfolio/<user_id> - Get portfolio
POST   /portfolio          - Add portfolio item
GET    /posts              - Get posts
POST   /posts              - Create post
```

### Logs and Debugging

```bash
# View Flask logs in real-time
python3 app.py  # Run in foreground

# Check PostgreSQL query logs
sudo tail -f /var/log/postgresql/*.log
```

---

**Last Updated:** March 26, 2026  
**Version:** 1.0  
**Backend Framework:** Flask 3.1.3  
**Database:** PostgreSQL 12+  
**Python Version:** 3.8+
