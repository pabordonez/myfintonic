

# quiero que este "Analisis de requisitos" me lo pases a un formato md para poder añadirlo a mi repositorio

```markdown
# Análisis de Requisitos - Aplicación de Gestión Financiera Personal

## 1. Contexto y Objetivos

Crear una aplicación web para el seguimiento de finanzas personales: fondos indexados, depósitos a plazo fijo, robo-advisor, acciones y cuentas corrientes. Utilizando **Node.js + TypeScript** como backend, lista para poner en producción con **Docker** y futura integración con **CI/CD**.

## 2. Requisitos Funcionales

- **RF-001: Autenticación**
  - Login con credenciales (usuario/contraseña)
  - Gestión de sesión con JWT

- **RF-002: Tipos de activos**
  - CRUD de categorías (fondos indexados, depósito, robo-advisor, acciones, cuentas)
  - Atributos: nombre, descripción, categoría

- **RF-003: Gestión de activos**
  - Crear activos con valor inicial y metadatos
  - Fecha de inicio y vínculo a usuario

- **RF-004: Histórico de valores**
  - Formulario para actualizar valor en fechas específicas
  - Registro inmutable (solo nuevas entradas, no sobrescribir)
  - Múltiples actualizaciones por activo con timestamp

- **RF-005: Visualización y reportes**
  - Dashboard de patrimonio actual
  - Gráficas de evolución temporal total y por activo
  - Cálculo de rentabilidades y variaciones

## 3. Requisitos No Funcionales

- **Rendimiento:** Tiempo de respuesta < 500ms; dashboard < 2 segundos; soporte para >10,000 registros históricos.
- **Seguridad:** Contraseñas hasheadas (bcrypt), JWT expirable, protección contra inyección SQL, variables sensibles en `.env`.
- **Mantenibilidad:** Código con tipado estricto (TypeScript), arquitectura en capas, documentación API (Swagger), tests unitarios básicos.
- **Escalabilidad:** Diseño stateless, BD relacional normalizada (MySQL), separación clara backend-frontend.
- **Usabilidad:** Interfaz responsive, mensajes de error claros, feedback visual.
- **Disponibilidad:** Uptime 95% entorno local, logs estructurados, health check endpoint.

## 4. Restricciones Técnicas

- **Stack obligatorio:** Node.js (v20), TypeScript (v5), Express.js, MySQL (v8), ORM recomendado: Prisma.
- **Contenedorización:** Docker + Docker Compose.
- **Frontend:** Libre elección, solo consumo de API REST.
- **Deploy:** Local vía `docker-compose up`. CI/CD preparado para futuro, con pipelines en GitHub Actions.

## 5. Modelo de Datos (Simplificado)

```

```

## 6. Estructura de la Aplicación

```

```

## 7. Endpoints API

```

```

## 8. Docker Compose Básico

```

version: '3.8'

services:
db:
image: mysql:8.0
environment:
MYSQL_ROOT_PASSWORD: \${DB_ROOT_PASSWORD}
MYSQL_DATABASE: \${DB_NAME}
volumes:
- mysql_data:/var/lib/mysql
ports:
- "3306:3306"

api:
build: ./
depends_on:
- db
environment:
NODE_ENV: development
DB_HOST: db
ports:
- "3000:3000"
volumes:
- ./src:/app/src
command: npm run dev

volumes:
mysql_data:

```

## 9. Fases de Implementación (MVP)

1. Setup inicial: Node.js + TypeScript, Express, Docker Compose
2. Capa de datos: diseño SQL, modelos ORM, migraciones
3. Autenticación: login, JWT, middleware
4. API Core: CRUD asset_types y assets, endpoint históricos
5. Frontend básico: dashboard, formularios, gráficas
6. Testing y refinamiento: tests, docs, UX

---

**Tiempo estimado MVP:** 3-4 semanas (parcial).
```

