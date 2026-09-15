# Especificación: Gestión de Productos (CRUD Principal)

## 1. Contexto

El módulo de Productos y Ofertas es el dueño de la entidad "producto" dentro de la arquitectura de microservicios del Marketplace Multicanal, e incluye también la gestión del stock asociado. Todos los demás módulos (Marketplace Cliente, Chatbot Cliente, Retail Vendedor, Ventas y Postventa, Despacho y Entrega) consumen la información de productos mediante APIs, sin acceso directo a la base de datos de este módulo. Esto significa que este módulo es la única fuente de verdad del catálogo, y cualquier error, inconsistencia o demora en sus operaciones CRUD repercute directamente en la disponibilidad y confiabilidad de todos los canales de venta. Como parte del equipo del gestor comercial, esta capacidad constituye la base sobre la cual se construirán posteriormente las funcionalidades de precios, ofertas, combos y variantes.

## 2. Propósito

Permitir al gestor comercial administrar el ciclo de vida completo de los productos del catálogo (creación, actualización, consulta y desactivación), garantizando que la información expuesta a los demás módulos sea siempre consistente, íntegra y esté disponible mediante API.

## 3. Alcance

Incluye:
- Registro (creación) de nuevos productos con sus atributos principales (nombre, descripción, categoría, marca, características, imágenes referenciales, precio base, unidad de medida).
- Actualización de los datos de un producto existente.
- Consulta de productos, tanto individual (por identificador/código) como en listado, con filtros básicos (categoría, marca, estado).
- Desactivación (baja lógica) de un producto, sin eliminarlo físicamente de la base de datos.
- Reactivación de un producto previamente desactivado.
- Exposición de estas operaciones mediante API para su consumo por parte de otros módulos (Marketplace Cliente, Chatbot Cliente, Retail Vendedor, Ventas y Postventa, Despacho y Entrega, Seguridad y Usuarios).
- Validaciones de integridad de datos y de reglas de negocio propias del producto (por ejemplo, unicidad de código, campos obligatorios).

## 4. Requisitos

### Requisito 1: Creación de productos

El sistema DEBE permitir registrar un nuevo producto con sus atributos obligatorios (nombre, categoría, marca, precio base, descripción) y asignarle un código único e identificador interno.

#### Escenario: Registro exitoso de un producto nuevo
- DADO que el gestor comercial ha ingresado todos los campos obligatorios con datos válidos
- CUANDO el gestor comercial confirma el registro del producto
- ENTONCES el sistema crea el producto con estado "activo", le asigna un código único, y lo pone disponible para su consulta vía API

#### Escenario: Intento de registro con código de producto duplicado
- DADO que ya existe un producto activo o inactivo con el mismo código en el catálogo
- CUANDO el gestor comercial intenta registrar un nuevo producto con ese código
- ENTONCES el sistema rechaza la operación y muestra un mensaje indicando que el código ya está en uso

### Requisito 2: Actualización de productos

El sistema DEBE permitir modificar los atributos de un producto existente, preservando la trazabilidad del cambio.

#### Escenario: Actualización exitosa de atributos de un producto
- DADO un producto existente en el catálogo
- CUANDO el gestor comercial modifica uno o más de sus atributos (por ejemplo, descripción o categoría) y confirma los cambios
- ENTONCES el sistema guarda los cambios, actualiza la fecha/hora de última modificación y refleja los nuevos datos en las consultas posteriores vía API

#### Escenario: Intento de actualización de un producto inexistente
- DADO un identificador de producto que no existe en el catálogo
- CUANDO se envía una solicitud de actualización con ese identificador
- ENTONCES el sistema rechaza la operación y retorna un error indicando que el producto no fue encontrado

### Requisito 3: Consulta de productos

El sistema DEBE permitir consultar productos de forma individual y en listados filtrables, exponiendo esta información mediante API para los demás módulos.

#### Escenario: Consulta de un producto por su identificador
- DADO un producto existente y activo en el catálogo
- CUANDO se solicita la información del producto mediante su identificador o código
- ENTONCES el sistema retorna todos los atributos vigentes del producto, incluyendo su estado

#### Escenario: Consulta de listado filtrado sin resultados
- DADO un filtro de búsqueda (por ejemplo, categoría o marca) que no coincide con ningún producto registrado
- CUANDO se ejecuta la consulta con dicho filtro
- ENTONCES el sistema retorna una lista vacía junto con un código de respuesta exitoso, sin generar error

### Requisito 4: Desactivación y reactivación de productos

El sistema DEBE permitir cambiar el estado de un producto entre "activo" e "inactivo" (baja lógica), sin eliminarlo de forma permanente.

#### Escenario: Desactivación exitosa de un producto
- DADO un producto activo en el catálogo
- CUANDO el gestor comercial solicita su desactivación
- ENTONCES el sistema cambia el estado del producto a "inactivo" y este deja de estar disponible para su venta en los canales, aunque sigue siendo consultable para fines administrativos e históricos

#### Escenario: Intento de desactivar un producto que ya está inactivo
- DADO un producto que ya se encuentra en estado "inactivo"
- CUANDO el gestor comercial solicita nuevamente su desactivación
- ENTONCES el sistema informa que el producto ya se encuentra inactivo y no realiza cambios adicionales

## 5. Requisitos no funcionales

- **Rendimiento:** Las operaciones de consulta de producto (individual y listado) deben responder en un tiempo adecuado para no degradar la experiencia de los canales que las consumen (Marketplace, Chatbot, Retail), dado que son invocadas de forma frecuente.
- **Seguridad:** Las operaciones de creación, actualización y desactivación deben estar restringidas a usuarios autenticados con el rol de gestor comercial, validando el token/credenciales emitidos por el módulo de Seguridad y Usuarios. Las operaciones de consulta pueden ser expuestas con permisos más amplios según el canal consumidor.
- **Disponibilidad:** La API de consulta de productos debe estar disponible de forma continua, ya que es un recurso crítico consumido de forma asíncrona por múltiples módulos (Marketplace Cliente, Chatbot Cliente, Retail Vendedor, Ventas y Postventa, Despacho y Entrega).
- **Auditoría:** Cada creación, actualización y cambio de estado de un producto debe quedar registrado (usuario responsable, fecha/hora, cambio realizado) para trazabilidad.
- **Escalabilidad:** El diseño de la persistencia y las consultas debe soportar el crecimiento del catálogo sin degradar el rendimiento, considerando que este módulo es la fuente central de datos de producto para todo el sistema.

## 6. Fuera de alcance

- **Gestión de variantes/SKUs (tallas, colores, imágenes por variante)** — corresponde a la capacidad de valor agregado "Gestión avanzada de Variantes (SKUs)", especificada de forma independiente.
- **Gestión de precios individuales y masivos, ofertas, promociones y cupones** — corresponde a otras funcionalidades del módulo de Productos y Ofertas, fuera del alcance del CRUD principal.
- **Gestión de categorías, subcategorías, marcas y características** — se asume que estas entidades maestras existen o son gestionadas por una funcionalidad complementaria dentro del mismo módulo.
- **Actualización de stock por consumo desde los canales** — corresponde a la funcionalidad de "Consulta y actualización de disponibilidad de stock", no al CRUD de producto en sí.
- **Eliminación física (borrado permanente) de productos** — no contemplada; solo se maneja baja lógica (desactivación), para preservar integridad referencial e historial.

## Criterio de completitud

La capacidad se considera correctamente implementada cuando:
- Todos los requisitos (Creación, Actualización, Consulta y Desactivación/Reactivación) están implementados.
- Todos los escenarios definidos se cumplen, incluyendo los casos borde y de error.
- Los requisitos no funcionales aplicables (rendimiento, seguridad, disponibilidad, auditoría, escalabilidad) se cumplen.
- No se han incorporado funcionalidades fuera del alcance, como gestión de variantes, precios u ofertas.
