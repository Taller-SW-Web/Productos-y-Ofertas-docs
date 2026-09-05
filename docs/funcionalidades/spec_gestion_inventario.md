# Gestión de inventario

## Descripción

La funcionalidad de **Gestión de inventario** permitirá controlar y mantener actualizada la disponibilidad de los productos dentro del Marketplace.

Esta funcionalidad contempla dos operaciones principales: la **consulta de disponibilidad de stock** y la **actualización del stock por consumo**. Ambas permitirán que los diferentes canales y módulos del sistema trabajen con información actualizada sobre las unidades disponibles.

La gestión del inventario se realizará de manera integrada con los demás componentes del Marketplace, permitiendo consultar la disponibilidad de los productos y actualizarla cuando se produzca un consumo.

---

## 1. Consulta de disponibilidad de stock

Esta funcionalidad permitirá consultar la cantidad de unidades disponibles de un producto y conocer su estado actual dentro del inventario.

Los diferentes canales podrán utilizar esta información para determinar si un producto se encuentra disponible antes de ofrecerlo o realizar una operación relacionada con él.

Se contemplan principalmente los siguientes estados:

* **Disponible:** el producto cuenta con unidades disponibles.
* **Stock bajo:** el producto todavía cuenta con unidades, pero su cantidad se encuentra próxima a agotarse.
* **Agotado:** no existen unidades disponibles.

### Ejemplo

Un producto presenta:

> **Producto:** Nike Air Max
> **Stock disponible:** 8 unidades
> **Estado:** Disponible

Cuando el stock llegue a cero:

> **Producto:** Nike Air Max
> **Stock disponible:** 0 unidades
> **Estado:** Agotado

La consulta estará disponible para los diferentes canales contemplados por el proyecto, como **Marketplace, Retail y Chatbot**, permitiendo que cada uno conozca el estado actualizado del inventario.

---

## 2. Actualización de stock por consumo

Esta funcionalidad permitirá actualizar el inventario cuando se produzca el **consumo de unidades de un producto**.

Cuando una operación implique el consumo de determinados productos, la cantidad correspondiente será descontada del inventario para mantener actualizada la disponibilidad.

### Ejemplo

Si un producto cuenta inicialmente con:

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

### Ejemplo

> **Stock disponible:** 2 unidades
> **Cantidad solicitada:** 5 unidades

Resultado:

> **Consumo:** Rechazado
> **Stock final:** 2 unidades

Esto permitirá evitar que se registren consumos superiores a la cantidad disponible y mantener la información del inventario consistente.

---

## 4. Integración con otros módulos

La gestión de inventario estará integrada con los diferentes componentes que necesiten consultar o actualizar la disponibilidad de los productos.

La **consulta de disponibilidad** será utilizada por los canales que necesiten conocer el stock disponible, mientras que la **actualización por consumo** permitirá reflejar las unidades utilizadas en las operaciones correspondientes.

Dentro de las integraciones contempladas se encuentran los canales **Marketplace, Retail y Chatbot**, así como la comunicación con los módulos relacionados con **Ventas y Despacho** para las operaciones que impliquen consumo de stock.

La comunicación entre módulos se realizará mediante las interfaces de integración establecidas para el proyecto, manteniendo la separación entre los diferentes componentes.

---

## 5. Resultado esperado

La funcionalidad permitirá mantener un inventario actualizado y disponible para los diferentes componentes del Marketplace.

En términos generales, permitirá:

* Consultar la cantidad disponible de un producto.
* Conocer el estado actual del stock.
* Identificar productos disponibles, con stock bajo o agotados.
* Registrar el consumo de unidades.
* Actualizar la cantidad disponible después de cada consumo.
* Evitar consumos superiores al stock existente.
* Mantener sincronizada la información de disponibilidad utilizada por los diferentes canales.

Con estas funcionalidades, el inventario proporcionará información actualizada sobre la disponibilidad de los productos y permitirá reflejar correctamente los cambios producidos por su consumo.