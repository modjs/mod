@echo off
wmic ENVIRONMENT create name="MOD_HOME",username="<system>",VariableValue="%~dp0"
wmic ENVIRONMENT where "name='PATH' and username='<system>'" set VariableValue="%PATH%;%%MOD_HOME%%\bin"

echo.
echo Successfully installed.
echo.
pause