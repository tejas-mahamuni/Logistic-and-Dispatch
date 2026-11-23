@echo off
title ShipXpress - Logistics & Dispatch Server
color 0A
echo ==============================================================================
echo     SHIPXPRESS - LOGISTICS & DISPATCH MANAGEMENT SYSTEM (UNIFIED V2)
echo ==============================================================================

rem Load local secrets from .env if present
if exist .env (
    for /f "usebackq tokens=1* delims==" %%a in (".env") do (
        set "%%a=%%b"
    )
)

echo [INFO] Database   : Supabase PostgreSQL Cloud
echo [INFO] Local Port : http://localhost:8081
echo [INFO] Swagger UI : http://localhost:8081/swagger-ui.html
echo ==============================================================================
echo Starting unified server (React Frontend + Spring Boot Backend)...
echo.

java -jar "v2\backend\target\Logistic-and-Dispatch-0.0.1-SNAPSHOT.jar"

if errorlevel 1 (
    echo.
    echo [ERROR] Application stopped unexpectedly with error code %errorlevel%.
    pause
)
