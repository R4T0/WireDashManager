
#!/bin/bash

# =============================================================================
# WireDash Services Deploy
# Inicia e configura todos os serviços (PostgreSQL, Backend, Frontend)
# =============================================================================

# Carregar utilitários
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/deploy-utils.sh"

start_database() {
    print_color $BLUE "🗄️ Iniciando PostgreSQL..."
    
    # Iniciar apenas o PostgreSQL primeiro
    if docker-compose up -d postgres; then
        print_color $GREEN "✅ PostgreSQL container iniciado"
        
        # Aguardar PostgreSQL ficar pronto
        print_color $YELLOW "⏳ Aguardando PostgreSQL aceitar conexões..."
        local attempt=1
        local max_attempts=30
        
        while [ $attempt -le $max_attempts ]; do
            if docker exec wiredash-postgres pg_isready -U postgres >/dev/null 2>&1; then
                print_color $GREEN "✅ PostgreSQL está aceitando conexões!"
                return 0
            fi
            
            printf "."
            sleep 2
            attempt=$((attempt + 1))
        done
        
        print_color $RED "❌ PostgreSQL não ficou pronto após $max_attempts tentativas"
        show_container_logs "wiredash-postgres" 20
        return 1
    else
        print_color $RED "❌ Erro ao iniciar PostgreSQL"
        return 1
    fi
}

start_backend() {
    print_color $BLUE "⚙️ Iniciando Backend..."
    
    if docker-compose up -d wiredash-backend; then
        print_color $GREEN "✅ Backend container iniciado"
        
        # Aguardar backend ficar pronto
        print_color $YELLOW "⏳ Aguardando Backend aceitar conexões..."
        if wait_for_service "http://localhost:3000/health" "Backend" 45; then
            return 0
        else
            print_color $RED "❌ Backend não ficou pronto"
            show_container_logs "wiredash-backend" 30
            return 1
        fi
    else
        print_color $RED "❌ Erro ao iniciar Backend"
        return 1
    fi
}

start_frontend() {
    print_color $BLUE "🌐 Iniciando Frontend..."
    
    if docker-compose up -d wiredash-app; then
        print_color $GREEN "✅ Frontend container iniciado"
        
        # Aguardar frontend ficar pronto
        print_color $YELLOW "⏳ Aguardando Frontend aceitar conexões..."
        if wait_for_service "http://localhost:8080" "Frontend" 30; then
            return 0
        else
            print_color $RED "❌ Frontend não ficou pronto"
            show_container_logs "wiredash-selfhosted" 30
            return 1
        fi
    else
        print_color $RED "❌ Erro ao iniciar Frontend"
        return 1
    fi
}

verify_deployment() {
    print_color $BLUE "🔍 Verificando deployment..."
    
    # Verificar status dos containers
    print_color $YELLOW "📊 Status dos containers:"
    docker-compose ps
    echo ""
    
    # Verificar se todos os containers estão rodando
    local containers=("wiredash-postgres" "wiredash-backend" "wiredash-selfhosted")
    local failed_containers=()
    
    for container in "${containers[@]}"; do
        if ! docker ps --filter "name=$container" --filter "status=running" | grep -q "$container"; then
            failed_containers+=("$container")
        fi
    done
    
    if [ ${#failed_containers[@]} -gt 0 ]; then
        print_color $RED "❌ Containers com problema: ${failed_containers[*]}"
        return 1
    fi
    
    print_color $GREEN "✅ Todos os containers estão rodando"
    return 0
}

deploy_services() {
    print_header "Deploy dos Serviços"

    # 1. Iniciar banco de dados
    if ! start_database; then
        return 1
    fi
    echo ""

    # 2. Iniciar backend
    if ! start_backend; then
        return 1
    fi
    echo ""

    # 3. Iniciar frontend
    if ! start_frontend; then
        return 1
    fi
    echo ""

    # 4. Verificação final
    if ! verify_deployment; then
        return 1
    fi

    print_color $GREEN "🎉 Todos os serviços foram iniciados com sucesso!"
    
    # Mostrar informações úteis
    echo ""
    print_color $CYAN "📊 Informações dos Serviços:"
    print_color $BLUE "🌐 Frontend: http://localhost:8080"
    print_color $BLUE "⚙️ Backend API: http://localhost:3000"
    print_color $BLUE "🗄️ PostgreSQL: localhost:5432"
    print_color $BLUE "   Usuário: postgres"
    print_color $BLUE "   Senha: postgres"
    print_color $BLUE "   Database: wireguard_manager"
    
    return 0
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    deploy_services
fi
