# 5. Estrategia de Autenticación y Autorización

Fecha: 2024-05-22

## Estado

Aceptado

## Contexto

La API de MyFintonic necesita proteger sus recursos para asegurar que solo los usuarios autorizados puedan acceder a la información.
Se requiere diferenciar entre dos tipos de actores:
- **Administradores**: Tienen acceso total al sistema.
- **Usuarios**: Solo tienen acceso a sus propios recursos (Ownership).

Actualmente, la API es pública y no tiene mecanismos de control de acceso.

## Decisión

Hemos decidido implementar un sistema de autenticación basado en **Tokens (JWT)** y autorización basada en **Roles (RBAC)** y **Propiedad (Ownership)**.

1.  **Autenticación (AuthN)**:
    *   Usaremos `jsonwebtoken` para generar y validar tokens de acceso stateless.
    *   Usaremos `bcrypt` para el hashing seguro de contraseñas.
    *   El modelo `Client` se extenderá para actuar como la entidad de usuario (email/password).

2.  **Autorización (AuthZ)**:
    *   **Role-Based**: Middleware para restringir endpoints a roles específicos (`ADMIN`, `USER`).
    *   **Resource-Based**: Middleware para verificar que un usuario solo accede a recursos que le pertenecen (`clientId` coincide).

## Consecuencias

*   **Positivas**: Seguridad robusta y estándar, stateless (escalable), separación clara de privilegios.
*   **Negativas**: Necesidad de gestionar secretos (`JWT_SECRET`) y complejidad añadida en los endpoints para verificar propiedad.
*   **Riesgos**: Si se compromete el `JWT_SECRET`, se pueden falsificar identidades. Se debe rotar y proteger.