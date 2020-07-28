@ECHO OFF
CD ..

IF EXIST temp.txt DEL /F temp.txt
TASKLIST /NH /FI "WINDOWTITLE EQ DSF Robot" > temp.txt
SET /P titlequery=<temp.txt
IF NOT "%titlequery%" == "INFO: No tasks are running which match the specified criteria." (GOTO HasInst)

:CreateServer
ECHO Intializing...
TITLE DSF Robot
NODE .
ECHO Program will now restart...
pause
CLS
GOTO CreateServer

:HasInst
ECHO There is already an instance of the bot running.
ECHO Please exit now if you wouldn't like to replace that instance.
ECHO.
PAUSE

TASKKILL /F /FI "WINDOWTITLE EQ DSF Robot"
PAUSE
CLS
GOTO CreateServer