
@echo off
setlocal enabledelayedexpansion

REM Script de backup para WireDash Self-Hosted (Windows)

set BACKUP_DIR=.\backups
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATE=!DATE: =0!
set BACKUP_FILE=wiredash_backup_!DATE!.sql

echo 🗄️ Iniciando backup do WireDash Self-Hosted...

REM Criar diretório de backup se não existir
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Verificar se PostgreSQL está rodando
docker ps --filter "name=wiredash-postgres" --filter "status=running" | find "wiredash-postgres" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Container PostgreSQL não está rodando
    echo Execute: docker-compose up -d
    pause
    exit /b 1
)

REM Fazer backup do banco de dados
echo 📦 Fazendo backup do banco de dados...
docker exec -t wiredash-postgres pg_dump -U postgres wireguard_manager > "%BACKUP_DIR%\%BACKUP_FILE%"
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backup criado com sucesso: %BACKUP_DIR%\%BACKUP_FILE%
    
    REM Mostrar tamanho do backup
    dir "%BACKUP_DIR%\%BACKUP_FILE%"
) else (
    echo ❌ Erro ao criar backup
    pause
    exit /b 1
)

echo ✅ Backup concluído!
pause
