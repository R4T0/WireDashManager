
@echo off
echo 🔧 Iniciando PostgreSQL para desenvolvimento
echo ===========================================

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker não está instalado. Instale o Docker primeiro.
    echo 📖 Visite: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Parar containers existentes
echo 🛑 Parando containers existentes...
docker-compose -f docker-compose.dev.yml down

REM Iniciar PostgreSQL
echo 🗄️  Iniciando PostgreSQL...
docker-compose -f docker-compose.dev.yml up -d

REM Aguardar PostgreSQL ficar pronto
echo ⏳ Aguardando PostgreSQL ficar pronto...
timeout /t 5 /nobreak > nul

echo ✅ PostgreSQL está rodando!
echo.
echo 🗄️  PostgreSQL disponível em: localhost:5432
echo    Usuário: postgres
echo    Senha: postgres
echo    Database: wireguard_manager
echo.
echo 📝 Configure seu .env.local com:
echo    VITE_USE_LOCAL_SUPABASE=true
echo.
echo 🚀 Agora execute: npm run dev
echo.
echo 📋 Comandos úteis:
echo    Parar: docker-compose -f docker-compose.dev.yml down
echo    Logs: docker-compose -f docker-compose.dev.yml logs -f

pause
