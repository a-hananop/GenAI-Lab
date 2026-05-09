@echo off
echo ==========================================
echo    GenAI Lab - Starting Frontend Server
echo ==========================================
cd /d "%~dp0frontend"
echo Installing npm dependencies...
call npm install
echo.
echo Starting Vite dev server on http://localhost:5173
call npm run dev
pause
