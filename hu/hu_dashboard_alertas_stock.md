## Historia de usuario principal

**Como** responsable de inventario,

**quiero** visualizar indicadores, niveles de stock y alertas sobre el estado del inventario,

**para** identificar oportunamente las variantes con bajo nivel de disponibilidad, conocer las variantes agotadas y analizar cuáles presentan mayor consumo.

El dashboard permitirá visualizar información consolidada del inventario mediante indicadores y gráficos, facilitando el seguimiento del estado del stock y la identificación de situaciones que requieran atención.

## Criterios de aceptación

| **ID** | **Criterio** |
| --- | --- |
| **CA-01** | El sistema debe mostrar la cantidad de variantes que se encuentran en estado **Disponible, Stock bajo y Agotado**. |
| **CA-02** | El sistema debe mostrar indicadores que permitan conocer el estado general del inventario. |
| **CA-03** | El sistema debe identificar las variantes cuyo stock se encuentre por debajo del umbral definido como **Stock bajo**. |
| **CA-04** | El sistema debe mostrar alertas para las variantes que se encuentren en estado **Stock bajo** o **Agotado**. |
| **CA-05** | El sistema debe permitir identificar las variantes con mayor cantidad de unidades consumidas durante el período analizado. |
| **CA-06** | La información mostrada en el dashboard debe corresponder al estado actualizado del inventario y a los consumos registrados. |
| **CA-07** | Los indicadores y alertas deben actualizarse cuando existan cambios en el stock que afecten la información mostrada. |

## Escenarios dado-cuando-entonces

### Escenario 1: Visualizar estado general del inventario

* **DADO** que existen variantes con diferentes cantidades de stock,
* **CUANDO** el responsable de inventario accede al dashboard,
* **ENTONCES** el sistema muestra indicadores con la cantidad de variantes en estado **Disponible, Stock bajo y Agotado**.

### Escenario 2: Identificar una variante con stock bajo

* **DADO** que el umbral de stock bajo está definido y una variante se encuentra por debajo de dicho umbral,
* **CUANDO** el responsable de inventario consulta el dashboard,
* **ENTONCES** el sistema muestra una alerta indicando que la variante presenta **Stock bajo**.

### Escenario 3: Identificar una variante agotada

* **DADO** que una variante tiene un stock de 0 unidades,
* **CUANDO** el responsable de inventario consulta el dashboard,
* **ENTONCES** el sistema muestra la variante como **Agotada** y genera la alerta correspondiente.

### Escenario 4: Visualizar variantes con mayor consumo

* **DADO** que existen registros de consumo de diferentes variantes,
* **CUANDO** el responsable de inventario consulta la sección de consumo,
* **ENTONCES** el sistema muestra las variantes con mayor cantidad de unidades consumidas durante el período analizado.

### Escenario 5: Actualización de una alerta después de un consumo

* **DADO** que una variante tiene 5 unidades disponibles y el umbral de stock bajo está establecido en 5 unidades,
* **CUANDO** se registra el consumo de 1 unidad,
* **ENTONCES** el stock se actualiza a 4 unidades y la variante aparece como **Stock bajo** en el dashboard.

### Escenario 6: Actualización del dashboard después de agotar una variante

* **DADO** que una variante tiene 1 unidad disponible,
* **CUANDO** se registra correctamente el consumo de esa unidad,
* **ENTONCES** el dashboard actualiza la información de la variante a **Agotado** y muestra la alerta correspondiente.

## Interacción con otros módulos

| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| --- | --- | --- | --- |
| **Gestión de Stock** | Obtener el estado actualizado del inventario y los registros de consumo necesarios para generar indicadores y alertas. | Cantidades disponibles, estados de stock y registros de consumo. | Información analítica y alertas para el responsable de inventario. |
| **Gestión de productos** | Identificar las variantes y productos asociados a los indicadores y alertas. | Identificadores, nombres y variantes de los productos. | Indicadores y alertas asociados a las variantes correspondientes. |

## Dependencias dentro de Productos y Ofertas

| **Funcionalidad interna** | **Información necesaria** |
| --- | --- |
| **Gestión de productos** | Identificación de productos y variantes para mostrar los indicadores y análisis de inventario. |
| **Gestión de características** | Características de las variantes, como talla y color, para identificar correctamente las unidades analizadas. |
| **Gestión de stock** | Cantidades actuales, estados de disponibilidad y registros de consumo necesarios para generar los indicadores y alertas. |

## Reglas pendientes de acordar

* **Período de análisis:** definir el período utilizado para calcular los indicadores de consumo.

* **Indicadores:** definir los indicadores que serán mostrados en el dashboard final.

* **Top de consumo:** definir la cantidad de variantes que se mostrarán en el listado de mayor consumo, por ejemplo, **Top 5**.

* **Umbral de stock bajo:** utilizar el umbral definido para determinar cuándo generar las alertas correspondientes.

* **Actualización de información:** definir con qué frecuencia se actualizarán los indicadores y alertas.

* **Filtros:** definir si el dashboard permitirá filtrar la información por producto, categoría, marca, variante u otro criterio.