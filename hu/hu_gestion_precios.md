# Historia de Usuario: Gestión de Precios (Individuales y Masivos)

---

## 1. Historia de Usuario Principal

| Parámetro | Detalle |
| :--- | :--- |
| **Rol (Como)** | Gestor Comercial |
| **Acción (Quiero)** | Actualizar el precio regular y el precio de oferta de productos del catálogo de forma individual o mediante la carga masiva de archivos estructurados (.csv / .xlsx) |
| **Beneficio (Para)** | Mantener calibrados los precios base y ofertas directas de los artículos deportivos en todos los canales de venta, previniendo márgenes negativos, precios erróneos y pérdidas comerciales |

---

## 2. Criterios de Aceptación

| ID | Criterio |
| :---: | :--- |
| **CA-01** | **Seguridad y Permisos:** Solo usuarios autenticados mediante token JWT con rol `GESTOR_COMERCIAL` o `ADMIN_CATALOGO` pueden consultar o modificar precios. Peticiones sin autorización deben ser rechazadas con código HTTP `401 Unauthorized` o `403 Forbidden`. |
| **CA-02** | **Modelo de Precios y Reglas de Negocio:** Cada producto gestiona `precio_regular` y opcionalmente `precio_oferta`. El sistema debe validar que: (a) el `precio_regular` sea un valor numérico estrictamente mayor a 0.00, y (b) si se define `precio_oferta`, este debe ser estrictamente mayor a 0.00 y menor al `precio_regular` (`precio_oferta < precio_regular`). |
| **CA-03** | **Actualización Individual:** Debe permitir modificar el `precio_regular` y/o `precio_oferta` indicando el SKU del producto. Ante datos válidos, persiste los cambios, actualiza la fecha de modificación, responde en un tiempo menor a 300 ms con código HTTP `200 OK` y emite un evento asíncrono hacia el componente de auditoría y canales dependientes. |
| **CA-04** | **Rechazo por Datos Inválidos (Individual):** Si el precio regular es negativo/cero o el precio de oferta es mayor o igual al regular, el sistema rechaza la operación con HTTP `400 Bad Request`, conserva intactos los valores en base de datos y detalla el motivo del rechazo. |
| **CA-05** | **Carga y Procesamiento Masivo:** Permite subir archivos estructurados (CSV o XLSX) con columnas obligatorias `sku` y `precio_regular`, y columna opcional `precio_oferta`. El archivo debe validarse por tamaño y MIME type. Archivos de hasta 5,000 registros deben procesarse en segundo plano en menos de 10 segundos. |
| **CA-06** | **Resiliencia y Reporte del Lote:** Durante el procesamiento masivo, el sistema valida fila por fila. Aplica los cambios en las filas válidas (o descarta el lote según la política de transacción configurada) y genera un reporte descargable con el resumen de la carga y el detalle de errores por número de fila y SKU (ej. "Fila 12: SKU no encontrado", "Fila 45: Precio de oferta mayor o igual al regular"). |
| **CA-07** | **Delimitación frente a Promociones:** El precio regular y el precio de oferta constituyen los precios base/lista del catálogo. Las promociones por campaña, cupones y combos aplicados por el módulo comercial calculan descuentos netos sobre estos precios sin sobrescribir la configuración maestra del producto. |

---

## 3. Escenarios (Dado - Cuando - Entonces / Gherkin)

### Escenario 1: Actualización exitosa de precio individual
* **Dado** que el gestor comercial autenticado con rol `GESTOR_COMERCIAL` visualiza el producto con SKU `NK-DEP-001` con precio regular de S/ 120.00,
* **Cuando** ingresa un nuevo precio regular de S/ 150.00 y confirma la acción,
* **Entonces** el sistema persiste el nuevo precio de S/ 150.00, actualiza la fecha de modificación, emite el evento de auditoría correspondiente y retorna HTTP 200 con el mensaje "Precio actualizado exitosamente".

### Escenario 2: Rechazo de precio regular negativo o cero
* **Dado** que el gestor comercial edita el precio de un producto,
* **Cuando** ingresa un valor menor o igual a 0.00 (ej. S/ -15.00 o S/ 0.00) en el precio regular e intenta guardar,
* **Entonces** el sistema rechaza la solicitud con HTTP 400 Bad Request, mantiene intactos los valores previos en la base de datos y muestra el mensaje: "El precio regular debe ser un valor numérico estrictamente mayor a 0".

### Escenario 3: Rechazo de precio de oferta superior o igual al regular
* **Dado** que un producto tiene un precio regular de S/ 80.00,
* **Cuando** el gestor comercial intenta registrar un precio de oferta de S/ 95.00,
* **Entonces** el sistema bloquea la persistencia, retorna HTTP 400 y notifica: "El precio de oferta no puede ser mayor o igual al precio regular".

### Escenario 4: Procesamiento masivo de archivo válido
* **Dado** que el gestor comercial carga un archivo `precios_campana.csv` con 250 filas válidas con cabeceras `sku`, `precio_regular` y `precio_oferta`,
* **Cuando** confirma la ejecución de la carga masiva,
* **Entonces** el microservicio procesa el lote en segundo plano, impacta los precios en el catálogo, emite los eventos de auditoría y retorna un consolidado indicando "250 productos actualizados con éxito, 0 errores".

### Escenario 5: Carga masiva con filas erróneas y generación de reporte
* **Dado** que el archivo masivo cargado contiene 100 filas, de las cuales 3 tienen SKUs no existentes y 2 tienen precios no válidos o incongruentes,
* **Cuando** se ejecuta el procesamiento masivo,
* **Entonces** el sistema actualiza las 95 filas correctas, omite las 5 erróneas y genera un reporte detallado descargable especificando el número de fila, el SKU y la causa del fallo.

### Escenario 6: Rechazo por perfil no autorizado
* **Dado** que un usuario autenticado sin rol comercial o de administración de catálogo intenta enviar un payload al endpoint de modificación de precios,
* **Cuando** la petición alcanza el microservicio,
* **Entonces** el sistema deniega el acceso con código HTTP 403 Forbidden y no procesa ningún cambio.

---

## 4. Matriz de Interacción con Otros Módulos

| Módulo | Necesidad de Interacción | Información que Recibe | Información que Entrega |
| :--- | :--- | :--- | :--- |
| **Canal Marketplace (Cliente)** | Consultar el precio regular y de oferta vigente para catálogo, detalle de producto y carrito. | Identificadores de productos (`sku` / `product_id`). | `precio_regular`, `precio_oferta` (si aplica), moneda oficial (PEN) y estado del precio. |
| **Canal Retail (Vendedor)** | Obtener precios vigentes para la venta asistida y emisión de boleta en tienda física. | Identificadores de productos (`sku`). | `precio_regular` y `precio_oferta` vigentes de cada artículo. |
| **Canal Chatbot (Cliente)** | Responder dudas de precios y ofertas de productos en lenguaje natural. | Término de búsqueda o SKU del producto. | Precios vigentes de venta. |
| **Ventas y Postventa** | Validar la veracidad del precio al momento de liquidar y confirmar un pedido. | Identificador del pedido, SKUs, precios cobrados y timestamp. | Confirmación de validez de los precios unitarios de catálogo vigentes al momento de la orden. |
| **Seguridad y Usuarios** | Autenticación de identidad y validación de roles de gestión comercial. | Token JWT con claims de usuario y roles asignados. | Respuesta de validación de credenciales / acceso. |
| **Historial de Auditoría** | Registrar cada cambio efectivo de precios de manera desacoplada. | Evento con SKU, precios regular/oferta anterior y nuevo, usuario ID, email, IP y timestamp. | Confirmación de evento recibido. |

---

## 5. Dependencias del Dominio (Productos y Ofertas)

* **Gestión de productos:**
  * *Datos requeridos:* Existencia operativa del `sku` o `product_id` y estado del artículo (Activo/Inactivo).
  * *Propósito:* Garantizar que no se fijen precios a artículos inexistentes o eliminados.
* **Gestión de ofertas, promociones y cupones:**
  * *Datos requeridos:* `precio_regular` y `precio_oferta` actualizados.
  * *Propósito:* Tomar el precio vigente como base sobre la cual se calculan descuentos adicionales de campañas, 2x1 o cupones de porcentaje.
* **Gestión de combos y paquetes:**
  * *Datos requeridos:* Precios vigentes de los artículos individuales.
  * *Propósito:* Validar consistencia comercial del precio final del paquete deportivo respecto a sus partes.

---

## 6. Reglas de Negocio Pendientes de Definición

- [ ] **Política por defecto ante lote con errores:** Ratificar si el entorno de producción operará de manera predeterminada en modo *parcial* (aplicar válidas y rechazar inválidas) o en modo *estricto/atómico* (descartar todo el archivo ante un solo error).
- [ ] **Margen de variación porcentual de advertencia:** Definir si variaciones abruptas de precio (ej. reducciones mayores al 70%) deben requerir una doble confirmación en interfaz antes de persistirse para mitigar errores de digitación.
