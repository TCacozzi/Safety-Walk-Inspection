@echo off
REM Script para fazer push dos commits no Windows
REM Clique 2x neste arquivo para fazer push automaticamente

cd /d "%~dp0"

echo =====================================
echo Fazendo push dos commits...
echo =====================================

git push -u origin claude/english-learning-app-wp6z0x

if errorlevel 1 (
    echo.
    echo ERRO ao fazer push!
    echo Se pediu autenticacao, use um Personal Access Token de https://github.com/settings/tokens
    pause
) else (
    echo.
    echo SUCESSO! Commits enviados para o GitHub!
    echo.
    echo Acesse: https://github.com/TCacozzi/Safety-Walk-Inspection/tree/claude/english-learning-app-wp6z0x
    pause
)
