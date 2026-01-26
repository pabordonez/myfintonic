# Guía para Agentes de IA y Desarrolladores (AGENTS.md)

Este documento define el contexto, arquitectura y reglas del proyecto **MyFintonic API**. Úsalo como referencia principal al generar código o refactorizar.

## 1. Arquitectura y Principios

El proyecto sigue **Clean Architecture** y **Domain-Driven Design (DDD)**.

### Estructura de Carpetas (Screaming Architecture)
La estructura comunica la intención del negocio, no el framework.

- **`src/domain`**: **Núcleo**. Entidades, Interfaces de Repositorios, Value Objects, Factorías. **Sin dependencias externas**.
- **`src/application`**: **Casos de Uso**. Lógica de negocio y orquestación. Depende de Domain. Usa DTOs.
- **`src/infrastructure`**: **Implementación**. Base de datos (Prisma), Controladores HTTP (Express), Implementaciones de Repositorios. Depende de Application y Domain.
- **`src/config`**: Configuración global validada (Env vars con Zod).

### Regla de Dependencia (Scope Rule)
Las dependencias **solo** pueden apuntar hacia adentro:
`Infrastructure` -> `Application` -> `Domain`.

## 2. Convenciones de Código

### TypeScript
- **Strict Mode**: Activado. No usar `any` a menos que sea estrictamente necesario (y documentado).
- **Alias de Ruta**: Usar **siempre** alias para imports internos:
  - `@domain/*`
  - `@application/*`
  - `@infrastructure/*`
  - `@config/*`
- **Interfaces**: Preferir `interface` sobre `type` para definiciones de entidades.

### Validación
- **Zod**: Herramienta estándar para validación.
  - Validar variables de entorno en `@config`.
  - Validar reglas de integridad en Factorías (`@domain/factories`).
  - Validar DTOs de entrada (futuro middleware).

### Persistencia
- **Prisma**: ORM principal.
- **Repositorios**: Las clases concretas en `@infrastructure` deben implementar las interfaces definidas en `@domain`.
- **Mappers**: Usar métodos privados `mapToDomain` y `mapToPrisma` dentro de los repositorios para desacoplar la BD del dominio.

## 3. Testing
- **Vitest**: Runner de tests.
- **Estrategia**:
  - **Unitarios**: Para lógica de dominio pura.
  - **Integración**: Para repositorios y casos de uso. Utilizar **mocks de Prisma** (`vi.mock`) para simular la BD en memoria y evitar dependencias de Docker en tests rápidos.

## 4. Flujo de Trabajo y Calidad
- **Commits**: Seguir **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`).
- **Husky**: Los hooks de pre-commit ejecutan linter y tests. El código generado debe pasar estas validaciones.
- **Formato**: Prettier es la fuente de verdad para el estilo.

## 5. Instrucciones Específicas para Generación de Código
1.  **Modularidad**: Si creas una nueva entidad, genera: Interfaz (`@domain`), DTO (`@application`), Implementación (`@infrastructure`) y Tests.
2.  **Seguridad**: Nunca hardcodear secretos. Usar siempre `env.ts`.
3.  **Tests**: Al modificar lógica, actualizar o crear tests que verifiquen el cambio.
4.  **Alias**: Verifica que los imports usen `@alias` y no rutas relativas largas (`../../`).