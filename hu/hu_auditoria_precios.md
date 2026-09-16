# Historia de Usuario: Historial de Auditoría de Precios (Price Audit Log)

---

## 1. Historia de Usuario Principal

| Parámetro | Detalle |
| :--- | :--- |
| **Rol (Como)** | Gestor Comercial / Auditor Interno |
| **Acción (Quiero)** | Registrar de forma automática e inmutable cada cambio de precio y consultar el historial cronológico filtrado por SKU, usuario y rango de fechas |
| **Beneficio (Para)** | Contar con trazabilidad absoluta de las modificaciones de precios (quién, cuándo, valor anterior, valor nuevo, IP de origen), garantizando control interno y resolviendo contingencias comerciales o legales |

---

## 2. Criterios de Aceptación

| ID | Criterio |
| :---: | :--- |
| **CA-01** | **Captura Automática y Desacoplada:** Toda modificación exitosa de precios (individual o masiva) debe interceptarse y registrarse en la bitácora mediante eventos asíncronos (`@Async` o colas de mensajería). La captura no debe bloquear la respuesta al usuario ni sumar más de 50 ms a la operación de precios. |
| **CA-02** | **Contrato Completo de Auditoría:** Cada registro de auditoría debe capturar de forma mandatoria: `id_auditoria`, `sku` (e ID de producto), `tipo_precio` (`REGULAR` u `OFERTA`), `precio_anterior`, `precio_nuevo`, `variacion_porcentual`, `usuario_id`, `usuario_email`, `ip_origen` (resolviendo cabeceras `X-Forwarded-For` o `X-Real-IP`), `timestamp` (UTC) y `batch_id` (si provino de carga masiva). |
| **CA-03** | **Omisión ante Operaciones Fallidas:** Si una actualización de precio es rechazada por validación de negocio (ej. precio negativo, oferta mayor al regular) o fallo de base de datos, el sistema no debe generar ningún registro en la auditoría. Solo se auditan cambios efectivamente aplicados. |
| **CA-04** | **Inmutabilidad Estricta (Append-Only):** La tabla/almacén de auditoría solo admite operaciones `INSERT` y `SELECT`. Cualquier intento de invocar métodos `PUT`, `PATCH` o `DELETE` sobre los endpoints de auditoría debe ser rechazado inmediatamente con HTTP `405 Method Not Allowed` o `403 Forbidden`. |
| **CA-05** | **Consulta y Filtrado Multicriterio:** El sistema debe proveer endpoints y vistas de consulta para inspeccionar el historial cronológico descendente (del más reciente al más antiguo), permitiendo filtrar por: `sku`, rango de fechas/horas (`fecha_desde` / `fecha_hasta`) e identificador o correo de usuario. |
| **CA-06** | **Paginación y Manejo de Vacíos:** La consulta debe ser paginada y devolver una respuesta estructurada en menos de 800 ms. Si no existen registros o el filtro no produce coincidencias, retorna HTTP `200 OK` con un arreglo vacío (`[]`) y total de elementos 0, mostrando en UI el mensaje: "No se registraron cambios de precio bajo los criterios seleccionados". |
| **CA-07** | **Seguridad y Accesos:** La consulta del historial de auditoría está restringida exclusivamente a usuarios autenticados con rol `GESTOR_COMERCIAL` (con privilegios de auditoría) o administradores del sistema. |
| **CA-08** | **Política de Retención Garantizada:** Los registros históricos deben conservarse en la base de datos operativa por un periodo mínimo garantizado de 12 a 24 meses antes de su archivado o depuración legal. |

---

## 3. Escenarios (Dado - Cuando - Entonces / Gherkin)

### Escenario 1: Registro automático de auditoría ante cambio exitoso
* **Dado** que el gestor comercial autenticado con ID `usr_204`, correo `gestor@tienda.com` y desde la IP `200.48.85.10` modifica el precio regular del SKU `AD-ZAP-09` de S/ 220.00 a S/ 260.00 a las `2026-09-04 18:20:00`,
* **Cuando** el microservicio de precios persiste la actualización con éxito,
* **Entonces** el sistema registra de manera asíncrona en el log de auditoría una entrada con: `sku: "AD-ZAP-09"`, `tipo_precio: "REGULAR"`, `precio_anterior: 220.00`, `precio_nuevo: 260.00`, `variacion_porcentual: +18.18%`, `usuario_id: "usr_204"`, `usuario_email: "gestor@tienda.com"`, `ip_origen: "200.48.85.10"` y `timestamp: "2026-09-04T18:20:00Z"`, sin añadir más de 50 ms a la respuesta del cliente.

### Escenario 2: Omisión de registro ante cambio fallido
* **Dado** que un gestor intenta registrar un precio de oferta de S/ 100.00 para un producto cuyo precio regular es S/ 90.00,
* **Cuando** la regla de negocio rechaza la operación e interrumpe la ejecución con HTTP 400,
* **Entonces** el sistema no emite ni persiste ningún evento en la bitácora de auditoría.

### Escenario 3: Trazabilidad de modificación originada por carga masiva
* **Dado** que se ejecuta una carga masiva mediante el archivo `precios_campana.csv` generando el identificador `batch_id: BATCH-3301`,
* **Cuando** se aplican las modificaciones a los SKUs incluidos en el lote,
* **Entonces** el sistema genera una entrada de auditoría individual por cada SKU actualizado, asociando a cada una el identificador `batch_id: BATCH-3301`, la IP y el usuario que cargó el archivo.

### Escenario 4: Consulta filtrada por SKU y rango de fechas
* **Dado** que existen variaciones de precio registradas para el SKU `BALON-FUT-N5` durante el último mes,
* **Cuando** el auditor consulta el historial filtrando por el SKU `BALON-FUT-N5` y el rango de fechas respectivo,
* **Entonces** el sistema responde con la lista ordenada cronológicamente de forma descendente, detallando los valores previos, valores nuevos, usuario responsable, IP y timestamp de cada cambio.

### Escenario 5: Consulta sin coincidencias
* **Dado** que un SKU no ha tenido variaciones de precio o el filtro por usuario no encuentra registros,
* **Cuando** se ejecuta la consulta en la interfaz de auditoría,
* **Entonces** el sistema retorna HTTP 200 con un arreglo vacío (`[]`) y total de elementos en 0, desplegando el mensaje "No se registraron cambios de precio bajo los criterios seleccionados".

### Escenario 6: Intento de alteración o borrado de bitácora (Inmutabilidad)
* **Dado** que un usuario o proceso intenta invocar los métodos HTTP `DELETE`, `PUT` o `PATCH` sobre el endpoint `/api/v1/auditoria-precios/{id}`,
* **Cuando** el servidor recibe la solicitud,
* **Entonces** el sistema bloquea la acción denegando el acceso con código HTTP 405 Method Not Allowed o 403 Forbidden, preservando intacta la bitácora.

---

## 4. Matriz de Interacción con Otros Módulos

| Módulo | Necesidad de Interacción | Información que Recibe | Información que Entrega |
| :--- | :--- | :--- | :--- |
| **Seguridad y Usuarios** | Validar identidad, correo y privilegios de auditoría de los usuarios. | Token JWT con `sub`, `email`, rol y permisos. | Registro de intentos de acceso denegados a la bitácora. |
| **Ventas y Postventa** | Esclarecer discrepancias de precios reportadas en reclamos o liquidaciones de pedidos. | SKU del producto y fecha/hora exacta de la compra. | Detalle del precio registrado en dicho momento histórico y trazabilidad del cambio precedente y posterior. |
| **Canal Marketplace / Retail / Chatbot** | Desacoplado operativamente de auditoría por razones de rendimiento. | Ninguna. | Ninguna. |

---

## 5. Dependencias del Dominio (Productos y Ofertas)

* **Gestión de precios (Responsabilidad emisora):**
  * *Datos requeridos:* Evento de confirmación de precio actualizado conteniendo: SKU, tipo de precio, precio anterior, precio nuevo, datos del usuario, IP de la petición HTTP y batch_id si aplica.
  * *Propósito:* Disparar la persistencia desacoplada de la bitácora histórica.
* **Gestión de productos:**
  * *Datos requeridos:* Identificador único y SKU del producto.
  * *Propósito:* Garantizar consistencia relacional del ítem auditado frente al catálogo.

---

## 6. Reglas de Negocio Pendientes de Definición

- [ ] **Mecanismo de archivado tras el periodo de retención:** Definir la estrategia técnica al cumplir los 24 meses de retención (ej. volcado automático a almacenamiento en frío S3/Cloud Storage en formato Parquet o particionamiento de base de datos relacional).
- [ ] **Estrategia de alertas proactivas:** Definir si además de registrar el log pasivo, el componente debe disparar notificaciones en tiempo real (vía correo o webhook) ante caídas atípicas de precio mayores al 50%.
