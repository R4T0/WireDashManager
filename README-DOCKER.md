
# WireDash - Guia de Configuração Docker

Este documento explica como usar os diferentes arquivos de configuração Docker do WireDash.

## 📋 Visão Geral dos Arquivos

### Arquivos Docker Compose

| Arquivo | Propósito | Quando Usar |
|---------|-----------|-------------|
| `docker-compose.remote.yml` | Aplicação + Supabase remoto | Produção com Supabase na nuvem |
| `docker-compose.selfhosted.yml` | Aplicação + PostgreSQL local | Instalação completamente self-hosted |
| `docker-compose.dev.yml` | Apenas PostgreSQL | Desenvolvimento local |

### Scripts de Construção e Execução

| Script | Descrição |
|--------|-----------|
| `scripts/build-local.*` | Constrói a imagem Docker local |
| `scripts/start-remote.*` | Inicia com Supabase remoto |
| `scripts/start-selfhosted.*` | Inicia modo self-hosted completo |
| `scripts/start-dev.*` | Inicia apenas PostgreSQL para dev |

## 🚀 Como Usar

### 1. Para Desenvolvimento Local

```bash
# Iniciar apenas PostgreSQL
./scripts/start-dev.sh

# Configurar .env.local
echo "VITE_USE_LOCAL_SUPABASE=true" > .env.local

# Executar aplicação em modo desenvolvimento
npm run dev
```

### 2. Para Usar com Supabase Remoto

```bash
# Construir imagem e iniciar com Supabase remoto
./scripts/start-remote.sh
```

Acesse: http://localhost:8080

### 3. Para Instalação Self-Hosted Completa

```bash
# Construir e iniciar tudo localmente (app + banco)
./scripts/start-selfhosted.sh
```

Acesse: http://localhost:8080
PostgreSQL: localhost:5432 (postgres/postgres)

## 🔨 Construção Manual

### Construir Imagem Local

```bash
# Linux/macOS
./scripts/build-local.sh

# Windows
scripts\build-local.bat
```

### Executar Configurações Específicas

```bash
# Apenas com Supabase remoto
docker-compose -f docker-compose.remote.yml up -d

# Self-hosted completo
docker-compose -f docker-compose.selfhosted.yml up -d

# Apenas PostgreSQL para desenvolvimento
docker-compose -f docker-compose.dev.yml up -d
```

## 🛠️ Configurações de Ambiente

### Remote (Supabase na nuvem)
- `VITE_USE_LOCAL_SUPABASE=false`
- `VITE_SELF_HOSTED=false`

### Self-hosted (Tudo local)
- `VITE_USE_LOCAL_SUPABASE=false`
- `VITE_SELF_HOSTED=true`

### Development (PostgreSQL local + app em dev)
- `VITE_USE_LOCAL_SUPABASE=true`
- `VITE_SELF_HOSTED=false`

## 📝 Exemplos de Uso

### Desenvolvimento
```bash
./scripts/start-dev.sh
npm run dev
```

### Demonstração/Testes com Supabase
```bash
./scripts/start-remote.sh
```

### Produção Self-hosted
```bash
./scripts/start-selfhosted.sh
```

## 🔍 Solução de Problemas

### Imagem não encontrada
```bash
# Construir a imagem manualmente
docker build -t wiredash-local:latest .
```

### Conflitos de porta
```bash
# Verificar portas em uso
docker ps
netstat -tulpn | grep :8080
```

### Resetar tudo
```bash
# Parar todos os containers
docker-compose -f docker-compose.remote.yml down
docker-compose -f docker-compose.selfhosted.yml down
docker-compose -f docker-compose.dev.yml down

# Remover volumes (CUIDADO: apaga dados)
docker-compose -f docker-compose.selfhosted.yml down -v
```

## 📚 Recursos Adicionais

- **Logs**: `docker-compose -f <arquivo> logs -f`
- **Status**: `docker-compose -f <arquivo> ps`
- **Reiniciar**: `docker-compose -f <arquivo> restart`
- **Parar**: `docker-compose -f <arquivo> down`
