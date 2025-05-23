# Etapa de build com Bun
FROM oven/bun:1.1 AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY bun.lockb package.json ./

# Instalar dependências
RUN bun install

# Copiar o restante do código-fonte
COPY . .

# Build da aplicação
RUN bun run build

# Etapa de produção com Nginx
FROM nginx:alpine

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar arquivos buildados do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Expor porta 80
EXPOSE 80
