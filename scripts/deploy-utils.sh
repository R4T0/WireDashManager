
#!/bin/bash

# =============================================================================
# WireDash Deploy Utilities
# Shared functions for deploy scripts
# =============================================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_color() {
    printf "${1}${2}${NC}\n"
}

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para aguardar serviço ficar pronto
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_color $YELLOW "⏳ Aguardando $service_name ficar disponível..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" >/dev/null 2>&1; then
            print_color $GREEN "✅ $service_name está disponível!"
            return 0
        fi
        
        printf "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_color $RED "❌ Timeout aguardando $service_name"
    return 1
}

# Função para verificar saúde dos containers
check_container_health() {
    local container_name=$1
    local max_attempts=15
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker ps --filter "name=$container_name" --filter "status=running" | grep -q "$container_name"; then
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    return 1
}
