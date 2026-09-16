# Especificación: Gestión de paquetes/combos de productos

## 1. Contexto
La empresa deportiva busca incentivar las ventas agrupando productos complementarios en paquetes (combos) atractivos para los clientes. El gestor comercial necesita una herramienta para crear y gestionar estos combos, permitiendo que se vendan bajo un precio promocional unificado, pero garantizando que al momento de la venta se descuente y reserve correctamente el stock individual de cada SKU específico que compone el paquete, preservando la consistencia transaccional y la arquitectura orientada a eventos (EDA).

## 2. Propósito
Permitir al gestor comercial agrupar múltiples artículos individuales a nivel de SKU/Variante en un combo con un precio único con descuento garantizado, asegurando el cálculo de disponibilidad en tiempo real, el descuento automático ante la creación del pedido y la compensación transaccional si el pedido se cancela.

## 3. Alcance
Incluye:
- Creación, edición, consulta y desactivación de combos de productos.
- Configuración de componentes a nivel de **SKU / Variante específica** (o producto simple sin variantes) con sus respectivas cantidades (mínimo 2 artículos).
- Validación de regla de negocio obligatoria de precio: el precio del combo DEBE ser estrictamente menor a la suma de los precios vigentes de sus componentes individuales ($precio\_combo < \sum precio\_componentes$).
- Prohibición estricta de anidamiento (un combo solo puede componerse de productos/SKUs directos; no se permiten combos dentro de combos).
- Cálculo dinámico de disponibilidad del combo basado en la existencia del SKU con menor disponibilidad proporcional.
- Deducción inmediata de stock al recibir el evento `order.created` (creación de pedido) y mecanismo de compensación/rollback al recibir el evento `order.cancelled` (cancelación o expiración de pago).
- Reposición atómica e integral de stock de todos los SKUs componentes en devoluciones totales confirmadas (`order.returned`).
- Desactivación reactiva automática del combo en todos los canales de venta ante el evento de baja o desactivación de cualquiera de sus SKUs componentes (`catalog.sku.deactivated`).

## 4. Requisitos

### Requisito 1: Gestión de Combos y validación de componentes y precios
El sistema DEBE permitir al gestor comercial crear y modificar combos definiendo sus SKUs componentes, cantidades y precio final, validando que el precio represente una oferta real frente a la suma de componentes y prohibiendo anidamientos.

#### Escenario: Creación exitosa de un combo
- DADO que el gestor comercial se encuentra en la pantalla de gestión de combos
- CUANDO ingresa nombre, descripción, selecciona 2 o más SKUs individuales válidos con stock y define un precio de paquete que es estrictamente menor a la suma de los precios regulares de dichos SKUs
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
El sistema DEBE calcular en tiempo real el stock disponible del combo en función del SKU componente con menor disponibilidad proporcional ($stock\_disponible = \min \lfloor stock\_sku_i / cantidad\_requerida_i \rfloor$).

#### Escenario: Disponibilidad proporcional basada en SKUs
- DADO que un combo incluye 1 "Camiseta Talla M" (SKU-CAM-M, Stock: 10) y 2 "Medias Blancas" (SKU-MED-W, Stock: 15)
- CUANDO los canales de venta consultan la disponibilidad del combo
- ENTONCES el sistema calcula y responde que hay 7 combos disponibles (limitado por $15 / 2 = 7$).

#### Escenario: Combo no disponible por agotamiento de un SKU
- DADO que uno de los SKUs componentes del combo tiene stock 0
- CUANDO se consulta la disponibilidad del combo
- ENTONCES el sistema responde disponibilidad 0 y los canales lo muestran como no disponible para compra.

### Requisito 3: Descuento inmediato, compensación y devolución de stock (EDA)
El sistema DEBE descontar el inventario de todos los SKUs del combo de forma atómica ante `order.created`, compensar ante `order.cancelled`, y reponer integralmente ante `order.returned`.

#### Escenario: Descuento de stock ante creación de pedido (order.created)
- DADO que un cliente adquiere un combo compuesto por 1 "Raqueta" (SKU-RAQ, Stock: 5) y 3 "Pelotas" (SKU-PEL, Stock: 20)
- CUANDO el módulo de Ventas y Postventa emite el evento `order.created`
- ENTONCES el sistema descuenta de forma atómica 1 unidad a SKU-RAQ (Nuevo Stock: 4) y 3 unidades a SKU-PEL (Nuevo Stock: 17).

#### Escenario: Compensación automática por pago fallido o cancelado (order.cancelled)
- DADO que se descontó el stock de los SKUs de un combo por un pedido generado
- CUANDO el pedido no se paga en la ventana de tiempo o se cancela, emitiendo el evento `order.cancelled`
- ENTONCES el sistema ejecuta una transacción de compensación reponiendo atómicamente 1 unidad a SKU-RAQ y 3 unidades a SKU-PEL.

#### Escenario: Devolución integral del combo (order.returned)
- DADO que se confirma la devolución total de un pedido que contenía un combo
- CUANDO se recibe el evento `order.returned`
- ENTONCES el sistema repone simultáneamente el stock de todos los SKUs individuales que integraban dicho combo.

### Requisito 4: Desactivación automática por baja de componentes
El sistema DEBE inhabilitar automáticamente el combo en los canales comerciales si cualquiera de sus SKUs componentes es dado de baja o desactivado en el catálogo.

#### Escenario: Baja de un SKU componente
- DADO un combo activo que contiene el producto "Pelotas" (SKU-PEL)
- CUANDO el gestor desactiva SKU-PEL en el Catálogo emitiéndose `catalog.sku.deactivated`
- ENTONCES el sistema marca automáticamente el combo como inactivo para los canales de venta y genera una alerta al gestor comercial para su revisión.

## 5. Requisitos no funcionales
- Consistencia transaccional: El descuento, compensación y reposición de stock de los múltiples SKUs del combo debe ejecutarse dentro de una transacción ACID indivisible (se aplican todos o ninguno).
- Patrón Saga / Eventos: Resiliencia ante fallos en pagos mediante eventos de compensación (`order.cancelled`), asegurando consistencia eventual y sin reservas huérfanas.
- Rendimiento: La consulta dinámica de disponibilidad del combo debe responder en menos de **200 ms** para optimizar la navegación en carritos de compra y canales digitales.

## 6. Fuera de alcance
- Facturación, cobro y gestión del ciclo de vida del pedido (responsabilidad de Ventas y Postventa).
- Despacho y cálculo de costos logísticos de empaque conjunto (Módulo de Despacho y Entrega).
- Devoluciones parciales de artículos de un combo (la regla de postventa para combos opera de forma integral).

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Los combos se articulan exclusivamente sobre SKUs individuales y rechazan anidamiento.
- Se valida obligatoriamente que $precio\_combo < \sum precio\_componentes$.
- El descuento se ejecuta en `order.created` y compensa en `order.cancelled`.
- Se desactiva automáticamente en canales al desactivarse un componente.
- Todos los escenarios y transacciones ACID de stock se cumplen rigurosamente.
