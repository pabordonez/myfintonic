# --- Etapa 1: Builder (Construcción) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos los archivos de definición de paquetes y tsconfig
COPY package*.json tsconfig.json ./

# Instalamos dependencias usando npm ci (requiere package-lock.json)
RUN npm ci

# Copiamos el código fuente
COPY . .

# Generamos el cliente de Prisma (necesario antes del build)
RUN npm run db:generate

# Compilamos el proyecto TypeScript a JavaScript (carpeta dist)
RUN npm run build

# Limpiamos las dependencias de desarrollo antes de pasar a producción
RUN npm prune --production

# --- Etapa 2: Runner (Producción) ---
FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./

# Copiamos node_modules limpios y el código compilado desde el builder
COPY --from=builder /app/node_modules ./node_modules

# Copiamos los artefactos construidos desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Exponemos el puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]