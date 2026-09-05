# Inventario, APIs y Analítica

## 1. Descripción de la funcionalidad

Esta funcionalidad se encarga de administrar la **disponibilidad de stock de los productos** pertenecientes al módulo **Productos y Ofertas**, permitiendo que los diferentes canales del sistema puedan consultar dicha disponibilidad y comunicar el consumo de unidades.

El inventario constituye la fuente de información sobre la cantidad disponible de cada producto o SKU. Su acceso desde otros módulos se realizará mediante **APIs**, manteniendo la separación entre los módulos y evitando el acceso directo a la base de datos.

La funcionalidad comprende:

* Consulta de disponibilidad de stock.
* Consumo de stock.
* Actualización del inventario.
* Validación de disponibilidad.
* Control de concurrencia.
* Exposición de APIs para integración.
* Dashboard de inventario y analítica.
* Alertas de stock.

---

# 2. Objetivo

Garantizar que el sistema mantenga una **información consistente y actualizada sobre la disponibilidad de los productos**, permitiendo que los diferentes canales consulten y actualicen el inventario mediante servicios API.

El sistema deberá:

* Informar la cantidad disponible de un producto.
* Determinar si un producto está disponible.
* Registrar el consumo de unidades.
* Actualizar el stock después de un consumo.
* Evitar consumos superiores al stock disponible.
* Evitar inconsistencias ante operaciones simultáneas.
* Proporcionar información del inventario para su monitoreo y análisis.

---

# 3. Alcance

## 3.1. Funcionalidades obligatorias

### A. Consulta de disponibilidad de stock

Permite consultar la disponibilidad actual de un producto o SKU.

### B. Actualización de stock por consumo

Permite registrar el consumo de unidades realizado desde los canales y actualizar el stock correspondiente.

---

## 3.2. Funcionalidades de valor agregado

### A. Dashboard de inventario

Permite visualizar información general y estadísticas relacionadas con el stock.

### B. Alertas de stock

Permite identificar productos cuyo inventario se encuentre próximo a agotarse o se encuentre agotado.

---

# 4. Concepto de inventario

El inventario representa la cantidad disponible de unidades de un producto o SKU para ser utilizadas por los diferentes canales del sistema.

Ejemplo:

```text
Producto: Nike Air Max
SKU: NK-AIR-001

Stock disponible: 10 unidades
```

Si posteriormente se consumen 3 unidades:

```text
Stock inicial:       10
Consumo:              3
-------------------------
Stock disponible:     7
```

El nuevo valor deberá quedar registrado en el inventario.

---

# 5. Consulta de disponibilidad

## Descripción

Esta funcionalidad permite a los canales consultar si un determinado producto se encuentra disponible y conocer la cantidad de unidades existentes.

Por ejemplo, un canal puede necesitar consultar:

```text
¿El SKU NK-AIR-001 está disponible?
¿Cuántas unidades existen?
```

La consulta será realizada mediante una API.

## Flujo

```text
Canal
  │
  │ Consulta de disponibilidad
  ▼
API de Inventario
  │
  ▼
Servicio de Inventario
  │
  ▼
Base de datos
  │
  ▼
Stock actual
  │
  ▼
Respuesta JSON
  │
  ▼
Canal
```

---

# 6. API de disponibilidad

## Endpoint

```http
GET /api/inventory/{sku}/availability
```

## Ejemplo

```http
GET /api/inventory/NK-AIR-001/availability
```

## Respuesta

```json
{
  "sku": "NK-AIR-001",
  "stock": 8,
  "available": true,
  "status": "AVAILABLE"
}
```

## Información proporcionada

La respuesta deberá permitir conocer como mínimo:

* SKU consultado.
* Cantidad disponible.
* Disponibilidad.
* Estado del inventario.

---

# 7. Estados de disponibilidad

Se podrán manejar los siguientes estados:

| Estado         | Condición                                               |
| -------------- | ------------------------------------------------------- |
| `AVAILABLE`    | Existe stock disponible                                 |
| `LOW_STOCK`    | El stock se encuentra por debajo del umbral establecido |
| `OUT_OF_STOCK` | No existen unidades disponibles                         |

Ejemplo:

```text
Stock = 15
→ AVAILABLE
```

```text
Stock = 3
Stock mínimo = 5
→ LOW_STOCK
```

```text
Stock = 0
→ OUT_OF_STOCK
```

Los valores exactos para determinar `LOW_STOCK` deberán establecerse como regla de negocio.

---

# 8. Actualización de stock por consumo

## Descripción

Esta funcionalidad permite registrar el consumo de unidades producido por una operación realizada desde un canal o módulo autorizado.

El consumo de stock no consiste simplemente en modificar un número. Antes de realizar la operación deben validarse las condiciones necesarias para garantizar la consistencia del inventario.

## Flujo

```text
Canal / Ventas
      │
      │ Solicitud de consumo
      ▼
API de Inventario
      │
      ▼
Validación
      │
      ├── SKU válido
      ├── Cantidad válida
      └── Stock suficiente
      │
      ▼
Actualización
      │
      ▼
Nuevo stock
      │
      ▼
Respuesta
```

---

# 9. API de consumo

## Endpoint

```http
POST /api/inventory/consume
```

## Request

```json
{
  "sku": "NK-AIR-001",
  "quantity": 2,
  "source": "VENTAS",
  "referenceId": "PED-10025"
}
```

### Campos

| Campo         | Descripción                               |
| ------------- | ----------------------------------------- |
| `sku`         | Identificador del producto/SKU            |
| `quantity`    | Cantidad de unidades a consumir           |
| `source`      | Módulo o canal que origina la operación   |
| `referenceId` | Identificador de la operación relacionada |

---

# 10. Proceso de consumo

Supongamos:

```text
SKU: NK-AIR-001
Stock actual: 10
Cantidad solicitada: 2
```

La operación realizará:

```text
1. Identificar el SKU.
2. Consultar el stock actual.
3. Validar que la cantidad sea válida.
4. Verificar que exista stock suficiente.
5. Realizar el consumo.
6. Actualizar el inventario.
7. Retornar el resultado de la operación.
```

Resultado:

```text
Stock anterior:    10
Consumo:            2
Stock nuevo:        8
```

---

# 11. Validación de stock insuficiente

No se deberá permitir una operación cuando la cantidad solicitada sea superior al stock disponible.

### Ejemplo

```text
Stock disponible:     2
Cantidad solicitada:  5
```

Resultado:

```text
Operación rechazada
Stock permanece: 2
```

Respuesta:

```json
{
  "success": false,
  "code": "INSUFFICIENT_STOCK",
  "message": "Stock insuficiente"
}
```

El sistema no deberá permitir que el inventario llegue a valores negativos como consecuencia de un consumo.

---

# 12. Control de concurrencia

El inventario puede recibir múltiples solicitudes simultáneamente.

### Ejemplo

```text
Stock disponible = 1
```

Dos operaciones llegan prácticamente al mismo tiempo:

```text
Operación A → consume 1
Operación B → consume 1
```

El sistema deberá garantizar que solamente una operación pueda consumir la unidad disponible.

### Resultado esperado

```text
Operación A → EXITOSA
Operación B → RECHAZADA

Stock final → 0
```

No deberá producirse:

```text
Operación A → EXITOSA
Operación B → EXITOSA

Stock final → -1
```

ni permitir que ambas operaciones confirmen el consumo de la misma unidad.

## Consideraciones técnicas

La implementación deberá considerar mecanismos como:

* Transacciones.
* Operaciones atómicas.
* Bloqueos o mecanismos equivalentes.
* Condiciones de carrera.
* Validación durante la actualización.
* Consistencia de datos.
* Idempotencia de solicitudes cuando corresponda.

---

# 13. Integración mediante APIs

La funcionalidad de inventario será consumida por otros módulos mediante APIs.

La comunicación seguirá el principio:

```text
Módulo externo
      │
      │ HTTP / API
      ▼
Inventario
      │
      ▼
Base de datos
```

No se permitirá:

```text
Módulo externo
      │
      │ Acceso directo
      ▼
Base de datos de Inventario
```

La arquitectura del proyecto establece que los módulos deben integrarse mediante APIs y no mediante acceso directo a las bases de datos.

---

# 14. Contratos de API

Para permitir la integración con los demás módulos será necesario establecer contratos claros.

Cada API deberá definir:

* Método HTTP.
* Endpoint.
* Parámetros.
* Headers.
* Request.
* Response.
* Códigos HTTP.
* Códigos de error.
* Reglas de validación.
* Autenticación.
* Autorización.

## Ejemplo

### Request

```json
{
  "sku": "NK-AIR-001",
  "quantity": 2,
  "source": "VENTAS",
  "referenceId": "PED-10025"
}
```

### Success

```json
{
  "success": true,
  "sku": "NK-AIR-001",
  "previousStock": 10,
  "consumedQuantity": 2,
  "availableStock": 8
}
```

### Error

```json
{
  "success": false,
  "code": "INSUFFICIENT_STOCK",
  "message": "Stock insuficiente"
}
```

---

# 15. Identificación mediante SKU

Cuando el catálogo utilice variantes, el inventario deberá asociarse al identificador correspondiente de la variante/SKU.

Ejemplo:

```text
Producto
└── Nike Air Max

    ├── SKU NK-AIR-40-BLK
    │   └── Stock: 5
    │
    ├── SKU NK-AIR-41-BLK
    │   └── Stock: 2
    │
    └── SKU NK-AIR-40-WHT
        └── Stock: 8
```

Esto permite controlar el stock individual de cada versión del producto.

La definición final de la relación entre producto, variante y SKU deberá mantenerse alineada con el modelo de datos general del módulo.

---

# 16. Dashboard de inventario

Como funcionalidad de valor agregado se implementará un dashboard orientado al monitoreo del inventario.

## Objetivo

Mostrar de manera resumida el estado actual del inventario y facilitar la identificación de productos que requieren atención.

## Indicadores

Se podrán mostrar:

* Total de productos.
* Total de SKUs.
* Unidades disponibles.
* Productos con stock bajo.
* Productos agotados.
* Productos disponibles.

Ejemplo:

```text
┌─────────────────┬─────────────────┬─────────────────┐
│ Productos       │ Unidades        │ Stock bajo      │
│                 │ disponibles     │                 │
│      250        │      1482       │       18        │
└─────────────────┴─────────────────┴─────────────────┘
```

---

# 17. Alertas de stock

El dashboard permitirá identificar productos que alcancen o se encuentren por debajo del stock mínimo establecido.

Ejemplo:

```text
Producto: Nike Air Max
Stock actual: 3
Stock mínimo: 5
```

Resultado:

```text
⚠ STOCK BAJO
```

Cuando:

```text
Stock = 0
```

se mostrará:

```text
⚠ PRODUCTO AGOTADO
```

---

# 18. Analítica de inventario

El dashboard podrá proporcionar información como:

### Productos con mayor consumo

```text
1. Nike Air Max
2. Adidas Predator
3. Puma Future
4. Nike Revolution
5. Adidas Run
```

### Productos con menor disponibilidad

```text
1. Producto A → 1 unidad
2. Producto B → 2 unidades
3. Producto C → 2 unidades
4. Producto D → 3 unidades
5. Producto E → 3 unidades
```

La información relacionada directamente con ventas deberá obtenerse mediante la integración correspondiente con el módulo responsable de ventas, respetando la separación entre módulos.

---

# 19. Interfaz de inventario

La interfaz permitirá visualizar el estado del inventario.

Ejemplo:

```text
INVENTARIO

[ Buscar producto o SKU................ ]

Producto          SKU             Stock       Estado
---------------------------------------------------------
Nike Air Max      NK-AIR-001       8          Disponible
Adidas Run        AD-RUN-002       3          Stock bajo
Puma Future       PM-FUT-003       0          Agotado
```

## Funcionalidades

* Buscar producto o SKU.
* Consultar stock.
* Visualizar estado.
* Filtrar productos.
* Identificar productos con stock bajo.
* Identificar productos agotados.

---

# 20. Seguridad de las APIs

Las APIs de inventario deberán considerar:

* Autenticación.
* Autorización.
* Control de acceso.
* Validación de parámetros.
* Validación del body.
* Control de cantidades.
* Protección de endpoints.
* Manejo seguro de errores.

Las operaciones de consulta y las operaciones de modificación podrán requerir diferentes niveles de autorización según las reglas de seguridad definidas para el sistema.

---

# 21. Pruebas

## 21.1. Consulta de stock

```text
SKU válido
→ Retorna stock actual
```

## 21.2. SKU inexistente

```text
SKU inexistente
→ Retorna error
```

## 21.3. Consumo exitoso

```text
Stock = 10
Consumo = 3

Resultado:
Stock = 7
```

## 21.4. Stock insuficiente

```text
Stock = 2
Consumo = 5

Resultado:
Operación rechazada
Stock = 2
```

## 21.5. Stock agotado

```text
Stock = 0

Resultado:
OUT_OF_STOCK
```

## 21.6. Concurrencia

```text
Stock = 1

Solicitud A → consume 1
Solicitud B → consume 1
```

Resultado:

```text
A → EXITOSA
B → RECHAZADA
Stock final → 0
```

## 21.7. Integración

Validar la comunicación entre la API de inventario y los módulos consumidores.

---

# 22. Resultado esperado

La funcionalidad deberá proporcionar un **servicio centralizado de inventario** capaz de:

```text
                    INVENTARIO
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
     Consultar       Consumir       Analizar
       Stock          Stock          Stock
        │               │               │
        ▼               ▼               ▼
       API             API         Dashboard
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ▼
                 Base de Datos
```

El resultado final deberá garantizar:

* Información actualizada del stock.
* Consulta de disponibilidad mediante API.
* Consumo controlado de unidades.
* Validación de stock suficiente.
* Protección frente a operaciones concurrentes.
* Integración con los demás módulos.
* Contratos API definidos.
* Dashboard de inventario.
* Alertas de bajo stock y agotamiento.
* Pruebas de las funcionalidades implementadas.

---

# 23. Resumen de la funcionalidad

| Área           | Funcionalidad                                   |
| -------------- | ----------------------------------------------- |
| Inventario     | Administración y consulta del stock             |
| Disponibilidad | Consulta de stock mediante API                  |
| Consumo        | Descuento de unidades mediante API              |
| Validación     | Control de stock suficiente                     |
| Concurrencia   | Prevención de inconsistencias                   |
| Integración    | Comunicación mediante APIs                      |
| Dashboard      | Visualización de indicadores                    |
| Alertas        | Detección de stock bajo y agotado               |
| Analítica      | Información sobre comportamiento del inventario |
| Testing        | Pruebas unitarias, integración y performance    |

---

# 24. Responsabilidad principal

**Gestionar el inventario del módulo Productos y Ofertas y proporcionar los servicios API necesarios para que los diferentes canales y módulos puedan consultar y consumir stock de manera segura, consistente y controlada.**

Como complemento, se implementará un **Dashboard Analítico y Alertas de Stock** para facilitar el monitoreo del inventario.
