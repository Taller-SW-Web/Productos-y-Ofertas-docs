# API Contract — Módulo de Productos y Ofertas

**Fecha:** 2026-09-23  
**Módulo propietario:** Productos y Ofertas  
**Ruta recomendada:** `contracts/API_CONTRACT.md`

**Fuentes normativas y de diseño:**
- `specs/SPEC-001` a `specs/SPEC-016`
- `hu/HU-001` a `hu/HU-016`
- `wireframes/flows/WF-001` a `wireframes/flows/WF-016`
- `architecture/arquitectura-modulo-productos-ofertas.md`
- `architecture/modelos-conceptuales-datos.md`

> Este archivo documenta el **contrato de integración a nivel de módulo**: qué información necesita Productos y Ofertas de otros módulos, qué información expone o publica, quién es propietario de cada dato y qué contratos siguen pendientes de homologación.
>
> Las rutas o payloads no definidos por las SPEC se marcan expresamente como `TBD` o `PROPUESTO`; no deben tratarse como contratos externos homologados.

---

# 1. Propósito

Definir los intercambios de información entre el módulo **Productos y Ofertas** y los demás módulos/canales del Marketplace Multicanal, evitando:

- acceso directo a bases de datos ajenas;
- duplicación de ownership;
- contratos ambiguos;
- uso de eventos como si fueran comandos;
- dependencias síncronas no documentadas;
- asumir integraciones con Ventas/Postventa o Despacho que todavía no han sido homologadas.

El contrato cubre:

1. Información que Productos y Ofertas **necesita recibir**.
2. Información que Productos y Ofertas **expone por API**.
3. Eventos/resultados que Productos y Ofertas **publica**.
4. Contratos provisionales con Ventas/Postventa.
5. Dependencias de Seguridad y Usuarios.
6. Consumo por Marketplace, Chatbot y Retail.
7. Límites de responsabilidad y ownership.

---

# 2. Estado de los contratos

Se utilizan los siguientes estados:

| Estado | Significado |
|---|---|
| `DOCUMENTADO` | La semántica está definida en SPEC/HU/WF. |
| `PROPUESTO_INTERNO` | Diseño derivado de la arquitectura para comunicación entre bounded contexts del mismo módulo. |
| `PROVISIONAL_EXTERNO` | Necesario para integrar con otro equipo, pero nombres/payloads finales no han sido homologados. |
| `TBD` | Existe la necesidad, pero la documentación no define aún forma, ruta o payload suficiente. |
| `PUBLICO` | Contrato explícitamente expuesto para consumo público de solo lectura. |

---

# 3. Principios de integración

## 3.1 Ownership

Cada dato tiene un único propietario.

Productos y Ofertas **no** accede a tablas de otros módulos y otros módulos **no** acceden a los schemas internos de Productos y Ofertas.

Los datos compartidos viajan como:

- identificadores opacos;
- payloads HTTP;
- eventos;
- comandos;
- resultados;
- snapshots;
- proyecciones locales reconstruibles.

No existen foreign keys entre bases de distintos módulos.

---

## 3.2 HTTP vs mensajería

### HTTP/HTTPS

Se utiliza para:

- consultas autoritativas;
- APIs de lectura;
- evaluación solicitada por canales;
- operaciones administrativas del frontend;
- endpoints públicos de SEO.

### Mensajería asíncrona

Se utiliza para:

- hechos posteriores a commit;
- coordinación de operaciones largas;
- consumo/compensación de inventario;
- confirmación de uso de cupones;
- sincronización de proyecciones;
- comandos/resultados internos.

---

## 3.3 Evento ≠ comando

Ejemplo:

```text
pricing.price.changed
```

significa:

> “el precio ya cambió y fue persistido”.

No significa:

> “cambia este precio”.

De la misma manera:

```text
inventory.stock.changed
```

es un hecho confirmado, no una instrucción para modificar stock.

---

## 3.4 Consistencia

- Dentro de cada bounded context: consistencia transaccional local.
- Entre contextos/módulos: consistencia eventual.
- No existe transacción SQL distribuida entre servicios.
- Los contratos asíncronos deben ser idempotentes.
- Las consultas de proyecciones pueden presentar retraso identificable.
- Las operaciones críticas revalidan con el servicio propietario.

---

# 4. Módulos y sistemas externos identificados

| Sistema / módulo externo | Relación con Productos y Ofertas | Estado general |
|---|---|---|
| Marketplace Cliente | Consume catálogo, precios, promociones, recomendaciones, combos, stock y SEO | `DOCUMENTADO` a nivel semántico |
| Chatbot Cliente | Consume catálogo, variantes, precios, promociones, recomendaciones y stock | `DOCUMENTADO` a nivel semántico |
| Retail Vendedor | Consume catálogo, variantes, precios, promociones, recomendaciones y stock | `DOCUMENTADO` a nivel semántico |
| Ventas y Postventa | Cotización/beneficios, confirmación, cancelación, devolución y consumo de cupón/stock | `PROVISIONAL_EXTERNO` |
| Despacho y Entrega | No debe consumir stock nuevamente; relación logística fuera del módulo | `TBD / sin contrato directo requerido actualmente` |
| Seguridad y Usuarios | Emite identidad, JWT/permisos y es owner de identidad de usuario/cliente | `DOCUMENTADO` semánticamente; claims/rutas finales `TBD` |

---

# 5. Resumen global de intercambio

| ID | Dirección | Contraparte | Información principal | Mecanismo | Estado |
|---|---|---|---|---|---|
| EXT-IN-SEC-01 | Entrada | Seguridad y Usuarios | JWT, identidad y permisos | HTTP/JWT + JWKS | `DOCUMENTADO/TBD técnico` |
| EXT-IN-SEC-02 | Entrada/referencia | Seguridad y Usuarios | `customer_ref` estable | contrato de identidad | `DOCUMENTADO/TBD transporte` |
| EXT-IN-SALES-01 | Entrada | Ventas/Postventa | confirmación definitiva de pedido | evento/mensaje | `PROVISIONAL_EXTERNO` |
| EXT-IN-SALES-02 | Entrada | Ventas/Postventa | cancelación | evento/mensaje | `PROVISIONAL_EXTERNO` |
| EXT-IN-SALES-03 | Entrada | Ventas/Postventa | devolución físicamente aceptada | evento/mensaje | `PROVISIONAL_EXTERNO` |
| EXT-OUT-CAT-01 | Salida | Marketplace/Chatbot/Retail | catálogo activo | HTTP | `DOCUMENTADO` |
| EXT-OUT-CAT-02 | Salida | Marketplace/Chatbot/Retail | variantes/SKU | HTTP | `DOCUMENTADO` |
| EXT-OUT-TAX-01 | Salida | Canales | árbol de categorías activas | HTTP | `DOCUMENTADO` |
| EXT-OUT-TAX-02 | Salida | Canales | marcas activas | HTTP | `DOCUMENTADO` |
| EXT-OUT-PRICE-01 | Salida | Canales/Ventas | precio vigente por SKU/canal | HTTP | `DOCUMENTADO` |
| EXT-OUT-PROMO-01 | Salida | Canales/Ventas | evaluación de beneficios | HTTP | `DOCUMENTADO` semánticamente |
| EXT-OUT-COUPON-01 | Salida | Canales/Ventas | validación de cupón sin consumo | HTTP | `DOCUMENTADO` semánticamente |
| EXT-OUT-REC-01 | Salida | Marketplace/Chatbot/Retail | candidatos Cross-sell/Upsell | HTTP | `DOCUMENTADO` |
| EXT-OUT-COMBO-01 | Salida | Canales/Ventas | combo y disponibilidad informativa | HTTP | `DOCUMENTADO` semánticamente |
| EXT-OUT-INV-01 | Salida | Marketplace/Chatbot/Retail/Ventas | disponibilidad por SKU | HTTP | `DOCUMENTADO` |
| EXT-OUT-SEO-01 | Salida | Marketplace/Canales | metadatos SEO por slug activo | HTTP público | `PUBLICO` |
| EXT-OUT-SEO-02 | Salida | Marketplace | resolución `old_slug -> new_slug` | HTTP/API | `DOCUMENTADO` |
| EXT-OUT-SALES-01 | Salida | Ventas/Postventa | resultado de consumo de inventario | evento/resultado | `PROVISIONAL_EXTERNO` |
| EXT-OUT-SALES-02 | Salida | Ventas/Postventa | resultado de consumo de cupón | evento/resultado | `PROVISIONAL_EXTERNO` |

---

# 6. Información que Productos y Ofertas necesita de Seguridad y Usuarios

## 6.1 EXT-IN-SEC-01 — Identidad y autorización

**Productor:** Seguridad y Usuarios  
**Consumidor:** Productos y Ofertas  
**Mecanismo:** JWT firmado + claves públicas/JWKS  
**Estado:** `DOCUMENTADO` en responsabilidad; formato final `TBD`

Productos y Ofertas necesita autenticar y autorizar operaciones administrativas.

Información requerida conceptualmente:

| Dato | Uso |
|---|---|
| Identidad estable del usuario | actor de la operación |
| Permisos/claims | autorización |
| Vigencia del token | autenticación |
| Email del usuario, cuando el contrato de auditoría de Pricing lo requiera | `usuario_email` en auditoría |
| Identidad estable de cliente (`customer_ref`) cuando aplique | límites de cupón por cliente |

### Reglas

- Productos y Ofertas no administra usuarios.
- Productos y Ofertas no define qué roles globales reciben los permisos.
- Cada entrada HTTP sensible valida localmente identidad/autorización.
- El frontend no es autoridad de seguridad.
- No se almacena el JWT como dato de negocio.
- No se comparte la base de Seguridad y Usuarios.

### Configuración técnica pendiente

```text
AUTH_ISSUER = TBD
AUTH_JWKS_URL = TBD
AUTH_AUDIENCE = TBD si aplica
claims exactos de permisos = TBD
```

No deben fijarse rutas o claims definitivos hasta homologarlos con el equipo de Seguridad y Usuarios.

---

## 6.2 EXT-IN-SEC-02 — `customer_ref`

**Owner:** Seguridad y Usuarios  
**Consumidores internos:** Promociones/Cupones  
**Estado:** `DOCUMENTADO` conceptualmente; transporte `TBD`

Productos y Ofertas puede almacenar:

```json
{
  "customer_ref": "opaque-customer-id"
}
```

únicamente para:

- límite de usos de cupón por cliente;
- consumo idempotente;
- restitución cuando aplique.

No debe replicar:

- nombre;
- dirección;
- documento;
- teléfono;
- perfil completo del cliente;
- credenciales.

### Obtención

La documentación no fija si `customer_ref`:

- llega desde el canal;
- llega dentro del pedido de Ventas;
- forma parte de un token;
- se consulta a Seguridad.

Por tanto, el mecanismo exacto queda `TBD`.

---

# 7. Información que Productos y Ofertas necesita de Ventas y Postventa

Todos los contratos de esta sección son **provisionales**.

Los nombres `order.confirmed`, `order.cancelled` y `order.returned` reflejan la documentación actual, pero **no se consideran homologados con el equipo externo**.

---

## 7.1 Envelope común recomendado

```json
{
  "message_id": "uuid",
  "kind": "event",
  "name": "order.confirmed",
  "schema_version": 1,
  "operation_id": "uuid",
  "correlation_id": "uuid",
  "causation_id": "uuid-or-null",
  "occurred_at": "2026-09-23T00:00:00Z",
  "producer": "ventas-postventa",
  "data": {}
}
```

El envelope proviene de la arquitectura del módulo y deberá ser homologado en AsyncAPI.

---

## 7.2 EXT-IN-SALES-01 — Confirmación definitiva de pedido

**Nombre actual:** `order.confirmed`  
**Estado:** `PROVISIONAL_EXTERNO`

### Objetivo

Permitir:

- consumo definitivo de Inventario;
- consumo de cupón si el cupón fue el beneficio finalmente seleccionado;
- validación idempotente por pedido/operación;
- tratamiento de combos según snapshot confirmado.

### Datos mínimos documentados

```json
{
  "order_id": "ORD-...",
  "operation_id": "uuid",
  "lines": [
    {
      "sku": "SKU-...",
      "quantity": 1
    }
  ],
  "selected_benefit": {
    "cupon_id": "optional"
  },
  "customer_ref": "optional",
  "combo": {
    "combo_id": "optional",
    "combo_version": "optional",
    "components_snapshot": []
  },
  "contract_version": 1
}
```

### Notas de obligatoriedad

- `order_id`: obligatorio.
- `operation_id`: obligatorio.
- `sku` + cantidad: obligatorios para consumo.
- `customer_ref`: obligatorio cuando el cupón seleccionado tiene límite por cliente.
- `cupon_id`: necesario cuando el beneficio finalmente elegido incluye cupón.
- snapshot/version de combo: requerido cuando la compra confirmada contiene combo.
- `location_id`: debe acordarse cuando el consumo no pueda resolverse de forma inequívoca a una única ubicación. La documentación actual no fija todavía su campo definitivo dentro de `order.confirmed`.

### Efectos internos

1. Inventario verifica existencia/elegibilidad/stock.
2. Consume todas las líneas de la operación en transacción local ACID.
3. Registra Kardex e idempotencia.
4. Promociones/Cupones revalida el cupón seleccionado.
5. Solo el cupón elegido consume uso.
6. Productos y Ofertas no modifica el estado del pedido ni procesa el pago.

---

## 7.3 EXT-IN-SALES-02 — Cancelación

**Nombre actual:** `order.cancelled`  
**Estado:** `PROVISIONAL_EXTERNO`

### Objetivo

- liberar una reserva homologada todavía pendiente; o
- compensar un consumo previo cuando la cancelación ocurra antes del despacho;
- restaurar uso de cupón solo si su `politica_cancelacion` lo indica.

### Datos conceptualmente necesarios

```json
{
  "order_id": "ORD-...",
  "operation_id": "uuid",
  "original_operation_id": "uuid",
  "lines": [
    {
      "sku": "SKU-...",
      "quantity": 1,
      "location_id": "optional-or-required-by-final-contract"
    }
  ]
}
```

Además, el contrato final debe transportar información suficiente para determinar que la compensación de inventario corresponde según el estado de cumplimiento/despacho.

**El nombre exacto de ese campo no está definido en las SPEC y queda `TBD`.**

### Reglas

- No compensar dos veces.
- No acreditar stock que nunca fue consumido/reservado.
- Una cancelación administrativa posterior al despacho no repone stock por sí sola.
- Cupones aplica su propia política de restitución.
- Productos y Ofertas no decide reembolso financiero.

---

## 7.4 EXT-IN-SALES-03 — Devolución aceptada

**Nombre actual:** `order.returned`  
**Estado:** `PROVISIONAL_EXTERNO`

### Objetivo

Reintegrar únicamente mercancía:

- aceptada por Postventa;
- físicamente reintegrable;
- en la ubicación comunicada.

### Datos mínimos

```json
{
  "order_id": "ORD-...",
  "operation_id": "uuid",
  "original_operation_id": "uuid",
  "lines": [
    {
      "sku": "SKU-...",
      "quantity": 1,
      "location_id": "LOC-..."
    }
  ]
}
```

### Reglas

- La devolución no implica reponer todas las líneas del pedido.
- La política de devolución total/parcial de combos pertenece a Ventas/Postventa.
- Inventario repone exactamente los SKU/cantidades aceptados.
- El procesamiento debe ser idempotente.
- Una devolución no autoriza a Productos y Ofertas a decidir reembolsos.

---

## 7.5 Reserva futura

Inventario soporta conceptualmente:

```text
reserve
release
consume
```

pero el flujo de reserva desde Ventas/Postventa **no está homologado**.

Mientras no exista contrato:

```text
order.created
```

no reserva ni descuenta stock por sí solo.

Si se homologa una reserva, el contrato deberá definir al menos:

- `order_id`;
- `operation_id`;
- SKU;
- cantidad;
- ubicación;
- expiración/TTL si aplica;
- correlación para `release` o `consume`.

---

# 8. Relación con Despacho y Entrega

## 8.1 Veredicto actual

**No se requiere actualmente un API directo de mutación de stock entre Despacho y Productos y Ofertas.**

La documentación establece:

- el consumo definitivo ocurre con la confirmación acordada de Ventas/Postventa;
- Despacho no consume nuevamente;
- una devolución repone solo tras aceptación física comunicada;
- costos/logística de despacho están fuera del alcance de Productos y Ofertas.

## 8.2 Dato necesario indirectamente

Para compensaciones por cancelación, Productos y Ofertas necesita saber si la operación cumple la condición acordada respecto del despacho.

La arquitectura recomendada es que esa evidencia forme parte del contrato homologado de Ventas/Postventa.

Un contrato directo con Despacho queda fuera de alcance.

---

# 9. APIs que Productos y Ofertas expone a Marketplace, Chatbot y Retail

Las rutas de esta sección permanecen `TBD` salvo cuando una SPEC muestra una ruta explícita.

Los payloads describen el **contrato semántico mínimo**, no un OpenAPI definitivo.

---

# 10. EXT-OUT-CAT-01 — Consulta de catálogo

**Owner interno:** `catalog-svc`  
**Consumidores:** Marketplace, Chatbot, Retail, Ventas/Postventa y otros módulos autorizados  
**Tipo:** HTTP GET  
**Ruta final:** `TBD`  
**Estado:** `DOCUMENTADO`

## 10.1 Consulta pública/comercial

Los canales solo reciben productos comercialmente elegibles/activos.

### Identificadores de búsqueda admitidos conceptualmente

- `product_id`;
- slug;
- filtros de categoría;
- marca;
- otros filtros de catálogo que se homologuen.

### Respuesta mínima conceptual

```json
{
  "product_id": "PRD-...",
  "slug": "producto-ejemplo",
  "name": "Producto ejemplo",
  "description": "Descripción",
  "categoria_id": "CAT-...",
  "tipo_producto_id": "TP-...",
  "marca_id": "BR-...",
  "tiene_variantes": true,
  "sku_base": "BASE-...",
  "status": "ACTIVO",
  "images": [],
  "attributes": []
}
```

### Límites de ownership

Este contrato no convierte a Catálogo en dueño de:

- precio vigente;
- oferta;
- stock;
- promociones;
- cupón;
- disponibilidad de combo.

Esos datos se consultan a sus respectivos owners o mediante BFF/read model.

---

# 11. EXT-OUT-CAT-02 — Consulta de variantes/SKU

**Owner interno:** `catalog-svc`  
**Consumidores:** Marketplace, Chatbot, Retail, Ventas/Postventa, Despacho cuando corresponda a identificación  
**Tipo:** HTTP GET  
**Ruta final:** `TBD`  
**Estado:** `DOCUMENTADO`

### Respuesta conceptual

```json
{
  "product_id": "PRD-...",
  "variants": [
    {
      "variant_id": "VAR-...",
      "sku": "SKU-...",
      "status": "ACTIVA",
      "identifying_attributes": [],
      "non_identifying_attributes": [],
      "images": []
    }
  ]
}
```

### Reglas

- `variant_id` es identidad interna de Catálogo.
- `sku` es identidad comercial/integración.
- No son equivalentes.
- Stock no se replica como propiedad de Catálogo.
- Precio no se persiste en Catálogo como precio vigente autoritativo.

---

# 12. EXT-OUT-TAX-01 — Categorías activas

**Owner interno:** `taxonomy-svc`  
**Consumidores:** Marketplace, Chatbot, Retail y Catálogo  
**Tipo:** HTTP GET  
**Ruta:** `TBD`  
**Estado:** `DOCUMENTADO`

### Respuesta conceptual

```json
{
  "categories": [
    {
      "categoria_id": "CAT-...",
      "parent_id": null,
      "name": "Categoría",
      "status": "ACTIVA"
    }
  ]
}
```

### Reglas

- La API comercial expone categorías activas.
- Las categorías sirven para navegación/clasificación.
- No se debe inferir esquema de atributos desde la categoría.
- El esquema de atributos depende de `tipo_producto_id`.

---

# 12.1 EXT-OUT-TAX-02 — Marcas activas

**Owner interno:** `taxonomy-svc`  
**Consumidores:** Marketplace, Chatbot, Retail y otros consumidores de catálogo autorizados  
**Tipo:** HTTP GET  
**Ruta:** `TBD`  
**Estado:** `DOCUMENTADO`

### Respuesta conceptual

```json
{
  "brands": [
    {
      "marca_id": "BR-...",
      "name": "Marca",
      "description": "optional",
      "logo_url": "optional",
      "country_code": "optional",
      "status": "ACTIVA"
    }
  ]
}
```

### Reglas

- La marca es dato maestro de Taxonomía.
- Catálogo únicamente referencia `marca_id`; no duplica ownership.
- Los canales pueden usar esta API para navegación/filtros.
- Las marcas inactivas no deben presentarse como opciones comerciales activas.
- La ruta y el esquema HTTP definitivo deben formalizarse en OpenAPI.

---

# 13. EXT-OUT-PRICE-01 — Precio vigente por SKU y canal

**Owner interno:** `pricing-svc`  
**Consumidores:** Marketplace, Chatbot, Retail, Ventas/Postventa, Promociones, Combos  
**Tipo:** HTTP GET / API de lectura  
**Ruta actual explícita para as-of:**

```text
GET /api/v1/pricing/skus/{sku}/price?at={ISO-8601}
```

Para consulta corriente/canal, ruta final general: `TBD`.

**Estado:** `DOCUMENTADO`

### Entrada conceptual

```json
{
  "sku": "SKU-...",
  "channel_id": "MARKETPLACE",
  "at": "2026-09-23T00:00:00Z"
}
```

`at` puede representar ahora o una consulta histórica.

### Respuesta mínima

```json
{
  "sku": "SKU-...",
  "precio_regular": 200.00,
  "precio_oferta": 170.00,
  "currency": "PEN",
  "channel_id": "MARKETPLACE",
  "valid_from": "2026-09-01T00:00:00Z",
  "valid_until": null,
  "price_version": 8
}
```

### Reglas

- `precio_oferta` es opcional.
- Ausencia de oferta no equivale a `0`.
- Pricing no decide combinabilidad con promociones/cupones.
- Una variante puede usar override o fallback del producto.
- El pedido confirmado debe conservar snapshot de precios en el dominio de Ventas/Postventa.

---

# 14. EXT-OUT-PROMO-01 — Evaluación de promociones/beneficios

**Owner interno:** `promotions-svc`  
**Consumidores:** Marketplace, Chatbot, Retail, Ventas/Postventa  
**Tipo:** HTTP/API  
**Ruta:** `TBD`  
**Estado:** `DOCUMENTADO` en semántica; request final `TBD`

## 14.1 Información necesaria para evaluar

De las reglas funcionales se deriva que la evaluación necesita como mínimo:

- líneas/productos/SKU de la cesta;
- cantidades;
- canal;
- contexto temporal;
- cupón candidato cuando exista;
- `customer_ref` cuando el cupón use límite por cliente.

La forma final del request debe homologarse.

### Payload propuesto para OpenAPI

```json
{
  "channel_id": "MARKETPLACE",
  "at": "2026-09-23T00:00:00Z",
  "lines": [
    {
      "product_id": "PRD-...",
      "sku": "SKU-...",
      "quantity": 1
    }
  ],
  "coupon_code": null,
  "customer_ref": null
}
```

> Este request es una **propuesta técnica derivada de los requisitos**. La SPEC define la evaluación y su salida mínima, pero no fija todavía este JSON exacto.

## 14.2 Respuesta mínima garantizada por SPEC

```json
{
  "promotion_id": "PROMO-001",
  "original_amount": 200.00,
  "discount_amount": 30.00,
  "result_amount": 170.00,
  "reason": null
}
```

Si no aplica un beneficio:

```json
{
  "promotion_id": null,
  "original_amount": 200.00,
  "discount_amount": 0.00,
  "result_amount": 200.00,
  "reason": "NO_APPLICABLE_BENEFIT"
}
```

### Reglas

- Solo promociones activas, vigentes y del canal.
- El alcance puede ser por Producto o por SKU.
- Se deduplican unidades cubiertas por ambos scopes.
- Solo se evalúan combinaciones expresamente permitidas.
- En empate exacto:
  1. alternativa sin cupón;
  2. menor `prioridad`;
  3. identificador estable.
- La evaluación no consume cupón.

---

# 15. EXT-OUT-COUPON-01 — Validación de cupón sin consumo

**Owner interno:** `promotions-svc`  
**Consumidores:** Marketplace, Chatbot, Retail, Ventas/Postventa  
**Tipo:** HTTP/API  
**Ruta:** `TBD`  
**Estado:** `DOCUMENTADO`

### Entrada conceptual

```json
{
  "coupon_code": "DEPORTE20",
  "customer_ref": "optional",
  "channel_id": "MARKETPLACE",
  "lines": [
    {
      "product_id": "PRD-...",
      "sku": "SKU-...",
      "quantity": 1
    }
  ]
}
```

El request exacto queda pendiente de OpenAPI, pero:

- `coupon_code` es necesario;
- `customer_ref` es necesario cuando existe límite por cliente;
- debe existir contexto de compra suficiente para validar monto mínimo y elegibilidad.

### Respuesta mínima definida por SPEC

```json
{
  "valid": true,
  "rejection_reason": null,
  "benefit": {
    "promotion_id": "PROMO-..."
  },
  "discount_amount": 20.00,
  "result_amount": 180.00
}
```

### Regla crítica

**Validar no consume.**

El consumo ocurre únicamente cuando Ventas/Postventa confirma definitivamente el pedido y el cupón fue seleccionado.

---

# 16. EXT-OUT-REC-01 — Recomendaciones Cross-sell / Upsell

**Owner interno:** `promotions-svc`  
**Consumidores:** Marketplace, Chatbot, Retail  
**Tipo:** HTTP GET/API  
**Ruta:** `TBD`  
**Estado:** `DOCUMENTADO`

## 16.1 Entrada

El canal debe identificar el producto consultado; el servicio resuelve internamente reglas por:

- producto origen;
- o categoría del producto origen.

El request exacto queda `TBD`.

## 16.2 Respuesta mínima definida

```json
{
  "recommendations": [
    {
      "product_id": "PRD-REC-001",
      "type": "CROSS_SELL",
      "rule_priority": 1,
      "presentation_order": 1,
      "current_price": 89.90,
      "availability": "AVAILABLE"
    }
  ]
}
```

Si no existen resultados:

```json
{
  "recommendations": []
}
```

### Reglas

- filtrar productos inexistentes/inactivos;
- filtrar sin stock disponible;
- deduplicar;
- el precio es informativo;
- no garantiza stock/precio hasta la cotización final;
- Chatbot conserva la interpretación conversacional;
- Productos y Ofertas no personaliza por lenguaje natural.

---

# 17. EXT-OUT-COMBO-01 — Consulta de combo y disponibilidad informativa

**Owner interno:** `combos-svc`  
**Consumidores:** Marketplace, Chatbot, Retail, Ventas/Postventa  
**Tipo:** HTTP GET/API  
**Ruta:** `TBD`  
**Estado:** `DOCUMENTADO` semánticamente

### Respuesta conceptual

```json
{
  "combo_id": "COMBO-...",
  "status": "ACTIVO",
  "price": 120.00,
  "components": [
    {
      "sku": "SKU-A",
      "quantity": 1
    },
    {
      "sku": "SKU-B",
      "quantity": 2
    }
  ],
  "informative_availability": 3,
  "calculated_at": "2026-09-23T00:00:00Z",
  "freshness": "CURRENT"
}
```

`freshness` es conceptual; el nombre final puede cambiar.

### Reglas

- mínimo dos SKU distintos;
- no admite combos anidados;
- disponibilidad es informativa;
- si la proyección está ausente/obsoleta, no convertirla automáticamente a cero;
- Inventario revalida al confirmar el pedido;
- la consulta no constituye reserva.

---

# 18. EXT-OUT-INV-01 — Consulta de disponibilidad

**Owner interno:** `inventory-svc`  
**Consumidores:** Marketplace, Chatbot, Retail, Ventas/Postventa  
**Tipo:** HTTP GET/API  
**Ruta:** `TBD`  
**Estado:** `DOCUMENTADO`

## 18.1 Entrada

```json
{
  "sku": "SKU-...",
  "location_id": "optional"
}
```

`location_id`:

- puede omitirse si existe una única ubicación inequívoca;
- es necesario para consultar una ubicación concreta;
- debe formar parte del contrato cuando existen múltiples ubicaciones.

## 18.2 Respuesta mínima

```json
{
  "sku": "SKU-...",
  "location_id": "LOC-...",
  "on_hand": 10,
  "reserved": 2,
  "available": 8,
  "status": "DISPONIBLE"
}
```

### Reglas

```text
available = 0                 => AGOTADO
0 < available <= threshold    => STOCK_BAJO
available > threshold         => DISPONIBLE
```

La consulta puede agregar ubicaciones cuando el contrato del canal lo permita, pero el saldo autoritativo sigue siendo por:

```text
(sku, location_id)
```

La consulta no reserva stock.

---

# 19. EXT-OUT-SEO-01 — Metadatos públicos por slug

**Owner interno:** `taxonomy-svc`  
**Consumidores:** Marketplace y otros canales públicos  
**Tipo:** HTTP GET público  
**Ruta:** `TBD`  
**Autenticación:** no requerida para la lectura pública documentada  
**Estado:** `PUBLICO`

### Entrada

```text
slug activo
```

### Respuesta mínima

```json
{
  "slug": "futbol",
  "meta_title": "Fútbol",
  "meta_description": "..."
}
```

### Reglas

- solo slug activo;
- solo lectura;
- una categoría inactiva no se expone como publicada;
- límites 70/160 son recomendaciones con advertencia administrativa, no parte de la lectura.

---

# 20. EXT-OUT-SEO-02 — Resolución de slug anterior

**Owner interno:** `taxonomy-svc`  
**Consumidor principal:** Marketplace  
**Tipo:** HTTP/API de lectura  
**Ruta:** `TBD`  
**Estado:** `DOCUMENTADO`

### Entrada

```json
{
  "old_slug": "running-antiguo"
}
```

### Respuesta conceptual

```json
{
  "old_slug": "running-antiguo",
  "new_slug": "running-nuevo",
  "resolution": "PERMANENT"
}
```

### Responsabilidad

Productos y Ofertas:

- conserva historial;
- resuelve `old_slug -> new_slug`.

Marketplace:

- recibe/replica la resolución;
- ejecuta HTTP `301 Moved Permanently`.

Productos y Ofertas **no** controla la respuesta web pública del Marketplace.

---

# 21. Resultados que Productos y Ofertas devuelve a Ventas/Postventa

---

## 21.1 EXT-OUT-SALES-01 — Resultado de consumo de inventario

**Productor:** `inventory-svc`  
**Consumidor:** Ventas/Postventa  
**Estado:** `PROVISIONAL_EXTERNO`

Nombres actuales:

```text
inventory.consumption.completed
inventory.consumption.rejected
```

### Resultado propuesto mínimo

```json
{
  "order_id": "ORD-...",
  "operation_id": "uuid",
  "result": "COMPLETED",
  "lines": [
    {
      "sku": "SKU-...",
      "quantity": 1
    }
  ],
  "reason": null
}
```

Rechazo:

```json
{
  "order_id": "ORD-...",
  "operation_id": "uuid",
  "result": "REJECTED",
  "lines": [],
  "reason": "INSUFFICIENT_STOCK"
}
```

### Límites

Inventario:

- no cambia el estado del pedido;
- no anula el pago;
- no procesa reembolso;
- solo informa resultado del movimiento.

Ventas/Postventa decide el tratamiento comercial/financiero.

---

## 21.2 EXT-OUT-SALES-02 — Resultado de consumo de cupón

**Productor:** `promotions-svc`  
**Consumidor:** Ventas/Postventa  
**Estado:** `PROVISIONAL_EXTERNO`

Nombres actuales documentados:

```text
promotions.coupon.consumption.completed
promotions.coupon.consumption.rejected
```

### Payload mínimo

```json
{
  "order_id": "ORD-...",
  "operation_id": "uuid",
  "cupon_id": "COUPON-...",
  "result": "COMPLETED",
  "reason": null
}
```

o:

```json
{
  "order_id": "ORD-...",
  "operation_id": "uuid",
  "cupon_id": "COUPON-...",
  "result": "REJECTED",
  "reason": "LIMIT_EXHAUSTED"
}
```

### Reglas

- idempotencia por `order_id + cupon_id`;
- no consumir si el beneficio final no incluye cupón;
- revalidar elegibilidad en confirmación;
- un rechazo posterior al pago no genera reembolso desde Promociones.

---

# 22. Eventos de Productos y Ofertas relevantes para integración

Algunos eventos ya existen como contratos internos del módulo y pueden alimentar:

- BFF;
- proyecciones;
- canales;
- integraciones externas futuras.

Que un evento sea interno **no significa que otro equipo pueda consumirlo sin homologación**.

| Evento | Owner | Semántica | Exposición externa |
|---|---|---|---|
| `taxonomy.category.updated` | Taxonomía | categoría actualizada | por acordar |
| `catalog.product.deactivated` | Catálogo | producto dado de baja lógica | por acordar |
| `catalog.sku.deactivated` | Catálogo | SKU deja de ser vendible | por acordar |
| `pricing.price.changed` | Pricing | precio ya persistido | por acordar; usado internamente |
| `inventory.stock.changed` | Inventario | saldo/estado cambió | por acordar; usado en proyecciones |
| `inventory.stock.adjusted` | Inventario | ajuste persistido + Kardex | principalmente interno |
| `inventory.consumption.completed|rejected` | Inventario | resultado de consumo | Ventas, provisional |
| `promotions.coupon.consumption.completed|rejected` | Promociones | resultado de cupón | Ventas, provisional |

---

# 23. Contratos internos entre bounded contexts

Estos contratos pertenecen a Productos y Ofertas y no requieren acuerdo con otros equipos, aunque deben formalizarse en AsyncAPI interno.

| Productor | Contrato | Consumidor |
|---|---|---|
| Taxonomía | `taxonomy.master.deactivation.check.requested` | Catálogo |
| Catálogo | `catalog.master.deactivation.checked` | Taxonomía |
| Taxonomía | `taxonomy.master.deactivated|rejected` | Catálogo/proyecciones |
| Bulk | `catalog.bulk.upsert.requested` | Catálogo |
| Catálogo | `catalog.bulk.upsert.completed|rejected` | Bulk |
| Bulk | `pricing.bulk.price.apply.requested` | Pricing |
| Pricing | `pricing.bulk.price.apply.completed|rejected` | Bulk |
| Bulk | `inventory.bulk.stock.adjust.requested` | Inventario |
| Inventario | `inventory.bulk.stock.adjust.completed|rejected` | Bulk |
| Pricing | `pricing.price.changed` | Auditoría/Promociones/BFF |
| Inventario | `inventory.stock.changed` | Dashboard/Combos/Promociones/BFF |

---

# 24. Identificadores intercambiados

| Identificador | Owner | Uso externo |
|---|---|---|
| `product_id` | Catálogo | catálogo, promociones, recomendaciones, ventas |
| `variant_id` | Catálogo | identidad interna estable de variante |
| `sku` | Catálogo | identidad comercial e integración |
| `sku_base` | Catálogo | base de producto; SKU vendible si producto simple |
| `categoria_id` | Taxonomía | clasificación/navegación |
| `marca_id` | Taxonomía | marca |
| `tipo_producto_id` | Taxonomía | esquema de atributos |
| `caracteristica_id` | Taxonomía | definición de característica |
| `valor_id` | Taxonomía | valor estable de LISTA |
| `promotion_id` | Promociones | beneficio |
| `cupon_id` | Promociones | cupón |
| `combo_id` | Combos | paquete comercial |
| `location_id` | Inventario | ubicación de saldo |
| `order_id` | Ventas/Postventa | correlación de pedido |
| `customer_ref` | Seguridad/Usuarios | control de uso por cliente |
| `batch_id` | Bulk | trazabilidad de operación masiva |
| `operation_id` | productor de operación | idempotencia/correlación |

---

# 25. Ownership explícito

| Dato | Owner |
|---|---|
| Producto / Variante / SKU | Productos y Ofertas — Catálogo |
| Categoría / Marca / Característica / Tipo Producto | Productos y Ofertas — Taxonomía |
| Precio regular/oferta | Productos y Ofertas — Pricing |
| Promoción / Cupón / Recomendación | Productos y Ofertas — Promociones |
| Combo | Productos y Ofertas — Combos |
| Stock / Kardex / ubicación | Productos y Ofertas — Inventario |
| Auditoría de precios | Productos y Ofertas — Price Audit |
| Lote de importación/exportación | Productos y Ofertas — Bulk |
| Usuario / permisos | Seguridad y Usuarios |
| Cliente / `customer_ref` | Seguridad y Usuarios |
| Pedido / pago / cancelación comercial | Ventas y Postventa |
| Política de devolución comercial | Ventas y Postventa |
| Ejecución HTTP 301 del storefront | Marketplace |
| Entrega física / logística | Despacho y Entrega |

---

# 26. Información que Productos y Ofertas NO debe solicitar

Para preservar bounded contexts:

## Seguridad y Usuarios

No solicitar ni persistir salvo necesidad contractual explícita:

- contraseña;
- hash;
- documento personal;
- perfil completo;
- sesiones internas;
- credenciales.

## Ventas/Postventa

No solicitar para tomar ownership:

- estado maestro del pedido para modificarlo;
- información de pago para procesarla;
- reglas de reembolso;
- política de devolución;
- facturación.

Puede recibir únicamente el contexto necesario para ejecutar su propia responsabilidad.

## Despacho

No debe:

- descontar nuevamente stock por despacho;
- convertir el evento de entrega en segundo consumo;
- usar la base de Despacho como fuente directa de inventario.

---

# 27. Seguridad de APIs

## 27.1 APIs administrativas

Requieren JWT emitido por Seguridad y Usuarios.

Permisos específicos dependen de la capacidad.

Ejemplos ya documentados:

```text
PRICING_READ
PRICING_WRITE
PRICING_BULK
PRICING_AUDIT_READ
PRICING_AUDIT_EXPORT
```

La asignación de esos permisos a roles pertenece a Seguridad y Usuarios.

## 27.2 APIs de canales

El esquema exacto de autenticación servicio-a-servicio queda por homologar.

No debe reutilizarse indiscriminadamente un JWT de usuario en jobs largos.

## 27.3 SEO público

El endpoint de metadatos por slug activo está documentado como lectura pública sin autenticación.

## 27.4 Mensajería

Debe usar:

- identidad/credenciales de servicio;
- permisos por exchange/queue;
- validación de esquema;
- `message_id`;
- correlación;
- idempotencia.

---

# 28. Idempotencia

## 28.1 Mensajes

Todo mensaje asíncrono debe incluir identificador estable.

Recomendado:

```json
{
  "message_id": "uuid",
  "operation_id": "uuid",
  "correlation_id": "uuid",
  "causation_id": "uuid-or-null",
  "schema_version": 1
}
```

## 28.2 Inventario

Consumo/compensación:

```text
order_id + tipo_operacion + sku
```

o una clave equivalente homologada que preserve unicidad semántica.

## 28.3 Cupón

```text
order_id + cupon_id
```

debe ser único.

## 28.4 Bulk

```text
batch_id + row_id + dominio/paso
```

permite reintentar sin duplicar efectos confirmados.

---

# 29. Concurrencia

## Pricing

Las escrituras basadas en una lectura previa utilizan:

```text
price_version
```

## Inventario

Los ajustes absolutos utilizan:

```text
stock_version
```

por:

```text
(sku, location_id)
```

## Catálogo/Bulk

Cuando corresponda:

```text
catalog_version
```

## Cupones

El límite global y por cliente se controla transaccionalmente.

---

# 30. Manejo de errores

## 30.1 HTTP

El error exacto debe formalizarse en OpenAPI.

Forma recomendada:

```json
{
  "error_code": "STABLE_MACHINE_CODE",
  "message": "Mensaje legible",
  "correlation_id": "uuid",
  "details": {}
}
```

Este formato es `PROPUESTO_INTERNO` hasta definir OpenAPI.

## 30.2 Mensajería

Un rechazo de negocio:

- no debe mandarse automáticamente a DLQ;
- devuelve un resultado `rejected`;
- indica motivo estable;
- no repite la mutación.

Un mensaje inválido/no interpretable sí puede ir a cuarentena/DLQ.

---

# 31. Consistencia y freshness

Las APIs agregadas o proyecciones pueden informar:

```text
as_of
source_version
freshness
```

cuando sea necesario.

Reglas:

- un read model no reemplaza al owner;
- disponibilidad de combo es informativa;
- consulta de stock no reserva;
- recomendación no garantiza stock/precio final;
- evaluación de cupón puede vencer antes de la confirmación;
- Ventas debe conservar snapshot de precio/beneficios confirmados.

---

# 32. Versionado

## 32.1 HTTP

Recomendación:

```text
/api/v1/...
```

Las rutas específicas deben formalizarse en OpenAPI.

## 32.2 Eventos

Todo mensaje versionado:

```json
{
  "schema_version": 1
}
```

Cambios rompientes requieren nueva versión de contrato.

## 32.3 Compatibilidad

Cambios compatibles:

- agregar campo opcional;
- agregar código de error nuevo documentado;
- ampliar enumeración solo cuando consumidores toleren valores desconocidos.

Cambios rompientes:

- renombrar/eliminar campos;
- cambiar semántica;
- convertir opcional en obligatorio;
- cambiar identidad o idempotencia;
- modificar unidad monetaria/cantidad sin versionar.

---

# 33. Contratos pendientes de homologación

| ID | Contraparte | Punto pendiente | Impacto |
|---|---|---|---|
| OPEN-01 | Seguridad y Usuarios | issuer/JWKS URI/claims exactos | autenticación |
| OPEN-02 | Seguridad y Usuarios | mecanismo de obtención de `customer_ref` | límite de cupones |
| OPEN-03 | Marketplace/Chatbot/Retail | rutas HTTP definitivas y auth servicio-a-servicio | consumo APIs |
| OPEN-04 | Ventas/Postventa | nombre/payload definitivo de confirmación | consumo stock/cupón |
| OPEN-05 | Ventas/Postventa | ubicación de inventario en confirmación | stock multiubicación |
| OPEN-06 | Ventas/Postventa | indicador verificable de cancelación previa al despacho | compensación |
| OPEN-07 | Ventas/Postventa | contrato de devolución aceptada | reintegro |
| OPEN-08 | Ventas/Postventa | manejo externo de rechazo de stock/cupón después de pago | compensación comercial |
| OPEN-09 | Ventas/Postventa | si existirá reserva previa y TTL | `reserved` |
| OPEN-10 | Marketplace | mecanismo preferido de resolución/replicación de slugs anteriores | HTTP 301 |
| OPEN-11 | Canales/Ventas | request definitivo de evaluación de promociones | cotización |
| OPEN-12 | Canales/Ventas | request definitivo de validación de cupón | cotización |
| OPEN-13 | Despacho | confirmar que no requiere contrato directo con Inventario | delimitación final |

---

# 34. Matriz de trazabilidad

| Contrato | Fuente principal |
|---|---|
| Catálogo activo por API | SPEC-003 / HU-003 / WF-003 |
| Variantes por API | SPEC-004 / HU-004 / WF-004 |
| Cupón: validación y consumo | SPEC-005 / HU-005 / WF-005 |
| Evaluación de promociones | SPEC-006 / HU-006 / WF-006 |
| Recomendaciones | SPEC-007 / HU-007 / WF-007 |
| Categorías activas | SPEC-008 / HU-008 / WF-008 |
| SEO/metadatos/resolución | SPEC-012 / HU-012 / WF-012 |
| Pricing | SPEC-013 / HU-013 / WF-013 |
| Auditoría de precio | SPEC-014 / HU-014 / WF-014 |
| Inventario / consumo externo | SPEC-015 / HU-015 / WF-015 |
| Dashboard reactivo | SPEC-016 / HU-016 / WF-016 |
| Bulk interno | SPEC-001 / HU-001 / WF-001 |
| Combos | SPEC-002 / HU-002 / WF-002 |

---

# 35. División de artefactos recomendada

Este archivo debe mantenerse como contrato humano transversal.

La formalización técnica debería dividirse después en:

```text
contracts/
├── API_CONTRACT.md
├── openapi/
│   ├── catalog-v1.yaml
│   ├── taxonomy-v1.yaml
│   ├── pricing-v1.yaml
│   ├── promotions-v1.yaml
│   ├── combos-v1.yaml
│   ├── inventory-v1.yaml
│   └── audit-v1.yaml
├── asyncapi/
│   ├── internal-v1.yaml
│   └── external-sales-provisional-v0.yaml
└── schemas/
    ├── common-envelope-v1.json
    ├── order-confirmed-provisional-v0.json
    ├── inventory-consumption-result-v0.json
    └── coupon-consumption-result-v0.json
```

---

# 36. Criterios para declarar un contrato externo homologado

Un contrato cambia de `PROVISIONAL_EXTERNO` a homologado solo cuando:

1. ambos equipos acuerdan productor y consumidor;
2. se acuerda nombre/ruta;
3. se acuerdan campos obligatorios y opcionales;
4. se acuerdan enumeraciones;
5. se acuerda idempotencia;
6. se acuerda orden/duplicados;
7. se acuerda timeout/reintentos;
8. se acuerda autenticación;
9. existen pruebas de contrato;
10. OpenAPI/AsyncAPI/JSON Schema queda versionado;
11. se define comportamiento ante rechazo;
12. se documenta ownership de cada dato.

---

# 37. Conclusión contractual

La documentación actual permite definir con claridad la frontera de Productos y Ofertas:

- **recibe identidad** desde Seguridad y Usuarios;
- **expone catálogo, variantes, categorías, precios, beneficios, recomendaciones, combos, inventario y SEO** a los canales;
- **recibe hechos del ciclo de pedido** desde Ventas/Postventa para consumo/compensación;
- **devuelve resultados de Inventario y Cupones** sin asumir ownership sobre pedido, pago o reembolso;
- **no necesita acceso directo a bases externas**;
- **no necesita actualmente una mutación directa desde Despacho**;
- conserva contratos de Ventas/Postventa como **provisionales** hasta homologación;
- debe formalizar las APIs síncronas en **OpenAPI** y la mensajería en **AsyncAPI + JSON Schema** como siguiente paso técnico.

