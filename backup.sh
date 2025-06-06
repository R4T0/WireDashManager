
#!/bin/bash

# Script de backup para WireDash Self-Hosted

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="wiredash_backup_${DATE}.sql"

echo "🗄️ Iniciando backup do WireDash Self-Hosted..."

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Verificar se PostgreSQL está rodando
if ! docker ps --filter "name=wiredash-postgres" --filter "status=running" | grep -q "wiredash-postgres"; then
    echo "❌ Container PostgreSQL não está rodando"
    echo "Execute: docker-compose up -d"
    exit 1
fi

# Fazer backup do banco de dados
echo "📦 Fazendo backup do banco de dados..."
if docker exec -t wiredash-postgres pg_dump -U postgres wireguard_manager > "$BACKUP_DIR/$BACKUP_FILE"; then
    echo "✅ Backup criado com sucesso: $BACKUP_DIR/$BACKUP_FILE"
    
    # Compactar backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "🗜️ Backup compactado: $BACKUP_DIR/${BACKUP_FILE}.gz"
    
    # Remover backups antigos (manter apenas os últimos 7 dias)
    find "$BACKUP_DIR" -name "wiredash_backup_*.sql.gz" -mtime +7 -delete
    echo "🧹 Backups antigos removidos"
    
    # Mostrar tamanho do backup
    ls -lh "$BACKUP_DIR/${BACKUP_FILE}.gz"
else
    echo "❌ Erro ao criar backup"
    exit 1
fi

echo "✅ Backup concluído!"
