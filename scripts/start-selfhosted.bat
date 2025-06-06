
@echo off
echo 🏠 Iniciando WireDash em modo SELF-HOSTED
echo ========================================

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker não está instalado. Instale o Docker primeiro.
    echo 📖 Visite: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Verificar se Docker Compose está instalado
docker-compose --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose não está instalado. Instale o Docker Compose primeiro.
    echo 📖 Visite: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

REM Verificar se a imagem local existe
docker image inspect wiredash-local:latest >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Imagem local não encontrada. Construindo...
    call scripts\build-local.bat
)

REM Criar diretórios necessários
if not exist logs mkdir logs

REM Parar containers existentes
echo 🛑 Parando containers existentes...
docker-compose -f docker-compose.selfhosted.yml down

REM Iniciar serviços
echo 🚀 Iniciando serviços...
docker-compose -f docker-compose.selfhosted.yml up -d

REM Aguardar serviços ficarem prontos
echo ⏳ Aguardando serviços ficarem prontos...
timeout /t 10 /nobreak > nul

REM Verificar status dos serviços
echo 📊 Verificando status dos serviços...
docker-compose -f docker-compose.selfhosted.yml ps

echo ✅ WireDash está rodando em modo SELF-HOSTED!
echo.
echo 🌐 Acesse a aplicação em: http://localhost:8080
echo 🗄️  PostgreSQL disponível em: localhost:5432
echo    Usuário: postgres
echo    Senha: postgres
echo    Database: wireguard_manager
echo.
echo 📋 Comandos úteis:
echo    Parar: docker-compose -f docker-compose.selfhosted.yml down
echo    Logs: docker-compose -f docker-compose.selfhosted.yml logs -f
echo    Reiniciar: docker-compose -f docker-compose.selfhosted.yml restart

pause
