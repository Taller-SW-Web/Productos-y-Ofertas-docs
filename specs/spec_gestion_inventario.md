# Especificación: Gestión de Inventario (Control de Stock)

## Descripción

La funcionalidad de **Gestión de inventario** permitirá controlar y mantener actualizada la disponibilidad de las variantes dentro del Marketplace.

Esta funcionalidad contempla dos operaciones principales: la **consulta de disponibilidad de stock** y la **actualización del stock por consumo**. Ambas permitirán que los diferentes canales y módulos del sistema trabajen con información actualizada sobre las unidades disponibles.

La gestión del inventario se realizará de manera integrada con los demás componentes del Marketplace, permitiendo consultar la disponibilidad de las variantes y actualizarla cuando se produzca un consumo.

## Unidad de inventario

En este módulo la unidad de inventario es la **Variante/SKU**, no el Producto.

* **Inventario → Variante/SKU:** el stock se controla de forma independiente para cada variante (combinación concreta de atributos como talla y color).
* **Producto → agrupador comercial:** el producto agrupa comercialmente a sus variantes, pero **no tiene un stock independiente** distinto al stock de sus variantes.

```text
Producto: Nike Air Max

├── SKU-001 → Negro / Talla 40 → stock 5
├── SKU-002 → Negro / Talla 41 → stock 0
└── SKU-003 → Blanco / Talla 40 → stock 8
```

Por lo tanto, toda consulta, registro o actualización de stock se realiza siempre referenciando una **Variante/SKU**.

---

## 1. Consulta de disponibilidad de stock

Esta funcionalidad permitirá consultar la cantidad de unidades disponibles de una variante y conocer su estado actual dentro del inventario.

Los diferentes canales podrán utilizar esta información para determinar si una variante se encuentra disponible antes de ofrecerla o realizar una operación relacionada con ella. Cuando se consulte el stock, la referencia obligatoria será la **Variante/SKU**.

Se contemplan principalmente los siguientes estados:

* **Disponible:** la variante cuenta con unidades disponibles.
* **Stock bajo:** la variante todavía cuenta con unidades, pero su cantidad se encuentra en o por debajo del umbral configurado.
* **Agotado:** no existen unidades disponibles.

Las reglas de determinación del estado son las siguientes:

```text
stock = 0
→ AGOTADO

0 < stock <= umbral_stock_bajo
→ STOCK_BAJO

stock > umbral_stock_bajo
→ DISPONIBLE
```

El `umbral_stock_bajo` será **configurable por cada Variante/SKU**, de modo que cada variante pueda definir su propio límite a partir del cual se considera stock bajo. Corresponde a una configuración del negocio y no se asume un valor por defecto.

### Ejemplo

Una variante presenta:

> **Producto:** Nike Air Max
> **Variante/SKU:** SKU-001 — Negro / Talla 40
> **Stock disponible:** 8 unidades
> **Estado:** Disponible

Cuando el stock llegue a cero:

> **Producto:** Nike Air Max
> **Variante/SKU:** SKU-002 — Negro / Talla 41
> **Stock disponible:** 0 unidades
> **Estado:** Agotado

Cuando el stock se encuentre en el umbral o por debajo de él:

> **Producto:** Nike Air Max
> **Variante/SKU:** SKU-003 — Blanco / Talla 40
> **Stock disponible:** 3 unidades
> **umbral_stock_bajo:** 5 unidades
> **Estado:** Stock bajo

La consulta estará disponible para los diferentes canales contemplados por el proyecto, como **Marketplace, Retail y Chatbot**, permitiendo que cada uno conozca el estado actualizado del inventario de las variantes.

---

## 2. Actualización de stock por consumo

Esta funcionalidad permitirá actualizar el inventario cuando se produzca el **consumo de unidades de una variante**.

Cuando una operación implique el consumo de determinadas variantes, la cantidad correspondiente será descontada del inventario para mantener actualizada la disponibilidad.

### Ejemplo

Si una variante cuenta inicialmente con:

> **Variante/SKU:** SKU-001 — Negro / Talla 40
> **Stock:** 10 unidades

y se consumen:

> **Cantidad consumida:** 3 unidades

el inventario se actualizará a:

> **Stock disponible:** 7 unidades

De esta manera, las unidades consumidas dejarán de considerarse disponibles para futuras operaciones.

---

## 3. Validación del consumo

Antes de actualizar el inventario se deberá verificar que exista una cantidad suficiente de unidades disponibles.

Si la cantidad solicitada supera el stock existente, el consumo no deberá realizarse.

### Reglas de consumo

La actualización por consumo deberá garantizar lo siguiente:

* El stock de una variante **nunca puede quedar negativo**.
* El consumo **no puede superar el stock disponible** de la variante.
* **Dos consumos simultáneos no pueden consumir las mismas unidades**; cada consumo debe operar sobre unidades disponibles reales.
* La actualización del stock debe realizarse de forma **atómica/transaccional**, sin estados intermedios que corrompan la información.
* Si no se puede garantizar la disponibilidad de las unidades solicitadas, la operación debe **rechazarse**.

### Ejemplo

> **Variante/SKU:** SKU-001 — Negro / Talla 40
> **Stock inicial:** 5 unidades
>
> **Consumo A = 3 unidades**
> **Consumo B = 3 unidades**

No se deben aceptar ambos consumos.

Resultado válido:

> **Consumo A:** Aceptado — Stock final: 2 unidades
> **Consumo B:** Rechazado por stock insuficiente

En el resultado, una operación se acepta, la otra se rechaza por stock insuficiente y el stock nunca queda negativo.

---

## 4. Integración con otros módulos

La gestión de inventario estará integrada con los diferentes componentes que necesiten consultar o actualizar la disponibilidad de las variantes.

### Dependencias internas del módulo de Productos y Ofertas

La gestión de inventario se sustenta en las siguientes capacidades del mismo módulo, por lo que no constituyen integraciones externas:

* **Gestión de productos:** define el producto como agrupador comercial de las variantes.
* **Gestión de variantes/SKUs:** define cada variante, su código único y sus atributos; es la base sobre la cual se controla el stock.
* **Gestión de características:** proporciona los atributos (talla, color, entre otros) que distinguen a cada variante.
* **Gestión de precios:** identifica la variante y su precio vigente cuando los canales necesiten relacionar la disponibilidad con la información comercial del producto.

### Canales

La **consulta de disponibilidad** será utilizada por los canales que necesiten conocer el stock disponible de una variante. Los canales **Marketplace, Retail y Chatbot** consultan disponibilidad referenciando una **Variante/SKU**; este consumo de información no cambia la unidad de inventario.

### Integraciones externas

La **actualización por consumo** permitirá reflejar las unidades utilizadas en las operaciones correspondientes. Para las operaciones que impliquen consumo de stock, se contempla la comunicación con los módulos de **Ventas y Despacho**, que son quienes originan el consumo de unidades de las variantes.

La comunicación entre módulos se realizará mediante las interfaces de integración establecidas para el proyecto, manteniendo la separación entre los diferentes componentes.

---

## 5. Resultado esperado

La funcionalidad permitirá mantener un inventario actualizado y disponible para los diferentes componentes del Marketplace.

En términos generales, permitirá:

* Consultar la cantidad disponible de una variante.
* Conocer el estado actual del stock de cada variante.
* Identificar variantes disponibles, con stock bajo o agotadas, mediante el `umbral_stock_bajo` configurado por variante.
* Registrar el consumo de unidades sobre una variante.
* Actualizar la cantidad disponible después de cada consumo.
* Evitar consumos superiores al stock existente y consumos concurrentes sobre las mismas unidades.
* Mantener sincronizada la información de disponibilidad utilizada por los diferentes canales.

Con estas funcionalidades, el inventario proporcionará información actualizada sobre la disponibilidad de las variantes y permitirá reflejar correctamente los cambios producidos por su consumo.