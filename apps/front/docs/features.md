## FEATURES

1. Setups del proyecto y una primera pagina con un formulario de login y password, recibira un JSON con un formato igual a

```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyZDljMzhhLWY0YjEtNDAwNi1hNGQyLTZhMzJhYmZhM2NkOSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzY5ODk4NzkyLCJleHAiOjE3Njk5ODUxOTJ9.QWCaVhOYsALEnMzm7Duz3rFjLQUA3IZgiBfS3m26jfQ",
    "user": {
        "id": "12d9c38a-f4b1-4006-a4d2-6a32abfa3cd9",
        "email": "prueba@gmail.com",
        "role": "USER"
    }
}

```

el endpoint para logearse es "http://127.0.0.1:3000/auth/login". Habra un enlace que abrira un formulario donde dar de alta a un ususario "{{baseUrl}}/auth/register" con los campos

```
  "email": "prueba@gmail.com",
  "password": "admin1234",
  "firstName": "prueba",
  "lastName": "prueba"
```

2. Contexto: Implementación de la lógica de carga del Dashboard post-login.

Objetivo: Desarrollar la funcionalidad de carga de datos iniciales en el Dashboard basándose en el rol del usuario y los datos obtenidos en la autenticación.

Especificaciones Técnicas:

Origen de datos: Durante el login, se debe persistir el clientId y el role del usuario.

Lógica de Negocio por Rol:

Usuario Estándar: Tras el login, redirigir al Dashboard y realizar una petición GET a: {{baseUrl}}/clients/{clientId}/financial-entities.

Administrador: Tras el login, el Dashboard debe cargar y mostrar un listado global de clientes (Endpoint sugerido: {{baseUrl}}/clients).

Requerimientos de UI:

Implementar un estado de carga (loading) mientras se resuelven las peticiones.

Manejo de errores en caso de que la petición al endpoint falle.

Renderizar los datos obtenidos en una lista o tabla clara.

3. Contexto: Implementación de Navegación Principal y Layout Persistente.

Objetivo: Desarrollar un componente de Layout que envuelva las vistas protegidas, proporcionando una barra de navegación superior (Tabs) consistente.

Especificaciones Técnicas:

- **Componente Layout**: Crear `MainLayout` que incluya la Navbar y un `<Outlet />`.
- **Lógica de Menú por Rol**:
  - USER: "Mis Entidades" (/dashboard), "Productos" (/products), "Entidades" (/financial-entities).
  - ADMIN: "Clientes" (/dashboard), "Productos" (/products), "Entidades" (/financial-entities).
- **Estilado**: Utilizar Tailwind CSS para crear una interfaz de pestañas limpia, con estado "activo" visual.
- **Integración**: Refactorizar `App.tsx` para que las rutas protegidas sean hijas de este Layout.

4. Contexto: Implementación de Vistas de Listado (Productos y Entidades).

Objetivo: Completar la navegación del sistema implementando las páginas de listado restantes para las pestañas definidas.

Especificaciones Técnicas:

- **Página Productos**: Crear `ProductsPage` que consuma `GET /products`. Mostrar tabla detallada (Nombre, Tipo, Estado, Balance).
- **Página Entidades**: Crear `FinancialEntitiesPage` que consuma `GET /financial-entities`.
- **Consistencia**: Replicar el patrón de diseño (Loading, Error, Tabla Tailwind) utilizado en el Dashboard.
- **Routing**: Vincular los nuevos componentes en `App.tsx` bajo el `MainLayout`.

5. Rol: Senior Frontend Developer (React + Vitest).

- **Contexto**: Estamos desarrollando una aplicación financiera (MyFintonic). Ya tenemos autenticación y un dashboard básico. Necesitamos implementar la gestión completa (CRUD) de Productos Financieros.

- **Tarea**: Implementar la lógica de Vistas y Formularios siguiendo TDD.

- **Requisitos Funcionales**:

Listados (ProductsPage ):
Mostrar tabla de registros.
Navegación: Al hacer clic en el nombre de un ítem, navegar a su formulario de edición (ej: /products/:id).
Borrado: Incluir un botón de "Eliminar" en cada fila que pida confirmación y refresque la lista.
Formularios (ProductFormPage):
Deben servir tanto para Crear (ruta /new) como para Editar (ruta /:id).
Campos Producto: Según OpenAPI (Nombre, Tipo, Entidad, Estado, Balance, etc.).
Campos Entidad Cliente: Entidad (Select del catálogo) y Balance.
Acciones: Botón "Guardar" y, si es edición, botón "Eliminar" (mismo comportamiento que en el listado).
Diferenciar entre los distintos productos con un select que permita mostrar los campos necesatios segun el producto, esto solo se mostrara en la creacion y sera fijo en la edicion puesto que sera el type

Requisitos Técnicos:

- **Testing** (Prioridad): Escribir primero los tests de integración (Vitest + Testing Library) simulando navegación, relleno de formularios y llamadas a API (Axios mock).
  UI: Usar Tailwind CSS.
  Estado: Gestionar loading y error.

6. Rol: Senior Frontend Developer (React + Vitest).

Contexto: En la aplicación MyFintonic, los usuarios con rol USER visualizan sus entidades financieras en el Dashboard. Actualmente es solo lectura. Necesitamos permitirles gestionar estas asociaciones (vincularse a nuevas entidades o actualizar sus balances).

Tarea: Implementar el flujo de creación y edición de asociaciones de entidades financieras (ClientFinancialEntity) siguiendo TDD.

Requisitos Funcionales:

Dashboard (Vista USER):

Botón de Creación: Incluir un botón "Vincular Entidad" visible únicamente cuando el usuario tiene rol USER.
Acción: Navegar a la ruta de creación (ej: /client-entities/new).
Navegación a Edición: En la tabla de entidades del usuario, el nombre de la entidad debe funcionar como un enlace.
Acción: Navegar a la ruta de edición de esa asociación específica (ej: /client-entities/:id).
Formulario de Asociación (ClientFinancialEntityFormPage):

Debe manejar tanto la creación como la edición.
Campos:
Entidad Financiera: Un select que cargue el catálogo desde GET /financial-entities. (En modo edición, este campo debe estar deshabilitado o ser de solo lectura).
Balance: Campo numérico para el saldo.
Integración API:
Crear: POST /clients/{clientId}/financial-entities (enviando financialEntityId y balance).
Editar: PUT /clients/{clientId}/financial-entities/{id} (enviando balance).
Detalle: GET /clients/{clientId}/financial-entities/{id}.
Requisitos Técnicos:

Testing (Prioridad):
Crear ClientFinancialEntityFormPage.test.tsx simulando la carga del catálogo, envío del formulario y manejo de errores.
Actualizar DashboardPage.test.tsx para verificar que el botón de creación aparece solo para USER y que la navegación funciona.
Routing: Añadir las rutas necesarias en App.tsx.
UI: Mantener consistencia con Tailwind CSS.


--------------
el en formulario de Viculacion de cliente y quiero hacer un componente visual que muestre el historico de valores pero solo los 10 ultimos, que salga fuera del propio formulario y se vea la fecha de la actualizacion, el valor que tenia previo previousValue, el value y el porcentaje de diferencia de los dos valores
