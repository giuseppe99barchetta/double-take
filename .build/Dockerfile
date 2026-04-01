# =========================
# 1. Frontend build stage
# =========================
FROM node:20-slim AS frontend-builder
WORKDIR /build/frontend

# Install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --progress=false

# Copy source and build
COPY frontend/ .
RUN npm run build


# =========================
# 2. Backend build stage
# =========================
FROM node:20-slim AS build
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
RUN npm ci --omit=dev --prefer-offline --no-audit --progress=false

# Copy backend source
COPY api/ .


# =========================
# 3. Final runtime image
# =========================
FROM node:20-slim

WORKDIR /double-take
ENV NODE_ENV=production
ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies and jq
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    libpixman-1-0 \
    ca-certificates \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Copy backend from build stage
COPY --from=build /double-take /double-take

# Copy frontend build to the correct directory
COPY --from=frontend-builder /build/frontend/dist ./frontend

# Setup storage and symbolic link
RUN mkdir -p /.storage && ln -s /.storage /double-take/.storage

# Copy and setup Entrypoint script
COPY .build/entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Expose application port
EXPOSE 3000

# Start via production entrypoint script
ENTRYPOINT ["./entrypoint.sh"]