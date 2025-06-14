
#!/bin/bash

# =============================================================================
# WireDash Frontend Docker Entrypoint
# Script de inicialização para o container do frontend (Nginx)
# =============================================================================

set -euo pipefail

echo "🚀 Iniciando WireDash Frontend..."
echo "================================="

# Função para logs estruturados
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Verificar se estamos no modo self-hosted
if [ "${VITE_SELF_HOSTED:-}" = "true" ]; then
    log "✅ Modo Self-Hosted ativado"
else
    log "⚠️ Aviso: VITE_SELF_HOSTED não está definido como 'true'"
fi

# Mostrar configurações
log "📋 Configurações do Frontend:"
log "   VITE_SELF_HOSTED: ${VITE_SELF_HOSTED:-false}"
log "   VITE_USE_LOCAL_SUPABASE: ${VITE_USE_LOCAL_SUPABASE:-false}"
log "   VITE_API_URL: ${VITE_API_URL:-not-set}"

# Aguardar PostgreSQL estar disponível (se configurado)
if [ -n "${POSTGRES_HOST:-}" ] || [ -n "${DATABASE_URL:-}" ]; then
    log "⏳ Aguardando PostgreSQL..."
    
    POSTGRES_HOST=${POSTGRES_HOST:-postgres}
    POSTGRES_PORT=${POSTGRES_PORT:-5432}
    
    # Aguardar PostgreSQL por até 30 segundos
    for i in $(seq 1 30); do
        if nc -z "$POSTGRES_HOST" "$POSTGRES_PORT" 2>/dev/null; then
            log "✅ PostgreSQL disponível"
            break
        fi
        log "🔄 Aguardando PostgreSQL... ($i/30)"
        sleep 1
    done
fi

# Aguardar Backend estar disponível (se configurado)
if [ -n "${VITE_API_URL:-}" ] && [ "${VITE_SELF_HOSTED:-}" = "true" ]; then
    log "⏳ Aguardando Backend..."
    
    # Extrair host e porta da URL da API
    API_HOST="wiredash-backend"
    API_PORT="3000"
    
    # Aguardar backend por até 60 segundos
    for i in $(seq 1 60); do
        if nc -z "$API_HOST" "$API_PORT" 2>/dev/null; then
            log "✅ Backend disponível"
            break
        fi
        log "🔄 Aguardando Backend... ($i/60)"
        sleep 1
    done
fi

# Verificar se os arquivos da aplicação existem
log "🔍 Verificando arquivos da aplicação..."
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    log "❌ Erro: Arquivos da aplicação não encontrados em /usr/share/nginx/html/"
    log "📁 Listando conteúdo do diretório:"
    ls -la /usr/share/nginx/html/ || true
    exit 1
fi

log "✅ Arquivos da aplicação encontrados"

# Verificar tamanho dos arquivos principais
if [ -f "/usr/share/nginx/html/index.html" ]; then
    local index_size=$(stat -c%s "/usr/share/nginx/html/index.html" 2>/dev/null || echo "0")
    log "📊 Tamanho do index.html: $index_size bytes"
fi

# Verificar configuração do Nginx
log "🔍 Verificando configuração do Nginx..."
if [ ! -f "/etc/nginx/nginx.conf" ]; then
    log "❌ Erro: Configuração do Nginx não encontrada"
    exit 1
fi

log "✅ Configuração do Nginx encontrada"

# Testar configuração do Nginx
log "🔧 Testando configuração do Nginx..."
if nginx -t 2>/dev/null; then
    log "✅ Configuração do Nginx válida"
else
    log "❌ Erro na configuração do Nginx"
    nginx -t
    exit 1
fi

# Criar diretórios de log se não existirem
mkdir -p /var/log/nginx
log "📋 Diretórios de log criados"

# Mostrar informações do sistema
log "🖥️ Informações do sistema:"
log "   Usuário: $(whoami)"
log "   Diretório: $(pwd)"
log "   Nginx versão: $(nginx -v 2>&1)"

log "✅ Frontend pronto para iniciar"
log "🌐 Iniciando servidor web na porta 80..."
log "================================="

# Iniciar Nginx
exec "$@"
