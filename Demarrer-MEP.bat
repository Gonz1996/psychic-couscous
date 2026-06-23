@echo off
title MEP Resource Command Center
cd /d "C:\mep-rcc"
echo ============================================================
echo   MEP Resource Command Center
echo ============================================================
echo.
echo [1/2] Demarrage de la base de donnees PostgreSQL...
call npm run db:start
echo.
echo [2/2] Demarrage de l'application web...
echo.
echo   Ouvrez votre navigateur sur :  http://localhost:3000
echo   Laissez CETTE FENETRE OUVERTE tant que vous utilisez l'app.
echo   Pour arreter : fermez cette fenetre.
echo.
echo ============================================================
call npm run dev
