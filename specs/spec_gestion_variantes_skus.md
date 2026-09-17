# Especificación: Gestión Avanzada de Variantes (SKUs)
**Versión:** v2 — corregida para eliminar discrepancias con `hu_gestion_variantes_skus.md`

## 1. Contexto

Dentro del catálogo de productos deportivos (camisetas, zapatillas, accesorios, etc.), es común que un mismo producto base tenga múltiples versiones comerciales que se diferencian por características como talla, color u otro atributo específico del deporte o tipo de artículo. La capacidad obligatoria de CRUD de productos (`spec_gestion_productos_crud.md`) introduce el atributo `tiene_variantes` en el producto: cuando es `false`, el producto se vende con su propio `sku_base` y su propio stock (gestionado directamente por Inventario); cuando es `true`, el producto no se vende directamente y esta capacidad extiende el modelo de catálogo para representar cada combinación concreta (por ejemplo, "zapatilla X, talla 42, color negro") como una variante independiente, con su propio código de identificación e imagen, y con su stock gestionado también por Inventario, pero a nivel de variante.

## 2. Propósito

Permitir que un producto con `tiene_variantes = true` tenga una o más variantes (SKUs) diferenciadas por características identificadoras como talla y color, cada una con su propio código único autogenerado e imagen, de modo que los canales de venta puedan mostrar y comercializar exactamente la combinación que el cliente desea.

## 3. Alcance

Aplica exclusivamente a productos con `tiene_variantes = true`. Los productos simples (`tiene_variantes = false`) no utilizan esta funcionalidad; se activan mediante Gestión de Productos y su `sku_base` funciona como SKU vendible para Pricing e Inventario.

Incluye:
- Definición de los tipos de atributos que generan variantes para un producto (por ejemplo, talla, color), configurables según el tipo de producto.
- Creación de una o más variantes (SKUs) asociadas a un producto base, cada una con su combinación única de atributos identificadores (ej. talla + color).
- Generación automática de un código único (SKU) por variante, distinto del `sku_base` del producto y de cualquier otro SKU del catálogo. El sistema es el único que asigna este código; no se acepta ingreso manual.
- Asociación de una imagen propia a cada variante (por ejemplo, para reflejar el color específico).
- Posibilidad de definir un precio propio para una variante en Pricing; si no existe, hereda el precio base vigente del producto. La persistencia y vigencia del precio pertenece a Pricing.
- Actualización de los atributos no identificadores, la imagen o el estado de una variante existente. Los atributos identificadores (los que componen el SKU) son inmutables una vez creada la variante.
- Consulta de variantes de un producto, tanto de forma individual como listadas junto con el producto base, incluyendo su estado (la disponibilidad de stock se consulta al componente de Inventario, no se replica aquí).
- Desactivación (baja lógica) de una variante específica, de forma independiente al estado del producto base y de las demás variantes.
- Exposición de la información de variantes mediante API para su consumo por los demás módulos (Marketplace Cliente, Chatbot Cliente, Retail Vendedor, Ventas y Postventa, Despacho y Entrega).

## 4. Requisitos

### Requisito 1: Creación de variantes de un producto

El sistema DEBE permitir registrar una o más variantes para un producto existente con `tiene_variantes = true`, cada una con una combinación única de atributos identificadores (ej. talla, color).

#### Escenario: Registro exitoso de una nueva variante
- DADO un producto base activo o en borrador, con `tiene_variantes = true`, registrado en el catálogo
- CUANDO el gestor comercial registra una nueva variante indicando sus atributos identificadores (ej. talla "M", color "azul") y una imagen
- ENTONCES el sistema crea la variante asociada al producto, le asigna automáticamente un código SKU único y la deja disponible para su consulta vía API

#### Escenario: Intento de registro de una variante con combinación de atributos duplicada
- DADO un producto que ya tiene registrada una variante con una combinación específica de atributos identificadores (ej. talla "M", color "azul")
- CUANDO el gestor comercial intenta registrar otra variante con exactamente la misma combinación de atributos para el mismo producto
- ENTONCES el sistema rechaza la operación e informa que ya existe una variante con esa combinación

### Requisito 2: Código único por variante (SKU autogenerado)

El sistema DEBE generar automáticamente el código SKU de cada variante a partir del `sku_base` del producto y de sus atributos identificadores, garantizando que sea único a nivel de todo el catálogo. El sistema NO debe aceptar un código SKU ingresado manualmente por el gestor comercial.

#### Escenario: Asignación correcta de código SKU
- DADO el registro de una nueva variante válida
- CUANDO el sistema genera el código SKU de la variante a partir del `sku_base` y los atributos identificadores
- ENTONCES el sistema valida que dicho código no exista previamente en ninguna otra variante o producto del catálogo antes de confirmar el registro

#### Escenario: Colisión interna de SKU autogenerado
- DADO que, por un caso excepcional, el código SKU autogenerado coincide con uno ya existente en el catálogo
- CUANDO el sistema intenta confirmar el registro de la variante
- ENTONCES el sistema rechaza la operación, registra la colisión para revisión técnica y no expone la variante mientras no se resuelva

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

El sistema DEBE permitir actualizar la imagen y los atributos **no identificadores** de una variante, así como desactivarla de forma independiente al producto base. Los atributos identificadores (los que componen el SKU, ej. talla y color) son **inmutables**: no pueden modificarse una vez creada la variante.

#### Escenario: Actualización exitosa de atributos no identificadores
- DADO una variante existente y activa
- CUANDO el gestor comercial modifica su imagen o un atributo que no forma parte del SKU
- ENTONCES el sistema guarda los cambios y refleja la información actualizada en las consultas posteriores vía API, sin alterar el SKU

#### Escenario: Intento de modificar un atributo que forma parte del SKU
- DADO una variante existente cuyo SKU codifica talla y color
- CUANDO el gestor comercial intenta modificar el valor de talla o color de esa misma variante
- ENTONCES el sistema rechaza el cambio e indica que debe desactivar la variante actual y registrar una nueva con el atributo correcto

#### Escenario: Desactivación de una variante sin afectar el producto base ni otras variantes
- DADO un producto con varias variantes activas
- CUANDO el gestor comercial desactiva una de esas variantes (por ejemplo, por descontinuación de una talla)
- ENTONCES el sistema marca únicamente esa variante como "inactiva", manteniendo el producto base y las demás variantes sin cambios en su estado ni disponibilidad. Los pedidos ya confirmados conservan el snapshot de la variante vendida

### Requisito 5: Consulta de variantes por producto

El sistema DEBE permitir consultar todas las variantes asociadas a un producto, incluyendo sus atributos, imagen, código SKU y estado.

#### Escenario: Consulta exitosa de variantes de un producto
- DADO un producto con `tiene_variantes = true` y una o más variantes registradas
- CUANDO se solicita la información del producto junto con sus variantes
- ENTONCES el sistema retorna el producto base junto con el listado completo de sus variantes activas e inactivas, indicando el estado de cada una

#### Escenario: Consulta de variantes de un producto sin variantes registradas
- DADO un producto con `tiene_variantes = true` que aún no tiene ninguna variante registrada
- CUANDO se solicita la información de variantes de ese producto
- ENTONCES el sistema retorna una lista vacía de variantes, sin generar error, e indica que el producto no puede activarse hasta registrar al menos una

## 5. Requisitos no funcionales

- **Rendimiento:** La carga y almacenamiento de imágenes por variante debe procesarse de forma eficiente para no degradar los tiempos de respuesta de las operaciones de catálogo, considerando que puede haber múltiples variantes por producto con imágenes independientes.
- **Seguridad:** Las operaciones de creación, actualización, carga de imagen y desactivación de variantes deben estar restringidas a usuarios autenticados con el rol de gestor comercial, validando credenciales/token emitidos por el módulo de Seguridad y Usuarios. La carga de archivos debe validar tipo y contenido del archivo para evitar cargas maliciosas.
- **Disponibilidad:** La API de consulta de variantes debe estar disponible de forma continua, dado que los canales de venta (Marketplace, Chatbot, Retail) dependen de ella para mostrar la variante exacta por talla/color antes de una compra.
- **Auditoría:** Toda creación, actualización, cambio de imagen o cambio de estado de una variante debe quedar registrada (usuario responsable, fecha/hora, cambio realizado) para trazabilidad.
- **Escalabilidad:** El modelo de datos debe soportar un número creciente de variantes por producto sin degradar el rendimiento de las consultas, considerando el crecimiento del catálogo deportivo (múltiples tallas, colores y combinaciones por artículo).

## 6. Fuera de alcance

- **Persistencia y actualización de precios por variante** — corresponde a Pricing. Esta capacidad solo expone la identidad SKU necesaria para que Pricing aplique un precio específico o la herencia del precio del producto.
- **Gestión y cálculo del stock, tanto por variante como por producto simple** — es responsabilidad exclusiva del componente de Inventario. Esta capacidad se limita a la definición y mantenimiento de la variante como entidad (atributos, imagen, código); solo notifica su creación o desactivación para que Inventario inicialice o retire el registro correspondiente.
- **Definición de nuevos tipos de atributos genéricos de configuración de variantes distintos a talla y color** — se contempla el mecanismo, pero la parametrización avanzada de nuevos tipos de atributos para todo el catálogo se considera una evolución futura.
- **Edición o procesamiento avanzado de imágenes (recorte, filtros, optimización automática)** — solo se contempla la carga y asociación de la imagen, no su edición dentro del sistema.
- **Gestión de ofertas, promociones o combos que incluyan variantes específicas** — corresponde a otras funcionalidades del módulo de Productos y Ofertas.
- **Activación y venta de productos simples (`tiene_variantes = false`)** — corresponde íntegramente a `spec_gestion_productos_crud.md`; esta especificación no aplica a esos productos.

## Criterio de completitud

La capacidad se considera correctamente implementada cuando:
- Todos los requisitos (Creación de variantes, SKU autogenerado, Imagen propia por variante, Actualización/Desactivación con inmutabilidad del SKU, y Consulta) están implementados.
- Todos los escenarios definidos se cumplen, incluyendo los casos borde y de error.
- Los requisitos no funcionales aplicables (rendimiento, seguridad, disponibilidad, auditoría, escalabilidad) se cumplen.
- No se han incorporado funcionalidades fuera del alcance, como gestión de precios, cálculo de stock u ofertas asociadas a variantes.
