# Historia de Usuario: Historial de Auditoría de Precios (Price Audit Log)

---

## 1. Historia de Usuario Principal

| Parámetro | Detalle |
| :--- | :--- |
| **Rol (Como)** | Gestor Comercial / Auditor Interno |
| **Acción (Quiero)** | Visualizar, filtrar y exportar la bitácora inmutable de auditoría que registre de forma automática quién, cuándo, desde qué IP y bajo qué mecanismo se modificó el precio de un producto |
| **Beneficio (Para)** | Garantizar la trazabilidad total de variaciones comerciales, prevenir fraudes internos o errores de digitación y resolver discrepancias de facturación con pedidos históricos |

---

## 2. Criterios de Aceptación

| ID | Criterio |
| :---: | :--- |
| **CA-01** | **Captura Automática y Transaccional:** Cada vez que el motor de precios procese un cambio (individual o por lote masivo), el sistema debe registrar en la bitácora: `audit_id`, `product_id` (SKU), `precio_anterior`, `precio_nuevo`, `variacion_porcentual`, `usuario_id`, `ip_origen`, `timestamp_utc`, `canal_origen` (UI Individual, API, Lote CSV) y `motivo_cambio`. La inserción del log debe formar parte de la misma transacción de actualización de precio. |
| **CA-02** | **Acceso y Control de Permisos:** Solo usuarios con rol de Gestor Comercial con privilegios de auditoría o Administrador del Sistema pueden consultar la interfaz de bitácora y consumir los endpoints de lectura de auditoría. Solicitudes no autorizadas deben ser rechazadas con error HTTP `403 Forbidden`. |
| **CA-03** | **Inmutabilidad Estricta:** La base de datos y la API no deben exponer bajo ninguna circunstancia operaciones de actualización (`UPDATE`) o borrado (`DELETE`) sobre la entidad de logs de precios. |
| **CA-04** | **Filtrado y Búsqueda Multicriterio:** La interfaz debe permitir buscar eventos de auditoría mediante filtros combinados por: identificador de producto (SKU/nombre), identificador de usuario, rango de fechas/horas (desde/hasta), dirección IP y modalidad de cambio (Individual / Lote masivo). |
| **CA-05** | **Paginación y Rendimiento:** Debido al alto volumen de transacciones de precios en catálogos deportivos, las consultas deben estar paginadas (por defecto 20 registros por página) con tiempo de respuesta menor a 800 ms, utilizando índices sobre `product_id`, `timestamp` y `usuario_id`. |
| **CA-06** | **Trazabilidad de Procesamiento Masivo:** Si la modificación provino de una carga masiva por archivo, el log debe almacenar el `batch_id` o `archivo_id` asociado para que el auditor pueda vincular el cambio individual con el archivo fuente que lo originó. |
| **CA-07** | **Exportación Auditable:** El usuario debe poder exportar los resultados del log filtrado a formato CSV o PDF firmado/marcado temporalmente con fecha, hora y usuario que solicitó la exportación, con fines de control interno. |

---

## 3. Escenarios (Dado - Cuando - Entonces / Gherkin)

### Escenario 1: Registro automático de cambio individual
* **Dado** que el gestor comercial con usuario `USR-102` y desde la IP `192.168.1.45` modifica el precio del balón oficial (SKU `BAL-001`) de S/ 80.00 a S/ 95.00 indicando motivo "Incremento por arancel",
* **Cuando** se confirma exitosamente la actualización de precio,
* **Entonces** el sistema inserta de forma inmediata un nuevo registro de auditoría con los datos del usuario, timestamp, IP, precios anterior/nuevo (+18.75%) y motivo.

### Escenario 2: Trazabilidad en procesamiento masivo
* **Dado** que se procesa un lote de actualización masiva mediante el archivo `precios_calzado_2026.csv` con identificador `BATCH-8821`,
* **Cuando** se actualiza el precio de cada producto contenido en el lote,
* **Entonces** el sistema genera una entrada de auditoría individual por cada ítem actualizado, asociándoles el `batch_id: BATCH-8821` y la IP desde la que se subió el archivo.

### Escenario 3: Consulta histórica de un producto específico
* **Dado** que un gestor comercial detecta una inconsistencia en el precio de una camiseta deportiva (SKU `CAM-PER-01`),
* **Cuando** filtra en el módulo de auditoría por el SKU `CAM-PER-01` en los últimos 30 días,
* **Entonces** el sistema muestra la secuencia cronológica descendente de todos los cambios de precio experimentados por el producto, evidenciando usuarios responsables y timestamps exactos.

### Escenario 4: Intento de alteración o borrado de bitácora (Seguridad)
* **Dado** que un usuario malintencionado intenta invocar un método HTTP `DELETE` o `PUT` contra el endpoint `/api/v1/precios/auditoria/{id}`,
* **Cuando** la petición llega al backend del microservicio,
* **Entonces** el servicio responde con HTTP `405 Method Not Allowed`, no ejecuta ninguna modificación sobre la base de datos y genera una alerta de seguridad.

### Escenario 5: Exportación de log para revisión contable
* **Dado** que el gestor comercial aplica un filtro de auditoría entre el 01/09/2026 y el 14/09/2026 y obtiene 120 registros,
* **Cuando** presiona la opción "Exportar a CSV",
* **Entonces** el sistema genera y descarga un archivo estructurado con el desglose exacto de los 120 eventos, incluyendo metadatos de emisión.

---

## 4. Matriz de Interacción con Otros Módulos

| Módulo | Necesidad de Interacción | Información que Recibe | Información que Entrega |
| :--- | :--- | :--- | :--- |
| **Seguridad y Usuarios** | Validar identidad del autor del cambio y verificar roles de acceso a la bitácora. | Identidad del usuario autenticado (ID, nombre, rol), token JWT y validación de permisos. | Eventos de intento de acceso no autorizado al módulo de auditoría. |
| **Ventas y Postventa** | Esclarecer discrepancias de precios reportadas en reclamos o devoluciones de pedidos. | Identificador de pedido, producto cuestionado y fecha/hora de la transacción de compra. | Precio base vigente en el instante exacto de la orden y registro histórico del cambio anterior y posterior. |
| **Canal Marketplace / Retail / Chatbot** | Sin interacción directa (canal desacoplado de auditoría por rendimiento). | Ninguna (no consumen la bitácora de auditoría). | Ninguna. |

---

## 5. Dependencias del Dominio (Productos y Ofertas)

*Coordinaciones internas con las demás responsabilidades dentro del mismo módulo:*

* **Gestión de precios individuales y masivos (Responsabilidad principal):**
  * *Datos requeridos:* Evento de confirmación de cambio de precio (SKU, precio anterior, precio nuevo, IP del cliente HTTP, ID de usuario, tipo de operación).
  * *Propósito:* Disparar la persistencia síncrona/asíncrona del registro en el almacén de auditoría.
* **Gestión de productos:**
  * *Datos requeridos:* Nombre comercial, SKU y marca del producto.
  * *Propósito:* Enriquecer la visualización de la bitácora para que el auditor no solo vea identificadores alfanuméricos sino la descripción del producto.

---

## 6. Reglas de Negocio Pendientes de Definición

- [ ] **Política de retención y archivado de logs:** Definir si los registros de auditoría de precios se mantendrán en la base de datos operativa de forma permanente o si pasarán a almacenamiento frío (cold storage / data warehouse) tras cumplir un periodo (ej. 1 o 2 años).
- [ ] **Umbral de alerta temprana por variaciones atípicas:** Definir si la auditoría debe emitir alertas reactivas automáticas (correo o notificación) al detectar cambios de precio individuales o masivos que superen cierto porcentaje crítico (ej. caída mayor al 50% de su valor).
- [ ] **Privacidad y enmascaramiento de IP:** Confirmar si la dirección IP almacenada debe registrarse en texto claro o con anonimización parcial (enmascaramiento del último octeto) según las políticas de privacidad y protección de datos del proyecto.