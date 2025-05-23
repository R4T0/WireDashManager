
#!/bin/sh

# Script de inicialização para container WireDash

echo "🚀 Iniciando WireDash Self-Hosted..."

# Aguardar PostgreSQL estar disponível
echo "⏳ Aguardando PostgreSQL..."
while ! nc -z postgres 5432; do
    sleep 1
done
echo "✅ PostgreSQL disponível"

# Iniciar Nginx
echo "🌐 Iniciando servidor web..."
exec "$@"
