
@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM WireDash Self-Hosted Deploy Script (Windows)
REM Script completo para deploy do WireDash em ambiente Windows
REM =============================================================================

echo 🚀 WireDash Self-Hosted Deploy (Windows)
echo ===============================================
echo.

REM =============================================================================
REM FUNÇÕES AUXILIARES
REM =============================================================================

:print_error
echo ❌ %~1
goto :eof

:print_success
echo ✅ %~1
goto :eof

:print_warning
echo ⚠️ %~1
goto :eof

:print_info
echo 📋 %~1
goto :eof

:check_command
where %1 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :print_error "%1 não encontrado!"
    exit /b 1
)
call :print_success "%1 encontrado"
exit /b 0

REM =============================================================================
REM 1. VERIFICAÇÃO DE PRÉ-REQUISITOS
REM =============================================================================

call :print_info "Etapa 1/5: Verificação de pré-requisitos"
echo.

REM Verificar Docker
echo 🔍 Verificando Docker...
call :check_command docker
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Instale o Docker Desktop para Windows:
    echo https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

REM Verificar Docker Compose
echo 🔍 Verificando Docker Compose...
call :check_command docker-compose
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Instale o Docker Compose:
    echo https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

REM Verificar se Docker está rodando
echo 🔍 Verificando se Docker está ativo...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :print_error "Docker não está rodando!"
    echo.
    echo Inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)
call :print_success "Docker está ativo"

REM Verificar recursos
echo 🔍 Verificando recursos do sistema...
for /f "tokens=4" %%a in ('dir /-c') do set free_space=%%a
call :print_info "Recursos verificados"

call :print_success "Todos os pré-requisitos atendidos!"
echo.

REM =============================================================================
REM 2. PREPARAÇÃO DO AMBIENTE
REM =============================================================================

call :print_info "Etapa 2/5: Preparação do ambiente"
echo.

REM Criar estrutura de diretórios
echo 📁 Criando estrutura de diretórios...
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups
if not exist "data" mkdir data
if not exist "data\postgres" mkdir data\postgres
call :print_success "Diretórios criados"

REM Verificar arquivos essenciais
echo 🔍 Verificando arquivos essenciais...
set "required_files=docker-compose.yml Dockerfile Dockerfile.backend package.json"
for %%f in (%required_files%) do (
    if not exist "%%f" (
        call :print_error "Arquivo obrigatório não encontrado: %%f"
        pause
        exit /b 1
    )
    call :print_success "Arquivo encontrado: %%f"
)

REM Configurar arquivo .env se não existir
echo ⚙️ Configurando variáveis de ambiente...
if not exist ".env" (
    if exist ".env.selfhosted.example" (
        copy ".env.selfhosted.example" ".env" >nul
        call :print_success "Arquivo .env criado a partir do exemplo"
    ) else (
        echo # Configuração WireDash Self-Hosted > .env
        echo NODE_ENV=production >> .env
        echo VITE_USE_LOCAL_SUPABASE=false >> .env
        echo VITE_SELF_HOSTED=true >> .env
        echo VITE_API_URL=http://localhost:3000 >> .env
        echo. >> .env
        echo # PostgreSQL Configuration >> .env
        echo POSTGRES_USER=postgres >> .env
        echo POSTGRES_PASSWORD=postgres >> .env
        echo POSTGRES_DB=wireguard_manager >> .env
        echo DATABASE_URL=postgresql://postgres:postgres@postgres:5432/wireguard_manager >> .env
        echo. >> .env
        echo # Segurança (ALTERE EM PRODUÇÃO!) >> .env
        echo JWT_SECRET=wiredash-jwt-secret-change-in-production >> .env
        echo SESSION_SECRET=wiredash-session-secret-change-in-production >> .env
        call :print_success "Arquivo .env criado com configurações padrão"
    )
) else (
    call :print_success "Arquivo .env já existe"
)

REM Criar script de backup
echo 💾 Criando script de backup...
echo @echo off > backup.bat
echo REM Script de backup do WireDash >> backup.bat
echo set BACKUP_DIR=.\backups >> backup.bat
echo set TIMESTAMP=%%date:~-4%%%%date:~3,2%%%%date:~0,2%%_%%time:~0,2%%%%time:~3,2%%%%time:~6,2%% >> backup.bat
echo set TIMESTAMP=%%TIMESTAMP: =0%% >> backup.bat
echo set BACKUP_FILE=%%BACKUP_DIR%%\wiredash_backup_%%TIMESTAMP%%.sql >> backup.bat
echo. >> backup.bat
echo if not exist "%%BACKUP_DIR%%" mkdir "%%BACKUP_DIR%%" >> backup.bat
echo. >> backup.bat
echo echo 🗄️ Fazendo backup do banco de dados... >> backup.bat
echo docker exec wiredash-postgres pg_dump -U postgres wireguard_manager ^> "%%BACKUP_FILE%%" >> backup.bat
echo if %%ERRORLEVEL%% EQU 0 ( >> backup.bat
echo     echo ✅ Backup salvo em: %%BACKUP_FILE%% >> backup.bat
echo ^) else ( >> backup.bat
echo     echo ❌ Erro ao fazer backup >> backup.bat
echo     exit /b 1 >> backup.bat
echo ^) >> backup.bat
call :print_success "Script de backup criado"

call :print_success "Ambiente preparado!"
echo.

REM =============================================================================
REM 3. LIMPEZA E BUILD DAS IMAGENS
REM =============================================================================

call :print_info "Etapa 3/5: Construção das imagens"
echo.

REM Limpeza de instalações anteriores
echo 🧹 Limpando instalações anteriores...
docker-compose down --remove-orphans >nul 2>&1

REM Parar containers específicos
set "containers=wiredash-selfhosted wiredash-app wiredash-backend wiredash-postgres"
for %%c in (%containers%) do (
    docker stop %%c >nul 2>&1
    docker rm %%c >nul 2>&1
)

REM Remover imagens antigas
docker rmi wiredash-local:latest >nul 2>&1
call :print_success "Limpeza concluída"

REM Build da imagem Frontend
echo 🔨 Construindo imagem Frontend...
docker build -t wiredash-local:latest .
if %ERRORLEVEL% EQU 0 (
    call :print_success "Imagem Frontend construída com sucesso!"
) else (
    call :print_error "Erro ao construir imagem Frontend"
    echo.
    echo 💡 Dicas para resolver:
    echo 1. Verifique se todos os arquivos necessários estão presentes
    echo 2. Verifique se há erros de sintaxe no código
    echo 3. Execute 'npm install' localmente para verificar dependências
    pause
    exit /b 1
)

call :print_success "Todas as imagens preparadas!"
echo.

REM =============================================================================
REM 4. DEPLOY DOS SERVIÇOS
REM =============================================================================

call :print_info "Etapa 4/5: Deploy dos serviços"
echo.

REM Iniciar PostgreSQL primeiro
echo 🗄️ Iniciando PostgreSQL...
docker-compose up -d postgres
if %ERRORLEVEL% EQU 0 (
    call :print_success "PostgreSQL container iniciado"
) else (
    call :print_error "Erro ao iniciar PostgreSQL"
    pause
    exit /b 1
)

REM Aguardar PostgreSQL ficar pronto
echo ⏳ Aguardando PostgreSQL aceitar conexões...
set /a attempt=1
:wait_postgres
if %attempt% GTR 30 (
    call :print_error "PostgreSQL não ficou pronto após 30 tentativas"
    docker-compose logs postgres
    pause
    exit /b 1
)
docker exec wiredash-postgres pg_isready -U postgres >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    call :print_success "PostgreSQL está aceitando conexões!"
    goto :postgres_ready
)
echo 🔄 Aguardando PostgreSQL... (%attempt%/30)
timeout /t 2 /nobreak >nul
set /a attempt+=1
goto :wait_postgres

:postgres_ready

REM Iniciar Backend
echo ⚙️ Iniciando Backend...
docker-compose up -d wiredash-backend
if %ERRORLEVEL% EQU 0 (
    call :print_success "Backend container iniciado"
) else (
    call :print_error "Erro ao iniciar Backend"
    pause
    exit /b 1
)

REM Aguardar Backend ficar pronto
echo ⏳ Aguardando Backend aceitar conexões...
set /a attempt=1
:wait_backend
if %attempt% GTR 45 (
    call :print_error "Backend não ficou pronto após 45 tentativas"
    docker-compose logs wiredash-backend
    pause
    exit /b 1
)
curl -f -s --max-time 5 "http://localhost:3000/health" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    call :print_success "Backend está aceitando conexões!"
    goto :backend_ready
)
echo 🔄 Aguardando Backend... (%attempt%/45)
timeout /t 2 /nobreak >nul
set /a attempt+=1
goto :wait_backend

:backend_ready

REM Iniciar Frontend
echo 🌐 Iniciando Frontend...
docker-compose up -d wiredash-app
if %ERRORLEVEL% EQU 0 (
    call :print_success "Frontend container iniciado"
) else (
    call :print_error "Erro ao iniciar Frontend"
    pause
    exit /b 1
)

REM Aguardar Frontend ficar pronto
echo ⏳ Aguardando Frontend aceitar conexões...
set /a attempt=1
:wait_frontend
if %attempt% GTR 30 (
    call :print_error "Frontend não ficou pronto após 30 tentativas"
    docker-compose logs wiredash-app
    pause
    exit /b 1
)
curl -f -s --max-time 5 "http://localhost:8080" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    call :print_success "Frontend está aceitando conexões!"
    goto :frontend_ready
)
echo 🔄 Aguardando Frontend... (%attempt%/30)
timeout /t 2 /nobreak >nul
set /a attempt+=1
goto :wait_frontend

:frontend_ready

call :print_success "Todos os serviços iniciados!"
echo.

REM =============================================================================
REM 5. VERIFICAÇÃO DE SAÚDE DOS SERVIÇOS
REM =============================================================================

call :print_info "Etapa 5/5: Verificação de saúde"
echo.

REM Verificar status dos containers
echo 📊 Status dos containers:
docker-compose ps
echo.

REM Testes de conectividade
echo 🔍 Verificando conectividade...

REM Teste PostgreSQL
docker exec wiredash-postgres pg_isready -U postgres >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    call :print_success "PostgreSQL: OK"
) else (
    call :print_error "PostgreSQL: ERRO"
)

REM Teste Backend
curl -f -s --max-time 10 "http://localhost:3000/health" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    call :print_success "Backend API: OK"
) else (
    call :print_error "Backend API: ERRO"
)

REM Teste Frontend
curl -f -s --max-time 10 "http://localhost:8080" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    call :print_success "Frontend: OK"
) else (
    call :print_error "Frontend: ERRO"
)

echo.

REM =============================================================================
REM 6. INFORMAÇÕES FINAIS
REM =============================================================================

call :print_success "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo ===================================================
echo.
echo 🌐 Aplicação WireDash: http://localhost:8080
echo ⚙️ API Backend: http://localhost:3000
echo 🗄️ PostgreSQL: localhost:5432
echo    📋 Usuário: postgres
echo    🔐 Senha: postgres  
echo    🗃️ Database: wireguard_manager
echo.
echo 📋 COMANDOS ÚTEIS:
echo    Parar:          docker-compose down
echo    Logs:           docker-compose logs -f
echo    Logs Backend:   docker-compose logs -f wiredash-backend
echo    Logs Frontend:  docker-compose logs -f wiredash-app  
echo    Logs Database:  docker-compose logs -f postgres
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
echo    Arquitetura:    Frontend (Nginx) + Backend (Bun) + PostgreSQL
echo    Persistência:   Habilitada
echo.

REM Mostrar recursos do sistema
echo 💻 Uso de recursos:
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>nul
echo.

call :print_success "✅ Sistema pronto para uso!"
echo.

REM Perguntar se quer abrir no browser
choice /C YN /M "Deseja abrir a aplicação no navegador"
if !errorlevel!==1 start http://localhost:8080

echo.
call :print_success "🚀 WireDash Self-Hosted está rodando!"
echo.
echo Pressione qualquer tecla para finalizar...
pause >nul
