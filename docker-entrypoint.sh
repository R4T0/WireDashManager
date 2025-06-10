
#!/bin/sh

# Script de inicialização para container WireDash Self-Hosted

echo "🚀 Iniciando WireDash Self-Hosted..."

# Verificar se estamos no modo self-hosted
if [ "$VITE_SELF_HOSTED" = "true" ]; then
    echo "✅ Modo Self-Hosted ativado"
else
    echo "⚠️  Aviso: VITE_SELF_HOSTED não está definido como true"
fi

# Aguardar PostgreSQL estar disponível (se configurado)
if [ -n "$POSTGRES_HOST" ] || [ -n "$DATABASE_URL" ]; then
    echo "⏳ Aguardando PostgreSQL..."
    
    # Instalar netcat se não estiver disponível
    if ! command -v nc >/dev/null 2>&1; then
        echo "📦 Instalando netcat..."
        apk add --no-cache netcat-openbsd 2>/dev/null || echo "⚠️  Netcat não disponível, continuando..."
    fi
    
    # Aguardar PostgreSQL por até 30 segundos
    POSTGRES_HOST=${POSTGRES_HOST:-postgres}
    POSTGRES_PORT=${POSTGRES_PORT:-5432}
    
    for i in $(seq 1 30); do
        if nc -z "$POSTGRES_HOST" "$POSTGRES_PORT" 2>/dev/null; then
            echo "✅ PostgreSQL disponível"
            break
        fi
        echo "⏳ Aguardando PostgreSQL... ($i/30)"
        sleep 1
    done
fi

# Verificar se os arquivos da aplicação existem
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "❌ Erro: Arquivos da aplicação não encontrados em /usr/share/nginx/html/"
    echo "🔍 Listando conteúdo do diretório:"
    ls -la /usr/share/nginx/html/
    exit 1
fi

echo "✅ Arquivos da aplicação encontrados"

# Verificar configuração do Nginx
if [ ! -f "/etc/nginx/nginx.conf" ]; then
    echo "❌ Erro: Configuração do Nginx não encontrada"
    exit 1
fi

echo "✅ Configuração do Nginx encontrada"

# Testar configuração do Nginx
echo "🔧 Testando configuração do Nginx..."
if nginx -t; then
    echo "✅ Configuração do Nginx válida"
else
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# Iniciar Nginx
echo "🌐 Iniciando servidor web..."
exec "$@"
