if not "%minimized%"=="" goto :minimized
set minimized=true
@echo off
cd "C:\Users\USER\Desktop\recorded_stream"
start /min cmd start /min cmd /C "node server.js"
goto :EOF
:minimized