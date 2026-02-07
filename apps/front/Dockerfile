FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Etapa de Desarrollo
FROM base AS development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Etapa de Construcción
FROM base AS build
RUN npm run build

# Etapa de Producción
FROM nginx:alpine AS production

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos generados en la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]