
@echo off
echo 🌐 Iniciando WireDash com Supabase REMOTO
echo ========================================

REM Verificar se a imagem local existe
docker image inspect wiredash-local:latest >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Imagem local não encontrada. Construindo...
    call scripts\build-local.bat
)

REM Parar containers existentes
echo 🛑 Parando containers existentes...
docker-compose -f docker-compose.remote.yml down

REM Iniciar serviços
echo 🚀 Iniciando serviços...
docker-compose -f docker-compose.remote.yml up -d

REM Aguardar serviços ficarem prontos
echo ⏳ Aguardando serviços ficarem prontos...
timeout /t 5 /nobreak > nul

echo ✅ WireDash está rodando com Supabase REMOTO!
echo.
echo 🌐 Acesse a aplicação em: http://localhost:8080
echo ☁️  Usando Supabase na nuvem
echo.
echo 📋 Comandos úteis:
echo    Parar: docker-compose -f docker-compose.remote.yml down
echo    Logs: docker-compose -f docker-compose.remote.yml logs -f

pause
