# Historia de Usuario: Gestión de Precios Individuales y Masivos

---

## 1. Historia de Usuario Principal

| Parámetro | Detalle |
| :--- | :--- |
| **Rol (Como)** | Gestor Comercial |
| **Acción (Quiero)** | Actualizar y programar precios de forma individual y mediante procesamiento por lotes (archivo masivo), manteniendo un registro histórico inmutable y auditable de cada cambio |
| **Beneficio (Para)** | Garantizar que los canales de venta consulten precios exactos y vigentes, asegurando trazabilidad ante fluctuaciones comerciales y minimizando errores operativos en el catálogo deportivo |

> **Nota:** La fijación de precios contempla un valor base mayor a cero en moneda oficial (PEN), manejo de fechas de vigencia programada y un mecanismo de auditoría transaccional para evitar inconsistencias en compras concurrentes.

---

## 2. Criterios de Aceptación

| ID | Criterio |
| :---: | :--- |
| **CA-01** | **Seguridad y Permisos:** Solo un gestor comercial autenticado y con permisos explícitos de administración de precios puede consultar historiales, actualizar importes individuales o subir lotes de actualización. Cualquier petición no autorizada debe ser rechazada con código HTTP `401` o `403`. |
| **CA-02** | **Actualización Individual:** Debe permitir registrar el nuevo precio de un producto indicando: identificador de producto, nuevo precio regular, fecha/hora de inicio de vigencia (opcional: fecha fin) y motivo del cambio. El precio debe ser un número positivo mayor a 0 (dos decimales). |
| **CA-03** | **Procesamiento por Lotes (Masivo):** El sistema debe permitir la carga de archivos estructurados (CSV/Excel) con columnas mínimas: `SKU / product_id`, `precio_nuevo`, `fecha_vigencia_desde`, `motivo`. El procesamiento debe ejecutarse en segundo plano (asíncrono) para no bloquear la interfaz ante archivos extensos. |
| **CA-04** | **Validación y Resiliencia del Lote:** Durante la carga masiva, el sistema debe validar formato, existencia de los productos y valores positivos fila por fila. Debe generarse un reporte consolidado con: total procesados, total exitosos, total fallidos y detalle del motivo de error por fila (ej. "SKU inexistente", "Precio menor o igual a 0"). |
| **CA-05** | **Auditoría e Inmutabilidad:** Todo cambio de precio (individual o por lote) debe registrarse en una tabla/colección de auditoría histórica que almacene: `producto_id`, `precio_anterior`, `precio_nuevo`, `usuario_id`, `fecha_hora_modificacion`, `tipo_operacion` (Individual / Lote), `archivo_origen_id` (si aplica) e `ip_origen`. Este registro es de solo lectura (no editable ni eliminable). |
| **CA-06** | **Consulta de Precio Vigente:** El motor debe exponer un endpoint/interfaz para consultar el precio oficial de un producto a una fecha/hora dada. Si no existe un precio programado a futuro, rige el último precio consolidado en vigencia. |
| **CA-07** | **Atomicidad y Concurrencia:** La actualización individual debe operar bajo transacciones aisladas para impedir condiciones de carrera. En operaciones masivas, cada fila válida se procesa como una unidad transaccional independiente o con opción de rollback completo según el modo de carga seleccionado. |

---

## 3. Escenarios (Dado - Cuando - Entonces / Gherkin)

### Escenario 1: Actualizar precio individual exitosamente
* **Dado** que el gestor comercial cuenta con permisos y el producto con SKU `DEP-101` existe en el catálogo,
* **Cuando** ingresa un nuevo precio de S/ 149.90 con vigencia inmediata y motivo "Ajuste de temporada",
* **Entonces** el sistema actualiza el precio vigente del producto, genera el registro de auditoría correspondiente con el precio previo y el usuario responsable, y confirma la actualización.

### Escenario 2: Rechazar precio individual inválido
* **Dado** que el gestor comercial intenta modificar el precio de un producto,
* **Cuando** introduce un monto menor o igual a 0 (ej. S/ -15.00) o un valor no numérico,
* **Entonces** el sistema bloquea la transacción, no altera el precio actual y emite una alerta indicando que el precio debe ser un valor decimal estrictamente positivo.

### Escenario 3: Carga masiva procesada de manera asíncrona
* **Dado** que el gestor comercial sube un archivo CSV con 500 cambios de precio de zapatillas deportivas,
* **Cuando** el sistema recibe y valida la estructura del archivo,
* **Entonces** responde con un identificador de tarea (`job_id`) en estado "En proceso", ejecuta la validación/actualización por lotes en segundo plano y notifica cuando la tarea finaliza.

### Escenario 4: Carga masiva con errores parciales
* **Dado** que el archivo masivo contiene 100 filas, donde 95 tienen datos correctos y 5 contienen SKUs inexistentes o precios negativos,
* **Cuando** finaliza el procesamiento del lote,
* **Entonces** el sistema aplica las 95 actualizaciones válidas, registra en auditoría dichos cambios y genera un archivo descargable con el reporte de inconsistencias de las 5 filas erróneas para su corrección.

### Escenario 5: Consulta de auditoría histórica
* **Dado** que un gestor comercial o auditor necesita verificar la trazabilidad de un producto de alta rotación,
* **Cuando** consulta el historial de precios del producto `DEP-200`,
* **Entonces** el sistema retorna la línea de tiempo completa en orden cronológico inverso, detallando fechas, precios anteriores, nuevos valores, usuario responsable y tipo de ajuste.

### Escenario 6: Rechazo de acceso por falta de permisos (Seguridad)
* **Dado** que un usuario sin rol de administrador comercial (ej. un vendedor de tienda física o cliente) intenta emitir un payload a la API de actualización de precios,
* **Cuando** la solicitud llega al microservicio,
* **Entonces** el sistema valida el token JWT, deniega el acceso con error HTTP `403 Forbidden` y registra el intento no autorizado en los logs de seguridad.

---

## 4. Matriz de Interacción con Otros Módulos

| Módulo | Necesidad de Interacción | Información que Recibe | Información que Entrega |
| :--- | :--- | :--- | :--- |
| **Canal Marketplace (Cliente)** | Consultar el precio unitario base de los artículos en catálogo y checkout. | Identificadores de productos solicitados (`product_id` / `sku`). | Precio vigente oficial, moneda y fecha de corte. |
| **Canal Retail (Vendedor)** | Obtener el precio oficial para la generación de pedidos y cotizaciones en tienda física. | `product_id` consultados desde la interfaz de venta asistida. | Precio unitario oficial vigente. |
| **Canal Chatbot (Cliente)** | Responder consultas de precio de productos deportivos en lenguaje natural. | SKU o identificador del producto consultado. | Precio unitario vigente. |
| **Ventas y Postventa** | Validar que el importe total del pedido corresponda a los precios reales al momento de la compra. | Identificador de pedido, detalle de ítems y timestamp de la orden. | Validación de consistencia de precios unitarios históricos. *(Evita manipulación de precios desde el cliente)*. |
| **Seguridad y Usuarios** | Validar identidad, token JWT y roles autorizados para operar el motor de precios. | Token de autenticación, rol del usuario e identificador de cuenta. | Confirmación de autorización o rechazo de acceso. |

---

## 5. Dependencias del Dominio (Productos y Ofertas)

*Coordinaciones internas con las demás responsabilidades dentro del mismo módulo:*

* **Gestión de productos:**
  * *Datos requeridos:* Identificador único (`product_id`), SKU y estado del producto (Activo/Inactivo).
  * *Propósito:* Validar la existencia operativa del producto antes de asociar o actualizar un precio.
* **Gestión de ofertas, promociones y cupones (Historia compañera):**
  * *Datos requeridos:* Notificación de actualización de precio base.
  * *Propósito:* Servir como punto de partida (precio lista) sobre el cual se calcula el porcentaje o monto de descuento de una oferta o cupón. *(Regla: una promoción nunca sobrescribe el precio base en la tabla maestra, calcula un precio neto resultante)*.
* **Gestión de paquetes / combos:**
  * *Datos requeridos:* Precio unitario de los productos componentes.
  * *Propósito:* Validar que el precio de un combo deportivo guarde coherencia con la suma de los precios individuales.

---

## 6. Reglas de Negocio Pendientes de Definición

- [ ] **Política de colisión temporal en programación masiva:** Definir si una nueva carga masiva programada sobrescribe una vigencia futura ya calendarizada para el mismo producto o si debe alertar duplicidad.
- [ ] **Estrategia transaccional del lote (Todo o Nada vs. Parcial):** Confirmar con el negocio si la carga masiva debe permitir actualización parcial (se guardan las filas correctas y se rechazan las erróneas) o si un solo error en el archivo debe forzar un `rollback` de todo el lote.
- [ ] **Margen de variación y alertas de seguridad:** Establecer si debe existir un porcentaje de variación máximo permitido por cambio (ej. no reducir un precio más del 80% o subir más del 300% de golpe) que requiera una doble aprobación de un supervisor para evitar errores humanos de tipeo en el archivo masivo.