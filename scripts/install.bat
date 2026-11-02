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

node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)"
if errorlevel 1 (
    echo Node.js ^>=20 required. Upgrade from https://nodejs.org/
    exit /b 1
)
set "DREAMY_INSTALL_TARGET=%~1"
if not defined DREAMY_INSTALL_TARGET set "DREAMY_INSTALL_TARGET=."
set "DREAMY_INSTALL_PRESET=%~2"
if not defined DREAMY_INSTALL_PRESET set "DREAMY_INSTALL_PRESET=dreamy-project"
set "DREAMY_INSTALL_HOOKS=%~3"
if not defined DREAMY_INSTALL_HOOKS set "DREAMY_INSTALL_HOOKS=off"
echo Running installation...
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install --target "%DREAMY_INSTALL_TARGET%" --preset "%DREAMY_INSTALL_PRESET%" --hooks "%DREAMY_INSTALL_HOOKS%"
if errorlevel 1 exit /b %errorlevel%

echo.
echo ✅ Installation finished! Running diagnostic check...
echo.
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main doctor --target "%DREAMY_INSTALL_TARGET%"
if errorlevel 1 exit /b %errorlevel%
echo.
echo ==================================================
echo 🎉 Setup Complete! Press any key to exit.
echo ==================================================
pause
