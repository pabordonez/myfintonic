# Análisis Preliminar de Seguridad - MyFintonic API

## 1. Estado Actual de la Seguridad

### 1.1. Gestión de Secretos y Configuración
- **Variables de Entorno**: Se utiliza `dotenv` para cargar variables sensibles.
- **Validación Estricta**: Se utiliza `Zod` en `src/config/env.ts` para validar la existencia y tipo de las variables críticas (DB credentials, PORT, etc.) al inicio de la aplicación (Fail Fast).
- **Control de Versiones**: El archivo `.env` está correctamente ignorado en `.gitignore`. Se proporciona un `.env.example` sin secretos reales.

### 1.2. Validación de Entrada
- **DTOs**: Se definen DTOs en la capa de aplicación para estructurar la entrada.
- **Integridad de Dominio**: Se utiliza `Zod` en `ProductFactory` para asegurar que las entidades de dominio no se crean con datos inválidos o incompletos.
    - **Validación Polimórfica**: Se impide la actualización de campos que no corresponden al tipo de producto específico (ej. impedir inyectar `interestRate` en una cuenta que no lo soporta), mitigando riesgos de asignación masiva (Mass Assignment).
- **Tipado Estricto**: TypeScript configurado en modo estricto (`strict: true`) mitiga errores de tipos y nulos.

### 1.3. Base de Datos
- **Protección SQL Injection**: El uso de **Prisma ORM** mitiga significativamente el riesgo de inyección SQL al utilizar consultas parametrizadas por defecto.
- **Conexión Segura**: Las credenciales se inyectan vía variables de entorno y no están hardcodeadas.

### 1.4. Infraestructura (Docker)
- **Imágenes Base**: Se utiliza `node:20-alpine`, una imagen ligera que reduce la superficie de ataque.
- **Separación de Entornos**: Uso de *Multi-stage builds* en Dockerfile para separar dependencias de desarrollo y producción (`npm prune --production`), evitando que herramientas de dev lleguen a la imagen final.
- **Usuario No Privilegiado**: Se configura la directiva `USER node` para evitar la ejecución como root.

### 1.5. Calidad de Código (CI/CD Local)
- **Husky (Git Hooks)**: Configurado para ejecutar linter y tests antes de cada commit, actuando como primera barrera de defensa.
- **ESLint**: Configurado con reglas de TypeScript para detectar patrones de código problemáticos.

### 1.6. Autenticación y Autorización
- **JWT**: Implementado para gestión de sesiones stateless.
- **Bcrypt**: Hashing de contraseñas antes de persistir en base de datos.
- **RBAC**: Control de acceso basado en roles (`ADMIN`, `USER`).
- **Ownership**: Middleware para asegurar que los usuarios solo acceden a sus propios recursos.

## 2. Estrategia de Seguridad Futura (Snyk)

Se planea la integración de **Snyk** para cubrir las siguientes áreas:

### 2.1. Snyk Open Source (SCA)
- **Objetivo**: Detectar vulnerabilidades conocidas (CVEs) en las dependencias del proyecto (`node_modules`).
- **Acción**: Escaneo automático de `package.json` y `package-lock.json`.

### 2.2. Snyk Code (SAST)
- **Objetivo**: Análisis estático del código fuente propio para detectar patrones inseguros (e.g., secretos hardcodeados, uso inseguro de APIs).
- **Acción**: Escaneo del directorio `src`.

### 2.3. Snyk Container
- **Objetivo**: Detectar vulnerabilidades en la imagen base de Docker y el sistema operativo del contenedor.
- **Acción**: Escaneo del `Dockerfile` y la imagen construida.

## 3. Recomendaciones de Seguridad Inmediatas

1.  **Autenticación y Autorización**: Implementar el requisito funcional RF-001 (JWT + Bcrypt) para proteger los endpoints.
2.  **Rate Limiting**: Añadir middleware (ej. `express-rate-limit`) para proteger la API contra ataques de fuerza bruta y DoS.
3.  **Cabeceras de Seguridad**: Implementar `helmet` en Express para configurar cabeceras HTTP seguras (HSTS, X-Frame-Options, etc.).
4.  **CORS**: Configurar CORS de forma restrictiva si se va a conectar un frontend, permitiendo solo orígenes confiables.
5.  **Usuario Docker**: Asegurar explícitamente que el contenedor en producción corra con un usuario no privilegiado (ej. `USER node`).