# SPEC-006 — Especificación: Gestión de ofertas y promociones

**Responsable:** Axel Andree Cueva Alcalá  
**Rama:** cueva  
**Trazabilidad:** HU [HU-006](../hu/HU-006-gestion-ofertas-promociones.md) | Wireframe [WF-006](../wireframes/flows/WF-006-gestion-ofertas-promociones.md)

## 1. Contexto

El proyecto consiste en un Marketplace Multicanal para productos deportivos, organizado en módulos integrados mediante APIs. Dentro del Módulo de Productos y Ofertas, una funcionalidad obligatoria es la gestión de ofertas y promociones.

Esta capacidad concentra la lógica para registrar promociones, validar fechas, estado y condiciones, calcular descuentos y resolver conflictos cuando más de un beneficio puede aplicarse a una compra.

## 2. Propósito

Permitir al Gestor Comercial administrar promociones y permitir que los canales de venta consulten y evalúen correctamente los beneficios aplicables a productos y compras.

## 3. Alcance

Incluye:
- Registrar, consultar, modificar, activar y desactivar promociones.
- Asociar promociones a productos completos o a SKUs vendibles específicos.
- Gestionar descuentos por porcentaje o monto fijo.
- Validar vigencia, estado y productos participantes.
- Evaluar promociones aplicables.
- Resolver múltiples promociones automáticas válidas.
- Resolver la coincidencia entre beneficios mediante una política de combinación configurable por promoción, manteniendo por defecto el comportamiento exclusivo del MVP cuando no se habilite una combinación.
- Configurar canales habilitados (`MARKETPLACE`, `CHATBOT`, `RETAIL` o todos) y prioridad comercial.
- Preservar el beneficio registrado en pedidos ya confirmados.

## 4. Requisitos

### Requisito 1: Registrar promociones

El sistema DEBE permitir registrar una promoción indicando como mínimo nombre, tipo de descuento, valor, fecha/hora de inicio y fin, modalidad obligatoria `AUTOMATICA` o `CUPON`, estado inicial —ACTIVA o INACTIVA—, alcance asociado (uno o más productos y/o SKUs vendibles), `prioridad`, `canales_habilitados` y política de combinación. La política declara expresamente si puede coexistir con `OFERTA_PRICING`, `PROMOCION_AUTOMATICA` y/o `CUPON`; por defecto todas las combinaciones son `false` para conservar un comportamiento seguro y explícito.

La fecha de inicio DEBE ser anterior a la fecha de fin. La lista de canales vacía se interpreta como todos los canales soportados.

### Requisito 2: Validar valores de descuento

Para descuento porcentual, el valor DEBE ser mayor que 0 y menor o igual que 100.

Para descuento de monto fijo, el valor DEBE ser mayor que 0. El monto fijo se aplica una sola vez sobre el subtotal elegible de la evaluación y no por unidad.

Ningún descuento puede producir un importe resultante negativo. Si el descuento calculado supera el subtotal elegible, se limita a dicho subtotal.

### Requisito 3: Modificar promociones

El sistema DEBE permitir modificar los datos configurables de una promoción existente, conservando la última configuración válida cuando una modificación sea rechazada.

Modificar una promoción no altera los descuentos ya registrados en pedidos confirmados.

### Requisito 4: Activar y desactivar promociones

El sistema DEBE permitir activar o desactivar una promoción sin eliminarla.

Una promoción inactiva no participa en nuevas evaluaciones.

Desactivar una promoción no altera descuentos ya registrados en pedidos confirmados.

### Requisito 5: Evaluar promociones aplicables

El sistema DEBE considerar únicamente promociones que:
- correspondan al producto o SKU evaluado según el alcance configurado;
- estén activas;
- se encuentren dentro de su periodo de vigencia;
- estén habilitadas para el canal que solicita la evaluación.

El cálculo utiliza el precio regular vigente por SKU suministrado por Pricing como base. La oferta de Pricing y otros beneficios solo se combinan cuando las políticas de todas las piezas involucradas lo permiten; una ausencia de autorización expresa se interpreta como incompatibilidad.

### Requisito 6: Resolver múltiples promociones automáticas
Cuando varias promociones `AUTOMATICA` sean válidas, el motor no asume que todas son excluyentes. Construye únicamente las combinaciones autorizadas por sus políticas, respeta la prioridad comercial y evita aplicar dos veces una misma promoción o una combinación no declarada. Para las promociones compatibles que actúan sobre las mismas líneas, se usa un orden determinista por `prioridad` ascendente y luego `promotion_id`; cada paso opera con decimal exacto y la presentación redondea al final de la línea. Entre todas las combinaciones válidas, el motor selecciona la que produzca el menor importe final para la misma cesta. Si ninguna combinación múltiple es válida, se mantiene la mejor alternativa individual.

### Requisito 7: Resolver promoción automática, cupón y oferta de Pricing
Una oferta de Pricing, una promoción automática y un cupón pueden coexistir **solo cuando las políticas de combinación de las promociones involucradas lo permiten**. El sistema evalúa alternativas individuales y combinaciones permitidas sobre el total de la misma cesta, manteniendo intactas las líneas no elegibles, y selecciona el menor importe final. En empate exacto se elige primero la alternativa que no consuma cupón; luego la de menor valor de `prioridad`; finalmente se usa el identificador estable como desempate técnico. El cupón solo podrá consumirse si forma parte del beneficio finalmente seleccionado.

### Requisito 7.1: Alcance por producto o SKU
Una promoción puede configurarse:
- a nivel de producto, caso en el cual aplica a todos sus SKUs vendibles activos; o
- a nivel de SKU específico, caso en el cual solo aplica a las variantes/unidades indicadas.

Si una misma promoción incluye producto y SKU, la evaluación deduplica el alcance y aplica el beneficio una sola vez sobre cada unidad elegible.

### Requisito 8: Consultar promociones

El sistema DEBE permitir consultar promociones con su tipo de descuento, valor, productos participantes, estado, periodo de vigencia, prioridad, canales habilitados y política de combinación.

### Requisito 9: Exponer evaluación mediante API

La evaluación debe devolver como mínimo:
- identificador de la promoción seleccionada, si existe;
- importe original;
- descuento aplicado;
- importe resultante;
- motivo cuando no existe un beneficio aplicable.

### Política comercial compartida de precios y descuentos (decisión interna)
Pricing es propietario del `precio_regular`, `precio_oferta`, moneda, vigencia y scope por canal. Entrega esos valores separados a Promociones/Cupones. El precio de oferta de Pricing no obliga a excluir cualquier otro beneficio: la combinación depende de la `politica_combinacion` de las promociones involucradas. Pricing no evalúa cupones ni promociones; únicamente resuelve el precio propio del SKU para el canal y momento solicitados.

Esta política es una **decisión interna provisional de comercialización**, pendiente de homologación en los contratos con Ventas/Postventa. En pedidos confirmados Ventas conserva el snapshot del precio y de los beneficios aplicados.

### Requisito 5: Inicialización de precio y contrato de auditoría
La creación del precio base se solicita a Pricing mediante comando idempotente con `product_id`, `sku_base`, `precio_regular`, `motivo_cambio=ALTA_PRODUCTO`, identidad del actor y correlación. Pricing registra el primer precio con `tipo_operacion=CREACION`, `precio_anterior=null` y `variacion_porcentual=null`, emite `pricing.price.changed` con ese contrato **solo después del commit** y confirma la preparación a Catálogo. Las modificaciones posteriores usan `tipo_operacion=MODIFICACION`, precio anterior y variación calculada. El evento es un hecho ocurrido; nunca sirve como orden para realizar el cambio.

### Requisito 6: Distinguir importaciones
La carga exclusiva de precios de esta funcionalidad garantiza All-or-Nothing **solo dentro de Pricing** cuando `allow_partial=false`; el modo parcial permite persistir filas válidas en transacción local. La importación general de `SPEC-001-carga-exportacion-masiva-productos.md` coordina Catálogo, Pricing e Inventario y **no promete atomicidad entre dominios**. El Worker recibe comandos idempotentes por dominio y retorna resultados correlacionados; no consume `pricing.price.changed` como instrucción. La respuesta inicial de una importación asíncrona es HTTP 202 con `batch_id`, y su éxito/fallo se consulta por estado.

## 5. Requisitos no funcionales
- Rendimiento objetivo: actualización individual < 300 ms; consulta histórica/vigente < 100 ms bajo carga de referencia. Para 5,000 registros, procesamiento asíncrono medible y no bloqueante; 10 segundos es una meta a validar con benchmark del entorno, no un plazo garantizado ante caídas, reintentos o cuotas Free Tier.
- Seguridad: Endpoints protegidos mediante token emitido por Seguridad y Usuarios y permisos como `PRICING_READ`, `PRICING_WRITE` y `PRICING_BULK_WRITE`; Productos y Ofertas no define qué roles globales reciben esos permisos. Validación rigurosa del MIME type y tamaño máximo de archivo (máx. 10 MB).
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
