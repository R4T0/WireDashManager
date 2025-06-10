
#!/bin/bash

# =============================================================================
# WireDash Services Deploy
# Deploy dos serviços Docker
# =============================================================================

# Carregar utilitários
source "$(dirname "$0")/deploy-utils.sh"

deploy_services() {
    print_color $BLUE "🚀 Iniciando serviços..."

    # Iniciar serviços em background
    print_color $YELLOW "Iniciando containers..."
    if docker-compose up -d; then
        print_color $GREEN "✅ Containers iniciados!"
        return 0
    else
        print_color $RED "❌ Erro ao iniciar containers"
        return 1
    fi
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    deploy_services
fi
