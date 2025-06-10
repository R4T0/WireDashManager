
#!/bin/bash

# =============================================================================
# WireDash Images Build
# Constrói as imagens Docker necessárias
# =============================================================================

# Carregar utilitários
source "$(dirname "$0")/deploy-utils.sh"

cleanup_previous_installation() {
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
}

build_images() {
    print_color $BLUE "🔨 Construindo aplicações..."

    # Build da imagem Frontend (Nginx + SPA)
    print_color $YELLOW "Construindo imagem Frontend..."
    if docker build -t wiredash-local:latest .; then
        print_color $GREEN "✅ Imagem Frontend construída com sucesso!"
    else
        print_color $RED "❌ Erro ao construir imagem Frontend"
        return 1
    fi

    print_color $GREEN "✅ Todas as imagens construídas com sucesso!"
    return 0
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    cleanup_previous_installation
    build_images
fi
