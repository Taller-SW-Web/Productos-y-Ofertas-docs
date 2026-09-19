# SPEC-003 — Especificación: Gestión de productos (CRUD principal)
**Versión:** v2 — corregida para eliminar discrepancias con `HU-003-gestion-productos-crud.md`

## 1. Contexto

El módulo de Productos y Ofertas es el dueño de la entidad "producto" dentro de la arquitectura de microservicios del Marketplace Multicanal, e incluye también la gestión del stock asociado a productos que no manejan variantes (ver sección 6). Todos los demás módulos (Marketplace Cliente, Chatbot Cliente, Retail Vendedor, Ventas y Postventa, Despacho y Entrega) consumen la información de productos mediante APIs, sin acceso directo a la base de datos de este módulo. Esto significa que este módulo es la única fuente de verdad del catálogo, y cualquier error, inconsistencia o demora en sus operaciones CRUD repercute directamente en la disponibilidad y confiabilidad de todos los canales de venta. Como parte del equipo del gestor comercial, esta capacidad constituye la base sobre la cual se construirán posteriormente las funcionalidades de precios, ofertas, combos y variantes.

## 2. Propósito

Permitir al gestor comercial administrar el ciclo de vida completo de los productos del catálogo (creación, activación, actualización, consulta, desactivación y reactivación), garantizando que la información expuesta a los demás módulos sea siempre consistente, íntegra y esté disponible mediante API.

## 3. Alcance

Incluye:
- Registro (creación) de nuevos productos, en estado **borrador**, con sus atributos mínimos (nombre, descripción, categoría, marca, precio base referencial, `sku_base` y bandera `tiene_variantes`).
- Activación de un producto en borrador a estado **activo**, sujeta a validaciones adicionales (características, imágenes).
- Actualización de los datos de un producto existente, en cualquiera de sus estados.
- Consulta de productos, tanto individual (por identificador/slug) como en listado, con filtros básicos (categoría, marca, estado).
- Desactivación (baja lógica) de un producto, sin eliminarlo físicamente de la base de datos.
- Reactivación de un producto previamente desactivado, con re-validación de las condiciones de activación.
- Generación y mantenimiento del slug del producto (identificador amigable de URL).
- Exposición de estas operaciones mediante API para su consumo por parte de otros módulos (Marketplace Cliente, Chatbot Cliente, Retail Vendedor, Ventas y Postventa, Despacho y Entrega, Seguridad y Usuarios).
- Validaciones de integridad de datos y de reglas de negocio propias del producto (unicidad de `sku_base`, unicidad de `(nombre, marca_id)`, campos obligatorios según el estado).

## 4. Requisitos

### Requisito 1: Creación de productos (estado borrador)

El sistema DEBE permitir registrar un nuevo producto con sus atributos mínimos (nombre, categoría, marca, precio base, descripción, `sku_base` y `tiene_variantes`), asignarle un identificador interno único y un slug, y guardarlo en estado **"borrador"**. No se exige característica ni imagen en este punto.

La bandera `tiene_variantes` se define al crear el producto y es **inmutable** en el alcance actual. Si es `false`, `sku_base` identifica también el SKU vendible que Inventario inicializa en 0. Si es `true`, `sku_base` solo sirve de raíz para generar los SKUs de variantes y no posee stock.

#### Escenario: Registro exitoso de un producto nuevo (borrador)
- DADO que el gestor comercial ha ingresado todos los campos mínimos con datos válidos
- CUANDO el gestor comercial confirma el registro del producto
- ENTONCES el sistema crea el producto en estado "borrador", le asigna un identificador único y un slug, y lo deja disponible para su consulta administrativa vía API (no visible aún para los canales de venta)

#### Escenario: Intento de registro con sku_base duplicado
- DADO que ya existe un producto (activo, inactivo o en borrador) con el mismo `sku_base`
- CUANDO el gestor comercial intenta registrar un nuevo producto con ese `sku_base`
- ENTONCES el sistema rechaza la operación y muestra un mensaje indicando que el `sku_base` ya está en uso

#### Escenario: Intento de registro con nombre y marca duplicados
- DADO que ya existe un producto con el mismo nombre y la misma marca (`nombre` + `marca_id`)
- CUANDO el gestor comercial intenta registrar un nuevo producto con esa misma combinación
- ENTONCES el sistema rechaza la operación y muestra un mensaje indicando que ya existe un producto con esos datos

### Requisito 1.1: Activación de productos

El sistema DEBE permitir cambiar un producto de "borrador" a "activo" únicamente cuando, además de los campos mínimos de creación, cuente con categoría y marca activas, al menos una característica y al menos una imagen.

#### Escenario: Activación exitosa
- DADO un producto en borrador que cuenta con categoría y marca activas, al menos una característica y al menos una imagen
- CUANDO el gestor comercial solicita su activación
- ENTONCES el sistema cambia su estado a "activo" y lo pone disponible para su consulta vía API por parte de los canales de venta

#### Escenario: Activación rechazada por datos incompletos
- DADO un producto en borrador sin ninguna imagen o sin ninguna característica
- CUANDO el gestor comercial solicita su activación
- ENTONCES el sistema rechaza la activación, indica el requisito faltante y mantiene el producto en "borrador"

### Requisito 2: Actualización de productos

El sistema DEBE permitir modificar los atributos editables de un producto existente, en cualquiera de sus estados, preservando la trazabilidad del cambio. `tiene_variantes` no es editable.

Los cambios válidos sobre un producto activo se publican inmediatamente. Si el cambio provoca que deje de cumplir una condición de activación, la operación se rechaza y se conserva la última versión válida.

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