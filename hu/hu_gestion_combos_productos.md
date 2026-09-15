## Historia de usuario principal

**Como** gestor comercial,
**quiero** crear y gestionar paquetes (combos) agrupando múltiples productos
complementarios bajo un precio único promocional,
**para** incentivar las ventas, garantizando que el sistema calcule
dinámicamente la disponibilidad del combo y descuente el stock de los productos
individuales al momento de la venta.

## Criterios de aceptación

|  |  |
| --- | --- |
| **ID** | **Criterio** |
| **CA-01** | Solo un gestor comercial con los permisos correspondientes (Módulo Seguridad y Usuarios) puede crear, modificar, consultar y desactivar combos. |
| **CA-02** | El registro de un combo debe incluir obligatoriamente: nombre, descripción, precio del paquete (debe ser mayor que 0) y la selección de 2 o más productos individuales con sus respectivas cantidades. |
| **CA-03** | El sistema debe calcular dinámicamente la disponibilidad (stock) del combo basándose en el producto individual con menor disponibilidad proporcional (stock individual / cantidad requerida para el combo). |
| **CA-04** | Si alguno de los productos individuales que conforman el combo se queda sin stock (0 unidades), la disponibilidad del combo automáticamente debe ser 0. |
| **CA-05** | Al confirmarse una venta, el descuento del inventario de los múltiples productos individuales que forman el combo debe ser transaccional en la base de datos (se descuentan todos correctamente o ninguno) para evitar inconsistencias de stock. |
| **CA-06** | El sistema debe rechazar el consumo del stock si un proceso concurrente o compra paralela agota los productos individuales antes de que se confirme la transacción del combo. |

## Escenarios dado-cuando-entonces

**Escenario 1: Creación exitosa de un combo**

* **DADO** que el gestor comercial se encuentra en la pantalla de
  gestión de combos,
* **CUANDO** ingresa los datos del combo (nombre, descripción),
  establece un precio único del paquete y selecciona 2 o más productos con
  stock suficiente, y guarda los cambios,
* **ENTONCES** el sistema registra el combo, lo activa para su venta
  y vincula los productos seleccionados con las cantidades respectivas.

**Escenario 2: Rechazar precio del combo inválido**

* **DADO** que el gestor comercial está creando o editando un
  combo,
* **CUANDO** establece el precio del paquete con un valor negativo
  o igual a cero,
* **ENTONCES** el sistema muestra un mensaje de error, impide guardar
  el combo y conserva los datos ingresados para su corrección.

**Escenario 3: Cálculo de disponibilidad basada en los componentes**

* **DADO** que existe un combo activo compuesto por 1
  "Camiseta" (Stock actual: 10) y 2 "Medias" (Stock
  actual: 15),
* **CUANDO** un canal de venta (Marketplace, Chatbot
  o Retail) consulta la disponibilidad del combo,
* **ENTONCES** el sistema calcula en tiempo real y responde que hay 7
  combos disponibles (limitado por las medias: 15 / 2 = 7.5).

**Escenario 4: Combo sin stock por producto agotado**

* **DADO** que uno de los productos individuales que conforman el
  combo se ha quedado sin stock (0 unidades),
* **CUANDO** un canal de venta consulta la disponibilidad actual
  del combo,
* **ENTONCES** el sistema responde que el stock del combo es 0 y lo
  muestra como temporalmente no disponible.

**Escenario 5: Venta exitosa y descuento de stock múltiple**

* **DADO** que un combo compuesto por 1 "Raqueta"
  (Stock: 5) y 3 "Pelotas" (Stock: 20) ha sido comprado,
* **CUANDO** el Módulo de Ventas y Postventa confirma el consumo de
  stock enviando la notificación de venta hacia Productos y Ofertas,
* **ENTONCES** el sistema descuenta de forma transaccional 1 unidad a
  la "Raqueta" (Nuevo Stock: 4) y 3 unidades a las
  "Pelotas" (Nuevo Stock: 17).

**Escenario 6: Fallo al descontar stock por venta concurrente o stock
insuficiente**

* **DADO** que el stock disponible calculado de un combo es 1 y
  un cliente intenta comprarlo,
* **CUANDO** el sistema intenta descontar el stock, pero otro
  proceso o venta concurrente ya consumió el inventario de los productos
  individuales dejándolo insuficiente,
* **ENTONCES** el sistema rechaza la operación de actualización, hace
  un *rollback* (deshace cualquier cambio
  parcial) y notifica al canal y a Ventas que no hay disponibilidad.

## Interacción con otros módulos

|  |  |  |  |
| --- | --- | --- | --- |
| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| **Canal Marketplace** | Mostrar combos en catálogo, permitir agregarlos al carrito evaluando su disponibilidad real y precio. | Identificadores de combos y cantidades a consultar/validar. | Detalles del combo, precio final, productos incluidos y stock dinámico disponible. |
| **Canal Chatbot** | Recomendar combos o responder disponibilidad por lenguaje natural. | Consulta de productos/combos y validación para el carrito conversacional. | Ofertas de combos vigentes, características de los productos incluidos y disponibilidad. |
| **Canal Retail** | Visualización en tienda física para que el vendedor ofrezca o arme combos al cliente. | Consulta de disponibilidad al armar un pedido presencial. | Stock dinámico disponible del combo, precio unificado aplicable. |
| **Ventas y Postventa** | Descontar de manera definitiva el stock de los productos al procesar la venta. | Identificador del combo, cantidad vendida y confirmación del pedido. | Resultado de la operación: Confirmación de descuento exitoso de los productos base o rechazo por falta de stock. |
| **Seguridad y Usuarios** | Verificar quién puede crear o modificar combos de productos. | Identidad autenticada (token), roles y permisos. | Solicitudes de validación de identidad o permisos para acceder a la gestión comercial. |

## Dependencias dentro de Productos y Ofertas

|  |  |
| --- | --- |
| **Funcionalidad interna** | **Información necesaria** |
| **Gestión de productos** | Identificador, nombre, estado (activo/inactivo) y stock unitario de cada producto para permitir seleccionarlos en la interfaz del combo y calcular la disponibilidad real. |
| **Actualización de stock por consumo** | Uso del sub-módulo interno encargado de efectuar las restas de inventario para enviar las instrucciones de descuento a cada uno de los productos que componen el combo. |
| **Gestión de precios (individuales)** | Precios base vigentes de los productos individuales. Aunque el combo tiene un precio propio, el precio base suele ser útil para mostrarle al cliente el "Ahorro" del paquete en el Frontend. |

## Reglas pendientes de acordar

* **Baja de productos individuales:** ¿Qué sucede
  automáticamente con el estado del combo si el gestor comercial desactiva
  (da de baja) un producto individual que lo conformaba? ¿Se oculta el combo
  de los canales o requiere edición manual?
* **Devoluciones:** Si un cliente anula la compra de un combo o solicita
  devolución desde *Ventas y Postventa*, ¿la reposición de stock se
  ingresa directamente a los productos individuales por separado o se debe
  tratar como una transacción integral?
* **Anidamiento:** ¿Se permitirá que un combo contenga a su vez otros
  combos dentro de él, o la regla de negocio restringe la creación de combos
  únicamente usando productos individuales puros?
* **Límites de precios:** ¿El sistema debe validar que el precio del combo
  configurado sea obligatoriamente menor a la suma de los precios regulares
  de los productos que lo conforman para asegurar que sea realmente una
  oferta?