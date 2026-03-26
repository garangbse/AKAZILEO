# AKAZILEO

A full-stack web application for task management and freelance work. Built with React, TypeScript, Flask, PostgreSQL, and Alembic for database migrations.

## 🚀 Quick Start

### Prerequisites

Before running the application, ensure you have:
- **Node.js** (v16+) and npm installed
- **Python 3.8+** with pip
- **PostgreSQL** installed and running
- **Git** for version control

### Launch the Entire Application

The easiest way to start the entire application (database, backend, and frontend) is to run the launch script from the root directory:

```bash
cd /home/garangbse/AKAZILEO
./run.sh
```

This script will:
1. ✅ Start PostgreSQL (if not already running)
2. ✅ Start the Flask backend on `http://127.0.0.1:5001`
3. ✅ Start the React frontend on `http://localhost:5175`
4. ✅ Display connection information and how to stop services

The application will be ready to use at `http://localhost:5175`

**To stop everything:** Press `Ctrl+C` in the terminal

---

## 📋 Manual Setup (If Starting Services Separately)

### 1. Database Setup

PostgreSQL should be running. If not:

```bash
sudo systemctl start postgresql
```

Verify the database exists:
```bash
psql -U postgres -c "\l" | grep akazileo
```

### 2. Backend Setup

```bash
cd Backend
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

Backend will run on: `http://127.0.0.1:5001`

### 3. Frontend Setup

In a new terminal:

```bash
cd Frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:5175`

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
├── run.sh              # Launch script (starts everything)
├── README.md           # This file
├── Backend/            # Flask REST API
│   ├── app.py
│   ├── models.py
│   ├── requirements.txt
│   ├── migrations/     # Alembic migrations
│   └── venv/           # Python virtual environment
├── Frontend/           # React + TypeScript application
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── node_modules/
└── akazileo.sql        # Initial database schema (reference)
```

---

## 🔐 Configuration

### Backend Environment Variables

The Flask app connects to PostgreSQL using:
```
DATABASE_URL: postgresql://postgres:akazileo@localhost:5432/akazileo
```

Configure in [Backend/models.py](Backend/models.py) or set `DATABASE_URL` environment variable for production.

### Frontend API Connection

Frontend connects to the backend at:
```
API_BASE_URL: http://127.0.0.1:5001
```

Configure in [Frontend/src/services/api.ts](Frontend/src/services/api.ts)

---

## 🌐 Application URLs

Once running:
- **Frontend:** `http://localhost:5175`
- **Backend API:** `http://127.0.0.1:5001`
- **Database:** `localhost:5432`

---

## 📚 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Flask (Python), SQLAlchemy ORM, PostgreSQL
- **Database:** PostgreSQL with Alembic migrations
- **Authentication:** JWT tokens

---

## 🛑 Stopping the Application

If using the launch script (`run.sh`):
- Press `Ctrl+C` to stop all services

If services were started manually:
```bash
# Stop backend
pkill -f "python3 app.py"

# Stop frontend
pkill -f "npm run dev"

# Stop PostgreSQL (optional)
sudo systemctl stop postgresql
```

---

## ✅ Verification Checklist

After launching with `./run.sh`, verify:
- [ ] Frontend loads at `http://localhost:5175`
- [ ] Backend API is responding at `http://127.0.0.1:5001`
- [ ] PostgreSQL is running on port 5432
- [ ] You can register and login
- [ ] You can upload profile pictures and create posts

---

## 📞 Support

For issues:
1. Check that PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify Python virtual environment is activated in Backend
3. Check that npm dependencies are installed: `npm install` in Frontend
4. Review Flask logs in terminal for backend errors