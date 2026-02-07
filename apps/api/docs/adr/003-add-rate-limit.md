# ADR-003: Implementación de Rate Limiting

**Date**: 2026-01-22
**Status**: Accepted
**Deciders**: [Equipo de Desarrollo]

## Context

Actualmente, la API no tiene restricciones sobre la cantidad de peticiones que un cliente puede realizar en un periodo de tiempo determinado.
Esto expone al sistema a:

1.  **Ataques de Denegación de Servicio (DoS)**: Un actor malicioso podría saturar el servidor con miles de peticiones.
2.  **Ataques de Fuerza Bruta**: Intentos ilimitados de adivinar credenciales o IDs de recursos.
3.  **Abuso de Recursos**: Consumo excesivo de CPU/Memoria por parte de un solo usuario legítimo pero con un script mal configurado.

## Considered Options

1.  **`express-rate-limit` (Almacenamiento en Memoria)**
    - **Pros**: Estándar de facto para Express, configuración trivial, sin dependencias de infraestructura externa.
    - **Cons**: El estado se pierde al reiniciar el servidor. No funciona correctamente en entornos con múltiples instancias (cluster/load balancer) sin un store externo.

2.  **`express-rate-limit` + Redis Store**
    - **Pros**: Persistencia del límite entre reinicios, soporta escalado horizontal (múltiples instancias de la API comparten el contador).
    - **Cons**: Añade complejidad de infraestructura (requiere gestionar un contenedor Redis).

3.  **Rate Limiting a nivel de Infraestructura (Nginx / Cloudflare / AWS WAF)**
    - **Pros**: Bloquea el tráfico antes de que toque el proceso de Node.js, ahorrando CPU.
    - **Cons**: Configuración fuera del código de la aplicación, más difícil de personalizar lógica de negocio específica (ej. límites diferentes por rol de usuario).

## Decision

Elegimos la **Opción 1** (`express-rate-limit` en memoria) como paso inicial, preparada para migrar a la **Opción 2** (Redis) en el futuro.

## Rationale

- **Simplicidad**: Para la fase actual del proyecto (MVP/Desarrollo), añadir Redis añade una complejidad innecesaria.
- **Suficiencia**: El almacenamiento en memoria es suficiente para proteger una sola instancia de la API contra abusos básicos.
- **Migración**: La librería elegida permite cambiar el "store" (de memoria a Redis) cambiando solo la configuración, sin reescribir la lógica.

## Consequences

### Positive

- Protección inmediata contra ataques básicos de fuerza bruta y DoS.
- Feedback al cliente mediante cabeceras estándar (`RateLimit-Limit`, `RateLimit-Remaining`).

### Negative

- Al reiniciar el servidor (deploy), los contadores se resetean.
- Si escalamos la API a múltiples contenedores, el límite se aplicará por contenedor, no globalmente (hasta que añadamos Redis).

## References

- express-rate-limit Documentation
