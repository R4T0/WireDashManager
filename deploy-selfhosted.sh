
#!/bin/bash

# =============================================================================
# WireDash Self-Hosted Deploy Script
# Script principal para deploy completo do WireDash em modo self-hosted
# =============================================================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_color() {
    printf "${1}${2}${NC}\n"
}

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para aguardar serviço ficar pronto
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_color $YELLOW "⏳ Aguardando $service_name ficar disponível..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" >/dev/null 2>&1; then
            print_color $GREEN "✅ $service_name está disponível!"
            return 0
        fi
        
        printf "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_color $RED "❌ Timeout aguardando $service_name"
    return 1
}

# Função para verificar saúde dos containers
check_container_health() {
    local container_name=$1
    local max_attempts=15
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker ps --filter "name=$container_name" --filter "status=running" | grep -q "$container_name"; then
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    return 1
}

print_color $PURPLE "🚀 WireDash Self-Hosted Deploy"
print_color $PURPLE "=============================="
echo ""

# =============================================================================
# 1. VERIFICAÇÃO DE PRÉ-REQUISITOS
# =============================================================================

print_color $BLUE "🔍 Verificando pré-requisitos..."

# Verificar Docker
if ! command_exists docker; then
    print_color $RED "❌ Docker não encontrado!"
    echo "Instale o Docker:"
    case $(uname -s) in
        "Linux")
            echo "Ubuntu/Debian: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
            ;;
        "Darwin")
            echo "macOS: brew install docker ou https://docs.docker.com/desktop/mac/"
            ;;
        *)
            echo "Visite: https://docs.docker.com/get-docker/"
            ;;
    esac
    exit 1
fi

# Verificar Docker Compose
if ! command_exists docker-compose; then
    print_color $RED "❌ Docker Compose não encontrado!"
    echo "Instale o Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Verificar se Docker está rodando
if ! docker info >/dev/null 2>&1; then
    print_color $RED "❌ Docker não está rodando!"
    echo "Inicie o Docker e tente novamente."
    exit 1
fi

print_color $GREEN "✅ Todos os pré-requisitos atendidos!"

# =============================================================================
# 2. PREPARAÇÃO DO AMBIENTE
# =============================================================================

print_color $BLUE "📁 Preparando ambiente..."

# Criar estrutura de diretórios
mkdir -p {logs,backups,data/postgres}

# Verificar arquivos essenciais
if [ ! -f "docker-compose.yml" ]; then
    print_color $RED "❌ Arquivo docker-compose.yml não encontrado!"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    print_color $RED "❌ Dockerfile não encontrado!"
    exit 1
fi

if [ ! -f "Dockerfile.backend" ]; then
    print_color $RED "❌ Dockerfile.backend não encontrado!"
    exit 1
fi

# Configurar variáveis de ambiente se não existir
if [ ! -f ".env" ]; then
    print_color $YELLOW "⚙️ Criando arquivo .env..."
    if [ -f ".env.selfhosted.example" ]; then
        cp .env.selfhosted.example .env
        print_color $GREEN "✅ Arquivo .env criado a partir do exemplo!"
    else
        cat > .env << EOF
# Configuração Self-Hosted WireDash
VITE_USE_LOCAL_SUPABASE=false
VITE_SELF_HOSTED=true
VITE_API_URL=http://localhost:3000
NODE_ENV=production

# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=wireguard_manager
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/wireguard_manager

# Segurança (ALTERE EM PRODUÇÃO!)
JWT_SECRET=change-this-in-production
SESSION_SECRET=change-this-in-production
EOF
        print_color $GREEN "✅ Arquivo .env criado!"
    fi
fi

print_color $GREEN "✅ Ambiente preparado!"

# =============================================================================
# 3. LIMPEZA DE INSTALAÇÕES ANTERIORES
# =============================================================================

print_color $BLUE "🧹 Limpando instalações anteriores..."

# Parar containers existentes
print_color $YELLOW "Parando containers existentes..."
docker-compose down >/dev/null 2>&1 || true

# Parar containers com nomes específicos
docker stop wiredash-selfhosted wiredash-backend wiredash-postgres >/dev/null 2>&1 || true
docker rm wiredash-selfhosted wiredash-backend wiredash-postgres >/dev/null 2>&1 || true

# Remover imagens antigas se existirem
docker rmi wiredash-local:latest >/dev/null 2>&1 || true

print_color $GREEN "✅ Limpeza concluída!"

# =============================================================================
# 4. BUILD DA APLICAÇÃO
# =============================================================================

print_color $BLUE "🔨 Construindo aplicações..."

# Build da imagem Frontend (Nginx + SPA)
print_color $YELLOW "Construindo imagem Frontend..."
if docker build -t wiredash-local:latest .; then
    print_color $GREEN "✅ Imagem Frontend construída com sucesso!"
else
    print_color $RED "❌ Erro ao construir imagem Frontend"
    exit 1
fi

print_color $GREEN "✅ Todas as imagens construídas com sucesso!"

# =============================================================================
# 5. DEPLOY DOS SERVIÇOS
# =============================================================================

print_color $BLUE "🚀 Iniciando serviços..."

# Iniciar serviços em background
print_color $YELLOW "Iniciando containers..."
if docker-compose up -d; then
    print_color $GREEN "✅ Containers iniciados!"
else
    print_color $RED "❌ Erro ao iniciar containers"
    exit 1
fi

# =============================================================================
# 6. VERIFICAÇÃO DE SAÚDE DOS SERVIÇOS
# =============================================================================

print_color $BLUE "🔍 Verificando saúde dos serviços..."

# Verificar PostgreSQL
print_color $YELLOW "Verificando PostgreSQL..."
if check_container_health "wiredash-postgres"; then
    # Aguardar PostgreSQL aceitar conexões
    sleep 5
    
    # Testar conexão com PostgreSQL
    if docker exec wiredash-postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_color $GREEN "✅ PostgreSQL está funcionando!"
    else
        print_color $RED "❌ PostgreSQL não está respondendo"
        docker-compose logs postgres
        exit 1
    fi
else
    print_color $RED "❌ Container PostgreSQL não está rodando"
    exit 1
fi

# Verificar Backend
print_color $YELLOW "Verificando Backend WireDash..."
if check_container_health "wiredash-backend"; then
    # Aguardar backend ficar disponível
    if wait_for_service "http://localhost:3000/health" "Backend WireDash"; then
        print_color $GREEN "✅ Backend WireDash está funcionando!"
    else
        print_color $RED "❌ Backend WireDash não está respondendo"
        docker-compose logs wiredash-backend
        exit 1
    fi
else
    print_color $RED "❌ Container Backend WireDash não está rodando"
    exit 1
fi

# Verificar aplicação Frontend (Nginx)
print_color $YELLOW "Verificando Frontend WireDash..."
if check_container_health "wiredash-selfhosted"; then
    # Aguardar frontend ficar disponível
    if wait_for_service "http://localhost:8080" "Frontend WireDash"; then
        print_color $GREEN "✅ Frontend WireDash está funcionando!"
    else
        print_color $RED "❌ Frontend WireDash não está respondendo"
        docker-compose logs wiredash-app
        exit 1
    fi
else
    print_color $RED "❌ Container Frontend WireDash não está rodando"
    exit 1
fi

# =============================================================================
# 7. VERIFICAÇÃO FINAL E INFORMAÇÕES
# =============================================================================

print_color $BLUE "📊 Status final dos serviços..."

# Mostrar status dos containers
docker-compose ps

# Verificar recursos utilizados
print_color $YELLOW "💾 Uso de recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# =============================================================================
# 8. SUCESSO - INFORMAÇÕES FINAIS
# =============================================================================

echo ""
print_color $GREEN "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
print_color $GREEN "================================"
echo ""
print_color $BLUE "🌐 Aplicação WireDash: http://localhost:8080"
print_color $BLUE "🔧 API Backend: http://localhost:3000"
print_color $BLUE "🗄️  PostgreSQL: localhost:5432"
print_color $BLUE "   📋 Usuário: postgres"
print_color $BLUE "   🔐 Senha: postgres"
print_color $BLUE "   🗃️  Database: wireguard_manager"
echo ""
print_color $YELLOW "📋 COMANDOS ÚTEIS:"
echo "   Parar:          docker-compose down"
echo "   Logs:           docker-compose logs -f"
echo "   Logs Backend:   docker-compose logs -f wiredash-backend"
echo "   Logs Frontend:  docker-compose logs -f wiredash-app"
echo "   Reiniciar:      docker-compose restart"
echo "   Status:         docker-compose ps"
echo "   Backup:         ./backup.sh"
echo "   Atualizar:      ./deploy-selfhosted.sh"
echo ""
print_color $YELLOW "📁 DIRETÓRIOS:"
echo "   Logs:           ./logs/"
echo "   Backups:        ./backups/"
echo "   Dados:          ./data/"
echo ""
print_color $YELLOW "🔧 CONFIGURAÇÃO:"
echo "   Ambiente:       Self-hosted (PostgreSQL local)"
echo "   Modo:           Produção"
echo "   Arquitetura:    Frontend (Nginx) + Backend (Bun) + PostgreSQL"
echo "   Persistência:   Habilitada"
echo ""
print_color $GREEN "✅ Sistema pronto para uso!"

# Opcional: Abrir browser automaticamente
if command_exists xdg-open; then
    read -p "Deseja abrir a aplicação no browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open http://localhost:8080
    fi
elif command_exists open; then
    read -p "Deseja abrir a aplicação no browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:8080
    fi
fi

print_color $GREEN "🚀 WireDash Self-Hosted está rodando!"
