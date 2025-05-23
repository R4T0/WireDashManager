
#!/bin/bash

# Script de atualização para WireDash Self-Hosted

echo "🔄 Atualizando WireDash Self-Hosted..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.local.yml" ]; then
    echo "❌ Execute este script no diretório raiz do WireDash"
    exit 1
fi

# Fazer backup antes da atualização
echo "📦 Fazendo backup antes da atualização..."
./scripts/backup.sh

if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer backup. Atualização cancelada."
    exit 1
fi

# Parar serviços
echo "🛑 Parando serviços..."
docker-compose -f docker-compose.local.yml down

# Atualizar código
echo "📥 Atualizando código..."
git stash
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Erro ao atualizar código. Verifique conflitos."
    exit 1
fi

# Reconstruir imagens
echo "🔨 Reconstruindo imagens..."
docker-compose -f docker-compose.local.yml build --no-cache

# Iniciar serviços
echo "🚀 Iniciando serviços atualizados..."
docker-compose -f docker-compose.local.yml up -d

# Aguardar e verificar
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 15

if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Atualização concluída com sucesso!"
    echo "🌐 WireDash disponível em: http://localhost:8080"
else
    echo "❌ Aplicação não está respondendo após atualização"
    echo "📋 Verificando logs..."
    docker-compose -f docker-compose.local.yml logs --tail=20
fi
