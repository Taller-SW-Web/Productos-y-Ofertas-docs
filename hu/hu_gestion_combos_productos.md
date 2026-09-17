## Historia de usuario principal

**Como** gestor comercial,
**quiero** crear y gestionar paquetes (combos) agrupando múltiples SKUs y productos
complementarios bajo un precio único promocional que sea estrictamente menor a la suma individual,
**para** incentivar las ventas, garantizando que el sistema calcule
dinámicamente la disponibilidad en tiempo real, descuente el inventario ante la confirmación definitiva de la venta (`order.confirmed`),
y compense transaccionalmente ante cancelaciones o devoluciones.

## Criterios de aceptación

|  |  |
| --- | --- |
| **ID** | **Criterio** |
| **CA-01** | Solo un gestor comercial con los permisos correspondientes (Módulo Seguridad y Usuarios) puede crear, modificar, consultar y desactivar combos. |
| **CA-02** | El registro de un combo debe incluir obligatoriamente: nombre, descripción, selección de 2 o más SKUs vendibles (SKU de variante o `sku_base` de producto simple) con sus respectivas cantidades, y un precio único de paquete. |
| **CA-03** | El sistema debe validar de manera estricta y obligatoria que el precio del paquete sea mayor a cero y estrictamente menor que la suma de los precios regulares vigentes de todos sus componentes ($precio\_combo < \sum precio\_componentes$). |
| **CA-04** | Queda estrictamente prohibido el anidamiento: los combos únicamente pueden estar conformados por productos y SKUs individuales puros, rechazando la inclusión de otros combos. |
| **CA-05** | El sistema debe calcular dinámicamente la disponibilidad (stock) del combo basándose en el SKU individual con menor disponibilidad proporcional ($stock\_disponible = \min \lfloor stock\_sku_i / cantidad\_requerida_i \rfloor$). |
| **CA-06** | Si alguno de los SKUs componentes del combo se queda sin stock (0 unidades), la disponibilidad del combo automáticamente pasa a ser 0 y se marca como no disponible para compra. |
| **CA-07** | Al emitirse `order.confirmed` desde Ventas/Postventa, el descuento del inventario de los múltiples SKUs que forman el combo debe ejecutarse de forma transaccional (ACID) en la base de datos (se descuentan todos o ninguno). |
| **CA-08** | Si una venta ya confirmada se cancela antes del despacho (`order.cancelled`), el sistema compensa íntegramente el stock consumido. Un `order.created` que nunca llega a confirmarse no requiere compensación porque no afectó stock. |
| **CA-09** | En caso de cancelación o devolución postventa (`order.returned`), la reposición de stock se gestiona de forma atómica e integral para todos los artículos que integraban el paquete. |
| **CA-10** | Si un gestor comercial desactiva o da de baja un SKU o producto componente en el Catálogo, el combo debe inhabilitarse y ocultarse automáticamente en todos los canales de venta, emitiendo una notificación al gestor para su revisión. |

## Escenarios dado-cuando-entonces

**Escenario 1: Creación exitosa de un combo**

* **DADO** que el gestor comercial se encuentra en la pantalla de gestión de combos,
* **CUANDO** ingresa los datos del combo (nombre, descripción), selecciona 2 o más SKUs individuales válidos con stock y establece un precio de paquete que es estrictamente menor a la suma de los precios de los artículos seleccionados,
* **ENTONCES** el sistema registra el combo, lo activa para su venta en los canales y vincula los SKUs con sus cantidades respectivas.

**Escenario 2: Rechazar precio de combo igual o superior a la suma de componentes**

* **DADO** que el gestor comercial está creando o editando un combo cuyos componentes suman S/ 120,
* **CUANDO** establece el precio del paquete en S/ 120, S/ 130 o un valor menor/igual a cero,
* **ENTONCES** el sistema muestra un mensaje de error impidiendo guardar el combo, explicando que el precio debe representar un descuento real frente a la suma de componentes.

**Escenario 3: Rechazar anidamiento de combos**

* **DADO** que el gestor comercial está seleccionando los componentes para un nuevo paquete,
* **CUANDO** intenta añadir un combo preexistente como ítem integrante,
* **ENTONCES** el sistema bloquea la acción y muestra un mensaje indicando que no se permite el anidamiento de combos.

**Escenario 4: Cálculo de disponibilidad basada en los SKUs componentes**

* **DADO** que existe un combo activo compuesto por 1 "Camiseta Talla M" (SKU-CAM-M, Stock: 10) y 2 "Medias Blancas" (SKU-MED-W, Stock: 15),
* **CUANDO** un canal de venta (Marketplace, Chatbot o Retail) consulta la disponibilidad del combo,
* **ENTONCES** el sistema calcula en tiempo real y responde que hay 7 combos disponibles (limitado por las medias: $15 / 2 = 7.5 \rightarrow 7$).

**Escenario 5: Combo sin stock por producto agotado**

* **DADO** que uno de los SKUs individuales que conforman el combo se ha quedado sin stock (0 unidades),
* **CUANDO** un canal de venta consulta la disponibilidad actual del combo,
* **ENTONCES** el sistema responde que el stock del combo es 0 y lo muestra como temporalmente agotado.

**Escenario 6: Descuento de stock ante venta confirmada (`order.confirmed`)**

* **DADO** que un cliente inicia la compra de un combo compuesto por 1 "Raqueta" (Stock: 5) y 3 "Pelotas" (Stock: 20),
* **CUANDO** Ventas y Postventa emite `order.confirmed`,
* **ENTONCES** el sistema descuenta de forma transaccional 1 unidad a la "Raqueta" (Nuevo Stock: 4) y 3 unidades a las "Pelotas" (Nuevo Stock: 17).

**Escenario 7: Compensación de stock ante cancelación previa al despacho (`order.cancelled`)**

* **DADO** que se descontó el stock de los componentes de un combo por una venta confirmada,
* **CUANDO** la venta se cancela antes del despacho y se recibe `order.cancelled`,
* **ENTONCES** el sistema revierte la operación y repone transaccionalmente las unidades descontadas a cada SKU individual.

**Escenario 8: Desactivación automática del combo ante baja de un componente**

* **DADO** un combo activo que contiene el SKU de una zapatilla en liquidación,
* **CUANDO** el gestor desactiva ese SKU en el Catálogo,
* **ENTONCES** el sistema deshabilita inmediatamente el combo en los canales de venta y notifica al gestor comercial para que edite o archive el paquete.

## Interacción con otros módulos

|  |  |  |  |
| --- | --- | --- | --- |
| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| **Canal Marketplace** | Mostrar combos en catálogo y permitir compra según stock dinámico. | Consultas de combos y peticiones de validación de carrito. | Detalles del combo, precio unificado, componentes y disponibilidad calculada. |
| **Canal Chatbot / Retail** | Consulta y venta presencial o asistida por chat. | Solicitudes de cotización y disponibilidad en tiempo real. | Información comercial del combo, precio final y existencia. |
| **Ventas y Postventa** | Coordinar confirmación, cancelación previa al despacho y devolución mediante eventos de dominio. | Eventos `order.confirmed`, `order.cancelled` y `order.returned`. | Resultado del débito o compensación de stock de componentes. |
| **Seguridad y Usuarios** | Validar privilegios de gestión comercial. | Token de sesión y rol de usuario autenticado. | Solicitud de autorización para administrar combos. |

## Dependencias dentro de Productos y Ofertas

|  |  |
| --- | --- |
| **Funcionalidad interna** | **Información necesaria** |
| **Gestión de productos y variantes** | Identificador de SKU, estado (activo/inactivo) y stock unitario de cada variante para calcular disponibilidad y procesar la inhabilitación reactiva ante baja de componentes. |
| **Gestión de inventario (Kardex)** | Ejecución de débitos y créditos transaccionales de stock sobre las variantes componentes ante eventos de compra o compensación. |
| **Gestión de precios (individuales)** | Precios base vigentes de las variantes para validar que el precio del paquete sea estrictamente menor a su suma acumulada. |

## Reglas acordadas de negocio y arquitectura

* **Baja de productos individuales:** Si un SKU componente es desactivado en el catálogo, **el combo se deshabilita y oculta automáticamente en los canales de venta** y se genera una notificación al gestor comercial para su revisión.
* **Devoluciones:** Ante cancelaciones o devoluciones de combos desde Ventas y Postventa (`order.returned`), la reposición de existencias se procesa de forma **atómica e integral para todos sus artículos individuales** (el combo se anula y devuelve completo).
* **Anidamiento:** **Prohibido el anidamiento**. Un paquete solo puede conformarse por artículos y variantes directas, descartando complejidades recursivas.
* **Límites de precios:** Es una **validación obligatoria y bloqueante**: el precio configurado para el combo DEBE ser estrictamente menor que la suma de los precios regulares vigentes de los productos y variantes que lo integran ($precio\_combo < \sum precio\_componentes$).
