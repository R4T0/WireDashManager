
#!/bin/bash

# =============================================================================
# WireDash Self-Hosted Deploy Script
# Script principal para deploy completo do WireDash em modo self-hosted
# =============================================================================

set -euo pipefail  # Parar em caso de erro, variáveis não definidas

# Detectar diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Carregar utilitários
source "./scripts/deploy-utils.sh"

# Função de cleanup em caso de erro
cleanup_on_error() {
    print_color $RED "❌ Erro durante o deploy. Executando limpeza..."
    docker-compose down >/dev/null 2>&1 || true
    exit 1
}

# Trap para cleanup em caso de erro
trap cleanup_on_error ERR

print_color $PURPLE "🚀 WireDash Self-Hosted Deploy"
print_color $PURPLE "=============================="
echo ""

# =============================================================================
# EXECUÇÃO DOS SCRIPTS DE DEPLOY
# =============================================================================

# 1. Verificação de pré-requisitos
print_color $BLUE "📋 Etapa 1/5: Verificação de pré-requisitos"
if ! "./scripts/check-prerequisites.sh"; then
    exit 1
fi
echo ""

# 2. Preparação do ambiente
print_color $BLUE "⚙️ Etapa 2/5: Preparação do ambiente"
if ! "./scripts/prepare-environment.sh"; then
    exit 1
fi
echo ""

# 3. Limpeza e build das imagens
print_color $BLUE "🔨 Etapa 3/5: Construção das imagens"
if ! "./scripts/build-images.sh"; then
    exit 1
fi
echo ""

# 4. Deploy dos serviços
print_color $BLUE "🚀 Etapa 4/5: Deploy dos serviços"
if ! "./scripts/deploy-services.sh"; then
    exit 1
fi
echo ""

# 5. Verificação de saúde e informações finais
print_color $BLUE "🔍 Etapa 5/5: Verificação de saúde"
if ! "./scripts/health-checks.sh"; then
    exit 1
fi

print_color $GREEN "🎉 Deploy concluído com sucesso!"
print_color $GREEN "WireDash Self-Hosted está rodando em http://localhost:8080"
