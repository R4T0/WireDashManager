
#!/bin/bash

# Script para build e deploy do WireDash

echo "🚀 Iniciando build do WireDash..."

# Build da imagem Docker
echo "📦 Construindo imagem Docker..."
docker build -t wiredash:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo "🔧 Para rodar em produção, execute:"
    echo "   docker-compose -f docker-compose.prod.yml up -d"
    echo ""
    echo "🔧 Para rodar apenas a aplicação:"
    echo "   docker run -p 8080:80 wiredash:latest"
else
    echo "❌ Erro no build da imagem Docker"
    exit 1
fi
