# SPEC-002 — Especificación: Gestión de combos de productos

**Responsable:** Marco Renato Castilla Huanca  
**Rama:** castilla  
**Trazabilidad:** HU [HU-002](../hu/HU-002-gestion-combos-productos.md) | Wireframe [WF-002](../wireframes/flows/WF-002-gestion-combos-productos.md)

## 1. Contexto
La empresa deportiva busca incentivar las ventas agrupando productos complementarios en paquetes (combos) atractivos para los clientes. El gestor comercial necesita una herramienta para crear y gestionar estos combos, permitiendo que se vendan bajo un precio promocional unificado, pero garantizando que, al confirmarse la venta, se descuente correctamente el stock individual de cada SKU específico que compone el paquete, preservando la consistencia transaccional y la arquitectura orientada a eventos (EDA).

## 2. Propósito
Permitir al gestor comercial agrupar múltiples artículos individuales a nivel de SKU vendible en un combo con un precio único con descuento garantizado, asegurando una estimación de disponibilidad basada en una proyección de existencias eventualmente consistente, el descuento automático solo ante la confirmación definitiva del pedido (`order.confirmed`) y la compensación transaccional si el pedido se cancela.

## 3. Alcance
Incluye:
- Creación, edición, consulta y desactivación de combos de productos.
- Configuración de componentes exclusivamente por **SKU vendible** (SKU de variante o `sku_base` de producto simple) con sus respectivas cantidades (mínimo 2 SKUs distintos, cada uno con cantidad entera positiva).
- Validación de precio comercial: el combo DEBE ser mayor que cero y menor tanto que la suma de precios regulares como que la suma de los **precios públicos vigentes de compra individual** de sus componentes (oferta propia de Pricing cuando exista; en caso contrario, regular), multiplicados por sus cantidades. Promociones de carrito y cupones no forman parte de esta comparación porque dependen del contexto de compra.
- Prohibición estricta de anidamiento (un combo solo puede componerse de productos/SKUs directos; no se permiten combos dentro de combos).
- Cálculo dinámico de disponibilidad del combo basado en la existencia del SKU con menor disponibilidad proporcional.
- Deducción definitiva de stock al recibir `order.confirmed` desde Ventas/Postventa. `order.created` no descuenta ni reserva stock en el alcance actual. Si una venta confirmada se cancela antes del despacho, `order.cancelled` compensa el consumo.
- Reposición de stock exclusivamente por las líneas y cantidades que Ventas/Postventa confirme como devueltas, aceptadas y físicamente reintegrables mediante el contrato homologado. La política que decide si una devolución parcial del combo está permitida pertenece a Ventas/Postventa; Inventario no la decide.
- Desactivación reactiva automática del combo en todos los canales de venta ante el evento de baja o desactivación de cualquiera de sus SKUs componentes (`catalog.sku.deactivated`).

## 4. Requisitos

### Requisito 1: Gestión de Combos y validación de componentes y precios
El sistema DEBE permitir al gestor comercial crear y modificar combos definiendo sus SKUs componentes, cantidades y precio final, validando que el precio represente una oferta real frente a la suma de componentes y prohibiendo anidamientos.

#### Escenario: Creación exitosa de un combo
- DADO que el gestor comercial se encuentra en la pantalla de gestión de combos
- CUANDO ingresa nombre, descripción, selecciona 2 o más SKUs individuales **distintos** válidos con stock y cantidades positivas y define un precio de paquete que es estrictamente menor a la suma de los precios regulares de dichos SKUs multiplicados por sus cantidades
- ENTONCES el sistema registra el combo, lo activa para su venta en los canales y vincula los SKUs con sus cantidades correspondientes.

#### Escenario: Rechazo por precio de combo igual o superior a la suma de componentes
- DADO que el gestor comercial intenta registrar un combo cuya suma de precios individuales de sus componentes es S/ 150
- CUANDO ingresa un precio de paquete igual o mayor a S/ 150 (o menor/igual a cero)
- ENTONCES el sistema rechaza el guardado, emitiendo un mensaje de error que indica que el precio del combo debe ser estrictamente menor a la suma individual de sus componentes.

#### Escenario: Rechazo de combo anidado
- DADO que el gestor comercial está seleccionando los artículos a incluir en un nuevo combo
- CUANDO intenta seleccionar un paquete/combo preexistente como componente
- ENTONCES el sistema impide la selección e indica que los combos solo pueden componerse de productos/SKUs directos.

### Requisito 2: Cálculo dinámico de disponibilidad del combo
El sistema DEBE calcular la **disponibilidad informativa** del combo con el último saldo y versión conocidos en su proyección por SKU ($stock\_informativo = \min \lfloor stock\_sku_i / cantidad\_requerida_i \rfloor$). La respuesta identifica `calculated_at` y el estado de actualización; si falta información o se sabe que está desactualizada, devuelve disponibilidad **no verificable** y no la convierte en cero ni en garantía de compra. La validación vinculante del stock ocurre únicamente en Inventario al procesar `order.confirmed`; no se introducen reservas. El objetivo de latencia de 200 ms corresponde a esta lectura de proyección, no a una consulta sincronizada a Inventario.

#### Escenario: Disponibilidad proporcional basada en SKUs
- DADO que un combo incluye 1 "Camiseta Talla M" (SKU-CAM-M, Stock: 10) y 2 "Medias Blancas" (SKU-MED-W, Stock: 15)
- CUANDO los canales de venta consultan la disponibilidad del combo
- ENTONCES el sistema calcula y responde que hay 7 combos disponibles (limitado por $\lfloor 15 / 2 \rfloor = 7$).

#### Escenario: Combo no disponible por agotamiento de un SKU
- DADO que uno de los SKUs componentes del combo tiene stock 0
- CUANDO se consulta la disponibilidad del combo
- ENTONCES el sistema responde disponibilidad 0 y los canales lo muestran como no disponible para compra.

### Requisito 3: Descuento al confirmar, compensación y devolución de stock (EDA)
El sistema DEBE descontar el inventario de todos los SKUs del combo de forma atómica ante `order.confirmed`, compensar ante `order.cancelled` cuando la cancelación ocurra antes del despacho, y reponer ante `order.returned` **solo las líneas y cantidades aceptadas/reintegrables que Ventas/Postventa comunique**. Productos y Ofertas no define si Postventa permite una devolución total o parcial; únicamente ejecuta de forma idempotente el movimiento de inventario autorizado.

#### Escenario: Descuento de stock ante venta confirmada (`order.confirmed`)
- DADO que un cliente adquiere un combo compuesto por 1 "Raqueta" (SKU-RAQ, Stock: 5) y 3 "Pelotas" (SKU-PEL, Stock: 20)
- CUANDO Ventas y Postventa emite `order.confirmed`
- ENTONCES el sistema descuenta de forma atómica 1 unidad a SKU-RAQ (Nuevo Stock: 4) y 3 unidades a SKU-PEL (Nuevo Stock: 17).

#### Escenario: Compensación por cancelación posterior a confirmación y previa a despacho (`order.cancelled`)
- DADO que se descontó el stock de los SKUs de un combo por una venta confirmada
- CUANDO la venta se cancela antes del despacho y se emite `order.cancelled`
- ENTONCES el sistema ejecuta una transacción de compensación reponiendo atómicamente 1 unidad a SKU-RAQ y 3 unidades a SKU-PEL.

#### Escenario: Reposición por devolución aceptada (`order.returned`)
- DADO que un pedido confirmado contenía un combo y Ventas/Postventa aceptó la devolución física de una o más líneas de sus componentes
- CUANDO se recibe el contrato homologado `order.returned` con los SKUs y cantidades efectivamente reintegrables
- ENTONCES Inventario repone exactamente esas cantidades, de forma idempotente, sin decidir por su cuenta si la devolución comercial debía ser total o parcial.

### Requisito 4: Desactivación automática por baja de componentes
El sistema DEBE marcar el combo como inactivo al procesar el evento de baja o desactivación de cualquiera de sus SKUs componentes. La propagación hacia los canales es eventual y no garantiza visibilidad instantánea global.

#### Escenario: Baja de un SKU componente
- DADO un combo activo que contiene el producto "Pelotas" (SKU-PEL)
- CUANDO el gestor desactiva SKU-PEL en el Catálogo emitiéndose `catalog.sku.deactivated`
- ENTONCES el sistema marca automáticamente el combo como inactivo para los canales de venta y genera una alerta al gestor comercial para su revisión.

### Requisito 5: Composición y precio de referencia unificados
Cada combo contiene **al menos dos SKUs vendibles distintos**, sin duplicar el mismo SKU en varias filas, y cada cantidad es un entero positivo. Pricing entrega por SKU el `precio_regular` y el `precio_oferta` vigente cuando exista. Se calculan dos referencias: `suma_regular = SUM(precio_regular * cantidad)` y `suma_publica_vigente = SUM(min(precio_regular, precio_oferta_vigente_si_existe) * cantidad)`. El precio del combo debe cumplir `0 < precio_combo < suma_regular` **y** `precio_combo < suma_publica_vigente`, evitando que un paquete resulte más caro que comprar sus componentes individualmente con las ofertas permanentes de Pricing visibles en ese momento. Promociones automáticas y cupones de carrito quedan fuera de esta comparación porque dependen de reglas contextuales. Si una variación de Pricing invalida cualquiera de las desigualdades, el combo queda no elegible para nuevas ventas y el gestor recibe alerta; un pedido ya confirmado conserva su snapshot histórico.

### Requisito 6: Snapshot y resultado provisional de venta
La confirmación `order.confirmed` debe transportar `order_id`, líneas de SKUs y cantidades de componentes del combo tal como fueron aceptados en el pedido, `combo_id` y versión/snapshot de composición; **Inventario** es el único que ejecuta el débito ACID, no Combos. Este contrato, junto con `order.cancelled` y `order.returned`, es provisional hasta homologarlo con Ventas y Postventa. Ante rechazo de stock, Inventario emite un resultado correlacionado y Ventas resuelve estado del pedido y pago. La consulta de disponibilidad refleja una proyección y no constituye una reserva ni garantía de stock al confirmar.

## 5. Requisitos no funcionales
- Consistencia transaccional: El descuento, compensación y reposición de stock de los múltiples SKUs del combo debe ejecutarse dentro de una transacción ACID indivisible (se aplican todos o ninguno).
- Patrón Saga / Eventos: `order.confirmed` inicia el débito definitivo; `order.cancelled` compensa cancelaciones previas al despacho y `order.returned` repone devoluciones aceptadas.
- Rendimiento: La consulta dinámica de disponibilidad del combo debe responder en menos de **200 ms** para optimizar la navegación en carritos de compra y canales digitales.

## 6. Fuera de alcance
- Facturación, cobro y gestión del ciclo de vida del pedido (responsabilidad de Ventas y Postventa).
- Despacho y cálculo de costos logísticos de empaque conjunto (Módulo de Despacho y Entrega).
- Decidir si una devolución de combo puede ser total o parcial, sus causales, autorizaciones y reembolsos — responsabilidad de Ventas y Postventa. Productos e Inventario solo procesan las líneas aceptadas que el contrato homologado comunique.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Los combos se articulan exclusivamente sobre SKUs individuales y rechazan anidamiento.
- Se valida obligatoriamente que el combo sea más barato que la suma regular y que la compra individual con ofertas vigentes de Pricing, sin intentar incorporar promociones de carrito o cupones contextuales.
- El descuento se ejecuta en `order.confirmed`; `order.created` no afecta stock. Se compensa con `order.cancelled` cuando corresponde.
- Se desactiva automáticamente en canales al desactivarse un componente.
- Todos los escenarios y transacciones ACID de stock se cumplen rigurosamente.
