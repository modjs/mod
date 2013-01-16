@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\mod" %*
) ELSE (
  node "%~dp0\mod" %*
)