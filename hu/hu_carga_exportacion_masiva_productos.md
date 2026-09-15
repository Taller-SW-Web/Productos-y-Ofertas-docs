**Como** **gestor comercial**,

**quiero** descargar el catálogo completo y cargar archivos
en formato Excel o CSV con múltiples registros

**para** registrar nuevos productos
o actualizar masivamente los existentes (precios, stock, estado, etc.) de forma
rápida, evitando el ingreso manual uno por uno en el sistema.

## Criterios de aceptación

|  |  |
| --- | --- |
| **ID** | **Criterio** |
| **CA-01** | El sistema debe permitir al gestor descargar el catálogo actual completo o una plantilla vacía en formato Excel/CSV con las cabeceras predefinidas. |
| **CA-02** | La importación no debe requerir mapeo dinámico; el archivo subido debe respetar la estructura y formato exacto de la plantilla, de lo contrario será rechazado. |
| **CA-03** | El sistema debe utilizar un identificador único (SKU o Código de producto) para determinar la acción: si el SKU no existe, crea un nuevo producto; si el SKU existe, actualiza sus datos, previniendo duplicados. |
| **CA-04** | Solo se admitirán URLs válidas para registrar las imágenes de los productos en la carga masiva; el sistema no procesará archivos físicos adjuntos o imágenes incrustadas en el documento. |
| **CA-05** | En caso de existir errores (ej. categorías inexistentes o formatos inválidos), el sistema debe procesar y guardar los registros correctos, rechazar los inválidos y generar un reporte detallando las filas fallidas y el motivo del error. |
| **CA-06** | El procesamiento del archivo (carga y actualización) debe realizarse de manera asíncrona si es necesario, sin bloquear la interfaz del usuario, notificándole cuando el proceso haya finalizado. |
| **CA-07** | El sistema debe validar la extensión (XLSX, CSV) y el contenido del archivo subido para prevenir inyecciones de código y garantizar la seguridad. |
| **CA-08** | Debe registrarse en los logs de auditoría el usuario y la fecha en que se realizó la modificación masiva para garantizar la trazabilidad. |

## Escenarios dado-cuando-entonces

**Escenario 1: Exportación del catálogo completo**

* **DADO** que el gestor comercial se encuentra en la sección de
  carga masiva,
* **CUANDO** solicita exportar el catálogo completo de productos,
* **ENTONCES** el sistema genera y descarga un archivo Excel/CSV que
  contiene todos los productos registrados, incluyendo sus SKU, nombres,
  stock, precios, marcas, categorías y estados.

**Escenario 2: Descarga de plantilla vacía**

* **DADO** que el gestor comercial requiere registrar nuevos
  productos,
* **CUANDO** solicita descargar la plantilla de carga masiva,
* **ENTONCES** el sistema provee un archivo Excel/CSV con las
  cabeceras obligatorias requeridas (y ejemplos ilustrativos eliminables).

**Escenario 3: Carga masiva exitosa**

* **DADO** que el gestor comercial ha completado un archivo
  respetando la plantilla con 50 productos válidos,
* **CUANDO** sube el archivo al sistema y confirma la importación,
* **ENTONCES** el sistema procesa las filas, crea o actualiza los 50
  productos en la base de datos de forma asíncrona y muestra un mensaje de
  importación exitosa.

**Escenario 4: Actualización de producto existente**

* **DADO** que en el archivo importado existe una fila con un SKU
  que ya está registrado en la base de datos,
* **CUANDO** el sistema procesa dicha fila,
* **ENTONCES** el sistema actualiza la información de ese producto
  (ej. nuevo precio o cambio de estado) en lugar de crear un producto
  duplicado.

**Escenario 5: Carga masiva con errores de validación parciales**

* **DADO** que el gestor comercial intenta importar un archivo
  donde 5 registros tienen formato de precio inválido y 10 tienen una
  categoría inexistente,
* **CUANDO** el sistema procesa el archivo,
* **ENTONCES** el sistema aplica y guarda los registros que son
  correctos, rechaza los 15 registros inválidos y genera un reporte
  detallando el número de fila y el motivo del error para cada uno.

## Interacción con otros módulos

|  |  |  |  |
| --- | --- | --- | --- |
| **Módulo** | **Necesidad de interacción** | **Información que esta funcionalidad recibe** | **Información que esta funcionalidad entrega** |
| **Seguridad y Usuarios** | Verificar quién ejecuta la importación/exportación y registrar la trazabilidad. | Identidad del gestor comercial, token de sesión, roles y permisos. | Solicitudes de validación de permisos y datos para el registro en los logs de auditoría (usuario y fecha). |
| **Canales de venta (Marketplace, Chatbot, Retail)** | Reflejar de manera inmediata los cambios masivos en el catálogo. | (No hay interacción directa durante la carga, pero consumen el resultado final). | Disponibilidad inmediata de los nuevos productos, precios actualizados y stocks modificados por la carga masiva. |

## Dependencias dentro de Productos y Ofertas

Estas son coordinaciones internas con otras funcionalidades del mismo módulo
que
se activan durante el procesamiento del archivo.

|  |  |
| --- | --- |
| **Funcionalidad interna** | **Información necesaria** |
| **Gestión de categorías, subcategorías y marcas** | Nombres o identificadores declarados en el Excel/CSV para consultar a la base de datos si dichas categorías/marcas existen y son válidas antes de vincularlas al producto. |
| **Gestión de productos** | Lógica de validación, creación y actualización individual de productos que será invocada iterativamente (en bucle o por lotes) por la rutina de carga masiva. |
| **Gestión de precios (individuales)** | Reglas de negocio sobre la actualización de los precios regulares que vienen detallados en las columnas del archivo subido. |

## Reglas pendientes de acordar

* Límites del archivo: ¿Cuál será el límite máximo de
  filas (ej. 1,000 o 5,000) o el peso máximo (MB) permitido por cada archivo
  subido para evitar sobrecargar los recursos del servidor?
* Tratamiento de campos vacíos: Si al actualizar un
  producto existente el gestor deja una columna en blanco en el Excel, ¿el
  sistema debe interpretar eso como un "ignorar y dejar el valor
  actual" o como un "sobrescribir con
  valor nulo/cero"?
* Formato del reporte de errores: ¿El
  reporte de las filas fallidas se presentará directamente en una tabla
  dentro de la interfaz web o se obligará al usuario a descargar un archivo
  .txt/.csv con
  el log de errores?
* Gestión de la concurrencia en la carga: Si el gestor
  sube un archivo masivo de actualización de stock, ¿cómo se resolverá el
  conflicto si un canal de venta (ej. Retail o
  Marketplace) descuenta stock de un mismo SKU exactamente durante los
  segundos en los que el proceso asíncrono está actualizando la base de
  datos?