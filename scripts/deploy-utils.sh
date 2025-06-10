
#!/bin/bash

# =============================================================================
# WireDash Deploy Utilities
# Funções utilitárias compartilhadas para scripts de deploy
# =============================================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_color() {
    printf "${1}${2}${NC}\n"
}

# Função para imprimir cabeçalho
print_header() {
    echo ""
    print_color $CYAN "================================================"
    print_color $CYAN "$1"
    print_color $CYAN "================================================"
    echo ""
}

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar se porta está livre
port_is_free() {
    local port=$1
    ! netstat -tuln 2>/dev/null | grep -q ":$port "
}

# Função para aguardar serviço ficar pronto
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=${3:-30}
    local attempt=1
    
    print_color $YELLOW "⏳ Aguardando $service_name ficar disponível..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --max-time 5 "$url" >/dev/null 2>&1; then
            print_color $GREEN "✅ $service_name está disponível!"
            return 0
        fi
        
        printf "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo ""
    print_color $RED "❌ Timeout aguardando $service_name ($max_attempts tentativas)"
    return 1
}

# Função para verificar saúde dos containers
check_container_health() {
    local container_name=$1
    local max_attempts=${2:-15}
    local attempt=1
    
    print_color $YELLOW "🔍 Verificando container $container_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker ps --filter "name=$container_name" --filter "status=running" | grep -q "$container_name"; then
            print_color $GREEN "✅ Container $container_name está rodando"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_color $RED "❌ Container $container_name não está rodando"
    return 1
}

# Função para verificar espaço em disco
check_disk_space() {
    local required_gb=${1:-5}
    local available_gb=$(df . | awk 'NR==2 {print int($4/1048576)}')
    
    if [ "$available_gb" -lt "$required_gb" ]; then
        print_color $RED "❌ Espaço insuficiente em disco: ${available_gb}GB disponível, ${required_gb}GB necessário"
        return 1
    fi
    
    print_color $GREEN "✅ Espaço em disco suficiente: ${available_gb}GB disponível"
    return 0
}

# Função para verificar RAM disponível
check_memory() {
    local required_mb=${1:-2048}
    local available_mb=$(free -m | awk 'NR==2{print $7}')
    
    if [ "$available_mb" -lt "$required_mb" ]; then
        print_color $YELLOW "⚠️ RAM disponível baixa: ${available_mb}MB disponível, ${required_mb}MB recomendado"
    else
        print_color $GREEN "✅ RAM suficiente: ${available_mb}MB disponível"
    fi
}

# Função para mostrar logs de um container
show_container_logs() {
    local container_name=$1
    local lines=${2:-50}
    
    print_color $YELLOW "📋 Últimas $lines linhas do log de $container_name:"
    docker logs --tail="$lines" "$container_name" 2>&1 || echo "Container não encontrado"
}

# Função para verificar se arquivo tem line endings corretos
check_line_endings() {
    local file=$1
    if command_exists file && file "$file" | grep -q "CRLF"; then
        print_color $YELLOW "⚠️ Arquivo $file tem line endings CRLF, convertendo para LF..."
        sed -i 's/\r$//' "$file"
        return 1
    fi
    return 0
}

# Função para aguardar input do usuário
wait_for_user() {
    local message=${1:-"Pressione Enter para continuar..."}
    print_color $CYAN "$message"
    read -r
}

# Função para confirmar ação
confirm_action() {
    local message=${1:-"Deseja continuar?"}
    print_color $YELLOW "$message (y/N): "
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY]) return 0 ;;
        *) return 1 ;;
    esac
}
