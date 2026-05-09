@echo off
echo ==========================================
echo    GenAI Lab - Starting Backend Server
echo ==========================================
cd /d "%~dp0backend"
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Starting FastAPI server on http://localhost:8000
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
