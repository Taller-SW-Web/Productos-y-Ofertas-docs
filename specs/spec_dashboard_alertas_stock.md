# Dashboard analítico y alertas de stock

## Descripción

El **Dashboard Analítico y Alertas de Stock** será una funcionalidad adicional orientada al **monitoreo del inventario**, permitiendo visualizar de manera resumida el estado de las variantes y detectar aquellas que requieren atención.

Esta funcionalidad permitirá transformar la información del inventario en indicadores y elementos visuales que faciliten el seguimiento de la disponibilidad de las variantes.

El dashboard estará pensado como una pantalla de consulta rápida, donde se pueda obtener una visión general del estado actual del inventario.

## Unidad de inventario

El dashboard utiliza como **unidad primaria de inventario la Variante/SKU**, en coherencia con la gestión de inventario:

* **Métrica operativa de inventario → Variante/SKU:** los indicadores de disponibilidad, stock bajo y agotamiento se expresan sobre variantes.
* **Agrupación comercial → Producto:** el producto es un agrupador comercial. Las variantes pueden presentarse individualmente o agrupadas bajo su producto en una vista comercial, sin que esto cree un stock independiente por producto.

```text
Producto: Nike Air Max

├── SKU-001 → Negro / Talla 40 → stock 5
├── SKU-002 → Negro / Talla 41 → stock 0
└── SKU-003 → Blanco / Talla 40 → stock 8
```

El dashboard podrá mostrar las variantes individualmente y, cuando se requiera una vista comercial, agruparlas bajo "Nike Air Max".

---

## 1. Indicadores de inventario

El dashboard mostrará indicadores que permitan conocer rápidamente la situación general del inventario.

Entre los principales indicadores se podrán considerar:

* Cantidad total de variantes/SKUs.
* Cantidad total de unidades disponibles.
* Variantes con stock bajo.
* Variantes agotadas.
* Variantes disponibles.

Estos indicadores permitirán identificar rápidamente el estado general del inventario sin necesidad de revisar cada variante individualmente ni contabilizar los productos como si cada uno tuviera un único stock.

Cuando el dashboard presente una vista comercial, podrá agrupar la información por producto para facilitar su interpretación, manteniendo siempre las variantes como la unidad operativa de inventario.

---

## 2. Alertas de stock

El sistema permitirá identificar variantes cuyo stock se encuentre en estado de stock bajo o agotado, según las reglas deterministas de la gestión de inventario:

```text
0 < stock <= umbral_stock_bajo
→ STOCK_BAJO → alerta

stock = 0
→ AGOTADO → alerta
```

El `umbral_stock_bajo` es configurable por cada Variante/SKU.

Cuando la cantidad disponible de una variante alcance el umbral o se encuentre por debajo de él, se mostrará una alerta que permita identificarla oportunamente.

Después de un consumo correctamente registrado, el estado mostrado de la variante debe reflejar el estado calculado resultante: si pasa de **Disponible → Stock bajo**, debe verse como **Stock bajo**; si pasa de **Stock bajo → Agotado**, debe verse como **Agotado**.

### Ejemplo

> **Stock bajo**
> Nike Air Max — SKU-001 (Negro / Talla 40) — 3 unidades disponibles
> umbral_stock_bajo: 5 unidades

Cuando no existan unidades:

> **Variante agotada**
> Nike Air Max — SKU-002 (Negro / Talla 41) — 0 unidades disponibles

Estas alertas permitirán detectar variantes que podrían requerir una reposición de inventario.

---

## 3. Visualización de información

La información del inventario podrá representarse mediante elementos visuales como:

* Tarjetas de indicadores.
* Gráficos.
* Tablas.
* Listados de variantes/SKUs.
* Indicadores de variantes con stock bajo.
* Alertas de variantes agotadas.
* Listados agrupados por producto, cuando se requiera una vista comercial.

El objetivo será presentar la información de manera clara y facilitar su interpretación.

---

## 4. Top 5 de productos más vendidos

El dashboard podrá mostrar información sobre los productos con mayor cantidad de unidades vendidas durante el período analizado.

La métrica se define de la siguiente manera:

> **Top 5 de productos con mayor cantidad de unidades vendidas durante el período analizado.**

Para su cálculo se deberá:

* Contar **unidades vendidas**.
* Considerar únicamente las **ventas confirmadas**.
* Agrupar las ventas de **todas las variantes/SKU pertenecientes al mismo Producto**.
* Ordenar por la **cantidad total de unidades vendidas**, de mayor a menor.
* **Excluir** las operaciones que no representen una venta confirmada, como ajustes de inventario, mermas o reservas.

### Ejemplo

> **Top 5 productos más vendidos**
>
> 1. Nike Air Max — 45 unidades
> 2. Adidas Predator — 38 unidades
> 3. Puma Future — 30 unidades
> 4. Nike Revolution — 25 unidades
> 5. Adidas Run — 20 unidades

Información de cálculo del ejemplo:

```text
Nike Air Max
SKU-001 → 20 unidades vendidas
SKU-002 → 15 unidades vendidas
SKU-003 → 10 unidades vendidas

Total Producto = 45 unidades vendidas
```

De esta manera, el Top 5 es **de Productos**, aunque la venta se registre originalmente sobre una Variante/SKU.

El período de análisis es una regla pendiente de configuración/acuerdo y se describe como **"durante el período analizado"**.

La información necesaria para determinar los productos más vendidos deberá obtenerse mediante la integración correspondiente con los datos de las operaciones de venta.

---

## 5. Resultado esperado

El Dashboard Analítico y Alertas de Stock permitirá disponer de una **vista general del estado del inventario**, facilitando la identificación de variantes con alta demanda, bajo stock o agotadas, así como de los productos con mayor movimiento comercial.

La funcionalidad permitirá:

* Visualizar indicadores generales del inventario a nivel de variante/SKU.
* Identificar variantes con stock bajo, según el umbral configurado por variante.
* Identificar variantes agotadas.
* Mostrar alertas relacionadas con la disponibilidad de las variantes.
* Visualizar el Top 5 de productos con mayor cantidad de unidades vendidas durante el período analizado.
* Agrupar la información por producto cuando se requiera una vista comercial.
* Representar la información mediante gráficos e indicadores visuales.

De esta manera, el dashboard complementará la gestión del inventario proporcionando una visión rápida y comprensible de su estado actual y facilitando la identificación de situaciones que requieran atención.