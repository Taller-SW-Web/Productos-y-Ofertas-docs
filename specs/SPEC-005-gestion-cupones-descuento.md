# SPEC-005 — Especificación: Gestión de cupones de descuento

**Responsable:** Axel Andree Cueva Alcalá  
**Rama:** cueva  
**Trazabilidad:** HU [HU-005](../hu/HU-005-gestion-cupones-descuento.md) | Wireframe [WF-005](../wireframes/flows/WF-005-gestion-cupones-descuento.md)

## 1. Contexto

La gestión de cupones permite administrar códigos que habilitan promociones previamente configuradas para aplicarse mediante código. Esta capacidad concentra las restricciones propias del cupón y el control seguro de su utilización.

## 2. Propósito

Permitir al Gestor Comercial administrar cupones y permitir a los canales validar y consumir de forma segura un código de descuento.

## 3. Modelo de dominio consolidado

El **Cupón** contiene:
- código único;
- estado;
- referencia a una promoción de modalidad CUPÓN;
- monto mínimo de compra opcional;
- límite máximo de usos global opcional;
- límite máximo de usos por cliente opcional;
- política configurable de restitución de uso ante cancelación (`RESTAURAR_EN_CANCELACION | NO_RESTAURAR`);
- usos consumidos globales y, cuando aplica, consumo por `customer_ref` estable;
- datos de auditoría.

La **Promoción asociada** contiene:
- tipo de descuento;
- valor;
- productos elegibles;
- fecha/hora de inicio y fin;
- estado.

Por tanto, el cupón no duplica descuento, productos elegibles ni vigencia.

## 4. Alcance

Incluye:
- Registrar, consultar, modificar, activar y desactivar cupones.
- Asociar cada cupón a una promoción de modalidad CUPÓN.
- Validar códigos duplicados y formato.
- Validar monto mínimo opcional.
- Validar límites de uso globales y por cliente cuando estén configurados.
- Validar estado y vigencia mediante la promoción asociada.
- Exponer validación por API sin consumir usos.
- Consumir el uso al recibir la confirmación definitiva del pedido.
- Garantizar idempotencia y concurrencia del consumo.
- Consultar información operacional de uso.

## 5. Requisitos

### Requisito 1: Registrar cupones

El sistema DEBE permitir registrar código, estado, promoción asociada, monto mínimo opcional, límite máximo de usos global opcional, límite máximo por cliente opcional y política de restitución de uso ante cancelación. Productos y Ofertas almacena únicamente la referencia estable `customer_ref` necesaria para contabilizar el uso; no replica datos personales ni perfiles cuyo propietario es Seguridad y Usuarios.

La promoción asociada DEBE existir y estar configurada con modalidad CUPÓN.

El código se normaliza con `trim` y conversión a mayúsculas. Solo se permiten letras A-Z, números, guion medio y guion bajo. La unicidad se evalúa sobre el valor normalizado.

### Requisito 2: Validar la promoción asociada

Para aceptar el cupón, la promoción asociada DEBE:
- estar activa;
- encontrarse dentro de su vigencia;
- aplicar a los productos de la compra.

El descuento, valor, productos elegibles y vigencia provienen únicamente de dicha promoción.

### Requisito 3: Validar monto mínimo

Si el cupón tiene monto mínimo, la compra elegible debe alcanzar o superar dicho monto. El valor configurado debe ser mayor que 0.

### Requisito 4: Validar límites de uso

Si existe límite global o por cliente:
- cada límite debe ser un entero positivo;
- el límite global no puede reducirse por debajo de los usos globales ya consumidos;
- el límite por cliente no puede configurarse con un valor superior al global cuando ambos existan;
- un cupón agotado globalmente no puede validarse como aplicable;
- si existe `max_usos_por_cliente`, la validación requiere una `customer_ref` suministrada por el canal/Ventas y rechaza al cliente que ya alcanzó su límite. La funcionalidad no consulta directamente la base de Seguridad y Usuarios.

### Requisito 5: Validar cupón por API sin consumirlo

La validación DEBE devolver:
- validez;
- motivo de rechazo, cuando corresponda;
- promoción/beneficio asociado;
- descuento calculado;
- importe resultante.

La validación, por sí sola, NO incrementa el contador de usos.

### Requisito 6: Consumir un uso

El uso se consume cuando Ventas y Postventa confirma definitivamente el pedido después de la aprobación del pago o del evento equivalente de confirmación en el canal. La confirmación incluye `customer_ref` cuando el cupón aplica un límite por cliente.

Solo se consume si el cupón fue el beneficio finalmente seleccionado. El incremento del contador global y del contador por cliente, cuando exista, se realiza en una misma transacción local e idempotente.

### Requisito 7: Garantizar idempotencia

La combinación `order_id + cupon_id` debe ser única para el registro de consumo. Reintentos o mensajes duplicados de la misma confirmación no incrementan el contador.

### Requisito 8: Garantizar concurrencia

Si varios pedidos compiten por los últimos usos, el sistema debe asegurar atómicamente que el contador nunca supere el límite máximo.

### Requisito 9: Resolver convivencia con otros beneficios

La convivencia del cupón con una promoción automática o una oferta de Pricing se rige por la `politica_combinacion` de la promoción asociada. Una promoción puede declararse exclusiva o permitir combinaciones concretas. El motor evalúa únicamente combinaciones expresamente autorizadas y selecciona la combinación válida con menor importe final sobre la misma cesta; nunca acumula beneficios cuya configuración no lo permita. Un cupón solo consume uso cuando forma parte de la combinación finalmente seleccionada.

### Requisito 10: Anulación posterior

La restitución de un uso consumido depende de la política configurada en el cupón. Si `politica_cancelacion=RESTAURAR_EN_CANCELACION` y Ventas/Postventa comunica una cancelación homologada del pedido antes de que exista un uso comercial consumado según la política acordada, Cupones restaura idempotentemente el contador global y por cliente. Si la política es `NO_RESTAURAR`, conserva el consumo. Cupones no decide la causa ni el estado del pedido; solo reacciona al contrato de Postventa.

### Requisito 11: Consultar cupones

La consulta administrativa DEBE mostrar:
- código;
- promoción asociada;
- estado;
- monto mínimo;
- límite máximo global;
- límite por cliente, cuando exista;
- política de restitución ante cancelación;
- usos consumidos;
- usos disponibles, cuando exista límite.

### Requisito 12: Integración provisional de confirmación y rechazo
La validación sin consumo puede vencer entre cotización y confirmación. Al recibir un `order.confirmed` provisional con `order_id`, `cupon_id`, `customer_ref` cuando corresponda, beneficio elegido y líneas de compra, Cupones comprueba de forma atómica que el mismo `order_id + cupon_id` no fue consumido, que el cupón sigue elegible, que queda capacidad global y que el cliente no superó su límite. Publica un resultado idempotente `promotions.coupon.consumption.completed` o `promotions.coupon.consumption.rejected` con `order_id`, `operation_id` y motivo. Si falla después de que Ventas confirmó el pago, Ventas/Postventa define la gestión comercial/financiera; Cupones no procesa reembolsos ni decreta el estado del pedido. Las denominaciones y campos externos están pendientes de homologación con Ventas; no se consideran un compromiso de ese equipo.

## 6. Requisitos no funcionales

- Rendimiento: la validación no debe retrasar perceptiblemente la compra.
- Seguridad: solo Gestor Comercial autorizado administra cupones.
- Auditoría: conservar creación y última modificación.
- Consistencia: usar referencia temporal consistente.
- Concurrencia: consumo atómico y seguro ante solicitudes simultáneas.
- Integración: API y eventos sin acceso directo de otros módulos a la base de datos.

## 7. Fuera de alcance

- Definir el descuento, productos elegibles y vigencia: corresponde a Gestión de Promociones.
- Procesamiento del pago.
- Reembolsos y devoluciones.
- Decidir causas, autorizaciones o efectos financieros de una anulación; la eventual restitución del contador se limita a aplicar la política propia del cupón cuando Ventas/Postventa comunique una cancelación homologada.

## Criterio de completitud

La capacidad se considera correctamente implementada cuando todos los requisitos anteriores se cumplen.
