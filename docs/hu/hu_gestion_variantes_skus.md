# Módulo Productos y Ofertas — Gestión de Variantes (SKU)
**Responsable:** Gabriel — Persona 2
**Tipo:** Funcionalidad de valor agregado (sugerida)

## Historia de usuario principal

Como gestor comercial,
quiero definir y administrar variantes (SKU) de un producto según sus características distintivas —por ejemplo, talla y color—, cada una con su propia imagen, código único y stock independiente,
para que el catálogo permita vender exactamente la versión que el cliente elige, y que cada canal pueda mostrarla y descontar el stock correcto.

Una variante hereda del producto padre los datos generales (nombre, descripción, categoría, marca), pero tiene su propio SKU, su propia imagen y su propio control de stock. Un producto solo puede publicarse como "activo" si cuenta con al menos una variante activa y válida.

## Criterios de aceptación

| ID | Criterio |
|---|---|
| CA-01 | Solo un gestor comercial con los permisos correspondientes puede crear, modificar o desactivar variantes de un producto. |
| CA-02 | Una variante debe asociarse a un producto existente y definir los valores de las características que la distinguen (ej. talla, color), heredando el resto de los datos del producto padre. |
| CA-03 | El sistema debe generar un código SKU único para cada variante, compuesto por el SKU base del producto más un identificador derivado de sus características. |
| CA-04 | Cada variante debe tener al menos una imagen propia que la represente. |
| CA-05 | El sistema debe impedir el registro de dos variantes de un mismo producto con exactamente la misma combinación de características (ej. dos variantes "Talla 42 – Negro"). |
| CA-06 | El gestor comercial puede consultar todas las variantes de un producto, filtrando por característica o por estado. |
| CA-07 | Al crear una variante, el sistema debe notificar al componente de Inventario para inicializar su stock en 0, de forma independiente al de las demás variantes del mismo producto. |
| CA-08 | Un producto no puede pasar a estado "activo" ni mostrarse en los canales de venta si no tiene al menos una variante activa con SKU e imagen válidos. |
| CA-09 | Al desactivar una variante, esta deja de mostrarse en los canales de venta, sin afectar la disponibilidad de las demás variantes del mismo producto, y conserva su registro para pedidos históricos. |
| CA-10 | Toda operación de registro, actualización o desactivación de una variante debe quedar trazable con usuario, fecha/hora y resultado. |

## Escenarios dado-cuando-entonces

**Escenario 1: Registrar una variante válida**
● DADO que existe el producto "Zapatillas Running ProSpeed X" en estado borrador o activo,
● CUANDO el gestor comercial registra una variante con talla "42", color "Negro" y una imagen propia,
● ENTONCES el sistema genera un SKU único para la variante, la guarda en estado "borrador" y notifica al componente de Inventario para inicializar su stock en 0.

**Escenario 2: Rechazar una combinación de características duplicada**
● DADO que ya existe la variante "Talla 42 – Negro" para el producto,
● CUANDO el gestor comercial intenta registrar otra variante con la misma combinación de talla y color,
● ENTONCES el sistema rechaza el registro e indica que esa combinación ya existe para el producto.

**Escenario 3: Rechazar una variante sin imagen propia**
● DADO que el gestor comercial completa las características de la variante pero no adjunta ninguna imagen,
● CUANDO intenta guardar la variante,
● ENTONCES el sistema impide guardar y solicita al menos una imagen para esa variante.

**Escenario 4: Impedir la activación de un producto sin variantes válidas**
● DADO que un producto no tiene ninguna variante registrada o todas sus variantes están desactivadas,
● CUANDO el gestor comercial intenta activar el producto para que sea visible en los canales de venta,
● ENTONCES el sistema impide la activación e indica que debe existir al menos una variante activa con SKU e imagen válidos.

**Escenario 5: Actualizar una variante existente**
● DADO que existe una variante registrada,
● CUANDO el gestor comercial modifica su imagen o alguna característica no utilizada como identificador del SKU,
● ENTONCES el sistema guarda los cambios, conserva el historial de la modificación y actualiza la información disponible para los canales.

**Escenario 6: Consultar las variantes de un producto**
● DADO que un producto tiene varias variantes registradas en distintos estados,
● CUANDO el gestor comercial consulta las variantes filtrando por característica o por estado,
● ENTONCES el sistema devuelve la lista de variantes que cumplen los filtros, con su SKU, imagen y estado.

**Escenario 7: Desactivar una variante**
● DADO que existe una variante activa con stock disponible,
● CUANDO el gestor comercial la desactiva,
● ENTONCES el sistema conserva su registro, deja de mostrarla en los canales de venta y la marca como no disponible para nuevos pedidos, sin afectar a las demás variantes del producto.

**Escenario 8: Usuario sin permisos intenta modificar una variante**
● DADO que un usuario autenticado no tiene el rol de gestor comercial ni el permiso correspondiente,
● CUANDO intenta registrar, actualizar o desactivar una variante,
● ENTONCES el sistema rechaza la solicitud con un error de autorización y no aplica ningún cambio.

## Interacción con otros módulos

| Módulo | Necesidad de interacción | Información que esta funcionalidad recibe | Información que esta funcionalidad entrega |
|---|---|---|---|
| Canal Marketplace | Mostrar al cliente las variantes disponibles de un producto para que elija la versión exacta a comprar. | Identificador del producto consultado. | Lista de variantes con SKU, característica distintiva (talla/color), imagen propia y disponibilidad. |
| Canal Chatbot | Permitir que el cliente indique conversacionalmente la variante deseada (ej. "talla 42, negro") y validar que exista. | Producto y características mencionadas en la conversación. | SKU de la variante encontrada, su disponibilidad e imagen. |
| Canal Retail | Permitir que el vendedor seleccione o escanee la variante exacta durante la venta asistida. | Identificador de producto o SKU escaneado. | Detalle de la variante: SKU, imagen, características y estado. |
| Ventas y Postventa | Registrar en el pedido el SKU exacto de la variante vendida, no solo el producto genérico. | SKU de la variante incluida en el pedido. | Nombre, características, imagen y estado de esa variante, como snapshot del pedido. |
| Seguridad y Usuarios | Verificar quién puede crear, actualizar o desactivar variantes. | Identidad autenticada, roles y permisos mediante el mecanismo de autenticación acordado. | Solicitudes de validación de identidad o permisos, cuando el mecanismo de integración lo requiera. |

## Dependencias dentro de Productos y Ofertas

Estas son coordinaciones internas con otras funcionalidades del mismo módulo.

| Funcionalidad interna | Información necesaria |
|---|---|
| Gestión de productos (misma persona) | Identificador, nombre, categoría, marca y estado del producto padre, del cual la variante hereda los datos generales. |
| Marcas y características — Persona 1 | Catálogo de características disponibles (ej. talla, color) para asociarlas a cada variante como identificador. |
| Inventario y stock — Persona 6 | Notificación de variante creada, para inicializar su stock en 0 de forma independiente por SKU; consulta de stock por SKU de variante, no solo por producto. |
| Gestión de precios — Persona 3 | Definición pendiente: si las variantes comparten el precio base del producto o pueden tener un precio diferenciado (ver reglas pendientes). |
| Agrupaciones y combos — Persona 5 | Definición pendiente: si un combo referencia un producto genérico o una variante específica (ver reglas pendientes). |

## Reglas pendientes de acordar

1. Si las variantes pueden tener un precio distinto al del producto base (ej. recargo por talla especial) o todas comparten el mismo precio base.
2. Si al crear un producto es obligatorio registrar al menos una variante en el mismo flujo, o se permite crear el producto primero y las variantes después.
3. Si los combos y las promociones se aplican a nivel de producto (cualquier variante) o deben especificar variantes concretas.
4. Qué sucede con los pedidos ya confirmados de una variante que luego se desactiva: si se conserva solo la referencia histórica o se permite reactivarla.
