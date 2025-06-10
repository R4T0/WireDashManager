
#!/bin/bash

# Script de inicialização para o backend WireDash

echo "🚀 Iniciando WireDash Backend..."

# Aguardar PostgreSQL estar disponível
if [ -n "$POSTGRES_HOST" ] || [ -n "$DATABASE_URL" ]; then
    echo "⏳ Aguardando PostgreSQL..."
    
    POSTGRES_HOST=${POSTGRES_HOST:-postgres}
    POSTGRES_PORT=${POSTGRES_PORT:-5432}
    
    for i in $(seq 1 30); do
        if nc -z "$POSTGRES_HOST" "$POSTGRES_PORT" 2>/dev/null; then
            echo "✅ PostgreSQL disponível"
            break
        fi
        echo "⏳ Aguardando PostgreSQL... ($i/30)"
        sleep 2
    done
fi

# Executar migrações do Prisma se necessário
if [ -f "prisma/schema.prisma" ]; then
    echo "🔄 Executando migrações do Prisma..."
    bun prisma migrate deploy || echo "⚠️ Migrações falharam, continuando..."
fi

# Verificar se variáveis de ambiente essenciais estão definidas
if [ -z "$JWT_SECRET" ]; then
    echo "⚠️ JWT_SECRET não definido, usando valor padrão (NÃO RECOMENDADO PARA PRODUÇÃO)"
    export JWT_SECRET="default-jwt-secret-change-in-production"
fi

echo "✅ Backend pronto para iniciar"
echo "🌐 Porta: ${PORT:-3000}"

# Iniciar aplicação
exec "$@"
