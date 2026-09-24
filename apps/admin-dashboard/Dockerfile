FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app

ARG VITE_API_URL="https://api.salonops.ma"
ENV VITE_API_URL=$VITE_API_URL

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/ ./packages/
COPY apps/admin-dashboard/ ./apps/admin-dashboard/

RUN pnpm approve-builds --all && pnpm install --frozen-lockfile
RUN pnpm --filter @salonops/shared-types build
RUN pnpm --filter @salonops/admin-dashboard build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/admin-dashboard/dist /usr/share/nginx/html
COPY apps/admin-dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
