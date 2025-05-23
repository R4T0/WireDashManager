
@echo off
echo 🚀 Iniciando build do WireDash...

REM Build da imagem Docker
echo 📦 Construindo imagem Docker...
docker build -t wiredash:latest .

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build concluído com sucesso!
    echo 🔧 Para rodar em produção, execute:
    echo    docker-compose -f docker-compose.prod.yml up -d
    echo.
    echo 🔧 Para rodar apenas a aplicação:
    echo    docker run -p 8080:80 wiredash:latest
    pause
) else (
    echo ❌ Erro no build da imagem Docker
    pause
    exit /b 1
)
