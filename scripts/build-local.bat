
@echo off
echo 🔨 Construindo imagem Docker local do WireDash...
echo ================================================

REM Construir a imagem local
docker build -t wiredash-local:latest .

if %ERRORLEVEL% EQU 0 (
    echo ✅ Imagem construída com sucesso!
    echo.
    echo 🚀 Próximos passos:
    echo.
    echo 📝 Para usar com Supabase REMOTO:
    echo    docker-compose -f docker-compose.remote.yml up -d
    echo.
    echo 🏠 Para usar modo SELF-HOSTED completo:
    echo    docker-compose -f docker-compose.selfhosted.yml up -d
    echo.
    echo 🔧 Para desenvolvimento (apenas PostgreSQL):
    echo    docker-compose -f docker-compose.dev.yml up -d
    pause
) else (
    echo ❌ Erro ao construir a imagem Docker
    pause
    exit /b 1
)
