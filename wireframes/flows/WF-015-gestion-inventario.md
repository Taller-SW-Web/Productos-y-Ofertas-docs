# WF-015 — Gestión de inventario (control de stock)

> **Fuente normativa de esta revisión:** `specs_consolidado_final.md` y `hu_consolidado_final.md` (18-09-2026). Los nombres/eventos de Ventas y Postventa son contratos **provisionales no homologados**; el prototipo no debe simular pagos realizados ni confirmaciones externas como si estuvieran implementadas. Las anotaciones, supuestos, preguntas y referencias técnicas permanecen en este documento y no se muestran como elementos de la interfaz simulada.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la gestión de inventario
descrita en este archivo.

Antes de diseñar:

1. Consulta ../../specs/SPEC-015-gestion-inventario.md.
2. Consulta ../../hu/HU-015-gestion-inventario.md.
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

- La unidad de inventario es el **SKU vendible**: `sku_base` para producto simple
  o SKU autogenerado para una variante de un producto con variantes. El producto
  padre no tiene stock propio.
- No agregues campos, permisos, endpoints ni reglas no documentadas.
- El stock **nunca puede quedar negativo** y un consumo no puede superar el
  stock disponible.
- Los consumos concurrentes se protegen con **actualización condicional sobre el
  stock disponible** y el mismo **control de concurrencia optimista** de las
  operaciones masivas; no uses bloqueos globales en el diseño.
- El consumo definitivo requiere **`order.confirmed`**. `order.created` no
  reserva ni descuenta. Despacho no genera consumo adicional.
- Tras cada actualización (consumo o compensación) se notifica
  **`inventory.stock.changed`**; representa este efecto de forma visible.
- La cancelación previa al despacho repone el stock (`order.cancelled`); una
  devolución aceptada repone unidades (`order.returned`); una anulación
  posterior al despacho sin devolución física no repone.
- El `umbral_stock_bajo` es configurable por cada SKU; no asumas un valor global.
- No elijas una librería de UI ni una estrategia CSS.
- Usa datos ficticios y no consumas APIs reales.
- Numera las anotaciones como A-01, A-02, A-03, etc.
- Mantén visible la relación Variante/SKU como referencia obligatoria de toda
  consulta o registro.

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

1. Consulta del listado de SKUs vendibles con estado calculado.
2. Consulta de disponibilidad de una variante/SKU y su estado.
3. Consulta del resultado de consumo ante `order.confirmed` (sin formulario manual de débito).
4. Estado informativo de rechazo de consumo por stock insuficiente (sin stock negativo).
5. Evidencia de actualización condicional y control optimista ante consumos
   concurrentes.
6. Configuración del `umbral_stock_bajo` por SKU.
7. Notificación del evento `inventory.stock.changed` tras cada cambio.
8. Estados de carga, vacío, error, permisos y conflicto.
9. Navegación funcional entre los estados simulados.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-015 |
| Nombre del flujo | Gestión de inventario (control de stock) |
| Versión | 0.1 |
| Estado | Borrador |
| Responsable | Miguel Ángel Taco Zavala |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-18 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | SPEC-015-gestion-inventario.md, secciones 1–5 | Unidad de inventario, consulta, consumo, validación e integración |
| Historia de usuario | HU-015-gestion-inventario.md, CA-01 a CA-12 | Criterios y escenarios |
| Diseño | DESIGN.md | Lenguaje visual monocromático de baja fidelidad |
| Backlog | No proporcionado | No se asignan IDs de backlog |

### Funcionalidades incluidas

- Consultar la disponibilidad de un SKU vendible y su estado
  (Disponible, Stock bajo, Agotado).
- Consultar el resultado de un consumo originado por `order.confirmed`, sin registrar ventas desde el backoffice.
- Validar la existencia del SKU, la validez de la cantidad y el stock
  suficiente antes de descontar.
- Evitar stock negativo y rechazar consumos que superen la disponibilidad.
- Proteger los consumos concurrentes con actualización condicional y control
  de concurrencia optimista.
- Configurar el `umbral_stock_bajo` por SKU.
- Reconocer el consumo definitivo mediante `order.confirmed`, sin reservas en
  `order.created` y sin consumo adicional por Despacho.
- Reponer stock por `order.cancelled` (antes del despacho) y por
  `order.returned` (devolución aceptada).
- Notificar cada cambio mediante el evento `inventory.stock.changed`.

### Fuera de alcance

- Generación del SKU autogenerado de variantes: Gestión de variantes/SKUs.
- Definición de productos, variantes y características: WF-003, WF-004, WF-009.
- Precios y auditoría de precios: WF-013, WF-014.
- Operaciones masivas de actualización de inventario mediante archivos:
  WF-001 (carga y exportación masiva de productos).
- Dashboard analítico y alertas de stock: WF-016.
- Proceso de venta, confirmación de pago y despacho físico: módulos Ventas y
  Despacho; aquí solo se consumen sus eventos.
- Reservas de stock: no contempladas en el alcance.

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Responsable de inventario del marketplace |
| Rol en el sistema | Gestor autenticado con permisos sobre inventario |
| Nivel técnico | Operativo básico/intermedio; usa SKUs y estados calculados |
| Contexto de uso | Consulta de disponibilidad y resultados de consumos externos |
| Necesidad principal | Mantener el stock actualizado y consistente por SKU vendible |
| Permisos relevantes | Consultar disponibilidad y configurar umbral según permisos; consumo únicamente contractual |
| Dispositivo principal | Escritorio como hipótesis; consulta adaptada a tablet/móvil |

## 4. Objetivo del flujo

El responsable de inventario debe poder consultar la disponibilidad de cada SKU
vendible y consultar los consumos ejecutados por eventos de ventas de forma verificable,
de modo que el stock nunca sea negativo y los canales y módulos integrados
trabajen con la información de disponibilidad actualizada.

### Resultado exitoso

La consulta devuelve el SKU, la cantidad disponible y el estado calculado. Un
consumo con stock suficiente descuenta la cantidad y conserva el nuevo stock;
un consumo sin stock suficiente se rechaza conservando el stock actual. Cada
cambio de stock se notifica mediante `inventory.stock.changed`.

### Indicadores de finalización

- Consulta: SKU, cantidad disponible y estado visibles.
- Consumo aceptado: nuevo stock visible y notificación del evento.
- Consumo rechazado: motivo de rechazo y stock sin cambios.
- Umbral actualizado: nuevo umbral reflejado en el estado calculado.

## 5. Precondiciones y disparador

### Precondiciones

- El usuario tiene una sesión válida y el permiso correspondiente.
- Existen SKUs vendibles definidos por Gestión de variantes/productos.
- El `umbral_stock_bajo` está configurado por SKU (sin valor global).

### Puntos de entrada

- Ruta propuesta del listado: /inventario.
- Entrada propuesta: opción Inventario dentro del módulo Productos y ofertas.
- Consultar: acción sobre una fila o el detalle de un SKU.
- Revisar resultado de consumo confirmado: acceso informativo desde el detalle, solo si los datos están disponibles.
- Configurar umbral: acción desde el detalle de un SKU.

Las rutas y ubicación exactas son propuestas de wireframe y deben confirmarse.

### Salidas del flujo

| Resultado | Destino o comportamiento |
|---|---|
| Consulta exitosa | S-01 o S-02 con datos vigentes |
| Consumo aceptado | S-01 con stock actualizado; resultado externo consultable en S-03 |
| Consumo rechazado | S-03-R informativo sin cambios en el stock |
| Consumo en conflicto | S-03-C informativo sobre resultado del evento externo |
| Umbral actualizado | S-02 con estado recalculado |
| Cancelación | Regresa a S-01 o S-02 sin cambios |
| Error recuperable | Permanece en la pantalla y conserva los datos |
| Sin permisos | Bloquea la acción y ofrece retorno seguro |

## 6. Secuencia principal

### Flujo A — Consultar disponibilidad

1. El responsable entra a Gestión de inventario.
2. El sistema carga los SKUs vendibles con su stock y estado.
3. El listado permite buscar por SKU o producto y filtrar por estado.
4. El responsable abre el detalle de una variante.
5. El sistema muestra SKU, producto, características, stock, umbral y estado.

### Flujo B — Consultar resultado de consumo confirmado (solo lectura)

1. Ventas/Postventa **provisionalmente** emite `order.confirmed` con identificador de pedido, SKU y cantidad; la UI de Inventario no crea dicho evento.
2. Inventario valida y aplica la actualización condicional si hay saldo, o registra un rechazo; publica el resultado correlacionado.
3. El responsable consulta el detalle del SKU y, si se dispone del resultado, abre S-03 para ver pedido, cantidad y estado **sin campos editables ni botón de descuento**.
4. Si hubo cambio, la UI refleja el stock vigente después de `inventory.stock.changed`; un mensaje pendiente no equivale a venta consumida.

### Flujo C — Configurar umbral de stock bajo

1. Desde S-02, el responsable selecciona Editar umbral.
2. Ingresa el nuevo `umbral_stock_bajo` para el SKU.
3. El sistema recalcula el estado y guarda el valor.

### Flujos alternativos

| ID | Condición | Comportamiento esperado | Retorno |
|---|---|---|---|
| ALT-01 | SKU inexistente en contrato externo | Inventario rechaza el consumo; S-03 muestra el resultado sin permitir ingresarlo | S-03-R |
| ALT-02 | Cantidad inválida en contrato externo (vacía, cero o negativa) | Inventario rechaza; S-03 informa error de operación, sin campo de edición | S-03-R |
| ALT-03 | Cantidad mayor al stock disponible | Rechazo que conserva el stock | S-03-R |
| ALT-04 | Consumos concurrentes sobre el mismo SKU | Actualización condicional: se acepta un consumo y se rechaza el otro | S-03-C |
| ALT-05 | Consumo deja stock en 0 | El estado pasa a Agotado | S-01 |
| ALT-06 | Consumo deja stock en `0 < stock <= umbral` | El estado pasa a Stock bajo | S-01 |
| ALT-07 | Error al cargar el listado o detalle | Estado de error con reintento | S-01-E |
| ALT-08 | Usuario sin permiso | Ocultar o deshabilitar acción y explicar acceso | Estado global |
| ALT-09 | `order.created` recibido | No reserva ni descuenta stock | S-01 sin cambios |
| ALT-10 | `order.cancelled` antes del despacho | Compensa el stock previamente consumido | S-01 actualizado |
| ALT-11 | `order.returned` tras devolución aceptada | Repone las unidades devueltas | S-01 actualizado |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Ruta/presentación | Obligatoria |
|---|---|---|---|---|
| S-01 | Consulta de inventario | Listar SKUs vendibles con stock y estado, buscar y filtrar | /inventario propuesta | Sí |
| S-01-E | Vacío o error del listado | Diferenciar ausencia de datos de fallo de carga | Variante de S-01 | Sí |
| S-02 | Detalle de disponibilidad | Consultar SKU, stock, umbral, estado y acciones | /inventario/:sku propuesta | Sí |
| S-02-U | Editar umbral de stock bajo | Configurar el umbral por SKU | Variante de S-02 | Sí |
| S-03 | Resultado de consumo confirmado | Consultar SKU, pedido, cantidad y resultado (solo lectura) | Panel informativo | Sí |
| S-03-R | Consumo rechazado | Informar rechazo sin ofrecer reintento manual | Variante de S-03 | Sí |
| S-03-C | Conflicto de concurrencia | Informar resultado de la actualización condicional | Variante de S-03 | Sí |

## 8. Mapa de navegación

~~~mermaid
flowchart TD
    A["S-01 Listado"] --> B["S-02 Detalle"]
    B --> A
    B --> U["S-02-U Editar umbral"]
    U --> B
    A --> C["S-03 Resultado de consumo"]
    B --> C
    C --> R["S-03-R Rechazado"]
    C --> M["S-03-C Conflicto"]
    C --> A
    R --> A
    M --> A
~~~

## 9. Especificación por pantalla

### S-01 — Consulta de inventario

#### Propósito

Dar acceso a la consulta de disponibilidad de todos los SKUs vendibles y entrar
a consultar resultados de consumos confirmados o ver el detalle de una variante.

#### Jerarquía de contenido

1. Título Gestión de inventario.
2. Búsqueda y filtros (estado).
3. Listado de SKUs vendibles.
4. Stock, umbral y estado de cada SKU.

#### Regiones y componentes

| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + resumen | Gestión de inventario; conteo de SKUs | Información general |
| Filtros | Búsqueda + selector de estado | Por SKU/producto y por estado | Filtra el listado |
| Listado | Tabla en escritorio; tarjetas en móvil | Producto, SKU, características, stock, umbral, estado | Abre detalle |
| Fila/tarjeta | Acciones contextuales | Ver detalle, Ver resultado de consumo, Editar umbral | Según permiso |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Ver resultado de consumo | Ver resultado | Permiso de consulta | Abre S-03 (solo lectura) |
| Secundaria | Consultar detalle | Ver | Permiso de consulta | Abre S-02 |
| Secundaria | Editar umbral | Umbral | Permiso de gestión | Abre S-02-U |

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Producto | Catálogo | Texto | Media | — |
| Variante/SKU | Gestión de variantes | Código | Alta | No debe faltar |
| Características | Gestión de características | Talla, color, etc. | Media | Ocultar |
| Stock disponible | Inventario | Entero | Alta | No disponible |
| Umbral stock bajo | Configuración por SKU | Entero | Media | No configurado |
| Estado | Cálculo con stock y umbral | Texto | Alta | No disponible |

No agregar paginación ni ordenamiento al prototipo hasta que la necesidad y
reglas estén confirmadas.

#### Navegación y foco

- Foco inicial: título o primera acción.
- El orden recorre búsqueda, filtro y filas.
- Acciones contextuales utilizables por teclado.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-01 | SKU vendible | Unidad de inventario: `sku_base` o SKU de variante; el producto no tiene stock propio |
| A-02 | Estado | Disponible, Stock bajo o Agotado según las reglas deterministas |
| A-03 | Umbral | Configurable por SKU; sin valor global |
| A-04 | Canon | La consulta siempre referencia la Variante/SKU |
| A-05 | Evento | Cada cambio de stock se notifica con `inventory.stock.changed` |

### S-01-E — Vacío o error del listado

- Vacío: Aún no hay variantes con inventario. Acción: Volver a consultar tras
  cargar variantes; no presentar la ausencia como error.
- Error: No pudimos cargar el inventario. Acción: Reintentar.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-06 | Vacío | Depende de Gestión de variantes/SKUs |
| A-07 | Error | Incluye recuperación sin detalles internos |

### S-02 — Detalle de disponibilidad de una variante

#### Propósito

Mostrar la información de disponibilidad de un SKU vendible, su umbral y su
estado, y ofrecer consultar el resultado de un consumo externo o editar el umbral.

#### Jerarquía de contenido

1. Producto y SKU de la variante.
2. Stock disponible y estado.
3. Características, umbral y acciones.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + estado | Producto, variante/SKU | Vuelve a S-01 |
| Datos | Pares etiqueta/valor | Stock, características, umbral | Lectura |
| Acciones | Botones | Ver resultado de consumo, Editar umbral | Según permiso |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Ver resultado de consumo | Ver resultado | Permiso de consulta | Abre S-03 (solo lectura) |
| Secundaria | Editar umbral | Editar umbral | Permiso de gestión | Abre S-02-U |
| Secundaria | Volver | Volver a inventario | Siempre | Abre S-01 |

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Producto | Catálogo | Texto | Alta | Error de integridad |
| Variante/SKU | Gestión de variantes | Código | Alta | Error de integridad |
| Características | Gestión de características | Talla, color | Media | Ocultar |
| Stock disponible | Inventario | Entero | Alta | No disponible |
| Umbral stock bajo | Configuración por SKU | Entero | Media | No configurado |
| Estado | Cálculo | Texto | Alta | No disponible |

#### Navegación y foco

- Foco inicial: título o vuelta al listado.
- Acciones accesibles por teclado.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-08 | Estado | Recalculado tras cada cambio de stock |
| A-09 | Umbral | Solo afecta el estado de este SKU |
| A-10 | Referencia | Canales y módulos consultan por Variante/SKU |

### S-02-U — Editar umbral de stock bajo

#### Propósito

Configurar el `umbral_stock_bajo` para un SKU específico.

#### Formulario y validaciones

| Campo | Tipo | Obligatorio | Validación | Mensaje propuesto |
|---|---|---|---|---|
| Umbral de stock bajo | Número | Sí | Entero mayor o igual a 0 | El umbral debe ser un número mayor o igual a 0. |

- Momento de validación: al guardar.
- Conservación de datos tras error: mantener el valor ingresado.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-11 | Per SKU | No existe valor global obligatorio |
| A-12 | Recalculo | El estado se recalcula con el nuevo umbral |

### S-03 — Resultado de consumo confirmado (solo lectura)

#### Propósito

Mostrar el resultado correlacionado de un consumo causado únicamente por el contrato provisional `order.confirmed` de Ventas/Postventa, sin ofrecer una operación administrativa de débito.

#### Jerarquía de contenido

1. Título Resultado de consumo.
2. Referencia del pedido, si el contrato externo la entrega.
3. SKU y cantidad **no editables**.
4. Estado: confirmado y aplicado / rechazado por insuficiencia / en proceso / resultado no disponible.
5. Saldo vigente y momento de actualización cuando estén disponibles.

#### Navegación y foco

- Acciones únicamente Volver al SKU o Actualizar consulta; actualizar no reenvía consumo.
- La UI nunca emite `order.confirmed` ni ofrece «Confirmar consumo».

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-13 | Solo lectura | El resultado proviene de la operación contractual de Ventas |
| A-14 | Concurrencia | Inventario valida y descuenta con actualización condicional |
| A-15 | Rechazo | No hay débito si el saldo no alcanza |
| A-16 | Evento de salida | `inventory.stock.changed` se emite tras el cambio efectivamente persistido |

### S-03-R — Consumo rechazado

- Mensaje: No hay stock suficiente.
- Comportamiento: se conserva el stock actual; no se descuenta nada.
- Acción: Volver al detalle o actualizar consulta; no reintentar manualmente un pedido.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-17 | Rechazo | El stock nunca queda negativo |

### S-03-C — Conflicto de concurrencia

- Mensaje: El stock ya no alcanza para este consumo.
- Comportamiento: otro consumo aplicó sobre el saldo; esta operación se rechaza.
- Acción: Consultar el stock vigente o cerrar.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-18 | Optimista | Un consumo se acepta y el otro se rechaza sin bloqueo global |

## 10. Estados de interfaz

| Estado | Aplica | Representación | Acciones | Recuperación |
|---|---|---|---|---|
| Listado cargando | Sí | Skeleton/indicador | Esperar | Reintento si falla |
| Listado vacío | Sí | Mensaje y orientación | Volver a consultar | N/A |
| Listado con datos | Sí | Tabla/tarjetas | Ver, resultado de consumo, umbral | N/A |
| Sin resultados por filtros | Sí | Mensaje contextual | Limpiar filtros | N/A |
| Detalle cargando | Sí | Skeleton/indicador | Esperar | Reintento si falla |
| Detalle por SKU inexistente | Sí | Error de no encontrado | Volver | S-01 |
| Consulta de resultado inicial | Si hay contrato de consulta | Panel informativo, sin campos editables | Volver/actualizar consulta | N/A |
| Consumo externo en procesamiento | Sí | Estado pendiente y referencia de pedido si disponible | Actualizar lectura | Esperar resultado de servicio |
| Consumo aceptado | Sí | Confirmación + stock actualizado | Continuar | N/A |
| Consumo rechazado | Sí | S-03-R | Consultar resultado/cerrar | Resolución corresponde a Ventas/Postventa |
| Conflicto de concurrencia | Sí | S-03-C | Consultar/cerrar | N/A |
| Umbral guardando | Sí | Acción deshabilitada | Esperar | Reintento |
| Error de guardado | Sí | Mensaje sin perder datos | Reintentar | Repetir envío |
| Sin permisos | Sí | Explicación segura | Volver | Solicitar acceso |
| Sesión expirada | Sí | Aviso/autenticación | Iniciar sesión | Recuperar contexto |

### Reglas para datos remotos

- Consultar el stock vigente al cargar y tras cada cambio de stock.
- No aplicar resultado optimista de consumo en la interfaz: la actualización condicional
  decide al aplicar.
- Distinguir ausencia de variantes de fallo de carga.

## 11. Comportamiento responsivo

DESIGN.md define 12 columnas en escritorio y 4 en móvil. El prototipo demuestra
adaptación sin fijar breakpoints definitivos.

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Completa | Condensada | Patrón global móvil |
| Listado | Tabla | Tabla reducida | Tarjetas |
| Filtros | En línea | Apilados | Apilados |
| Panel informativo de consumo | Centrado | Margen lateral | Casi completo |
| Detalle | Columnas | Apilado | Una columna |
| Anotaciones | Panel lateral | Debajo | Lista/colapsable |
| Contenido omitido | Ninguno | Ninguno | Ninguno; reorganizar |

### Condiciones críticas

- Verificar 320 px sin desplazamiento horizontal.
- Los códigos SKU largos deben envolver o truncarse con acceso al valor.
- El diálogo debe funcionar con zoom de 200%.

## 12. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Encabezado principal único por pantalla.
- Campos con etiquetas persistentes y errores asociados.
- El estado Disponible/Stock bajo/Agotado se expresa con texto e icono.
- Diálogos con foco contenido y retorno al activador.
- Acciones móviles de 44 por 44 px.
- Cambios no dependientes del color.
- Anotaciones excluidas del árbol accesible.

## 13. Tono visual y contenido

Aplicar DESIGN.md como única fuente de representación visual.

### Consideraciones específicas

- Densidad: media-alta (listado de inventario).
- Sensación buscada: control confiable del stock y prevención de negativos.
- Elemento dominante en S-01: listado y estados.
- Elemento dominante en S-03: resultado del consumo externo, en solo lectura.

### Microcopy crítica

| Contexto | Texto propuesto | Observación |
|---|---|---|
| Acción informativa | Ver resultado de consumo | Resultado concreto |
| Consulta | Stock disponible y estado actuales para el SKU | CA-03 |
| Rechazo | No hay stock suficiente para consumir esa cantidad. | CA-07 |
| Concurrencia | El stock ya no alcanza; otro consumo se aplicó primero. | CA-10 |
| Evento | Cambio de stock notificado al dashboard (inventory.stock.changed). | Actualización reactiva |
| Umbral | El umbral se aplica solo a este SKU. | CA-03 |

## 14. Restricciones técnicas relevantes

- Aplicación objetivo: React, TypeScript y Vite.
- Navegación: React Router; rutas exactas pendientes.
- Estado remoto: TanStack Query.
- Formularios: React Hook Form y Zod.
- Contratos HTTP: OpenAPI/Swagger.
- Eventos: AsyncAPI (`order.confirmed`, `order.cancelled`, `order.returned`,
  `inventory.stock.changed`).
- La librería de componentes y estrategia CSS están pendientes.
- El prototipo es HTML/CSS/JS estático.

### Dependencias o contratos

| Tipo | Operación o referencia | Impacto visible |
|---|---|---|
| HTTP | Consultar disponibilidad por SKU; pendiente | S-01/S-02 |
| Lectura HTTP | Consultar resultado de consumo confirmado, si se expone; contrato pendiente | S-03 solo lectura |
| Evento | `order.confirmed` (Ventas/Postventa) | Consumo definitivo |
| Evento | `order.created` (Ventas/Postventa) | Sin efecto en stock |
| Evento | `order.cancelled` (previa al despacho) | Compensación |
| Evento | `order.returned` (devolución aceptada) | Reposición |
| Evento | `inventory.stock.changed` (salida) | Dashboard y componentes |
| Permiso | Consultar inventario / editar umbral (códigos pendientes) | No habilita débito manual |

## 15. Privacidad, seguridad y acciones sensibles

- Autorizar acciones de escritura en servidor.
- Validar existencia del SKU y cantidad en servidor, no solo en cliente.
- Aplicar la actualización condicional sobre el saldo para evitar negativos.
- No exponer detalles internos en mensajes de error.
- Las compensaciones y reposiciones provienen exclusivamente de eventos
  contractuales de Ventas/Postventa.
- El documento no exige reautenticación.

## 16. Criterios de aceptación del wireframe

- [ ] Permite consultar la disponibilidad de un SKU vendible.
- [ ] Muestra stock, umbral y estado (Disponible, Stock bajo, Agotado).
- [ ] Muestra el resultado de consumo originado por `order.confirmed` sin permitir débito manual.
- [ ] Muestra rechazo de consumo externo por stock insuficiente sin modificar el saldo.
- [ ] Representa consumos concurrentes con actualización condicional.
- [ ] Representa el consumo por `order.confirmed` y la ausencia de reservas.
- [ ] Representa compensación por `order.cancelled` y reposición por
  `order.returned`.
- [ ] Muestra la notificación `inventory.stock.changed`.
- [ ] Permite configurar el `umbral_stock_bajo` por SKU.
- [ ] Incluye carga, vacío, error, permisos y sesión.
- [ ] Funciona con teclado y no depende del color.
- [ ] Funciona con HTML/CSS/JS estáticos.
- [ ] Es consistente con DESIGN.md.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01 | S-01/S-02 (SKU vendible como unidad) |
| CA-02 | S-01/S-02 y A-04 |
| CA-03 | S-01/S-02 y A-02/A-03 |
| CA-04 | Contrato de consumo externo; S-03 solo lectura |
| CA-05 | Resultado validado en servidor y representado en S-03 |
| CA-06 | Evento externo y detalle S-03 de resultado |
| CA-07 | ALT-03 y S-03-R |
| CA-08 | ALT-05/ALT-06 y S-01 |
| CA-09 | A-05 y sección de contratos |
| CA-10 | ALT-04 y S-03-C; procesamiento concurrente en servidor, vista de solo lectura |
| CA-11 | Flujo B y S-03 solo lectura; contrato provisional de Ventas |
| CA-12 | ALT-10/ALT-11 y sección de contratos |

## 17. Supuestos

| ID | Supuesto | Motivo | Impacto si es incorrecto | Validar |
|---|---|---|---|---|
| SUP-01 | WF-015 es el ID asignado en INDEX.md | Asignación de la rama `taco` | Renombrar archivo/referencias | Sí |
| SUP-02 | La ruta será /inventario | No se entregó mapa de navegación | Cambiar rutas/entrada | Sí |
| SUP-03 | Escritorio es el dispositivo principal | Gestión administrativa | Cambiar prioridad responsive | Sí |
| SUP-04 | El umbral se edita desde inventario | CA-03 lo exige como configuración por SKU | Ubicar la edición en otro módulo | Sí |
| SUP-05 | No hay consumo manual en UI: solo `order.confirmed` inicia el débito | Specs/HU definitivos | S-03 es resultado informativo | No |

## 18. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea wireframe | Estado |
|---|---|---|---|---|
| Q-01 | Resuelto: el `umbral_stock_bajo` se edita por SKU en Gestión de Inventario; Gestión de Variantes solo puede consultarlo. | Decisión de producto | No | Resuelta |
| Q-02 | Resuelto: consumo definitivo solo ante `order.confirmed` externo, nunca desde botón administrativo. | Specs/HU definitivos | No | Resuelta |
| Q-03 | ¿Existe búsqueda, filtros u orden adicionales en el listado? | Producto | No para flujo base | Abierta |
| D-01 | Selección de librería UI y estrategia CSS | Frontend | No para wireframe; sí para implementación | Pendiente |

### Alineación definitiva de Inventario y contratos provisionales

- Toda edición administrativa en este wireframe se limita al `umbral_stock_bajo` por SKU, conforme al alcance del flujo. **Gestión de Inventario es la propietaria de esta configuración; Gestión de Variantes no la edita.** **No existe formulario manual de débito comercial**; el débito se desencadena únicamente tras confirmación de Ventas `order.confirmed`, nombre y payload sujetos a homologación.
- S-03 y sus variantes son paneles **de consulta de resultado**, no formularios que solicitan o repiten consumos. En fallos, informar el rechazo sin simular que Inventario puede resolver estados de pago/pedido. Confirmar con Ventas si y cómo se expondrán identificadores/resultados al gestor.
- Un SKU nuevo comienza en saldo cero con versión inicial; el producto simple usa `sku_base`, producto padre con variantes no tiene stock. Los ajustes absolutos de Bulk requieren `stock_version`, y rechazan versiones obsoletas sin reintento ciego.
- Despacho no descuenta stock; `order.cancelled` previo al despacho y `order.returned` de devolución aceptada pueden compensar si existió un consumo previo no compensado. No representar reposición ante anulación posterior a despacho sin devolución.

## 19. Registro de revisiones

| Versión | Fecha | Autor | Cambio | Aprobado por |
|---|---|---|---|---|
| 0.1 | 2026-09-17 | Asistente | Borrador inicial basado en spec, HU, template y DESIGN.md | Pendiente |
| 0.3 | 2026-09-18 | Asistente | Alineación de wireframe con Specs/HU definitivos y contratos externos provisionales; ver registro de cambios. | Pendiente de revisión del equipo |

---

## Lista de control antes de generar el HTML

- [x] Las fuentes funcionales están identificadas.
- [x] El alcance y fuera de alcance están claros.
- [x] Las pantallas y variantes están inventariadas.
- [x] Los criterios CA-01 a CA-12 están cubiertos.
- [x] El consumo, la validación y la concurrencia están documentados.
- [x] Los eventos de integración están documentados.
- [x] Los supuestos y preguntas están registrados.
- [x] El formato HTML está definido.
- [ ] Confirmar el ID WF-015 contra INDEX.md.
- [ ] Resolver Q-01 y Q-02 antes del diseño definitivo.
- [ ] Confirmar rutas y permisos antes de implementar el frontend.

---
