# Especificación: Gestión Avanzada de Variantes (SKUs)

## 1. Contexto

Dentro del catálogo de productos deportivos (camisetas, zapatillas, accesorios, etc.), es común que un mismo producto base tenga múltiples versiones comerciales que se diferencian por características como talla, color u otro atributo específico del deporte o tipo de artículo. Actualmente, la capacidad obligatoria de CRUD de productos trata al producto como una entidad única, sin capacidad de representar estas combinaciones. Sin embargo, en la venta real (Marketplace, Chatbot, Retail), el cliente no compra "el producto" en abstracto, sino una combinación concreta y disponible (por ejemplo, "zapatilla X, talla 42, color negro"), cada una con su propio control de stock, imagen representativa y código de identificación. Esta capacidad extiende el modelo de catálogo definido en la gestión de productos para soportar esa granularidad.

## 2. Propósito

Permitir que un producto tenga una o más variantes (SKUs) diferenciadas por características como talla y color, cada una con su propio código único e imagen, de modo que los canales de venta puedan mostrar y comercializar exactamente la combinación que el cliente desea, con su disponibilidad de stock independiente.

## 3. Alcance

Incluye:
- Definición de los tipos de atributos que generan variantes para un producto (por ejemplo, talla, color), configurables según el tipo de producto.
- Creación de una o más variantes (SKUs) asociadas a un producto base, cada una con su combinación única de atributos (ej. talla + color).
- Asignación de un código único (SKU) por variante, distinto del código del producto base.
- Asociación de una imagen propia a cada variante (por ejemplo, para reflejar el color específico).
- Actualización de los atributos, imagen o estado de una variante existente.
- Consulta de variantes de un producto, tanto de forma individual como listadas junto con el producto base, incluyendo su disponibilidad.
- Desactivación (baja lógica) de una variante específica, de forma independiente al estado del producto base.
- Exposición de la información de variantes mediante API para su consumo por los demás módulos (Marketplace Cliente, Chatbot Cliente, Retail Vendedor, Ventas y Postventa, Despacho y Entrega).

## 4. Requisitos

### Requisito 1: Creación de variantes de un producto

El sistema DEBE permitir registrar una o más variantes para un producto existente, cada una con una combinación única de atributos (ej. talla, color) y un código SKU propio.

#### Escenario: Registro exitoso de una nueva variante
- DADO un producto base activo y registrado en el catálogo
- CUANDO el gestor comercial registra una nueva variante indicando sus atributos (ej. talla "M", color "azul") y una imagen
- ENTONCES el sistema crea la variante asociada al producto, le asigna un código SKU único y la pone disponible para su consulta vía API

#### Escenario: Intento de registro de una variante con combinación de atributos duplicada
- DADO un producto que ya tiene registrada una variante con una combinación específica de atributos (ej. talla "M", color "azul")
- CUANDO el gestor comercial intenta registrar otra variante con exactamente la misma combinación de atributos para el mismo producto
- ENTONCES el sistema rechaza la operación e informa que ya existe una variante con esa combinación

### Requisito 2: Código único por variante (SKU)

El sistema DEBE garantizar que cada variante tenga un código SKU único a nivel de todo el catálogo, distinto del código del producto base y de cualquier otra variante.

#### Escenario: Asignación correcta de código SKU
- DADO el registro de una nueva variante válida
- CUANDO el sistema genera o recibe el código SKU de la variante
- ENTONCES el sistema valida que dicho código no exista previamente en ninguna otra variante o producto del catálogo antes de confirmar el registro

#### Escenario: Intento de registro con SKU ya existente
- DADO que ya existe una variante (del mismo u otro producto) con un código SKU determinado
- CUANDO el gestor comercial intenta registrar una nueva variante utilizando ese mismo código SKU
- ENTONCES el sistema rechaza la operación y muestra un mensaje indicando que el código SKU ya está en uso

### Requisito 3: Imagen propia por variante

El sistema DEBE permitir asociar una imagen específica a cada variante, independiente de la imagen general del producto base.

#### Escenario: Carga exitosa de imagen para una variante
- DADO una variante existente sin imagen o con una imagen previa
- CUANDO el gestor comercial carga un archivo de imagen válido (formato y tamaño permitidos) para esa variante
- ENTONCES el sistema almacena la imagen, la asocia a la variante correspondiente y la expone junto con los demás datos de la variante vía API

#### Escenario: Intento de carga de un archivo de imagen inválido
- DADO que el gestor comercial intenta subir un archivo con un formato no soportado o que excede el tamaño máximo permitido
- CUANDO se ejecuta la carga del archivo
- ENTONCES el sistema rechaza la carga y muestra un mensaje indicando el motivo (formato no válido o tamaño excedido), sin afectar la imagen previamente asociada a la variante

### Requisito 4: Actualización y desactivación de variantes

El sistema DEBE permitir actualizar los atributos, imagen o estado de una variante, así como desactivarla de forma independiente al producto base.

#### Escenario: Actualización exitosa de atributos de una variante
- DADO una variante existente y activa
- CUANDO el gestor comercial modifica alguno de sus atributos (ej. cambia la imagen o corrige el atributo de color) y confirma los cambios
- ENTONCES el sistema guarda los cambios y refleja la información actualizada en las consultas posteriores vía API

#### Escenario: Desactivación de una variante sin afectar el producto base ni otras variantes
- DADO un producto con varias variantes activas
- CUANDO el gestor comercial desactiva una de esas variantes (por ejemplo, por descontinuación de una talla)
- ENTONCES el sistema marca únicamente esa variante como "inactiva", manteniendo el producto base y las demás variantes sin cambios en su estado ni disponibilidad

### Requisito 5: Consulta de variantes por producto

El sistema DEBE permitir consultar todas las variantes asociadas a un producto, incluyendo sus atributos, imagen, código SKU y estado.

#### Escenario: Consulta exitosa de variantes de un producto
- DADO un producto con una o más variantes registradas
- CUANDO se solicita la información del producto junto con sus variantes
- ENTONCES el sistema retorna el producto base junto con el listado completo de sus variantes activas e inactivas, indicando el estado de cada una

#### Escenario: Consulta de variantes de un producto sin variantes registradas
- DADO un producto que no tiene ninguna variante registrada
- CUANDO se solicita la información de variantes de ese producto
- ENTONCES el sistema retorna una lista vacía de variantes, sin generar error, indicando que el producto se maneja únicamente a nivel de producto base

## 5. Requisitos no funcionales

- **Rendimiento:** La carga y almacenamiento de imágenes por variante debe procesarse de forma eficiente para no degradar los tiempos de respuesta de las operaciones de catálogo, considerando que puede haber múltiples variantes por producto con imágenes independientes.
- **Seguridad:** Las operaciones de creación, actualización, carga de imagen y desactivación de variantes deben estar restringidas a usuarios autenticados con el rol de gestor comercial, validando credenciales/token emitidos por el módulo de Seguridad y Usuarios. La carga de archivos debe validar tipo y contenido del archivo para evitar cargas maliciosas.
- **Disponibilidad:** La API de consulta de variantes debe estar disponible de forma continua, dado que los canales de venta (Marketplace, Chatbot, Retail) dependen de ella para mostrar la disponibilidad exacta por talla/color antes de una compra.
- **Auditoría:** Toda creación, actualización, cambio de imagen o cambio de estado de una variante debe quedar registrada (usuario responsable, fecha/hora, cambio realizado) para trazabilidad.
- **Escalabilidad:** El modelo de datos debe soportar un número creciente de variantes por producto sin degradar el rendimiento de las consultas, considerando el crecimiento del catálogo deportivo (múltiples tallas, colores y combinaciones por artículo).

## 6. Fuera de alcance

- **Gestión de precios por variante (individuales o masivos)** — corresponde a la funcionalidad de gestión de precios del módulo de Productos y Ofertas, no a esta capacidad.
- **Gestión de stock detallado por variante (actualización por consumo desde canales)** — se asume la existencia de un mecanismo de disponibilidad de stock; esta capacidad se limita a la definición y mantenimiento de la variante como entidad (atributos, imagen, código), no al detalle transaccional del stock.
- **Definición de nuevos tipos de atributos genéricos de configuración de variantes distintos a talla y color** — se contempla el mecanismo, pero la parametrización avanzada de nuevos tipos de atributos para todo el catálogo se considera una evolución futura.
- **Edición o procesamiento avanzado de imágenes (recorte, filtros, optimización automática)** — solo se contempla la carga y asociación de la imagen, no su edición dentro del sistema.
- **Gestión de ofertas, promociones o combos que incluyan variantes específicas** — corresponde a otras funcionalidades del módulo de Productos y Ofertas.

## Criterio de completitud

La capacidad se considera correctamente implementada cuando:
- Todos los requisitos (Creación de variantes, Código único SKU, Imagen propia por variante, Actualización/Desactivación y Consulta) están implementados.
- Todos los escenarios definidos se cumplen, incluyendo los casos borde y de error.
- Los requisitos no funcionales aplicables (rendimiento, seguridad, disponibilidad, auditoría, escalabilidad) se cumplen.
- No se han incorporado funcionalidades fuera del alcance, como gestión de precios, stock detallado u ofertas asociadas a variantes.
