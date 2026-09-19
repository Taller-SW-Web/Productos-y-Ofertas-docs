# SPEC-005 — Especificación: Gestión de cupones de descuento

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
- límite máximo de usos opcional;
- usos consumidos;
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
- Validar límite de usos.
- Validar estado y vigencia mediante la promoción asociada.
- Exponer validación por API sin consumir usos.
- Consumir el uso al recibir la confirmación definitiva del pedido.
- Garantizar idempotencia y concurrencia del consumo.
- Consultar información operacional de uso.

## 5. Requisitos

### Requisito 1: Registrar cupones

El sistema DEBE permitir registrar código, estado, promoción asociada, monto mínimo opcional y límite máximo de usos opcional.

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

Si existe límite máximo:
- debe ser un entero positivo;
- no puede reducirse por debajo de los usos consumidos;
- un cupón agotado no puede validarse como aplicable.

### Requisito 5: Validar cupón por API sin consumirlo

La validación DEBE devolver:
- validez;
- motivo de rechazo, cuando corresponda;
- promoción/beneficio asociado;
- descuento calculado;
- importe resultante.

La validación, por sí sola, NO incrementa el contador de usos.

### Requisito 6: Consumir un uso

El uso se consume cuando Ventas y Postventa confirma definitivamente el pedido después de la aprobación del pago o del evento equivalente de confirmación en el canal.

Solo se consume si el cupón fue el beneficio finalmente seleccionado.

### Requisito 7: Garantizar idempotencia

La combinación `pedido_id + cupon_id` debe ser única para el registro de consumo. Reintentos o mensajes duplicados de la misma confirmación no incrementan el contador.

### Requisito 8: Garantizar concurrencia

Si varios pedidos compiten por los últimos usos, el sistema debe asegurar atómicamente que el contador nunca supere el límite máximo.

### Requisito 9: Resolver convivencia con promoción automática

Un cupón válido y una promoción automática no se acumulan.

Se aplica únicamente el beneficio que produzca el menor importe resultante. En empate se prioriza el cupón.

### Requisito 10: Anulación posterior

En el alcance inicial, una anulación posterior del pedido NO repone automáticamente el uso del cupón.

### Requisito 11: Consultar cupones

La consulta administrativa DEBE mostrar:
- código;
- promoción asociada;
- estado;
- monto mínimo;
- límite máximo;
- usos consumidos;
- usos disponibles, cuando exista límite.

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
- Reposición automática del uso por anulación.

## Criterio de completitud

La capacidad se considera correctamente implementada cuando todos los requisitos anteriores se cumplen.
