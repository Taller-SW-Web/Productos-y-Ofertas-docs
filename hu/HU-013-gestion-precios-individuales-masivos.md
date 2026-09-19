# HU-013 — Historia de Usuario: Gestión de precios individuales y masivos

---

## 1. Historia de Usuario Principal

| Parámetro | Detalle |
| :--- | :--- |
| **Rol (Como)** | Gestor Comercial |
| **Acción (Quiero)** | Actualizar y programar precios regulares y de oferta de productos (individualmente o mediante carga masiva de archivos CSV/XLSX), indicando obligatoriamente el motivo del cambio y consultando precios en fechas históricas |
| **Beneficio (Para)** | Mantener calibrados los precios base y ofertas directas en todos los canales de venta, garantizando trazabilidad temporal, previniendo márgenes negativos y asegurando consistencia transaccional |

---

## 2. Criterios de Aceptación

| ID | Criterio |
| :---: | :--- |
| **CA-01** | **Seguridad y Permisos:** Solo usuarios autenticados mediante token JWT con rol `GESTOR_COMERCIAL` o `ADMIN_CATALOGO` pueden consultar, programar o modificar precios. Peticiones sin autorización deben ser rechazadas con código HTTP `401 Unauthorized` o `403 Forbidden`. |
| **CA-02** | **Modelo de Precios y Validaciones:** Cada producto gestiona `precio_regular` y opcionalmente `precio_oferta`. El sistema valida que: (a) el `precio_regular` sea un valor numérico estrictamente mayor a 0.00, y (b) si se define `precio_oferta`, este debe ser estrictamente mayor a 0.00 y menor al `precio_regular` (`precio_oferta < precio_regular`). |
| **CA-03** | **Actualización Individual y Motivo Obligatorio:** Permite modificar el precio regular u oferta enviando SKU, nuevos valores y el campo obligatorio `motivo_cambio`. Ante datos válidos, persiste los cambios en la tabla operativa, actualiza la fecha de modificación, responde en menos de 300 ms con HTTP `200 OK` y emite el evento asíncrono `pricing.price.changed`. Si falta el motivo, rechaza con HTTP `400 Bad Request`. |
| **CA-04** | **Programación de Precios Futuros:** Permite registrar modificaciones de precio con fecha de vigencia futura (`valid_from`). La programación se almacena en estado `SCHEDULED` y un proceso automático la activa e impacta en el catálogo al cumplirse la fecha/hora programada, emitiendo el evento correspondiente. |
| **CA-05** | **Consulta de Precio Histórico (As-Of):** Provee el endpoint `GET /api/v1/pricing/skus/{sku}/price?at={timestamp}` y una pantalla administrativa que consume ese contrato para retornar el precio oficial que tenía un SKU en una fecha y hora determinada del pasado basándose en la tabla de vigencias temporales. La consulta es de solo lectura. |
| **CA-06** | **Carga Masiva Atómica por Defecto (All-or-Nothing):** Permite subir archivos CSV o XLSX con cabeceras obligatorias `sku`, `precio_regular`, `motivo_cambio` y opcional `precio_oferta`. Si al menos una fila contiene errores de validación o SKUs inexistentes, todo el lote se descarta en Pricing. Si se detecta antes de encolar responde HTTP `422`; si ocurre en procesamiento asíncrono, la admisión previa fue HTTP `202` y se informa `FAILED` con reporte. |
| **CA-07** | **Modo Tolerante Opcional en Carga Masiva:** Si la solicitud de carga masiva incluye el parámetro explícito `allow_partial=true`, el sistema persiste todas las filas válidas en una única transacción, descarta las filas inválidas, responde HTTP `207 Multi-Status` solo si el resultado se entrega en esa solicitud; el flujo asíncrono responde inicialmente HTTP `202` y expone éxito parcial y el reporte al finalizar con las filas rechazadas y su motivo de error. |
| **CA-08** | **Delimitación frente a Promociones:** Pricing entrega regular y oferta separadamente. La oferta vigente compite como alternativa con promoción automática o cupón; no se acumulan descuentos. Combos compara únicamente con regular vigente por SKU × cantidad. Ninguna capacidad sobrescribe los precios maestros. |
| **CA-09** | **Precio efectivo por SKU:** el producto define el precio base; una variante puede tener override propio. Si no existe override, hereda regular/oferta vigentes del producto. Un producto simple utiliza su `sku_base` como SKU vendible. La consulta devuelve regular, oferta opcional y moneda por separado. |
| **CA-10** | La creación del precio base por Catálogo es idempotente; Pricing emite `pricing.price.changed` tras persistirla con `tipo_operacion=CREACION`, `precio_anterior=null` y `variacion_porcentual=null`. |
| **CA-11** | Se devuelve por SKU precio regular vigente y oferta opcional por separado; Promociones/Cupones comparan alternativas sin acumulación y Combos valida contra el regular × cantidad. |
| **CA-12** | La importación exclusiva de Pricing aplica All-or-Nothing dentro de Pricing, sin prometer atomicidad global con Catálogo o Inventario; `pricing.price.changed` es un evento posterior al commit, no un comando. |
| **CA-13** | Una carga asíncrona devuelve inicialmente HTTP 202 y `batch_id`; HTTP 422/207 solo corresponde a un resultado de validación o procesamiento devuelto sincrónicamente. |

| CA-14 | La carga exclusiva de Pricing admite `accion_precio_oferta=CONSERVAR | ESTABLECER | ELIMINAR` (valor omitido o blanco: `CONSERVAR`). Solo `ESTABLECER` admite una oferta no vacía; `ELIMINAR` la retira explícitamente; blanco por sí solo conserva. Si el regular nuevo invalida una oferta conservada, se rechaza la fila sin eliminación implícita. `allow_partial=false` conserva atomicidad local. |

## 3. Escenarios (Dado - Cuando - Entonces / Gherkin)

### Escenario 1: Actualización exitosa de precio individual con motivo
* **Dado** que el gestor comercial autenticado visualiza el producto con SKU `NK-DEP-001` con precio regular de S/ 120.00,
* **Cuando** ingresa un nuevo precio regular de S/ 150.00 junto con el motivo "Ajuste tarifario proveedor",
* **Entonces** el sistema persiste el nuevo precio en el almacén operativo de Pricing, emite el evento asíncrono de cambio de precio conteniendo el motivo y retorna HTTP 200 con el mensaje "Precio actualizado exitosamente".

### Escenario 2: Rechazo por omisión de motivo obligatorio
* **Dado** que el gestor comercial intenta actualizar el precio del SKU `NK-DEP-001` a S/ 150.00,
* **Cuando** envía la solicitud dejando el campo de motivo vacío o nulo,
* **Entonces** el sistema rechaza la operación con código HTTP 400 Bad Request y no altera el precio en la base de datos.

### Escenario 3: Programación de precio con vigencia futura
* **Dado** que la fecha actual es `2026-10-15T09:00:00Z` y el gestor comercial programa para el SKU `AD-RUN-01` un precio de oferta de S/ 199.00 con inicio de vigencia `2026-11-20T00:00:00Z` y motivo "Campaña Cyber Days",
* **Cuando** confirma la operación,
* **Entonces** el sistema guarda el registro como `SCHEDULED` en la tabla de vigencias sin alterar el precio de venta actual y responde HTTP 201 Created.
* **Y cuando** el reloj del sistema alcanza `2026-11-20T00:00:00Z`, el worker activa el nuevo precio en la tabla operativa y notifica al bus de eventos.

### Escenario 4: Consulta de precio oficial en fecha pasada (As-Of)
* **Dado** que un cliente presenta un reclamo sobre una compra realizada el `2026-08-10T15:30:00Z` respecto al SKU `NK-DEP-001`,
* **Cuando** el gestor o servicio invoca `GET /api/v1/pricing/skus/NK-DEP-001/price?at=2026-08-10T15:30:00Z`,
* **Entonces** el sistema consulta el histórico de vigencias temporales y retorna HTTP 200 con el precio exacto vigente en ese instante (S/ 120.00) y su identificador de vigencia.

### Escenario 5: Carga masiva atómica rechazada por error puntual (All-or-Nothing)
* **Dado** que se carga un archivo de 500 filas en modo predeterminado (`allow_partial=false`), donde la fila 312 posee un precio de oferta mayor al regular,
* **Cuando** el sistema procesa el lote masivo,
* **Entonces** cancela la transacción completa, no actualiza ninguno de los otros 499 productos y genera un reporte detallando: "Fila 312: El precio de oferta no puede ser mayor o igual al regular".

### Escenario 6: Carga masiva con tolerancia a fallos (`allow_partial=true`)
* **Dado** que se envía un archivo masivo de 100 filas con el parámetro `allow_partial=true`, conteniendo 98 filas válidas y 2 filas con SKU inexistente,
* **Cuando** se ejecuta el procesamiento masivo,
* **Entonces** el sistema actualiza de manera efectiva las 98 filas válidas, asocia a todas ellas el mismo `batch_id` para auditoría, responde HTTP 207 y provee un archivo descargable con el detalle de las 2 filas rechazadas.

---

### Escenario adicional: Primer precio sin valor anterior
* **Dado** un producto borrador sin precio histórico,
* **Cuando** Pricing procesa su inicialización autorizada,
* **Entonces** persiste el precio, emite el hecho confirmado con `tipo_operacion=CREACION` y valores previos/variación nulos, y confirma a Catálogo.

### Escenario adicional: Oferta como beneficio alternativo
* **Dado** un SKU con precio regular S/ 200 y oferta vigente S/ 180,
* **Cuando** una promoción automática del 15 % produciría S/ 170 sobre el regular,
* **Entonces** se selecciona S/ 170 sin descontar nuevamente sobre S/ 180.

### Escenario adicional: Eliminar oferta solo con acción explícita
* **Dado** un SKU con oferta S/ 170 y regular S/ 200,
* **Cuando** una carga exclusiva incluye `accion_precio_oferta=ELIMINAR` y `precio_oferta` vacío,
* **Entonces** Pricing retira la oferta, registra el cambio y publica el hecho solo después de persistir; si la acción se omite, conserva la oferta.

## 4. Matriz de Interacción con Otros Módulos

| Módulo | Necesidad de Interacción | Información que Recibe | Información que Entrega |
| :--- | :--- | :--- | :--- |
| **Canales de Venta (Web, App, Retail)** | Consultar precios base y ofertas vigentes al momento de compra. | SKU o lista de SKUs a consultar. | Precios vigentes de venta, moneda oficial y estado. |
| **Ventas y Postventa** | Consultar precio histórico oficial para validación de órdenes o reclamos. | SKU del producto y fecha/hora exacta (`at`). | Precio oficial vigente en dicho instante temporal y regla que lo respaldaba. |
| **Seguridad y Usuarios** | Validar identidad, correo y roles comerciales (`GESTOR_COMERCIAL`, `ADMIN_CATALOGO`). | Token JWT de autenticación. | Respuesta de autorización o denegación de acceso. |
| **Historial de Auditoría** | Registrar de forma asíncrona cada mutación de precio aplicada. | Evento con SKU, precios previos/nuevos, variación %, motivo, canal, batch_id, IP y usuario. | Confirmación de evento recibido. |

---

## 5. Dependencias del Dominio (Productos y Ofertas)

* **Gestión de productos:**
  * *Datos requeridos:* Validación de existencia activa del SKU en el catálogo.
  * *Propósito:* Evitar fijación de precios a artículos inexistentes.
* **Gestión de ofertas, promociones y cupones:**
  * *Datos requeridos:* `precio_regular` y `precio_oferta` actuales.
  * *Propósito:* Servir de base oficial sobre la cual se calculan descuentos adicionales de campañas o cupones.

---

## 6. Reglas de Negocio Resueltas

- [x] **Política de carga masiva:** Resuelta. Por defecto opera en modo atómico estricto (*All-or-Nothing*); solo permite actualización parcial si se provee el parámetro explícito `allow_partial=true`.
- [x] **Motivo de cambio:** Resuelto. El motivo es formalmente obligatorio en actualizaciones individuales y como columna requerida en cargas masivas.

---
