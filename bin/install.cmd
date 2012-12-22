@echo off

pushd "%~dp0"
rundll32 setupapi.dll,InstallHinfSection DefaultInstall 128 .\install.inf
popd

echo.
echo Successfully installed.
echo.
pause
