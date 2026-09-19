# SPEC-006 — Especificación: Gestión de ofertas y promociones

## 1. Contexto

El proyecto consiste en un Marketplace Multicanal para productos deportivos, organizado en módulos integrados mediante APIs. Dentro del Módulo de Productos y Ofertas, una funcionalidad obligatoria es la gestión de ofertas y promociones.

Esta capacidad concentra la lógica para registrar promociones, validar fechas, estado y condiciones, calcular descuentos y resolver conflictos cuando más de un beneficio puede aplicarse a una compra.

## 2. Propósito

Permitir al Gestor Comercial administrar promociones y permitir que los canales de venta consulten y evalúen correctamente los beneficios aplicables a productos y compras.

## 3. Alcance

Incluye:
- Registrar, consultar, modificar, activar y desactivar promociones.
- Asociar promociones a productos completos o a SKUs vendibles específicos.
- Gestionar descuentos por porcentaje o monto fijo.
- Validar vigencia, estado y productos participantes.
- Evaluar promociones aplicables.
- Resolver múltiples promociones automáticas válidas.
- Resolver la coincidencia entre una promoción automática y un cupón válido sin acumular descuentos.
- Preservar el beneficio registrado en pedidos ya confirmados.

## 4. Requisitos

### Requisito 1: Registrar promociones

El sistema DEBE permitir registrar una promoción indicando como mínimo nombre, tipo de descuento, valor, fecha/hora de inicio y fin, modalidad obligatoria `AUTOMATICA` o `CUPON`, estado inicial —ACTIVA o INACTIVA— y alcance asociado (uno o más productos y/o SKUs vendibles).

La fecha de inicio DEBE ser anterior a la fecha de fin.

### Requisito 2: Validar valores de descuento

Para descuento porcentual, el valor DEBE ser mayor que 0 y menor o igual que 100.

Para descuento de monto fijo, el valor DEBE ser mayor que 0. El monto fijo se aplica una sola vez sobre el subtotal elegible de la evaluación y no por unidad.

Ningún descuento puede producir un importe resultante negativo. Si el descuento calculado supera el subtotal elegible, se limita a dicho subtotal.

### Requisito 3: Modificar promociones

El sistema DEBE permitir modificar los datos configurables de una promoción existente, conservando la última configuración válida cuando una modificación sea rechazada.

Modificar una promoción no altera los descuentos ya registrados en pedidos confirmados.

### Requisito 4: Activar y desactivar promociones

El sistema DEBE permitir activar o desactivar una promoción sin eliminarla.

Una promoción inactiva no participa en nuevas evaluaciones.

Desactivar una promoción no altera descuentos ya registrados en pedidos confirmados.

### Requisito 5: Evaluar promociones aplicables

El sistema DEBE considerar únicamente promociones que:
- correspondan al producto o SKU evaluado según el alcance configurado;
- estén activas;
- se encuentren dentro de su periodo de vigencia.

El cálculo utiliza el precio regular vigente por SKU suministrado por Pricing como base para las alternativas; el precio de oferta de Pricing se compara como alternativa independiente, según la política comercial compartida, sin apilar descuentos.

### Requisito 6: Resolver múltiples promociones automáticas

Cuando más de una promoción con modalidad `AUTOMATICA` sea válida para la misma evaluación, el sistema DEBE seleccionar únicamente la que genere el mayor beneficio económico para el cliente, entendido como el menor importe resultante.

### Requisito 7: Resolver promoción automática y cupón

Una promoción de modalidad `AUTOMATICA`, una oferta vigente de Pricing y un cupón válido NO se acumulan en el alcance inicial.

El sistema DEBE comparar importes finales calculados sobre el total de la misma cesta, manteniendo intactas las líneas no elegibles, y aplicar una única alternativa de mayor beneficio. En empate cupón vs promoción automática se prioriza cupón; en empate con oferta de Pricing se prioriza la oferta vigente y no se consume cupón.

El cupón solo podrá consumirse posteriormente si fue el beneficio efectivamente seleccionado para el pedido.

### Requisito 7.1: Alcance por producto o SKU
Una promoción puede configurarse:
- a nivel de producto, caso en el cual aplica a todos sus SKUs vendibles activos; o
- a nivel de SKU específico, caso en el cual solo aplica a las variantes/unidades indicadas.

Si una misma promoción incluye producto y SKU, la evaluación deduplica el alcance y aplica el beneficio una sola vez sobre cada unidad elegible.

### Requisito 8: Consultar promociones

El sistema DEBE permitir consultar promociones con su tipo de descuento, valor, productos participantes, estado y periodo de vigencia.

### Requisito 9: Exponer evaluación mediante API

La evaluación debe devolver como mínimo:
- identificador de la promoción seleccionada, si existe;
- importe original;
- descuento aplicado;
- importe resultante;
- motivo cuando no existe un beneficio aplicable.

### Política comercial compartida de precios y descuentos (decisión interna)
Pricing es propietario del `precio_regular` vigente, del `precio_oferta` opcional y de los overrides de variante. Para cada SKU vendible entrega **ambos valores separados**, la moneda y la vigencia, resolviendo primero la herencia del producto o el override de la variante. La base para calcular porcentajes/montos de Promociones/Cupones es el **precio regular vigente por SKU**, multiplicado por la cantidad elegible; `precio_oferta` es un **beneficio alternativo de Pricing**, no una base para volver a aplicar promociones. La evaluación comercial compara el subtotal regular, la oferta propia de Pricing (cuando aplique), la mejor promoción automática y el cupón válido; aplica exclusivamente la alternativa que deja menor importe en el mismo conjunto elegible, sin acumularlas. En empate entre cupón y promoción automática se prioriza cupón; frente a empate con oferta Pricing se prioriza la oferta ya vigente para no consumir un cupón innecesariamente. El cupón solo consume uso si queda seleccionado. El resultado incluye precio regular, alternativa seleccionada, descuento, importe final y desglose por SKU. Los importes se calculan con decimal exacto y redondeo monetario al final de cada línea (2 decimales para PEN); se comparan importes finales no porcentajes nominales. Cada alternativa se compara contra el **total de la misma cesta**, incluyendo las líneas no elegibles sin modificación; no se comparan subtotales de conjuntos distintos.

Esta política es una **decisión interna provisional de comercialización**, no un contrato ya acordado con Ventas/Postventa. En pedidos confirmados Ventas conserva snapshot de precio y beneficio elegido.

### Requisito 10: Modalidad de promoción y transiciones
Toda promoción se crea con `modalidad = AUTOMATICA | CUPON`. Las automáticas pueden aplicarse sin código; las CUPON solo son candidatas cuando el comprador presenta y valida un cupón que las referencia. La modalidad es inmutable después de la primera activación o cuando existan cupones asociados o usos históricos: para cambiarla el gestor registra otra promoción. Si aún está en borrador funcional, inactiva y sin cupones ni usos, puede editarse antes de activarla. La API administrativa muestra modalidad y la evaluación excluye CUPON sin código. Cambiar la vigencia o desactivar una promoción no altera snapshots de pedidos confirmados.

### Requisito 11: Resultados provisionales de confirmación
La evaluación de beneficios NO consume usos. Ante el contrato provisional `order.confirmed` con `order_id`, identificador de beneficio seleccionado y resumen de SKU/cantidades/precios, Cupones revalida atómicamente el límite de usos, registra idempotentemente el consumo o devuelve `promotions.coupon.consumption.rejected` con correlación. Ventas/Postventa es dueño de resolver el pedido/pago si el consumo falla; Productos no confirma ni revierte pagos por su cuenta. Los mensajes de Ventas requieren homologación formal.

## 5. Requisitos no funcionales

- Rendimiento: las evaluaciones no deben afectar perceptiblemente la experiencia de compra.
- Seguridad: solo usuarios autenticados y autorizados como Gestor Comercial pueden administrar promociones.
- Auditoría: registrar creación y última modificación.
- Consistencia: usar una referencia temporal consistente en backend.
- Integración: exponer la lógica mediante API, sin acceso directo de otros módulos a la base de datos.

## 6. Fuera de alcance

- Gestión del código y control de usos de cupones, que corresponde a Gestión de Cupones.
- Gestión de venta cruzada y upselling.
- Gestión de productos, precios base y stock.
- Checkout, pedidos y pagos.
- Pantalla administrativa de simulación «Evaluar compra»; la evaluación de beneficios se expone por API y se ejecuta en los flujos reales de los canales/venta.

## Criterio de completitud

La capacidad se considera correctamente implementada cuando todos los requisitos y escenarios de esta especificación se cumplen y no se incorporan funcionalidades fuera del alcance.

---
