
# WireDash - Guia de Instalação Self-Hosted

Este guia explica como instalar e executar o WireDash em sua própria infraestrutura, sem depender de serviços externos como Supabase.

## 📋 Pré-requisitos

### Sistema Operacional
- Linux (Ubuntu 20.04+ recomendado)
- Windows 10/11 com WSL2
- macOS 10.15+

### Software Necessário
- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- Git (para clonar o repositório)

### Recursos de Hardware
- **CPU**: 2 cores (mínimo) / 4 cores (recomendado)
- **RAM**: 2GB (mínimo) / 4GB (recomendado)
- **Armazenamento**: 10GB livres (mínimo) / 20GB (recomendado)
- **Rede**: Conexão com internet para download inicial

## 🚀 Instalação Rápida

### 1. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITÓRIO>
cd wiredash
```

### 2. Executar Script de Instalação

**Linux/macOS:**
```bash
chmod +x scripts/start-selfhosted.sh
./scripts/start-selfhosted.sh
```

**Windows:**
```cmd
scripts\start-selfhosted.bat
```

### 3. Acessar a Aplicação

Após a instalação, acesse:
- **Aplicação Web**: http://localhost:8080
- **Banco de Dados**: localhost:5432

## 🔧 Instalação Manual

### 1. Configurar Ambiente

Certifique-se de que o Docker está rodando:
```bash
docker --version
docker-compose --version
```

### 2. Construir e Iniciar Serviços

```bash
# Construir imagens
docker-compose -f docker-compose.local.yml build

# Iniciar serviços
docker-compose -f docker-compose.local.yml up -d

# Verificar status
docker-compose -f docker-compose.local.yml ps
```

### 3. Verificar Logs

```bash
# Ver todos os logs
docker-compose -f docker-compose.local.yml logs

# Ver logs de um serviço específico
docker-compose -f docker-compose.local.yml logs wiredash-app
docker-compose -f docker-compose.local.yml logs postgres
```

## 🛠️ Configuração

### Variáveis de Ambiente

O sistema utiliza as seguintes configurações principais:

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `POSTGRES_USER` | Usuário do PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `postgres` |
| `POSTGRES_DB` | Nome do banco de dados | `wireguard_manager` |
| `NODE_ENV` | Ambiente da aplicação | `production` |

### Personalizar Configurações

1. **Alterar portas** - Edite `docker-compose.local.yml`:
```yaml
ports:
  - "3000:80"  # Mudar de 8080 para 3000
```

2. **Alterar credenciais do banco**:
```yaml
environment:
  POSTGRES_USER: meuusuario
  POSTGRES_PASSWORD: minhasenha
```

3. **Configurar SSL/HTTPS** - Edite `nginx.local.conf`:
```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

## 🗄️ Banco de Dados

### Acesso Direto ao PostgreSQL

```bash
# Via Docker
docker exec -it wiredash-postgres psql -U postgres -d wireguard_manager

# Via cliente local (se tiver PostgreSQL instalado)
psql -h localhost -U postgres -d wireguard_manager
```

### Backup e Restauração

**Fazer Backup:**
```bash
docker exec -t wiredash-postgres pg_dump -U postgres wireguard_manager > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restaurar Backup:**
```bash
cat backup.sql | docker exec -i wiredash-postgres psql -U postgres -d wireguard_manager
```

### Estrutura do Banco

O sistema cria automaticamente as seguintes tabelas:
- `mikrotik_config` - Configurações de conexão do Mikrotik
- `wireguard_defaults` - Configurações padrão do WireGuard
- `system_users` - Usuários do sistema (autenticação local)

## 🔒 Segurança

### Configurações Recomendadas

1. **Alterar senhas padrão**:
```bash
# Gerar senha segura
openssl rand -base64 32
```

2. **Configurar firewall**:
```bash
# Ubuntu/Debian
sudo ufw allow 8080/tcp
sudo ufw enable
```

3. **Usar HTTPS em produção**:
   - Configure certificados SSL
   - Use reverse proxy (nginx/apache)
   - Configure redirecionamento HTTP → HTTPS

### Backup de Segurança

Configure backups automáticos:
```bash
# Adicionar ao crontab
0 2 * * * /path/to/backup-script.sh
```

## 📊 Monitoramento

### Health Checks

O sistema inclui verificações de saúde:
```bash
# Verificar status da aplicação
curl http://localhost:8080/health

# Verificar status do banco
docker exec wiredash-postgres pg_isready -U postgres
```

### Logs

Localização dos logs:
- **Aplicação**: `docker-compose logs wiredash-app`
- **Banco de dados**: `docker-compose logs postgres`
- **Nginx**: Dentro do container em `/var/log/nginx/`

### Métricas de Recursos

```bash
# Uso de recursos dos containers
docker stats

# Espaço em disco
docker system df
```

## 🔧 Comandos Úteis

### Gerenciamento de Containers

```bash
# Parar todos os serviços
docker-compose -f docker-compose.local.yml down

# Reiniciar serviços
docker-compose -f docker-compose.local.yml restart

# Atualizar imagens
docker-compose -f docker-compose.local.yml pull
docker-compose -f docker-compose.local.yml up -d

# Limpar dados (CUIDADO!)
docker-compose -f docker-compose.local.yml down -v
```

### Manutenção

```bash
# Limpar imagens não utilizadas
docker image prune -f

# Limpar tudo (containers, redes, volumes)
docker system prune -a --volumes
```

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Porta já em uso**:
```bash
# Verificar o que está usando a porta
sudo netstat -tulpn | grep :8080
# ou
sudo lsof -i :8080
```

2. **Container não inicia**:
```bash
# Verificar logs detalhados
docker-compose -f docker-compose.local.yml logs --tail=50
```

3. **Banco de dados não conecta**:
```bash
# Verificar se PostgreSQL está rodando
docker exec wiredash-postgres pg_isready -U postgres
```

4. **Problemas de permissão**:
```bash
# Verificar permissões dos arquivos
ls -la scripts/
chmod +x scripts/*.sh
```

### Resetar Instalação

```bash
# Parar e remover tudo
docker-compose -f docker-compose.local.yml down -v --remove-orphans

# Remover imagens
docker rmi $(docker images -q "*wiredash*")

# Reinstalar
./scripts/start-selfhosted.sh
```

## 🔄 Atualizações

### Atualizar Sistema

```bash
# 1. Fazer backup
docker exec -t wiredash-postgres pg_dump -U postgres wireguard_manager > backup_pre_update.sql

# 2. Parar serviços
docker-compose -f docker-compose.local.yml down

# 3. Atualizar código
git pull origin main

# 4. Reconstruir e iniciar
docker-compose -f docker-compose.local.yml up --build -d
```

## 📞 Suporte

### Logs para Suporte

Se precisar de ajuda, colete estas informações:

```bash
# Informações do sistema
docker --version
docker-compose --version
uname -a

# Status dos containers
docker-compose -f docker-compose.local.yml ps

# Logs recentes
docker-compose -f docker-compose.local.yml logs --tail=100
```

### Recursos Adicionais

- **Documentação do Docker**: https://docs.docker.com/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Nginx**: https://nginx.org/en/docs/

---

## 📝 Notas Importantes

- Este modo self-hosted não inclui funcionalidades que dependem do Supabase
- A autenticação é local (não OAuth)
- Recomendado para ambientes corporativos ou de desenvolvimento
- Para produção, configure HTTPS e backup automático
- Monitore recursos do sistema regularmente

Para mais informações, consulte a documentação completa ou abra uma issue no repositório.
