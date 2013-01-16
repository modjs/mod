@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe --debug-brk"  "%~dp0\mod" %*
) ELSE (
  node --debug-brk "%~dp0\mod" %*
)