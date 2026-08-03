@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "GIT=git"
where git >nul 2>&1 || set "GIT=%LOCALAPPDATA%\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe"
if not exist "%GIT%" if not "%GIT%"=="git" (
  for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do set "GIT=%%D\resources\app\git\cmd\git.exe"
)

echo ================================================
echo   Publication du site de la Guinguette
echo ================================================
echo.

echo [1/4] Recuperation des modifications distantes...
"%GIT%" pull --rebase origin main
if errorlevel 1 goto erreur

echo.
echo [2/4] Fichiers modifies :
"%GIT%" status --short

echo.
echo [3/4] Enregistrement...
"%GIT%" add -A
"%GIT%" reset -q -- publier.bat 2>nul
"%GIT%" commit -m "Menu des modules, onglet Visibilite, page ingest.html"
if errorlevel 1 echo    (rien de nouveau a enregistrer)

echo.
echo [4/4] Envoi vers GitHub...
"%GIT%" push origin main
if errorlevel 1 goto erreur

echo.
echo ================================================
echo   TERMINE. Le site se met a jour dans 1 a 2 min.
echo   https://laguinguettedudispensaire.fr/admin.html
echo ================================================
echo.
pause
exit /b 0

:erreur
echo.
echo ================================================
echo   ECHEC - lis le message ci-dessus et envoie-le
echo   a Claude. Rien n'a ete casse.
echo ================================================
echo.
pause
exit /b 1
