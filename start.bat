@echo off
REM Atlas Genesis - Quick Start Script for Windows
REM This script starts both the frontend and backend development servers

setlocal enabledelayedexpansion

echo.
echo ================================================
echo 🌍 Atlas Genesis - Regenerative Carbon Credit Marketplace
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js version:
node --version

echo ✓ npm version:
npm --version
echo.

REM Check and install frontend dependencies
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
    echo ✓ Frontend dependencies installed
) else (
    echo ✓ Frontend dependencies already installed
)

REM Check and install backend dependencies
if not exist "scaffold-mvp\backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd scaffold-mvp\backend
    call npm install
    cd ..\..
    echo ✓ Backend dependencies installed
) else (
    echo ✓ Backend dependencies already installed
)

echo.
echo Starting development servers...
echo.

REM Start frontend in new window
echo 🚀 Starting frontend on http://localhost:8080
start "Atlas Genesis - Frontend" npm run dev

REM Wait a moment for frontend to start
timeout /t 3 /nobreak

REM Start backend in new window
echo 🚀 Starting backend on http://localhost:3001
set "PORT=3001"
cd scaffold-mvp\backend
start "Atlas Genesis - Backend" npm run dev
cd ..\..

REM Wait for backend to start
timeout /t 3 /nobreak

echo.
echo ========================================
echo ✓ Atlas Genesis is Ready!
echo ========================================
echo.
echo Frontend:  http://localhost:8080
echo Backend:   http://localhost:3001
echo API Docs:  http://localhost:3001/api
echo.
echo Available Commands:
echo   • Test API:  curl http://localhost:3001/health
echo   • Kill all:  taskkill /F /IM node.exe
echo.
echo Documentation:
echo   • DEPLOYMENT_GUIDE.md      - Deployment instructions
echo   • API_DOCUMENTATION.md     - Complete API reference
echo   • TESTING_GUIDE.md         - Testing procedures
echo.
echo Press any key to open frontend in browser...
pause

REM Open browser
start http://localhost:8080

echo.
echo Both servers are running. Close the command windows to stop them.
pause
