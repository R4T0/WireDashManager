
#!/bin/bash

# =============================================================================
# WireDash Self-Hosted Deploy Script
# Script principal para deploy completo do WireDash em modo self-hosted
# =============================================================================

set -e  # Parar em caso de erro

# Carregar utilitários
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/deploy-utils.sh"

print_color $PURPLE "🚀 WireDash Self-Hosted Deploy"
print_color $PURPLE "=============================="
echo ""

# =============================================================================
# EXECUÇÃO DOS SCRIPTS DE DEPLOY
# =============================================================================

# 1. Verificação de pré-requisitos
if ! "$SCRIPT_DIR/scripts/check-prerequisites.sh"; then
    exit 1
fi

# 2. Preparação do ambiente
if ! "$SCRIPT_DIR/scripts/prepare-environment.sh"; then
    exit 1
fi

# 3. Limpeza e build das imagens
if ! "$SCRIPT_DIR/scripts/build-images.sh"; then
    exit 1
fi

# 4. Deploy dos serviços
if ! "$SCRIPT_DIR/scripts/deploy-services.sh"; then
    exit 1
fi

# 5. Verificação de saúde e informações finais
if ! "$SCRIPT_DIR/scripts/health-checks.sh"; then
    exit 1
fi

print_color $GREEN "🚀 WireDash Self-Hosted está rodando!"
