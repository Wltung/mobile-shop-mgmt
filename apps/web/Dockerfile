FROM node:20-alpine AS base
# Kích hoạt pnpm
RUN corepack enable pnpm

FROM base AS builder
WORKDIR /app

# 1. Copy TOÀN BỘ source code vào trước tiên
COPY . .

# 2. Cài đặt dependencies (Lúc này file lock và source code đã nằm cạnh nhau, đảm bảo symlink không bao giờ bị ghi đè)
RUN pnpm install --frozen-lockfile

# 3. Truyền biến môi trường để Next.js nướng (bake) vào code
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=$NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
ENV NODE_ENV=production

# 4. Build Next.js
RUN pnpm --filter web build

# --- STAGE RUNNER: Copy thành phẩm ra và chạy ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy thư mục standalone và static assets theo chuẩn của Next.js Monorepo
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]