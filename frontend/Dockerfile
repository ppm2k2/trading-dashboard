FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Fix binary executable permissions for Linux container environment
RUN chmod +x ./node_modules/.bin/*

# Build static assets
RUN npm run build

# Production Stage with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]