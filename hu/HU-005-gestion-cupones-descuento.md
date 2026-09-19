# HU-005 — Historia de Usuario: Gestión de cupones de descuento

Proyecto: Módulo de Productos y Ofertas.
Responsabilidad: Persona 4 — Axel Cueva.
Versión corregida: 2026-09-15.

## Funcionalidad

Gestión de cupones de descuento — Obligatoria.

## Historia de usuario

**Como** gestor comercial,
**quiero** crear cupones con un código único, condiciones de uso y límite de usos opcional asociados a una promoción aplicable mediante código,
**para** ofrecer beneficios que se activen únicamente cuando el cliente presente un cupón válido.

El cupón **no duplica** el descuento, los productos elegibles ni la vigencia. Esos datos provienen de la promoción asociada.

El cupón posee como datos propios:
- código;
- estado;
- promoción asociada;
- límite máximo de usos opcional;
- contador de usos consumidos;
- monto mínimo de compra opcional;
- datos de auditoría.

## Reglas de negocio consolidadas

- El código se normaliza eliminando espacios al inicio/final y convirtiéndolo a mayúsculas.
- Se permiten letras A-Z, números, guion medio y guion bajo.
- La comparación de códigos no distingue mayúsculas/minúsculas.
- Validar un cupón no consume un uso.
- El uso se consume cuando Ventas y Postventa emite la confirmación definitiva del pedido después de que el pago haya sido aceptado o, para flujos sin pago electrónico, cuando el pedido pasa al estado equivalente de confirmado.
- La operación de consumo debe ser idempotente por `order_id + cupon_id`.
- El control del límite debe ser seguro ante concurrencia.
- Una anulación posterior del pedido **no repone automáticamente** el uso del cupón en el alcance inicial.
- Si coincide con una promoción automática o una oferta de Pricing, no se acumulan beneficios: se compara el importe calculado sobre el precio regular. En empate cupón/automática se prioriza el cupón, pero la oferta de Pricing prevalece ante empate y no consume cupón.
- Si el cupón no resulta seleccionado como beneficio final, no consume uso.

## Criterios de aceptación

| ID | Criterio |
| --- | --- |
| CA-01 | Solo un gestor comercial con permisos puede crear, modificar, activar o desactivar cupones. |
| CA-02 | Cada cupón debe tener un código único normalizado y estar asociado a una promoción cuya modalidad sea mediante cupón. |
| CA-03 | El descuento, los productos elegibles y la vigencia utilizados para validar el cupón corresponden a su promoción asociada. |
| CA-04 | El cupón puede tener un monto mínimo de compra propio. Si se configura, debe ser mayor que 0. |
| CA-05 | Si se configura un límite de usos, debe ser un entero positivo y no puede reducirse por debajo de los usos ya consumidos. |
| CA-06 | El gestor puede consultar código, promoción asociada, estado, monto mínimo, usos consumidos, usos disponibles y límite configurado. |
| CA-07 | La validación debe rechazar códigos inexistentes, cupones o promociones desactivados, promociones fuera de vigencia, compras sin productos elegibles, compras por debajo del monto mínimo y cupones agotados. |
| CA-08 | Un cupón válido devuelve el descuento y el importe resultante. Consultarlo o validarlo no consume un uso. |
| CA-09 | El uso se registra únicamente cuando Ventas y Postventa confirma definitivamente el pedido y el cupón fue el beneficio seleccionado. |
| CA-10 | Una confirmación repetida del mismo pedido y cupón no debe consumir otro uso. |
| CA-11 | Si varias compras intentan consumir simultáneamente los últimos usos, el sistema no debe superar el límite configurado. |
| CA-12 | Una anulación posterior del pedido no repone automáticamente el uso en el alcance inicial. |
| CA-13 | Una promoción automática, un cupón y una oferta propia de Pricing compiten sin acumularse sobre el precio regular; se aplica el menor importe y, en empate cupón/automática, se prioriza cupón. Si la oferta de Pricing empata, se conserva la oferta sin consumir cupón. |

| CA-14 | Una oferta vigente de Pricing se compara como alternativa excluyente frente a promoción automática y cupón; los descuentos se calculan sobre precio regular, no sobre una oferta ya descontada. |
| CA-15 | Una confirmación provisional `order.confirmed` produce resultado idempotente de consumo aceptado o rechazo con `order_id` y `operation_id`; Ventas/Postventa gestiona las consecuencias comerciales y de pago de un rechazo. |

## Escenarios dado-cuando-entonces

### Escenario 1: Crear un cupón

* **DADO** que existe una promoción configurada para aplicarse mediante cupón,
* **CUANDO** el gestor registra un código único, un monto mínimo opcional y un límite válido de usos si corresponde,
* **ENTONCES** el sistema guarda el cupón asociado a esa promoción y confirma su creación.

### Escenario 2: Rechazar un código duplicado sin distinguir mayúsculas

* **DADO** que ya existe el código `DEPORTE10`,
* **CUANDO** el gestor intenta crear `deporte10`,
* **ENTONCES** el sistema lo normaliza, detecta el duplicado e impide el registro.

### Escenario 3: Validar un cupón correctamente

* **DADO** que el cupón está activo, tiene usos disponibles, cumple el monto mínimo y su promoción vigente ofrece 10 % sobre los productos elegibles,
* **CUANDO** un canal presenta el código para una compra con S/ 200 elegibles,
* **ENTONCES** el sistema devuelve un descuento de S/ 20 y un importe resultante de S/ 180, sin consumir un uso.

### Escenario 4: Rechazar por monto mínimo

* **DADO** que el cupón exige una compra mínima de S/ 150,
* **CUANDO** se valida para una compra elegible de S/ 120,
* **ENTONCES** el sistema rechaza su aplicación e informa que no se cumple el monto mínimo.

### Escenario 5: Confirmar un uso sin duplicarlo

* **DADO** que el cupón fue el beneficio seleccionado y Ventas y Postventa confirma definitivamente el pedido,
* **CUANDO** se recibe una o varias veces la confirmación para el mismo `order_id + cupon_id`,
* **ENTONCES** el sistema registra un único uso.

### Escenario 6: Evitar superar el límite

* **DADO** que al cupón le queda un único uso,
* **CUANDO** dos pedidos diferentes intentan confirmarlo simultáneamente,
* **ENTONCES** el sistema acepta como máximo uno e informa al otro que no hay usos disponibles.

### Escenario 7: No consumir un cupón que pierde frente a una promoción automática

* **DADO** que el cupón deja la compra en S/ 180 y una promoción automática válida la deja en S/ 170,
* **CUANDO** el sistema compara ambos beneficios,
* **ENTONCES** aplica la promoción automática y el cupón no consume un uso.

### Escenario 8: Anular un pedido confirmado

* **DADO** que un pedido confirmado ya consumió un uso de cupón,
* **CUANDO** el pedido es anulado posteriormente,
* **ENTONCES** el uso permanece consumido en el alcance inicial.

### Escenario 9: Cupón pierde frente a oferta de Pricing
* **DADO** una oferta vigente S/ 170 y un cupón válido que produce S/ 180 sobre el mismo regular,
* **CUANDO** se evalúa la compra,
* **ENTONCES** se conserva la oferta y el cupón no consume uso.

### Escenario 10: Último uso rechazado al confirmar
* **DADO** que el cupón parecía disponible al cotizar pero agotó sus usos,
* **CUANDO** Ventas envía la confirmación provisional,
* **ENTONCES** el consumo se rechaza de forma idempotente y se envía resultado para resolución exclusiva de Ventas.

## Interacción con otros módulos

| Módulo | Necesidad de interacción | Información que recibe esta funcionalidad | Información que entrega esta funcionalidad |
| --- | --- | --- | --- |
| Marketplace | Ingresar y validar cupones durante la compra. | Código, productos, cantidades y subtotal. | Validez, motivo de rechazo, descuento e importe resultante. |
| Chatbot | Validar un código recibido en conversación. | Código, productos, cantidades y subtotal. | Resultado de validación y beneficio aplicable. |
| Retail | Validar el cupón presentado por el cliente. | Código, productos, cantidades y subtotal. | Resultado de validación y descuento. |
| Ventas y Postventa | Confirmar definitivamente el consumo. | `order_id`, cupón, confirmación de pedido y beneficio finalmente aplicado. | Confirmación o rechazo del consumo y descuento aplicado. |
| Seguridad y Usuarios | Autorizar la administración. | Identidad autenticada y permisos. | Solicitudes de validación cuando corresponda. |

## Dependencias internas

| Funcionalidad | Información necesaria |
| --- | --- |
| Gestión de Promociones | Descuento, productos elegibles, vigencia y modalidad mediante cupón. |
| Gestión de Productos — Persona 2 | Datos y estado de los productos. |
| Gestión de Precios — Persona 3 | Precios vigentes para calcular el beneficio. |

## Condiciones de integración

Las integraciones se realizan mediante APIs, de forma asíncrona y sin acceso directo a las bases de datos de otros módulos.

---
