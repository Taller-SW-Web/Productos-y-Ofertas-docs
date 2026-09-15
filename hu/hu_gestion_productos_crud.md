# Módulo Productos y Ofertas — Gestión de Productos (Catálogo Core)
**Responsable:** Gabriel — Persona 2
**Referencia:** MDPYO-6

## Historia de usuario principal

Como gestor comercial,
quiero registrar, actualizar, consultar y desactivar productos del catálogo, definiendo sus datos generales, categoría, marca, características, imágenes y precio base referencial,
para que estén disponibles y actualizados en el catálogo central que consultan los canales de venta (Marketplace, Chatbot y Retail).

Un producto solo se muestra a los canales de venta cuando su estado es "activo"; un producto desactivado deja de mostrarse pero conserva su registro e historial.

## Criterios de aceptación

| ID | Criterio |
|---|---|
| CA-01 | Solo un gestor comercial con los permisos correspondientes puede crear, modificar o desactivar productos. |
| CA-02 | El registro debe incluir nombre, descripción, categoría, marca, al menos una característica, al menos una imagen y un precio base referencial. |
| CA-03 | El sistema debe validar que la categoría y la marca indicadas existan y estén activas antes de guardar o actualizar el producto. |
| CA-04 | El sistema debe impedir el registro de un producto con el mismo nombre y marca que uno ya existente, o con un SKU base duplicado. |
| CA-05 | Un producto debe crearse en estado "borrador" y solo pasar a "activo" cuando cumpla las validaciones mínimas de publicación: categoría, marca, precio e imagen válidos. |
| CA-06 | El gestor comercial puede consultar los productos registrados, filtrando por categoría, marca o estado, y ver el detalle completo de cada uno. |
| CA-07 | Al actualizar un producto, el sistema debe validar los mismos campos obligatorios y relaciones exigidos en el registro, conservando el historial de cambios. |
| CA-08 | Al desactivar un producto, el sistema debe impedir que sea mostrado a los canales de venta, pero debe conservar su registro para pedidos históricos y reportes. |
| CA-09 | Toda operación de registro, actualización o desactivación debe quedar trazable con usuario, fecha/hora y resultado. |

## Escenarios dado-cuando-entonces

**Escenario 1: Registrar un producto válido**
● DADO que el gestor comercial tiene permisos y existen una categoría y una marca activas,
● CUANDO registra un producto con nombre, descripción, categoría, marca, al menos una característica, una imagen y un precio base válidos,
● ENTONCES el sistema guarda el producto en estado "borrador", genera su identificador y slug, y confirma el registro al gestor.

**Escenario 2: Rechazar categoría o marca inválida**
● DADO que el gestor comercial está registrando un producto,
● CUANDO selecciona una categoría o marca que no existe o está desactivada,
● ENTONCES el sistema impide guardar el producto e indica cuál relación no es válida.

**Escenario 3: Rechazar producto sin imagen**
● DADO que el gestor comercial completa todos los campos obligatorios excepto las imágenes,
● CUANDO intenta guardar el producto,
● ENTONCES el sistema impide guardar y solicita al menos una imagen válida.

**Escenario 4: Rechazar nombre y marca duplicados**
● DADO que existe un producto activo llamado "Zapatillas Running ProSpeed X" de la marca "ProSpeed",
● CUANDO el gestor comercial intenta registrar otro producto con el mismo nombre y la misma marca,
● ENTONCES el sistema rechaza el registro e indica que ya existe un producto con esos datos.

**Escenario 5: Actualizar un producto existente**
● DADO que existe un producto registrado y el gestor comercial cuenta con permisos,
● CUANDO modifica su descripción, características o imágenes con datos válidos,
● ENTONCES el sistema guarda los cambios, conserva el historial de la modificación y actualiza la información disponible para los canales.

**Escenario 6: Consultar productos por filtros**
● DADO que existen productos registrados en distintas categorías y estados,
● CUANDO el gestor comercial consulta el catálogo filtrando por categoría, marca o estado,
● ENTONCES el sistema devuelve la lista de productos que cumplen los filtros con su información principal.

**Escenario 7: Desactivar un producto**
● DADO que existe un producto activo,
● CUANDO el gestor comercial lo desactiva,
● ENTONCES el sistema conserva su registro, deja de mostrarlo a los canales de venta y lo marca como no disponible para nuevos pedidos.

**Escenario 8: Usuario sin permisos intenta modificar un producto**
● DADO que un usuario autenticado no tiene el rol de gestor comercial ni el permiso correspondiente,
● CUANDO intenta registrar, actualizar o desactivar un producto,
● ENTONCES el sistema rechaza la solicitud con un error de autorización y no aplica ningún cambio.

## Interacción con otros módulos

| Módulo | Necesidad de interacción | Información que esta funcionalidad recibe | Información que esta funcionalidad entrega |
|---|---|---|---|
| Canal Marketplace | Mostrar el catálogo y el detalle de cada producto al cliente. | Filtros de búsqueda: categoría, marca y palabras clave. | Listado y detalle de productos: nombre, descripción, precio base, imágenes, categoría, marca, características y estado. |
| Canal Chatbot | Responder consultas conversacionales sobre productos y sus características. | Criterios de búsqueda en lenguaje natural traducidos a filtros (precio, categoría, marca). | Productos que cumplen los criterios, con descripción, precio e imágenes. |
| Canal Retail | Permitir que el vendedor consulte el catálogo durante la venta asistida. | Filtros de búsqueda o identificador de producto. | Detalle del producto: precio base, características, imágenes y estado. |
| Ventas y Postventa | Obtener el detalle vigente del producto para armar el pedido o la boleta. | Identificador del producto. | Nombre, precio base vigente, imagen y estado, como snapshot para el pedido. |
| Seguridad y Usuarios | Verificar quién puede crear, actualizar o desactivar productos. | Identidad autenticada, roles y permisos mediante el mecanismo de autenticación acordado. | Solicitudes de validación de identidad o permisos, cuando el mecanismo de integración lo requiera. |

## Dependencias dentro de Productos y Ofertas

Estas son coordinaciones internas con otras funcionalidades del mismo módulo.

| Funcionalidad interna | Información necesaria |
|---|---|
| Categorías y subcategorías — Persona 1 | Identificador, nombre y estado de la categoría, para validar su existencia al registrar o actualizar un producto. |
| Marcas y características — Persona 1 | Identificador, nombre y estado de la marca; catálogo de características disponibles para asociarlas al producto. |
| Gestión de precios — Persona 3 | Precio base inicial del producto, para abrir su historial de auditoría al momento del registro. |
| Inventario y stock — Persona 6 | Notificación de producto creado, para inicializar su registro de stock en 0. |
| Motor de promociones — Persona 4 | Consulta de existencia y estado del producto antes de asociarlo a una promoción (esta funcionalidad es consumida, no consumidora). |
| Agrupaciones y combos — Persona 5 | Consulta de existencia, estado y precio del producto antes de incluirlo en un combo (esta funcionalidad es consumida, no consumidora). |

## Reglas pendientes de acordar

1. Si el precio base se ingresa en el mismo formulario de creación del producto, o si el producto nace "sin precio" y el Motor de Precios lo asigna después.
2. Qué ocurre con las promociones, combos o carritos activos que referencian a un producto cuando este se desactiva.
3. Si la actualización de un producto activo requiere pasar nuevamente por un estado de revisión antes de reflejarse en los canales, o se publica de inmediato.
