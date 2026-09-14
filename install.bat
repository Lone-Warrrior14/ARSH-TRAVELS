@echo off
echo ==================================================
echo ARSH ENTERPRISES POS Billing System - Installer
echo ==================================================

echo Checking prerequisites...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ from python.org and check 'Add to PATH'.
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 18+ from nodejs.org.
    pause
    exit /b 1
)

echo.
echo Installing Python Backend Dependencies...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

echo.
echo Installing Frontend Dependencies...
call npm install

echo.
echo Generating Database Client...
call npx prisma generate

echo.
echo Building Application for Production (this may take a few minutes)...
call npm run build

echo.
echo ==================================================
echo INSTALLATION COMPLETE!
echo You can now safely close this window and double-click 'start.bat' to run the POS.
echo ==================================================
pause
