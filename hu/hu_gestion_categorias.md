**Como** **gestor comercial**,

**quiero** crear, organizar y mantener las categorías y subcategorías del catálogo

**para** que los clientes y canales de venta puedan navegar y filtrar los productos correctamente, y otros módulos puedan clasificarlos de forma consistente.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe permitir crear una categoría con nombre y descripción, indicando opcionalmente una categoría padre para formar una subcategoría. |
| **CA-02** | El sistema debe generar automáticamente un slug único para cada categoría creada. |
| **CA-03** | El sistema no debe permitir que una categoría se asigne como su propia categoría padre (evitar referencias circulares). |
| **CA-04** | El sistema debe permitir actualizar nombre, descripción, orden e imagen de una categoría existente, sin afectar los productos ya asociados a ella. |
| **CA-05** | El sistema debe permitir desactivar (baja lógica) una categoría, impidiendo la desactivación si tiene subcategorías activas asociadas. |
| **CA-06** | El sistema debe exponer una consulta del árbol jerárquico completo de categorías (padre con sus hijos). |
| **CA-07** | El sistema debe exponer un endpoint de solo lectura con las categorías activas, para ser consumido por otros módulos y canales de venta. |

## Escenarios dado-cuando-entonces

**Escenario 1: Creación exitosa de una categoría raíz**

* **DADO** que el gestor comercial está autenticado y no indica categoría padre,
* **CUANDO** envía nombre "Zapatillas" y descripción válida,
* **ENTONCES** el sistema crea la categoría con estado ACTIVO, genera el slug "zapatillas" y la registra sin categoría padre.

**Escenario 2: Creación exitosa de una subcategoría**

* **DADO** que existe la categoría activa "Zapatillas" con id 10,
* **CUANDO** el gestor comercial crea la categoría "Running" indicando categoria\_padre\_id = 10,
* **ENTONCES** el sistema registra "Running" como subcategoría de "Zapatillas" y esta aparece anidada al consultar el árbol jerárquico.

**Escenario 3: Intento de asignar una categoría como padre de sí misma**

* **DADO** que existe la categoría "Zapatillas" con id 10,
* **CUANDO** el gestor comercial intenta actualizar la categoría 10 indicando categoria\_padre\_id = 10,
* **ENTONCES** el sistema rechaza la operación e informa que una categoría no puede ser su propia categoría padre.

**Escenario 4: Intento de crear una categoría con nombre duplicado**

* **DADO** que ya existe una categoría activa con el nombre "Zapatillas",
* **CUANDO** el gestor comercial intenta crear otra categoría con el mismo nombre,
* **ENTONCES** el sistema rechaza la operación y devuelve un mensaje indicando que el nombre (o el slug generado) ya existe.

**Escenario 5: Desactivación exitosa de una categoría sin subcategorías**

* **DADO** que la categoría "Running" con id 15 no tiene subcategorías activas,
* **CUANDO** el gestor comercial solicita desactivarla,
* **ENTONCES** el sistema cambia su estado a INACTIVO y deja de mostrarla en las consultas de navegación de los canales.

**Escenario 6: Intento de desactivar una categoría con subcategorías activas**

* **DADO** que la categoría "Zapatillas" con id 10 tiene la subcategoría activa "Running",
* **CUANDO** el gestor comercial solicita desactivar la categoría "Zapatillas",
* **ENTONCES** el sistema rechaza la operación e indica que primero deben desactivarse sus subcategorías.

## Interacción con otros módulos

| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| --- | --- | --- | --- |
| **Seguridad y Usuarios** | Verificar que quien crea, edita o desactiva categorías tenga el rol de gestor comercial. | Identidad del usuario, token de sesión, roles y permisos. | Solicitudes de validación de permisos para las operaciones de escritura. |
| **Catálogo Core (Productos)** | Consultar categorías activas y su jerarquía al momento de clasificar un producto. | (No hay interacción directa; solo consume el resultado). | Listado de categorías activas, con id, nombre y jerarquía, vía API. |
| **Canales de venta (Marketplace, Chatbot, Retail)** | Mostrar el árbol de categorías para navegación y filtros de búsqueda. | (No hay interacción directa; solo consume el resultado). | Árbol jerárquico de categorías activas para renderizar menús y filtros. |

## Dependencias dentro de Productos y Ofertas

| **Funcionalidad interna** | **Información necesaria** |
| --- | --- |
| **Asociación entre categorías y características** | Identificador de la categoría, para vincularle las características aplicables. |
| **Gestión de SEO y metadatos** | Identificador y nombre de la categoría, sobre los cuales se configuran el slug y los metadatos SEO. |

## Reglas pendientes de acordar

* **Niveles de jerarquía:** ¿la estructura se limita a un solo nivel (categoría → subcategoría) o debe soportar múltiples niveles anidados?
* **Categorías con productos asociados:** si una categoría tiene productos activos vinculados, ¿se debe impedir su desactivación (igual que con las subcategorías) o se permite y los productos quedan huérfanos temporalmente?
* **Eliminación física:** ¿en algún caso se permitirá eliminar físicamente una categoría (ej. creada por error, sin uso), o siempre será baja lógica?
