@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "GIT=git"
where git >nul 2>&1 || set "GIT=%LOCALAPPDATA%\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe"
if not exist "%GIT%" if not "%GIT%"=="git" (
  for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do set "GIT=%%D\resources\app\git\cmd\git.exe"
)
echo [0/4] Nettoyage des sauvegardes de travail...
del /q menu.html.bak menu.html.bak2 index.html.bak 2>nul
echo [1/4] Recuperation des modifications distantes...
"%GIT%" pull --rebase origin main
if errorlevel 1 goto erreur
echo [2/4] Enregistrement de la carte...
"%GIT%" add menu.html index.html llms.txt
"%GIT%" commit -m "Carte : mise a jour depuis le catalogue Flatpay (petit-dejeuner, douceurs, nouveaux produits, prix)"
if errorlevel 1 echo    (rien de nouveau a enregistrer)
echo [3/4] Envoi vers GitHub...
"%GIT%" push origin main
if errorlevel 1 goto erreur
echo [4/4] TERMINE. Le site se met a jour dans 1 a 2 min.
"%GIT%" log --oneline -1
timeout /t 20
exit /b 0
:erreur
echo ECHEC - rien n a ete casse.
timeout /t 60
exit /b 1
