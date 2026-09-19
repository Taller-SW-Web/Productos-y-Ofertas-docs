# HU-015 — Historia de Usuario: Gestión de inventario

## Historia de usuario principal

**Como** responsable de inventario,

**quiero** consultar la disponibilidad de las variantes de los productos y actualizar su stock cuando se registre un consumo,

**para** mantener la información de inventario actualizada y consistente para los diferentes canales y módulos del marketplace.

El stock se controla por **SKU vendible**. Un producto simple (`tiene_variantes = false`) utiliza su `sku_base` como SKU vendible y posee un único registro de inventario. En un producto con variantes (`tiene_variantes = true`), cada variante posee su propio SKU y el producto padre actúa únicamente como agrupador comercial, sin stock independiente.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | Cada unidad vendible debe tener un SKU único: el `sku_base` para un producto simple o el SKU autogenerado para una variante. |
| **CA-02** | El sistema debe permitir consultar el stock disponible de una variante proporcionando su SKU. |
| **CA-03** | La consulta de disponibilidad debe informar como mínimo el SKU, la cantidad disponible y su estado: **Disponible, Stock bajo o Agotado**, según las reglas: `stock = 0 → Agotado`, `0 < stock <= umbral_stock_bajo → Stock bajo`, `stock > umbral_stock_bajo → Disponible`. El `umbral_stock_bajo` debe ser configurable por cada variante/SKU. |
| **CA-04** | El sistema debe permitir registrar el consumo de unidades de una variante proporcionando su SKU y la cantidad consumida. |
| **CA-05** | Antes de actualizar el stock, el sistema debe validar que la variante exista, que la cantidad consumida sea válida y que exista stock suficiente. |
| **CA-06** | Cuando exista stock suficiente, el sistema debe descontar la cantidad consumida y conservar el nuevo stock actualizado. |
| **CA-07** | El sistema no debe permitir que el stock de una variante sea negativo. Si no existe stock suficiente, debe rechazar el consumo y conservar el stock actual. |
| **CA-08** | Cuando el consumo deje el stock en cero, la variante debe quedar identificada como **Agotada**. Si el consumo deja el stock en `0 < stock <= umbral_stock_bajo`, la variante debe quedar identificada como **Stock bajo**. |
| **CA-09** | La información de stock actualizada debe estar disponible para las posteriores consultas realizadas por los canales y módulos integrados. |
| **CA-10** | Ante consumos concurrentes sobre el mismo SKU, el sistema debe garantizar que el stock no sea negativo y que la suma de consumos aceptados no supere el stock disponible de la variante. Para ello, el descuento se ejecuta como una **actualización condicional sobre el stock disponible** y emplea el **mismo control de concurrencia optimista** definido para las operaciones masivas de inventario, sin bloquear otros consumos. |
| **CA-11** | El consumo definitivo de stock se aplica únicamente al recibir `order.confirmed` desde Ventas y Postventa. `order.created` no reserva ni descuenta stock. Despacho no genera consumos adicionales. |
| **CA-12** | Si una venta confirmada se cancela antes del despacho, `order.cancelled` compensa el stock. Si ya fue entregada, solo `order.returned` tras devolución aceptada repone unidades. |

## Escenarios dado-cuando-entonces

### Escenario 1: Consultar disponibilidad de una variante

* **DADO** que existe una variante con SKU `NK-AM-BLK-40` y tiene 10 unidades disponibles,
* **CUANDO** un canal solicita consultar su disponibilidad,
* **ENTONCES** el sistema devuelve el SKU, la cantidad disponible de 10 unidades y el estado **Disponible**.

### Escenario 2: Consultar una variante sin stock

* **DADO** que existe una variante con SKU `NK-AM-WHT-40` y tiene 0 unidades disponibles,
* **CUANDO** un canal consulta su disponibilidad,
* **ENTONCES** el sistema devuelve el stock en 0 y el estado **Agotado**.

### Escenario 3: Actualizar stock por consumo

* **DADO** que la variante con SKU `NK-AM-BLK-40` tiene 10 unidades disponibles,
* **CUANDO** se registra el consumo de 3 unidades,
* **ENTONCES** el sistema actualiza el stock de la variante a 7 unidades.

### Escenario 4: Rechazar un consumo por stock insuficiente

* **DADO** que la variante con SKU `NK-AM-BLK-40` tiene 2 unidades disponibles,
* **CUANDO** se registra el consumo de 5 unidades,
* **ENTONCES** el sistema rechaza la operación, informa que no existe stock suficiente y conserva las 2 unidades disponibles.

### Escenario 5: Consumir la última unidad

* **DADO** que la variante con SKU `NK-AM-BLK-40` tiene 1 unidad disponible,
* **CUANDO** se registra el consumo de 1 unidad,
* **ENTONCES** el sistema actualiza el stock a 0 y establece el estado **Agotado**.

### Escenario 6: SKU inexistente

* **DADO** que no existe una variante asociada al SKU `NK-AM-XXX-99`,
* **CUANDO** se solicita consultar o actualizar su stock,
* **ENTONCES** el sistema rechaza la operación e informa que la variante no existe.

### Escenario 7: Evitar stock negativo

* **DADO** que una variante tiene 3 unidades disponibles,
* **CUANDO** se intenta registrar un consumo de una cantidad que supera las 3 unidades,
* **ENTONCES** el sistema rechaza la operación y el stock permanece en 3 unidades.

### Escenario 8: Consultar el stock después de un consumo

* **DADO** que una variante tenía 10 unidades y se registró correctamente un consumo de 4 unidades,
* **CUANDO** un canal consulta nuevamente la disponibilidad,
* **ENTONCES** el sistema devuelve 6 unidades como stock disponible.

### Escenario 9: Consumos concurrentes sobre el mismo SKU

* **DADO** que la variante con SKU `NK-AM-BLK-40` tiene 5 unidades disponibles y se solicitan simultáneamente un consumo de 3 unidades (Consumo A) y un consumo de 3 unidades (Consumo B),
* **CUANDO** ambos consumos se registran de forma concurrente sobre el mismo SKU,
* **ENTONCES** el sistema acepta un solo consumo y rechaza el otro por falta de stock, aplicando el descuento mediante una **actualización condicional sobre el saldo** con el control de concurrencia optimista de las operaciones masivas; el stock final de la variante es de 2 unidades, sin quedar nunca negativo.

### Escenario 10: Estado resultante Stock bajo después de un consumo

* **DADO** que la variante con SKU `NK-AM-BLK-40` tiene 6 unidades disponibles y su `umbral_stock_bajo` está configurado en 5 unidades,
* **CUANDO** se registra el consumo de 1 unidad,
* **ENTONCES** el sistema actualiza el stock a 5 unidades y establece el estado **Stock bajo**.

### Escenario 11: Consultar una variante con stock bajo

* **DADO** que existe una variante con SKU `NK-AM-BLK-41` que tiene 3 unidades disponibles y su `umbral_stock_bajo` está configurado en 5 unidades,
* **CUANDO** un canal consulta su disponibilidad,
* **ENTONCES** el sistema devuelve la cantidad disponible de 3 unidades y el estado **Stock bajo**.

## Interacción con otros módulos

| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| --- | --- | --- | --- |
| **Canal Marketplace** | Consultar la disponibilidad de las variantes antes de realizar operaciones de venta. | SKU de la variante consultada. | Stock disponible y estado de disponibilidad. |
| **Canal Chatbot** | Responder consultas sobre la disponibilidad de productos y sus variantes. | SKU de la variante consultada. | Stock disponible y estado de disponibilidad. |
| **Canal Retail** | Consultar la disponibilidad de las variantes durante una venta asistida. | SKU de la variante consultada. | Stock disponible y estado de disponibilidad. |
| **Ventas y Postventa** | Confirmar la venta para aplicar definitivamente el consumo de unidades sobre el inventario. | SKU y cantidad consumida de la venta confirmada. | Resultado de la actualización y stock actualizado. |
| **Despacho** | Entregar unidades correspondientes a ventas ya confirmadas; no genera consumo ni modifica el stock por sí mismo. | SKU y cantidad a despachar de ventas confirmadas. | Confirmación de la entrega (sin consumo adicional). |

La consulta de disponibilidad por parte de los canales **Marketplace, Retail y Chatbot** se realiza siempre referenciando una **Variante/SKU**; el canal no consulta el stock del producto como si el producto fuera la unidad de inventario.

## Dependencias dentro de Productos y Ofertas

| **Funcionalidad interna** | **Información necesaria** |
| --- | --- |
| **Gestión de productos** | Identificador, nombre, estado y variantes del producto para identificar qué unidades deben ser controladas mediante inventario. |
| **Gestión de variantes/SKUs** | Identificación y atributos de cada variante (SKU), base sobre la cual se controla el stock individual. |
| **Gestión de características** | Características de las variantes, como talla, color u otras que permitan diferenciar unidades de inventario. |
| **Gestión de precios** | Identificación de la variante y precio vigente cuando los canales necesiten relacionar la disponibilidad con la información comercial del producto. |

## Reglas consolidadas

* El `umbral_stock_bajo` se configura individualmente por SKU; no existe un valor global obligatorio.
* `order.created` no afecta stock; el consumo definitivo ocurre con `order.confirmed`.
* La generación del SKU corresponde a Gestión de Variantes/Productos según el tipo de producto.

> Nota: la generación del SKU la define la funcionalidad de **Gestión de variantes/SKUs** (generación automática desde `sku_base` y atributos identificadores); la confirmación del consumo y la interacción con Despacho ya quedaron resueltas en **CA-11** y en la tabla de interacción.