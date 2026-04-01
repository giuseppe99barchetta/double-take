# syntax=docker/dockerfile:1.6

# =========================
# Frontend build stage
# =========================
FROM --platform=$BUILDPLATFORM oven/bun:1.0.11 AS frontend-builder
WORKDIR /build

# Install dependencies using lockfile for deterministic builds
COPY frontend/package.json frontend/bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source after dependencies to maximize cache efficiency
COPY frontend/ .
RUN bun run build


# =========================
# Backend build stage
# =========================
FROM node:18-slim AS build
WORKDIR /double-take/api

ENV DEBIAN_FRONTEND=noninteractive
ENV CC="ccache gcc"
ENV CXX="ccache g++"

# Install build dependencies with cache support
RUN --mount=type=cache,target=/var/cache/apt \
    apt update && apt install -y --no-install-recommends \
    gcc g++ make \
    libpixman-1-dev libcairo2-dev libpango1.0-dev \
    libjpeg-dev libgif-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Node dependencies using npm ci for reproducibility
COPY api/package.json api/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --progress=false

# Copy application source after dependencies
COPY api/ .

# =========================
# Final runtime image
# =========================
FROM node:18-slim

WORKDIR /double-take
ENV NODE_ENV=production
ENV DEBIAN_FRONTEND=noninteractive

# Install only runtime dependencies
RUN --mount=type=cache,target=/var/cache/apt \
    apt update && apt install -y --no-install-recommends \
    jq \
    libcairo2 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend and frontend build artifacts
COPY --from=build /double-take /double-take
COPY --from=frontend-builder /build/dist ./frontend

# Create persistent storage symlink
RUN mkdir -p /.storage && ln -s /.storage /double-take/.storage

# Copy entrypoint
COPY .build/entrypoint.sh ./

EXPOSE 3000
ENTRYPOINT ["/bin/bash", "./entrypoint.sh"]