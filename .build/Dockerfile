# syntax=docker/dockerfile:1.6

# =========================
# Frontend build stage
# =========================
FROM --platform=$BUILDPLATFORM oven/bun:1.0.11 AS frontend-builder
WORKDIR /build

# Install dependencies (cache-friendly)
COPY frontend/package.json frontend/bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source
COPY frontend/ .
RUN bun run build


# =========================
# Backend build stage
# =========================
FROM node:18-slim AS build
WORKDIR /double-take/api

ENV DEBIAN_FRONTEND=noninteractive

# Install build deps (serve per canvas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    libpixman-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY api/package.json api/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --progress=false

# Copy source
COPY api/ .


# =========================
# Final runtime image
# =========================
FROM node:18-slim

WORKDIR /double-take
ENV NODE_ENV=production
ENV DEBIAN_FRONTEND=noninteractive

# Solo runtime deps (molto più leggero)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    libpixman-1-0 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY --from=build /double-take /double-take

# Copy frontend build
COPY --from=frontend-builder /build/dist ./frontend

# Storage
RUN mkdir -p /.storage && ln -s /.storage /double-take/.storage

# Entrypoint
COPY .build/entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]