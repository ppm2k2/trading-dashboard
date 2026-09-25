FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm install

# Copy source code
COPY . .

# Directly invoke Vite via Node to completely avoid npm wrapper scripts and permission errors
RUN node node_modules/vite/bin/vite.js build

# Production Stage with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]