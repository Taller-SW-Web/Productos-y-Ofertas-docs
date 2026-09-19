# SPEC-014 — Especificación: Historial de auditoría de precios

## 1. Contexto
En una plataforma de comercio multicanal donde interactúan diversos administradores comerciales, los errores en la asignación de precios o modificaciones no coordinadas conllevan pérdidas de margen considerables o contingencias legales por publicidad engañosa. Para asegurar el control interno, la rendición de cuentas y la detección inmediata de incidencias, se requiere un mecanismo de registro inmutable que documente en tiempo real quién realizó el cambio, cuándo se ejecutó, el valor previo y nuevo, la variación porcentual, el motivo comercial, el canal de origen, el identificador de lote y la dirección IP de procedencia de la petición.

## 2. Propósito
Registrar automáticamente y de forma inmutable cada modificación de precio aplicada a cualquier producto (quién, cuándo, valor anterior, valor nuevo, variación %, motivo, canal e IP), proporcionando a auditores y gestores trazabilidad total, opciones de exportación estructurada y cumplimiento de retención legal.

## 3. Alcance
Incluye:
- Intercepción y consumo desacoplado de eventos ante actualizaciones individuales o masivas de precios.
- Captura de contrato de auditoría completo: `id_auditoria`, `sku`, `product_id`, `tipo_precio`, `precio_anterior` (nullable si `tipo_operacion=CREACION`), `precio_nuevo` (nullable si `tipo_operacion=RETIRO_OFERTA`), `variacion_porcentual` (nullable si `tipo_operacion=CREACION|RETIRO_OFERTA`), `tipo_operacion`, `canal_origen`, `motivo_cambio`, `batch_id`, `usuario_id`, `usuario_email`, `ip_origen` y `timestamp` en UTC.
- Consulta paginada y filtrado del log por SKU, rango de fechas, usuario responsable, canal y lote.
- Exportación de registros de auditoría en formato CSV (hasta 100,000 filas para análisis masivo) y PDF (hasta 500 filas para reportes ejecutivos de control).
- Política de ciclo de vida: al menos 24 meses completos en base operativa; archivado mensual verificado de datos que ya cumplieron ese plazo, seguido de cinco años en frío contados desde el archivado.
- Inmutabilidad estricta (patrón Append-Only; prohibición de `PUT`, `PATCH`, `DELETE`).

## 4. Requisitos

### Requisito 1: Registro automático de evento de cambio de precio
El sistema DEBE consumir de manera asíncrona los eventos de cambio de precio y persistir el registro de auditoría con el contrato completo homologado sin penalizar el flujo de escritura del motor de precios.

#### Escenario: Registro de auditoría con contrato completo
- DADO que un usuario comercial con sesión iniciada (`usr_204`, `gestor@tienda.com`), desde la IP "200.48.85.10" y a través del canal "BACKOFFICE", modifica el precio regular del SKU "AD-ZAP-09" de S/ 200.00 a S/ 250.00 con el motivo "Ajuste de margen"
- CUANDO el microservicio de precios completa la mutación y emite el evento de dominio
- ENTONCES el suscriptor de auditoría inserta de forma desacoplada un registro con:
  - `sku: "AD-ZAP-09"`
  - `precio_anterior: 200.00`
  - `precio_nuevo: 250.00`
  - `variacion_porcentual: +25.00`
  - `motivo_cambio: "Ajuste de margen"`
  - `canal_origen: "BACKOFFICE"`
  - `batch_id: null`
  - `usuario_id: "usr_204"`
  - `usuario_email: "gestor@tienda.com"`
  - `ip_origen: "200.48.85.10"`
  - `timestamp: [timestamp UTC actual]`
- Y la persistencia no añade más de 50 ms a la respuesta entregada al usuario comercial.

#### Escenario: Omisión de registro ante operación fallida o rechazada
- DADO que un usuario intenta modificar un precio pero la solicitud es rechazada por regla de negocio (ej. precio negativo o ausencia de motivo)
- CUANDO el controlador de precios interrumpe la ejecución y no persiste la entidad
- ENTONCES no se emite ningún evento de cambio de precio y el sistema de auditoría no genera ningún registro, conservando únicamente las mutaciones efectivamente aplicadas.

### Requisito 2: Consulta, filtrado y exportación de la bitácora
El sistema DEBE proveer endpoints y vistas de consulta para inspeccionar cronológicamente las variaciones de precios y exportar los resultados según el volumen requerido.

#### Escenario: Consulta filtrada multicriterio
- DADO que existen registros de cambios de precio para el SKU "BALON-FUT-N5"
- CUANDO el auditor consulta el historial filtrando por SKU "BALON-FUT-N5", rango del último mes y canal "BULK_IMPORT"
- ENTONCES el sistema entrega la lista paginada ordenada descendentemente (del más reciente al más antiguo) en un tiempo inferior a 800 ms.

#### Escenario: Exportación masiva en formato CSV
- DADO que un auditor requiere analizar 15,000 cambios de precio ocurridos durante el último semestre
- CUANDO solicita la exportación en formato CSV aplicando el rango de fechas correspondiente
- ENTONCES el sistema genera de forma asíncrona un archivo `.csv` con todas las columnas del contrato completo de auditoría y provee un enlace seguro para su descarga.

#### Escenario: Exportación ejecutiva en formato PDF
- DADO que el auditor requiere presentar un informe de control de un SKU específico que contiene 45 modificaciones de precio
- CUANDO solicita la exportación en formato PDF con un rango menor o igual a 500 registros
- ENTONCES el sistema genera un documento PDF formateado, con membrete de control interno, resumen de variaciones y marcas temporales auditadas.

### Requisito 3: Inmutabilidad estricta y seguridad de acceso
El sistema DEBE asegurar que los registros de auditoría sean estrictamente de solo lectura y adición (*Append-Only*), impidiendo cualquier actualización o borrado físico/lógico.

#### Escenario: Intento de alteración o borrado de un registro
- DADO que un usuario o proceso intenta invocar los métodos `DELETE`, `PUT` o `PATCH` sobre `/api/v1/auditoria-precios/{id}`
- CUANDO el servidor recibe la solicitud
- ENTONCES el sistema deniega la operación con código HTTP 405 (Method Not Allowed) o 403 (Forbidden), garantizando que ningún registro histórico pueda ser alterado o removido.

### Requisito 4: Precio inicial, integridad e idempotencia
El primer precio regular o primera oferta es `CREACION` con `precio_anterior=null` y variación `null`. Una modificación entre importes existentes es `MODIFICACION` y calcula la variación. El retiro explícito de una oferta usa `RETIRO_OFERTA` con `precio_nuevo=null` y variación `null`, según Requisito 6. `event_id` es único por registro de evento procesado; si llega un duplicado, no se crea otro asiento. Auditoría nunca ejecuta comandos para modificar precios.

### Requisito 5: Archivo verificable
Cada ejecución mensual selecciona solo registros con antigüedad mayor o igual a 24 meses completos. Exporta Parquet, verifica conteo/checksum y recuperabilidad antes de retirar registros del almacenamiento caliente mediante credenciales de mantenimiento aisladas. La conexión habitual de Auditoría conserva permisos INSERT/SELECT y nunca borra ni actualiza asientos; una exportación fallida conserva los registros originales. En frío se retienen cinco años desde el archivado. El plazo operativo puede exceder 24 meses hasta la siguiente ejecución mensual, nunca ser inferior.

### Requisito 6: Auditar alta y retiro de oferta sin inventar importes
El alta del **primer** precio regular o de una **nueva** oferta de Pricing registra `tipo_operacion=CREACION`, `precio_anterior=null` y `variacion_porcentual=null`, con `precio_nuevo` positivo. Cuando Pricing retira expresamente una oferta con `accion_precio_oferta=ELIMINAR`, emite `pricing.price.changed` tras el commit con `tipo_precio=OFERTA`, `tipo_operacion=RETIRO_OFERTA`, `precio_anterior` igual a la oferta retirada, `precio_nuevo=null` y `variacion_porcentual=null`: un precio inexistente no equivale a cero y no admite variación porcentual comercial. Toda modificación entre importes existentes utiliza `tipo_operacion=MODIFICACION`, `precio_anterior`/`precio_nuevo` no nulos y variación calculada. La consulta y exportación representan importes nulos como «Sin oferta» o vacío tipado, nunca `0`. Los eventos se deduplican por `event_id` y su auditoría sigue siendo append-only.

#### Escenario: Retiro explícito de oferta
- DADO un SKU con `precio_oferta=170` y un cambio autorizado que usa `accion_precio_oferta=ELIMINAR`
- CUANDO Pricing confirma la retirada
- ENTONCES Auditoría registra un único evento `OFERTA/RETIRO_OFERTA`, `precio_anterior=170`, `precio_nuevo=null` y variación `null`; no elimina ni modifica registros anteriores.

## 5. Requisitos no funcionales
- Rendimiento: La captura y persistencia del log de auditoría no debe añadir más de 50 ms a la operación de precios (arquitectura orientada a eventos mediante el broker acordado y Outbox). La consulta paginada debe responder en menos de 800 ms.
- Seguridad: Extracción certera de la IP cliente considerando capas de reverse proxy, CDN o API Gateway (revisión obligatoria de `X-Forwarded-For` y `X-Real-IP`). Acceso restringido exclusivamente a roles `ADMIN_SISTEMA` o `AUDITOR_COMERCIAL`.
- Integridad: Conexión de base de datos del servicio de auditoría configurada con permisos exclusivos de `INSERT` y `SELECT` sobre la tabla de auditoría.
- Política de Retención: cada registro permanece al menos 24 meses completos en caliente. Un proceso mensual archiva únicamente registros ya elegibles, verifica integridad y recuperabilidad del Parquet antes de retirar su copia caliente, y conserva el archivo cinco años adicionales desde el archivado. No se afirma cumplimiento de una ley específica sin validación legal.

## 6. Fuera de alcance
- Auditoría de inicios de sesión o autenticación de usuarios — responsabilidad del módulo de identidad y seguridad.
- Auditoría de cambios sobre imágenes, títulos o descripciones de catálogo — responsabilidad de la bitácora de productos.
- Rollback automático de precios desde la interfaz de auditoría — cualquier reversión debe ejecutarse mediante el flujo formal de gestión de precios.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos funcionales y de exportación están implementados.
- El contrato completo de eventos se encuentra homologado y persistido.
- La política de retención de 24 meses y archivado posterior está configurada.
- No se han incorporado funcionalidades fuera de alcance.

---
