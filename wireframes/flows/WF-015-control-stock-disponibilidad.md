# WF-015 — Control de stock y disponibilidad

> **Fuente normativa de esta revisión:** `specs_consolidado_final.md` y `hu_consolidado_final.md` (18-09-2026), `SPEC-015-control-stock-disponibilidad.md` y `HU-015-control-stock-disponibilidad.md`. Los contratos de reservas y consumos con Ventas y Postventa son asíncronos y están desacoplados. Este documento define la gestión operativa de stock, consultas de disponibilidad, ajustes manuales y configuración de umbrales. Las anotaciones, supuestos, preguntas y referencias técnicas permanecen en este documento y no se muestran como elementos de la interfaz simulada.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para el control de stock y
disponibilidad descrito en este archivo.

Antes de diseñar:

1. Consulta ../../specs/SPEC-015-control-stock-disponibilidad.md.
2. Consulta ../../hu/HU-015-control-stock-disponibilidad.md.
3. Consulta ../../DESIGN.md.
4. Usa este documento para la composición, interacción y estados del flujo.

Prioridad de fuentes:

1. La especificación define reglas de negocio y restricciones globales.
2. La historia de usuario define criterios de aceptación y escenarios.
3. Este documento define navegación y comportamiento de interfaz.
4. DESIGN.md define la representación visual.

Si las fuentes se contradicen o no resuelven una decisión, no inventes una
regla. Registra la cuestión en Preguntas y decisiones pendientes e identifica
la pantalla afectada.

Reglas de producción:

- La unidad operativa de inventario es el saldo por **`(sku, location_id)`**. El producto es agrupador comercial y no tiene stock propio; el inventario reside en los SKUs vendibles (incluido `sku_base` en producto simple).
- Se controlan tres magnitudes: stock físico (`on_hand`), unidades reservadas (`reserved`) y unidades disponibles para venta (`available = max(on_hand - reserved, 0)`).
- El stock **nunca puede quedar negativo** (`available >= 0`).
- Determinación de estados: `available = 0 → AGOTADO`; `0 < available <= umbral_resuelto → STOCK_BAJO`; `available > umbral_resuelto → DISPONIBLE`.
- Modelo de umbrales: existe un **umbral global por defecto** configurable a nivel sistema (`umbral_stock_bajo_default`) y un **override opcional por SKU**. El umbral resuelto aplica `override SKU ?? umbral_global`. No se definen umbrales por ubicación.
- Los ajustes manuales de stock (`on_hand`) exigen motivo obligatorio (`motivo_ajuste`) y calculan la variación neta.
- El consumo por venta o reserva es iniciado por eventos externos (`order.confirmed`, `order.cancelled`, `order.returned`); el wireframe de administración no confirma ventas ni procesa pagos.
- Tras cada mutación persistida se notifica el evento `inventory.stock.changed`.
- No elijas una librería de UI ni una estrategia CSS.
- Usa datos ficticios y no consumas APIs reales.
- Numera las anotaciones como A-01, A-02, A-03, etc.

### Formato del entregable

Genera un prototipo navegable con HTML, CSS y JavaScript estáticos:

- El punto de entrada debe ser index.html.
- Debe funcionar sin proceso de compilación.
- Usa rutas y recursos relativos.
- No uses React ni dependencias del frontend productivo.
- No requieras conexión a servicios externos.
- Simula únicamente las interacciones necesarias para validar el flujo.
- Implementa un diseño responsivo real para escritorio, tablet y móvil mediante CSS y cambios de viewport; no agregues controles internos de dispositivo.
- Documenta las anotaciones A-xx fuera de la interfaz simulada; no las renderices en el prototipo.
- Aplica el estilo monocromático y de baja fidelidad de DESIGN.md.

### Entregables esperados

1. Listado y consulta operativa de stock por SKU y ubicación (`on_hand`, `reserved`, `available`, estado).
2. Modal/formulario de ajuste manual de stock con motivo obligatorio y prevención de saldo negativo.
3. Pantalla/modal de configuración de umbrales: umbral global por defecto y override por SKU.
4. Historial/detalle de movimientos y trazabilidad local de stock por SKU/ubicación.
5. Filtros por SKU, producto, ubicación (`location_id`) y estado de stock.
6. Estados de carga, vacío, error, permisos y concurrencia.
7. Navegación funcional entre los estados simulados.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-015 |
| Nombre del flujo | Control de stock y disponibilidad |
| Versión | 0.4 |
| Estado | Borrador |
| Responsable | Miguel Ángel Taco Zavala |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-21 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | SPEC-015-control-stock-disponibilidad.md, secciones 1–6 | Modelo `(sku, location_id)`, saldos `on_hand`/`reserved`/`available`, umbrales y reglas de consumo |
| Historia de usuario | HU-015-control-stock-disponibilidad.md, CA-01 a CA-10 | Criterios de aceptación y escenarios Gherkin |
| Diseño | DESIGN.md | Lenguaje visual monocromático de baja fidelidad |
| Backlog | No proporcionado | No se asignan IDs de backlog |

### Funcionalidades incluidas

- Consultar existencias por SKU y ubicación con desglose de `on_hand`, `reserved` y `available`.
- Determinar estado de stock (Disponible, Stock bajo, Agotado) según umbral resuelto.
- Realizar ajustes manuales operativos de `on_hand` con motivo obligatorio y cálculo de diferencias.
- Configurar el umbral global por defecto (`umbral_stock_bajo_default`).
- Configurar y eliminar overrides de umbral de stock bajo por SKU.
- Consultar movimientos y kardex operativo local por SKU y almacén.
- Simular la emisión reactiva de `inventory.stock.changed`.

### Fuera de alcance

- Dashboard analítico consolidado y rankings: WF-016.
- Carga masiva de inventario en lote: WF-001.
- Cobros, checkout y transacciones de pago: canal de ventas / Pasarela.
- Creación y edición de SKUs o variantes: WF-004.
- Gestión de compras y recepción de proveedores: módulo de Abastecimiento externo.

---

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Responsable o gestor de inventario y almacén |
| Rol en el sistema | Usuario autenticado con permisos de gestión y consulta de inventario |
| Nivel técnico | Operativo básico/intermedio |
| Contexto de uso | Verificación de existencias físicas, ajustes por inventario cíclico o mermas y configuración de alertas |
| Necesidad principal | Conocer la disponibilidad real de cada SKU por almacén y corregir descuadres físicos rápidamente |
| Permisos relevantes | Consultar stock, realizar ajustes y configurar umbrales de inventario |
| Dispositivo principal | Escritorio para gestión global; tablet/móvil para conteo y verificación en almacén |

---

## 4. Objetivo del flujo

El responsable de inventario debe poder consultar la disponibilidad de cada SKU
por almacén, registrar ajustes de stock justificados, configurar umbrales globales y
específicos, y consultar el historial de movimientos, evitando inconsistencias de stock negativo.

### Resultado exitoso

El sistema mantiene actualizados los saldos `on_hand`, `reserved` y `available`
por `(sku, location_id)`, aplica las reglas de umbral (`override SKU ?? umbral_global`)
y registra cada ajuste con motivo auditable, notificando los cambios a los canales mediante eventos.

### Indicadores de finalización

- Ajuste manual: mensaje "Stock actualizado correctamente" y saldo recalculado en pantalla.
- Configuración de umbral: mensaje "Umbral guardado exitosamente".
- Consulta: saldos y estados sincronizados con la base operativa.

---

## 5. Precondiciones y disparador

### Precondiciones

- El usuario tiene una sesión válida y permisos de inventario.
- Existen SKUs vendibles registrados en Catálogo (WF-003 / WF-004).
- Existen ubicaciones/almacenes habilitados (al menos `DEFAULT`).

### Puntos de entrada

- Ruta propuesta: `/inventario` o `/inventario/stock`.
- Entrada propuesta: opción "Control de Stock" dentro del módulo de Inventario.

### Salidas del flujo

| Resultado | Destino o comportamiento |
|---|---|
| Ajuste exitoso | S-01 con tabla de saldos actualizada |
| Ajuste inválido (saldo negativo) | Bloqueo en S-02 con error: "El stock físico no puede ser menor a las unidades reservadas" |
| Umbral guardado | S-01/S-03 con indicador de estado recalculado |
| Cancelación | Cierra modal y regresa a S-01 sin mutar datos |
| Sin permisos | Muestra mensaje de acceso restringido |

---

## 6. Secuencia principal

### Flujo A — Consultar disponibilidad por SKU y Ubicación

1. El responsable accede al listado de stock (S-01).
2. Filtra por SKU, producto o almacén (`location_id`).
3. La tabla muestra `on_hand`, `reserved`, `available` y el estado calculado (Disponible, Stock bajo, Agotado).

### Flujo B — Realizar ajuste manual de stock

1. En S-01, el usuario selecciona un registro y pulsa "Ajustar stock".
2. En el modal S-02 ingresa la nueva cantidad física (`on_hand`), selecciona el motivo del ajuste y añade observaciones.
3. El sistema valida que el nuevo `on_hand` sea `>= reserved` (para que `available >= 0`).
4. Al confirmar, persiste el nuevo saldo, genera el movimiento auditable, emite `inventory.stock.changed` y refresca S-01.

### Flujo C — Configurar umbral global por defecto

1. El usuario pulsa "Configuración de Umbrales" (S-03).
2. En la sección "Umbral Global", modifica el valor de `umbral_stock_bajo_default` (ej. 5 unidades).
3. Guarda los cambios; el sistema actualiza el fallback global para todos los SKUs sin override.

### Flujo D — Configurar o eliminar override por SKU

1. En S-03 (o desde la fila del SKU en S-01), abre la configuración del SKU.
2. Ingresa un valor numérico específico para establecer el override, o pulsa "Eliminar override" para volver al valor global.
3. Guarda; el sistema recalcula inmediatamente el estado del SKU según `umbral_efectivo`.

### Flujo E — Consultar movimientos (Kardex local)

1. En S-01, pulsa "Ver movimientos" sobre una fila.
2. Se despliega la vista S-04 mostrando la cronología de transacciones (ingresos, salidas, ajustes, consumos).

### Flujos alternativos

| ID | Condición | Comportamiento esperado | Retorno |
|---|---|---|---|
| ALT-01 | Ajuste resulta en `available < 0` | Bloquear guardado y señalar conflicto con unidades reservadas | S-02 |
| ALT-02 | Motivo de ajuste omitido | Bloquear guardado: "El motivo del ajuste es obligatorio" | S-02 |
| ALT-03 | Override de SKU menor a 0 | Error: "El umbral debe ser un entero mayor o igual a 0" | S-03 |
| ALT-04 | Conflicto de versión / concurrencia | Alerta: "El stock fue modificado por otra operación. Se recargarán los saldos" | S-02 |
| ALT-05 | Error de carga del listado | Mostrar estado de error con botón de reintento | S-01-E |
| ALT-06 | Filtro sin resultados | Mensaje contextual: "No se encontraron existencias con los filtros aplicados" | S-01 |

---

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Ruta/presentación | Obligatoria |
|---|---|---|---|---|
| S-01 | Control de stock por SKU | Listado de existencias, saldos y estados por ubicación | `/inventario` | Sí |
| S-01-E | Vacío o error de stock | Manejar ausencia de registros o fallos de red | Variante de S-01 | Sí |
| S-02 | Modal de ajuste de stock | Registrar cambios físicos justificados de existencias | Modal sobre S-01 | Sí |
| S-02-E | Error en ajuste | Manejar rechazo de transacción o fallo concurrente | Variante de S-02 | Sí |
| S-03 | Configuración de umbrales | Administrar umbral global y overrides por SKU | `/inventario/umbrales` o modal | Sí |
| S-04 | Detalle de movimientos | Consultar historial de transacciones y kardex local | `/inventario/movimientos/:sku` | Sí |

---

## 8. Mapa de navegación

~~~mermaid
flowchart TD
    A["S-01 Control de Stock"] --> B["S-02 Modal Ajuste de Stock"]
    B --> A
    A --> C["S-03 Configuración de Umbrales"]
    C --> A
    A --> D["S-04 Detalle de Movimientos"]
    D --> A
    A --> E1["S-01-E Error / Vacío"]
    B --> E2["S-02-E Error Ajuste"]
~~~

---

## 9. Especificación por pantalla

### S-01 — Control de stock por SKU y ubicación

#### Propósito
Consultar el saldo de inventario de cada variante vendible desglosado por almacén/ubicación y acceder a acciones operativas.

#### Regiones y componentes
| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + botones | "Control de Stock y Disponibilidad" + Botón "Configurar umbrales" | Encabezado principal |
| Filtros | Barra de filtros | Búsqueda por SKU/Producto, Selector de ubicación (`location_id`), Selector de estado | Actualiza tabla de saldos |
| Tabla | Tabla de inventario | SKU, Producto, Ubicación, Físico (`on_hand`), Reservado (`reserved`), Disponible (`available`), Umbral efectivo, Estado, Acciones | Muestra saldos vigentes |
| Acciones fila | Menú / Botones | "Ajustar stock", "Configurar umbral", "Ver movimientos" | Abre S-02, S-03 o S-04 |

#### Anotaciones
| ID | Elemento | Anotación |
|---|---|---|
| A-01 | Unidad operativa | Control estricto por par `(sku, location_id)` |
| A-02 | Cálculo de disponible | `available = max(on_hand - reserved, 0)` |
| A-03 | Estado calculado | Badge de color neutral e icono: Disponible, Stock bajo o Agotado |
| A-04 | Umbral efectivo | Muestra el valor resuelto indicando si proviene de override SKU o global |

---

### S-02 — Modal de ajuste de stock

#### Propósito
Permitir el ajuste justificado del stock físico (`on_hand`) ante mermas, conteos físicos o correcciones operativas.

#### Formulario y validaciones
| Campo | Tipo | Obligatorio | Validación | Mensaje propuesto |
|---|---|---|---|---|
| Stock físico actual | Número | Solo lectura | Valor actual de `on_hand` | N/A |
| Nuevo stock físico | Número entero | Sí | `>= 0` y `>= reserved` | "El stock no puede ser menor a las unidades reservadas ({reserved})" |
| Diferencia calculada | Número | Solo lectura | `nuevo_on_hand - actual_on_hand` | Muestra incremento o decremento neto |
| Motivo del ajuste | Selector | Sí | `CONTEO_FISICO`, `MERMA`, `DETERIORO`, `DEVOLUCION_MANUAL`, `OTRO` | "Selecciona el motivo del ajuste" |
| Observaciones | Texto | No | Opcional | N/A |

#### Anotaciones
| ID | Elemento | Anotación |
|---|---|---|
| A-05 | Prevención saldo negativo | Valida en cliente y backend que `available` resultante sea `>= 0` |
| A-06 | Motivo obligatorio | Garantiza auditoría y justificación contable/operativa |
| A-07 | Emisión de evento | La confirmación emite `inventory.stock.changed` tras persistir |

---

### S-03 — Configuración de umbrales de stock bajo

#### Propósito
Administrar el valor por defecto del sistema y los overrides específicos aplicables a SKUs individuales.

#### Regiones y componentes
| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Umbral Global | Formulario | Campo `umbral_stock_bajo_default` + Botón "Guardar global" | Aplica a todos los SKUs sin override |
| Override por SKU | Formulario de búsqueda | Buscador de SKU + Campo de umbral específico + Botones "Establecer" / "Eliminar override" | Sobrescribe el valor global para el SKU |
| Resumen | Tabla de overrides | Listado de SKUs con override activo y su valor configurado | Permite editar o retirar override |

#### Anotaciones
| ID | Elemento | Anotación |
|---|---|---|
| A-08 | Jerarquía de umbral | `umbral_efectivo = override SKU ?? umbral_global` |
| A-09 | Eliminación de override | Al eliminar el override, el SKU vuelve inmediatamente a evaluar con el umbral global |
| A-10 | Ámbito del umbral | El umbral aplica a nivel de SKU y no por ubicación |

---

### S-04 — Detalle de movimientos y trazabilidad (Kardex local)

#### Propósito
Visualizar el historial de transacciones que han mutado el stock de un SKU en una ubicación específica.

#### Regiones y componentes
| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Datos del SKU | SKU, Nombre del producto, Ubicación, Saldos actuales | Contexto del registro |
| Tabla de movimientos | Tabla cronológica | Fecha/hora (UTC), Tipo operación (`AJUSTE`, `CONSUMO`, `RESERVA`, `LIBERACION`, `REPOSICION`), Cantidad (+/-), Saldo resultante, Motivo/Referencia, Usuario/Sistema | Orden descendente |

#### Anotaciones
| ID | Elemento | Anotación |
|---|---|---|
| A-11 | Inmutabilidad | El historial de movimientos es de solo lectura (Append-Only) |
| A-12 | Referencias externas | Muestra `order_id` o `batch_id` correlacionado cuando la operación provenga de eventos |

---

## 10. Estados de interfaz

| Estado | Aplica | Representación | Acciones | Recuperación |
|---|---|---|---|---|
| Listado cargando | Sí | Skeleton en tabla | Esperar | Reintento automático |
| Listado con datos | Sí | Tabla de saldos y badges de estado | Filtrar, ajustar, ver movimientos | N/A |
| Listado vacío | Sí | Mensaje: "No hay registros de inventario disponibles" | Orientación a crear variantes | Cargar catálogo |
| Modal guardando | Sí | Botones deshabilitados + spinner | Evitar doble envío | Esperar respuesta |
| Error de ajuste | Sí | Mensaje contextual en modal sin perder datos | Corregir o reintentar | Reintentar |
| Concurrencia detectada | Sí | Alerta de conflicto de versión | Recargar saldo actualizado | Refrescar |
| Sin permisos | Sí | Mensaje de acceso denegado | Volver a pantalla principal | Solicitar permisos |

### Reglas para datos remotos

- Toda mutación de stock se realiza mediante actualización condicional sobre el saldo disponible.
- Los saldos se actualizan reactivamente al recibir notificaciones de eventos.
- No se permite guardado optimista que oculte errores de concurrencia.

---

## 11. Comportamiento responsivo

DESIGN.md define 12 columnas en escritorio y 4 en móvil.

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Barra completa | Condensada | Patrón global móvil |
| Tabla de stock | Columnas completas con desgloses | Tabla compacta | Tarjetas apiladas por SKU/almacén |
| Modales | Diálogo centrado | Diálogo centrado | Pantalla completa con scroll |
| Kardex | Tabla ancha con referencias | Tabla simplificada | Lista cronológica vertical |

### Condiciones críticas

- Funcional a 320 px sin scroll horizontal.
- Controles de ajuste táctil mínimos de 44x44 px.

---

## 12. Accesibilidad

- Cumplimiento WCAG 2.2 AA.
- Los estados de stock (Disponible, Stock bajo, Agotado) se identifican por texto e icono, no solo color.
- Modales con atrapamiento de foco y tecla `Escape`.
- Anuncios de actualización de saldo mediante `aria-live`.

---

## 13. Tono visual y contenido

Aplicar DESIGN.md como única fuente de representación visual monocromática.

### Microcopy crítica

| Contexto | Texto propuesto | Observación |
|---|---|---|
| Saldo negativo bloqueado | "La cantidad ingresada dejaría el saldo disponible en negativo." | Validación estricta |
| Motivo mandatorio | "El motivo del ajuste es obligatorio para auditoría de inventario." | Requisito de control |
| Umbral actualizado | "Umbral configurado exitosamente para el SKU {sku}." | Confirmación |
| Estado stock bajo | "Stock bajo: unidades disponibles en o por debajo del umbral." | Explicación de alerta |

---

## 14. Restricciones técnicas relevantes

- Aplicación objetivo: React, TypeScript, TanStack Query.
- Contratos HTTP: OpenAPI / Swagger.
- Eventos: AsyncAPI (`inventory.stock.changed`).

### Dependencias o contratos

| Tipo | Referencia | Impacto |
|---|---|---|
| Entrada | Catálogo de variantes (WF-004) | Provee SKUs vendibles válidos |
| Evento | `order.confirmed` / `order.cancelled` | Dispara consumos o reposiciones asíncronas |
| Salida | `inventory.stock.changed` | Notifica saldos recalculados a canales y dashboards |

---

## 15. Privacidad, seguridad y acciones sensibles

- Los ajustes manuales de stock requieren permisos específicos de inventario.
- Cada ajuste registra el identificador del usuario responsable, timestamp e IP.
- Las tablas de movimientos son de solo lectura y no permiten borrado.

---

## 16. Criterios de aceptación del wireframe

- [x] Permite consultar saldos `on_hand`, `reserved` y `available` por `(sku, location_id)`.
- [x] Calcula deterministamente los estados Disponible, Stock bajo y Agotado.
- [x] Aplica la jerarquía de umbrales: `override SKU ?? umbral_global`.
- [x] Permite realizar ajustes manuales de stock con motivo obligatorio.
- [x] Bloquea cualquier operación que resulte en stock disponible negativo.
- [x] Permite consultar el historial de movimientos de inventario por SKU y ubicación.
- [x] Es responsivo y consistente con DESIGN.md.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01 | S-01, consulta de saldos y disponibilidad por SKU y ubicación |
| CA-02 | S-01, estados Disponible, Stock bajo y Agotado |
| CA-03 | S-01 y S-03, cálculo con `umbral_stock_bajo_default` y override por SKU |
| CA-04 | S-02, actualización por consumo y ajuste con prevención de stock negativo |
| CA-05 | S-02, validación atómica y rechazo por stock insuficiente |
| CA-06 | S-01 y S-02, emisión y recepción reactiva de `inventory.stock.changed` |
| CA-07 | S-01 y S-04, transición de estados tras consumo o reposición |
| CA-08 | S-01, soporte de `(sku, location_id)` con fallback a ubicación `DEFAULT` |
| CA-09 | S-03, administración y eliminación de overrides de umbral |
| CA-10 | S-04, trazabilidad e inmutabilidad del historial de movimientos |

---

## 17. Supuestos

| ID | Supuesto | Motivo | Impacto si es incorrecto | Validar |
|---|---|---|---|---|
| SUP-01 | WF-015 es el ID asignado en INDEX.md | Rama `taco` | Renombrar archivo | Sí |
| SUP-02 | La ruta propuesta es `/inventario` | Estandarización de rutas | Cambiar rutas | Sí |
| SUP-03 | La ubicación inicial es `DEFAULT` en despliegues monoalmacén | Regla de negocio de SPEC-015 | Ajustar vistas | Sí |

---

## 18. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea | Estado |
|---|---|---|---|---|
| Q-01 | Resuelto: Unidad operativa es `(sku, location_id)` con magnitudes on_hand, reserved, available. | Specs/HU definitivos | No | Resuelta |
| Q-02 | Resuelto: Umbral se configura a nivel global con overrides opcionales por SKU. | Spec/HU | No | Resuelta |
| Q-03 | Resuelto: Ajustes manuales requieren motivo obligatorio y registran movimiento auditable. | Spec/HU | No | Resuelta |
| D-01 | Selección de librería UI y estrategia CSS | Frontend | Implementación | Pendiente |

### Alineación definitiva de Control de Stock

- La gestión de inventario garantiza atomicidad y prevención de saldos negativos sobre el par `(sku, location_id)`.
- El umbral de stock bajo aplica la jerarquía `override SKU ?? umbral_global`, notificando reactivamente cualquier cambio a través de `inventory.stock.changed`.

---

## 19. Registro de revisiones

| Versión | Fecha | Autor | Cambio | Aprobado por |
|---|---|---|---|---|
| 0.1 | 2026-09-17 | Asistente | Borrador inicial de gestión de inventario | Pendiente |
| 0.3 | 2026-09-18 | Asistente | Incorporación del modelo (sku, location_id) y eventos asíncronos | Pendiente |
| 0.4 | 2026-09-21 | Asistente | Reconstitución completa del wireframe con estructura exhaustiva, gestión de umbral global/override y kardex | Aprobado |

---

## Lista de control antes de generar el HTML

- [x] Las fuentes funcionales están identificadas.
- [x] El alcance y fuera de alcance están claros.
- [x] Las pantallas y variantes están inventariadas (S-01 a S-04).
- [x] Los criterios CA-01 a CA-10 están cubiertos.
- [x] Los saldos on_hand, reserved, available y la regla de no saldo negativo están documentados.
- [x] El modelo de umbrales (global + override por SKU) está documentado.
- [x] Los supuestos y preguntas están registrados.
- [x] El formato HTML está definido.
- [ ] Confirmar el ID WF-015 contra INDEX.md.
- [ ] Confirmar rutas y permisos antes de implementar el frontend.

---
