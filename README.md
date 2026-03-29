# MyFintonic 🚀

**MyFintonic** es una aplicación integral de gestión de activos financieros personales diseñada para realizar un seguimiento y gestión de diversos productos de inversión como fondos indexados, depósitos a plazo fijo, robo-advisors, acciones y cuentas corrientes.

Construido como un **Monorepo** utilizando TurboRepo, unifica una API Backend robusta y una interfaz Frontend, cumpliendo con los estándares de ingeniería de software, seguridad y calidad de código.

---

## 🏗️ Arquitectura de Software

Es una arquitectura escalable diseñada para la mantenibilidad y el crecimiento a largo plazo.

### 🔙 Backend (`@myfintonic/api`)

- **Core:** Node.js & TypeScript.
- **Patrones de Diseño:** Sigue estrictamente **Domain-Driven Design (DDD)** y **Clean Architecture**.
  - **Domain:** Lógica de negocio pura, entidades e interfaces de repositorio. Cero dependencias externas.
  - **Application:** Casos de uso y orquestación.
  - **Infrastructure:** Detalles de implementación (Base de datos, HTTP, Servicios Externos).
- **Seguridad (OWASP):** Implementa mejores prácticas de seguridad incluyendo Helmet, Rate Limiting, Validación de Entrada (Zod) y autenticación segura (JWT + Bcrypt).
- **Documentación:** API totalmente documentada vía **OpenAPI (Swagger)**.

### 🔜 Frontend (`@myfintonic/front`)

- **Core:** React & Vite.
- **Estructura:** **Feature-Based Architecture (Screaming Architecture)**.
  - El código se organiza por funcionalidades de negocio (ej. `auth`, `investments`, `dashboard`) en lugar de capas técnicas, haciendo que la base de código sea intuitiva y fácil de navegar.

---

## 🛡️ Calidad y Testing (Quality Gates)

La calidad no es una ocurrencia tardía; se aplica en cada paso del ciclo de vida del desarrollo.

| Métrica                    | Objetivo | Estado        |
| :------------------------- | :------- | :------------ |
| **Cobertura de Funciones** | 100%     | ✅ Conseguido |
| **Cobertura de Líneas**    | >80%     | ✅ Conseguido |

### Controles Automatizados

- **Husky & Git Hooks:**
  - **Pre-commit:** Ejecuta `lint-staged` (formato y linting) y Tests Unitarios. Los commits fallan si no se cumplen los estándares.
  - **Pre-push:** Ejecuta auditorías de seguridad (`npm audit`) para asegurar que no se suben vulnerabilidades al repositorio.
- **Seguridad:** Escaneo automatizado de dependencias vía `npm audit`.

---

## 🛠️ Stack Tecnológico

| Categoría           | Tecnología             | Descripción                                                            |
| :------------------ | :--------------------- | :--------------------------------------------------------------------- |
| **Monorepo**        | **TurboRepo**          | Sistema de construcción de alto rendimiento para monorepos JS/TS.      |
| **Lenguajes**       | **TypeScript**         | Superset tipado de JavaScript.                                         |
| **Backend**         | **Node.js / Express**  | Framework web minimalista y rápido.                                    |
| **Frontend**        | **React / Vite**       | Librería UI moderna con herramientas de construcción ultrarrápidas.    |
| **Base de Datos**   | **MySQL (TiDB Cloud)** | Base de datos SQL distribuida, gestionada vía **Prisma ORM**.          |
| **Testing**         | **Vitest**             | Framework de pruebas unitarias extremadamente rápido.                  |
| **Validación**      | **Zod**                | Declaración y validación de esquemas TypeScript-first.                 |
| **Infraestructura** | **Docker**             | Contenerización para entornos consistentes de desarrollo y despliegue. |

---

## 🚀 CI/CD y Despliegue

Nuestro pipeline asegura que el código sea probado, construido y desplegado de forma segura.

- **Pipeline CI:** **GitHub Actions** se ejecuta en cada Pull Request.
  - Impone restricciones en ramas protegidas (`develop`, `master`).
  - Ejecuta procesos de Linting, Testing y Build.
- **Despliegue en Producción:**
  - **API:** Desplegada en **Render**.
  - **Frontend:** Desplegado en **Vercel**.
  - **Base de Datos:** Alojada en **TiDB Cloud**.

---

## 💻 Instalación y Uso Local

Sigue estos pasos para levantar el proyecto en tu máquina local.

### Prerrequisitos

- Node.js (>= v20)
- Docker & Docker Compose
- npm (>= v10)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/myfintonic/myfintonic.git
cd myfintonic
```

### 2. Instalar Dependencias

```bash
npm install
```

_Esto instalará las dependencias para el root, api y frontend workspaces._

### 3. Configuración de Entorno

Crea los archivos `.env` en `apps/api` y `apps/front` basándote en sus respectivos archivos `.env.example`. También necesitas el archivo .env en docker

### 4. Iniciar Infraestructura (Docker) en Local

Levanta la base de datos y otros servicios usando Docker Compose:

```bash
npm run docker:dev
```

### 5. Configuración de Base de Datos

Genera el cliente de Prisma y aplica migraciones:

```bash
npm run db:generate
npm run db:migrate
```

### 6. Ejecutar la Aplicación

Inicia tanto la API como el Frontend en modo desarrollo sin base de datos:

```bash
npm run dev
```

- **API:** http://localhost:3000
- **Frontend:** http://localhost:5173 (o el puerto indicado en terminal)

---

## 🤝 Contribución

1.  Crea una rama feature desde `develop` (`git checkout -b feature/nueva-funcionalidad`).
2.  Haz commit de tus cambios (Husky ejecutará verificaciones pre-commit).
3.  Haz push a la rama (Husky ejecutará auditorías de seguridad).
4.  Abre un Pull Request hacia `develop`.

#### Convenciones de Desarrollo

El proyecto sigue un modelo de ramas similar a GitFlow, reforzado por GitHub Actions:

- **Desarrollo de Funcionalidades:** Las nuevas funcionalidades deben desarrollarse en ramas llamadas `feature/<nombre-funcionalidad>`. Estas ramas deben fusionarse en la rama `develop` a través de un pull request.
- **Lanzamientos:** La rama `develop` se fusiona en la rama `master` para crear un nuevo lanzamiento.
- **Hotfixes:** Las correcciones urgentes para la versión de producción deben desarrollarse en ramas llamadas `hotfix/<nombre-correccion>`. Estas ramas se fusionan directamente en la rama `master`.

Todos los pull requests a `master` deben provenir de `develop` o de una rama `hotfix/*`.

---

**MyFintonic** - _Empowering your financial future._
