
#!/bin/bash

# =============================================================================
# WireDash Environment Preparation
# Prepara o ambiente para o deploy (diretórios, configurações, etc.)
# =============================================================================

# Carregar utilitários
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/deploy-utils.sh"

prepare_environment() {
    print_header "Preparação do Ambiente"

    # Criar estrutura de diretórios
    print_color $BLUE "📁 Criando estrutura de diretórios..."
    mkdir -p {logs,backups,data/postgres,data/uploads}
    print_color $GREEN "✅ Diretórios criados"

    # Configurar permissões dos diretórios
    print_color $BLUE "🔒 Configurando permissões..."
    chmod 755 logs backups data
    chmod 700 data/postgres  # PostgreSQL precisa de permissões restritas
    print_color $GREEN "✅ Permissões configuradas"

    # Verificar e corrigir line endings em scripts
    print_color $BLUE "🔧 Verificando scripts..."
    find scripts/ -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
    find . -name "docker-entrypoint*.sh" -exec chmod +x {} \; 2>/dev/null || true
    
    # Corrigir line endings
    for script in scripts/*.sh docker-entrypoint*.sh; do
        if [ -f "$script" ]; then
            check_line_endings "$script"
            chmod +x "$script"
        fi
    done
    print_color $GREEN "✅ Scripts verificados e corrigidos"

    # Configurar arquivo .env se não existir
    print_color $BLUE "⚙️ Configurando variáveis de ambiente..."
    if [ ! -f ".env" ]; then
        if [ -f ".env.selfhosted.example" ]; then
            cp .env.selfhosted.example .env
            print_color $GREEN "✅ Arquivo .env criado a partir do exemplo"
        else
            # Criar .env básico
            cat > .env << 'EOF'
# Configuração WireDash Self-Hosted
NODE_ENV=production
VITE_USE_LOCAL_SUPABASE=false
VITE_SELF_HOSTED=true
VITE_API_URL=http://localhost:3000

# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=wireguard_manager
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/wireguard_manager

# Segurança (ALTERE EM PRODUÇÃO!)
JWT_SECRET=wiredash-jwt-secret-change-in-production
SESSION_SECRET=wiredash-session-secret-change-in-production

# Configurações do Sistema
TZ=America/Sao_Paulo
PGTZ=America/Sao_Paulo
EOF
            print_color $GREEN "✅ Arquivo .env criado com configurações padrão"
        fi
    else
        print_color $GREEN "✅ Arquivo .env já existe"
    fi

    # Verificar configurações do .env
    print_color $BLUE "🔍 Verificando configurações..."
    if grep -q "change-in-production" .env; then
        print_color $YELLOW "⚠️ Detectadas configurações padrão no .env"
        echo "IMPORTANTE: Altere as seguintes configurações antes de usar em produção:"
        echo "- JWT_SECRET"
        echo "- SESSION_SECRET"
        echo "- POSTGRES_PASSWORD"
    fi

    # Criar arquivo de backup automático
    print_color $BLUE "💾 Configurando backup automático..."
    cat > backup.sh << 'EOF'
#!/bin/bash
# Script de backup automático do WireDash

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wiredash_backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "🗄️ Fazendo backup do banco de dados..."
if docker exec wiredash-postgres pg_dump -U postgres wireguard_manager > "$BACKUP_FILE"; then
    echo "✅ Backup salvo em: $BACKUP_FILE"
    
    # Manter apenas os 10 backups mais recentes
    ls -t "$BACKUP_DIR"/wiredash_backup_*.sql | tail -n +11 | xargs -r rm
    echo "🧹 Backups antigos removidos (mantidos os 10 mais recentes)"
else
    echo "❌ Erro ao fazer backup"
    exit 1
fi
EOF
    chmod +x backup.sh
    print_color $GREEN "✅ Script de backup criado"

    # Criar script de restore
    print_color $BLUE "🔄 Criando script de restore..."
    cat > restore.sh << 'EOF'
#!/bin/bash
# Script de restore do WireDash

if [ $# -eq 0 ]; then
    echo "Uso: $0 <arquivo_backup.sql>"
    echo "Backups disponíveis:"
    ls -la backups/wiredash_backup_*.sql 2>/dev/null || echo "Nenhum backup encontrado"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restaurando backup: $BACKUP_FILE"
echo "⚠️ ATENÇÃO: Isso irá substituir todos os dados atuais!"
read -p "Deseja continuar? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if cat "$BACKUP_FILE" | docker exec -i wiredash-postgres psql -U postgres -d wireguard_manager; then
        echo "✅ Backup restaurado com sucesso!"
    else
        echo "❌ Erro ao restaurar backup"
        exit 1
    fi
else
    echo "Operação cancelada"
fi
EOF
    chmod +x restore.sh
    print_color $GREEN "✅ Script de restore criado"

    print_color $GREEN "🎉 Ambiente preparado com sucesso!"
    return 0
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    prepare_environment
fi
