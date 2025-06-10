
#!/bin/bash

# =============================================================================
# WireDash Health Checks
# Verificação completa de saúde dos serviços e informações finais
# =============================================================================

# Carregar utilitários
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/deploy-utils.sh"

test_database_connectivity() {
    print_color $BLUE "🗄️ Testando conectividade do PostgreSQL..."
    
    # Teste básico de conexão
    if docker exec wiredash-postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_color $GREEN "✅ PostgreSQL respondendo"
    else
        print_color $RED "❌ PostgreSQL não está respondendo"
        return 1
    fi
    
    # Teste de conexão ao banco de dados
    if docker exec wiredash-postgres psql -U postgres -d wireguard_manager -c "SELECT 1;" >/dev/null 2>&1; then
        print_color $GREEN "✅ Banco de dados wireguard_manager acessível"
    else
        print_color $RED "❌ Banco de dados wireguard_manager não acessível"
        return 1
    fi
    
    # Verificar tabelas básicas
    local table_count=$(docker exec wiredash-postgres psql -U postgres -d wireguard_manager -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ')
    if [ "$table_count" -gt 0 ]; then
        print_color $GREEN "✅ Tabelas encontradas no banco: $table_count"
    else
        print_color $YELLOW "⚠️ Nenhuma tabela encontrada (primeira execução?)"
    fi
    
    return 0
}

test_backend_api() {
    print_color $BLUE "⚙️ Testando API do Backend..."
    
    # Teste de health check
    if curl -f -s --max-time 10 "http://localhost:3000/health" >/dev/null 2>&1; then
        print_color $GREEN "✅ Backend health check OK"
    else
        print_color $RED "❌ Backend health check falhou"
        return 1
    fi
    
    # Teste de rota básica da API
    local api_response=$(curl -s --max-time 10 "http://localhost:3000/api" 2>/dev/null || echo "")
    if [ -n "$api_response" ]; then
        print_color $GREEN "✅ API do Backend respondendo"
    else
        print_color $YELLOW "⚠️ API do Backend não respondeu (pode ser normal se não houver rota /api)"
    fi
    
    return 0
}

test_frontend_app() {
    print_color $BLUE "🌐 Testando aplicação Frontend..."
    
    # Teste de acesso à página principal
    if curl -f -s --max-time 10 "http://localhost:8080" >/dev/null 2>&1; then
        print_color $GREEN "✅ Frontend acessível"
    else
        print_color $RED "❌ Frontend não acessível"
        return 1
    fi
    
    # Verificar se retorna HTML válido
    local content_type=$(curl -s -I --max-time 10 "http://localhost:8080" 2>/dev/null | grep -i content-type | cut -d' ' -f2- | tr -d '\r\n')
    if echo "$content_type" | grep -q "text/html"; then
        print_color $GREEN "✅ Frontend retornando HTML"
    else
        print_color $YELLOW "⚠️ Frontend não retornando HTML esperado"
    fi
    
    return 0
}

test_container_resources() {
    print_color $BLUE "📊 Verificando recursos dos containers..."
    
    # Verificar uso de CPU e memória
    print_color $YELLOW "💻 Uso de recursos:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" || true
    echo ""
    
    # Verificar logs de erro
    print_color $BLUE "📋 Verificando logs de erro..."
    local containers=("wiredash-postgres" "wiredash-backend" "wiredash-selfhosted")
    local error_found=false
    
    for container in "${containers[@]}"; do
        if docker logs --tail=20 "$container" 2>&1 | grep -i -E "(error|failed|exception)" >/dev/null; then
            print_color $YELLOW "⚠️ Possíveis erros encontrados nos logs de $container"
            error_found=true
        fi
    done
    
    if [ "$error_found" = false ]; then
        print_color $GREEN "✅ Nenhum erro crítico encontrado nos logs"
    fi
    
    return 0
}

show_system_info() {
    print_header "Informações do Sistema"
    
    # Informações básicas
    print_color $CYAN "🖥️ Sistema Operacional:"
    uname -a
    echo ""
    
    print_color $CYAN "🐳 Versão do Docker:"
    docker --version
    docker-compose --version
    echo ""
    
    # Informações dos containers
    print_color $CYAN "📦 Status dos Containers:"
    docker-compose ps
    echo ""
    
    # Uso de espaço
    print_color $CYAN "💾 Uso de Espaço:"
    docker system df
    echo ""
}

show_access_info() {
    print_header "Informações de Acesso"
    
    print_color $GREEN "🌐 Aplicação WireDash:"
    print_color $BLUE "   URL: http://localhost:8080"
    print_color $BLUE "   Descrição: Interface web principal"
    echo ""
    
    print_color $GREEN "⚙️ API Backend:"
    print_color $BLUE "   URL: http://localhost:3000"
    print_color $BLUE "   Health Check: http://localhost:3000/health"
    print_color $BLUE "   Descrição: API REST do backend"
    echo ""
    
    print_color $GREEN "🗄️ PostgreSQL Database:"
    print_color $BLUE "   Host: localhost"
    print_color $BLUE "   Porta: 5432"
    print_color $BLUE "   Usuário: postgres"
    print_color $BLUE "   Senha: postgres"
    print_color $BLUE "   Database: wireguard_manager"
    print_color $BLUE "   Conexão: psql -h localhost -U postgres -d wireguard_manager"
    echo ""
}

show_management_commands() {
    print_header "Comandos de Gerenciamento"
    
    print_color $YELLOW "📋 Comandos Úteis:"
    echo "   Parar tudo:           docker-compose down"
    echo "   Parar e limpar:       docker-compose down -v"
    echo "   Ver logs:             docker-compose logs -f"
    echo "   Ver logs específico:  docker-compose logs -f [wiredash-app|wiredash-backend|postgres]"
    echo "   Reiniciar:            docker-compose restart"
    echo "   Status:               docker-compose ps"
    echo "   Entrar no container:  docker exec -it [container-name] bash"
    echo ""
    
    print_color $YELLOW "💾 Backup e Restore:"
    echo "   Fazer backup:         ./backup.sh"
    echo "   Restaurar backup:     ./restore.sh <arquivo.sql>"
    echo "   Localização backups:  ./backups/"
    echo ""
    
    print_color $YELLOW "🔧 Manutenção:"
    echo "   Rebuild aplicação:    ./deploy-selfhosted.sh"
    echo "   Limpar sistema:       docker system prune -a"
    echo "   Ver uso de espaço:    docker system df"
    echo ""
}

show_troubleshooting() {
    print_header "Solução de Problemas"
    
    print_color $YELLOW "🐛 Se algo não estiver funcionando:"
    echo ""
    echo "1. Verificar logs dos containers:"
    echo "   docker-compose logs -f"
    echo ""
    echo "2. Verificar se todas as portas estão livres:"
    echo "   netstat -tulpn | grep -E ':(8080|3000|5432)'"
    echo ""
    echo "3. Restart completo:"
    echo "   docker-compose down"
    echo "   docker-compose up -d"
    echo ""
    echo "4. Limpar e reinstalar:"
    echo "   docker-compose down -v"
    echo "   docker system prune -a"
    echo "   ./deploy-selfhosted.sh"
    echo ""
    echo "5. Verificar recursos do sistema:"
    echo "   df -h          # Espaço em disco"
    echo "   free -h        # Memória RAM"
    echo "   docker stats   # Uso pelos containers"
    echo ""
}

check_services_health() {
    print_header "Verificação de Saúde dos Serviços"

    local errors=0

    # Teste de conectividade do banco
    if ! test_database_connectivity; then
        ((errors++))
    fi
    echo ""

    # Teste da API do backend
    if ! test_backend_api; then
        ((errors++))
    fi
    echo ""

    # Teste do frontend
    if ! test_frontend_app; then
        ((errors++))
    fi
    echo ""

    # Teste de recursos
    test_container_resources
    echo ""

    # Resultado dos testes
    if [ $errors -eq 0 ]; then
        print_color $GREEN "🎉 Todos os testes de saúde passaram!"
        
        # Mostrar informações do sistema
        show_system_info
        
        # Mostrar informações de acesso
        show_access_info
        
        # Mostrar comandos de gerenciamento
        show_management_commands
        
        # Informações de troubleshooting
        show_troubleshooting
        
        # Perguntar se quer abrir no browser
        if command_exists xdg-open; then
            echo ""
            if confirm_action "Deseja abrir a aplicação no navegador?"; then
                xdg-open http://localhost:8080 >/dev/null 2>&1 &
            fi
        elif command_exists open; then
            echo ""
            if confirm_action "Deseja abrir a aplicação no navegador?"; then
                open http://localhost:8080 >/dev/null 2>&1 &
            fi
        fi
        
        return 0
    else
        print_color $RED "❌ $errors teste(s) de saúde falharam"
        echo ""
        print_color $YELLOW "💡 Dicas para resolver problemas:"
        echo "1. Verifique os logs: docker-compose logs -f"
        echo "2. Reinicie os serviços: docker-compose restart"
        echo "3. Verifique se as portas estão livres"
        echo "4. Verifique recursos do sistema (RAM, disco)"
        return 1
    fi
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_services_health
fi
