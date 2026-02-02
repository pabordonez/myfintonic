# ADR-001: Separar Entidad Financiera de Relación con Cliente

**Date**: 2026-01-22
**Status**: Accepted
**Deciders**: [Equipo de Arquitectura]

## Context

Necesitamos gestionar las entidades financieras (bancos, gestoras) de dos formas distintas:
1.  Como un **catálogo maestro** reutilizable (ej. "Banco Santander" existe una sola vez en el sistema).
2.  Como una **vinculación personal** de cada cliente, donde se almacena el saldo total que ese cliente tiene en dicha entidad y su histórico de valoraciones.

Inicialmente, el modelo mezclaba ambos conceptos en una única tabla `FinancialEntity`, lo que impedía que varios clientes compartieran el mismo banco sin duplicar el nombre, o forzaba a mezclar datos privados (saldo) en una entidad pública (catálogo).

## Considered Options

1.  **Opción 1: Entidad Única con duplicidad**
    - Crear un registro `FinancialEntity` por cada cliente (ej. "Santander - Cliente A", "Santander - Cliente B").
    - **Pros**: Modelo simple, una sola tabla.
    - **Cons**: Redundancia masiva de datos, difícil mantener un catálogo limpio, imposible hacer analíticas globales por banco.

2.  **Opción 2: Entidad Única con tabla intermedia (Many-to-Many)**
    - `FinancialEntity` es solo catálogo. `Client` se relaciona con ella a través de una tabla pivote simple.
    - **Pros**: Normalización correcta.
    - **Cons**: Las tablas pivote estándar de ORMs a veces dificultan añadir metadatos complejos como `balance` o relaciones hijas como `ValueHistory`.

3.  **Opción 3: Separación Explícita (Modelo Adoptado)**
    - `FinancialEntity`: Catálogo maestro (Nombre, ID).
    - `ClientFinancialEntity`: Entidad explícita que representa la relación (Saldo, Histórico, FK a Cliente, FK a Banco).
    - **Pros**: Claridad semántica, escalabilidad, permite lógica de negocio específica sobre la "relación" (ej. histórico de saldo agregado).
    - **Cons**: Requiere gestionar dos repositorios y casos de uso coordinados.

## Decision

Elegimos la **Opción 3**. Separamos `FinancialEntity` (Catálogo) de `ClientFinancialEntity` (Vinculación).

## Rationale

- **Normalización**: Evita duplicar nombres de bancos.
- **Escalabilidad**: Permite añadir atributos a la relación (como `balance`, `alias`, `accountNumber`) sin afectar al catálogo global.
- **DDD**: Refleja mejor el lenguaje ubicuo. Un "Banco" es una cosa, y "Mi cuenta en el Banco" es otra.

## Consequences

### Positive
+ El catálogo de bancos es único y limpio, gestionable solo por administradores.
+ Cada cliente tiene su propio historial de valoraciones agregado por banco.
+ Facilita consultas como "¿Cuánto dinero total tienen nuestros usuarios en BBVA?".

### Negative
- Mayor complejidad en la creación: para vincular un cliente, primero debe existir el banco en el catálogo.
- Necesidad de mantener dos conjuntos de endpoints y repositorios.
