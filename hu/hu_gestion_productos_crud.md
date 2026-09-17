# Módulo Productos y Ofertas — Gestión de Productos (Catálogo Core)
**Responsable:** Gabriel — Persona 2
**Referencia:** MDPYO-6
**Versión:** v2 — corregida para eliminar discrepancias con `spec_gestion_productos_crud.md`

> **Decisiones de corrección aplicadas** (ver resumen completo en el mensaje de respuesta):
> 1. Se mantiene el modelo **borrador → validar → activo** (no "crear en activo").
> 2. Los campos obligatorios se dividen en **mínimos para crear** vs. **requisitos para activar**.
> 3. La duplicidad se define sobre `sku_base` y sobre `(nombre, marca_id)`, no sobre un "código" genérico.
> 4. El **slug** es propiedad explícita de este componente (Catálogo Core), no de Taxonomía y SEO.
> 5. Se agrega **reactivación** como criterio y escenario propios.
> 6. Se resuelve la regla pendiente del **precio base**: se ingresa en el mismo formulario de creación y se notifica a Motor de Precios.

## Historia de usuario principal

Como gestor comercial,
quiero registrar, actualizar, consultar, desactivar y reactivar productos del catálogo, definiendo sus datos generales, categoría, marca, características, imágenes y precio base referencial,
para que estén disponibles y actualizados en el catálogo central que consultan los canales de venta (Marketplace, Chatbot y Retail).

Un producto pasa por tres estados: **borrador** (recién creado, aún no visible), **activo** (visible y disponible para los canales) e **inactivo** (desactivado; conserva su registro e historial pero no se muestra). Solo se ve en los canales de venta mientras está en estado "activo".

## Criterios de aceptación

| ID | Criterio |
|---|---|
| CA-01 | Solo un gestor comercial con los permisos correspondientes puede crear, modificar, activar, desactivar o reactivar productos. |
| CA-02 | Para **crear** un producto (estado "borrador") basta con nombre, descripción, categoría, marca y precio base referencial. No se exige característica ni imagen en este punto. |
| CA-03 | El sistema debe validar que la categoría y la marca indicadas existan y estén activas antes de guardar o actualizar el producto, sin importar su estado. |
| CA-04 | El sistema debe impedir el registro de un producto con el mismo `sku_base` que otro existente, o con la misma combinación `(nombre, marca_id)` que un producto ya registrado. |
| CA-05 | Un producto solo puede pasar de "borrador" a "activo" cuando, además de los campos de CA-02, cuente con al menos una característica y al menos una imagen. |
| CA-06 | El gestor comercial puede consultar los productos registrados, filtrando por categoría, marca o estado, y ver el detalle completo de cada uno. |
| CA-07 | Al actualizar un producto, el sistema debe validar los mismos campos y relaciones exigidos según su estado (CA-02 o CA-05), conservando el historial de cambios. |
| CA-08 | Al desactivar un producto, el sistema debe impedir que sea mostrado a los canales de venta, pero debe conservar su registro para pedidos históricos y reportes. |
| CA-09 | Un producto inactivo puede reactivarse; al reactivarlo, el sistema debe volver a validar las condiciones de CA-05 antes de marcarlo como "activo" nuevamente. |
| CA-10 | El sistema genera y mantiene el **slug** del producto (a partir del nombre) como parte de este componente; no depende del componente de Taxonomía y SEO. |
| CA-11 | El precio base ingresado en la creación se notifica al Motor de Precios para abrir su historial de auditoría; las actualizaciones posteriores del precio (individuales o masivas) son responsabilidad exclusiva de ese componente, no de Catálogo Core. |
| CA-12 | Toda operación (registro, actualización, activación, desactivación, reactivación) debe quedar trazable con usuario, fecha/hora y resultado. |

## Escenarios dado-cuando-entonces

**Escenario 1: Registrar un producto en borrador**
● DADO que el gestor comercial tiene permisos,
● CUANDO registra un producto con nombre, descripción, categoría, marca y precio base válidos, sin imagen ni características todavía,
● ENTONCES el sistema lo guarda en estado "borrador", genera su identificador y slug, y confirma el registro al gestor.

**Escenario 2: Activar un producto completo**
● DADO que un producto en borrador ya tiene categoría y marca activas, al menos una característica y al menos una imagen,
● CUANDO el gestor comercial solicita su activación,
● ENTONCES el sistema cambia su estado a "activo" y lo hace visible para los canales de venta.

**Escenario 3: Rechazar activación incompleta**
● DADO que un producto en borrador no tiene ninguna imagen o ninguna característica,
● CUANDO el gestor comercial intenta activarlo,
● ENTONCES el sistema impide la activación, indica qué requisito falta y mantiene el producto en "borrador".

**Escenario 4: Rechazar categoría o marca inválida**
● DADO que el gestor comercial está registrando o actualizando un producto,
● CUANDO selecciona una categoría o marca que no existe o está desactivada,
● ENTONCES el sistema impide guardar el producto e indica cuál relación no es válida.

**Escenario 5: Rechazar sku_base o combinación nombre+marca duplicados**
● DADO que existe un producto con `sku_base` "ZAP-PSX", o un producto activo llamado "Zapatillas Running ProSpeed X" de la marca "ProSpeed",
● CUANDO el gestor comercial intenta registrar otro producto con el mismo `sku_base`, o con el mismo nombre y la misma marca,
● ENTONCES el sistema rechaza el registro e indica cuál de las dos reglas de unicidad se violó.

**Escenario 6: Actualizar un producto existente**
● DADO que existe un producto registrado y el gestor comercial cuenta con permisos,
● CUANDO modifica su descripción, características o imágenes con datos válidos,
● ENTONCES el sistema guarda los cambios, conserva el historial de la modificación y actualiza la información disponible para los canales.

**Escenario 7: Consultar productos por filtros**
● DADO que existen productos registrados en distintas categorías y estados,
● CUANDO el gestor comercial consulta el catálogo filtrando por categoría, marca o estado,
● ENTONCES el sistema devuelve la lista de productos que cumplen los filtros con su información principal.

**Escenario 8: Desactivar un producto**
● DADO que existe un producto activo,
● CUANDO el gestor comercial lo desactiva,
● ENTONCES el sistema conserva su registro, deja de mostrarlo a los canales de venta y lo marca como no disponible para nuevos pedidos.

**Escenario 9: Reactivar un producto**
● DADO que existe un producto inactivo que, en su momento, cumplía las condiciones de CA-05,
● CUANDO el gestor comercial solicita su reactivación,
● ENTONCES el sistema vuelve a validar categoría, marca, característica e imagen; si todo es válido lo marca como "activo", y si algo cambió (ej. la categoría fue desactivada) rechaza la reactivación e indica el motivo.

**Escenario 10: Usuario sin permisos intenta modificar un producto**
● DADO que un usuario autenticado no tiene el rol de gestor comercial ni el permiso correspondiente,
● CUANDO intenta registrar, actualizar, activar, desactivar o reactivar un producto,
● ENTONCES el sistema rechaza la solicitud con un error de autorización y no aplica ningún cambio.

## Interacción con otros módulos

| Módulo | Necesidad de interacción | Información que esta funcionalidad recibe | Información que esta funcionalidad entrega |
|---|---|---|---|
| Canal Marketplace | Mostrar el catálogo y el detalle de cada producto **activo** al cliente. | Filtros de búsqueda: categoría, marca y palabras clave. | Listado y detalle de productos activos: nombre, descripción, precio base, imágenes, categoría, marca, características, slug y estado. |
| Canal Chatbot | Responder consultas conversacionales sobre productos activos y sus características. | Criterios de búsqueda en lenguaje natural traducidos a filtros (precio, categoría, marca). | Productos activos que cumplen los criterios, con descripción, precio e imágenes. |
| Canal Retail | Permitir que el vendedor consulte el catálogo durante la venta asistida. | Filtros de búsqueda o identificador de producto. | Detalle del producto: precio base, características, imágenes y estado (incluye borrador/inactivo para uso administrativo). |
| Ventas y Postventa | Obtener el detalle vigente del producto para armar el pedido o la boleta. | Identificador del producto. | Nombre, precio base vigente, imagen y estado, como snapshot para el pedido. |
| Seguridad y Usuarios | Verificar quién puede crear, actualizar, activar, desactivar o reactivar productos. | Identidad autenticada, roles y permisos mediante el mecanismo de autenticación acordado. | Solicitudes de validación de identidad o permisos, cuando el mecanismo de integración lo requiera. |

## Dependencias dentro de Productos y Ofertas

Estas son coordinaciones internas con otras funcionalidades del mismo módulo.

| Funcionalidad interna | Información necesaria |
|---|---|
| Categorías y subcategorías — Persona 1 | Identificador, nombre y estado de la categoría, para validar su existencia al registrar, actualizar o reactivar un producto. |
| Marcas y características — Persona 1 | Identificador, nombre y estado de la marca; catálogo de características disponibles para asociarlas al producto. |
| Taxonomía y SEO — Persona 1 | El slug del producto es propiedad de Catálogo Core y se genera aquí; Taxonomía y SEO solo gestiona metadatos adicionales (meta-título, meta-descripción, palabras clave) y no lo sobrescribe. |
| Gestión de precios — Persona 3 | Recibe el precio base inicial del producto al crearse, para abrir su historial de auditoría. Los cambios posteriores del precio (individuales o masivos) son responsabilidad exclusiva de este componente, no de Catálogo Core. |
| Inventario y stock — Persona 6 | Notificación de producto creado para inicializar su stock en 0, **solo si el producto no maneja variantes** (`tiene_variantes = false`). Si el producto maneja variantes, el stock se inicializa por cada variante y no a nivel de producto (ver HU de Gestión de Variantes). |
| Motor de promociones — Persona 4 | Consulta de existencia y estado del producto antes de asociarlo a una promoción (esta funcionalidad es consumida, no consumidora). |
| Agrupaciones y combos — Persona 5 | Consulta de existencia, estado y precio del producto antes de incluirlo en un combo (esta funcionalidad es consumida, no consumidora). |

## Reglas pendientes de acordar

1. Si la actualización de un producto activo requiere pasar nuevamente por un estado de revisión antes de reflejarse en los canales, o se publica de inmediato.
2. Qué ocurre con las promociones, combos o carritos activos que referencian a un producto cuando este se desactiva.
