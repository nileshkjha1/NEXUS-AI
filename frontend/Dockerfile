# ==============================================================================
# NEXUS AI — Enterprise Frontend Multi-Stage Dockerfile
# Stage 1: Build production static distribution with Vite
# Stage 2: Serve with lightweight, production-tuned Nginx reverse proxy
# ==============================================================================

# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies using cached layer
COPY frontend/package*.json ./
RUN npm ci || npm install

# Copy frontend source code
COPY frontend/ ./

# Build optimized production bundle
RUN npm run build

# --- Stage 2: Runtime Stage ---
FROM nginx:alpine

# Remove default Nginx boilerplate
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom reverse-proxy Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
