
#!/bin/bash

# Script para iniciar WireDash com Supabase remoto

echo "🌐 Iniciando WireDash com Supabase REMOTO"
echo "========================================"

# Verificar se a imagem local existe
if ! docker image inspect wiredash-local:latest >/dev/null 2>&1; then
    echo "❌ Imagem local não encontrada. Construindo..."
    ./scripts/build-local.sh
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.remote.yml down

# Iniciar serviços
echo "🚀 Iniciando serviços..."
docker-compose -f docker-compose.remote.yml up -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 5

echo "✅ WireDash está rodando com Supabase REMOTO!"
echo ""
echo "🌐 Acesse a aplicação em: http://localhost:8080"
echo "☁️  Usando Supabase na nuvem"
echo ""
echo "📋 Comandos úteis:"
echo "   Parar: docker-compose -f docker-compose.remote.yml down"
echo "   Logs: docker-compose -f docker-compose.remote.yml logs -f"
