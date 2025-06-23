#!/bin/bash

# Script portável para executar Lighthouse
# Funciona em Linux, WSL, macOS e Windows (via Git Bash)

echo "🚀 Iniciando Lighthouse..."

# 🎯 Detecção inteligente do melhor ambiente
if [ -z "$LIGHTHOUSE_URL" ]; then
    # Verificar produção primeiro (melhor performance)
    if curl -s "http://localhost:4173" > /dev/null 2>&1; then
        LIGHTHOUSE_URL="http://localhost:4173"
        ENVIRONMENT="🚀 PRODUÇÃO"
        echo "✅ Detectado servidor de PRODUÇÃO (otimizado)"
    # Fallback para desenvolvimento
    elif curl -s "http://localhost:5173" > /dev/null 2>&1; then
        LIGHTHOUSE_URL="http://localhost:5173"
        ENVIRONMENT="⚠️  DESENVOLVIMENTO"
        echo "⚠️  Detectado servidor de DESENVOLVIMENTO (não otimizado)"
        echo "💡 Para melhores resultados: yarn build:production && yarn preview"
    else
        echo "❌ Nenhum servidor encontrado!"
        echo "🚀 Iniciando build e servidor de produção automaticamente..."
        
        # 🏗️ AUTOMATIZAÇÃO: Build + Preview automático
        echo "📦 Fazendo build de produção..."
        if yarn build:production; then
            echo "✅ Build concluído com sucesso!"
            
            echo "🚀 Iniciando servidor de preview..."
            # Matar qualquer processo preview existente
            pkill -f "vite preview" 2>/dev/null || true
            
            # Iniciar preview em background
            yarn preview > /dev/null 2>&1 &
            PREVIEW_PID=$!
            
            # Aguardar servidor iniciar
            echo "⏳ Aguardando servidor iniciar..."
            for i in {1..10}; do
                sleep 2
                if curl -s "http://localhost:4173" > /dev/null 2>&1; then
                    LIGHTHOUSE_URL="http://localhost:4173"
                    ENVIRONMENT="🚀 PRODUÇÃO (AUTO-INICIADO)"
                    echo "✅ Servidor de produção iniciado automaticamente!"
                    break
                fi
                if [ $i -eq 10 ]; then
                    echo "❌ Timeout: Servidor não conseguiu iniciar"
                    kill $PREVIEW_PID 2>/dev/null || true
                    exit 1
                fi
            done
        else
            echo "❌ Erro no build de produção"
            exit 1
        fi
    fi
else
    # URL manual especificada
    if ! curl -s "$LIGHTHOUSE_URL" > /dev/null 2>&1; then
        echo "❌ Servidor não está rodando em $LIGHTHOUSE_URL"
        exit 1
    fi
    if [[ "$LIGHTHOUSE_URL" == *":4173"* ]]; then
        ENVIRONMENT="🚀 PRODUÇÃO"
    elif [[ "$LIGHTHOUSE_URL" == *":5173"* ]]; then
        ENVIRONMENT="⚠️  DESENVOLVIMENTO"
    else
        ENVIRONMENT="🌐 CUSTOMIZADO"
    fi
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

# Executar Lighthouse
echo "⚡ Executando Lighthouse com Web Vitals..."
echo "⏳ Aguardando todas as requests terminarem (indefinidamente)..."

if [ -n "$CHROME_PATH" ]; then
    CHROME_PATH="$CHROME_PATH" npx lighthouse \
        "$LIGHTHOUSE_URL" \
        --config-path=./lighthouse-mobile-config.json \
        --output=html \
        --output-path=./reports/lighthouse-mobile-full.html \
        --view \
        --chrome-flags="$CHROME_FLAGS" \
        --wait-for-load
else
    echo "⚠️  Chrome não encontrado, tentando execução padrão..."
    npx lighthouse \
        "$LIGHTHOUSE_URL" \
        --config-path=./lighthouse-mobile-config.json \
        --output=html \
        --output-path=./reports/lighthouse-mobile-full.html \
        --view \
        --chrome-flags="$CHROME_FLAGS" \
        --wait-for-load
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Lighthouse concluído!"
    echo "📊 Relatório: ./reports/lighthouse-mobile-full.html"
    echo "🎯 Ambiente testado: $ENVIRONMENT"
    echo "🌟 Todas as métricas Web Vitals incluídas!"
    echo "⏱️  Aguardou todas as requests terminarem (sem timeout)"
    
    # 🧹 LIMPEZA AUTOMÁTICA das pastas temporárias do Lighthouse
    echo ""
    echo "🧹 Limpando pastas temporárias do Lighthouse..."
    
    # Contar pastas antes da limpeza
    TEMP_FOLDERS=$(find . -maxdepth 1 -name "*lighthouse.*" -type d 2>/dev/null | wc -l)
    
    if [ "$TEMP_FOLDERS" -gt 0 ]; then
        echo "🗑️  Encontradas $TEMP_FOLDERS pastas temporárias"
        
        # Remover todas as pastas temporárias do lighthouse
        find . -maxdepth 1 -name "*lighthouse.*" -type d -exec rm -rf {} + 2>/dev/null
        
        # Verificar se foram removidas
        REMAINING_FOLDERS=$(find . -maxdepth 1 -name "*lighthouse.*" -type d 2>/dev/null | wc -l)
        
        if [ "$REMAINING_FOLDERS" -eq 0 ]; then
            echo "✅ $TEMP_FOLDERS pastas temporárias removidas com sucesso!"
        else
            echo "⚠️  Algumas pastas não puderam ser removidas (podem estar em uso)"
        fi
    else
        echo "✅ Nenhuma pasta temporária encontrada"
    fi
    
    echo ""
    if [[ "$ENVIRONMENT" == *"DESENVOLVIMENTO"* ]]; then
        echo "⚡ DICA: Para resultados de produção otimizados:"
        echo "   1. yarn build:production"
        echo "   2. yarn preview"
        echo "   3. yarn lighthouse"
    fi
    
    # 🛑 Parar servidor se foi auto-iniciado
    if [[ "$ENVIRONMENT" == *"AUTO-INICIADO"* ]] && [ ! -z "$PREVIEW_PID" ]; then
        echo ""
        echo "🛑 Parando servidor auto-iniciado..."
        kill $PREVIEW_PID 2>/dev/null || true
        pkill -f "vite preview" 2>/dev/null || true
        echo "✅ Servidor parado - audit completo!"
    fi
else
    echo "❌ Erro no Lighthouse"
    
    # 🧹 LIMPEZA mesmo em caso de erro
    echo "🧹 Limpando pastas temporárias após erro..."
    TEMP_FOLDERS=$(find . -maxdepth 1 -name "*lighthouse.*" -type d 2>/dev/null | wc -l)
    if [ "$TEMP_FOLDERS" -gt 0 ]; then
        find . -maxdepth 1 -name "*lighthouse.*" -type d -exec rm -rf {} + 2>/dev/null
        echo "🗑️  $TEMP_FOLDERS pastas temporárias limpas"
    fi
    
    # 🛑 Parar servidor se foi auto-iniciado
    if [[ "$ENVIRONMENT" == *"AUTO-INICIADO"* ]] && [ ! -z "$PREVIEW_PID" ]; then
        echo "🛑 Parando servidor auto-iniciado..."
        kill $PREVIEW_PID 2>/dev/null || true
        pkill -f "vite preview" 2>/dev/null || true
        echo "✅ Servidor parado"
    fi
    
    exit 1
fi 