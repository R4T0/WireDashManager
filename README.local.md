
# WireDash - Configuração Local com Docker

Este documento contém instruções para configurar e executar o WireDash em ambiente local usando Docker e PostgreSQL.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/) (geralmente incluído no Docker Desktop)
- [Git](https://git-scm.com/downloads) (para clonar o repositório)

## Passos para Instalação

### 1. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITÓRIO>
cd wiredash
```

### 2. Configurar o Ambiente Local

#### Iniciar o PostgreSQL com Docker

O projeto já inclui um arquivo `docker-compose.yml` configurado com PostgreSQL. Para iniciar o banco de dados:

```bash
docker compose up -d
```

Este comando irá:

- Iniciar um container PostgreSQL na porta 5432
- Criar o banco de dados 'wireguard_manager'
- Executar automaticamente o script de inicialização `init-db.sql`
- Configurar persistência de dados através de um volume Docker

Você pode verificar se o container está rodando com:

```bash
docker ps
```

E verificar os logs com:

```bash
docker logs -f wiredash-postgres-1
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
VITE_USE_LOCAL_SUPABASE=true
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 4. Instalar Dependências e Iniciar o Aplicativo

```bash
npm install
npm run dev
```

O aplicativo estará disponível em [http://localhost:8080](http://localhost:8080)

## Conectando ao PostgreSQL

Você pode se conectar diretamente ao banco de dados PostgreSQL usando:

- Host: localhost
- Porta: 5432
- Usuário: postgres
- Senha: postgres
- Banco de dados: wireguard_manager

### Usando uma ferramenta visual

Você pode usar ferramentas como [pgAdmin](https://www.pgadmin.org/) ou [DBeaver](https://dbeaver.io/) para se conectar ao banco de dados.

## Estrutura do Banco de Dados

O script `init-db.sql` cria automaticamente as tabelas necessárias:

1. `mikrotik_config` - Armazena as configurações de conexão do Mikrotik Router
2. `wireguard_defaults` - Armazena as configurações padrões do WireGuard
3. `system_users` - Gerencia os usuários do sistema

## Alternando entre PostgreSQL Local e Supabase

O projeto está configurado para usar o cliente local quando a variável de ambiente `VITE_USE_LOCAL_SUPABASE` está definida como `true` no arquivo `.env.local`.

Para usar o Supabase remoto, remova esta variável ou defina como `false`.

## Backup e Restauração de Dados

### Para fazer backup do banco de dados:

```bash
docker exec -t wiredash-postgres-1 pg_dump -U postgres wireguard_manager > backup.sql
```

### Para restaurar o banco de dados a partir de um backup:

```bash
cat backup.sql | docker exec -i wiredash-postgres-1 psql -U postgres -d wireguard_manager
```

## Solução de Problemas

### Erro de conexão com o banco de dados:
- Verifique se o container Docker está rodando: `docker ps`
- Verifique os logs do container: `docker logs wiredash-postgres-1`
- Certifique-se que a porta 5432 não está sendo usada por outra instância do PostgreSQL

### Erros de autenticação:
- Verifique se as credenciais no arquivo `.env.local` estão corretas
- Para o PostgreSQL local, as credenciais padrão são `postgres/postgres`

### O script de inicialização não foi executado:
- Você pode executar manualmente o script: `cat init-db.sql | docker exec -i wiredash-postgres-1 psql -U postgres -d wireguard_manager`
