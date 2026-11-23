@echo off
title ShipXpress - Public HTTPS Tunnel (Ngrok)
color 0B
echo ==============================================================================
echo     SHIPXPRESS - PUBLIC HTTPS TUNNEL FOR VIVA & DEMO PRESENTATION
echo ==============================================================================
echo [INFO] Forwarding public HTTPS traffic to local port 8081...
echo.
echo Use the HTTPS URL displayed below (e.g., https://xxxx.ngrok-free.app)
echo to access the complete application from any phone, laptop, or faculty browser!
echo ==============================================================================
echo.

ngrok http 8081

if errorlevel 1 (
    echo.
    echo [ERROR] Ngrok encountered an error or was closed.
    pause
)
