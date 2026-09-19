# HU-001 — Historia de Usuario: Carga y exportación masiva de productos

**Como** **gestor comercial**,

**quiero** descargar el catálogo completo y cargar archivos
en formato Excel o CSV estructurados por SKU vendible con múltiples registros

**para** registrar nuevos productos y variantes
o actualizar masivamente los existentes (precios, stock, estado, etc.) de forma
rápida y asíncrona, coordinando los dominios de Catálogo, Pricing e Inventario sin bloqueos.

## Criterios de aceptación

|  |  |
| --- | --- |
| **ID** | **Criterio** |
| **CA-01** | El sistema debe permitir al gestor descargar el catálogo actual completo a nivel de SKU vendible o una plantilla vacía en formato Excel/CSV con las cabeceras predefinidas, aplicando hasta 5,000 filas o 10 MB únicamente al archivo de **importación**; la exportación completa no se trunca por ese límite. |
| **CA-02** | La importación no debe requerir mapeo dinámico; el archivo subido debe respetar la estructura y formato exacto de la plantilla, de lo contrario será rechazado en su totalidad durante la pre-validación de estructura. |
| **CA-03** | Cada fila representa un SKU vendible vinculado a su código de producto base. Si `operacion=CREAR_PRODUCTO_SIMPLE`, se utiliza `sku_base` nuevo; si `CREAR_VARIANTE`, se suministran padre y atributos con SKU de variante vacío y Catálogo lo genera y devuelve. Un padre nuevo puede declararse en el mismo archivo repitiendo idénticos metadatos obligatorios y `sku_base` en sus filas; se crea una sola vez en BORRADOR; si `ACTUALIZAR`, se exige SKU existente y no se cambian los atributos identificadores. |
| **CA-04** | En filas de actualización (SKU existente), las celdas vacías o en blanco deben ser ignoradas por el sistema, conservando intactos los valores actuales persistidos en la base de datos (evitando sobreescrituras o borrados accidentales). |
| **CA-05** | Solo se admitirán URLs válidas para registrar las imágenes de los productos en la carga masiva; el sistema no procesará archivos físicos adjuntos o imágenes incrustadas en el documento. |
| **CA-06** | En caso de existir errores parciales de validación de negocio en filas individuales, el sistema debe procesar y persistir las filas válidas, rechazar las inválidas, mostrar un resumen cuantitativo en pantalla y proveer la descarga de un archivo CSV con el detalle de las filas fallidas y el motivo exacto del error. |
| **CA-07** | El procesamiento debe ser asíncrono mediante Worker/EDA, sin transacción distribuida global. Cada fila se correlaciona con `batch_id` y `row_id`, y los mensajes hacia Catálogo, Pricing e Inventario deben ser idempotentes y reintentables. |
| **CA-07A** | Una fila solo se marca como exitosa cuando todos los dominios que debía modificar confirman la aplicación. Si un dominio falla definitivamente, la fila queda `FAILED` y el reporte indica dominio y motivo **junto con qué dominios ya aplicaron cambios y si requiere conciliación**. |
| **CA-08** | La actualización de inventario debe solicitarse mediante comando idempotente de ajuste condicional con `stock_version`; Inventario registra el cambio en Kardex y luego emite `inventory.stock.adjusted`. Si el stock cambió durante una venta, rechaza el conteo absoluto obsoleto con `VERSION_CONFLICT`; no utiliza bloqueo global de base de datos. |
| **CA-09** | El sistema debe validar extensión (XLSX, CSV), tipo MIME y contenido activo. Si el archivo contiene fórmulas, macros o contenido ejecutable, debe rechazarse íntegramente en prevalidación; las exportaciones deben escapar/proteger cadenas que pudieran interpretarse como fórmulas. |
| **CA-10** | Debe registrarse en los logs de auditoría el usuario, timestamp, batch ID y archivo procesado para garantizar la trazabilidad completa. |

| **CA-11** | La plantilla versionada distingue `CREAR_PRODUCTO_SIMPLE`, `CREAR_VARIANTE` y `ACTUALIZAR`; en creación de variante, SKU está vacío y lo genera Catálogo, que devuelve el identificador correlacionado. |
| **CA-12** | Los comandos de Catálogo, Pricing e Inventario son distintos de `pricing.price.changed` e `inventory.stock.adjusted`, eventos que solo publican los dominios tras persistir; cada dominio devuelve resultado funcional correlacionado. |
| **CA-13** | Ante fallo definitivo de una fila, el CSV informa dominios aplicados, dominio fallido y necesidad de conciliación; no se declara rollback global ni se oculta un cambio parcial. |
| **CA-14** | Un conteo absoluto sobre SKU existente requiere `stock_version`; para SKU recién creado se espera la inicialización confirmada a cero y se usa versión inicial 0. Ante venta o ajuste posterior se rechaza `VERSION_CONFLICT` sin reaplicar el conteo viejo. |
| **CA-15** | El archivo con fórmulas/macros se rechaza en prevalidación; exportaciones protegen contra Formula Injection; el alta del lote responde HTTP 202 y permite consultar resultado final. |
| **CA-16** | Al exportar catálogo se incluye `exported_at` y las versiones necesarias; se informa que no existe un snapshot ACID único entre los tres dominios. |
| **CA-17** | Un producto padre con variantes inexistente puede crearse a partir de varias filas `CREAR_VARIANTE` del mismo archivo; todas deben repetir coherentemente el `sku_base` y datos del padre, que se crea una sola vez en BORRADOR. Las variantes reciben SKU autogenerado. |
| **CA-18** | La plantilla general v1 contiene exactamente, y en orden: `operacion`, `product_id`, `sku_base`, `sku`, `nombre`, `descripcion`, `categoria_id`, `marca_id`, `tiene_variantes`, `caracteristicas_identificadoras`, `atributos_identificadores`, `atributos_no_identificadores`, `imagen_url`, `precio_regular`, `precio_oferta`, `accion_precio_oferta`, `stock`, `stock_version`, `estado`, `motivo_cambio`; campos condicionales y tipos siguen el Requisito 9 del Spec. Los ejemplos son eliminables y una nueva estructura requiere versión nueva. |
| **CA-19** | Descargar plantilla es inmediato. Exportar todo el catálogo crea un trabajo asíncrono con `export_id`, consulta de estado y descarga protegida al concluir; no se trunca al alcanzar el límite de importación. |
| **CA-20** | El fallo general del worker se informa como `FAILED_GENERAL` tras hasta tres reintentos transitorios; se conserva estado por fila, y la recuperación reanuda comandos pendientes idempotentemente usando el mismo `batch_id`, sin volver a aplicar confirmados. |
| **CA-21** | La oferta vacía no se borra: `accion_precio_oferta` vacía/`CONSERVAR` conserva; `ESTABLECER` exige importe; `ELIMINAR` con importe vacío la retira. Se rechaza regular incompatible con una oferta conservada. |

## Escenarios dado-cuando-entonces

**Escenario 1: Exportación del catálogo completo estructurado por SKU**

* **DADO** que el gestor comercial se encuentra en la sección de
  carga masiva,
* **CUANDO** solicita exportar el catálogo completo de productos,
* **ENTONCES** el sistema crea una exportación asíncrona con `export_id` y entrega un archivo Excel/CSV descargable al completarse, que
  contiene todas las variantes registradas, detallando por fila: código de producto base, SKU,
  atributos de variante, stock, precios, marcas, categorías y estados.

**Escenario 2: Descarga de plantilla vacía**

* **DADO** que el gestor comercial requiere registrar nuevos
  productos y variantes,
* **CUANDO** solicita descargar la plantilla de carga masiva,
* **ENTONCES** el sistema provee un archivo Excel/CSV con las
  cabeceras obligatorias requeridas (y ejemplos ilustrativos eliminables).

**Escenario 3: Carga masiva exitosa coordinada por eventos (EDA)**

* **DADO** que el gestor comercial ha completado un archivo
  respetando la plantilla con hasta 5,000 variantes válidas,
* **CUANDO** sube el archivo al sistema y confirma la importación,
* **ENTONCES** el sistema delega el procesamiento al Worker asíncrono, correlaciona cada fila y emite comandos por dominio (`catalog.bulk.upsert.requested`, `pricing.bulk.price.apply.requested`, `inventory.bulk.stock.adjust.requested`), consume resultados correlacionados y cada dominio publica sus propios eventos confirmados
  y solo notifica éxito de cada fila cuando los dominios requeridos confirman su aplicación.

**Escenario 4: Actualización de producto existente con celdas vacías**

* **DADO** que en el archivo importado existe una fila con un SKU existente
  donde se actualizó el precio pero la celda de descripción está vacía,
* **CUANDO** el sistema procesa dicha fila,
* **ENTONCES** el sistema actualiza el precio en Pricing emitiendo el evento correspondiente
  y mantiene inalterada la descripción existente en Catálogo.

**Escenario 5: Carga masiva con errores parciales y descarga de CSV de errores**

* **DADO** que el gestor comercial intenta importar un archivo
  donde 5 registros tienen formato de precio inválido y 10 tienen una
  categoría inexistente,
* **CUANDO** el sistema procesa el archivo,
* **ENTONCES** el sistema aplica y guarda los registros correctos, rechaza los 15 registros inválidos,
  muestra el resumen de fallos en la pantalla y genera un archivo CSV descargable con el detalle
  de filas y motivos del error.

**Escenario 6: Concurrencia de stock durante actualización masiva**

* **DADO** que se está ejecutando la actualización masiva de existencias de un SKU mediante el proceso en lote,
* **CUANDO** en ese mismo instante un canal de venta descuenta unidades del mismo SKU por una venta confirmada,
* **ENTONCES** el consumo de venta y el ajuste compiten mediante actualizaciones transaccionales cortas y versión; si la venta cambió la versión, Inventario rechaza el ajuste absoluto desactualizado con `VERSION_CONFLICT` sin sobrescribir el consumo.

**Escenario 7: Nueva variante recibe SKU autogenerado**
* **DADO** una fila `CREAR_VARIANTE` con producto padre y atributos identificadores, pero sin SKU de variante,
* **CUANDO** Catálogo confirma el alta,
* **ENTONCES** devuelve SKU, `batch_id` y `row_id` y Bulk lo utiliza en comandos posteriores.

**Escenario 8: Precio no aplicado tras creación en Catálogo**
* **DADO** una fila cuyo cambio de Catálogo se confirmó y cuyo cambio de Pricing falló definitivamente,
* **CUANDO** Bulk finaliza la operación,
* **ENTONCES** marca `FAILED`, informa Catálogo como aplicado, Pricing como fallido y requiere conciliación; no publica el SKU nuevo como vendible.

**Escenario 9: Conteo exportado obsoleto**
* **DADO** una exportación con `stock_version=5` y venta confirmada que dejó la versión 6,
* **CUANDO** se importa un conteo absoluto basado en la versión 5,
* **ENTONCES** se rechaza el ajuste con `VERSION_CONFLICT` sin restaurar el stock anterior.

**Escenario 10: Archivo con fórmula**
* **DADO** un CSV/XLSX con una celda que contiene fórmula activa,
* **CUANDO** se prevalidan los contenidos,
* **ENTONCES** se rechaza el archivo sin ejecutar ni persistir esa fórmula.

**Escenario 11: Varias variantes de producto nuevo en el mismo lote**
* **DADO** dos filas `CREAR_VARIANTE` con el mismo `sku_base` de padre aún inexistente, metadatos coherentes y atributos diferentes,
* **CUANDO** se procesa el lote,
* **ENTONCES** Catálogo crea un único producto padre en BORRADOR y dos variantes BORRADOR, genera cada SKU y devuelve el resultado de cada fila. Si los metadatos compartidos se contradicen, rechaza el grupo sin crear múltiples padres.

**Escenario 12: Exportación completa asíncrona**
* **DADO** un catálogo de más de 5.000 SKUs,
* **CUANDO** el gestor solicita exportarlo,
* **ENTONCES** recibe `export_id`, sigue el progreso de un trabajo asíncrono y descarga todas las filas al finalizar sin truncamiento por el límite de importación.

**Escenario 13: Falla general del worker después de aplicar una fila**
* **DADO** un lote con una fila confirmada en Catálogo y otras pendientes,
* **CUANDO** falla el worker después de los reintentos,
* **ENTONCES** el lote queda `FAILED_GENERAL`, mantiene estado real por fila y al reanudar con el mismo `batch_id` no duplica cambios confirmados.

## Interacción con otros módulos

|  |  |  |  |
| --- | --- | --- | --- |
| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| **Seguridad y Usuarios** | Verificar quién ejecuta la importación/exportación y registrar la trazabilidad. | Identidad del gestor comercial, token de sesión, roles y permisos. | Solicitudes de validación de permisos y datos para el registro en los logs de auditoría (usuario, batch ID y fecha). |
| **Canales de venta (Marketplace, Chatbot, Retail)** | Reflejar de forma eventual los cambios masivos confirmados en el catálogo. | (No hay interacción directa durante la carga, pero consumen el resultado final vía eventos o consultas). | Disponibilidad eventual de los cambios confirmados después de actualizar las proyecciones de los canales; no se promete simultaneidad ni tiempo cero. |

## Dependencias dentro de Productos y Ofertas (EDA)

Estas son las coordinaciones que el orquestador de importación ejecuta mediante eventos de dominio:

|  |  |
| --- | --- |
| **Submódulo / Dominio** | **Mecanismo de coordinación y eventos emitidos** |
| **Catálogo de Productos** | Valida categorías y marcas; recibe `catalog.bulk.upsert.requested` y devuelve `catalog.bulk.upsert.completed|rejected`, incluido el SKU generado cuando corresponda; solo después publica sus hechos de producto. |
| **Gestión de Precios (Pricing)** | Recibe `pricing.bulk.price.apply.requested`, emite resultado correlacionado y publica `pricing.price.changed` exclusivamente tras persistir el precio. |
| **Gestión de Inventario** | Recibe `inventory.bulk.stock.adjust.requested` con `stock_version`; confirma o rechaza, registra Kardex y publica `inventory.stock.adjusted` y `inventory.stock.changed` después de persistir. |

## Reglas acordadas de negocio y arquitectura

* **Límites del archivo:** Máximo **5,000 filas** o un peso límite de **10 MB** por archivo. Archivos que excedan estos límites son rechazados en la validación inicial de cabeceras.
* **Tratamiento de campos vacíos:** Al actualizar un SKU existente, cualquier celda en blanco se interpreta como **"ignorar y conservar valor actual"**, previniendo borrados accidentales de atributos preexistentes.
* **Reporte de errores:** Se presenta un resumen consolidado en la interfaz web (total procesados, exitosos, fallidos) y se provee un botón para **descargar un archivo CSV con el reporte detallado** de cada fila rechazada y su causa.
* **Concurrencia de stock:** Las modificaciones de stock masivas se solicitan mediante comando y control por versión; `inventory.stock.adjusted` es el evento de ajuste ya confirmado en Kardex.
* **Consistencia multi-dominio:** No se usa una transacción distribuida entre Catálogo, Pricing e Inventario. Se aplica consistencia eventual con mensajes idempotentes, reintentos y confirmaciones correlacionadas por `batch_id`/`row_id`.
* **Definición de éxito:** una fila es exitosa solo cuando todos los dominios requeridos han confirmado el cambio.

---
