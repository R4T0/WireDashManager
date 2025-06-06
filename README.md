
# WireDash - Self-Hosted

Sistema de gerenciamento WireGuard completamente self-hosted com PostgreSQL local.

## 🚀 Deploy Rápido

### Linux/macOS
```bash
chmod +x deploy-selfhosted.sh
./deploy-selfhosted.sh
```

### Windows
```cmd
deploy-selfhosted.bat
```

## 📋 Pré-requisitos

- Docker (v20.10+)
- Docker Compose (v2.0+)
- 2GB RAM livres
- 10GB espaço em disco

## 🔧 Configuração

O sistema está configurado para modo **self-hosted exclusivamente**:

- **Aplicação**: http://localhost:8080
- **PostgreSQL**: localhost:5432
  - Usuário: `postgres`
  - Senha: `postgres`
  - Database: `wireguard_manager`

## 📋 Comandos Úteis

```bash
# Deploy completo
./deploy-selfhosted.sh

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Fazer backup
./backup.sh

# Reiniciar
docker-compose restart

# Status
docker-compose ps
```

## 🗄️ Backup

Backup automático incluso:
```bash
./backup.sh    # Linux/macOS
backup.bat     # Windows
```

## 📁 Estrutura

```
wiredash/
├── deploy-selfhosted.sh    # Script principal de deploy
├── deploy-selfhosted.bat   # Script Windows
├── backup.sh              # Backup Linux/macOS
├── backup.bat             # Backup Windows
├── docker-compose.yml     # Configuração Docker
├── Dockerfile            # Build da aplicação
├── .env                  # Variáveis de ambiente
└── logs/                 # Logs do sistema
```

## 🔒 Segurança

Para produção, altere:
1. Senhas do PostgreSQL em `.env`
2. Configure HTTPS
3. Configure firewall
4. Backup automático

## 🆘 Solução de Problemas

1. **Porta ocupada**: Altere portas no `docker-compose.yml`
2. **Erro de memória**: Aumente RAM disponível
3. **Erro de permissão**: Execute como administrador/sudo

---

**Sistema configurado para uso self-hosted exclusivo com PostgreSQL local.**
