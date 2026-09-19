# SPEC-010 — Especificación: Asociación entre categorías y características

## 1. Contexto
No todos los productos comparten los mismos atributos: una zapatilla necesita "Talla" y "Color", mientras que un balón necesita "Tamaño" y "Material". Catálogo Core necesita conocer, al crear o editar un producto, qué características aplican según la categoría elegida. Esta capacidad centraliza esa regla en Taxonomía y evita que cada canal o módulo mantenga lógica propia.

## 2. Propósito
Permitir al gestor comercial definir qué características son aplicables a cada categoría, indicando obligatoriedad, herencia y límites, de modo que Catálogo Core construya y valide formularios de producto consistentes.

## 3. Alcance
Incluye:
- Asociación de características a una categoría.
- Marcado de cada asociación como obligatoria u opcional.
- Herencia automática de asociaciones desde categoría padre a subcategorías.
- Cambio de obligatoriedad sin invalidar inmediatamente productos existentes.
- Límite máximo de 20 características efectivas por categoría.
- Desasociación de una característica de una categoría.
- Consulta de características aplicables, indicando origen directo o heredado y obligatoriedad.
- API interna de solo lectura para Catálogo Core.

## 4. Requisitos

### Requisito 1: Asociar característica a categoría
El sistema DEBE permitir asociar una característica existente y activa a una categoría existente y activa, indicando si es obligatoria u opcional.

No se permite asociar dos veces la misma característica a la misma categoría.

La cantidad de características efectivas de una categoría, contando asociaciones directas y heredadas sin duplicados, NO DEBE superar 20.

#### Escenario: Asociación exitosa
- DADO que existen la categoría "Zapatillas" y la característica "Talla", ambas activas
- CUANDO el gestor asocia "Talla" como obligatoria
- ENTONCES se registra la asociación y aparece como obligatoria al consultar la categoría

#### Escenario: Límite máximo
- DADO que una categoría ya posee 20 características efectivas entre directas y heredadas
- CUANDO se intenta asociar una característica adicional
- ENTONCES el sistema rechaza la operación por exceder el límite

### Requisito 2: Herencia a subcategorías
Las características asociadas a una categoría padre SE HEREDAN automáticamente a sus subcategorías.

Una subcategoría no necesita duplicar físicamente la asociación heredada. Si una característica aparece tanto por herencia como por asociación directa, la consulta debe devolverla una sola vez.

La obligatoriedad heredada no puede relajarse en la subcategoría: una característica obligatoria en el padre continúa siendo obligatoria en sus hijas.

#### Escenario: Herencia de característica
- DADO que "Talla" es obligatoria en "Calzado"
- Y "Zapatillas" es subcategoría de "Calzado"
- CUANDO Catálogo Core consulta las características de "Zapatillas"
- ENTONCES "Talla" aparece como obligatoria e identificada como heredada

### Requisito 3: Cambio de obligatoriedad
El sistema DEBE permitir cambiar una asociación directa de opcional a obligatoria o viceversa.

Si una característica pasa de opcional a obligatoria, los productos preexistentes sin ese dato NO se invalidan ni desactivan automáticamente. La obligatoriedad se exige en la siguiente edición/guardado del producto.

#### Escenario: Producto legado
- DADO que un producto existente no posee "Color"
- Y "Color" cambia de opcional a obligatorio para su categoría
- CUANDO el producto solo es consultado
- ENTONCES conserva su estado actual
- Y CUANDO se intenta editar y guardar
- ENTONCES Catálogo Core exige completar "Color"

### Requisito 4: Consultar características aplicables
El sistema DEBE exponer para una categoría el conjunto efectivo de características directas y heredadas, con su obligatoriedad y origen.

Si no existen asociaciones directas ni heredadas, devuelve una lista vacía.

### Requisito 5: Desasociar característica
El sistema DEBE permitir eliminar una asociación directa cuando ya no sea aplicable.

Eliminar una asociación directa no elimina una característica que continúe aplicando por herencia.

### Requisito 6: Desactivación de entidades
Si una categoría o característica se desactiva, las asociaciones que dependan de ella dejan de considerarse activas sin eliminación física.

### Requisito 7: Cambios en jerarquía o asociaciones del padre
Agregar o activar una asociación en una categoría padre debe comprobar el límite máximo de 20 características efectivas **tanto en esa categoría como en todas sus hijas afectadas**. Reasignar una categoría a otro padre también recalcula las características efectivas y sus obligatoriedades antes de confirmar el cambio; si se excede el límite se rechaza sin cambios parciales. La obligatoriedad heredada prevalece sobre una asociación directa opcional. Las nuevas obligaciones se exigen a los productos preexistentes en su siguiente guardado y a los nuevos productos en la creación. Taxonomía publica cambios versionados; Catálogo no valida un producto activo con una versión de reglas conocida como obsoleta.

## 5. Requisitos no funcionales
- Rendimiento: consulta efectiva de características por categoría < 500 ms.
- Seguridad: solo Gestor Comercial autenticado puede crear, modificar o eliminar asociaciones.
- Disponibilidad: API interna de consulta disponible para Catálogo Core.
- Consistencia: las asociaciones se mantienen por identificador; no se duplican relaciones heredadas físicamente.

## 6. Fuera de alcance
- CRUD de categorías.
- CRUD de características y valores.
- Persistencia de los valores concretos de características en cada producto, responsabilidad de Catálogo Core.

## Criterio de completitud
La capacidad se considera completa cuando asociación, herencia, obligatoriedad, límite de 20, consulta y desasociación se comportan según estas reglas y no quedan decisiones abiertas sobre estas materias.

---
