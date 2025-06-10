
# Etapa de build com Bun
FROM oven/bun:1.1 AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY bun.lockb package.json ./

# Instalar dependências
RUN bun install

# Copiar o restante do código-fonte
COPY . .

# Definir variáveis de ambiente para self-hosted
ENV NODE_ENV=production
ENV VITE_USE_LOCAL_SUPABASE=false
ENV VITE_SELF_HOSTED=true

# Build da aplicação
RUN bun run build

# Verificar se o build foi criado corretamente
RUN ls -la /app/dist && \
    test -f /app/dist/index.html || (echo "❌ Build falhou - index.html não encontrado" && exit 1)

# Etapa de produção com Nginx
FROM nginx:alpine

# Instalar ferramentas necessárias
RUN apk add --no-cache netcat-openbsd curl

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar script de entrada e dar permissões
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copiar arquivos buildados do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Verificar se os arquivos foram copiados corretamente
RUN ls -la /usr/share/nginx/html && \
    test -f /usr/share/nginx/html/index.html || (echo "❌ Arquivos da aplicação não copiados corretamente" && exit 1)

# Criar diretório de logs do Nginx se não existir
RUN mkdir -p /var/log/nginx

# Definir variáveis de ambiente
ENV VITE_SELF_HOSTED=true
ENV VITE_USE_LOCAL_SUPABASE=false

# Expor porta 80
EXPOSE 80

# Health check para verificar se o container está funcionando
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Usar script de entrada
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
