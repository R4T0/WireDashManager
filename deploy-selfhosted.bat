
@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM WireDash Self-Hosted Deploy Script (Windows)
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
REM 2. LIMPEZA DE INSTALAÇÕES ANTERIORES
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
REM 3. BUILD DA APLICAÇÃO
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
    echo Verificando logs de build...
    docker build -t wiredash-local:latest . --no-cache
    pause
    exit /b 1
)

REM =============================================================================
REM 4. DEPLOY DOS SERVIÇOS
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
    echo Verificando logs...
    docker-compose logs
    pause
    exit /b 1
)

REM =============================================================================
REM 5. VERIFICAÇÃO DE SAÚDE DOS SERVIÇOS
REM =============================================================================

echo.
echo 🔍 Verificando saúde dos serviços...

REM Aguardar serviços ficarem prontos
echo ⏳ Aguardando serviços ficarem prontos...
timeout /t 10 /nobreak > nul

REM Verificar PostgreSQL
echo Verificando PostgreSQL...
for /l %%i in (1,1,30) do (
    docker exec wiredash-postgres pg_isready -U postgres >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ PostgreSQL está funcionando!
        goto :postgres_ready
    )
    echo ⏳ Aguardando PostgreSQL... (%%i/30^)
    timeout /t 2 /nobreak > nul
)
echo ❌ PostgreSQL não está respondendo
docker-compose logs postgres
pause
exit /b 1

:postgres_ready

REM Verificar aplicação WireDash
echo Verificando aplicação WireDash...
for /l %%i in (1,1,30) do (
    curl -f http://localhost:8080 >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ WireDash está funcionando!
        goto :wiredash_ready
    )
    echo ⏳ Aguardando WireDash... (%%i/30^)
    timeout /t 2 /nobreak > nul
)
echo ❌ WireDash não está respondendo
echo Verificando logs do container...
docker logs wiredash-selfhosted
pause
exit /b 1

:wiredash_ready

REM =============================================================================
REM 6. VERIFICAÇÃO FINAL
REM =============================================================================

echo.
echo 📊 Status final dos serviços...
docker-compose ps

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
echo.
echo ✅ Sistema pronto para uso!

REM Abrir browser automaticamente
choice /C YN /M "Deseja abrir a aplicação no browser"
if !errorlevel!==1 start http://localhost:8080

echo.
echo 🚀 WireDash Self-Hosted está rodando!
pause
