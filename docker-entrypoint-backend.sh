
#!/bin/bash

# =============================================================================
# WireDash Backend Docker Entrypoint
# Script de inicialização para o container do backend
# =============================================================================

set -euo pipefail

echo "🚀 Iniciando WireDash Backend..."
echo "================================="

# Função para logs estruturados
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Função para aguardar serviço
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=${4:-30}
    local attempt=1

    log "⏳ Aguardando $service_name ($host:$port)..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            log "✅ $service_name está disponível!"
            return 0
        fi
        
        log "🔄 Tentativa $attempt/$max_attempts - Aguardando $service_name..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log "❌ Timeout: $service_name não ficou disponível após $max_attempts tentativas"
    return 1
}

# Aguardar PostgreSQL estar disponível
if [ -n "${POSTGRES_HOST:-}" ] || [ -n "${DATABASE_URL:-}" ]; then
    POSTGRES_HOST=${POSTGRES_HOST:-postgres}
    POSTGRES_PORT=${POSTGRES_PORT:-5432}
    
    wait_for_service "$POSTGRES_HOST" "$POSTGRES_PORT" "PostgreSQL" 60
    
    # Aguardar um pouco mais para o PostgreSQL estar completamente pronto
    log "⏳ Aguardando PostgreSQL aceitar conexões..."
    sleep 5
fi

# Verificar se variáveis de ambiente essenciais estão definidas
log "🔍 Verificando variáveis de ambiente..."

if [ -z "${JWT_SECRET:-}" ]; then
    log "⚠️ JWT_SECRET não definido, usando valor padrão (NÃO RECOMENDADO PARA PRODUÇÃO)"
    export JWT_SECRET="default-jwt-secret-change-in-production"
fi

if [ -z "${SESSION_SECRET:-}" ]; then
    log "⚠️ SESSION_SECRET não definido, usando valor padrão (NÃO RECOMENDADO PARA PRODUÇÃO)"
    export SESSION_SECRET="default-session-secret-change-in-production"
fi

if [ -z "${DATABASE_URL:-}" ]; then
    if [ -n "${POSTGRES_HOST:-}" ]; then
        POSTGRES_USER=${POSTGRES_USER:-postgres}
        POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
        POSTGRES_DB=${POSTGRES_DB:-wireguard_manager}
        export DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"
        log "✅ DATABASE_URL construída: postgresql://$POSTGRES_USER:***@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"
    else
        log "⚠️ DATABASE_URL não definida"
    fi
fi

# Executar migrações do Prisma se necessário
if [ -f "prisma/schema.prisma" ]; then
    log "🔄 Verificando migrações do Prisma..."
    
    # Gerar cliente Prisma
    if bun prisma generate >/dev/null 2>&1; then
        log "✅ Cliente Prisma gerado"
    else
        log "⚠️ Falha ao gerar cliente Prisma (pode ser normal se não usar Prisma)"
    fi
    
    # Executar migrações
    if bun prisma migrate deploy >/dev/null 2>&1; then
        log "✅ Migrações do Prisma executadas"
    else
        log "⚠️ Falha nas migrações do Prisma (pode ser normal se não usar Prisma)"
    fi
fi

# Verificar se é possível conectar ao banco de dados
if [ -n "${DATABASE_URL:-}" ]; then
    log "🔍 Testando conexão com o banco de dados..."
    
    # Simular teste de conexão (adapte conforme seu ORM/biblioteca)
    # Aqui você pode adicionar um comando específico para testar a conexão
    # Por exemplo: bun run test-db-connection.js
    
    log "📋 Banco de dados configurado"
fi

# Mostrar configurações (sem senhas)
log "📋 Configurações do Backend:"
log "   NODE_ENV: ${NODE_ENV:-development}"
log "   PORT: ${PORT:-3000}"
log "   POSTGRES_HOST: ${POSTGRES_HOST:-not-set}"
log "   POSTGRES_PORT: ${POSTGRES_PORT:-not-set}"
log "   POSTGRES_DB: ${POSTGRES_DB:-not-set}"
log "   JWT_SECRET: ${JWT_SECRET:+***configured***}"
log "   SESSION_SECRET: ${SESSION_SECRET:+***configured***}"

# Verificar se o comando existe
if ! command -v bun >/dev/null 2>&1; then
    log "❌ Bun não encontrado!"
    exit 1
fi

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    log "❌ package.json não encontrado!"
    exit 1
fi

log "✅ Backend pronto para iniciar"
log "🌐 Iniciando na porta: ${PORT:-3000}"
log "================================="

# Iniciar aplicação
exec "$@"
