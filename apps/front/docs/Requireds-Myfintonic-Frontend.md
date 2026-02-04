# Análisis de Requisitos - Aplicación de Gestión Financiera Personal -FRONTEND

## 1. Contexto y Objetivos

Crear una aplicación web para el seguimiento de finanzas personales: fondos indexados, depósitos a plazo fijo, robot-advisor, acciones y cuentas corrientes. Tenemos desarrollado gran parte del backend que se encuentra en la carpeta api

## 2. Requisitos Funcionales

- **RF-001: Tipos de activos**
  - CRUD de categorías (fondos indexados, depósito, robot-advisor, acciones, cuentas)
  - Atributos:

- **RF-002: Gestión de activos**
  - Crear activos con valor inicial y metadatos
  - Fecha de inicio y vínculo a usuario

- **RF-003: Histórico de valores**
  - Formulario para actualizar valor en fechas específicas
  - Registro inmutable (solo nuevas entradas, no sobrescribir)
  - Múltiples actualizaciones por activo con timestamp

- **RF-004: Visualización y reportes**
  - Dashboard de patrimonio actual
  - Gráficas de evolución temporal total y por activo
  - Cálculo de rentabilidades y variaciones

- **RF-005: Autenticación**
  - Login con credenciales (usuario/contraseña)
  - Gestión de sesión con JWT

## 3. Requisitos No Funcionales

- **Rendimiento:** Tiempo de respuesta < 500ms; dashboard < 2 segundos; soporte para >10,000 registros históricos.
- **Seguridad:** Contraseñas hasheadas (bcrypt), JWT expirable, protección contra inyección SQL, variables sensibles en `.env`.
- **Usabilidad:** Interfaz responsive, mensajes de error claros, feedback visual.
- **Disponibilidad:** Uptime 95% entorno local, logs estructurados, health check endpoint.

## 4. Restricciones Técnicas

- **Stack obligatorio:** React, TypeScript, Vite, Tailwind CSS, Vitest, Playwright
- **Deploy:** Local vía `docker-compose up`. CI/CD preparado para futuro, con pipelines en GitHub Actions.

## 5. TDD - MANDATORY

1. Write test FIRST → run → MUST FAIL
2. Implement MINIMUM code to pass
3. Refactor keeping tests green

## File Organization (Scope Rule)

- `src/shared/` → used by multiple features
- `src/features/X/` → specific to one feature

## Project Structure

```
src/
├── shared/{types,utils,constants,components,strategies,hooks}/
├── features/{product-catalog,shopping-cart,auth}/
├── context/  # 3 files: CartContextValue.ts, CartContext.tsx, useCart.ts
├── infrastructure/  # sentry.ts, SentryErrorBoundary.tsx
└── test/setup.ts
```

## Critical Configurations

### tsconfig.app.json

```json
{ "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**"] }
```

NEVER use `allowExportNames` workaround.

## Scripts

- `pnpm test:run` - unit tests
- `pnpm test:e2e` - playwright

## Expected Test Counts

- Unit/Integration: ~89
- E2E: 7

## Validation

`pnpm verify` must pass: 0 lint errors, 0 type errors, all tests green, build success.

## . Fases de Implementación (MVP)

1. Setup inicial:
2. Autenticación: login, JWT
3. API Core: CRUD asset_types y assets, endpoint históricos
4. Frontend básico: dashboard, formularios, gráficas
5. Testing y refinamiento: tests, docs, UX

- Evaluar si es buena opcion hacer una single page

---
