**Como** **gestor comercial**,

**quiero** crear, organizar y mantener las categorías y subcategorías del catálogo

**para** que los clientes y canales de venta puedan navegar y filtrar los productos correctamente, y otros módulos puedan clasificarlos de forma consistente.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe permitir crear una categoría con nombre y descripción, indicando opcionalmente una categoría padre para formar una subcategoría. El nombre de la categoría NO necesita ser único (la unicidad se garantiza a nivel de slug, ver capacidad "Gestión de SEO y metadatos"). |
| **CA-02** | La jerarquía se limita a un máximo de 2 niveles: categoría raíz y subcategoría. No se permiten sub-subcategorías. |
| **CA-03** | El sistema no debe permitir que una categoría se asigne como su propia categoría padre. |
| **CA-04** | El sistema debe permitir actualizar nombre, descripción, orden, imagen y **categoría padre** de una categoría existente, sin afectar los productos ya asociados a ella. |
| **CA-05** | Al cambiar la categoría padre de una categoría, el sistema debe validar que el nuevo padre esté activo y que el cambio no genere más de 2 niveles de jerarquía. |
| **CA-06** | El sistema debe permitir desactivar (baja lógica) una categoría, impidiendo la desactivación si tiene subcategorías activas o productos activos asociados. |
| **CA-07** | El sistema debe permitir reactivar una categoría previamente desactivada, siempre que su categoría padre (si tiene) esté activa. |
| **CA-08** | El sistema NUNCA debe eliminar físicamente una categoría; toda baja es lógica (cambio de estado). |
| **CA-09** | El sistema debe exponer una consulta del árbol jerárquico completo de categorías activas (padre con sus hijos). |
| **CA-10** | El sistema debe exponer un endpoint de solo lectura con las categorías activas, para ser consumido por otros módulos y canales de venta. |

## Escenarios dado-cuando-entonces

**Escenario 1: Creación exitosa de una categoría raíz**

* **DADO** que el gestor comercial está autenticado y no indica categoría padre,
* **CUANDO** envía nombre "Zapatillas" y descripción válida,
* **ENTONCES** el sistema crea la categoría con estado ACTIVO y la registra sin categoría padre.

**Escenario 2: Creación exitosa de una subcategoría**

* **DADO** que existe la categoría activa "Zapatillas" con id 10 (nivel raíz),
* **CUANDO** el gestor comercial crea la categoría "Running" indicando categoria_padre_id = 10,
* **ENTONCES** el sistema registra "Running" como subcategoría de "Zapatillas" y esta aparece anidada al consultar el árbol jerárquico.

**Escenario 3: Intento de crear más de 2 niveles de jerarquía**

* **DADO** que "Running" ya es una subcategoría de "Zapatillas" (nivel 2),
* **CUANDO** el gestor comercial intenta crear una nueva categoría indicando "Running" como categoría padre,
* **ENTONCES** el sistema rechaza la operación e indica que se excede el máximo de 2 niveles permitidos.

**Escenario 4: Creación de una categoría con nombre repetido en otra rama**

* **DADO** que ya existe la categoría "Accesorios" como subcategoría de "Running",
* **CUANDO** el gestor comercial crea otra categoría "Accesorios" como subcategoría de "Fútbol",
* **ENTONCES** el sistema permite la creación, ya que el nombre no requiere ser único (solo el slug, gestionado en la capacidad de SEO, se valida como único).

**Escenario 5: Intento de asignar una categoría como padre de sí misma**

* **DADO** que existe la categoría "Zapatillas" con id 10,
* **CUANDO** el gestor comercial intenta actualizar la categoría 10 indicando categoria_padre_id = 10,
* **ENTONCES** el sistema rechaza la operación e informa que una categoría no puede ser su propia categoría padre.

**Escenario 6: Actualización exitosa de la categoría padre (mover de rama)**

* **DADO** que la categoría "Accesorios" (subcategoría de "Running") y la categoría raíz activa "Fútbol" existen,
* **CUANDO** el gestor comercial actualiza "Accesorios" indicando "Fútbol" como su nueva categoría padre,
* **ENTONCES** el sistema mueve "Accesorios" bajo "Fútbol", validando que "Fútbol" esté activa y sea de nivel raíz.

**Escenario 7: Desactivación exitosa de una categoría sin subcategorías ni productos activos**

* **DADO** que la categoría "Running" con id 15 no tiene subcategorías ni productos activos,
* **CUANDO** el gestor comercial solicita desactivarla,
* **ENTONCES** el sistema cambia su estado a INACTIVO y deja de mostrarla en las consultas de navegación de los canales.

**Escenario 8: Intento de desactivar una categoría con subcategorías o productos activos**

* **DADO** que la categoría "Zapatillas" con id 10 tiene la subcategoría activa "Running" (o productos activos asociados),
* **CUANDO** el gestor comercial solicita desactivar la categoría "Zapatillas",
* **ENTONCES** el sistema rechaza la operación e indica que primero deben desactivarse sus subcategorías o desvincularse sus productos.

**Escenario 9: Reactivación exitosa de una categoría**

* **DADO** que la categoría "Running" está INACTIVA y su categoría padre "Zapatillas" está ACTIVA,
* **CUANDO** el gestor comercial solicita reactivarla,
* **ENTONCES** el sistema cambia su estado a ACTIVO y vuelve a mostrarla en las consultas de navegación.

**Escenario 10: Intento de reactivar una categoría cuyo padre está inactivo**

* **DADO** que la categoría "Running" está INACTIVA y su categoría padre "Zapatillas" también está INACTIVA,
* **CUANDO** el gestor comercial solicita reactivar "Running",
* **ENTONCES** el sistema rechaza la operación e indica que primero debe reactivarse la categoría padre.

## Interacción con otros módulos

| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| --- | --- | --- | --- |
| **Seguridad y Usuarios** | Verificar que quien crea, edita, desactiva o reactiva categorías tenga el rol de gestor comercial. | Identidad del usuario, token de sesión, roles y permisos. | Solicitudes de validación de permisos para las operaciones de escritura. |
| **Catálogo Core (Productos)** | Consultar categorías activas y su jerarquía al momento de clasificar un producto. Al intentar desactivar una categoría, se realiza una llamada **síncrona** a Catálogo Core para validar si tiene productos activos asociados, antes de completar la operación. | Identificador de categoría a validar. | Listado de categorías activas, con id, nombre y jerarquía, vía API; confirmación síncrona (sí/no) de si existen productos activos asociados a la categoría. |
| **Canales de venta (Marketplace, Chatbot, Retail)** | Mostrar el árbol de categorías para navegación y filtros de búsqueda. | (No hay interacción directa; solo consume el resultado). | Árbol jerárquico de categorías activas para renderizar menús y filtros. |

## Dependencias dentro de Productos y Ofertas

| **Funcionalidad interna** | **Información necesaria** |
| --- | --- |
| **Asociación entre categorías y características** | Identificador de la categoría, para vincularle las características aplicables. |
| **Gestión de SEO y metadatos** | Identificador y nombre de la categoría, sobre los cuales se configuran el slug (único) y los metadatos SEO. |

## Reglas resueltas (antes pendientes)

* **Niveles de jerarquía:** máximo 2 niveles (categoría → subcategoría).
* **Eliminación física:** nunca se permite; solo baja lógica.
* **Categoría con productos asociados:** no puede desactivarse mientras tenga productos activos vinculados (misma regla que con subcategorías).
* **Unicidad del nombre:** el nombre de categoría no es único; la unicidad se garantiza a nivel de slug.

* **Validación de productos asociados:** se resuelve como una llamada **síncrona** al módulo de Catálogo Core al momento de intentar desactivar una categoría. Se eligió síncrono sobre caché porque el equipo maneja un solo módulo compartido: es más simple de implementar y evita el riesgo de que la validación quede desactualizada (ej. permitir una desactivación con datos de caché obsoletos, dejando productos huérfanos). Como contraparte, si Catálogo Core no responde a tiempo, la desactivación debe rechazarse con un mensaje de "no se pudo validar, intente nuevamente" en vez de asumir que no hay productos asociados.
* **Timeout de la validación síncrona:** 15 segundos. Si Catálogo Core no responde dentro de ese lapso, la operación de desactivación se rechaza automáticamente.