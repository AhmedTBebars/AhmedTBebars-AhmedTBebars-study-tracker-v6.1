@echo off
set /p PORT=Enter the port number to free: 
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT%') do (
    echo Killing process on port %PORT% with PID %%a
    taskkill /PID %%a /F
)
pause
