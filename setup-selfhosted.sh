
#!/bin/bash

# Script de configuração inicial para WireDash Self-Hosted

echo "🚀 WireDash Self-Hosted Setup"
echo "============================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_color() {
    printf "${1}${2}${NC}\n"
}

# Verificar sistema operacional
OS=$(uname -s)
print_color $BLUE "🖥️ Sistema operacional detectado: $OS"

# Verificar pré-requisitos
print_color $YELLOW "🔍 Verificando pré-requisitos..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_color $RED "❌ Docker não encontrado!"
    echo "Instale o Docker:"
    case $OS in
        "Linux")
            echo "Ubuntu/Debian: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
            ;;
        "Darwin")
            echo "macOS: brew install docker ou baixe do https://docs.docker.com/desktop/mac/"
            ;;
        *)
            echo "Visite: https://docs.docker.com/get-docker/"
            ;;
    esac
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_color $RED "❌ Docker Compose não encontrado!"
    echo "Instale o Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    print_color $RED "❌ Docker não está rodando!"
    echo "Inicie o Docker e tente novamente."
    exit 1
fi

print_color $GREEN "✅ Todos os pré-requisitos atendidos!"

# Criar estrutura de diretórios
print_color $YELLOW "📁 Criando estrutura de diretórios..."
mkdir -p {logs,backups,data/postgres,config}

# Tornar scripts executáveis
print_color $YELLOW "🔧 Configurando permissões..."
chmod +x scripts/*.sh

# Verificar se é primeira instalação
if [ ! -f ".env.selfhosted" ]; then
    print_color $YELLOW "⚙️ Primeira instalação detectada. Configurando..."
    
    # Copiar arquivo de configuração
    cp .env.selfhosted.example .env.selfhosted
    
    # Gerar senha segura para PostgreSQL
    PG_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    sed -i "s/POSTGRES_PASSWORD=postgres/POSTGRES_PASSWORD=$PG_PASSWORD/" .env.selfhosted
    
    print_color $GREEN "✅ Configuração inicial criada!"
    print_color $YELLOW "📝 Senha do PostgreSQL gerada automaticamente e salva em .env.selfhosted"
fi

# Configurar Docker Compose
print_color $YELLOW "🐳 Configurando Docker Compose..."

# Parar containers existentes se houver
docker-compose -f docker-compose.local.yml down > /dev/null 2>&1

# Baixar imagens necessárias
print_color $YELLOW "📦 Baixando imagens Docker..."
docker-compose -f docker-compose.local.yml pull

# Construir aplicação
print_color $YELLOW "🔨 Construindo aplicação..."
docker-compose -f docker-compose.local.yml build

# Iniciar serviços
print_color $YELLOW "🚀 Iniciando serviços..."
docker-compose -f docker-compose.local.yml up -d

# Aguardar serviços ficarem prontos
print_color $YELLOW "⏳ Aguardando serviços ficarem prontos..."
sleep 15

# Verificar se tudo está funcionando
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    print_color $GREEN "✅ WireDash Self-Hosted instalado com sucesso!"
    echo ""
    print_color $BLUE "🌐 Aplicação disponível em: http://localhost:8080"
    print_color $BLUE "🗄️ PostgreSQL disponível em: localhost:5432"
    echo ""
    print_color $YELLOW "📋 Comandos úteis:"
    echo "   Parar:      docker-compose -f docker-compose.local.yml down"
    echo "   Iniciar:    docker-compose -f docker-compose.local.yml up -d"
    echo "   Logs:       docker-compose -f docker-compose.local.yml logs -f"
    echo "   Backup:     ./scripts/backup.sh"
    echo "   Atualizar:  ./scripts/update.sh"
    echo ""
    print_color $YELLOW "📖 Documentação completa: README.selfhosted.md"
else
    print_color $RED "❌ Erro na instalação. Verificando logs..."
    docker-compose -f docker-compose.local.yml logs
fi

print_color $GREEN "🎉 Setup concluído!"
