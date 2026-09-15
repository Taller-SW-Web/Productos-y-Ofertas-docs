# Especificación: Gestión de Precios (Individuales y Masivos)

## 1. Contexto
En un marketplace multicanal de artículos deportivos (que abastece canales web, chatbot y ventas retail en tienda física), los precios de los productos fluctúan constantemente por campañas comerciales, tipo de cambio, liquidaciones de temporada deportiva o acuerdos con proveedores. El gestor comercial requiere una interfaz y mecanismos backend confiables para actualizar precios tanto de manera puntual (producto por producto) como en lote mediante archivos tabulares (CSV/Excel) para cientos de SKUs, garantizando consistencia y previniendo errores operativos que deriven en pérdidas económicas o infracciones de protección al consumidor.

## 2. Propósito
Permitir al gestor comercial actualizar y calibrar los precios base y precios de oferta de productos individuales o catálogos masivos de forma ágil, validada y con prevención de errores tipográficos o márgenes negativos.

## 3. Alcance
Incluye:
- Consulta y actualización manual del precio regular y precio de oferta de un producto individual.
- Validación de rangos comerciales permitidos (precios estrictamente mayores a cero y precio de oferta menor al precio regular).
- Carga masiva de precios mediante archivo estructurado (.csv o .xlsx).
- Previsualización, procesamiento por lotes y reporte detallado de errores fila por fila en cargas masivas.
- Emisión de eventos/notificaciones de cambio de precio para la sincronización con los canales de venta.

## 4. Requisitos

### Requisito 1: Actualización de precio individual
El sistema DEBE permitir al gestor comercial autenticado modificar el precio regular y el precio de oferta de un producto específico, validando las reglas comerciales antes de persistir los cambios.

#### Escenario: Actualización exitosa de precio individual
- DADO que el gestor comercial se encuentra autenticado con rol comercial y visualiza un producto con SKU "NK-DEP-001" con precio regular actual de S/ 120.00
- CUANDO ingresa un nuevo precio regular de S/ 150.00 y confirma la acción
- ENTONCES el sistema persiste el nuevo precio regular de S/ 150.00 en la base de datos, actualiza la fecha de modificación, solicita el registro del log de auditoría y responde con código HTTP 200 y mensaje de confirmación "Precio actualizado exitosamente".

#### Escenario: Rechazo por precio negativo o cero
- DADO que el gestor comercial edita el precio de un producto
- CUANDO ingresa un valor menor o igual a 0.00 (por ejemplo, -15.00 o 0.00) en el precio regular e intenta guardar
- ENTONCES el sistema rechaza la solicitud con código HTTP 400 (Bad Request), mantiene intactos los valores en la base de datos y muestra el mensaje de error "El precio regular debe ser un valor numérico estrictamente mayor a 0".

#### Escenario: Rechazo de precio de oferta superior al precio regular
- DADO que un producto tiene un precio regular de S/ 80.00
- CUANDO el gestor comercial intenta registrar un precio de oferta de S/ 95.00
- ENTONCES el sistema bloquea la persistencia y retorna un error de validación indicando "El precio de oferta no puede ser mayor o igual al precio regular".

### Requisito 2: Carga y actualización masiva de precios vía archivo
El sistema DEBE permitir la carga de archivos estructurados (CSV o XLSX) con listas de SKUs y nuevos precios, procesando las modificaciones de manera transaccional o por lotes validados.

#### Escenario: Procesamiento masivo de archivo válido
- DADO que el gestor comercial carga un archivo `precios_campana.csv` que contiene 250 filas válidas con cabeceras `sku`, `precio_regular` y `precio_oferta`
- CUANDO el gestor comercial confirma la ejecución de la carga masiva
- ENTONCES el sistema procesa el lote de actualización, impacta los precios en el catálogo, genera los eventos de auditoría correspondientes y devuelve un resumen con "250 productos actualizados con éxito, 0 errores".

#### Escenario: Carga masiva con filas erróneas y generación de reporte
- DADO que el archivo cargado contiene 100 filas, de las cuales 3 tienen SKUs no existentes y 2 tienen precios no numéricos o negativos
- CUANDO el gestor envía el archivo para procesamiento masivo
- ENTONCES el sistema procesa las filas válidas (o descarta el lote según la política de transacción configurada), genera un archivo descargable con el detalle de errores por número de fila y SKU ("Fila 12: SKU no encontrado", "Fila 45: Precio no válido") y notifica al usuario el consolidado de registros procesados y rechazados.

## 5. Requisitos no funcionales
- Rendimiento: La actualización de un precio individual debe responder en menos de 300 ms. La carga masiva de hasta 5,000 registros debe procesarse en un tiempo no mayor a 10 segundos utilizando tareas asíncronas / colas de procesamiento.
- Seguridad: Endpoints protegidos mediante token JWT, exigiendo rol `GESTOR_COMERCIAL` o `ADMIN_CATALOGO`. Validación rigurosa del MIME type y tamaño máximo de archivo para evitar vulnerabilidades de carga.
- Disponibilidad: Servicios diseñados sin estado (stateless) para permitir escalamiento horizontal ante picos de demanda operativa (ej. campañas Cyber).
- Integración: Tras la actualización exitosa, el sistema debe emitir eventos de dominio asíncronos para notificar a los canales dependientes y al componente de auditoría.

## 6. Fuera de alcance
- Configuración de cupones de descuento, combos y promociones 2x1 — corresponde a la capacidad de ofertas y promociones.
- Procesamiento de pagos, pasarelas y checkout — responsabilidad del canal de ventas y transaccional.
- Determinación de costos de despacho o tarifas por zona — responsabilidad del módulo de despacho y entrega.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.
