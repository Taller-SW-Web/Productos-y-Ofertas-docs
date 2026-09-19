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
| **CA-01** | El sistema debe permitir al gestor descargar el catálogo actual completo a nivel de SKU vendible o una plantilla vacía en formato Excel/CSV con las cabeceras predefinidas, soportando hasta 5,000 filas o 10 MB por archivo. |
| **CA-02** | La importación no debe requerir mapeo dinámico; el archivo subido debe respetar la estructura y formato exacto de la plantilla, de lo contrario será rechazado en su totalidad durante la pre-validación de estructura. |
| **CA-03** | Cada fila representa un SKU vendible vinculado a su código de producto base. Si el SKU no existe, se registra como nueva variante/producto; si el SKU ya existe, se procede a su actualización masiva. |
| **CA-04** | En filas de actualización (SKU existente), las celdas vacías o en blanco deben ser ignoradas por el sistema, conservando intactos los valores actuales persistidos en la base de datos (evitando sobreescrituras o borrados accidentales). |
| **CA-05** | Solo se admitirán URLs válidas para registrar las imágenes de los productos en la carga masiva; el sistema no procesará archivos físicos adjuntos o imágenes incrustadas en el documento. |
| **CA-06** | En caso de existir errores parciales de validación de negocio en filas individuales, el sistema debe procesar y persistir las filas válidas, rechazar las inválidas, mostrar un resumen cuantitativo en pantalla y proveer la descarga de un archivo CSV con el detalle de las filas fallidas y el motivo exacto del error. |
| **CA-07** | El procesamiento debe ser asíncrono mediante Worker/EDA, sin transacción distribuida global. Cada fila se correlaciona con `batch_id` y `row_id`, y los mensajes hacia Catálogo, Pricing e Inventario deben ser idempotentes y reintentables. |
| **CA-07A** | Una fila solo se marca como exitosa cuando todos los dominios que debía modificar confirman la aplicación. Si un dominio falla definitivamente, la fila queda `FAILED` y el reporte identifica el dominio y motivo. |
| **CA-08** | La actualización de inventario debe gestionarse como un evento de ajuste en Kardex (`inventory.stock.adjusted`) con control de concurrencia optimista, garantizando que ventas concurrentes en canales (Marketplace, Retail) no sufran bloqueos globales de base de datos. |
| **CA-09** | El sistema debe validar la extensión (XLSX, CSV), tipo MIME y sanear el contenido contra inyecciones de fórmulas ejecutables (CSV/Excel Formula Injection). |
| **CA-10** | Debe registrarse en los logs de auditoría el usuario, timestamp, batch ID y archivo procesado para garantizar la trazabilidad completa. |

## Escenarios dado-cuando-entonces

**Escenario 1: Exportación del catálogo completo estructurado por SKU**

* **DADO** que el gestor comercial se encuentra en la sección de
  carga masiva,
* **CUANDO** solicita exportar el catálogo completo de productos,
* **ENTONCES** el sistema genera y descarga un archivo Excel/CSV que
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
* **ENTONCES** el sistema delega el procesamiento al Worker asíncrono, correlaciona cada fila y emite los mensajes
  `catalog.product.upserted`, `pricing.price.changed` e `inventory.stock.adjusted` hacia sus dominios respectivos
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
* **ENTONCES** el sistema permite que la venta aplique sin bloqueo pesimista y el proceso de inventario registra
  el ajuste en Kardex mediante control de concurrencia optimista garantizando saldos íntegros.

## Interacción con otros módulos

|  |  |  |  |
| --- | --- | --- | --- |
| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| **Seguridad y Usuarios** | Verificar quién ejecuta la importación/exportación y registrar la trazabilidad. | Identidad del gestor comercial, token de sesión, roles y permisos. | Solicitudes de validación de permisos y datos para el registro en los logs de auditoría (usuario, batch ID y fecha). |
| **Canales de venta (Marketplace, Chatbot, Retail)** | Reflejar de manera inmediata los cambios masivos en el catálogo. | (No hay interacción directa durante la carga, pero consumen el resultado final vía eventos o consultas). | Disponibilidad inmediata de los nuevos productos, precios actualizados y stocks modificados tras procesar los eventos de dominio. |

## Dependencias dentro de Productos y Ofertas (EDA)

Estas son las coordinaciones que el orquestador de importación ejecuta mediante eventos de dominio:

|  |  |
| --- | --- |
| **Submódulo / Dominio** | **Mecanismo de coordinación y eventos emitidos** |
| **Catálogo de Productos** | Valida categorías y marcas; recibe el evento `catalog.product.upserted` con los datos base del producto y atributos de variante. |
| **Gestión de Precios (Pricing)** | Recibe el evento `pricing.price.changed` con el SKU, precio regular y vigencia para aplicar las políticas comerciales. |
| **Gestión de Inventario** | Recibe el evento `inventory.stock.adjusted` para registrar el ajuste físico en Kardex con control optimista. |

## Reglas acordadas de negocio y arquitectura

* **Límites del archivo:** Máximo **5,000 filas** o un peso límite de **10 MB** por archivo. Archivos que excedan estos límites son rechazados en la validación inicial de cabeceras.
* **Tratamiento de campos vacíos:** Al actualizar un SKU existente, cualquier celda en blanco se interpreta como **"ignorar y conservar valor actual"**, previniendo borrados accidentales de atributos preexistentes.
* **Reporte de errores:** Se presenta un resumen consolidado en la interfaz web (total procesados, exitosos, fallidos) y se provee un botón para **descargar un archivo CSV con el reporte detallado** de cada fila rechazada y su causa.
* **Concurrencia de stock:** Las modificaciones de stock masivas operan como movimientos de ajuste en Inventario (`inventory.stock.adjusted`) con control optimista en Kardex.
* **Consistencia multi-dominio:** No se usa una transacción distribuida entre Catálogo, Pricing e Inventario. Se aplica consistencia eventual con mensajes idempotentes, reintentos y confirmaciones correlacionadas por `batch_id`/`row_id`.
* **Definición de éxito:** una fila es exitosa solo cuando todos los dominios requeridos han confirmado el cambio.
