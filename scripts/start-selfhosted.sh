
#!/bin/bash

# Script para iniciar WireDash em modo self-hosted

echo "🏠 Iniciando WireDash em modo SELF-HOSTED"
echo "========================================"

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

# Verificar se a imagem local existe
if ! docker image inspect wiredash-local:latest >/dev/null 2>&1; then
    echo "❌ Imagem local não encontrada. Construindo..."
    ./scripts/build-local.sh
fi

# Criar diretórios necessários
mkdir -p logs

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.selfhosted.yml down

# Construir e iniciar serviços
echo "🚀 Iniciando serviços..."
docker-compose -f docker-compose.selfhosted.yml up -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos serviços
echo "📊 Verificando status dos serviços..."
docker-compose -f docker-compose.selfhosted.yml ps

echo "✅ WireDash está rodando em modo SELF-HOSTED!"
echo ""
echo "🌐 Acesse a aplicação em: http://localhost:8080"
echo "🗄️  PostgreSQL disponível em: localhost:5432"
echo "   Usuário: postgres"
echo "   Senha: postgres"
echo "   Database: wireguard_manager"
echo ""
echo "📋 Comandos úteis:"
echo "   Parar: docker-compose -f docker-compose.selfhosted.yml down"
echo "   Logs: docker-compose -f docker-compose.selfhosted.yml logs -f"
echo "   Reiniciar: docker-compose -f docker-compose.selfhosted.yml restart"
