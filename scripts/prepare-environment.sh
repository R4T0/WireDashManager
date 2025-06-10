
#!/bin/bash

# =============================================================================
# WireDash Environment Preparation
# Prepara o ambiente para o deploy
# =============================================================================

# Carregar utilitários
source "$(dirname "$0")/deploy-utils.sh"

prepare_environment() {
    print_color $BLUE "📁 Preparando ambiente..."

    # Criar estrutura de diretórios
    mkdir -p {logs,backups,data/postgres}

    # Verificar arquivos essenciais
    if [ ! -f "docker-compose.yml" ]; then
        print_color $RED "❌ Arquivo docker-compose.yml não encontrado!"
        return 1
    fi

    if [ ! -f "Dockerfile" ]; then
        print_color $RED "❌ Dockerfile não encontrado!"
        return 1
    fi

    if [ ! -f "Dockerfile.backend" ]; then
        print_color $RED "❌ Dockerfile.backend não encontrado!"
        return 1
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
    return 0
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    prepare_environment
fi
