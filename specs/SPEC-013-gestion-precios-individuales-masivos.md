# SPEC-013 — Especificación: Gestión de precios individuales y masivos

**Responsable:** Leonardo Vera Rodríguez  
**Rama:** vera  
**Trazabilidad:** HU [HU-013](../hu/HU-013-gestion-precios-individuales-masivos.md) | Wireframe [WF-013](../wireframes/flows/WF-013-gestion-precios-individuales-masivos.md)

## 1. Contexto
En un marketplace multicanal de artículos deportivos (que abastece canales web, chatbot y ventas retail en tienda física), los precios de los productos fluctúan constantemente por campañas comerciales, tipo de cambio, liquidaciones de temporada deportiva o acuerdos con proveedores. El gestor comercial requiere una interfaz y mecanismos backend confiables para actualizar precios tanto de manera puntual (producto por producto) como en lote mediante archivos tabulares (CSV/Excel) para cientos de SKUs, garantizando consistencia, trazabilidad temporal y prevención de errores operativos que deriven en pérdidas económicas o infracciones de protección al consumidor.

## 2. Propósito
Permitir al gestor comercial actualizar, programar y calibrar precios regulares y de oferta de productos/SKUs individuales o catálogos masivos de forma ágil y validada, con soporte de vigencias temporales, consulta histórica, scopes por canal y controles contra errores operativos extraordinarios. Esta capacidad **no afirma prevenir márgenes negativos** mientras el dominio no disponga de costos o márgenes objetivo.

## 3. Alcance
Incluye:
- Consulta y actualización manual del precio regular y precio de oferta, exigiendo motivo obligatorio.
- Modelo jerárquico: el producto define precio base; un SKU de variante puede definir un override específico. Si no existe override, hereda el precio vigente del producto. Para un producto simple, su `sku_base` es el SKU vendible y usa el precio del producto.
- Validación de rangos comerciales permitidos (precios estrictamente mayores a cero y precio de oferta menor al precio regular).
- Programación de precios con `valid_from`, `valid_until` opcional, moneda y `channel_id` opcional (`null` = precio global).
- Consulta de precios en un punto específico en el tiempo (*as-of query*) mediante parámetro temporal.
- Carga masiva de precios mediante archivo estructurado (.csv o .xlsx) con transaccionalidad atómica por defecto (*All-or-Nothing*) y modo tolerante a fallos opcional.
- Previsualización, procesamiento por lotes y reporte detallado de errores fila por fila en cargas masivas, incluyendo conflictos de versión y vigencias superpuestas.
- Emisión de eventos de cambio de precio (`pricing.price.changed`) **solo por Pricing tras confirmar el cambio**, incluyendo la inicialización del primer precio, hacia auditoría y sincronización multicanal.

## 4. Requisitos

### Requisito 1: Actualización de precio individual y motivo obligatorio
El sistema DEBE permitir a un usuario autenticado con permisos de Pricing modificar el precio regular y/o de oferta de un SKU, exigiendo `motivo_cambio`, `price_version` cuando la operación parte de una lectura previa y validando las reglas antes de persistir. La asignación de permisos a roles concretos corresponde a Seguridad y Usuarios.

#### Escenario: Actualización exitosa de precio individual
- DADO que un gestor autenticado con `PRICING_WRITE` visualiza el SKU "NK-DEP-001" con precio regular actual S/ 120.00 y `price_version=8`
- CUANDO ingresa S/ 150.00, especifica el motivo "Ajuste inflacionario Q3", envía `price_version=8` y confirma
- ENTONCES Pricing persiste S/ 150.00, incrementa `price_version`, actualiza la fecha, emite `pricing.price.changed` después del commit y responde HTTP 200. Si la versión ya cambió, rechaza con conflicto y devuelve la versión vigente sin sobrescribir silenciosamente.

#### Escenario: Rechazo por ausencia de motivo de cambio
- DADO que el gestor comercial edita el precio de un producto e ingresa un nuevo valor válido
- CUANDO omite ingresar el campo obligatorio `motivo_cambio` (campo vacío, nulo o de solo espacios)
- ENTONCES el sistema rechaza la solicitud con código HTTP 400 (Bad Request), mantiene intactos los valores en la base de datos y muestra el mensaje de error "El motivo del cambio de precio es mandatorio".

#### Escenario: Rechazo por precio negativo o cero
- DADO que el gestor comercial edita el precio de un producto
- CUANDO ingresa un valor menor o igual a 0.00 (por ejemplo, -15.00 o 0.00) en el precio regular e intenta guardar
- ENTONCES el sistema rechaza la solicitud con código HTTP 400 (Bad Request), mantiene intactos los valores en la base de datos y muestra el mensaje de error "El precio regular debe ser un valor numérico estrictamente mayor a 0".

#### Escenario: Rechazo de precio de oferta superior al precio regular
- DADO que un producto tiene un precio regular de S/ 80.00
- CUANDO el gestor comercial intenta registrar un precio de oferta de S/ 95.00
- ENTONCES el sistema bloquea la persistencia y retorna un error de validación indicando "El precio de oferta no puede ser mayor o igual al precio regular".

#### Escenario: Advertencia por variación extraordinaria
- DADO un SKU con precio vigente S/ 999.00
- CUANDO el gestor propone S/ 9.99 con motivo válido
- ENTONCES el sistema calcula la variación porcentual y muestra una advertencia reforzada antes de confirmar cuando supera el umbral configurable; no afirma que exista margen positivo porque Pricing no administra costos.


### Requisito 1.1: Resolver precio efectivo por SKU y canal
El sistema DEBE resolver el precio vigente de cualquier SKU vendible considerando la fecha/hora, moneda y `channel_id` solicitados.

- Producto simple: usa el precio del producto asociado a su `sku_base`.
- Variante con override: usa el precio específico del SKU.
- Variante sin override: hereda el precio vigente del producto padre.
- Scope de canal: si existe una vigencia específica para `channel_id`, se utiliza conforme a su prioridad sobre el precio global; si no existe, se usa `channel_id=null` como fallback global.
- La respuesta identifica precio regular, oferta opcional, moneda, `channel_id` efectivo, `valid_from`, `valid_until` y versión.

Promociones/Cupones reciben regular y oferta como valores separados y deciden combinabilidad en su propio dominio. Combos recibe tanto el regular como el precio público efectivo vigente para verificar que el precio agrupado no sea más caro que adquirir los componentes individualmente en ese momento. Ninguna de estas capacidades modifica el precio maestro de Pricing.

### Requisito 2: Programación de precios futuros
El sistema DEBE permitir programar vigencias mediante `valid_from` y `valid_until` opcional, con `channel_id` y moneda. Para un mismo SKU + tipo de precio + canal + moneda no se permiten intervalos temporales superpuestos; el sistema rechaza el conflicto antes de activarlo.

#### Escenario: Programación de precio para campaña futura
- DADO que la fecha actual es "2026-10-01T10:00:00Z" y el gestor programa para "NK-DEP-001" una oferta S/ 89.90 para `MARKETPLACE`, desde "2026-11-27T00:00:00Z" hasta "2026-11-30T23:59:59Z", con motivo "Campaña Black Friday"
- CUANDO el gestor confirma la programación
- ENTONCES almacena la programación `SCHEDULED` sin alterar el precio actual, después de verificar que no se superpone con otra vigencia del mismo scope.
- Y CUANDO un worker programado verifica que el timestamp actual alcanza la fecha de vigencia, actualiza la tabla operativa `product_prices`, marca la programación como `ACTIVE` y emite el evento `pricing.price.changed`.

#### Escenario: Rechazo de vigencia superpuesta
- DADO que ya existe una vigencia para el SKU "NK-DEP-001" en `MARKETPLACE` del 1 al 30 de noviembre
- CUANDO el gestor intenta registrar otra vigencia del mismo tipo de precio, moneda y canal del 15 al 25 de noviembre
- ENTONCES Pricing rechaza la programación indicando el intervalo en conflicto y conserva las vigencias existentes.

### Requisito 3: Consulta de precio histórico oficial (As-Of Query)
El sistema DEBE proveer un mecanismo y una pantalla administrativa para consultar el precio oficial que un SKU tenía en una fecha y hora determinada del pasado. La pantalla consume el mismo contrato `as-of` y no modifica el histórico.

#### Escenario: Consulta de precio en una fecha histórica específica
- DADO que el SKU "BALON-FUT-N5" tuvo un precio regular de S/ 80.00 en agosto de 2026 y de S/ 100.00 a partir del 1 de septiembre de 2026
- CUANDO un servicio o auditor invoca `GET /api/v1/pricing/skus/BALON-FUT-N5/price?at=2026-08-15T12:00:00Z`
- ENTONCES el sistema consulta el histórico de vigencias y retorna HTTP 200 con el precio de S/ 80.00, la moneda oficial y el identificador de vigencia correspondiente a esa fecha exacta.

### Requisito 4: Carga y actualización masiva de precios vía archivo
El sistema DEBE permitir CSV/XLSX con columnas obligatorias `sku`, `precio_regular`, `motivo_cambio` y opcionales `precio_oferta`, `accion_precio_oferta`, `channel_id`, `valid_from`, `valid_until` y `price_version`. Una versión obsoleta, scope inválido o intervalo superpuesto se reporta como error de fila. La política sigue siendo atómica por defecto y tolerante a fallos solo con `allow_partial=true`.

#### Escenario: Procesamiento masivo atómico por defecto (All-or-Nothing)
- DADO que el gestor comercial carga un archivo `precios_lote.csv` de 200 filas con el modo por defecto (`allow_partial=false`), donde la fila 50 contiene un SKU inexistente
- CUANDO se ejecuta la carga masiva
- ENTONCES el sistema aborta la aplicación completa dentro de Pricing, no modifica ninguno de los 199 SKUs restantes y genera un reporte con la fila 50. Si el error se detecta antes de encolar, responde HTTP 422; si se detecta en el Worker, la API ya respondió HTTP 202 y el lote concluye `FAILED` con el reporte.

#### Escenario: Carga masiva en modo tolerante a fallos (`allow_partial=true`)
- DADO que el gestor comercial carga un archivo de 100 filas con el flag explícito `allow_partial=true`, conteniendo 95 filas correctas y 5 filas con errores de validación
- CUANDO se confirma el procesamiento masivo
- ENTONCES el sistema aplica los cambios de las 95 filas válidas dentro de una transacción local de Pricing, genera eventos de cambios confirmados con `batch_id` y un reporte de las 5 rechazadas. Una solicitud síncrona ya validada puede responder HTTP 207; si se procesa asíncronamente, la admisión es HTTP 202 y el estado final reporta éxito parcial.

### Requisito 4.1: Semántica de oferta opcional en archivo de precios
La plantilla exclusiva de Pricing agrega la columna opcional `accion_precio_oferta` con valores `CONSERVAR`, `ESTABLECER` o `ELIMINAR`; su ausencia o celda vacía equivale a `CONSERVAR`. `ESTABLECER` exige `precio_oferta` positivo y menor al precio regular final; `ELIMINAR` exige `precio_oferta` vacío y retira solamente la oferta propia de Pricing tras persistir un cambio auditable `tipo_precio=OFERTA`, `tipo_operacion=RETIRO_OFERTA`, `precio_anterior` con la oferta retirada y `precio_nuevo=null`, variación `null`. `CONSERVAR` exige `precio_oferta` vacío y mantiene el valor vigente; si el nuevo precio regular resulta incompatible con la oferta conservada, la fila se rechaza sin eliminarla silenciosamente. Una celda de oferta vacía por sí sola **nunca borra** el valor existente. El modo `allow_partial=false` aplica estas validaciones antes de confirmar cualquier fila y mantiene atomicidad local de Pricing.

#### Escenario: Eliminar oferta expresamente
- DADO un SKU con regular S/ 200 y oferta vigente S/ 170
- CUANDO se importa `precio_regular=200`, `precio_oferta` vacío y `accion_precio_oferta=ELIMINAR` con motivo válido
- ENTONCES Pricing retira su oferta, conserva el regular, registra auditoría y publica `pricing.price.changed` tras el commit.

#### Escenario: Conservar oferta con celda vacía
- DADO un SKU con oferta S/ 170 y regular S/ 200
- CUANDO se importa una fila válida con `accion_precio_oferta` vacío y `precio_oferta` vacío
- ENTONCES se conserva la oferta S/ 170; si el nuevo regular fuera S/ 160, se rechaza la fila por incompatibilidad.

### Política comercial compartida de precios y descuentos (decisión interna)
Pricing es propietario de `precio_regular`, `precio_oferta`, sus vigencias y scopes. Para cada SKU entrega ambos valores separados junto con moneda, canal efectivo y vigencia. **Pricing no decide por sí mismo si todos los beneficios son excluyentes.** Promociones/Cupones define la política de combinabilidad y evalúa solo combinaciones permitidas, manteniendo una base monetaria explícita y evitando aplicar dos veces el mismo descuento. Combos recibe regular y precio público efectivo como referencias distintas para validar su conveniencia. Los importes usan decimal exacto y redondeo monetario definido por la moneda.

Esta política es una **decisión interna provisional de comercialización** y los contratos con Ventas/Postventa deben homologarse. Un pedido confirmado conserva snapshot del precio y beneficios efectivamente aceptados; cambios posteriores de Pricing no reescriben el pedido histórico.

### Requisito 5: Inicialización de precio y contrato de auditoría
La creación del precio base se solicita a Pricing mediante comando idempotente con `product_id`, `sku_base`, `precio_regular`, moneda, `channel_id=null`, `motivo_cambio=ALTA_PRODUCTO`, identidad del actor y correlación. Pricing registra el primer precio con `tipo_operacion=CREACION`, `precio_anterior=null` y `variacion_porcentual=null`, emite `pricing.price.changed` con ese contrato **solo después del commit** y confirma la preparación a Catálogo. Las modificaciones posteriores usan `tipo_operacion=MODIFICACION`, precio anterior y variación calculada. El evento es un hecho ocurrido; nunca sirve como orden para realizar el cambio.

### Requisito 6: Distinguir importaciones
La carga exclusiva de precios de esta funcionalidad garantiza All-or-Nothing **solo dentro de Pricing** cuando `allow_partial=false`; el modo parcial permite persistir filas válidas en transacción local. La importación general de `SPEC-001-carga-exportacion-masiva-productos.md` coordina Catálogo, Pricing e Inventario y **no promete atomicidad entre dominios**. El Worker recibe comandos idempotentes por dominio y retorna resultados correlacionados; no consume `pricing.price.changed` como instrucción. La respuesta inicial de una importación asíncrona es HTTP 202 con `batch_id`, y su éxito/fallo se consulta por estado.

## 5. Requisitos no funcionales
- Rendimiento objetivo: actualización individual < 300 ms; consulta histórica/vigente < 100 ms bajo carga de referencia. Para 5,000 registros, procesamiento asíncrono medible y no bloqueante; 10 segundos es una meta a validar con benchmark del entorno, no un plazo garantizado ante caídas, reintentos o cuotas Free Tier.
- Seguridad: endpoints protegidos por token JWT y permisos `PRICING_READ`, `PRICING_WRITE` y/o `PRICING_BULK`; Seguridad y Usuarios asigna esos permisos a roles. Validación rigurosa de MIME y tamaño máximo de archivo (10 MB).
- Integración y Persistencia: Desacoplamiento del precio vigente (tabla operativa para lectura ultrarrápida) e histórico de vigencias (SCD Tipo 2). Emisión obligatoria del evento `pricing.price.changed` al broker asíncrono acordado tras cada mutación persistida, mediante Outbox; la selección RabbitMQ/Kafka queda fuera del contrato funcional.

## 6. Fuera de alcance
- Configuración de reglas complejas de cupones de descuento, combos y promociones 2x1 — corresponde al módulo de ofertas y promociones.
- Procesamiento de cobros y checkout — responsabilidad del canal de ventas transaccional.
- Determinación de costos logísticos y tarifas por zona — responsabilidad del módulo de despacho y entrega.
- Costeo de producto, margen contable y reglas de margen mínimo — no existe un dominio de costos definido en el alcance; por ello Pricing no afirma prevenir márgenes negativos.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos funcionales (incluyendo programación y consultas históricas) están implementados.
- Todos los escenarios definidos se cumplen satisfactoriamente.
- Los requisitos no funcionales de tiempo de respuesta y seguridad se cumplen.
- No se incorporan funcionalidades fuera de alcance.
