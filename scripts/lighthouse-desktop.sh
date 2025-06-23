#!/bin/bash

# Script para executar Lighthouse em modo DESKTOP
# Funciona em Linux, WSL, macOS e Windows (via Git Bash)

echo "🖥️  Iniciando Lighthouse em modo DESKTOP..."

# Verificar servidor
if curl -s "http://localhost:4174" > /dev/null 2>&1; then
    LIGHTHOUSE_URL="http://localhost:4174"
    ENVIRONMENT="🚀 PRODUÇÃO"
    echo "✅ Detectado servidor de PRODUÇÃO (otimizado)"
elif curl -s "http://localhost:5174" > /dev/null 2>&1; then
    LIGHTHOUSE_URL="http://localhost:5174"
    ENVIRONMENT="⚠️  DESENVOLVIMENTO"
    echo "⚠️  Detectado servidor de DESENVOLVIMENTO (não otimizado)"
    echo "💡 Para melhores resultados: yarn build:production && yarn preview"
else
    echo "❌ Nenhum servidor encontrado!"
    echo "🚀 Execute: yarn preview"
    exit 1
fi

echo "🎯 Testando: $LIGHTHOUSE_URL ($ENVIRONMENT)"

# Detectar Chrome automaticamente
CHROME_PATHS=(
    "/usr/bin/google-chrome"
    "/usr/bin/google-chrome-stable"
    "/usr/bin/chromium-browser"
    "/usr/bin/chromium"
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
    "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
)

CHROME_PATH=""
for path in "${CHROME_PATHS[@]}"; do
    if [ -f "$path" ]; then
        CHROME_PATH="$path"
        echo "🌐 Chrome encontrado: $CHROME_PATH"
        break
    fi
done

# Configurar flags baseado no ambiente
CHROME_FLAGS="--no-sandbox --disable-dev-shm-usage"

# Detectar WSL ou CI
if [[ -n "$WSL_DISTRO_NAME" ]] || [[ -n "$CI" ]] || [[ -f "/proc/version" && $(cat /proc/version) == *"microsoft"* ]]; then
    echo "📍 Ambiente: WSL/CI detectado"
    CHROME_FLAGS="$CHROME_FLAGS --headless"
fi

# Criar pasta reports se não existir
mkdir -p ./reports

# Verificar se o arquivo de configuração desktop existe
DESKTOP_CONFIG="./lighthouse-desktop-config.json"
if [ ! -f "$DESKTOP_CONFIG" ]; then
    echo "❌ Arquivo de configuração desktop não encontrado: $DESKTOP_CONFIG"
    exit 1
fi

echo "📝 Usando arquivo de configuração desktop: $DESKTOP_CONFIG"

# Executar Lighthouse com configuração DESKTOP
echo "⚡ Executando Lighthouse para DESKTOP com auditorias avançadas..."

if [ -n "$CHROME_PATH" ]; then
    CHROME_PATH="$CHROME_PATH" npx lighthouse \
        "$LIGHTHOUSE_URL" \
        --preset=desktop \
        --output=html \
        --output-path=./reports/lighthouse-desktop.html \
        --view \
        --chrome-flags="$CHROME_FLAGS"
else
    echo "⚠️  Chrome não encontrado, tentando execução padrão..."
    npx lighthouse \
        "$LIGHTHOUSE_URL" \
        --preset=desktop \
        --output=html \
        --output-path=./reports/lighthouse-desktop.html \
        --view \
        --chrome-flags="$CHROME_FLAGS"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Lighthouse DESKTOP concluído!"
    echo "📊 Relatório: ./reports/lighthouse-desktop.html"
    echo "🎯 Ambiente testado: $ENVIRONMENT"
    echo "🌟 Auditorias avançadas incluídas para DESKTOP"
    
    # Limpeza de pastas temporárias
    echo ""
    echo "🧹 Limpando pastas temporárias do Lighthouse..."
    find . -maxdepth 1 -name "*lighthouse.*" -type d -exec rm -rf {} + 2>/dev/null
    echo "✅ Limpeza concluída"
else
    echo "❌ Erro no Lighthouse"
    # Limpeza em caso de erro
    find . -maxdepth 1 -name "*lighthouse.*" -type d -exec rm -rf {} + 2>/dev/null
    exit 1
fi 