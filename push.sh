#!/bin/bash
# Script para fazer push dos commits no Mac/Linux
# Execute com: bash push.sh

echo "====================================="
echo "Fazendo push dos commits..."
echo "====================================="

cd "$(dirname "$0")"

git push -u origin claude/english-learning-app-wp6z0x

if [ $? -eq 0 ]; then
    echo ""
    echo "SUCESSO! Commits enviados para o GitHub!"
    echo ""
    echo "Acesse: https://github.com/TCacozzi/Safety-Walk-Inspection/tree/claude/english-learning-app-wp6z0x"
else
    echo ""
    echo "ERRO ao fazer push!"
    echo "Se pediu autenticacao, use um Personal Access Token de https://github.com/settings/tokens"
fi
