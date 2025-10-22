FROM node:20-alpine AS builder
WORKDIR /app

ARG FIREBASE_CONFIG_B64
ARG API_BASE_URL
ARG BUILD_VERSION

ENV VITE_FIREBASE_CONFIG_B64="${FIREBASE_CONFIG_B64}"
ENV VITE_API_BASE_URL="${API_BASE_URL}"
ENV VITE_BUILD_VERSION="${BUILD_VERSION}"

COPY package*.json ./
RUN npm i --no-audit --no-fund --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:1.27-alpine

ENV PORT=8080
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:${PORT}/ || exit 1

# USER 101 
EXPOSE 8080
