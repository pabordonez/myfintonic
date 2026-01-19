# Estado del Proyecto: MyFintonic API

## 1. Visión General
API RESTful para la gestión de productos financieros, desarrollada con **Node.js**, **Express** y **TypeScript**. El proyecto sigue estrictamente los principios de **Clean Architecture** para asegurar la escalabilidad y el desacoplamiento de componentes.

## 2. Arquitectura
El sistema está dividido en tres capas concéntricas, respetando la regla de dependencia (las capas internas no conocen a las externas).

### Capas del Sistema
1.  **Dominio (`src/domain`)**:
    *   **Responsabilidad**: Define las reglas de negocio y las entidades centrales.
    *   **Componentes**:
        *   `IFinancialProduct`: Interfaz de la entidad principal.
        *   `IProductRepository`: Contrato (interfaz) para el acceso a datos.
    *   **Dependencias**: Ninguna.

2.  **Aplicación (`src/application`)**:
    *   **Responsabilidad**: Orquesta la lógica de negocio y los casos de uso.
    *   **Componentes**:
        *   `useCases/`: Contiene los casos de uso (`ProductUseCases`).
        *   `dtos/`: Define los objetos de transferencia de datos (`CreateProductDto`, `UpdateProductDto`).
    *   **Dependencias**: Capa de Dominio.

3.  **Infraestructura (`src/infrastructure`)**:
    *   **Responsabilidad**: Implementa los detalles técnicos y adaptadores externos.
    *   **Componentes**:
        *   `persistence/`: Implementación concreta de los repositorios (`InMemoryProductRepository`).
        *   `http/controllers/`: Manejadores de peticiones HTTP (`ProductController`, `HealthController`).
        *   `http/routes/`: Definición de rutas Express (`product.routes.ts`, `health.routes.ts`).
        *   `dependencies.ts`: Contenedor de inyección de dependencias (Composition Root).
    *   **Dependencias**: Capa de Aplicación y Dominio.

## 3. Estructura de Directorios
```text
/
├── src/
│   ├── application/
│   │   ├── dtos/               # Definiciones de entrada de datos
│   │   └── useCases/           # Lógica de negocio pura (ProductUseCases)
│   ├── domain/                 # Entidades e Interfaces del repositorio
│   ├── infrastructure/
│   │   ├── http/
│   │   │   ├── controllers/    # Controladores de Express
│   │   │   └── routes/         # Definición de rutas
│   │   ├── persistence/        # Implementaciones de base de datos
│   │   └── dependencies.ts     # Inyección de dependencias manual
│   ├── app.ts                  # Configuración de la App Express
│   └── server.ts               # Punto de entrada del servidor
├── tests/                      # Tests de integración (fuera de src)
├── tsconfig.json               # Configuración de TypeScript
└── package.json
```

## 4. Funcionalidades Implementadas
*   **Gestión de Productos (CRUD)**:
    *   Creación, Lectura (lista y detalle), Actualización y Eliminación.
    *   Filtrado de productos por `status`, `type` y `financialEntity`.
*   **Health Check**: Endpoint `/health` para verificar el estado del servicio.
*   **Persistencia**: Repositorio en memoria (volátil) para prototipado rápido.

## 5. Guía de Desarrollo

### Metodología y Tecnologías
*   **Tecnologías**: Se utiliza **TypeScript** como lenguaje principal para el desarrollo.
*   **Metodología TDD**: El proyecto se inició utilizando **TDD (Test Driven Development)**, comenzando por la escritura de tests que se encuentran ubicados fuera de la carpeta `src` (en `/tests`).

### Patrones y Convenciones
*   **Inyección de Dependencias**: Se realiza manualmente en `src/infrastructure/dependencies.ts`. Al crear nuevos componentes, instáncialos allí e inyéctalos.
*   **Rutas**: Las rutas se definen como funciones factoría en `src/infrastructure/http/routes/` que reciben el controlador como argumento.
*   **Testing**: Se utilizan tests de integración con `supertest` y `vitest` ubicados en la carpeta `/tests` (en la raíz, no dentro de `src`).
*   **Manejo de Errores**: Actualmente básico en los controladores. Se recomienda implementar un middleware global.