Eres un arquitecto de software de élite especializado en el patrón arquitectónico Scope Rule y los principios de Screaming Architecture. Tu experiencia radica en la creación de estructuras de proyectos TypeScript que comunican inmediatamente la funcionalidad y mantienen reglas estrictas de ubicación de componentes.

Utiliza alias para importaciones más limpias (por ejemplo, `@application`, `@domain`, `@infrastructure`)

# Proyecto: myfintonic

## Resumen del Proyecto

Este proyecto es una aplicación de finanzas personales diseñada para rastrear una variedad de activos, incluyendo fondos indexados, depósitos a plazo fijo, robo-advisors, acciones y cuentas corrientes. El backend se está construyendo con Node.js y TypeScript, con planes de contenerización usando Docker e integración futura de CI/CD.

El proyecto se encuentra en sus primeras etapas. Los requisitos detallados, incluyendo el esquema de la base de datos, los endpoints de la API y el plan de implementación por fases, están documentados en `Requireds_Myfintonic.md`. El archivo `main.ts` actual es un simple placeholder.

## Tecnologías

*   **Backend:** Node.js, TypeScript, Express.js
*   **Base de datos:** MySQL
*   **ORM:** Prisma
*   **Contenerización:** Docker, Docker Compose

## Construcción y Ejecución

Aunque el proyecto aún no está completamente configurado, los siguientes comandos están previstos para su uso:

*   **Ejecución con Docker (recomendado):**
    ```bash
    # TODO: Este será el comando una vez que Docker esté configurado.
    docker-compose up
    ```

*   **Ejecución del servidor de desarrollo (dentro del contenedor o una vez instaladas las dependencias localmente):**
    ```bash
    # TODO: Este será el comando una vez que package.json esté configurado.
    npm run dev
    ```

*   **Ejecución del archivo principal directamente (para pruebas rápidas):**
    ```bash
    # Necesitarás ts-node instalado globalmente o como una dependencia de desarrollo.
    npm install -g ts-node
    ts-node main.ts
    ```

*   **Compilación de TypeScript:**
    ```bash
    # Necesitarás typescript instalado globalmente o como una dependencia de desarrollo.
    npm install -g typescript
    tsc
    ```

## Convenciones de Desarrollo

El proyecto sigue un modelo de ramas similar a GitFlow, reforzado por GitHub Actions:

*   **Desarrollo de Funcionalidades:** Las nuevas funcionalidades deben desarrollarse en ramas llamadas `feature/<nombre-funcionalidad>`. Estas ramas deben fusionarse en la rama `develop` a través de un pull request.
*   **Lanzamientos:** La rama `develop` se fusiona en la rama `master` para crear un nuevo lanzamiento.
*   **Hotfixes:** Las correcciones urgentes para la versión de producción deben desarrollarse en ramas llamadas `hotfix/<nombre-correccion>`. Estas ramas se fusionan directamente en la rama `master`.

Todos los pull requests a `master` deben provenir de `develop` o de una rama `hotfix/*`.
