
#!/bin/bash

# =============================================================================
# WireDash Images Build
# Constrói as imagens Docker do frontend e backend
# =============================================================================

# Carregar utilitários
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/deploy-utils.sh"

cleanup_previous_installation() {
    print_header "Limpeza de Instalações Anteriores"

    # Parar containers existentes
    print_color $YELLOW "🛑 Parando containers existentes..."
    docker-compose down --remove-orphans >/dev/null 2>&1 || true

    # Parar containers com nomes específicos (caso existam de deploys anteriores)
    local containers=(
        "wiredash-selfhosted"
        "wiredash-app"
        "wiredash-backend"
        "wiredash-postgres"
    )

    for container in "${containers[@]}"; do
        if docker ps -a --filter "name=$container" --format "{{.Names}}" | grep -q "^$container$"; then
            print_color $YELLOW "🗑️ Removendo container: $container"
            docker stop "$container" >/dev/null 2>&1 || true
            docker rm "$container" >/dev/null 2>&1 || true
        fi
    done

    # Remover imagens antigas (apenas as do projeto)
    print_color $YELLOW "🗑️ Removendo imagens antigas..."
    docker rmi wiredash-local:latest >/dev/null 2>&1 || true

    # Limpar volumes órfãos
    print_color $YELLOW "🧹 Limpando volumes órfãos..."
    docker volume prune -f >/dev/null 2>&1 || true

    print_color $GREEN "✅ Limpeza concluída!"
}

build_frontend() {
    print_color $BLUE "🔨 Construindo imagem do Frontend..."
    
    # Verificar se Dockerfile existe
    if [ ! -f "Dockerfile" ]; then
        print_color $RED "❌ Dockerfile não encontrado!"
        return 1
    fi

    # Build da imagem Frontend com logs detalhados
    print_color $YELLOW "📦 Iniciando build do frontend..."
    if docker build \
        --tag wiredash-local:latest \
        --build-arg NODE_ENV=production \
        --build-arg VITE_SELF_HOSTED=true \
        --build-arg VITE_USE_LOCAL_SUPABASE=false \
        --progress=plain \
        .; then
        print_color $GREEN "✅ Imagem Frontend construída com sucesso!"
        
        # Verificar se a imagem foi criada corretamente
        if docker images | grep -q "wiredash-local.*latest"; then
            local image_size=$(docker images wiredash-local:latest --format "{{.Size}}")
            print_color $GREEN "📊 Tamanho da imagem: $image_size"
        fi
        
        return 0
    else
        print_color $RED "❌ Erro ao construir imagem Frontend"
        echo "💡 Dicas para resolver:"
        echo "1. Verifique se todos os arquivos necessários estão presentes"
        echo "2. Execute 'npm install' localmente para verificar dependências"
        echo "3. Verifique se há erros de sintaxe no código"
        return 1
    fi
}

build_backend() {
    print_color $BLUE "🔨 Preparando Backend..."
    
    # Verificar se Dockerfile.backend existe
    if [ ! -f "Dockerfile.backend" ]; then
        print_color $RED "❌ Dockerfile.backend não encontrado!"
        return 1
    fi

    # O backend será construído automaticamente pelo docker-compose
    # Apenas verificamos se os arquivos necessários existem
    
    local backend_files=(
        "docker-entrypoint-backend.sh"
        "package.json"
    )

    for file in "${backend_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_color $RED "❌ Arquivo necessário para backend não encontrado: $file"
            return 1
        fi
    done

    # Corrigir line endings no script de entrada do backend
    if [ -f "docker-entrypoint-backend.sh" ]; then
        check_line_endings "docker-entrypoint-backend.sh"
        chmod +x "docker-entrypoint-backend.sh"
        print_color $GREEN "✅ Script de entrada do backend configurado"
    fi

    print_color $GREEN "✅ Backend preparado (será construído durante o deploy)"
    return 0
}

verify_builds() {
    print_color $BLUE "🔍 Verificando imagens construídas..."
    
    # Verificar imagem do frontend
    if docker images | grep -q "wiredash-local.*latest"; then
        print_color $GREEN "✅ Imagem Frontend verificada"
    else
        print_color $RED "❌ Imagem Frontend não encontrada"
        return 1
    fi

    # Verificar espaço usado pelas imagens
    print_color $BLUE "📊 Uso de espaço pelas imagens Docker:"
    docker images | grep -E "(wiredash|postgres|nginx)" || echo "Nenhuma imagem relacionada encontrada"
    
    return 0
}

build_images() {
    print_header "Construção das Imagens Docker"

    # Limpeza prévia
    cleanup_previous_installation
    echo ""

    # Build do frontend
    if ! build_frontend; then
        return 1
    fi
    echo ""

    # Preparação do backend  
    if ! build_backend; then
        return 1
    fi
    echo ""

    # Verificação final
    if ! verify_builds; then
        return 1
    fi

    print_color $GREEN "🎉 Todas as imagens foram preparadas com sucesso!"
    return 0
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    build_images
fi
