# SPEC-010 — Especificación: Asociación entre tipos de producto y características

**Responsable:** Leonardo Lopez  
**Rama:** lopez  
**Trazabilidad:** HU [HU-010](../hu/HU-010-asociacion-tipo-producto-caracteristica.md) | Wireframe [WF-010](../wireframes/flows/WF-010-asociacion-tipo-producto-caracteristica.md)

## 1. Contexto
No todos los productos comparten el mismo esquema de datos: una zapatilla necesita "Talla" y "Material", mientras un balón necesita "Tamaño" y "Material de cubierta". Las categorías se utilizan para navegación y pueden cambiar por campañas o merchandising sin que eso deba alterar los atributos estructurales del producto. Por ello, esta capacidad introduce `tipo_producto_id` como clasificación técnica/comercial del esquema de producto y evita acoplar las características a la taxonomía de navegación.

## 2. Propósito
Permitir al gestor comercial definir qué características son aplicables a cada **tipo de producto**, indicando obligatoriedad y límites operativos, de modo que Catálogo Core construya y valide formularios consistentes aunque un producto cambie de categoría de navegación.

## 3. Alcance
Incluye:
- Creación y consulta de tipos de producto ligeros (`tipo_producto_id`, nombre, estado), dentro de esta misma capacidad para no introducir una funcionalidad adicional del curso.
- Asociación de características activas a un tipo de producto.
- Marcado de cada asociación como obligatoria u opcional.
- Cambio de obligatoriedad sin desactivar inmediatamente productos existentes.
- Límite operativo configurable `MAX_PRODUCT_TYPE_ATTRIBUTES` (valor inicial del MVP: 20).
- Desasociación de una característica cuando sea seguro hacerlo.
- Consulta del esquema efectivo de características de un tipo de producto.
- API interna de solo lectura para Catálogo Core y Carga Masiva.

## 4. Requisitos

### Requisito 1: Asociar característica a tipo de producto
El sistema DEBE permitir asociar una característica existente y activa a un tipo de producto existente y activo, indicando si es obligatoria u opcional. No se permite asociar dos veces la misma característica al mismo tipo. La cantidad de asociaciones activas no DEBE superar `MAX_PRODUCT_TYPE_ATTRIBUTES`; el valor inicial del MVP es 20, pero no se codifica como límite irreversible del modelo.

#### Escenario: Asociación exitosa
- DADO que existen el tipo de producto "Zapatilla" y la característica "Talla", ambos activos
- CUANDO el gestor asocia "Talla" como obligatoria
- ENTONCES se registra la asociación y Catálogo la recibe al consultar el esquema de "Zapatilla".

#### Escenario: Límite operativo
- DADO que un tipo de producto alcanzó el límite configurado de características activas
- CUANDO se intenta asociar una característica adicional
- ENTONCES el sistema rechaza la operación indicando el límite vigente, sin afirmar que ese número sea una regla empresarial universal.

### Requisito 2: Separación respecto de categorías
Las categorías NO heredan ni definen características. Un producto mantiene su `tipo_producto_id` aunque se mueva a otra categoría de navegación. Una categoría puede contener productos de más de un tipo y un mismo tipo de producto puede aparecer en distintas categorías. En el MVP Catálogo puede conservar una única `categoria_id` por producto, pero el esquema de atributos nunca se deriva de ella.

#### Escenario: Cambio de categoría sin mutar el esquema
- DADO un producto de tipo "Zapatilla" con Talla y Material obligatorios
- Y el gestor cambia su categoría de "Running" a "Ofertas"
- CUANDO Catálogo valida el guardado
- ENTONCES conserva el mismo `tipo_producto_id` y las mismas reglas de atributos; solo cambia su clasificación de navegación.

### Requisito 3: Cambio de obligatoriedad
El sistema DEBE permitir cambiar una asociación de opcional a obligatoria o viceversa. Si una característica pasa a obligatoria, los productos preexistentes sin ese dato NO se desactivan automáticamente; la obligación se exige en su siguiente edición/guardado o antes de una nueva activación, según las reglas de Catálogo.

#### Escenario: Producto legado
- DADO un producto existente de un tipo que no posee "Color"
- Y "Color" cambia de opcional a obligatorio para ese tipo
- CUANDO el producto solo es consultado
- ENTONCES conserva su estado actual
- Y CUANDO se intenta editar y guardar
- ENTONCES Catálogo Core exige completar "Color".

### Requisito 4: Consultar características aplicables
El sistema DEBE exponer por `tipo_producto_id` el conjunto de características activas, su obligatoriedad y metadatos necesarios para construir formularios. Si no existen asociaciones, devuelve una lista vacía. La respuesta es versionada para que Catálogo detecte reglas obsoletas durante una escritura concurrente.

### Requisito 5: Desasociar característica
El sistema DEBE permitir eliminar lógicamente una asociación cuando ya no sea aplicable. Si la característica es obligatoria o participa como identificadora en variantes activas de productos de ese tipo, se ejecuta una verificación asíncrona con Catálogo y la baja no se confirma hasta recibir un resultado seguro. Los productos históricos conservan IDs y snapshots; no se reescriben SKUs ni pedidos.

### Requisito 6: Desactivación de entidades
Si un tipo de producto o característica se desactiva, no puede utilizarse en nuevas altas o activaciones. La desactivación de un tipo con productos activos requiere verificación asíncrona equivalente a otras entidades maestras; ante timeout o fallo no se presume que sea seguro desactivarlo.

### Requisito 7: Versionado de reglas y cambio de tipo
Toda modificación de asociaciones incrementa la versión del esquema y publica un evento interno versionado. Catálogo valida escrituras contra una versión vigente. `tipo_producto_id` puede corregirse mientras el producto permanezca en borrador y no tenga variantes ni publicaciones; una vez que existen variantes o identidad comercial publicada, cambiarlo se considera una **migración de modelo** fuera del CRUD ordinario, porque puede alterar campos obligatorios e identidad de variantes.

## 5. Requisitos no funcionales
- Rendimiento: consulta del esquema de características por tipo de producto < 500 ms.
- Seguridad: las escrituras requieren el permiso comercial correspondiente validado por Seguridad y Usuarios; esta capacidad no define roles globales.
- Disponibilidad: API interna de consulta disponible para Catálogo Core y Carga Masiva.
- Consistencia: asociaciones por IDs estables, versionado optimista e idempotencia en verificaciones asíncronas.

## 6. Fuera de alcance
- CRUD de categorías de navegación.
- CRUD de características y valores.
- Persistencia de los valores concretos de características en cada producto, responsabilidad de Catálogo Core.
- Personalización de atributos por canal o por cliente.

## Criterio de completitud
La capacidad se considera completa cuando la asociación tipo de producto–característica, obligatoriedad, límite configurable, consulta, desasociación segura y separación respecto de categorías se comportan según estas reglas.
