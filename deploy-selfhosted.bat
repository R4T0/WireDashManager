
@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM WireDash Self-Hosted Deploy Script (Windows)
REM Script principal para deploy completo do WireDash em modo self-hosted
REM =============================================================================

echo 🚀 WireDash Self-Hosted Deploy
echo ==============================
echo.

REM =============================================================================
REM 1. VERIFICAÇÃO DE PRÉ-REQUISITOS
REM =============================================================================

echo 🔍 Verificando pré-requisitos...

REM Verificar Docker
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker não encontrado!
    echo Instale o Docker Desktop: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose não encontrado!
    echo Instale o Docker Compose: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

REM Verificar se Docker está rodando
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker não está rodando!
    echo Inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

echo ✅ Todos os pré-requisitos atendidos!

REM =============================================================================
REM 2. PREPARAÇÃO DO AMBIENTE
REM =============================================================================

echo.
echo 📁 Preparando ambiente...

REM Criar estrutura de diretórios
if not exist logs mkdir logs
if not exist backups mkdir backups
if not exist data mkdir data
if not exist data\postgres mkdir data\postgres
if not exist config mkdir config

REM Verificar arquivos essenciais
if not exist "docker-compose.yml" (
    echo ❌ Arquivo docker-compose.yml não encontrado!
    pause
    exit /b 1
)

if not exist "Dockerfile" (
    echo ❌ Dockerfile não encontrado!
    pause
    exit /b 1
)

REM Configurar variáveis de ambiente se não existir
if not exist ".env" (
    echo ⚙️ Criando arquivo .env...
    (
        echo # Configuração Self-Hosted WireDash
        echo VITE_USE_LOCAL_SUPABASE=false
        echo VITE_SELF_HOSTED=true
        echo NODE_ENV=production
        echo.
        echo # PostgreSQL Configuration
        echo POSTGRES_USER=postgres
        echo POSTGRES_PASSWORD=postgres
        echo POSTGRES_DB=wireguard_manager
    ) > .env
    echo ✅ Arquivo .env criado!
)

echo ✅ Ambiente preparado!

REM =============================================================================
REM 3. LIMPEZA DE INSTALAÇÕES ANTERIORES
REM =============================================================================

echo.
echo 🧹 Limpando instalações anteriores...

REM Parar containers existentes
echo Parando containers existentes...
docker-compose down >nul 2>&1

REM Parar containers com nomes específicos
docker stop wiredash-selfhosted wiredash-postgres >nul 2>&1
docker rm wiredash-selfhosted wiredash-postgres >nul 2>&1

REM Remover imagens antigas se existirem
docker rmi wiredash-local:latest >nul 2>&1

echo ✅ Limpeza concluída!

REM =============================================================================
REM 4. BUILD DA APLICAÇÃO
REM =============================================================================

echo.
echo 🔨 Construindo aplicação...

REM Build da imagem Docker
echo Construindo imagem Docker...
docker build -t wiredash-local:latest .
if %ERRORLEVEL% EQU 0 (
    echo ✅ Imagem construída com sucesso!
) else (
    echo ❌ Erro ao construir imagem Docker
    pause
    exit /b 1
)

REM =============================================================================
REM 5. DEPLOY DOS SERVIÇOS
REM =============================================================================

echo.
echo 🚀 Iniciando serviços...

REM Iniciar serviços em background
echo Iniciando containers...
docker-compose up -d
if %ERRORLEVEL% EQU 0 (
    echo ✅ Containers iniciados!
) else (
    echo ❌ Erro ao iniciar containers
    pause
    exit /b 1
)

REM =============================================================================
REM 6. VERIFICAÇÃO DE SAÚDE DOS SERVIÇOS
REM =============================================================================

echo.
echo 🔍 Verificando saúde dos serviços...

REM Aguardar serviços ficarem prontos
echo ⏳ Aguardando serviços ficarem prontos...
timeout /t 15 /nobreak > nul

REM Verificar PostgreSQL
echo Verificando PostgreSQL...
docker exec wiredash-postgres pg_isready -U postgres >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ PostgreSQL está funcionando!
) else (
    echo ❌ PostgreSQL não está respondendo
    docker-compose logs postgres
    pause
    exit /b 1
)

REM Verificar aplicação WireDash
echo Verificando aplicação WireDash...
curl -f http://localhost:8080 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ WireDash está funcionando!
) else (
    echo ⏳ Aguardando WireDash ficar disponível...
    timeout /t 10 /nobreak > nul
    curl -f http://localhost:8080 >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ WireDash está funcionando!
    ) else (
        echo ❌ WireDash não está respondendo
        docker-compose logs wiredash-app
        pause
        exit /b 1
    )
)

REM =============================================================================
REM 7. VERIFICAÇÃO FINAL E INFORMAÇÕES
REM =============================================================================

echo.
echo 📊 Status final dos serviços...
docker-compose ps

REM =============================================================================
REM 8. SUCESSO - INFORMAÇÕES FINAIS
REM =============================================================================

echo.
echo 🎉 DEPLOY CONCLUÍDO COM SUCESSO!
echo ================================
echo.
echo 🌐 Aplicação WireDash: http://localhost:8080
echo 🗄️  PostgreSQL: localhost:5432
echo    📋 Usuário: postgres
echo    🔐 Senha: postgres
echo    🗃️  Database: wireguard_manager
echo.
echo 📋 COMANDOS ÚTEIS:
echo    Parar:          docker-compose down
echo    Logs:           docker-compose logs -f
echo    Reiniciar:      docker-compose restart
echo    Status:         docker-compose ps
echo    Backup:         backup.bat
echo    Atualizar:      deploy-selfhosted.bat
echo.
echo 📁 DIRETÓRIOS:
echo    Logs:           .\logs\
echo    Backups:        .\backups\
echo    Dados:          .\data\
echo.
echo 🔧 CONFIGURAÇÃO:
echo    Ambiente:       Self-hosted (PostgreSQL local)
echo    Modo:           Produção
echo    Persistência:   Habilitada
echo.
echo ✅ Sistema pronto para uso!

REM Abrir browser automaticamente
choice /C YN /M "Deseja abrir a aplicação no browser"
if !errorlevel!==1 start http://localhost:8080

echo.
echo 🚀 WireDash Self-Hosted está rodando!
pause
