# ==========================================
# Stage 1: Build & Compile Vue SPA
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for optimal layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code
COPY . .

# Compile TypeScript and build production bundle
RUN npm run build

# ==========================================
# Stage 2: Production Nginx Web Server
# ==========================================
FROM nginx:1.27-alpine AS production

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default Nginx static files
RUN rm -rf ./*

# Copy custom Nginx configuration for Vue SPA routing & security
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production artifacts from builder stage
COPY --from=builder /app/dist .

# Expose HTTP port
EXPOSE 80

# Health check to monitor container responsiveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
