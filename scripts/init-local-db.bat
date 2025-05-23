
@echo off
echo Iniciando o PostgreSQL com Docker...
docker compose up -d

echo Aguardando o PostgreSQL ficar pronto...
timeout /t 5 /nobreak > nul

echo Inicializando o banco de dados...
docker exec -i wiredash-postgres-1 psql -U postgres -d wireguard_manager < init-db.sql

echo Configuração concluída!
echo Para acessar o PostgreSQL: psql -h localhost -U postgres -d wireguard_manager
echo Senha: postgres
timeout /t 10
