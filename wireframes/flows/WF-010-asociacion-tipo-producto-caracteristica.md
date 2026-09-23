# WF-010 — Asociación entre tipos de producto y características

> **Fuentes normativas:** SPEC individual de esta funcionalidad (`../../specs/SPEC-010-asociacion-tipo-producto-caracteristica.md`), HU individual de esta funcionalidad (`../../hu/HU-010-asociacion-tipo-producto-caracteristica.md`), `../DESIGN.md` y `../INDEX.md`. Ante contradicción, prevalece SPEC → HU → WF. Los nombres/eventos de Ventas y Postventa son contratos **provisionales no homologados**; el prototipo no debe simular pagos realizados ni confirmaciones externas como si estuvieran implementadas. Las anotaciones, supuestos, preguntas y referencias técnicas permanecen en este documento y no se muestran como elementos de la interfaz simulada.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la asociación
Tipo de Producto–Característica descrita en este archivo.

Antes de diseñar:

1. Consulta ../../specs/SPEC-010-asociacion-tipo-producto-caracteristica.md.
2. Consulta ../../hu/HU-010-asociacion-tipo-producto-caracteristica.md.
3. Consulta ../DESIGN.md.
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

- No agregues campos, permisos, endpoints ni reglas no documentadas.
- La funcionalidad permite crear tipos de producto ligeros (`tipo_producto_id`, nombre, estado) y posteriormente asociarles características.
- Solo se asocian características activas a tipos de producto activos.
- No se permite asociar la misma característica dos veces al mismo tipo de producto.
- Límite operativo configurable `MAX_PRODUCT_TYPE_ATTRIBUTES` (valor inicial del MVP: 20 características activas por tipo de producto) para proteger usabilidad y rendimiento. Mostrar como `X / {MAX_PRODUCT_TYPE_ATTRIBUTES}`.
- Las categorías de navegación NO definen ni heredan características; el esquema de atributos se deriva exclusivamente de `tipo_producto_id`.
- Cada asociación define obligatoriedad (`OBLIGATORIA` u `OPCIONAL`). No existe persistencia ni control de orden visual normado en SPEC/HU.
- El cambio de opcional a obligatoria no invalida ni desactiva productos preexistentes; se exige en la próxima edición/guardado del producto en Catálogo.
- Si un tipo de producto o característica se desactiva, sus asociaciones dejan de considerarse activas para nuevas altas sin eliminarlas físicamente.
- La desasociación requiere confirmación y verificación asíncrona segura si la característica es obligatoria o identifica variantes activas.
- No elijas una librería de UI ni una estrategia CSS.
- Usa datos ficticios y no consumas APIs reales.
- Numera las anotaciones como A-01, A-02, A-03, etc.
- Mantén visible el contador de límite operativo y la obligatoriedad.

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

1. Listado/consulta de tipos de producto con contador de características asociadas y acción para crear tipos ligeros.
2. Gestión de características por tipo de producto (tabla de asignaciones).
3. Selector/modal para asociar características activas disponibles (de WF-009).
4. Configuración de obligatoriedad (Obligatoria / Opcional).
5. Desasociación con confirmación y verificación segura.
6. Control del límite operativo configurable `MAX_PRODUCT_TYPE_ATTRIBUTES`.
7. Estados de carga, vacío, error, permisos y conflicto.
8. Navegación funcional entre los estados simulados.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-010 |
| Nombre del flujo | Asociación entre tipos de producto y características |
| Versión | 0.4 |
| Estado | Borrador |
| Responsable | Leonardo Lopez |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-23 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | SPEC-010-asociacion-tipo-producto-caracteristica.md, secciones 1–6 | Esquema por tipo, límite operativo configurable, obligatoriedad y desacople de categorías |
| Historia de usuario | HU-010-asociacion-tipo-producto-caracteristica.md, CA-01 a CA-12 | Criterios de aceptación y escenarios |
| Diseño | DESIGN.md | Lenguaje visual monocromático de baja fidelidad |
| Backlog | No proporcionado | No se asignan IDs de backlog |

### Funcionalidades incluidas

- Crear tipos de producto ligeros.
- Consultar tipos de producto.
- Mostrar `tipo_producto_id`, nombre y estado.
- Consultar características asociadas a un tipo.
- Asociar características activas.
- Definir obligatoriedad `OBLIGATORIA | OPCIONAL`.
- Cambiar obligatoriedad.
- Controlar el límite configurado `MAX_PRODUCT_TYPE_ATTRIBUTES`.
- Desasociar de forma segura.
- Exponer el esquema por `tipo_producto_id`.

### Fuera de alcance

- CRUD de características y valores: corresponde a WF-009.
- CRUD de categorías de navegación y jerarquía: corresponde a WF-008.
- Captura de valores de características en la ficha de producto: Catálogo Core / WF-003.
- Personalización de atributos por canal o cliente.
- Definición de orden visual (no forma parte del contrato del SPEC/HU).

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Gestor comercial responsable de la taxonomía y esquemas del catálogo |
| Rol en el sistema | Gestor comercial autenticado con permisos de administración de catálogo |
| Nivel técnico | Operativo básico/intermedio |
| Contexto de uso | Definición de plantillas y atributos aplicables a familias de productos |
| Necesidad principal | Garantizar que cada tipo de producto cuente con los atributos técnicos requeridos |
| Permisos relevantes | Consultar, crear tipos ligeros, asociar, configurar obligatoriedad y desasociar atributos |
| Dispositivo principal | Escritorio como hipótesis; consulta adaptada a tablet/móvil |

## 4. Objetivo del flujo

El gestor comercial debe poder crear tipos de producto ligeros y asociarles características,
estableciendo su obligatoriedad bajo un límite operativo configurable,
garantizando esquemas de datos estables y consistentes para los productos del catálogo.

### Resultado exitoso

El tipo de producto queda creado y con sus características asignadas y obligatoriedad
definida (sin superar el límite configurado), publicando el esquema
versionado para su uso en Catálogo y Carga Masiva.

### Indicadores de finalización

- Creación de tipo: tipo registrado y detalle abierto para asociar características.
- Asociación: mensaje "Característica asociada exitosamente" y contador actualizado.
- Modificación de obligatoriedad: mensaje "Cambios guardados".
- Desasociación: mensaje "Característica desasociada" tras confirmación.

---

## 5. Precondiciones y disparador

### Precondiciones

- El usuario tiene una sesión válida y permisos asignados.
- Pueden existir o no tipos de producto. La funcionalidad permite crear un tipo ligero y posteriormente asociarle características. Para asociar características, el tipo seleccionado y la característica deben encontrarse activos.
- Existen características creadas y activas en WF-009.

### Puntos de entrada

- Ruta propuesta: `/tipos-producto` o `/catalogo/tipos-producto`.
- Entrada propuesta: opción "Tipos de Producto / Atributos" en el menú de Catálogo.

### Salidas del flujo

| Resultado | Destino o comportamiento |
|---|---|
| Tipo creado | S-02 con detalle del nuevo tipo |
| Asociación exitosa | S-02 con tabla y contador actualizados |
| Límite configurado alcanzado | Bloqueo de botón "Asociar" en S-02 con mensaje informativo |
| Desasociación exitosa | S-02 con característica removida |
| Desasociación rechazada por uso activo | Alerta en S-04 indicando productos/variantes que impiden la baja |
| Cancelación | Regresa a la vista anterior sin modificar datos |
| Sin permisos | Bloquea la acción y ofrece retorno seguro |

---

## 6. Secuencia principal

### Flujo A — Consultar tipos de producto

1. Abrir listado (S-01).
2. Mostrar `tipo_producto_id`, nombre, estado y número de características asociadas.
3. Mostrar el uso del límite como `X / {MAX_PRODUCT_TYPE_ATTRIBUTES}`; no codificar `X/20` como constante de dominio.
4. Permitir abrir el detalle del tipo de producto.

### Flujo B — Crear tipo de producto ligero

1. Desde S-01, seleccionar **Nuevo tipo de producto**.
2. Introducir el nombre requerido por el contrato.
3. El sistema crea y asigna `tipo_producto_id`.
4. Mostrar el estado resultante según el contrato vigente.
5. Abrir el detalle (S-02) para permitir la asociación de características.

### Flujo C — Asociar característica

1. Abrir el tipo en S-02.
2. Obtener `MAX_PRODUCT_TYPE_ATTRIBUTES` vigente.
3. Si el contador está por debajo del límite, permitir **Asociar característica**.
4. En el modal S-03 seleccionar una característica activa no asociada.
5. Definir obligatoriedad `OBLIGATORIA` u `OPCIONAL`.
6. Validar unicidad y límite.
7. Guardar e incrementar versión del esquema.

### Flujo D — Cambiar obligatoriedad

1. En S-02, modificar únicamente la obligatoriedad (`OBLIGATORIA` / `OPCIONAL`).
2. Guardar cambios.
3. Incrementar versión de esquema.
4. Si cambia de opcional a obligatoria, no desactivar productos existentes automáticamente; la obligación se aplica conforme a SPEC/HU-010 en edición/activación posterior.

### Flujo E — Desasociar característica

1. En S-02, seleccionar "Desasociar" sobre una característica.
2. Abrir diálogo de confirmación S-04.
3. El gestor confirma; el sistema ejecuta verificación asíncrona segura para características obligatorias o utilizadas como identificadoras y, si procede, remueve la asociación.

### Flujos alternativos

| ID | Condición | Comportamiento esperado | Retorno |
|---|---|---|---|
| ALT-01 | Límite configurado alcanzado | Botón "Asociar" deshabilitado con mensaje de límite | S-02 |
| ALT-02 | Característica ya asociada | No se muestra en el selector S-03 (filtrada) | S-03 |
| ALT-03 | Tipo de producto sin características | Muestra estado vacío con invitación a asociar | S-02 |
| ALT-04 | Desasociación bloqueada por SKU activo | Mensaje explicativo: la característica identifica variantes activas | S-04 |
| ALT-05 | Error de red o guardado | Conservar datos en formulario y permitir reintento | S-02-E |
| ALT-06 | Tipo de producto inactivo | Vista en modo solo lectura | S-02 |

---

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Ruta/presentación | Obligatoria |
|---|---|---|---|---|
| S-01 | Listado de tipos de producto | Consultar tipos, cantidad de características y crear nuevo | `/tipos-producto` propuesta | Sí |
| S-01-E | Vacío o error del listado | Tratar ausencia de tipos o error de carga | Variante de S-01 | Sí |
| S-01-N | Modal / Alta de tipo ligero | Capturar nombre y registrar nuevo tipo | Modal sobre S-01 | Sí |
| S-02 | Gestión de características del tipo | Administrar características y obligatoriedad | `/tipos-producto/:id` | Sí |
| S-02-E | Error al guardar asociación | Recuperar fallo sin perder cambios | Variante de S-02 | Sí |
| S-03 | Selector de características | Buscar y seleccionar característica a asociar | Modal sobre S-02 | Sí |
| S-04 | Confirmar desasociación | Validar impacto y confirmar baja de asociación | Modal sobre S-02 | Sí |

---

## 8. Mapa de navegación

~~~mermaid
flowchart TD
    A["S-01 Listado Tipos de Producto"] -->|Nuevo Tipo| N["S-01-N Modal Crear Tipo"]
    N -->|Creado| B["S-02 Gestión de Características (:id)"]
    A -->|Abrir Detalle| B
    A --> E1["S-01-E Error / Vacío"]
    B --> C["S-03 Modal Seleccionar Característica"]
    C --> B
    B --> D["S-04 Modal Confirmar Desasociación"]
    D --> B
    B --> E2["S-02-E Error Guardado"]
~~~

---

## 9. Especificación por pantalla

### S-01 — Listado de tipos de producto

#### Propósito
Consultar el catálogo de tipos de producto, crear tipos de producto ligeros y acceder a la administración de sus esquemas de características.

#### Regiones y componentes
| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + acción | "Tipos de Producto y Esquemas" + Botón "Nuevo tipo de producto" | Abre S-01-N |
| Búsqueda | Campo de texto | Filtrar tipos por nombre | Búsqueda local o remota |
| Tabla | Tabla de datos | Nombre, `tipo_producto_id`, Estado, Características asignadas (`X / {MAX_PRODUCT_TYPE_ATTRIBUTES}`), Acciones | Enlace a S-02 |

#### Anotaciones
| ID | Elemento | Anotación |
|---|---|---|
| A-01 | Tipos de producto | Entidad canónica propietaria del esquema de atributos |
| A-02 | Contador de límite | Muestra características asignadas frente al límite operativo configurable |

---

### S-02 — Gestión de características del tipo de producto

#### Propósito
Administrar las características asociadas a un tipo de producto específico y su obligatoriedad.

#### Regiones y componentes
| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + contador | Nombre del Tipo + "Características (X / {MAX_PRODUCT_TYPE_ATTRIBUTES})" | Muestra límite y estado |
| Barra de acción | Botón | "Asociar característica" | Abre S-03; deshabilitado si X >= límite |
| Tabla de atributos | Tabla | Nombre de característica, Tipo de dato, Unidad, Obligatoria (Toggle), Acciones | Permite modificar obligatoriedad y desasociar |
| Pie de tabla | Botón | "Guardar cambios" | Persiste cambios de obligatoriedad |

#### Formulario y validaciones
| Campo | Tipo | Obligatorio | Validación | Mensaje propuesto |
|---|---|---|---|---|
| Obligatoriedad | Toggle/Radio | Sí | OBLIGATORIA u OPCIONAL | N/A |

#### Anotaciones
| ID | Elemento | Anotación |
|---|---|---|
| A-03 | Límite configurable | Configuración operativa (`MAX_PRODUCT_TYPE_ATTRIBUTES`) |
| A-04 | Desacople de categorías | No hereda de categorías de navegación; esquema 100% dependiente del tipo |
| A-05 | Obligatoriedad | Cambiar a obligatoria no invalida productos existentes; aplica en su próxima edición |

---

### S-03 — Modal Seleccionar Característica

#### Propósito
Permitir al gestor seleccionar una característica activa para incorporarla al esquema del tipo de producto.

#### Regiones y componentes
| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título modal | "Asociar Característica" | Diálogo accesible |
| Selector | Dropdown / Búsqueda | Lista de características activas (WF-009) no asociadas previamente | Excluye duplicados |
| Opciones | Radios / Check | Obligatoria u Opcional | Valor inicial: Opcional |
| Botones | Botones de acción | "Asociar" (Primaria) y "Cancelar" (Secundaria) | Asocia y cierra modal |

#### Anotaciones
| ID | Elemento | Anotación |
|---|---|---|
| A-07 | Unicidad | No permite seleccionar características ya asociadas al tipo |
| A-08 | Origen WF-009 | Consume el catálogo de características activas con sus tipos (TEXTO, NUMERO, LISTA) |

---

### S-04 — Modal Confirmar Desasociación

#### Propósito
Advertir sobre el impacto de desasociar una característica y ejecutar la baja lógica segura.

#### Regiones y componentes
| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Mensaje | Texto de advertencia | "Al desasociar esta característica, dejará de solicitarse para nuevos productos de este tipo." | Explicación clara |
| Verificación | Texto informativo | "Si existen variantes activas que usan este atributo como identificador, la operación será bloqueada." | Protección de consistencia |
| Acciones | Botones | "Confirmar desasociación" (Peligro) y "Cancelar" | Ejecuta la baja lógica |

#### Anotaciones
| ID | Elemento | Anotación |
|---|---|---|
| A-09 | Baja segura | Se rechaza si la característica identifica variantes activas |
| A-10 | Histórico preservado | Productos históricos conservan IDs y snapshots; no se borran datos |

---

## 10. Estados de interfaz

| Estado | Aplica | Representación | Acciones | Recuperación |
|---|---|---|---|---|
| Listado cargando | Sí | Skeleton / indicador | Esperar | Reintento si falla |
| Listado con datos | Sí | Tabla de tipos y contadores | Ver detalle, filtrar | N/A |
| Detalle tipo cargando | Sí | Skeleton en tabla | Esperar | Reintento |
| Detalle con características | Sí | Tabla completa con toggles | Asociar, reordenar, desasociar | N/A |
| Tipo sin características | Sí | Mensaje: "Este tipo de producto aún no tiene características asignadas." | Pulsar "Asociar característica" | Asociar primera |
| Límite 20 alcanzado | Sí | Badge "20/20" + Botón asociar deshabilitado | Tooltip explicativo | Desasociar alguna |
| Guardando cambios | Sí | Botones deshabilitados + spinner | Evitar envíos dobles | Esperar respuesta |
| Error de guardado | Sí | Mensaje visible sin perder datos | Reintentar guardado | Repetir acción |
| Sin permisos | Sí | Explicación de acceso restringido | Volver | Solicitar permisos |

### Reglas para datos remotos

- La consulta del esquema expone IDs estables de características, tipo de dato, unidad y valores permitidos.
- Las mutaciones incrementan la versión del esquema del tipo de producto.
- No se aplica guardado optimista destructivo; las confirmaciones dependen del backend.

---

## 11. Comportamiento responsivo

DESIGN.md define 12 columnas en escritorio y 4 en móvil.

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Barra completa | Condensada | Patrón global móvil |
| Listado tipos | Tabla completa | Tabla simplificada | Tarjetas apiladas |
| Detalle atributos | Tabla con orden y toggles | Tabla compacta | Tarjetas con controles apilados |
| Modal asociar | Diálogo centrado | Diálogo centrado | Modal de pantalla completa |

### Condiciones críticas

- Funcional a 320 px sin scroll horizontal.
- Controles táctiles de mínimo 44x44 px en móvil.

---

## 12. Accesibilidad

- Cumplimiento WCAG 2.2 AA.
- Encabezados semánticos únicos (`<h1>`, `<h2>`).
- Toggles de obligatoriedad con `aria-checked` y etiquetas de texto claras.
- Diálogos modales con atrapamiento de foco (`focus trap`) y cierre con `Escape`.
- Alertas dinámicas anunciadas mediante `aria-live`.

---

## 13. Tono visual y contenido

Aplicar DESIGN.md como única fuente de representación visual.

### Microcopy crítica

| Contexto | Texto propuesto | Observación |
|---|---|---|
| Límite alcanzado | "Has alcanzado el límite de 20 características para este tipo de producto." | Límite operativo MVP |
| Cambio de obligatoriedad | "La obligatoriedad se aplicará en la próxima edición de los productos existentes." | No invalida legados |
| Éxito asociación | "Característica asociada exitosamente." | Confirmación |
| Desasociación bloqueada | "No se puede desasociar: existen variantes activas que utilizan esta característica." | Regla de consistencia |

---

## 14. Restricciones técnicas relevantes

- Aplicación objetivo: React, TypeScript, TanStack Query.
- Contratos HTTP: OpenAPI / Swagger.
- Consistencia: Esquema versionado expuesto a Catálogo Core mediante API interna.

### Dependencias o contratos

| Tipo | Referencia | Impacto |
|---|---|---|
| Entrada | Catálogo de características (WF-009) | Provee características activas disponibles |
| Salida | Esquema por `tipo_producto_id` | Consumido por Catálogo Core (WF-003) y Carga Masiva (WF-001) |

---

## 15. Privacidad, seguridad y acciones sensibles

- Las acciones de asociación y desasociación requieren permisos comerciales autorizados.
- La desasociación exige confirmación explícita mediante diálogo modal.
- No se exponen credenciales ni detalles de base de datos en errores de interfaz.

---

## 16. Criterios de aceptación del wireframe

- [x] Permite consultar los tipos de producto, crear tipos ligeros y ver sus características asignadas.
- [x] Permite asociar características activas a un tipo de producto sin duplicados.
- [x] Permite configurar obligatoriedad (Obligatoria / Opcional) por característica.
- [x] Aplica el límite operativo configurable (`MAX_PRODUCT_TYPE_ATTRIBUTES`).
- [x] Desacopla totalmente las características de las categorías de navegación (sin herencia por categoría).
- [x] Permite desasociar características mediante confirmación y baja segura.
- [x] Es responsivo y cumple DESIGN.md.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01 | S-02, asociación de característica a tipo de producto |
| CA-02 | S-02, prevención de duplicados de asociación |
| CA-03 | S-04, desasociación segura con verificación de uso |
| CA-04 | S-01 y S-02, consulta del esquema de atributos por `tipo_producto_id` |
| CA-05 | S-01 y S-02, desactivación lógica y preservación de histórico |
| CA-06 | Desacople normativo: Categorías no heredan ni definen características; única `categoria_id` en MVP |
| CA-07 | Identidad y esquema por `tipo_producto_id` único |
| CA-08 | S-02, control del límite operativo configurable de atributos |
| CA-09 | S-02, cambio de obligatoriedad sin desactivar productos existentes |
| CA-10 | Esquema directo sin herencia por categoría |
| CA-11 | Validación de compatibilidad y límite al asociar |
| CA-12 | Reubicación en árbol no recalcula características |

---

## 17. Supuestos

| ID | Supuesto | Motivo | Impacto si es incorrecto | Validar |
|---|---|---|---|---|
| SUP-01 | WF-010 es el ID asignado en INDEX.md | Rama `lopez` | Renombrar archivo | Sí |
| SUP-02 | La ruta propuesta es `/tipos-producto` | Estandarización de navegación | Ajustar rutas | Sí |
| SUP-03 | Escritorio es el dispositivo principal | Trabajo administrativo de catálogo | Adaptar responsive | Sí |

---

## 18. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea | Estado |
|---|---|---|---|---|
| Q-01 | Resuelto: Esquema pertenece a Tipo de Producto; categorías son solo navegación. | Specs/HU definitivos | No | Resuelta |
| Q-02 | Resuelto: Límite es configuración operativa (`MAX_PRODUCT_TYPE_ATTRIBUTES`). | Spec/HU | No | Resuelta |
| Q-03 | Resuelto: Desasociación requiere verificación asíncrona ante variantes activas. | Spec/HU | No | Resuelta |
| D-01 | Selección de librería UI y estrategia CSS | Frontend | Implementación | Pendiente |

### Alineación definitiva de Asociación Tipo Producto - Característica

- El esquema de datos se vincula exclusivamente a `tipo_producto_id`, permitiendo mover productos entre categorías de navegación sin alterar sus atributos requeridos ni su identidad técnica.
- Cada tipo de producto administra sus características activas bajo el límite configurable `MAX_PRODUCT_TYPE_ATTRIBUTES`, con obligatoriedad definida explícitamente. No existe propiedad de orden visual en el contrato normativo.

---

## 19. Registro de revisiones

| Versión | Fecha | Autor | Cambio | Aprobado por |
|---|---|---|---|---|
| 0.1 | 2026-09-17 | Asistente | Borrador inicial de asociación Tipo de producto–Característica | Pendiente |
| 0.3 | 2026-09-18 | Asistente | Desacople de categorías y adopción de Tipo de Producto | Pendiente |
| 0.4 | 2026-09-21 | Asistente | Reconstitución completa del wireframe con estructura exhaustiva, pantallas detalladas y límite operativo | Aprobado |
| 0.5 | 2026-09-23 | Asistente | Incorporación de alta de tipos ligeros y eliminación de orden visual | Aprobado |

---

## Lista de control antes de generar el HTML

- [x] Las fuentes funcionales están identificadas.
- [x] El alcance y fuera de alcance están claros.
- [x] Las pantallas y variantes están inventariadas (S-01 a S-04).
- [x] Los criterios CA-01 a CA-09 están cubiertos.
- [x] El límite de 20 atributos y el desacople de categorías están documentados.
- [x] Los supuestos y preguntas están registrados.
- [x] El formato HTML está definido.
- [ ] Confirmar el ID WF-010 contra INDEX.md.
- [ ] Confirmar rutas y permisos antes de implementar el frontend.

---
