# ADR-004: Ejecución de Contenedores con Usuario No Privilegiado

**Date**: 2026-01-22
**Status**: Accepted
**Deciders**: [Equipo de Desarrollo]

## Context

Por defecto, los contenedores Docker se ejecutan como el usuario `root`. Esto representa un riesgo de seguridad significativo:
1.  **Escalada de Privilegios**: Si un atacante logra comprometer el proceso de Node.js, tendría privilegios de root dentro del contenedor, facilitando el escape al host o el movimiento lateral.
2.  **Principio de Mínimo Privilegio**: Las aplicaciones web no necesitan permisos de root para funcionar.

## Considered Options

1.  **Ejecutar como `root` (Status Quo)**
    -   **Pros**: No requiere configuración de permisos.
    -   **Cons**: Alta superficie de ataque.

2.  **Crear un usuario específico en el Dockerfile**
    -   **Pros**: Control total sobre el UID/GID.
    -   **Cons**: Requiere comandos extra (`adduser`, `addgroup`).

3.  **Usar el usuario `node` preexistente en imágenes oficiales**
    -   **Pros**: Las imágenes `node:alpine` ya traen un usuario `node` (UID 1000) configurado para este propósito. Es el estándar recomendado.
    -   **Cons**: Requiere ajustar permisos (`chown`) de los directorios de la aplicación.

## Decision

Elegimos la **Opción 3**: Utilizar el usuario `node` incluido en la imagen base.

## Rationale

-   **Seguridad**: Mitiga drásticamente el impacto de una posible ejecución remota de código (RCE).
-   **Estándar**: Es la práctica recomendada por la comunidad de Node.js y Docker.

## Consequences

### Positive
+ Cumplimiento de estándares de seguridad de contenedores.
+ Reducción de la superficie de ataque.

### Negative
- Es necesario asegurar que el usuario `node` tenga permisos de escritura en directorios específicos si la aplicación lo requiere.
