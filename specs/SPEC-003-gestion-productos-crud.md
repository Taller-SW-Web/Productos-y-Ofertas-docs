# SPEC-003 — Especificación: Gestión de productos (CRUD principal)

**Responsable:** Gabriel Poma Gutierrez  
**Rama:** poma  
**Trazabilidad:** HU [HU-003](../hu/HU-003-gestion-productos-crud.md) | Wireframe [WF-003](../wireframes/flows/WF-003-gestion-productos-crud.md)

**Versión:** v2 — corregida para eliminar discrepancias con `hu_gestion_productos_crud.md`

> **Cambios consolidados:** estado inicial en "borrador"; activación explícita; `sku_base` como identificador único bloqueante; `(nombre, marca_id)` como advertencia de posible duplicado y no como clave empresarial; separación entre categoría de navegación y `tipo_producto_id` que define el esquema de características; slug como propiedad de Catálogo; reactivación con re-validación; precio base con responsabilidad resuelta.

## 1. Contexto

El módulo de Productos y Ofertas es el dueño de la entidad "producto" dentro de la arquitectura de microservicios del Marketplace Multicanal, y define los productos simples y sus SKU vendibles, pero el stock de todos los SKU pertenece exclusivamente a Inventario. Todos los demás módulos (Marketplace Cliente, Chatbot Cliente, Retail Vendedor, Ventas y Postventa, Despacho y Entrega) consumen la información de productos mediante APIs, sin acceso directo a la base de datos de este módulo. Esto significa que este módulo es la única fuente de verdad del catálogo, y cualquier error, inconsistencia o demora en sus operaciones CRUD repercute directamente en la disponibilidad y confiabilidad de todos los canales de venta. Como parte del equipo del gestor comercial, esta capacidad constituye la base sobre la cual se construirán posteriormente las funcionalidades de precios, ofertas, combos y variantes.

## 2. Propósito

Permitir al gestor comercial administrar el ciclo de vida completo de los productos del catálogo (creación, activación, actualización, consulta, desactivación y reactivación), garantizando integridad en sus datos propios y propagación asíncrona consistente eventualmente hacia otros módulos mediante contratos versionados.

## 3. Alcance

Incluye:
- Registro (creación) de nuevos productos, en estado **borrador**, con sus atributos mínimos (nombre, descripción, categoría de navegación, `tipo_producto_id`, marca, precio base referencial, `sku_base` y bandera `tiene_variantes`).
- Activación de un producto en borrador a estado **activo**, sujeta a validaciones adicionales (características, imágenes).
- Actualización de los datos de un producto existente, en cualquiera de sus estados.
- Consulta de productos, tanto individual (por identificador/slug) como en listado, con filtros básicos (categoría, marca, estado).
- Desactivación (baja lógica) de un producto, sin eliminarlo físicamente de la base de datos.
- Reactivación de un producto previamente desactivado, con re-validación de las condiciones de activación.
- Generación y mantenimiento del slug del producto (identificador amigable de URL).
- Exposición de estas operaciones mediante API para su consumo por parte de otros módulos (Marketplace Cliente, Chatbot Cliente, Retail Vendedor, Ventas y Postventa, Despacho y Entrega, Seguridad y Usuarios).
- Validaciones de integridad de datos y de reglas de negocio propias del producto: unicidad bloqueante de `sku_base`, campos obligatorios según estado y detección no bloqueante de posibles duplicados por `(nombre, marca_id)`.

## 4. Requisitos

### Requisito 1: Creación de productos (estado borrador)

El sistema DEBE permitir registrar un nuevo producto con sus atributos mínimos (nombre, categoría de navegación, `tipo_producto_id`, marca, precio base, descripción, `sku_base` y `tiene_variantes`), asignarle un identificador interno único y un slug, y guardarlo en estado **"borrador"**. No se exige imagen ni valores concretos de características en este punto. El `tipo_producto_id` referencia el esquema de atributos administrado por la funcionalidad de asociación de tipos de producto y características; la categoría se utiliza para navegación/clasificación y no define por sí sola el esquema de datos del producto.

La bandera `tiene_variantes` se define al crear el producto y no es editable mediante el CRUD ordinario una vez que existe identidad comercial publicada o variantes registradas. Una conversión posterior entre producto simple y producto con variantes se considera una **migración de modelo** fuera de este flujo, porque afecta SKU, Pricing, Inventario y referencias externas. Si es `false`, `sku_base` identifica también el SKU vendible; si es `true`, el producto padre no posee stock propio y sus variantes son las unidades vendibles.

#### Escenario: Registro exitoso de un producto nuevo (borrador)
- DADO que el gestor comercial ha ingresado todos los campos mínimos con datos válidos
- CUANDO el gestor comercial confirma el registro del producto
- ENTONCES el sistema crea el producto en estado "borrador", le asigna un identificador único y un slug, y lo deja disponible para su consulta administrativa vía API (no visible aún para los canales de venta)

#### Escenario: Intento de registro con sku_base duplicado
- DADO que ya existe un producto (activo, inactivo o en borrador) con el mismo `sku_base`
- CUANDO el gestor comercial intenta registrar un nuevo producto con ese `sku_base`
- ENTONCES el sistema rechaza la operación y muestra un mensaje indicando que el `sku_base` ya está en uso

#### Escenario: Advertencia por posible duplicado de nombre y marca
- DADO que ya existe un producto con el mismo nombre normalizado y la misma marca (`nombre` + `marca_id`)
- CUANDO el gestor comercial intenta registrar un nuevo producto con esa misma combinación pero con `sku_base` distinto
- ENTONCES el sistema muestra una advertencia de posible duplicado y los productos coincidentes, pero permite continuar si el gestor confirma que se trata de una referencia comercial distinta; `sku_base` continúa siendo la restricción de unicidad bloqueante

**Configuración de variantes:** si `tiene_variantes=true`, el formulario de producto configura antes de la primera variante las características identificadoras LISTA permitidas por su `tipo_producto_id`, según `SPEC-004-gestion-variantes-skus.md`. El conjunto queda fijo desde la primera variante, incluso inactiva. Cambiar la categoría de navegación no altera el esquema de atributos ni las identidades existentes; cambiar el tipo de producto después de existir identidad publicada requiere un flujo de migración explícito y no se realiza silenciosamente desde este CRUD.

### Requisito 1.1: Activación de productos

El sistema DEBE permitir cambiar un producto de "borrador" a "activo" únicamente cuando, además de los campos mínimos de creación, cuente con categoría y marca activas, `tipo_producto_id` activo, tenga informados **todos los valores de las características obligatorias efectivas de su tipo de producto** y al menos una imagen. Si el tipo no posee características obligatorias, no se exige inventar una. Si `tiene_variantes = true`, también requiere una variante ACTIVA con SKU e imagen válidos; si es simple, su `sku_base` es el SKU vendible. No se publica como vendible hasta que Pricing confirme precio inicial y, para cada SKU publicable, Inventario confirme inicialización; la consulta comercial verifica su disponibilidad vigente.

#### Escenario: Activación exitosa
- DADO un producto en borrador que cuenta con categoría y marca activas, todos los valores de sus características obligatorias efectivas completos y al menos una imagen
- CUANDO el gestor comercial solicita su activación
- ENTONCES el sistema cambia su estado a "activo" y lo pone disponible para su consulta vía API por parte de los canales de venta

#### Escenario: Activación rechazada por datos incompletos
- DADO un producto en borrador sin ninguna imagen o con una o más características obligatorias efectivas sin valor
- CUANDO el gestor comercial solicita su activación
- ENTONCES el sistema rechaza la activación, indica el requisito faltante y mantiene el producto en "borrador"

### Requisito 2: Actualización de productos

El sistema DEBE permitir modificar los atributos editables de un producto existente, en cualquiera de sus estados, preservando la trazabilidad del cambio. `tiene_variantes` no es editable.

Los cambios válidos sobre un producto activo se confirman inmediatamente en Catálogo y se propagan a otros consumidores por eventos (consistencia eventual, sin promesa de visibilidad instantánea global). Si el cambio provoca que deje de cumplir una condición de activación, la operación se rechaza y se conserva la última versión válida.

#### Escenario: Actualización exitosa de atributos de un producto
- DADO un producto existente en el catálogo
- CUANDO el gestor comercial modifica uno o más de sus atributos (por ejemplo, descripción o categoría) y confirma los cambios
- ENTONCES el sistema guarda los cambios, actualiza la fecha/hora de última modificación y refleja los nuevos datos en las consultas posteriores vía API

#### Escenario: Intento de actualización de un producto inexistente
- DADO un identificador de producto que no existe en el catálogo
- CUANDO se envía una solicitud de actualización con ese identificador
- ENTONCES el sistema rechaza la operación y retorna un error indicando que el producto no fue encontrado

### Requisito 3: Consulta de productos

El sistema DEBE permitir consultar productos de forma individual y en listados filtrables, exponiendo esta información mediante API para los demás módulos. Los canales de venta (Marketplace, Chatbot, Retail) solo deben recibir productos en estado "activo" en sus consultas de catálogo público.

#### Escenario: Consulta de un producto por su identificador
- DADO un producto existente y activo en el catálogo
- CUANDO se solicita la información del producto mediante su identificador, slug o código
- ENTONCES el sistema retorna todos los atributos vigentes del producto, incluyendo su estado

#### Escenario: Consulta de listado filtrado sin resultados
- DADO un filtro de búsqueda (por ejemplo, categoría o marca) que no coincide con ningún producto registrado
- CUANDO se ejecuta la consulta con dicho filtro
- ENTONCES el sistema retorna una lista vacía junto con un código de respuesta exitoso, sin generar error

### Requisito 4: Desactivación y reactivación de productos

El sistema DEBE permitir cambiar el estado de un producto entre "activo" e "inactivo" (baja lógica), sin eliminarlo de forma permanente. La reactivación DEBE volver a validar las condiciones del Requisito 1.1 antes de marcar el producto nuevamente como "activo".

#### Escenario: Desactivación exitosa de un producto
- DADO un producto activo en el catálogo
- CUANDO el gestor comercial solicita su desactivación
- ENTONCES el sistema cambia el estado del producto a "inactivo" y este deja de estar disponible para su venta en los canales, aunque sigue siendo consultable para fines administrativos e históricos; además emite `catalog.product.deactivated` para que Promociones, Combos y otros consumidores dejen de utilizarlo en nuevas operaciones. Los pedidos ya confirmados conservan su snapshot histórico

#### Escenario: Intento de desactivar un producto que ya está inactivo
- DADO un producto que ya se encuentra en estado "inactivo"
- CUANDO el gestor comercial solicita nuevamente su desactivación
- ENTONCES el sistema informa que el producto ya se encuentra inactivo y no realiza cambios adicionales

#### Escenario: Reactivación exitosa de un producto
- DADO un producto inactivo cuya categoría, marca, características e imágenes siguen siendo válidas
- CUANDO el gestor comercial solicita su reactivación
- ENTONCES el sistema revalida las condiciones del Requisito 1.1 y, si se cumplen, cambia el estado del producto a "activo"

#### Escenario: Reactivación rechazada por datos ya no válidos
- DADO un producto inactivo cuya categoría fue desactivada mientras tanto
- CUANDO el gestor comercial solicita su reactivación
- ENTONCES el sistema rechaza la reactivación, indica qué condición ya no se cumple y mantiene el producto en "inactivo"

### Requisito 5: Elegibilidad y barreras de entidades maestras
Catálogo no debe crear, activar ni reasignar productos a una categoría o marca sujeta a una barrera de desactivación instalada según `SPEC-008-gestion-categorias.md` y `SPEC-011-gestion-marcas.md`. La comprobación y la escritura de producto deben coordinarse transaccionalmente con la barrera local; una proyección conocida como obsoleta no permite autorizar una operación comercial. El servicio publica la confirmación o rechazo de verificación asíncrona de bajas de entidades maestras con `operation_id` y conserva la barrera hasta reconciliar la finalización.

**Valores identificadores bajo baja segura:** Catálogo aplica las mismas barreras locales de escritura al recibir solicitud de baja de un valor LISTA desde Taxonomía (`SPEC-009-gestion-caracteristicas.md`), y confirma asíncronamente si algún SKU ACTIVO lo usa como identidad o algún producto ACTIVO lo usa como valor requerido. Mientras dure la verificación no crea, activa ni reasigna nuevos artículos al valor; un fallo de confirmación nunca autoriza la baja. La regla no altera snapshots de pedidos.

### Requisito 6: Última variante activa
Si se desactiva la última variante ACTIVA de un producto con `tiene_variantes = true`, Catálogo desactiva también el producto padre en la misma transacción local y emite los eventos correspondientes; conserva el snapshot de pedidos confirmados. Para volver a activar el producto se debe activar una variante elegible y validar íntegramente los requisitos de activación.

### Requisito 7: Alta de precio inicial
Catálogo entrega a Pricing un comando idempotente de inicialización con `product_id`, `sku_base`, precio base, motivo `ALTA_PRODUCTO` y contexto de actor; Pricing persiste y confirma su resultado, y emite `pricing.price.changed` solo después del commit. La creación del borrador no equivale a precio inicial ya disponible; un fallo en Pricing se registra como pendiente de preparación y no habilita activación.

## 5. Requisitos no funcionales

- **Rendimiento:** Las operaciones de consulta de producto (individual y listado) deben responder en un tiempo adecuado para no degradar la experiencia de los canales que las consumen (Marketplace, Chatbot, Retail), dado que son invocadas de forma frecuente.
- **Seguridad:** Las operaciones de creación, activación, actualización, desactivación y reactivación deben estar restringidas a usuarios autenticados con el rol de gestor comercial, validando el token/credenciales emitidos por el módulo de Seguridad y Usuarios. Las operaciones de consulta pueden ser expuestas con permisos más amplios según el canal consumidor.
- **Disponibilidad:** La API de consulta de productos debe estar disponible de forma continua, ya que es un recurso crítico consumido de forma asíncrona por múltiples módulos (Marketplace Cliente, Chatbot Cliente, Retail Vendedor, Ventas y Postventa, Despacho y Entrega).
- **Auditoría:** Cada creación, activación, actualización, desactivación y reactivación de un producto debe quedar registrada (usuario responsable, fecha/hora, cambio realizado) para trazabilidad.
- **Escalabilidad:** El diseño de la persistencia y las consultas debe soportar el crecimiento del catálogo sin degradar el rendimiento, considerando que este módulo es la fuente central de datos de producto para todo el sistema.

## 6. Fuera de alcance

- **Gestión de variantes/SKUs (tallas, colores, imágenes por variante)** — corresponde a la capacidad de valor agregado "Gestión avanzada de Variantes (SKUs)", especificada de forma independiente. Un producto con `tiene_variantes = true` no gestiona su propio stock aquí; ver esa especificación.
- **Gestión de precios individuales y masivos, ofertas, promociones y cupones** — corresponde a otras funcionalidades del módulo de Productos y Ofertas, fuera del alcance del CRUD principal. Este componente solo entrega el precio base inicial al crear el producto.
- **Gestión de categorías, subcategorías, marcas y características** — se asume que estas entidades maestras existen o son gestionadas por una funcionalidad complementaria dentro del mismo módulo.
- **Gestión de metadatos SEO adicionales (meta-título, meta-descripción, palabras clave)** — corresponde al componente de Taxonomía y SEO; este componente solo genera y mantiene el slug del producto.
- **Actualización de stock por consumo desde los canales** — corresponde a la funcionalidad de "Consulta y actualización de disponibilidad de stock" (Inventario), no al CRUD de producto en sí. Este componente notifica la creación de un producto simple para que Inventario inicialice en 0 el SKU vendible identificado por `sku_base`.
- **Eliminación física (borrado permanente) de productos** — no contemplada; solo se maneja baja lógica (desactivación/reactivación), para preservar integridad referencial e historial.

## Criterio de completitud

La capacidad se considera correctamente implementada cuando:
- Todos los requisitos (Creación, Activación, Actualización, Consulta y Desactivación/Reactivación) están implementados.
- Todos los escenarios definidos se cumplen, incluyendo los casos borde y de error.
- Los requisitos no funcionales aplicables (rendimiento, seguridad, disponibilidad, auditoría, escalabilidad) se cumplen.
- No se han incorporado funcionalidades fuera del alcance, como gestión de variantes, precios, metadatos SEO u ofertas.
