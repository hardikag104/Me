@echo off
color 0A
title Pushing Me Life OS to GitHub
echo ========================================================
echo Pushing Life OS files to https://github.com/hardikag104/Me
echo ========================================================
cd /d D:\Me\life-tracker
echo Current folder: %CD%
echo.
git status
echo.
echo Running: git push -u origin main...
git push -u origin main
echo.
echo ========================================================
if %errorlevel% equ 0 (
    echo [SUCCESS] Successfully pushed to GitHub!
    echo Visit: https://github.com/hardikag104/Me
) else (
    echo [ERROR] Push encountered an issue. See details above.
)
echo ========================================================
pause
