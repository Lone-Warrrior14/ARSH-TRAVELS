@echo off
echo ==================================================
echo Starting ARSH ENTERPRISES POS Billing System...
echo ==================================================

:: Ensure we are in the correct directory
cd /d %~dp0

echo.
echo Checking if build exists...
if not exist .next (
    echo [ERROR] The application has not been built yet!
    echo Please run 'install.bat' first to prepare the system.
    pause
    exit /b 1
)

echo.
echo Starting servers...
:: Start both backend and frontend via concurrently
start "ARSH POS Server" cmd /c "npm run start:all"

echo.
echo Waiting for servers to boot...
timeout /t 4 /nobreak > NUL

echo.
echo Opening Browser to POS...
start http://localhost:3000

echo.
echo System is running in the background.
echo To stop the POS, close the black command prompt window labeled 'ARSH POS Server'.
exit
