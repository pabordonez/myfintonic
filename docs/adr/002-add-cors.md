# ADR-002: Implementación de Seguridad Básica (CORS y Helmet)

**Date**: 2026-01-22
**Status**: Accepted
**Deciders**: [Equipo de Desarrollo]

## Context

Actualmente, la API de MyFintonic no cuenta con mecanismos de protección básicos para peticiones HTTP.
- No hay control sobre qué orígenes (dominios) pueden consumir la API (CORS), lo que es crítico si se va a desarrollar un frontend.
- No se establecen cabeceras de seguridad HTTP estándar (HSTS, X-Frame-Options, X-XSS-Protection, etc.), exponiendo la aplicación a vulnerabilidades conocidas.

## Considered Options

1. **No implementar seguridad adicional**
   - Pros: Menor complejidad inicial.
   - Cons: Alta vulnerabilidad, no apto para producción.

2. **Implementación manual de middleware**
   - Pros: Control total sobre cada cabecera.
   - Cons: Propenso a errores, requiere mantenimiento constante para seguir estándares de seguridad, reinventar la rueda.

3. **Uso de librerías estándar (`cors` y `helmet`)**
   - Pros: Soluciones probadas por la comunidad, configuración sencilla, actualizaciones de seguridad mantenidas por terceros.
   - Cons: Añade dependencias al proyecto.

## Decision

Elegimos la **Opción 3**: Utilizar las librerías `cors` y `helmet`.

## Rationale

- **Helmet**: Es el estándar de facto en Express para establecer cabeceras de seguridad HTTP. Cubre una amplia gama de protecciones con una configuración mínima.
- **CORS**: El paquete `cors` simplifica la gestión de las cabeceras `Access-Control-Allow-Origin` y relacionadas, permitiendo configurar listas blancas de dominios de forma dinámica si es necesario.

## Consequences

### Positive
+ Mejora inmediata de la postura de seguridad de la aplicación (Security Headers).
+ Control granular sobre quién puede consumir la API desde un navegador.
+ Cumplimiento de requisitos no funcionales de seguridad básicos.

### Negative
- Es necesario configurar correctamente los orígenes permitidos en CORS para no bloquear el desarrollo local o el frontend en producción.

## References

- Helmet Documentation
- CORS Middleware
