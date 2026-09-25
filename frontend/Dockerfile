FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first
COPY package*.json ./

# Clean install to guarantee proper executable permissions on Linux
RUN npm ci || npm install

# Copy the rest of the source files AFTER dependencies are installed
COPY . .

# Build static assets
RUN npm run build

# Production Stage with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]