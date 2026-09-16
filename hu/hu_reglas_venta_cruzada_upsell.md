# HU-REC-01: Configurar reglas de productos relacionados para los canales de venta

Proyecto: Módulo de Productos y Ofertas.  
Responsabilidad: Persona 4 — Axel Cueva.  
Versión corregida: 2026-09-15.

## Funcionalidad

Reglas de venta cruzada: Cross-sell y Upsell — Valor agregado.

## Historia de usuario

**Como** gestor comercial,  
**quiero** configurar relaciones manuales o reglas lógicas que vinculen productos o categorías con complementos o alternativas superiores,  
**para** que los canales de venta presenten recomendaciones pertinentes durante la compra.

**Cross-sell:** complemento del producto consultado.  
**Upsell:** alternativa que el gestor comercial clasifica explícitamente como superior.

El sistema no determina automáticamente qué producto es “superior” por precio; esa clasificación es una decisión del gestor.

## Modelo de ordenamiento consolidado

Cada regla tiene una **prioridad de regla**.  
Cada producto recomendado dentro de la regla tiene un **orden de presentación**.

- Prioridad `1` es mayor que prioridad `2`.
- Primero se ordenan las reglas por prioridad ascendente.
- Dentro de una regla, se respetan los productos por su orden ascendente.
- Si el mismo producto aparece por varias reglas, se conserva la primera aparición según ese orden y se elimina el duplicado.

## Criterios de aceptación

| ID | Criterio |
| --- | --- |
| CA-01 | Solo un gestor comercial con permisos puede crear, modificar, activar o desactivar reglas. |
| CA-02 | Cada regla debe incluir nombre, tipo —Cross-sell o Upsell—, origen que la activa, prioridad, fecha/hora de inicio y fin, estado y al menos un producto recomendado. |
| CA-03 | El origen puede ser un producto específico o una categoría. |
| CA-04 | Los productos configurados deben existir y estar activos. No se permite recomendar el mismo producto de origen ni repetir un producto dentro de la misma regla. |
| CA-05 | En una regla Upsell, la alternativa superior es definida explícitamente por el gestor comercial; no se infiere solo por mayor precio. |
| CA-06 | El gestor puede establecer el orden de los productos recomendados dentro de cada regla. |
| CA-07 | Una regla solo participa si está activa, vigente y su condición de producto o categoría coincide con la consulta. |
| CA-08 | La respuesta excluye productos inactivos o sin stock y elimina duplicados entre reglas. |
| CA-09 | La respuesta identifica producto recomendado, tipo de recomendación, prioridad de regla, orden de presentación, precio vigente y disponibilidad. |
| CA-10 | Las recomendaciones se ordenan por prioridad de regla y luego por orden de producto. |
| CA-11 | Si no existen recomendaciones válidas, se devuelve una lista vacía. Las recomendaciones no agregan ni reemplazan productos automáticamente. |

## Escenarios dado-cuando-entonces

### Escenario 1: Configurar una relación Cross-sell

* **DADO** que existen unas zapatillas y unas medias activas,
* **CUANDO** el gestor registra una regla Cross-sell vigente con prioridad 1, las zapatillas como origen y las medias como complemento,
* **ENTONCES** el sistema guarda la relación y permite consultarla mientras esté activa y vigente.

### Escenario 2: Configurar una relación Upsell

* **DADO** que existen un producto básico y otro producto que el gestor clasifica comercialmente como alternativa superior,
* **CUANDO** registra una regla Upsell vigente que los relaciona,
* **ENTONCES** el sistema guarda la alternativa sin reemplazar automáticamente el producto elegido por el cliente.

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
| Gestión de Productos — Persona 2 | Identificadores, nombres, imágenes, estado y categoría. |
| Categorías y subcategorías — Persona 1 | Categorías activas para reglas por categoría. |
| Gestión de Precios — Persona 3 | Precio vigente. |
| Inventario — Persona 6 | Disponibilidad/stock. |

## Condiciones de integración

Las integraciones se realizan mediante APIs, de forma asíncrona y sin acceso directo a bases de datos de otros módulos.
