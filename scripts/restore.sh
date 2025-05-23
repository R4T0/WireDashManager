
#!/bin/bash

# Script de restauração para WireDash Self-Hosted

if [ -z "$1" ]; then
    echo "❌ Uso: $0 <caminho_do_backup>"
    echo "Exemplo: $0 ./backups/wiredash_backup_20240120_143000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Iniciando restauração do WireDash..."
echo "📁 Arquivo: $BACKUP_FILE"

# Confirmar ação
read -p "⚠️ Esta ação irá sobrescrever os dados atuais. Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

# Parar a aplicação
echo "🛑 Parando aplicação..."
docker-compose -f docker-compose.local.yml stop wiredash-app

# Verificar se o arquivo está compactado
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "🗜️ Descompactando backup..."
    gunzip -c "$BACKUP_FILE" | docker exec -i wiredash-postgres psql -U postgres -d wireguard_manager
else
    echo "📥 Restaurando backup..."
    cat "$BACKUP_FILE" | docker exec -i wiredash-postgres psql -U postgres -d wireguard_manager
fi

if [ $? -eq 0 ]; then
    echo "✅ Backup restaurado com sucesso!"
    
    # Reiniciar aplicação
    echo "🚀 Reiniciando aplicação..."
    docker-compose -f docker-compose.local.yml start wiredash-app
    
    echo "✅ Restauração concluída!"
else
    echo "❌ Erro ao restaurar backup"
    
    # Reiniciar aplicação mesmo com erro
    echo "🚀 Reiniciando aplicação..."
    docker-compose -f docker-compose.local.yml start wiredash-app
    
    exit 1
fi
