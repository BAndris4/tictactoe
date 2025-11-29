@echo off
setlocal

cd /d "%~dp0"

start "Django backend" cmd /k "cd /d backend && venv\Scripts\python.exe init_db.py && venv\Scripts\python.exe manage.py migrate && venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000"

start "React frontend" cmd /k "cd /d frontend && npm run dev"

endlocal
