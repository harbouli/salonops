FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app

ARG VITE_API_URL="https://api.salonops.ma"
ENV VITE_API_URL=$VITE_API_URL

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/ ./packages/
COPY apps/client-web/ ./apps/client-web/

RUN pnpm approve-builds --all && pnpm install --frozen-lockfile
RUN pnpm --filter @salonops/shared-types build
RUN pnpm --filter @salonops/client-web build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/client-web/dist /usr/share/nginx/html
COPY apps/client-web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
