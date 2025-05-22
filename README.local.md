
# Executando o Projeto Localmente

Este documento contém instruções para executar o projeto em ambiente local, utilizando PostgreSQL local em vez de Supabase externo.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/) (geralmente vem com Docker Desktop)
- [PostgreSQL](https://www.postgresql.org/download/) (opcional se usar Docker)

## Configuração do PostgreSQL Local

### Opção 1: Usando Docker

1. Crie um arquivo `docker-compose.yml` na raiz do projeto:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: wireguard_manager
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. Inicie o PostgreSQL:

```bash
docker compose up -d
```

### Opção 2: Supabase Local

O Supabase oferece uma versão local para desenvolvimento:

1. Instale a CLI do Supabase:

```bash
npm install -g supabase
```

2. Inicialize o Supabase:

```bash
supabase init
```

3. Inicie os serviços locais:

```bash
supabase start
```

4. Ao concluir o desenvolvimento, você pode parar os serviços:

```bash
supabase stop
```

## Configuração do Projeto

1. Crie um arquivo `.env.local` na raiz do projeto:

```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

2. Modifique o arquivo de cliente do Supabase:

Crie um arquivo `src/integrations/supabase/client.local.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Obter variáveis do arquivo .env.local
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
```

3. Crie um arquivo `init-db.sql` para criar as tabelas necessárias:

```sql
-- Criar tabela mikrotik_config
CREATE TABLE IF NOT EXISTS public.mikrotik_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR NOT NULL,
  port VARCHAR NOT NULL,
  username VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  use_https BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela wireguard_defaults
CREATE TABLE IF NOT EXISTS public.wireguard_defaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint VARCHAR,
  port VARCHAR,
  dns VARCHAR,
  allowed_ip_range VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Executando o Projeto

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Acesse o projeto em [http://localhost:8080](http://localhost:8080)

## Alternando entre Supabase Local e Remoto

Para alternar entre o Supabase local e remoto, você pode criar um utilitário que seleciona o cliente correto:

```typescript
// src/integrations/supabase/index.ts
import { supabase as supabaseRemote } from './client';
import { supabase as supabaseLocal } from './client.local';

const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';

export const supabase = USE_LOCAL ? supabaseLocal : supabaseRemote;
```

E então importar de `@/integrations/supabase` em vez de `@/integrations/supabase/client`.
