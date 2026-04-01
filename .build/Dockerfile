# =========================
# 1. Frontend build stage
# =========================
FROM --platform=$BUILDPLATFORM oven/bun:1.0.11 AS frontend-builder
WORKDIR /build

# Install dependencies (cache-friendly)
COPY frontend/package.json frontend/bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY frontend/ .
RUN bun run build


# =========================
# 2. Backend build stage
# =========================
FROM node:18-slim AS build
WORKDIR /double-take/api

ENV DEBIAN_FRONTEND=noninteractive

# Install build deps for native modules (like canvas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    libpixman-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY api/package.json api/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --progress=false

# Copy backend source
COPY api/ .


# =========================
# 3. Final runtime image
# =========================
FROM node:18-slim

WORKDIR /double-take
ENV NODE_ENV=production
ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies, jq and NODEMON
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    libpixman-1-0 \
    ca-certificates \
    jq \
    && npm install -g nodemon \
    && npm cache clean --force \
    && rm -rf /var/lib/apt/lists/*

# Copy backend from build stage
COPY --from=build /double-take /double-take

# Copy frontend build to the correct directory
COPY --from=frontend-builder /build/dist ./frontend

# Setup storage and symbolic link
RUN mkdir -p /.storage && ln -s /.storage /double-take/.storage

# Copy and setup Entrypoint script
COPY .build/entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Expose application port
EXPOSE 3000

# Start via entrypoint script (which now has access to nodemon)
ENTRYPOINT ["./entrypoint.sh"]