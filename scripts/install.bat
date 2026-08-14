@echo off
title Dreamy Codex Toolkit Easy Installer
echo ==================================================
echo ✨ Dreamy Codex Toolkit - Easy 1-Click Installer
echo ==================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed on your system!
    echo Please download and install Node.js ^(v20 or newer^) from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo 🚀 Running installation into current directory...
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install --target . --preset dreamy-project

echo.
echo ✅ Installation finished! Running diagnostic check...
echo.
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main doctor --target .
echo.
echo ==================================================
echo 🎉 Setup Complete! Press any key to exit.
echo ==================================================
pause
