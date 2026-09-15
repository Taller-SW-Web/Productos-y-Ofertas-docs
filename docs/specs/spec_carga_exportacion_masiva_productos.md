# Especificación: Carga y Exportación Masiva (Excel/CSV)

## 1. Contexto
El gestor comercial maneja frecuentemente un volumen amplio de productos, precios y existencias en el catálogo. Modificar o ingresar cientos de registros de forma manual a través de la interfaz web (uno por uno) resulta ineficiente. Se requiere una vía para manejar grandes volúmenes de datos usando herramientas ofimáticas tradicionales (como Excel o archivos CSV).

## 2. Propósito
Proporcionar una herramienta para descargar el catálogo completo en una plantilla de Excel o CSV, permitir su edición sin conexión, y posteriormente importar dicho archivo para registrar o actualizar productos en bloque en el sistema.

## 3. Alcance
Incluye:
- Descarga de una plantilla vacía (Excel/CSV) con el formato predefinido de campos.
- Exportación del catálogo actual de productos a un archivo Excel/CSV.
- Importación y validación del archivo para la creación masiva de nuevos productos.
- Importación y validación del archivo para la actualización masiva de productos existentes (ej. actualización de precios, estado o stock).
- Generación de un reporte de resultados (éxitos y errores detallados) tras procesar la carga masiva.

## 4. Requisitos

### Requisito 1: Exportación del catálogo y plantilla
El sistema DEBE permitir la descarga del catálogo actual de productos y de una plantilla vacía.

#### Escenario: Exportación del catálogo completo
- DADO que el gestor comercial se encuentra en la sección de carga masiva
- CUANDO solicita exportar el catálogo completo de productos
- ENTONCES el sistema genera y descarga un archivo Excel/CSV con todos los productos registrados, incluyendo sus identificadores únicos (SKU), nombre, stock, precio, marca, categoría y estado.

#### Escenario: Descarga de plantilla vacía
- DADO que el gestor comercial requiere registrar nuevos productos
- CUANDO solicita descargar la plantilla de carga masiva
- ENTONCES el sistema provee un archivo Excel/CSV con las cabeceras requeridas, sin datos o con ejemplos ilustrativos eliminables.

### Requisito 2: Carga e importación en bloque
El sistema DEBE procesar un archivo Excel/CSV para registrar o actualizar múltiples productos simultáneamente.

#### Escenario: Carga masiva exitosa
- DADO que el gestor comercial ha modificado un archivo con 50 productos válidos
- CUANDO sube el archivo al sistema y confirma la importación
- ENTONCES el sistema procesa las filas, crea o actualiza los 50 productos en la base de datos y muestra un mensaje de importación exitosa.

#### Escenario: Carga masiva con errores de validación
- DADO que el gestor comercial intenta importar un archivo donde 5 registros tienen formato de precio inválido y 10 tienen una categoría inexistente
- CUANDO el sistema procesa el archivo
- ENTONCES el sistema aplica los registros que son correctos, rechaza los 15 registros inválidos y genera un reporte detallando las filas que fallaron y el motivo del error correspondiente a cada una.

### Requisito 3: Prevención de duplicidad y actualización
El sistema DEBE evitar la creación de productos duplicados durante la importación, y permitir su actualización mediante un identificador único (SKU o Código de producto).

#### Escenario: Actualización de producto existente
- DADO que en el archivo importado existe una fila con un SKU que ya está registrado en la base de datos
- CUANDO el sistema procesa dicha fila
- ENTONCES el sistema actualiza la información de ese producto (ej. nuevo precio, estado activo/inactivo) en lugar de crear un producto nuevo.

## 5. Requisitos no funcionales
Incluir únicamente los que apliquen a esta capacidad.
- Rendimiento: La carga y procesamiento de un archivo grande debe ejecutarse sin bloquear la interfaz. Si toma mucho tiempo, debe procesarse de manera asíncrona en el backend (Node.js/Java/.Net) e informar al usuario cuando finalice.
- Seguridad: El archivo subido debe ser validado estrictamente para evitar inyecciones y garantizar que sea un documento con formato estructurado permitido (XLSX, CSV).
- Trazabilidad: Registrar el usuario (gestor comercial) y fecha de las modificaciones masivas en los logs de la base de datos.

## 6. Fuera de alcance
- Carga masiva de los archivos físicos de las imágenes (solo se aceptarán URLs de imágenes pre-subidas dentro de la carga masiva de Excel/CSV).
- Mapeo dinámico de columnas (el archivo debe respetar la estructura exacta de la plantilla proveída por el sistema).

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.
