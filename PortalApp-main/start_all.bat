@echo off
title PortalApp - Start All Services
echo ========================================================
echo Starting PortalApp (MySQL + AI Matcher + Backend + UI)...
echo ========================================================
echo.

echo 1. Launching MySQL Database (Port 3306)...
start "MySQL Server" /min "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --datadir="%~dp0mysql_data" --port=3306

timeout /t 3 /nobreak >nul

echo 2. Launching AI Matcher Service (Port 8000)...
start "AI Matcher Service" /d "%~dp0ai_matcher" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo 3. Launching Spring Boot Backend (Port 8080)...
start "Spring Boot Backend" /d "%~dp0backend" cmd /k "mvn spring-boot:run"

echo 4. Launching Vite Frontend (Port 5173)...
start "Vite Frontend UI" /d "%~dp0frontend" cmd /k "npm run dev"

echo.
echo ========================================================
echo All services launched successfully!
echo Open your browser at: http://localhost:5173
echo ========================================================
echo.
pause
