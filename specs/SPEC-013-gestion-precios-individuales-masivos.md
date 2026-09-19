# SPEC-013 — Especificación: Gestión de precios individuales y masivos

## 1. Contexto
En un marketplace multicanal de artículos deportivos (que abastece canales web, chatbot y ventas retail en tienda física), los precios de los productos fluctúan constantemente por campañas comerciales, tipo de cambio, liquidaciones de temporada deportiva o acuerdos con proveedores. El gestor comercial requiere una interfaz y mecanismos backend confiables para actualizar precios tanto de manera puntual (producto por producto) como en lote mediante archivos tabulares (CSV/Excel) para cientos de SKUs, garantizando consistencia, trazabilidad temporal y prevención de errores operativos que deriven en pérdidas económicas o infracciones de protección al consumidor.

## 2. Propósito
Permitir al gestor comercial actualizar, programar y calibrar los precios base y precios de oferta de productos/SKUs individuales o catálogos masivos de forma ágil, validada, con soporte de vigencias temporales, consulta histórica y prevención de errores tipográficos o márgenes negativos.

## 3. Alcance
Incluye:
- Consulta y actualización manual del precio regular y precio de oferta, exigiendo motivo obligatorio.
- Modelo jerárquico: el producto define precio base; un SKU de variante puede definir un override específico. Si no existe override, hereda el precio vigente del producto. Para un producto simple, su `sku_base` es el SKU vendible y usa el precio del producto.
- Validación de rangos comerciales permitidos (precios estrictamente mayores a cero y precio de oferta menor al precio regular).
- Programación de precios futuros con fecha y hora de inicio de vigencia (`valid_from`).
- Consulta de precios en un punto específico en el tiempo (*as-of query*) mediante parámetro temporal.
- Carga masiva de precios mediante archivo estructurado (.csv o .xlsx) con transaccionalidad atómica por defecto (*All-or-Nothing*) y modo tolerante a fallos opcional.
- Previsualización, procesamiento por lotes y reporte detallado de errores fila por fila en cargas masivas.
- Emisión de eventos de cambio de precio (`pricing.price.changed`) **solo por Pricing tras confirmar el cambio**, incluyendo la inicialización del primer precio, hacia auditoría y sincronización multicanal.

## 4. Requisitos

### Requisito 1: Actualización de precio individual y motivo obligatorio
El sistema DEBE permitir al gestor comercial autenticado modificar el precio regular y/o el precio de oferta de un producto específico, exigiendo de forma obligatoria el motivo comercial del cambio y validando las reglas de negocio antes de persistir.

#### Escenario: Actualización exitosa de precio individual
- DADO que el gestor comercial se encuentra autenticado con rol `GESTOR_COMERCIAL` o `ADMIN_CATALOGO` y visualiza un producto con SKU "NK-DEP-001" con precio regular actual de S/ 120.00
- CUANDO ingresa un nuevo precio regular de S/ 150.00, especifica el motivo "Ajuste inflacionario Q3" y confirma la acción
- ENTONCES el sistema persiste el nuevo precio regular de S/ 150.00 en la tabla operativa `product_prices`, actualiza la fecha de modificación, emite el evento de dominio asíncrono con el motivo y datos de auditoría, y responde con código HTTP 200 y mensaje de confirmación "Precio actualizado exitosamente".

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


### Requisito 1.1: Resolver precio efectivo por SKU
El sistema DEBE poder resolver el precio efectivo de cualquier SKU vendible.

- Producto simple: usa el precio del producto asociado a su `sku_base`.
- Variante con override: usa el precio específico del SKU.
- Variante sin override: hereda el precio vigente del producto padre.

Promociones y Cupones reciben precio regular y precio de oferta vigentes por SKU como valores separados, y aplican la política compartida de comparación sin acumulación. Combos valida contra el precio regular resuelto por SKU (incluidos overrides), multiplicado por cantidad, sin usar descuentos de promociones.

### Requisito 2: Programación de precios futuros
El sistema DEBE permitir la programación de cambios de precio con fecha/hora de entrada en vigencia posterior a la actual, activándolos automáticamente sin intervención manual.

#### Escenario: Programación de precio para campaña futura
- DADO que la fecha actual es "2026-10-01T10:00:00Z" y el gestor programa para el SKU "NK-DEP-001" un precio de oferta de S/ 89.90 con vigencia desde "2026-11-27T00:00:00Z" (Black Friday) y motivo "Campaña Black Friday"
- CUANDO el gestor confirma la programación
- ENTONCES el sistema almacena la programación en estado `SCHEDULED` en la tabla de vigencias temporales con HTTP 201 Created, sin alterar el precio operativo actual.
- Y CUANDO un worker programado verifica que el timestamp actual alcanza la fecha de vigencia, actualiza la tabla operativa `product_prices`, marca la programación como `ACTIVE` y emite el evento `pricing.price.changed`.

### Requisito 3: Consulta de precio histórico oficial (As-Of Query)
El sistema DEBE proveer un mecanismo y una pantalla administrativa para consultar el precio oficial que un SKU tenía en una fecha y hora determinada del pasado. La pantalla consume el mismo contrato `as-of` y no modifica el histórico.

#### Escenario: Consulta de precio en una fecha histórica específica
- DADO que el SKU "BALON-FUT-N5" tuvo un precio regular de S/ 80.00 en agosto de 2026 y de S/ 100.00 a partir del 1 de septiembre de 2026
- CUANDO un servicio o auditor invoca `GET /api/v1/pricing/skus/BALON-FUT-N5/price?at=2026-08-15T12:00:00Z`
- ENTONCES el sistema consulta el histórico de vigencias y retorna HTTP 200 con el precio de S/ 80.00, la moneda oficial y el identificador de vigencia correspondiente a esa fecha exacta.

### Requisito 4: Carga y actualización masiva de precios vía archivo
El sistema DEBE permitir la carga de archivos estructurados (CSV o XLSX) con columnas obligatorias `sku`, `precio_regular` y `motivo_cambio`, y columnas opcionales `precio_oferta` y `accion_precio_oferta`, aplicando política atómica por defecto y tolerancia a fallos configurable.

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
Pricing es propietario del `precio_regular` vigente, del `precio_oferta` opcional y de los overrides de variante. Para cada SKU vendible entrega **ambos valores separados**, la moneda y la vigencia, resolviendo primero la herencia del producto o el override de la variante. La base para calcular porcentajes/montos de Promociones/Cupones es el **precio regular vigente por SKU**, multiplicado por la cantidad elegible; `precio_oferta` es un **beneficio alternativo de Pricing**, no una base para volver a aplicar promociones. La evaluación comercial compara el subtotal regular, la oferta propia de Pricing (cuando aplique), la mejor promoción automática y el cupón válido; aplica exclusivamente la alternativa que deja menor importe en el mismo conjunto elegible, sin acumularlas. En empate entre cupón y promoción automática se prioriza cupón; frente a empate con oferta Pricing se prioriza la oferta ya vigente para no consumir un cupón innecesariamente. El cupón solo consume uso si queda seleccionado. El resultado incluye precio regular, alternativa seleccionada, descuento, importe final y desglose por SKU. Los importes se calculan con decimal exacto y redondeo monetario al final de cada línea (2 decimales para PEN); se comparan importes finales no porcentajes nominales. Cada alternativa se compara contra el **total de la misma cesta**, incluyendo las líneas no elegibles sin modificación; no se comparan subtotales de conjuntos distintos.

Esta política es una **decisión interna provisional de comercialización**, no un contrato ya acordado con Ventas/Postventa. En pedidos confirmados Ventas conserva snapshot de precio y beneficio elegido.

### Requisito 5: Inicialización de precio y contrato de auditoría
La creación del precio base se solicita a Pricing mediante comando idempotente con `product_id`, `sku_base`, `precio_regular`, `motivo_cambio=ALTA_PRODUCTO`, identidad del actor y correlación. Pricing registra el primer precio con `tipo_operacion=CREACION`, `precio_anterior=null` y `variacion_porcentual=null`, emite `pricing.price.changed` con ese contrato **solo después del commit** y confirma la preparación a Catálogo. Las modificaciones posteriores usan `tipo_operacion=MODIFICACION`, precio anterior y variación calculada. El evento es un hecho ocurrido; nunca sirve como orden para realizar el cambio.

### Requisito 6: Distinguir importaciones
La carga exclusiva de precios de esta funcionalidad garantiza All-or-Nothing **solo dentro de Pricing** cuando `allow_partial=false`; el modo parcial permite persistir filas válidas en transacción local. La importación general de `SPEC-001-carga-exportacion-masiva-productos.md` coordina Catálogo, Pricing e Inventario y **no promete atomicidad entre dominios**. El Worker recibe comandos idempotentes por dominio y retorna resultados correlacionados; no consume `pricing.price.changed` como instrucción. La respuesta inicial de una importación asíncrona es HTTP 202 con `batch_id`, y su éxito/fallo se consulta por estado.

## 5. Requisitos no funcionales
- Rendimiento objetivo: actualización individual < 300 ms; consulta histórica/vigente < 100 ms bajo carga de referencia. Para 5,000 registros, procesamiento asíncrono medible y no bloqueante; 10 segundos es una meta a validar con benchmark del entorno, no un plazo garantizado ante caídas, reintentos o cuotas Free Tier.
- Seguridad: Endpoints protegidos mediante token JWT, exigiendo rol `GESTOR_COMERCIAL` o `ADMIN_CATALOGO`. Validación rigurosa del MIME type y tamaño máximo de archivo (máx. 10 MB).
- Integración y Persistencia: Desacoplamiento del precio vigente (tabla operativa para lectura ultrarrápida) e histórico de vigencias (SCD Tipo 2). Emisión obligatoria del evento `pricing.price.changed` al broker asíncrono acordado tras cada mutación persistida, mediante Outbox; la selección RabbitMQ/Kafka queda fuera del contrato funcional.

## 6. Fuera de alcance
- Configuración de reglas complejas de cupones de descuento, combos y promociones 2x1 — corresponde al módulo de ofertas y promociones.
- Procesamiento de cobros y checkout — responsabilidad del canal de ventas transaccional.
- Determinación de costos logísticos y tarifas por zona — responsabilidad del módulo de despacho y entrega.

## Criterio de completitud
La capacidad se considera correctamente implementada cuando:
- Todos los requisitos funcionales (incluyendo programación y consultas históricas) están implementados.
- Todos los escenarios definidos se cumplen satisfactoriamente.
- Los requisitos no funcionales de tiempo de respuesta y seguridad se cumplen.
- No se incorporan funcionalidades fuera de alcance.

---
