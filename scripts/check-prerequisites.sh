
#!/bin/bash

# =============================================================================
# WireDash Prerequisites Check
# Verifica se todos os pré-requisitos estão instalados
# =============================================================================

# Carregar utilitários
source "$(dirname "$0")/deploy-utils.sh"

check_prerequisites() {
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
        return 1
    fi

    # Verificar Docker Compose
    if ! command_exists docker-compose; then
        print_color $RED "❌ Docker Compose não encontrado!"
        echo "Instale o Docker Compose: https://docs.docker.com/compose/install/"
        return 1
    fi

    # Verificar se Docker está rodando
    if ! docker info >/dev/null 2>&1; then
        print_color $RED "❌ Docker não está rodando!"
        echo "Inicie o Docker e tente novamente."
        return 1
    fi

    print_color $GREEN "✅ Todos os pré-requisitos atendidos!"
    return 0
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_prerequisites
fi
