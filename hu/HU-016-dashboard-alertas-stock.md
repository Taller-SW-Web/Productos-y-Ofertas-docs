# HU-016 — Historia de Usuario: Dashboard analítico y alertas de stock

## Historia de usuario principal

**Como** responsable de inventario,

**quiero** visualizar indicadores, niveles de stock y alertas sobre el estado del inventario,

**para** identificar oportunamente las variantes con bajo nivel de disponibilidad, conocer las variantes agotadas y analizar el Top 5 de productos con mayor cantidad de unidades vendidas.

El dashboard permitirá visualizar información consolidada del inventario mediante indicadores y gráficos, facilitando el seguimiento del estado del stock y la identificación de situaciones que requieran atención.

La unidad primaria de inventario del dashboard es el **SKU vendible**. El Producto puede utilizarse únicamente como **agrupador comercial** cuando corresponda, sin representar una unidad de inventario independiente.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe mostrar la cantidad de variantes que se encuentran en estado **Disponible, Stock bajo y Agotado**. |
| **CA-02** | El sistema debe mostrar indicadores que permitan conocer el estado general del inventario. |
| **CA-03** | El sistema debe identificar las variantes cuyo stock se encuentre en o por debajo del `umbral_stock_bajo` configurado por variante/SKU para el estado **Stock bajo** (`0 < stock <= umbral_stock_bajo`). |
| **CA-04** | El sistema debe mostrar alertas para las variantes que se encuentren en estado **Stock bajo** o **Agotado**, según el estado calculado de cada SKU. |
| **CA-05** | El sistema debe mostrar el **Top 5 de productos con mayor cantidad de unidades vendidas durante el período analizado**, considerando exclusivamente unidades vendidas de ventas confirmadas (excluyendo operaciones que no representen una venta confirmada, como ajustes de inventario, mermas o reservas), agrupando las ventas de todas las variantes de un mismo producto, sumando las unidades vendidas de sus SKUs y mostrando los 5 productos con mayor cantidad total de unidades vendidas. |
| **CA-06** | Los indicadores deben representar el estado actual del inventario y las alertas deben generarse según el estado calculado de cada SKU en ese momento. |
| **CA-07** | Los indicadores y alertas deben actualizarse cuando la gestión de inventario notifique un cambio de stock de una variante mediante el contrato de evento `inventory.stock.changed`; la actualización debe reflejar el saldo y el estado vigentes. |
| **CA-08** | Después de un consumo correctamente registrado, el estado del SKU debe reflejarse correctamente en el dashboard: si pasa de **Disponible → Stock bajo**, debe verse como **Stock bajo**; si pasa de **Stock bajo → Agotado**, debe verse como **Agotado**. |
| **CA-09** | El período del Top 5 debe ser seleccionable; si el usuario no especifica uno, se utilizan los últimos 30 días. |

## Escenarios dado-cuando-entonces

### Escenario 1: Visualizar estado general del inventario

* **DADO** que existen variantes con diferentes cantidades de stock,
* **CUANDO** el responsable de inventario accede al dashboard,
* **ENTONCES** el sistema muestra indicadores con la cantidad de variantes en estado **Disponible, Stock bajo y Agotado**.

### Escenario 2: Identificar una variante con stock bajo

* **DADO** que el `umbral_stock_bajo` de una variante está configurado y la variante se encuentra en o por debajo de dicho umbral,
* **CUANDO** el responsable de inventario consulta el dashboard,
* **ENTONCES** el sistema muestra una alerta indicando que la variante presenta **Stock bajo**.

### Escenario 3: Identificar una variante agotada

* **DADO** que una variante tiene un stock de 0 unidades,
* **CUANDO** el responsable de inventario consulta el dashboard,
* **ENTONCES** el sistema muestra la variante como **Agotada** y genera la alerta correspondiente.

### Escenario 4: Visualizar el Top 5 de productos más vendidos

* **DADO** que existen ventas confirmadas registradas de diferentes variantes durante el período analizado, por ejemplo `Nike Air Max` con `SKU-001 → 20 unidades vendidas`, `SKU-002 → 15 unidades vendidas` y `SKU-003 → 10 unidades vendidas`,
* **CUANDO** el responsable de inventario consulta la sección de productos más vendidos,
* **ENTONCES** el sistema muestra el **Top 5 de productos con mayor cantidad de unidades vendidas durante el período analizado**, agrupando las ventas de las variantes de un mismo producto (por ejemplo, `Nike Air Max` con un total de **45** unidades vendidas) y ordenándolos de mayor a menor.

### Escenario 5: Actualización de una alerta después de un consumo (Disponible → Stock bajo)

* **DADO** que una variante tiene 6 unidades disponibles y su `umbral_stock_bajo` está configurado en 5 unidades,
* **CUANDO** se registra el consumo de 1 unidad,
* **ENTONCES** el stock se actualiza a 5 unidades, la variante pasa de **Disponible** a **Stock bajo** y aparece como **Stock bajo** en el dashboard.

### Escenario 6: Actualización del dashboard después de agotar una variante (Stock bajo → Agotado)

* **DADO** que una variante tiene 1 unidad disponible y su `umbral_stock_bajo` está configurado en 5 unidades (por lo que se encuentra en estado **Stock bajo**),
* **CUANDO** se registra correctamente el consumo de esa unidad,
* **ENTONCES** el dashboard actualiza la información de la variante a **Agotado** y muestra la alerta correspondiente.

### Escenario 7: Actualización reactiva del dashboard ante un cambio de stock

* **DADO** que la gestión de inventario modifica el stock de una variante (por ejemplo, su stock queda en o por debajo de su `umbral_stock_bajo`),
* **CUANDO** la gestión de inventario notifica el cambio mediante el contrato de evento `inventory.stock.changed`,
* **ENTONCES** el dashboard recalcula los indicadores y alertas con el saldo y el estado vigentes de la variante.

## Interacción con otros módulos

| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| --- | --- | --- | --- |
| **Ventas y Postventa** | Proporcionar las unidades vendidas por variante/SKU correspondientes a ventas confirmadas del período analizado para calcular el Top 5 de productos más vendidos. | Unidades vendidas por variante/SKU y período analizado. | Información analítica del Top 5 para el responsable de inventario. |

## Dependencias dentro de Productos y Ofertas

| **Funcionalidad interna** | **Información necesaria** |
| --- | --- |
| **Gestión de productos** | Identificación de productos y variantes para mostrar los indicadores y análisis de inventario, y para agrupar la información por producto como vista comercial. |
| **Gestión de variantes/SKUs** | Identificación y atributos de cada variante/SKU analizada por los indicadores y alertas. |
| **Gestión de características** | Características de las variantes, como talla y color, para identificar correctamente las unidades analizadas. |
| **Gestión de inventario** | Cantidades actuales, estados de disponibilidad y registros de consumo necesarios para generar los indicadores y alertas, así como la notificación de cambios de stock mediante el contrato de evento `inventory.stock.changed`. |

## Reglas de negocio consolidadas

* **Indicadores mínimos:** total de SKUs vendibles, total de unidades disponibles y cantidad de SKUs por estado (Disponible, Stock bajo y Agotado).
* **Umbral:** `umbral_stock_bajo` se configura individualmente por SKU; no existe un valor global obligatorio.
* **Filtros:** el dashboard permite filtrar por producto, categoría, marca, SKU y estado de inventario.
* **Top 5:** período seleccionable; por defecto, últimos 30 días.

---
