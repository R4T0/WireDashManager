
#!/bin/bash

# Este script inicializa o banco de dados PostgreSQL local

echo "Iniciando o PostgreSQL com Docker..."
docker compose up -d

echo "Aguardando o PostgreSQL ficar pronto..."
sleep 5

echo "Verificando se o banco de dados já está inicializado..."
TABLES=$(docker exec -it wiredash-postgres-1 psql -U postgres -d wireguard_manager -c "\dt" 2>/dev/null)

if [ $? -ne 0 ] || [[ ! $TABLES =~ "mikrotik_config" ]]; then
  echo "Inicializando o banco de dados..."
  docker exec -i wiredash-postgres-1 psql -U postgres -d wireguard_manager < init-db.sql
  echo "Banco de dados inicializado com sucesso!"
else
  echo "O banco de dados já está inicializado."
fi

echo "Configuração concluída!"
echo "Para acessar o PostgreSQL: psql -h localhost -U postgres -d wireguard_manager"
echo "Senha: postgres"
