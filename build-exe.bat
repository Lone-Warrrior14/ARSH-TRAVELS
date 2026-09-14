@echo off
echo Building ARSH POS Executable...
echo ================================

cd backend
call venv\Scripts\activate.bat
echo Installing PyInstaller...
pip install pyinstaller

echo Compiling...
pyinstaller --name "ARSH-POS" --onefile --add-data "../out:out" --hidden-import sqlmodel main.py

echo.
echo Build Complete!
echo You can find ARSH-POS.exe inside the backend/dist/ folder.
pause
