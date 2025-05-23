
#!/bin/bash

# Script para iniciar WireDash em modo self-hosted

echo "🚀 Iniciando WireDash Self-Hosted"
echo "================================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instale o Docker primeiro."
    echo "📖 Visite: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Instale o Docker Compose primeiro."
    echo "📖 Visite: https://docs.docker.com/compose/install/"
    exit 1
fi

# Criar diretórios necessários
mkdir -p logs

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.local.yml down

# Construir e iniciar serviços
echo "🔨 Construindo e iniciando serviços..."
docker-compose -f docker-compose.local.yml up --build -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos serviços
echo "📊 Verificando status dos serviços..."
docker-compose -f docker-compose.local.yml ps

# Verificar se a aplicação está respondendo
echo "🔍 Verificando se a aplicação está respondendo..."
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ WireDash está rodando!"
    echo ""
    echo "🌐 Acesse a aplicação em: http://localhost:8080"
    echo "🗄️  PostgreSQL disponível em: localhost:5432"
    echo "   Usuário: postgres"
    echo "   Senha: postgres"
    echo "   Database: wireguard_manager"
    echo ""
    echo "📋 Comandos úteis:"
    echo "   Parar: docker-compose -f docker-compose.local.yml down"
    echo "   Logs: docker-compose -f docker-compose.local.yml logs -f"
    echo "   Reiniciar: docker-compose -f docker-compose.local.yml restart"
else
    echo "❌ A aplicação não está respondendo. Verificando logs..."
    docker-compose -f docker-compose.local.yml logs
fi
