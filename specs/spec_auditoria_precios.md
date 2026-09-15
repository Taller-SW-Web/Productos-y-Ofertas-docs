# Especificación: Historial de Auditoría de Precios (Log)

## 1. Contexto
En una plataforma de comercio multicanal donde interactúan diversos administradores comerciales, los errores en la asignación de precios o modificaciones no coordinadas conllevan pérdidas de margen considerables o contingencias legales por publicidad engañosa. Para asegurar el control interno, la rendición de cuentas y la detección inmediata de incidencias, se requiere un mecanismo de registro inmutable que documente en tiempo real quién realizó el cambio, cuándo se ejecutó, el valor previo y nuevo, y la dirección IP de procedencia de la petición.

## 2. Propósito
Registrar automáticamente y de forma inmutable cada modificación de precio aplicada a cualquier producto (quién, cuándo, valor anterior, valor nuevo y dirección IP), proporcionando a los auditores y gestores comerciales trazabilidad total para control y prevención de errores.

## 3. Alcance
Incluye:
- Intercepción y registro automático ante actualizaciones de precio individuales o masivas.
- Captura de información contextual: ID de producto, SKU, precio anterior, precio nuevo, tipo de precio (regular/oferta), identificador de usuario, correo del usuario, timestamp en UTC e IP del cliente.
- Consulta paginada y filtrado del historial de auditoría por SKU, rango de fechas y usuario responsable.
- Restricción estricta de inmutabilidad (la bitácora no admite modificaciones ni eliminaciones por ningún canal de API).

## 4. Requisitos

### Requisito 1: Registro automático de evento de cambio de precio
El sistema DEBE interceptar toda operación de cambio de precio exitosa y persistir de manera desacoplada o transaccional un registro histórico completo con los datos de auditoría y red.

#### Escenario: Registro de auditoría ante cambio de precio exitoso
- DADO que un usuario comercial con sesión iniciada (ID: "usr_204", email: "gestor@tienda.com") y dirección IP "200.48.85.10" modifica el precio del SKU "AD-ZAP-09" de S/ 220.00 a S/ 260.00 a las "2026-09-04 18:20:00"
- CUANDO el microservicio completa con éxito la transacción de cambio de precio
- ENTONCES el sistema inserta en el log de auditoría un registro con `sku: "AD-ZAP-09"`, `precio_anterior: 220.00`, `precio_nuevo: 260.00`, `usuario_id: "usr_204"`, `usuario_email: "gestor@tienda.com"`, `ip_origen: "200.48.85.10"` y `timestamp: "2026-09-04T18:20:00Z"`.

#### Escenario: Omisión de registro ante operación fallida o rechazada
- DADO que un usuario intenta modificar un precio pero la solicitud es rechazada por regla de negocio (ej. precio negativo) o error de base de datos
- CUANDO el controlador captura la excepción e interrumpe la ejecución
- ENTONCES el sistema no genera ningún registro en la tabla de auditoría, preservando la coherencia del historial únicamente con cambios efectivamente persistidos.

### Requisito 2: Consulta y filtrado del log de auditoría
El sistema DEBE proveer endpoints y vistas de consulta para inspeccionar cronológicamente las variaciones de precios registradas.

#### Escenario: Consulta filtrada por SKU y rango de fechas
- DADO que existen 8 modificaciones registradas para el SKU "BALON-FUT-N5" durante el último mes
- CUANDO el gestor o auditor consulta el historial filtrando por el SKU "BALON-FUT-N5" y el rango del último mes
- ENTONCES el sistema entrega la lista ordenada descendentemente (del cambio más reciente al más antiguo) con los metadatos de usuario, IP, fechas y valores previos/nuevos con paginación funcional.

#### Escenario: Consulta sin coincidencias
- DADO que un SKU no ha tenido variaciones de precio o los filtros de búsqueda no arrojan resultados
- CUANDO se ejecuta la consulta de historial
- ENTONCES el sistema retorna una respuesta HTTP 200 con una lista vacía (`[]`) y metadatos de total de elementos igual a 0, mostrando en la interfaz el mensaje "No se registraron cambios de precio bajo los criterios seleccionados".

### Requisito 3: Inmutabilidad de la bitácora de auditoría
El sistema DEBE asegurar que los registros de auditoría sean de naturaleza append-only, impidiendo su edición o eliminación.

#### Escenario: Intento de alteración o borrado de un registro
- DADO que un usuario o cliente HTTP intenta invocar los métodos `DELETE`, `PUT` o `PATCH` sobre la ruta `/api/v1/auditoria-precios/{id}`
- CUANDO el servidor recibe la solicitud
- ENTONCES el sistema deniega la operación con código HTTP 405 (Method Not Allowed) o 403 (Forbidden), garantizando que ningún registro histórico pueda ser alterado o removido.

## 5. Requisitos no funcionales
- Rendimiento: La persistencia del log de auditoría no debe sumar más de 50 ms a la operación de precio ni bloquear la respuesta al usuario (procesamiento mediante eventos `@Async` o colas de mensajería).
- Seguridad: Extracción certera de la IP cliente considerando capas de reverse proxy, CDN o API Gateway (revisión de cabeceras `X-Forwarded-For` y `X-Real-IP`).
- Integridad: Permisos de base de datos restringidos a nivel de conexión para admitir únicamente sentencias `SELECT` e `INSERT` sobre la tabla de log.
- Retención: Almacenamiento garantizado de registros históricos por un periodo mínimo de 12 a 24 meses para fines de auditoría interna y legal.

## 6. Fuera de alcance
- Registro de auditoría de autenticaciones, inicios de sesión o cambios de contraseña — responsabilidad del módulo de Seguridad y autenticación de usuarios.
- Auditoría de modificaciones en fichas técnicas, categorías o imágenes de productos — responsabilidad de la auditoría general de catálogo.
- Reversión automática de precio (Rollback) directo desde el log — cualquier corrección de precio se realiza a través del flujo formal de gestión de precios.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos están implementados.
- Todos los escenarios definidos se cumplen.
- Los requisitos no funcionales aplicables se cumplen.
- No se han incorporado funcionalidades fuera del alcance.
