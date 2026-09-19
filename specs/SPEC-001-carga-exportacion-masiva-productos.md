# SPEC-001 — Especificación: Carga y exportación masiva de productos

## 1. Contexto
El gestor comercial maneja frecuentemente un volumen amplio de productos, precios y existencias en el catálogo. Modificar o ingresar cientos de registros de forma manual a través de la interfaz web resulta ineficiente. Se requiere una vía para manejar grandes volúmenes de datos usando herramientas ofimáticas estructuradas (archivos XLSX o CSV), garantizando la correcta distribución de responsabilidades entre los dominios de Catálogo, Precios (Pricing) e Inventario.

## 2. Propósito
Proporcionar una herramienta para descargar el catálogo completo en una plantilla de Excel o CSV a nivel de SKU vendible, permitir su edición sin conexión, e importar dicho archivo para registrar o actualizar masivamente los registros en el sistema de forma asíncrona y desacoplada mediante eventos de dominio.

## 3. Alcance
Incluye:
- Descarga de una plantilla vacía (Excel/CSV) con el formato predefinido de campos a nivel de SKU vendible y código de producto base.
- Exportación del catálogo actual a un archivo Excel/CSV estructurado por SKU.
- Importación asíncrona y validación por filas para creación y actualización masiva (límite de hasta 5,000 filas o 10 MB).
- Coordinación arquitectónica mediante un Worker/Job asíncrono que emite comandos/eventos idempotentes hacia Catálogo, Pricing e Inventario, correlacionados por `batch_id` y `row_id`.
- Seguimiento de estado por fila (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) y por dominio. Una fila solo se considera exitosa cuando todos los dominios requeridos confirman su procesamiento.
- Consistencia eventual: no se utiliza una transacción distribuida global entre bases de datos. Ante fallos transitorios se reintenta de forma idempotente; ante fallo definitivo la fila queda `FAILED` con el detalle del dominio afectado.
- Política de actualización de campos: las celdas en blanco en filas de actualización (SKU existente) se ignoran, preservando los valores actuales en base de datos.
- Manejo de concurrencia en stock mediante eventos de ajuste de inventario con control optimista y registro formal en Kardex.
- Generación de resumen de resultados en pantalla y descarga de un archivo CSV con el detalle de filas fallidas y motivos de rechazo.

## 4. Requisitos

### Requisito 1: Exportación del catálogo y plantilla por SKU
El sistema DEBE permitir la descarga del catálogo actual y de una plantilla vacía donde cada fila represente un SKU vendible concreto vinculado a su producto base.

#### Escenario: Exportación del catálogo completo
- DADO que el gestor comercial se encuentra en la sección de carga masiva
- CUANDO solicita exportar el catálogo completo
- ENTONCES el sistema genera y descarga un archivo Excel/CSV con todas las variantes registradas, detallando por fila: código de producto base, SKU de la variante, atributos de variante, precio vigente, stock actual, marca, categoría y estado.

#### Escenario: Descarga de plantilla vacía
- DADO que el gestor comercial requiere registrar nuevos productos y variantes
- CUANDO solicita descargar la plantilla de carga masiva
- ENTONCES el sistema provee un archivo Excel/CSV con las cabeceras requeridas predefinidas y filas de ejemplo ilustrativas eliminables.

### Requisito 2: Carga masiva asíncrona coordinada por eventos de dominio (EDA)
El sistema DEBE procesar el archivo mediante un Worker asíncrono que valide la estructura y emita eventos de dominio independientes hacia cada submódulo correspondiente.

#### Escenario: Carga masiva exitosa coordinada por eventos
- DADO que el gestor comercial sube un archivo con hasta 5,000 filas válidas respetando la plantilla
- CUANDO confirma la importación
- ENTONCES el sistema encola la tarea, asigna `batch_id`/`row_id`, emite mensajes idempotentes a los dominios requeridos y espera sus confirmaciones; solo marca una fila `COMPLETED` cuando todos los consumidores requeridos confirman su aplicación.

#### Escenario: Carga masiva con errores parciales y reporte detallado
- DADO que el gestor comercial importa un archivo donde 5 registros tienen formato de precio inválido y 10 tienen una categoría inexistente
- CUANDO el Worker procesa el archivo
- ENTONCES el sistema aplica y emite eventos para los registros válidos, descarta los 15 registros erróneos, muestra un resumen de éxitos/fallos en la pantalla y genera un archivo CSV descargable con el número de fila y causa exacta del fallo.

### Requisito 3: Actualización masiva, preservación de datos y concurrencia
El sistema DEBE actualizar los datos cuando el SKU ya existe, conservando los datos no especificados y gestionando la concurrencia de stock sin bloquear las ventas.

#### Escenario: Actualización con celdas vacías (preservación de datos)
- DADO que en el archivo importado existe una fila con un SKU existente donde la columna de descripción está vacía pero el precio y stock fueron modificados
- CUANDO el sistema procesa la fila
- ENTONCES el sistema actualiza el precio y stock correspondientes, pero conserva intacta la descripción actual del producto en el catálogo.

#### Escenario: Concurrencia de stock durante la importación masiva
- DADO que se está procesando una actualización masiva de stock para un SKU específico
- CUANDO un canal de venta descuenta stock de ese mismo SKU en el mismo instante
- ENTONCES el sistema procesa la venta sin bloqueos pesimistas y el evento `inventory.stock.adjusted` registra el conteo físico en Kardex aplicando control de concurrencia optimista para garantizar la trazabilidad del saldo final.

## 5. Requisitos no funcionales
- Rendimiento: La importación debe soportar archivos de hasta 5,000 filas o 10 MB, ejecutándose de forma asíncrona en un Worker desacoplado sin degradar los tiempos de respuesta de la API principal ni bloquear la UI.
- Arquitectura y Desacoplamiento (EDA): la carga masiva no escribe tablas ajenas ni usa transacción distribuida global; coordina mediante mensajes idempotentes, correlación por `batch_id`/`row_id`, reintentos y confirmaciones por dominio.
- Seguridad: Validación estricta del tipo MIME, cabeceras estructuradas (XLSX, CSV) y desinfección de celdas para prevenir inyecciones de fórmulas (CSV/Excel Formula Injection).
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
