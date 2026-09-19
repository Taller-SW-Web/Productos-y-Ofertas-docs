# SPEC-001 — Especificación: Carga y exportación masiva de productos

## 1. Contexto
El gestor comercial maneja frecuentemente un volumen amplio de productos, precios y existencias en el catálogo. Modificar o ingresar cientos de registros de forma manual a través de la interfaz web resulta ineficiente. Se requiere una vía para manejar grandes volúmenes de datos usando herramientas ofimáticas estructuradas (archivos XLSX o CSV), garantizando la correcta distribución de responsabilidades entre los dominios de Catálogo, Precios (Pricing) e Inventario.

## 2. Propósito
Proporcionar una herramienta para descargar el catálogo completo en una plantilla de Excel o CSV a nivel de SKU vendible, permitir su edición sin conexión, e importar dicho archivo para registrar o actualizar masivamente los registros en el sistema de forma asíncrona y desacoplada mediante **comandos idempotentes por dominio y eventos de resultados confirmados**.

## 3. Alcance
Incluye:
- Descarga de una plantilla vacía (Excel/CSV) con el formato predefinido de campos a nivel de SKU vendible y código de producto base.
- Exportación **asíncrona** del catálogo actual a un archivo Excel/CSV estructurado por SKU, con descarga posterior cuando concluya el trabajo.
- Importación asíncrona y validación por filas para creación y actualización masiva (límite de hasta 5,000 filas o 10 MB).
- Coordinación arquitectónica mediante un Worker/Job asíncrono que emite comandos idempotentes hacia Catálogo, Pricing e Inventario y consume sus resultados y eventos de cambio confirmados, correlacionados por `batch_id` y `row_id`.
- Seguimiento de estado por fila (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) y por dominio. Una fila solo se considera exitosa cuando todos los dominios requeridos confirman su procesamiento.
- Consistencia eventual: no se utiliza una transacción distribuida global entre bases de datos. Ante fallos transitorios se reintenta de forma idempotente; ante fallo definitivo la fila queda `FAILED` con el detalle del dominio afectado **y de los dominios que ya aplicaron cambios**, sin afirmar una reversión global inexistente.
- Política de actualización de campos: las celdas en blanco en filas de actualización (SKU existente) se ignoran, preservando los valores actuales en base de datos.
- Manejo de concurrencia en stock mediante comandos de ajuste de Inventario con control optimista; el evento `inventory.stock.adjusted` solo se emite tras persistir el ajuste y registro formal en Kardex.
- Generación de resumen de resultados en pantalla y descarga de un archivo CSV con el detalle de filas fallidas y motivos de rechazo.

## 4. Requisitos

### Requisito 1: Exportación del catálogo y plantilla por SKU
El sistema DEBE permitir la descarga del catálogo actual y de una plantilla vacía donde cada fila represente un SKU vendible concreto vinculado a su producto base.

#### Escenario: Exportación del catálogo completo
- DADO que el gestor comercial se encuentra en la sección de carga masiva
- CUANDO solicita exportar el catálogo completo
- ENTONCES el sistema encola una exportación asíncrona y, al completarse, ofrece para descarga un archivo Excel/CSV con todos los SKUs vendibles registrados, incluidos productos simples, detallando por fila: código de producto base, SKU vendible, atributos de variante, precio vigente, stock actual, marca, categoría y estado.

#### Escenario: Descarga de plantilla vacía
- DADO que el gestor comercial requiere registrar nuevos productos y variantes
- CUANDO solicita descargar la plantilla de carga masiva
- ENTONCES el sistema provee un archivo Excel/CSV con las cabeceras requeridas predefinidas y filas de ejemplo ilustrativas eliminables.

### Requisito 2: Carga masiva asíncrona coordinada por eventos de dominio (EDA)
El sistema DEBE procesar el archivo mediante un Worker asíncrono que valide la estructura y emita **comandos de aplicación** a cada dominio y consuma resultados; cada dominio emite sus propios eventos de cambio tras persistir. No debe usar eventos pasados (`pricing.price.changed`, `inventory.stock.adjusted`) como instrucciones.

#### Escenario: Carga masiva exitosa coordinada por eventos
- DADO que el gestor comercial sube un archivo con hasta 5,000 filas válidas respetando la plantilla
- CUANDO confirma la importación
- ENTONCES el sistema encola la tarea, asigna `batch_id`/`row_id`, emite mensajes idempotentes a los dominios requeridos y espera sus confirmaciones; solo marca una fila `COMPLETED` cuando todos los consumidores requeridos confirman su aplicación.

#### Escenario: Carga masiva con errores parciales y reporte detallado
- DADO que el gestor comercial importa un archivo donde 5 registros tienen formato de precio inválido y 10 tienen una categoría inexistente
- CUANDO el Worker procesa el archivo
- ENTONCES el sistema aplica mediante comandos las filas válidas y emite eventos solo desde los dominios que confirman cambios, descarta los 15 registros erróneos, muestra un resumen de éxitos/fallos en la pantalla y genera un archivo CSV descargable con el número de fila y causa exacta del fallo.

### Requisito 3: Actualización masiva, preservación de datos y concurrencia
El sistema DEBE actualizar los datos cuando el SKU ya existe, conservando los datos no especificados y gestionando la concurrencia de stock sin bloquear las ventas.

#### Escenario: Actualización con celdas vacías (preservación de datos)
- DADO que en el archivo importado existe una fila con un SKU existente donde la columna de descripción está vacía pero el precio y stock fueron modificados
- CUANDO el sistema procesa la fila
- ENTONCES el sistema actualiza el precio y stock correspondientes, pero conserva intacta la descripción actual del producto en el catálogo.

#### Escenario: Concurrencia de stock durante la importación masiva
- DADO que se está procesando una actualización masiva de stock para un SKU específico
- CUANDO un canal de venta descuenta stock de ese mismo SKU en el mismo instante
- ENTONCES el sistema procesa la venta sin bloqueos pesimistas y Inventario procesa un comando de ajuste condicionado por versión y, tras registrar el ajuste en Kardex, emite el evento `inventory.stock.adjusted` aplicando control de concurrencia optimista para garantizar la trazabilidad del saldo final.

### Requisito 4: Contrato de plantilla y alta de SKU
La plantilla posee columna `operacion=CREAR_PRODUCTO_SIMPLE | CREAR_VARIANTE | ACTUALIZAR` y columnas obligatorias de identificación según operación. `CREAR_PRODUCTO_SIMPLE` requiere `sku_base` nuevo y `tiene_variantes=false`. `CREAR_VARIANTE` requiere `product_id` o `sku_base` de un padre `tiene_variantes=true` ya existente **o declarado para creación en el mismo lote**, IDs/valores de atributos identificadores y **SKU de variante vacío**. Si el padre aún no existe, la primera fila del grupo aporta sus metadatos obligatorios y precio base, y todas las filas con ese `sku_base` deben coincidir en esos datos; Catálogo crea un único padre BORRADOR idempotente antes de sus variantes. Una discrepancia entre filas del mismo padre rechaza el grupo afectado. Catálogo genera cada SKU y devuelve `product_id`, `sku` y `batch_id`/`row_id`. La fila de alta representa un SKU vendible **previsto** cuyo código aún no existe en el archivo. `ACTUALIZAR` requiere SKU existente y prohíbe modificar `sku_base`, `tiene_variantes` y atributos identificadores del SKU. La plantilla usará las cabeceras, orden y tipos del Requisito 9, con `template_version=1`, sin mapeo dinámico. Si el catálogo exporta variantes en borrador, su estado se incluye y **no se activa implícitamente** al importarlas.

#### Escenario: Crear producto con varias variantes en un archivo
- DADO dos filas `CREAR_VARIANTE` de un mismo `sku_base` nuevo y coherente, con atributos identificadores diferentes
- CUANDO Catálogo aplica el grupo
- ENTONCES crea un único padre BORRADOR y dos variantes BORRADOR, devuelve los dos SKU autogenerados por fila y coordina sus preparaciones sin vender artículos incompletos.

### Requisito 5: Comandos, eventos y correlación
El orquestador usa `catalog.bulk.upsert.requested` y consume `catalog.bulk.upsert.completed|rejected`; si esa operación creó un SKU, espera también la preparación de precio inicial e Inventario a 0 y utiliza el SKU confirmado para emitir las actualizaciones requeridas. No duplica el alta de precio iniciada por Catálogo: el resultado de preparación de Pricing cuenta como confirmación de ese dominio para la fila cuando los importes coinciden; solo emite `pricing.bulk.price.apply.requested` si la fila solicita una modificación posterior. Envía `inventory.bulk.stock.adjust.requested` únicamente tras existir el SKU inicializado. Pricing/Inventario publican `pricing.bulk.price.apply.completed|rejected` e `inventory.bulk.stock.adjust.completed|rejected`. Los nombres son **contratos internos propuestos y versionados**; cada mensaje lleva `operation_id`, `batch_id`, `row_id`, `event_id`/`command_id`, versión y contexto mínimo del actor. Cada dominio publica exclusivamente sus propios hechos posteriores al commit, por ejemplo `pricing.price.changed` e `inventory.stock.adjusted` (y `inventory.stock.changed` para sincronizar proyecciones). Se emplean Outbox/Inbox e idempotencia por operación/entidad; un ACK técnico de broker no equivale a aplicación exitosa del dominio.

### Requisito 6: Estado real de fila y fallo parcial
Una fila se declara `COMPLETED` únicamente tras todos los resultados de aplicación confirmados. Un fallo definitivo produce `FAILED` con `applied_domains[]`, `failed_domain`, causa y `needs_reconciliation` cuando existan efectos parciales. No se revierten automáticamente los cambios ya aplicados si ello pudiera pisar operaciones posteriores; se bloquea la publicación comercial de nuevos SKU incompletos y se habilita una reconciliación/reintento idempotente de dominios faltantes. El CSV diferencia **fila rechazada sin efectos** de **fila parcialmente aplicada que requiere conciliación**. El resumen cuenta una fila como exitosa solo si `COMPLETED` y muestra por separado filas que requieren conciliación dentro de las fallidas.

### Requisito 7: Ajuste absoluto de stock seguro
Una celda de stock no vacía expresa **conteo absoluto** del SKU. Para `ACTUALIZAR` requiere `stock_version` de la exportación o versión esperada explícita. Para un SKU recién creado, Bulk espera la confirmación de inicialización en Inventario con saldo 0 y utiliza la versión inicial `0`; no solicita ajustar un SKU aún inexistente. Inventario ajusta mediante comparación atómica de versión y registra en Kardex valor anterior, nuevo, delta y motivo `BULK_IMPORT`. Si una venta modificó el saldo/versión, rechaza el ajuste con `VERSION_CONFLICT`; **no reintenta automáticamente el mismo conteo absoluto**. El gestor debe reexportar/reconciliar antes de reenviar. Una celda de stock vacía mantiene el saldo sin ajuste. La actualización condicional usa bloqueos de fila transaccionales breves propios de PostgreSQL, sin bloqueos globales del inventario ni garantía irreal de ausencia absoluta de espera.

### Requisito 8: Seguridad, exportación y estados HTTP
Rechazar fórmulas/macros en importación; escapar cadenas peligrosas al exportar. Exportación del catálogo usa una captura lógica con `exported_at` y versiones fuente para advertir que los datos de Catálogo, Pricing e Inventario no son un snapshot ACID distribuido. La creación asíncrona de lote responde HTTP `202 Accepted` + `batch_id`; consulta posterior informa estado, éxito o fallo. Las notificaciones y descargas se correlacionan por lote.

### Requisito 9: Contrato de plantilla general v1 y exportación asíncrona
Las columnas **en este orden exacto** para CSV/XLSX v1 son: `operacion`, `product_id`, `sku_base`, `sku`, `nombre`, `descripcion`, `categoria_id`, `marca_id`, `tiene_variantes`, `caracteristicas_identificadoras`, `atributos_identificadores`, `atributos_no_identificadores`, `imagen_url`, `precio_regular`, `precio_oferta`, `accion_precio_oferta`, `stock`, `stock_version`, `estado`, `motivo_cambio`. Todas las cabeceras deben existir, aunque algunas celdas sean opcionales según `operacion`; un cambio del esquema requiere nueva `template_version`. Identificadores y versiones son strings/enteros según su entidad; `tiene_variantes` usa `true|false`; importes usan decimales con punto y dos fracciones para PEN; `stock` y `stock_version` son enteros >=0; fechas operan según las vigencias de Pricing y no se definen en esta plantilla inicial. Las columnas `caracteristicas_identificadoras` y `atributos_identificadores` contienen **JSON compacto válido**: la primera es arreglo ordenado de `caracteristica_id` LISTA aplicable; la segunda es un objeto de `caracteristica_id` a `valor_id`. `atributos_no_identificadores` es objeto JSON opcional. Si no hay datos en las celdas JSON opcionales se usa vacío; no ejecutar fórmulas. Los formatos CSV y XLSX representan idénticos campos y tipos lógicos.

- `CREAR_PRODUCTO_SIMPLE`: `sku_base`, `nombre`, `descripcion`, `categoria_id`, `marca_id`, `tiene_variantes=false`, `precio_regular` y `motivo_cambio` son obligatorios; `sku` puede estar vacío o igual a `sku_base`; no se declaran características identificadoras.
- `CREAR_VARIANTE`: `sku_base`, `tiene_variantes=true`, `caracteristicas_identificadoras`, `atributos_identificadores` e `imagen_url` son obligatorios; `sku` **debe estar vacío**. Un padre nuevo exige además en **cada fila de su grupo** `nombre`, `descripcion`, `categoria_id`, `marca_id`, `precio_regular` y `motivo_cambio` consistentes. Para un padre existente se identifica por `product_id` o `sku_base` y se comprueba que sus características identificadoras coincidan con las ya congeladas; sus metadatos de padre, cuando se suministren, no se modifican implícitamente en una fila de creación de variante.
- `ACTUALIZAR`: `sku` existente y `motivo_cambio` si cambia precio son obligatorios; celdas vacías conservan datos. `sku_base`, `tiene_variantes` y características/valores identificadores no pueden cambiar. `estado`, cuando se proporciona, solicita transición explícita sujeta a sus validaciones; no se activa implícitamente una alta BORRADOR. Si se informa `stock`, debe informarse también `stock_version` para un SKU existente.
- `accion_precio_oferta` omitida o vacía significa `CONSERVAR`, `ESTABLECER` requiere valor numérico positivo en `precio_oferta`, `ELIMINAR` exige celda de oferta vacía; una celda vacía sin acción no elimina oferta. Un precio regular nuevo que invalide la oferta conservada produce error de fila. Aplica también al importador exclusivo de Pricing.

La plantilla vacía y sus ejemplos eliminables se descargan inmediatamente desde el contrato versionado. La **exportación completa** es un trabajo asíncrono: la API responde `202` con `export_id`; el usuario consulta `QUEUED|PROCESSING|COMPLETED|FAILED_GENERAL` y descarga el archivo protegido cuando esté `COMPLETED`. No se trunca el catálogo por los límites de importación. La exportación informa `exported_at` y versiones fuente y no promete snapshot ACID interdominio.

### Requisito 10: Fallo general y seguimiento de trabajos
Ante error transitorio del worker se ejecutan como máximo tres reintentos con espera creciente e idempotencia del lote; un fallo no recuperable o agotamiento de reintentos marca el trabajo `FAILED_GENERAL` sin inferir el estado de filas ya aplicadas, conserva su detalle y ofrece reanudar las operaciones pendientes con el **mismo `batch_id`** (sin repetir aplicaciones confirmadas) o iniciar un nuevo archivo. La pantalla distingue `FAILED_GENERAL` de `FAILED` por fila y de un fallo al consultar el estado. No se garantiza notificación fuera de la aplicación: el estado se puede recuperar por referencia persistente y la aplicación informa el resultado al volver/consultar.

## 5. Requisitos no funcionales
- Rendimiento: La importación debe soportar archivos de hasta 5,000 filas o 10 MB, ejecutándose de forma asíncrona en un Worker desacoplado sin degradar los tiempos de respuesta de la API principal ni bloquear la UI.
- Arquitectura y Desacoplamiento (EDA): la carga masiva no escribe tablas ajenas ni usa transacción distribuida global; coordina mediante mensajes idempotentes, correlación por `batch_id`/`row_id`, reintentos y confirmaciones por dominio.
- Seguridad: validación estricta de extensión, MIME, cabeceras y límites; **rechazar en prevalidación el archivo con fórmulas/macros o contenido activo**. Al exportar CSV/XLSX, escapar celdas controladas por usuarios que pudieran interpretarse como fórmulas. No ejecutar contenido importado.
- Trazabilidad: Registrar en el log de auditoría el identificador del gestor comercial, batch ID, timestamp y archivo procesado.

## 6. Fuera de alcance
- Carga masiva de archivos físicos de imágenes (únicamente se aceptan URLs públicas o pre-cargadas).
- Mapeo dinámico de columnas (el archivo debe ajustarse de forma estricta a la plantilla del sistema).
- Procesamiento sincrónico bloqueante en el hilo de la solicitud HTTP.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos y eventos de dominio están implementados.
- Se respetan los límites de tamaño y fila (5,000 filas / 10 MB).
- Se genera el resumen en pantalla y el archivo descargable de errores.
- Se conserva la información existente ante celdas vacías.
- Los requisitos no funcionales y de concurrencia optimista se cumplen cabalmente.

---
