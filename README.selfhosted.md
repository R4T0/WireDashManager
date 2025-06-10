
# WireDash - Guia Completo Self-Hosted

Sistema completo de gerenciamento WireGuard com PostgreSQL local, API backend e interface web moderna.

## 📋 Visão Geral da Arquitetura

O WireDash Self-Hosted é composto por três serviços principais:

### 🌐 Frontend (Nginx + React SPA)
- **Porta**: 8080
- **Tecnologia**: React + Vite + TypeScript + Tailwind CSS
- **Servidor**: Nginx
- **Função**: Interface web responsiva para gerenciamento

### ⚙️ Backend API (Bun + Node.js)
- **Porta**: 3000
- **Tecnologia**: Bun runtime + TypeScript
- **Função**: API REST para comunicação com Mikrotik e gerenciamento de dados
- **Endpoints**: `/api/*`, `/health`

### 🗄️ Banco de Dados (PostgreSQL)
- **Porta**: 5432
- **Versão**: PostgreSQL 16
- **Função**: Armazenamento persistente de configurações e dados
- **Schemas**: Configurações Mikrotik, padrões WireGuard, usuários do sistema

## 🚀 Deploy Rápido

### Linux/macOS
```bash
# Clone o repositório
git clone <URL_DO_REPOSITÓRIO>
cd wiredash

# Dar permissão e executar
chmod +x deploy-selfhosted.sh
./deploy-selfhosted.sh
```

### Windows
```cmd
# Execute o script batch
deploy-selfhosted.bat
```

## 📋 Pré-requisitos Detalhados

### Software Obrigatório
- **Docker**: v20.10+ ([Install Guide](https://docs.docker.com/get-docker/))
- **Docker Compose**: v2.0+ ([Install Guide](https://docs.docker.com/compose/install/))
- **Git**: Para clonar o repositório

### Recursos de Sistema
- **CPU**: 2 cores (mínimo) / 4 cores (recomendado)
- **RAM**: 2GB livres (mínimo) / 4GB (recomendado)
- **Armazenamento**: 10GB livres (mínimo) / 20GB (recomendado)
- **Rede**: Conexão com internet para download das imagens Docker

### Portas Necessárias
- **8080**: Frontend web
- **3000**: Backend API  
- **5432**: PostgreSQL

## 🔧 Configuração Detalhada

### Variáveis de Ambiente (.env)

O sistema utiliza as seguintes configurações:

```bash
# Configuração da Aplicação
NODE_ENV=production
VITE_USE_LOCAL_SUPABASE=false
VITE_SELF_HOSTED=true
VITE_API_URL=http://localhost:3000

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=wireguard_manager
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/wireguard_manager

# Segurança (ALTERE EM PRODUÇÃO!)
JWT_SECRET=wiredash-jwt-secret-change-in-production
SESSION_SECRET=wiredash-session-secret-change-in-production

# Sistema
TZ=America/Sao_Paulo
PGTZ=America/Sao_Paulo
```

### Personalização de Portas

Edite `docker-compose.yml` para alterar portas:

```yaml
services:
  wiredash-app:
    ports:
      - "3000:80"  # Mudar frontend de 8080 para 3000
  
  wiredash-backend:
    ports:
      - "4000:3000"  # Mudar backend de 3000 para 4000
  
  postgres:
    ports:
      - "5433:5432"  # Mudar PostgreSQL de 5432 para 5433
```

## 🏗️ Arquitetura dos Serviços

### Frontend (wiredash-app)
```
┌─────────────────────────────────────┐
│             Nginx Proxy             │
├─────────────────────────────────────┤
│  ├─ / → React SPA (index.html)      │
│  ├─ /api/* → Proxy para Backend     │
│  ├─ /health → Health Check Backend  │
│  └─ /assets/* → Static Assets       │
└─────────────────────────────────────┘
```

### Backend (wiredash-backend)
```
┌─────────────────────────────────────┐
│          Bun Runtime API            │
├─────────────────────────────────────┤
│  ├─ /health → Health Check          │
│  ├─ /api/mikrotik → Mikrotik API     │
│  ├─ /api/wireguard → WG Management  │
│  └─ /api/auth → Authentication      │
└─────────────────────────────────────┘
```

### Database (postgres)
```
┌─────────────────────────────────────┐
│         PostgreSQL 16               │
├─────────────────────────────────────┤
│  ├─ mikrotik_config                 │
│  ├─ wireguard_defaults              │
│  ├─ system_users                    │
│  └─ init-db.sql (auto setup)        │
└─────────────────────────────────────┘
```

## 📊 Gerenciamento dos Serviços

### Comandos Básicos

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Verificar status
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de serviço específico
docker-compose logs -f wiredash-app
docker-compose logs -f wiredash-backend
docker-compose logs -f postgres

# Reiniciar serviços
docker-compose restart

# Reiniciar serviço específico
docker-compose restart wiredash-backend
```

### Comandos de Build

```bash
# Rebuild completo
docker-compose build --no-cache
docker-compose up -d

# Rebuild apenas frontend
docker-compose build wiredash-app
docker-compose up -d wiredash-app

# Rebuild apenas backend
docker-compose build wiredash-backend
docker-compose up -d wiredash-backend
```

## 🗄️ Gerenciamento do Banco de Dados

### Acesso Direto ao PostgreSQL

```bash
# Via Docker (recomendado)
docker exec -it wiredash-postgres psql -U postgres -d wireguard_manager

# Via cliente local (se PostgreSQL instalado)
psql -h localhost -U postgres -d wireguard_manager

# Executar comando SQL direto
docker exec wiredash-postgres psql -U postgres -d wireguard_manager -c "SELECT * FROM mikrotik_config;"
```

### Schema do Banco de Dados

#### Tabela: mikrotik_config
```sql
CREATE TABLE mikrotik_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,           -- IP/hostname do Mikrotik
  port TEXT NOT NULL,              -- Porta da API
  username TEXT NOT NULL,          -- Usuário do Mikrotik
  password TEXT NOT NULL,          -- Senha do Mikrotik
  use_https BOOLEAN DEFAULT FALSE, -- Usar HTTPS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: wireguard_defaults
```sql
CREATE TABLE wireguard_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT,                        -- Endpoint público
  port TEXT DEFAULT '51820',            -- Porta WireGuard
  dns TEXT DEFAULT '1.1.1.1',          -- Servidor DNS
  allowed_ip_range TEXT DEFAULT '10.0.0.0/24', -- Range de IPs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: system_users
```sql
CREATE TABLE system_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,          -- Email do usuário
  password_hash TEXT NOT NULL,         -- Hash da senha
  is_admin BOOLEAN DEFAULT FALSE,      -- Se é administrador
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Migrações e Backup

#### Backup Automático
```bash
# Executar backup
./backup.sh

# O script salva em: ./backups/wiredash_backup_YYYYMMDD_HHMMSS.sql
# Mantém automaticamente os 10 backups mais recentes
```

#### Backup Manual
```bash
# Fazer backup completo
docker exec -t wiredash-postgres pg_dump -U postgres wireguard_manager > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas estrutura
docker exec -t wiredash-postgres pg_dump -U postgres -s wireguard_manager > schema_backup.sql

# Backup apenas dados
docker exec -t wiredash-postgres pg_dump -U postgres -a wireguard_manager > data_backup.sql
```

#### Restore de Backup
```bash
# Usar script automático (recomendado)
./restore.sh backup_20240101_120000.sql

# Restore manual
cat backup.sql | docker exec -i wiredash-postgres psql -U postgres -d wireguard_manager

# Restore com recriação do banco
docker exec -i wiredash-postgres psql -U postgres -c "DROP DATABASE IF EXISTS wireguard_manager;"
docker exec -i wiredash-postgres psql -U postgres -c "CREATE DATABASE wireguard_manager;"
cat backup.sql | docker exec -i wiredash-postgres psql -U postgres -d wireguard_manager
```

## 🔒 Segurança e Produção

### Configurações Obrigatórias para Produção

1. **Alterar Senhas Padrão**:
```bash
# Gerar senhas seguras
openssl rand -base64 32  # Para JWT_SECRET
openssl rand -base64 32  # Para SESSION_SECRET
openssl rand -base64 16  # Para POSTGRES_PASSWORD

# Editar .env com as novas senhas
nano .env
```

2. **Configurar HTTPS** (nginx SSL):
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}
```

3. **Firewall**:
```bash
# Ubuntu/Debian
sudo ufw allow 8080/tcp
sudo ufw allow 3000/tcp
sudo ufw deny 5432/tcp  # PostgreSQL apenas local
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

4. **Backup Automático**:
```bash
# Adicionar ao crontab
crontab -e

# Backup diário às 2h da manhã
0 2 * * * /path/to/wiredash/backup.sh

# Backup a cada 6 horas
0 */6 * * * /path/to/wiredash/backup.sh
```

### Monitoramento e Logs

#### Health Checks
```bash
# Verificar saúde da aplicação
curl http://localhost:8080/

# Verificar saúde da API
curl http://localhost:3000/health

# Verificar PostgreSQL
docker exec wiredash-postgres pg_isready -U postgres
```

#### Monitoramento de Recursos
```bash
# Uso de recursos pelos containers
docker stats

# Espaço em disco usado pelo Docker
docker system df

# Logs com filtro por tempo
docker-compose logs --since 1h

# Logs com filtro por nível
docker-compose logs | grep ERROR
```

#### Configuração de Log Rotation
```bash
# Configurar logrotate para logs do Docker
sudo nano /etc/logrotate.d/docker

# Conteúdo:
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size 10M
    missingok
    delaycompress
    copytruncate
}
```

## 🔧 Desenvolvimento e Customização

### Estrutura de Arquivos
```
wiredash/
├── deploy-selfhosted.sh          # Script principal de deploy
├── docker-compose.yml            # Configuração dos serviços
├── Dockerfile                    # Build do frontend
├── Dockerfile.backend            # Build do backend
├── docker-entrypoint.sh          # Entrypoint do frontend
├── docker-entrypoint-backend.sh  # Entrypoint do backend
├── nginx.conf                    # Configuração do Nginx
├── init-db.sql                   # Inicialização do banco
├── .env                          # Variáveis de ambiente
├── scripts/                      # Scripts de deploy modulares
│   ├── deploy-utils.sh           # Utilitários compartilhados
│   ├── check-prerequisites.sh    # Verificação de pré-requisitos
│   ├── prepare-environment.sh    # Preparação do ambiente
│   ├── build-images.sh           # Construção das imagens
│   ├── deploy-services.sh        # Deploy dos serviços
│   └── health-checks.sh          # Verificações de saúde
├── src/                          # Código fonte do frontend
├── backup.sh                     # Script de backup
├── restore.sh                    # Script de restore
└── README.selfhosted.md          # Esta documentação
```

### Desenvolvimento Local

#### Apenas Frontend (conectando ao backend em produção)
```bash
# Instalar dependências
npm install

# Configurar .env.local
echo "VITE_API_URL=http://localhost:3000" > .env.local

# Executar em modo desenvolvimento
npm run dev
```

#### Backend + PostgreSQL Local
```bash
# Iniciar apenas PostgreSQL
docker-compose up -d postgres

# Configurar backend local
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wireguard_manager"
export NODE_ENV=development

# Executar backend local
bun install
bun run dev
```

#### Desenvolvimento Completo
```bash
# Usar configuração de desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Executar frontend em modo dev
npm run dev

# O PostgreSQL estará disponível em localhost:5432
```

### Customização de Configurações

#### Alterar Configurações do Nginx
```bash
# Editar configuração
nano nginx.conf

# Rebuild apenas o frontend
docker-compose build wiredash-app
docker-compose up -d wiredash-app
```

#### Adicionar Middleware no Backend
```bash
# Editar Dockerfile.backend para incluir dependências
# Rebuild backend
docker-compose build wiredash-backend
docker-compose up -d wiredash-backend
```

#### Configurações Avançadas do PostgreSQL
```bash
# Criar arquivo de configuração customizada
echo "max_connections = 200" > postgresql.conf
echo "shared_buffers = 256MB" >> postgresql.conf

# Montar como volume no docker-compose.yml
volumes:
  - ./postgresql.conf:/etc/postgresql/postgresql.conf
```

## 🐛 Solução de Problemas

### Problemas Comuns

#### 1. Erro "exec format error"
```bash
# Problema: Line endings incorretos (CRLF)
# Solução:
find . -name "*.sh" -exec dos2unix {} \;
chmod +x scripts/*.sh
chmod +x *.sh
```

#### 2. Porta já em uso
```bash
# Verificar o que está usando a porta
sudo netstat -tulpn | grep :8080
# ou
sudo lsof -i :8080

# Parar o serviço conflitante ou alterar porta no docker-compose.yml
```

#### 3. Container não inicia
```bash
# Verificar logs detalhados
docker-compose logs --tail=50 wiredash-app

# Verificar configuração
docker-compose config

# Rebuild sem cache
docker-compose build --no-cache
```

#### 4. Banco de dados não conecta
```bash
# Verificar se PostgreSQL está rodando
docker exec wiredash-postgres pg_isready -U postgres

# Verificar logs do PostgreSQL
docker-compose logs postgres

# Testar conexão manual
docker exec -it wiredash-postgres psql -U postgres -d wireguard_manager
```

#### 5. Problemas de permissão
```bash
# Verificar permissões dos arquivos
ls -la scripts/
chmod +x scripts/*.sh

# Verificar permissões dos volumes
sudo chown -R $USER:$USER data/
```

#### 6. Erro de memória/recursos
```bash
# Verificar uso de recursos
docker stats
free -h
df -h

# Limpar sistema Docker
docker system prune -a
docker volume prune
```

### Debugging Avançado

#### Entrar nos Containers
```bash
# Frontend (Nginx)
docker exec -it wiredash-selfhosted sh

# Backend (Bun)
docker exec -it wiredash-backend bash

# PostgreSQL
docker exec -it wiredash-postgres bash
```

#### Verificar Configurações Internas
```bash
# Verificar variáveis de ambiente no container
docker exec wiredash-backend env | grep -E "(DATABASE|JWT|SESSION)"

# Verificar arquivos de configuração
docker exec wiredash-selfhosted cat /etc/nginx/nginx.conf

# Verificar estrutura de arquivos
docker exec wiredash-selfhosted ls -la /usr/share/nginx/html/
```

#### Reset Completo
```bash
# Parar tudo e limpar
docker-compose down -v --remove-orphans

# Remover imagens do projeto
docker rmi $(docker images -q "*wiredash*") 2>/dev/null || true

# Limpar sistema Docker
docker system prune -a -f

# Reinstalar do zero
./deploy-selfhosted.sh
```

## 📚 Recursos Adicionais

### Links Úteis
- **Docker Documentation**: https://docs.docker.com/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Bun Runtime**: https://bun.sh/docs

### Scripts de Manutenção

#### Atualizações do Sistema
```bash
# Atualizar código
git pull origin main

# Rebuild e restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verificar se tudo está funcionando
./scripts/health-checks.sh
```

#### Monitoramento Contínuo
```bash
# Script para monitoramento (salve como monitor.sh)
#!/bin/bash
while true; do
    echo "=== $(date) ==="
    docker-compose ps
    curl -s http://localhost:8080 > /dev/null && echo "Frontend: OK" || echo "Frontend: ERRO"
    curl -s http://localhost:3000/health > /dev/null && echo "Backend: OK" || echo "Backend: ERRO"
    docker exec wiredash-postgres pg_isready -U postgres > /dev/null && echo "Database: OK" || echo "Database: ERRO"
    echo ""
    sleep 60
done
```

### Integração com Ferramentas Externas

#### Prometheus Monitoring
```yaml
# Adicionar ao docker-compose.yml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

#### Backup para Cloud
```bash
# Exemplo para AWS S3
aws s3 cp backups/ s3://meu-bucket/wiredash-backups/ --recursive

# Exemplo para Google Cloud
gsutil -m cp -r backups/ gs://meu-bucket/wiredash-backups/
```

---

## 📝 Notas Importantes

- **Este sistema é totalmente self-hosted** - não depende de serviços externos
- **Autenticação é local** - não utiliza OAuth externo
- **Recomendado para uso corporativo** ou ambientes controlados
- **Configure HTTPS e backup** antes de usar em produção
- **Monitore recursos** regularmente para performance otimizada
- **Mantenha backups regulares** - dados são críticos

Para suporte adicional, consulte os logs detalhados e utilize os scripts de diagnóstico incluídos.
