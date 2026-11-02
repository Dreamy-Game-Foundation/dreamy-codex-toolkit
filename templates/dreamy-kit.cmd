@echo off
setlocal
if not defined DREAMY_NODE_BINARY set "DREAMY_NODE_BINARY=node"
"%DREAMY_NODE_BINARY%" -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)" >nul 2>nul
if errorlevel 1 (
  echo Dreamy: Node.js ^>=20 is required. Install from https://nodejs.org/, add node to PATH, or set DREAMY_NODE_BINARY to its executable. >&2
  exit /b 2
)
"%DREAMY_NODE_BINARY%" "%~dp0..\.dreamy-codex\cli-runtime\src\project-entry.mjs" %*
exit /b %errorlevel%
