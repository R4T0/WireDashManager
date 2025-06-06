
#!/bin/bash

# Script para construir a imagem Docker local do WireDash

echo "🔨 Construindo imagem Docker local do WireDash..."
echo "================================================"

# Construir a imagem local
docker build -t wiredash-local:latest .

if [ $? -eq 0 ]; then
    echo "✅ Imagem construída com sucesso!"
    echo ""
    echo "🚀 Próximos passos:"
    echo ""
    echo "📝 Para usar com Supabase REMOTO:"
    echo "   docker-compose -f docker-compose.remote.yml up -d"
    echo ""
    echo "🏠 Para usar modo SELF-HOSTED completo:"
    echo "   docker-compose -f docker-compose.selfhosted.yml up -d"
    echo ""
    echo "🔧 Para desenvolvimento (apenas PostgreSQL):"
    echo "   docker-compose -f docker-compose.dev.yml up -d"
else
    echo "❌ Erro ao construir a imagem Docker"
    exit 1
fi
