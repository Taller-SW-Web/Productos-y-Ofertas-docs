# HU-007 — Historia de Usuario: Reglas de venta cruzada y upselling

Proyecto: Módulo de Productos y Ofertas.
Responsabilidad: Persona 4 — Axel Cueva.
Versión corregida: 2026-09-16.

## Funcionalidad

Reglas de venta cruzada: Cross-sell y Upsell — Valor agregado.

## Historia de usuario

**Como** gestor comercial,
**quiero** configurar relaciones manuales o reglas lógicas que vinculen productos o categorías con complementos o alternativas superiores,
**para** que los canales de venta presenten recomendaciones pertinentes durante la compra.

**Cross-sell:** complemento del producto consultado.
**Upsell:** alternativa que el gestor comercial clasifica explícitamente como superior y justifica mediante una mejora concreta.

La clasificación es una decisión comercial manual: por cada alternativa Upsell, el gestor registra una justificación que mencione una característica o prestación identificable en la ficha del producto recomendado (por ejemplo, mejor amortiguación, material más resistente o funcionalidad adicional). Cuando el origen es una categoría, la mejora se justifica respecto del tipo de productos de esa categoría. El sistema comprueba que exista una justificación, pero no comprueba automáticamente su veracidad ni infiere superioridad por un precio mayor.

## Modelo de ordenamiento consolidado

Cada regla tiene una **prioridad de regla**.
Cada producto recomendado dentro de la regla tiene un **orden de presentación**.

- Prioridad `1` es mayor que prioridad `2`.
- Primero se ordenan las reglas por prioridad ascendente.
- Dentro de una regla, se respetan los productos por su orden ascendente.
- Si el mismo producto aparece por varias reglas, se conserva la primera aparición según ese orden y se elimina el duplicado.

**Decisión de interfaz:** la consulta de recomendaciones se mantiene como capacidad de API para Marketplace, Chatbot y Retail; no existe una pantalla administrativa independiente «Probar recomendaciones».

## Criterios de aceptación

| ID | Criterio |
| --- | --- |
| CA-01 | Solo un gestor comercial con permisos puede crear, modificar, activar o desactivar reglas. |
| CA-02 | Cada regla debe incluir nombre, tipo —Cross-sell o Upsell—, origen que la activa, prioridad, fecha/hora de inicio y fin, estado y al menos un producto recomendado. |
| CA-03 | El origen puede ser un producto específico o una categoría. |
| CA-04 | Los productos configurados deben existir y estar activos. No se permite recomendar el mismo producto de origen ni repetir un producto dentro de la misma regla. |
| CA-05 | En una regla UPSELL, el gestor comercial debe clasificar explícitamente cada producto recomendado como alternativa superior y registrar para cada uno una `justificacion_comercial` no vacía que describa una mejora concreta respecto del producto origen o, si el origen es una categoría, respecto del tipo de productos de esa categoría. La mejora debe referirse a una característica o prestación identificable en la ficha del recomendado. El precio mayor por sí solo no es justificación suficiente; el sistema no determina ni verifica automáticamente la superioridad. |
| CA-06 | El gestor puede establecer el orden de los productos recomendados dentro de cada regla. |
| CA-07 | Una regla solo participa si está activa, vigente y su condición de producto o categoría coincide con la consulta. |
| CA-08 | La respuesta excluye productos inactivos o sin stock y elimina duplicados entre reglas. |
| CA-09 | La respuesta identifica producto recomendado, tipo de recomendación, prioridad de regla, orden de presentación, precio vigente y disponibilidad. |
| CA-10 | Las recomendaciones se ordenan por prioridad de regla y luego por orden de producto. |
| CA-11 | Si no existen recomendaciones válidas, se devuelve una lista vacía. Las recomendaciones no agregan ni reemplazan productos automáticamente. |
| CA-12 | Si falta la justificación comercial de cualquiera de los productos recomendados por una regla UPSELL, el sistema rechaza su creación o modificación e identifica cuál debe completarse. La consulta administrativa muestra la justificación por producto; su exposición en la API para canales no es obligatoria. |

## Escenarios dado-cuando-entonces

### Escenario 1: Configurar una relación Cross-sell

* **DADO** que existen unas zapatillas y unas medias activas,
* **CUANDO** el gestor registra una regla Cross-sell vigente con prioridad 1, las zapatillas como origen y las medias como complemento,
* **ENTONCES** el sistema guarda la relación y permite consultarla mientras esté activa y vigente.

### Escenario 2: Configurar una relación Upsell

* **DADO** que existen unas zapatillas básicas y otras con una tecnología de amortiguación identificable en su ficha,
* **CUANDO** el gestor registra una regla UPSELL vigente, clasifica las segundas como alternativa superior y guarda para ellas la justificación «incorporan tecnología de amortiguación adicional»,
* **ENTONCES** el sistema guarda la relación y su justificación para revisión administrativa, sin reemplazar automáticamente el producto elegido por el cliente.

### Escenario 2A: Rechazar un Upsell sin justificación concreta

* **DADO** que el gestor configura una regla UPSELL con un producto recomendado,
* **CUANDO** intenta guardarla sin `justificacion_comercial`,
* **ENTONCES** el sistema rechaza la operación, indica qué producto carece de justificación y conserva los datos para corregirlos.

### Escenario 2B: Justificar un Upsell cuyo origen es una categoría

* **DADO** que el gestor configura una regla UPSELL con origen «Zapatillas de running»,
* **CUANDO** registra un producto recomendado y justifica una mejora concreta respecto del tipo de productos de esa categoría,
* **ENTONCES** el sistema guarda la clasificación y la justificación asociada al recomendado, sin verificar automáticamente la superioridad frente a cada producto de la categoría.

### Escenario 3: Activar una regla por categoría

* **DADO** que existe una regla activa y vigente para la categoría Zapatillas,
* **CUANDO** un canal consulta recomendaciones para un producto activo de esa categoría,
* **ENTONCES** el sistema devuelve los productos recomendados que estén activos y tengan stock.

### Escenario 4: Excluir una regla vencida

* **DADO** que una regla ya superó su fecha de fin,
* **CUANDO** un canal solicita recomendaciones,
* **ENTONCES** el sistema no considera esa regla.

### Escenario 5: Ordenar por prioridad y orden interno

* **DADO** que coinciden dos reglas válidas, una con prioridad 1 y otra con prioridad 2,
* **CUANDO** se generan las recomendaciones,
* **ENTONCES** primero se consideran los productos de la regla prioridad 1 respetando su orden interno y después los de prioridad 2.

### Escenario 6: Eliminar duplicados entre reglas

* **DADO** que dos reglas válidas recomiendan el mismo producto,
* **CUANDO** se arma la respuesta,
* **ENTONCES** el producto aparece una sola vez, conservando la primera aparición según prioridad y orden.

### Escenario 7: Filtrar recomendaciones no disponibles

* **DADO** que una regla contiene productos inactivos o sin stock,
* **CUANDO** un canal solicita recomendaciones,
* **ENTONCES** el sistema los excluye.

### Escenario 8: Consultar sin coincidencias

* **DADO** que no existen reglas activas y vigentes aplicables o productos recomendables disponibles,
* **CUANDO** un canal consulta recomendaciones,
* **ENTONCES** el sistema devuelve una lista vacía.

## Interacción con otros módulos

| Módulo | Necesidad de interacción | Información que recibe esta funcionalidad | Información que entrega esta funcionalidad |
| --- | --- | --- | --- |
| Marketplace | Mostrar complementos y alternativas. | Identificador del producto consultado. | Recomendaciones ordenadas con tipo, precio y disponibilidad. |
| Chatbot | Sugerir productos relacionados. | Identificador del producto consultado. | Recomendaciones ordenadas y tipo de relación. |
| Retail | Apoyar la venta asistida. | Identificador del producto seleccionado. | Complementos y alternativas con precio y disponibilidad. |
| Seguridad y Usuarios | Autorizar la administración. | Identidad autenticada y permisos. | Solicitudes de validación cuando corresponda. |

## Dependencias internas

| Funcionalidad | Información necesaria |
| --- | --- |
| Gestión de Productos — Persona 2 | Identificadores, nombres, imágenes, estado, categoría y ficha de producto para que el gestor pueda identificar la prestación que justifica un Upsell. |
| Categorías y subcategorías — Persona 1 | Categorías activas para reglas por categoría. |
| Gestión de Precios — Persona 3 | Precio vigente. |
| Inventario — Persona 6 | Disponibilidad/stock. |

## Condiciones de integración

Las integraciones se realizan mediante APIs, de forma asíncrona y sin acceso directo a bases de datos de otros módulos.


---

## Aclaración normativa: precio informativo
El precio de una recomendación es informativo y corresponde al regular u oferta pública vigente de Pricing para el SKU elegible; una promoción de carrito o cupón no se aplica por anticipado. Un producto con variantes puede mostrar rango/«desde» para SKUs activos con stock, y la cotización final se recalcula para el SKU seleccionado. La recomendación no reserva stock ni congela precio.

---
