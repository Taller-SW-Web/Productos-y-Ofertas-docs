# Especificación: Gestión de paquetes/combos de productos

## 1. Contexto
La empresa deportiva busca incentivar las ventas agrupando productos complementarios en paquetes (combos) atractivos para los clientes. El gestor comercial necesita una herramienta para crear y gestionar estos combos, permitiendo que se vendan bajo un precio único promocional, pero garantizando que al momento de la venta se descuente correctamente el stock de cada producto individual que compone el paquete.

## 2. Propósito
Permitir al gestor comercial agrupar múltiples productos individuales en un combo con un precio único, y asegurar que la venta del combo gestione automáticamente el cálculo de disponibilidad y el descuento de stock de los artículos correspondientes.

## 3. Alcance
Incluye:
- Creación, edición, consulta y desactivación de combos de productos.
- Asignación de un precio único al combo.
- Selección de productos individuales y cantidades que conforman el combo.
- Cálculo de disponibilidad del combo basado en el stock de los productos individuales.
- Descuento de stock individual cuando un combo es consumido o adquirido desde los canales de venta.

## 4. Requisitos

### Requisito 1: Gestión de Combos
El sistema DEBE permitir al gestor comercial crear y modificar combos definiendo sus productos, cantidades y precio final.

#### Escenario: Creación exitosa de un combo
- DADO que el gestor comercial se encuentra en la pantalla de gestión de combos
- CUANDO ingresa los datos del combo (nombre, descripción, precio del paquete), selecciona 2 o más productos con stock suficiente y guarda
- ENTONCES el sistema registra el combo, lo activa para su venta y vincula los productos seleccionados con las cantidades respectivas.

#### Escenario: Precio del combo inválido
- DADO que el gestor comercial está creando o editando un combo
- CUANDO establece el precio del combo con un valor negativo o igual a cero
- ENTONCES el sistema muestra un mensaje de error y no permite guardar el combo.

### Requisito 2: Cálculo de disponibilidad del combo
El sistema DEBE calcular dinámicamente el stock disponible del combo en función del producto individual con menor disponibilidad proporcional.

#### Escenario: Disponibilidad basada en el stock de los componentes
- DADO que un combo está compuesto por 1 "Camiseta" (Stock: 10) y 2 "Medias" (Stock: 15)
- CUANDO los canales de venta consultan el stock disponible del combo al Módulo de Productos y Ofertas
- ENTONCES el sistema calcula y responde que hay 7 combos disponibles (limitado por las medias: 15 / 2 = 7.5).

#### Escenario: Combo sin stock por producto agotado
- DADO que uno de los productos individuales del combo se ha quedado sin stock (0 unidades)
- CUANDO un canal de venta consulta la disponibilidad del combo
- ENTONCES el sistema responde que el stock del combo es 0 y no está disponible temporalmente.

### Requisito 3: Descuento de stock al vender un combo
El sistema DEBE descontar el stock de los productos individuales que conforman el combo cuando es adquirido desde cualquier canal.

#### Escenario: Venta exitosa y descuento de stock
- DADO que un combo compuesto por 1 "Raqueta" (Stock: 5) y 3 "Pelotas" (Stock: 20) es comprado
- CUANDO el Módulo de ventas y postventa confirma el pago y el consumo de stock hacia el Módulo de productos y ofertas
- ENTONCES el sistema descuenta 1 unidad al stock de la "Raqueta" (Nuevo Stock: 4) y 3 unidades a las "Pelotas" (Nuevo Stock: 17).

#### Escenario: Fallo al descontar stock por venta concurrente o stock insuficiente
- DADO que el stock disponible calculado de un combo es 1 y un cliente intenta comprarlo
- CUANDO el sistema intenta descontar el stock, pero otro proceso ya consumió el stock de los productos individuales dejándolo en 0
- ENTONCES el sistema rechaza la operación de actualización de stock y notifica al canal correspondiente de la falta de disponibilidad.

## 5. Requisitos no funcionales
Incluir únicamente los que apliquen a esta capacidad.
- Consistencia de datos: El descuento de stock de los múltiples productos que conforman el combo debe ser transaccional (garantizado en la base de datos relacional PostgreSQL/MySQL) para evitar inconsistencias.
- Rendimiento: La consulta de disponibilidad de los combos debe ser eficiente, respondiendo de forma ágil a los canales de venta.
- Disponibilidad: El servicio debe estar disponible mediante APIs para integrarse adecuadamente con el Marketplace, Chatbot y Retail.

## 6. Fuera de alcance
- Gestión del ciclo de vida del pedido o facturación (Módulo de Ventas y Postventa).
- Despacho y cálculo de costos de envío del paquete (Módulo de Despacho y Entrega).
- Registro o control de acceso del gestor comercial (Módulo de Seguridad y Usuarios).

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.
