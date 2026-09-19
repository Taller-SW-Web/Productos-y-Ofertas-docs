# HU-010 — Historia de Usuario: Asociación entre categorías y características

**Como** **gestor comercial**,

**quiero** definir qué características son aplicables a cada categoría, indicando si son obligatorias u opcionales

**para** que el módulo de Catálogo Core pueda construir formularios de producto dinámicos y consistentes según la categoría elegida.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe permitir asociar una característica existente a una categoría existente, indicando si es obligatoria u opcional. |
| **CA-02** | El sistema no debe permitir asociar una misma característica dos veces a la misma categoría. |
| **CA-03** | El sistema debe permitir eliminar la asociación entre una característica y una categoría cuando ya no sea aplicable. |
| **CA-04** | El sistema debe exponer, para una categoría dada, el listado de características aplicables junto con su condición de obligatoriedad, vía API de solo lectura. |
| **CA-05** | Si una categoría o característica se desactiva, sus asociaciones deben dejar de considerarse activas, sin necesidad de eliminarlas físicamente. |
| **CA-06** | Las características asociadas a una categoría padre se heredan automáticamente a sus subcategorías; las asociaciones heredadas no se duplican físicamente. |
| **CA-07** | Una característica obligatoria heredada no puede convertirse en opcional en una subcategoría. |
| **CA-08** | Una categoría puede tener como máximo 20 características efectivas, contando directas y heredadas sin duplicados. |
| **CA-09** | Si una característica cambia de opcional a obligatoria, los productos existentes no se invalidan inmediatamente; la obligatoriedad se exige en la siguiente edición/guardado. |
| **CA-10** | La consulta debe indicar las características efectivas de la categoría, su obligatoriedad y si su origen es directo o heredado. |

| **CA-11** | Asociar o activar una característica en una categoría padre verifica que ninguna hija exceda 20 características efectivas; de lo contrario la operación se rechaza íntegramente. |
| **CA-12** | Reasignar el padre recalcula herencia, obligatoriedad y límite de 20 en las categorías afectadas antes de guardar. |

## Escenarios dado-cuando-entonces

**Escenario 1: Asociación exitosa de una característica obligatoria**

* **DADO** que existen la categoría "Zapatillas" (id 10) y la característica "Talla" (id 3), ambas activas,
* **CUANDO** el gestor comercial asocia la característica 3 a la categoría 10 marcándola como obligatoria,
* **ENTONCES** el sistema registra la asociación y la característica "Talla" aparece como obligatoria al consultar las características de "Zapatillas".

**Escenario 2: Intento de asociar una característica ya asociada a la misma categoría**

* **DADO** que la característica "Talla" ya está asociada a la categoría "Zapatillas",
* **CUANDO** el gestor comercial intenta asociar nuevamente "Talla" a "Zapatillas",
* **ENTONCES** el sistema rechaza la operación e indica que la asociación ya existe.

**Escenario 3: Consulta exitosa de características de una categoría**

* **DADO** que la categoría "Zapatillas" tiene asociadas las características "Talla" (obligatoria) y "Color" (opcional),
* **CUANDO** el módulo de Catálogo Core solicita las características de la categoría "Zapatillas",
* **ENTONCES** el sistema devuelve ambas características indicando correctamente cuál es obligatoria y cuál opcional.

**Escenario 4: Consulta de características de una categoría sin asociaciones**

* **DADO** que la categoría "Accesorios Varios" no tiene ninguna característica asociada,
* **CUANDO** se solicita el listado de características de esa categoría,
* **ENTONCES** el sistema devuelve una lista vacía sin generar error.

**Escenario 5: Desasociación exitosa**

* **DADO** que la característica "Material" está asociada a la categoría "Balones",
* **CUANDO** el gestor comercial elimina esa asociación,
* **ENTONCES** el sistema deja de listar "Material" como característica aplicable a "Balones".

**Escenario 6: Intento de desasociar una relación inexistente**

* **DADO** que la característica "Talla" nunca fue asociada a la categoría "Balones",
* **CUANDO** el gestor comercial intenta eliminar esa asociación inexistente,
* **ENTONCES** el sistema devuelve un error indicando que la asociación no existe.


**Escenario 7: Herencia a subcategoría**

* **DADO** que "Talla" es obligatoria en la categoría padre "Calzado",
* **CUANDO** Catálogo Core consulta las características de la subcategoría "Zapatillas",
* **ENTONCES** devuelve "Talla" como obligatoria y heredada.

**Escenario 8: Cambio de opcional a obligatoria**

* **DADO** que existen productos antiguos sin "Color",
* **CUANDO** "Color" pasa de opcional a obligatoria,
* **ENTONCES** los productos conservan su estado hasta su próxima edición; al guardarlos, se exige completar "Color".

**Escenario 9: Límite de características**

* **DADO** que una categoría ya posee 20 características efectivas,
* **CUANDO** el gestor intenta agregar una adicional,
* **ENTONCES** el sistema rechaza la asociación.

**Escenario 10: Herencia que excede el límite de una hija**
* **DADO** que una subcategoría ya tiene 20 características efectivas,
* **CUANDO** se agrega otra característica nueva al padre,
* **ENTONCES** se rechaza la asociación del padre sin alterar a ninguna hija.

## Interacción con otros módulos

| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| --- | --- | --- | --- |
| **Seguridad y Usuarios** | Verificar que quien crea o elimina asociaciones tenga el rol de gestor comercial. | Identidad del usuario, token de sesión, roles y permisos. | Solicitudes de validación de permisos para las operaciones de escritura. |
| **Catálogo Core (Productos)** | Consultar, al crear o editar un producto, qué características debe solicitar según la categoría seleccionada. | Identificador de la categoría del producto a crear/editar. | Listado de características aplicables a esa categoría, con su condición de obligatoriedad. |

## Dependencias dentro de Productos y Ofertas

| **Funcionalidad interna** | **Información necesaria** |
| --- | --- |
| **Gestión de categorías y subcategorías** | Identificador y estado (activo/inactivo) de la categoría a la que se asocian las características. |
| **Gestión de características y sus valores** | Identificador y estado (activo/inactivo) de la característica a asociar. |

## Reglas de negocio consolidadas

* **Herencia:** las asociaciones del padre se heredan automáticamente a las subcategorías.
* **Límite:** máximo 20 características efectivas por categoría, contando directas y heredadas sin duplicados.
* **Obligatoriedad:** el cambio de opcional a obligatoria no invalida productos preexistentes; se exige al siguiente guardado.
* **Precedencia:** una obligatoriedad heredada no puede relajarse en la subcategoría.

---
