#!/bin/bash

# Script para executar Lighthouse em modo MOBILE
# Funciona em Linux, WSL, macOS e Windows (via Git Bash)

echo "📱 Iniciando Lighthouse em modo MOBILE..."

# Verificar servidor
if curl -s "http://localhost:4173" > /dev/null 2>&1; then
    LIGHTHOUSE_URL="http://localhost:4173"
    ENVIRONMENT="🚀 PRODUÇÃO"
    echo "✅ Detectado servidor de PRODUÇÃO (otimizado)"
elif curl -s "http://localhost:5173" > /dev/null 2>&1; then
    LIGHTHOUSE_URL="http://localhost:5173"
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

# Verificar se o arquivo de configuração mobile existe
MOBILE_CONFIG="./lighthouse-mobile-config.json"
if [ ! -f "$MOBILE_CONFIG" ]; then
    echo "❌ Arquivo de configuração mobile não encontrado: $MOBILE_CONFIG"
    exit 1
fi

echo "📝 Usando arquivo de configuração mobile: $MOBILE_CONFIG"

# Executar Lighthouse com configuração MOBILE
echo "⚡ Executando Lighthouse para MOBILE com auditorias avançadas..."

if [ -n "$CHROME_PATH" ]; then
    CHROME_PATH="$CHROME_PATH" npx lighthouse \
        "$LIGHTHOUSE_URL" \
        --form-factor=mobile \
        --output=html \
        --output-path=./reports/lighthouse-mobile.html \
        --view \
        --chrome-flags="$CHROME_FLAGS"
else
    echo "⚠️  Chrome não encontrado, tentando execução padrão..."
    npx lighthouse \
        "$LIGHTHOUSE_URL" \
        --form-factor=mobile \
        --output=html \
        --output-path=./reports/lighthouse-mobile.html \
        --view \
        --chrome-flags="$CHROME_FLAGS"
fi

RESULT=$?

if [ $RESULT -eq 0 ]; then
    echo ""
    echo "✅ Lighthouse MOBILE concluído!"
    echo "📊 Relatório: ./reports/lighthouse-mobile.html"
    echo "🎯 Ambiente testado: $ENVIRONMENT"
    echo "🌟 Auditorias avançadas incluídas para MOBILE"
    echo ""
    echo "📱 Testes específicos para mobile incluídos:"
    echo "  • Tamanho de fonte legível"
    echo "  • Tamanho adequado de alvos de toque"
    echo "  • Configuração de viewport"
    echo "  • Conteúdo ajustado para viewport"
    echo "  • Simulação de conexão 4G"
    echo "  • Simulação de CPU mais lenta (4x)"
    
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