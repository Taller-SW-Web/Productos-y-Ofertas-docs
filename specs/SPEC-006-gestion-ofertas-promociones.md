# SPEC-006 — Especificación: Gestión de ofertas y promociones

## 1. Contexto

El proyecto consiste en un Marketplace Multicanal para productos deportivos, organizado en módulos integrados mediante APIs. Dentro del Módulo de Productos y Ofertas, una funcionalidad obligatoria es la gestión de ofertas y promociones.

Esta capacidad concentra la lógica para registrar promociones, validar fechas, estado y condiciones, calcular descuentos y resolver conflictos cuando más de un beneficio puede aplicarse a una compra.

## 2. Propósito

Permitir al Gestor Comercial administrar promociones y permitir que los canales de venta consulten y evalúen correctamente los beneficios aplicables a productos y compras.

## 3. Alcance

Incluye:
- Registrar, consultar, modificar, activar y desactivar promociones.
- Asociar promociones a productos.
- Gestionar descuentos por porcentaje o monto fijo.
- Validar vigencia, estado y productos participantes.
- Evaluar promociones aplicables.
- Resolver múltiples promociones automáticas válidas.
- Resolver la coincidencia entre una promoción automática y un cupón válido sin acumular descuentos.
- Preservar el beneficio registrado en pedidos ya confirmados.

## 4. Requisitos

### Requisito 1: Registrar promociones

El sistema DEBE permitir registrar una promoción indicando como mínimo nombre, tipo de descuento, valor, fecha/hora de inicio y fin, estado inicial —ACTIVA o INACTIVA— y productos asociados.

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
- correspondan a los productos evaluados;
- estén activas;
- se encuentren dentro de su periodo de vigencia.

El cálculo utiliza los precios vigentes proporcionados por la funcionalidad de Gestión de Precios.

### Requisito 6: Resolver múltiples promociones automáticas

Cuando más de una promoción automática sea válida para la misma evaluación, el sistema DEBE seleccionar únicamente la que genere el mayor beneficio económico para el cliente, entendido como el menor importe resultante.

### Requisito 7: Resolver promoción automática y cupón

Una promoción automática y un cupón válido NO se acumulan en el alcance inicial.

El sistema DEBE comparar el importe resultante de ambos beneficios y aplicar únicamente el que genere el mayor beneficio económico para el cliente. Si ambos producen el mismo importe resultante, se prioriza el cupón presentado por el cliente.

El cupón solo podrá consumirse posteriormente si fue el beneficio efectivamente seleccionado para el pedido.

### Requisito 8: Consultar promociones

El sistema DEBE permitir consultar promociones con su tipo de descuento, valor, productos participantes, estado y periodo de vigencia.

### Requisito 9: Exponer evaluación mediante API

La evaluación debe devolver como mínimo:
- identificador de la promoción seleccionada, si existe;
- importe original;
- descuento aplicado;
- importe resultante;
- motivo cuando no existe un beneficio aplicable.

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

## Criterio de completitud

La capacidad se considera correctamente implementada cuando todos los requisitos y escenarios de esta especificación se cumplen y no se incorporan funcionalidades fuera del alcance.
