@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "SRC_DIR=%ROOT_DIR%src"
set "OUT_DIR=%ROOT_DIR%out"

if exist "%OUT_DIR%" rmdir /S /Q "%OUT_DIR%"
mkdir "%OUT_DIR%"

javac -d "%OUT_DIR%" "%SRC_DIR%\com\todo\auth\*.java"
if errorlevel 1 (
  echo Falha ao compilar o backend Java.
  exit /b 1
)

java -cp "%OUT_DIR%" com.todo.auth.AuthServer
