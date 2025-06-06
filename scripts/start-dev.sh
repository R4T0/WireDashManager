
#!/bin/bash

# Script para iniciar apenas PostgreSQL para desenvolvimento

echo "🔧 Iniciando PostgreSQL para desenvolvimento"
echo "==========================================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instale o Docker primeiro."
    echo "📖 Visite: https://docs.docker.com/get-docker/"
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.dev.yml down

# Iniciar PostgreSQL
echo "🗄️  Iniciando PostgreSQL..."
docker-compose -f docker-compose.dev.yml up -d

# Aguardar PostgreSQL ficar pronto
echo "⏳ Aguardando PostgreSQL ficar pronto..."
sleep 5

echo "✅ PostgreSQL está rodando!"
echo ""
echo "🗄️  PostgreSQL disponível em: localhost:5432"
echo "   Usuário: postgres"
echo "   Senha: postgres"
echo "   Database: wireguard_manager"
echo ""
echo "📝 Configure seu .env.local com:"
echo "   VITE_USE_LOCAL_SUPABASE=true"
echo ""
echo "🚀 Agora execute: npm run dev"
echo ""
echo "📋 Comandos úteis:"
echo "   Parar: docker-compose -f docker-compose.dev.yml down"
echo "   Logs: docker-compose -f docker-compose.dev.yml logs -f"
