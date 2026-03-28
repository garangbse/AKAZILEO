# 🎯 AKAZILEO

A full-stack web application for task management and freelance work. Built with **React + TypeScript**, **Flask**, **PostgreSQL**, and **Alembic** for database migrations.

**Easiest Setup:** Everything installs into an isolated environment in 3 steps.

---

## ⚡ Quick Start (3 Steps!)

### Prerequisites
Make sure you have:
- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **PostgreSQL 10+** - [Download](https://www.postgresql.org/download/)

Verify:
```bash
python3 --version
node --version
npm --version
psql --version
```

### Installation

**Step 1: Clone & Prepare**
```bash
git clone https://github.com/yourusername/AKAZILEO.git
cd AKAZILEO
chmod +x setup-env.sh run-env.sh
```

**Step 2: Setup (Install All Dependencies)**
```bash
./setup-env.sh
```

This creates `./.venv` and installs:
- Backend dependencies from `Backend/requirements.txt` 
- Frontend dependencies from `Frontend/package.json`

**Step 3: Run the App**
```bash
./run-env.sh
```

### Access
Open browser: **`http://localhost:5173`**  
Stop: Press **`Ctrl+C`**

---

## 🛠️ Installation by OS

### macOS
```bash
brew install python3 node postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
1. Download [Python](https://www.python.org/) - Check "Add Python to PATH"
2. Download [Node.js](https://nodejs.org/)
3. Download [PostgreSQL](https://www.postgresql.org/download/windows/)
4. PostgreSQL starts automatically

---

## 📦 What Gets Installed

### Backend (Backend/requirements.txt)
Everything installs to `./.venv/`:
- **Flask** - Web framework
- **SQLAlchemy** - Database ORM
- **Flask-CORS** - API requests
- **psycopg2-binary** - PostgreSQL
- **PyJWT** - Tokens
- Plus 9 more packages

### Frontend (Frontend/package.json)
Everything installs to `Frontend/node_modules/`:
- **React 18** - UI
- **TypeScript** - Types
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- Plus 20+ packages

---

## 🔧 What Each Script Does

### `setup-env.sh` (Run Once)
1. Checks Python 3
2. Creates `./.venv/`
3. Installs from `Backend/requirements.txt`
4. Installs from `Frontend/package.json`

### `run-env.sh` (Run Every Time)
1. Activates `./.venv/`
2. Starts Flask backend (`http://127.0.0.1:5001`)
3. Starts React frontend (`http://localhost:5173`)
4. Listens for `Ctrl+C` to stop

---

## 🔄 Run Services Individually

### Activate Environment
```bash
source ./.venv/bin/activate
```

### Backend Only
```bash
source ./.venv/bin/activate
cd Backend
python3 app.py
```

### Frontend Only
```bash
cd Frontend
npm run dev
```

### Deactivate
```bash
deactivate
```

---

## 🐛 Troubleshooting

### "python3: command not found"
```bash
brew install python3          # macOS
sudo apt-get install python3  # Ubuntu
```

### "npm: command not found"
```bash
brew install node             # macOS
sudo apt-get install nodejs npm # Ubuntu
```

### "psql: command not found"
```bash
brew install postgresql       # macOS
sudo apt-get install postgresql # Ubuntu
```

### "Port 5001 already in use"
```bash
lsof -i :5001
kill -9 <PID>
./run-env.sh
```

### Setup fails
```bash
rm -rf ./.venv
./setup-env.sh
```

### Frontend not connecting
Check both are running:
- Backend: `http://127.0.0.1:5001`
- Frontend: `http://localhost:5173`

Check `Frontend/src/services/api.ts` for API URL.

---

## 📝 Environment Variables (Optional)

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/akazileo"
export PORT=5001
export FLASK_ENV=development
./run-env.sh
```

---

## 📁 Project Structure

```
AKAZILEO/
├── setup-env.sh              # Setup (one-time)
├── run-env.sh                # Run app
├── .venv/                    # Isolated environment (auto-created)
├── Backend/
│   ├── app.py
│   ├── models.py
│   ├── requirements.txt       # ⬅️ Backend packages
│   └── migrations/
├── Frontend/
│   ├── src/
│   ├── package.json           # ⬅️ Frontend packages
│   ├── tsconfig.json
│   └── node_modules/
└── README.md
```

---

## 📚 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Flask, SQLAlchemy, PostgreSQL
- **Auth:** JWT (JSON Web Tokens)

---

## ✅ Verification Checklist

After running `./run-env.sh`:
- [ ] Backend on `http://127.0.0.1:5001`
- [ ] Frontend on `http://localhost:5173`
- [ ] Can register & login
- [ ] Can navigate all pages
- [ ] No console errors

---

## 🎯 Next Steps

1. Register a new account
2. Explore the dashboard
3. Create tasks
4. Build your portfolio

---

**Happy coding! 🚀**