# SPEC-004 — Especificación: Gestión avanzada de variantes (SKUs)

**Responsable:** Gabriel Poma Gutierrez  
**Rama:** poma  
**Trazabilidad:** HU [HU-004](../hu/HU-004-gestion-variantes-skus.md) | Wireframe [WF-004](../wireframes/flows/WF-004-gestion-variantes-skus.md)

**Versión:** v2 — corregida para eliminar discrepancias con `hu_gestion_variantes_skus.md`

> **Cambios consolidados:** se separa el identificador interno inmutable `variant_id` del SKU comercial; el SKU puede suministrarse desde un sistema externo o generarse automáticamente cuando se omite, siempre con unicidad global; la capacidad aplica exclusivamente a productos con `tiene_variantes = true`; Inventario continúa siendo el único dueño del stock; los atributos identificadores de la variante permanecen inmutables mediante edición ordinaria.

## 1. Contexto

Dentro del catálogo de productos deportivos (camisetas, zapatillas, accesorios, etc.), es común que un mismo producto base tenga múltiples versiones comerciales que se diferencian por características como talla, color u otro atributo específico del deporte o tipo de artículo. La capacidad obligatoria de CRUD de productos (`SPEC-003-gestion-productos-crud.md`) introduce el atributo `tiene_variantes` en el producto: cuando es `false`, el producto se vende utilizando su `sku_base` como SKU vendible, cuyo stock pertenece exclusivamente a Inventario; cuando es `true`, el producto no se vende directamente y esta capacidad extiende el modelo de catálogo para representar cada combinación concreta (por ejemplo, "zapatilla X, talla 42, color negro") como una variante independiente, con su propio código de identificación e imagen, y con su stock gestionado también por Inventario, pero a nivel de variante.

## 2. Propósito

Permitir que un producto con `tiene_variantes = true` tenga una o más variantes diferenciadas por características identificadoras como talla y color, cada una con `variant_id` interno inmutable, SKU comercial único —aportado o generado— e imagen, de modo que los canales de venta y futuras integraciones con ERP/proveedores puedan identificar exactamente la combinación comercial.

## 3. Alcance

Aplica exclusivamente a productos con `tiene_variantes = true`. Los productos simples (`tiene_variantes = false`) no utilizan esta funcionalidad; se activan mediante Gestión de Productos y su `sku_base` funciona como SKU vendible para Pricing e Inventario.

Incluye:
- Configuración previa por producto de características identificadoras LISTA permitidas por su `tipo_producto_id`, inmutable desde la primera variante; sus valores referencian IDs estables.
- Creación de una o más variantes (SKUs) asociadas a un producto base, cada una con su combinación única de atributos identificadores (ej. talla + color).
- Asignación de un `variant_id` interno generado por Catálogo e inmutable, separado del SKU comercial. El SKU comercial puede ser informado por el gestor/importación —por ejemplo, si proviene de ERP o proveedor— o generado por el sistema si se omite; en ambos casos debe ser único globalmente y no puede cambiarse después de publicar la variante mediante edición ordinaria.
- Asociación de una imagen propia a cada variante (por ejemplo, para reflejar el color específico).
- Posibilidad de definir un precio propio para una variante en Pricing; si no existe, hereda el precio base vigente del producto. La persistencia y vigencia del precio pertenece a Pricing.
- Actualización de los atributos no identificadores, la imagen o el estado de una variante existente. Los atributos identificadores (los que componen el SKU) son inmutables una vez creada la variante.
- Consulta de variantes de un producto, tanto de forma individual como listadas junto con el producto base, incluyendo su estado (la disponibilidad de stock se consulta al componente de Inventario, no se replica aquí).
- Desactivación (baja lógica) de una variante específica; si era la última variante activa, también se inactiva el producto padre para no dejar un producto activo sin unidades vendibles.
- Exposición de la información de variantes mediante API para su consumo por los demás módulos (Marketplace Cliente, Chatbot Cliente, Retail Vendedor, Ventas y Postventa, Despacho y Entrega).

## 4. Requisitos

### Requisito 0: Configuración de características identificadoras por producto
El gestor configura **en Catálogo, para cada producto `tiene_variantes=true` y antes de crear su primera variante**, un conjunto no vacío de `caracteristica_id` distintos seleccionados entre las características LISTA activas y aplicables a su `tipo_producto_id`; las características NUMERO/TEXTO no identifican variantes en este alcance. El conjunto queda **inmutable desde la primera variante registrada**, incluso si después queda inactiva, para impedir cambios retroactivos de identidad. Para cada variante se exige exactamente un `valor_id` activo y perteneciente a cada LISTA identificadora configurada; no pueden faltar atributos ni aparecer atributos identificadores extra. Los valores y características se referencian por ID estable. Una combinación de IDs no puede reutilizarse aunque una variante anterior esté inactiva. Un cambio de categoría de navegación no altera esta identidad; un cambio de tipo de producto que la invalide requiere una migración explícita fuera del CRUD ordinario.

### Requisito 1: Creación de variantes de un producto

El sistema DEBE permitir registrar una o más variantes para un producto existente con `tiene_variantes = true`, cada una con una combinación única de atributos identificadores (ej. talla, color).

#### Escenario: Registro exitoso de una nueva variante
- DADO un producto base activo o en borrador, con `tiene_variantes = true`, registrado en el catálogo
- CUANDO el gestor comercial registra una nueva variante indicando sus atributos identificadores (ej. talla "M", color "azul") y una imagen
- ENTONCES el sistema crea la variante asociada al producto en estado BORRADOR, genera un `variant_id` interno, valida el SKU comercial informado o genera uno si se dejó vacío, y la deja disponible únicamente para consulta administrativa mientras no se active

#### Escenario: Intento de registro de una variante con combinación de atributos duplicada
- DADO un producto que ya tiene registrada una variante con una combinación específica de atributos identificadores (ej. talla "M", color "azul")
- CUANDO el gestor comercial intenta registrar otra variante con exactamente la misma combinación de atributos para el mismo producto
- ENTONCES el sistema rechaza la operación e informa que ya existe una variante con esa combinación

### Requisito 2: Identidad interna y SKU comercial único
Cada variante DEBE recibir un `variant_id` interno generado por Catálogo, estable e inmutable. Separadamente, debe disponer de un `sku` comercial único a nivel de catálogo. Al crear la variante, el gestor o una importación puede informar un SKU comercial válido; si lo omite, el sistema genera uno a partir del `sku_base` y la combinación identificadora. El SKU comercial aceptado no se modifica mediante la edición ordinaria de una variante ya publicada; una recodificación exige un proceso explícito de migración para no romper referencias de Pricing, Inventario, pedidos e integraciones externas.

#### Escenario: SKU comercial proporcionado
- DADO el registro de una variante válida y un SKU comercial externo `NKE-PEG-42-BLK`
- CUANDO Catálogo valida formato y comprueba que no existe otro producto o variante con el mismo código
- ENTONCES conserva ese SKU como código comercial de la variante y genera independientemente su `variant_id` interno.

#### Escenario: Generación automática cuando no se informa SKU
- DADO el registro de una nueva variante válida sin SKU comercial
- CUANDO Catálogo procesa el alta
- ENTONCES genera un SKU determinista/único según la convención vigente, valida la ausencia de colisión y lo devuelve junto con el `variant_id`.

#### Escenario: Colisión de SKU
- DADO que el SKU informado o generado coincide con uno ya existente
- CUANDO el sistema intenta confirmar el registro
- ENTONCES rechaza la operación sin exponer la variante y permite corregir el SKU solicitado o reintentar la generación según corresponda.

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

#### Escenario: Desactivación de una variante cuando quedan otras variantes activas
- DADO un producto con varias variantes activas
- CUANDO el gestor comercial desactiva una de esas variantes (por ejemplo, por descontinuación de una talla)
- ENTONCES el sistema marca únicamente esa variante como "inactiva", manteniendo el producto base y las demás variantes sin cambios en su estado ni disponibilidad. Los pedidos ya confirmados conservan el snapshot de la variante vendida

### Requisito 4.1: Ciclo de vida y activación de variante
La variante se crea BORRADOR y puede pasar a ACTIVA mediante una acción autorizada si dispone de SKU único, atributos identificadores válidos e imagen válida; su producto padre tiene categoría y marca activas, precio base confirmado en Pricing y registro de SKU inicializado en Inventario. Una variante activa puede pasar a INACTIVA por baja lógica. La reactivación de una variante inactiva requiere las mismas validaciones que la activación y no genera SKU nuevo. Un SKU inactivo o borrador no participa en nuevas ventas ni en nuevos combos. Si se desactiva la última variante activa, Catálogo pone INACTIVO al producto padre en la misma transacción local; los pedidos confirmados conservan su snapshot. La reactivación del padre vuelve a comprobar sus condiciones de activación.

#### Escenario: Activar variante preparada
- DADO una variante BORRADOR con SKU, atributos e imagen válidos, precio base del padre confirmado y SKU inicializado en Inventario
- CUANDO el gestor la activa
- ENTONCES queda ACTIVA y, si el producto padre está INACTIVO, este no se reactiva automáticamente.

#### Escenario: Rechazar variante sin preparación
- DADO una variante BORRADOR cuyo registro de Inventario aún no está confirmado
- CUANDO se solicita activarla
- ENTONCES se rechaza sin convertirla en ACTIVA.

### Requisito 4.2: Creación masiva con SKU opcional
Cuando Carga Masiva crea una variante, identifica el producto padre (existente o creado como BORRADOR una sola vez por grupo `sku_base` en el mismo lote) y la combinación de características por sus IDs/valores. Catálogo siempre genera `variant_id`; si la fila aporta `sku`, lo valida como código comercial solicitado, y si la celda está vacía genera el SKU según la convención vigente. Devuelve `product_id`, `variant_id`, `sku` y la correlación `batch_id`/`row_id`. Si la fila señala un SKU existente, se trata como actualización y se rechaza todo intento de cambiar los atributos identificadores o recodificar el SKU desde este flujo.

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

### Regla transversal: elegibilidad comercial de la variante
Una variante con estado ACTIVA no es vendible si su producto padre está BORRADOR o INACTIVO; la elegibilidad comercial requiere simultáneamente padre ACTIVO, variante ACTIVA, precio preparado y SKU inicializado. La activación de variante preparada puede ocurrir antes de la activación del padre y no activa al padre implícitamente.

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
- **Activación y venta de productos simples (`tiene_variantes = false`)** — corresponde íntegramente a `SPEC-003-gestion-productos-crud.md`; esta especificación no aplica a esos productos.

## Criterio de completitud

La capacidad se considera correctamente implementada cuando:
- Todos los requisitos (Creación de variantes, `variant_id` interno, SKU comercial aportado o generado con unicidad, imagen propia, actualización/desactivación con identidad estable y consulta) están implementados.
- Todos los escenarios definidos se cumplen, incluyendo los casos borde y de error.
- Los requisitos no funcionales aplicables (rendimiento, seguridad, disponibilidad, auditoría, escalabilidad) se cumplen.
- No se han incorporado funcionalidades fuera del alcance, como gestión de precios, cálculo de stock u ofertas asociadas a variantes.
