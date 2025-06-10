
#!/bin/bash

# =============================================================================
# WireDash Prerequisites Check
# Verifica se todos os pré-requisitos estão instalados e configurados
# =============================================================================

# Carregar utilitários
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/deploy-utils.sh"

check_prerequisites() {
    local errors=0
    
    print_header "Verificação de Pré-requisitos"

    # Verificar Docker
    print_color $BLUE "🔍 Verificando Docker..."
    if ! command_exists docker; then
        print_color $RED "❌ Docker não encontrado!"
        echo "Instale o Docker:"
        case $(uname -s) in
            "Linux")
                echo "Ubuntu/Debian: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
                echo "CentOS/RHEL: sudo yum install -y docker"
                ;;
            "Darwin")
                echo "macOS: brew install docker ou https://docs.docker.com/desktop/mac/"
                ;;
            *)
                echo "Visite: https://docs.docker.com/get-docker/"
                ;;
        esac
        ((errors++))
    else
        local docker_version=$(docker --version | cut -d' ' -f3 | tr -d ',')
        print_color $GREEN "✅ Docker encontrado: versão $docker_version"
    fi

    # Verificar Docker Compose
    print_color $BLUE "🔍 Verificando Docker Compose..."
    if ! command_exists docker-compose; then
        print_color $RED "❌ Docker Compose não encontrado!"
        echo "Instale o Docker Compose: https://docs.docker.com/compose/install/"
        ((errors++))
    else
        local compose_version=$(docker-compose --version | cut -d' ' -f3 | tr -d ',')
        print_color $GREEN "✅ Docker Compose encontrado: versão $compose_version"
    fi

    # Verificar se Docker está rodando
    print_color $BLUE "🔍 Verificando se Docker está ativo..."
    if ! docker info >/dev/null 2>&1; then
        print_color $RED "❌ Docker não está rodando!"
        echo "Inicie o Docker e tente novamente:"
        echo "sudo systemctl start docker  # Linux"
        echo "sudo service docker start   # Linux alternativo"
        echo "Abra Docker Desktop         # Windows/macOS"
        ((errors++))
    else
        print_color $GREEN "✅ Docker está ativo"
    fi

    # Verificar recursos do sistema
    print_color $BLUE "🔍 Verificando recursos do sistema..."
    check_disk_space 5
    check_memory 2048

    # Verificar portas necessárias
    print_color $BLUE "🔍 Verificando portas..."
    local ports=(8080 3000 5432)
    local port_conflicts=()
    
    for port in "${ports[@]}"; do
        if ! port_is_free "$port"; then
            port_conflicts+=($port)
            print_color $YELLOW "⚠️ Porta $port está ocupada"
        else
            print_color $GREEN "✅ Porta $port está livre"
        fi
    done

    if [ ${#port_conflicts[@]} -gt 0 ]; then
        print_color $YELLOW "⚠️ Portas ocupadas: ${port_conflicts[*]}"
        echo "Você pode:"
        echo "1. Parar os serviços que estão usando essas portas"
        echo "2. Alterar as portas no docker-compose.yml"
        echo "3. Continuar assim mesmo (pode causar conflitos)"
        echo ""
        if ! confirm_action "Deseja continuar mesmo com portas ocupadas?"; then
            ((errors++))
        fi
    fi

    # Verificar arquivos essenciais
    print_color $BLUE "🔍 Verificando arquivos essenciais..."
    local required_files=(
        "docker-compose.yml"
        "Dockerfile"
        "Dockerfile.backend"
        "package.json"
    )

    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_color $RED "❌ Arquivo obrigatório não encontrado: $file"
            ((errors++))
        else
            print_color $GREEN "✅ Arquivo encontrado: $file"
            # Verificar line endings
            check_line_endings "$file"
        fi
    done

    # Verificar line endings em scripts
    print_color $BLUE "🔍 Verificando line endings em scripts..."
    find scripts/ -name "*.sh" 2>/dev/null | while read -r script; do
        check_line_endings "$script"
    done

    # Resultado final
    echo ""
    if [ $errors -eq 0 ]; then
        print_color $GREEN "🎉 Todos os pré-requisitos foram atendidos!"
        return 0
    else
        print_color $RED "❌ $errors erro(s) encontrado(s). Corrija-os antes de continuar."
        return 1
    fi
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_prerequisites
fi
