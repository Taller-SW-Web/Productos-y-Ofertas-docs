# SPEC-015 — Especificación: Gestión de inventario

## Descripción

La funcionalidad de **Gestión de inventario** permitirá controlar y mantener actualizada la disponibilidad de las variantes dentro del Marketplace.

Esta funcionalidad contempla dos operaciones principales: la **consulta de disponibilidad de stock** y la **actualización del stock por consumo**. Ambas permitirán que los diferentes canales y módulos del sistema trabajen con información actualizada sobre las unidades disponibles.

La gestión del inventario se realizará de manera integrada con los demás componentes del Marketplace, permitiendo consultar la disponibilidad de las variantes y actualizarla cuando se produzca un consumo.

## Unidad de inventario

En este módulo la unidad de inventario es el **SKU vendible**. Todo elemento que pueda venderse tiene exactamente una identidad SKU para Inventario:

* producto simple (`tiene_variantes = false`) → usa su `sku_base` como SKU vendible;
* producto con variantes (`tiene_variantes = true`) → cada variante posee su SKU autogenerado y el producto padre no tiene stock propio.

* **Inventario → SKU vendible:** el stock se controla de forma independiente por SKU.
* **Producto simple:** su `sku_base` funciona como SKU vendible y tiene un único registro de inventario.
* **Producto con variantes:** el producto es agrupador comercial y no posee stock propio; el inventario reside en los SKUs de sus variantes.

```text
Producto: Nike Air Max

├── SKU-001 → Negro / Talla 40 → stock 5
├── SKU-002 → Negro / Talla 41 → stock 0
└── SKU-003 → Blanco / Talla 40 → stock 8
```

Por lo tanto, toda consulta, registro o actualización de stock se realiza siempre referenciando un **SKU vendible**, sea el `sku_base` de un producto simple o el SKU de una variante.

---

## 1. Consulta de disponibilidad de stock

Esta funcionalidad permitirá consultar la cantidad de unidades disponibles de una variante y conocer su estado actual dentro del inventario.

Los diferentes canales podrán utilizar esta información para determinar si una variante se encuentra disponible antes de ofrecerla o realizar una operación relacionada con ella. Cuando se consulte el stock, la referencia obligatoria será la **Variante/SKU**.

Se contemplan principalmente los siguientes estados:

* **Disponible:** la variante cuenta con unidades disponibles.
* **Stock bajo:** la variante todavía cuenta con unidades, pero su cantidad se encuentra en o por debajo del umbral configurado.
* **Agotado:** no existen unidades disponibles.

Las reglas de determinación del estado son las siguientes:

```text
stock = 0
→ AGOTADO

0 < stock <= umbral_stock_bajo
→ STOCK_BAJO

stock > umbral_stock_bajo
→ DISPONIBLE
```

El `umbral_stock_bajo` será **configurable por cada Variante/SKU desde Gestión de Inventario**, que es la capacidad propietaria de esta configuración. Cada SKU puede definir su propio límite a partir del cual se considera stock bajo; Gestión de Variantes puede consultarlo, pero no lo edita. Corresponde a una configuración del negocio y no se asume un valor por defecto.

### Ejemplo

Una variante presenta:

> **Producto:** Nike Air Max
> **Variante/SKU:** SKU-001 — Negro / Talla 40
> **Stock disponible:** 8 unidades
> **Estado:** Disponible

Cuando el stock llegue a cero:

> **Producto:** Nike Air Max
> **Variante/SKU:** SKU-002 — Negro / Talla 41
> **Stock disponible:** 0 unidades
> **Estado:** Agotado

Cuando el stock se encuentre en el umbral o por debajo de él:

> **Producto:** Nike Air Max
> **Variante/SKU:** SKU-003 — Blanco / Talla 40
> **Stock disponible:** 3 unidades
> **umbral_stock_bajo:** 5 unidades
> **Estado:** Stock bajo

La consulta estará disponible para los diferentes canales contemplados por el proyecto, como **Marketplace, Retail y Chatbot**, permitiendo que cada uno conozca el estado actualizado del inventario de las variantes.

---

## 2. Actualización de stock por consumo

Esta funcionalidad permitirá actualizar el inventario cuando se produzca el **consumo de unidades de una variante**.

Cuando una operación implique el consumo de determinadas variantes, la cantidad correspondiente será descontada del inventario para mantener actualizada la disponibilidad.

### Ejemplo

Si una variante cuenta inicialmente con:

> **Variante/SKU:** SKU-001 — Negro / Talla 40
> **Stock:** 10 unidades

y se consumen:

> **Cantidad consumida:** 3 unidades

el inventario se actualizará a:

> **Stock disponible:** 7 unidades

De esta manera, las unidades consumidas dejarán de considerarse disponibles para futuras operaciones.

---

## 3. Validación del consumo

Antes de actualizar el inventario se deberá verificar que exista una cantidad suficiente de unidades disponibles.

Si la cantidad solicitada supera el stock existente, el consumo no deberá realizarse.

### Reglas de consumo

La actualización por consumo deberá garantizar lo siguiente:

* El stock de una variante **nunca puede quedar negativo**.
* El consumo **no puede superar el stock disponible** de la variante.
* **Dos consumos simultáneos no pueden consumir las mismas unidades**; cada consumo debe operar sobre unidades disponibles reales.
* La actualización del stock debe realizarse de forma **atómica/transaccional**, sin estados intermedios que corrompan la información.
* Para ello, el descuento se ejecutará como una **actualización condicional sobre el stock disponible**: el consumo se acepta únicamente si, al momento de aplicarse, la cantidad solicitada está cubierta por las unidades disponibles.
* La protección de los consumos concurrentes será la misma definida para las operaciones masivas de actualización de inventario del módulo (**control de concurrencia optimista**), de modo que los consumos por venta y los ajustes masivos convivan sin inconsistencias ni bloqueos globales.
* Si no se puede garantizar la disponibilidad de las unidades solicitadas, la operación debe **rechazarse**.

### Ejemplo

> **Variante/SKU:** SKU-001 — Negro / Talla 40
> **Stock inicial:** 5 unidades
>
> **Consumo A = 3 unidades**
> **Consumo B = 3 unidades**

No se deben aceptar ambos consumos.

Resultado válido:

> **Consumo A:** Aceptado — Stock final: 2 unidades
> **Consumo B:** Rechazado por stock insuficiente

En el resultado, una operación se acepta, la otra se rechaza por stock insuficiente y el stock nunca queda negativo.

---

## 4. Integración con otros módulos

La gestión de inventario estará integrada con los diferentes componentes que necesiten consultar o actualizar la disponibilidad de las variantes.

### Dependencias internas del módulo de Productos y Ofertas

La gestión de inventario se sustenta en las siguientes capacidades del mismo módulo, por lo que no constituyen integraciones externas:

* **Gestión de productos:** define el producto como agrupador comercial de las variantes.
* **Gestión de variantes/SKUs:** define cada variante, su código único y sus atributos; es la base sobre la cual se controla el stock.
* **Gestión de características:** proporciona los atributos (talla, color, entre otros) que distinguen a cada variante.
* **Gestión de precios:** identifica la variante y su precio vigente cuando los canales necesiten relacionar la disponibilidad con la información comercial del producto.

### Canales

La **consulta de disponibilidad** será utilizada por los canales que necesiten conocer el stock disponible de una variante. Los canales **Marketplace, Retail y Chatbot** consultan disponibilidad referenciando una **Variante/SKU**; este consumo de información no cambia la unidad de inventario.

### Integraciones externas

La **actualización por consumo** permitirá reflejar las unidades utilizadas en las operaciones correspondientes. Para las operaciones que impliquen consumo de stock, se contempla la comunicación con los módulos de **Ventas y Despacho**.

**Delimitación de Ventas y Despacho:**

* La **confirmación definitiva del consumo** se solicita mediante el contrato **provisional `order.confirmed`**, cuya existencia, nombre y campos deberán homologarse con **Ventas y Postventa**, cuando la venta queda confirmada (pago aprobado o estado equivalente para un canal sin pago electrónico). Sin `order.confirmed` no se aplica consumo definitivo.
* El módulo de **Despacho no genera consumo adicional ni modifica directamente el stock**: se limita a entregar las unidades correspondientes a ventas ya confirmadas, cuyos consumos ya fueron aplicados y validados bajo la misma regla de consumo.
* En el alcance actual **no se contemplan reservas** en `order.created`: crear un pedido no descuenta ni reserva stock.
* Si una venta confirmada es anulada **antes del despacho**, el evento provisional `order.cancelled` solicita compensar únicamente un consumo previo exitoso y no compensado.
* Si la mercadería ya fue entregada, la reposición de stock solo ocurre ante una **devolución aceptada y físicamente reintegrable**, comunicada mediante el evento provisional `order.returned` con cantidades aceptadas; para combo inicial se exige devolución integral.
* Una anulación administrativa posterior al despacho que no implique devolución física no repone stock.

Después de cada actualización de stock (por consumo o ajuste), la gestión de inventario **notificará el cambio de stock** de la variante mediante el contrato de evento `inventory.stock.changed`, que será consumido por el dashboard analítico y por otros componentes interesados para mantenerse actualizados.

La comunicación entre módulos se realizará mediante las interfaces de integración establecidas para el proyecto, manteniendo la separación entre los diferentes componentes.

---

### Contrato provisional de consumo, compensación y venta sin stock
Ventas/Postventa aún no ha homologado eventos. Como hipótesis interna se acepta `order.confirmed` con `order_id`, `operation_id`, `occurred_at`, SKUs y cantidades por línea, referencia/snapshot de componentes de combo cuando aplique, y versión del contrato. Inventario verifica existencia, elegibilidad, stock y deduplicación por `order_id + tipo_operacion + sku`, aplica el débito ACID para **todas las líneas de la misma operación** y registra Kardex y Outbox en la misma transacción local. Publica `inventory.consumption.completed` o `inventory.consumption.rejected` con `order_id`, `operation_id`, SKUs y motivo; no decide ni altera estados del pedido o pagos. Si el stock es insuficiente tras un pedido/pago confirmado, Ventas/Postventa resuelve la anulación, sustitución o reembolso mediante su propio proceso pendiente de coordinación. La consulta anterior a la venta no constituye reserva ni garantía de stock.

Las compensaciones `order.cancelled`/`order.returned` deben referenciar `order_id`, operación previa y líneas aceptadas. `order.cancelled` revierte solamente consumos efectivos y previos a despacho; `order.returned` registra solo unidades realmente aceptadas/reintegrables, y para combo inicial se exige devolución integral. El procesamiento es idempotente, tolera llegada desordenada con estado pendiente/reconciliación y evita acreditar dos veces el mismo consumo. Ningún evento de Despacho ocasiona débito adicional.

### Ajuste masivo y control de concurrencia
Inventario inicializa cada nuevo SKU vendible con stock 0 y `stock_version=0`, de forma idempotente. Los conteos absolutos de `SPEC-001-carga-exportacion-masiva-productos.md` requieren `stock_version`. Inventario es el único dueño del ajuste, recibido mediante `inventory.bulk.stock.adjust.requested`; comprueba `stock_version` con actualización condicional y registra movimiento de Kardex anterior/nuevo/delta. Si hubo consumo concurrente que cambió la versión, publica rechazo `VERSION_CONFLICT` y no reaplica el conteo obsoleto. Solo después de persistir emite `inventory.stock.adjusted` y `inventory.stock.changed`. Se permiten bloqueos transaccionales breves por SKU, nunca un bloqueo global de todas las ventas. Una variación de inventario no es un evento de confirmación de pedido.

### Límite de aprobación de contratos externos
Los nombres y payloads de `order.confirmed`, `order.cancelled` y `order.returned`, y de los resultados de consumo, constituyen un **contrato de integración propuesto**, pendiente de homologación con Ventas y Postventa. Hasta ese acuerdo, ninguna implementación puede presumir que el equipo externo ya publica tales mensajes, ni que el pago queda automáticamente revertido ante un rechazo de Inventario. El consumo y las compensaciones aquí descritos son las reglas internas que implementará Productos al recibir una comunicación equivalente acordada.

## 5. Resultado esperado

La funcionalidad permitirá mantener un inventario actualizado y disponible para los diferentes componentes del Marketplace.

En términos generales, permitirá:

* Consultar la cantidad disponible de una variante.
* Conocer el estado actual del stock de cada variante.
* Identificar variantes disponibles, con stock bajo o agotadas, mediante el `umbral_stock_bajo` configurado por variante.
* Registrar el consumo de unidades sobre una variante.
* Actualizar la cantidad disponible después de cada consumo.
* Evitar consumos superiores al stock existente y consumos concurrentes sobre las mismas unidades.
* Aplicar el consumo únicamente cuando exista una venta confirmada, quedando Despacho limitado a la entrega de unidades ya vendidas.
* Notificar los cambios de stock mediante el contrato de evento `inventory.stock.changed` para mantener actualizados el dashboard analítico y los componentes integrados.
* Mantener las proyecciones de disponibilidad utilizadas por los canales mediante eventos; las vistas son eventualmente consistentes y el consumo definitivo vuelve a comprobar el stock en Inventario.

Con estas funcionalidades, el inventario proporcionará información actualizada sobre la disponibilidad de las variantes y permitirá reflejar correctamente los cambios producidos por su consumo.

---
