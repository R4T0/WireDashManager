
#!/bin/bash

# =============================================================================
# WireDash Health Checks
# Verificação de saúde dos serviços
# =============================================================================

# Carregar utilitários
source "$(dirname "$0")/deploy-utils.sh"

check_services_health() {
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
            return 1
        fi
    else
        print_color $RED "❌ Container PostgreSQL não está rodando"
        return 1
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
            return 1
        fi
    else
        print_color $RED "❌ Container Backend WireDash não está rodando"
        return 1
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
            return 1
        fi
    else
        print_color $RED "❌ Container Frontend WireDash não está rodando"
        return 1
    fi

    return 0
}

show_final_status() {
    print_color $BLUE "📊 Status final dos serviços..."

    # Mostrar status dos containers
    docker-compose ps

    # Verificar recursos utilizados
    print_color $YELLOW "💾 Uso de recursos:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

show_success_info() {
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
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_services_health
    if [ $? -eq 0 ]; then
        show_final_status
        show_success_info
    fi
fi
