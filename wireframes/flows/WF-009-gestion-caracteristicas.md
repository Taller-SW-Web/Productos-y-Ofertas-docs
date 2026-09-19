# WF-009 — Gestión de características y sus valores

> **Fuente normativa de esta revisión:** `specs_consolidado_final.md` y `hu_consolidado_final.md` (18-09-2026). Los nombres/eventos de Ventas y Postventa son contratos **provisionales no homologados**; el prototipo no debe simular pagos realizados ni confirmaciones externas como si estuvieran implementadas. Las anotaciones, supuestos, preguntas y referencias técnicas permanecen en este documento y no se muestran como elementos de la interfaz simulada.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la gestión de
características del catálogo descrita en este archivo.

Antes de diseñar:

1. Consulta ../../specs/SPEC-009-gestion-caracteristicas.md.
2. Consulta ../../hu/HU-009-gestion-caracteristicas.md.
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

- No agregues campos, permisos, endpoints ni reglas no documentadas.
- Los tipos son exactamente `TEXTO`, `NUMERO` y `LISTA`.
- `TEXTO`: el valor que capture un producto se limita a 100 caracteres.
- `NUMERO`: exige unidad de medida y validación estricta de formato numérico.
- `LISTA`: máximo 50 valores activos por característica.
- Renombrar un valor en uso lo actualiza por ID: los productos conservan el
  vínculo y muestran el nuevo texto; no se debe romper la asociación.
- No manejes aquí el CRUD de marcas: corresponde a WF-011.
- No manejes aquí la asociación Categoría-Característica ni la herencia:
  corresponde a WF-010.
- No elijas una librería de UI ni una estrategia CSS.
- Usa datos ficticios y no consumas APIs reales.
- Numera las anotaciones como A-01, A-02, A-03, etc.
- Mantén visibles las reglas de límite (100, 50 y unidad) donde aplique.

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

1. Listado/consulta de características.
2. Creación con selección de tipo y unidad de medida condicional.
3. Edición de nombre y datos de la característica.
4. Gestión de valores de tipo `LISTA` (agregar, renombrar, baja lógica).
5. Control de los límites (50 valores activos, 100 caracteres TEXTO, unidad
   numérica).
6. Baja lógica y reactivación de una característica.
7. Estados de carga, vacío, error, permisos y conflicto.
8. Navegación funcional entre los estados simulados.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-009 |
| Nombre del flujo | Gestión de características y sus valores |
| Versión | 0.1 |
| Estado | Borrador |
| Responsable | Leonardo Lopez |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-18 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | SPEC-009-gestion-caracteristicas.md, secciones 1–6 | Tipos, límites y reglas de valores |
| Historia de usuario | HU-009-gestion-caracteristicas.md, CA-01 a CA-06 | Criterios de característica y valores |
| Diseño | DESIGN.md | Lenguaje visual monocromático de baja fidelidad |
| Backlog | No proporcionado | No se asignan IDs de backlog |

> CA-05/CA-06 (Marcas) y CA-07/CA-08/CA-09 (Asociación) no se cubren aquí:
> las propias fuentes remiten a `HU-011-gestion-marcas.md` y
> `HU-010-asociacion-categoria-caracteristica.md` (WF-011 y WF-010).

### Funcionalidades incluidas

- Consultar características y su tipo.
- Crear una característica `TEXTO`, `NUMERO` o `LISTA`.
- Exigir unidad de medida en `NUMERO`.
- Gestionar hasta 50 valores activos en `LISTA`.
- Agregar, renombrar y dar de baja valores por ID.
- Renombrar una característica.
- Baja lógica y reactivación de características activas/inactivas.

### Fuera de alcance

- CRUD de marcas: corresponde a WF-011.
- Asociación Categoría-Característica, herencia y obligatoriedad: WF-010.
- Captura de valores en el formulario de producto: Catálogo Core / WF-003.
- Eliminación física de características o valores.

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Gestor comercial responsable de la taxonomía del catálogo |
| Rol en el sistema | Gestor comercial autenticado |
| Nivel técnico | No especificado; diseñar para nivel operativo básico/intermedio |
| Contexto de uso | Definición del estándar de atributos antes de asociarlos a categorías |
| Necesidad principal | Contar con un catálogo de atributos estandarizado y consistente |
| Permisos relevantes | Consultar, crear, editar, desactivar y reactivar características; códigos pendientes |
| Dispositivo principal | Escritorio como hipótesis; consulta adaptada a tablet/móvil |

## 4. Objetivo del flujo

El gestor comercial debe poder crear y mantener características tipadas
(`TEXTO`, `NUMERO`, `LISTA`), gestionar los valores de las de tipo lista bajo
límites estrictos y dar de baja o reactivar características, para alimentar la
posterior asociación con categorías.

### Resultado exitoso

La característica queda registrada con su tipo. Si es `NUMERO`, tiene unidad de
medida. Si es `LISTA`, sus valores activos no superan 50 y el renombrado se
propaga por ID a los productos existentes sin romper datos.

### Indicadores de finalización

- Creación: mensaje Característica creada y presencia en el listado.
- Edición: mensaje Cambios guardados.
- Valor agregado: mensaje Valor agregado con contador actualizado.
- Baja de característica: estado Inactivo confirmado.
- Reactivación: estado Activo confirmado.

El patrón exacto de notificación debe alinearse con el sistema global.

## 5. Precondiciones y disparador

### Precondiciones

- El usuario tiene una sesión válida.
- El usuario posee el permiso requerido para la acción.
- No se requieren categorías previas para crear una característica.

### Puntos de entrada

- Ruta propuesta del listado: /productos/caracteristicas.
- Entrada propuesta: opción Características dentro del módulo Productos y
  ofertas.
- Crear: acción Crear característica desde el listado.
- Consultar/editar: acción sobre una fila o tarjeta.
- Gestionar valores: acción Valores sobre una característica tipo `LISTA`.
- Desactivar/reactivar: acción contextual sobre el estado.

Las rutas y ubicación exactas son propuestas de wireframe y deben confirmarse.

### Salidas del flujo

| Resultado | Destino o comportamiento |
|---|---|
| Creación exitosa | S-01 con la característica creada |
| Edición exitosa | S-01 con datos actualizados |
| Cancelación sin cambios | Regresa a S-01 o al origen |
| Cancelación con cambios | Comportamiento pendiente; Q-04 |
| Baja lógica exitosa | S-01 con estado Inactivo |
| Reactivación exitosa | S-01 con estado Activo |
| Error recuperable | Permanece en la pantalla y conserva los datos |
| Sin permisos | Bloquea la acción y ofrece retorno seguro |

## 6. Secuencia principal

### Flujo A — Consultar características

1. El gestor entra a Gestión de características.
2. El sistema carga las características disponibles.
3. La lista muestra nombre, tipo y, según el tipo, unidad de medida o número
   de valores.
4. El gestor abre el detalle de una característica.
5. El sistema muestra tipo, reglas aplicables y estado.

### Flujo B — Crear característica

1. Desde S-01, el gestor selecciona Crear característica.
2. En S-02 ingresa nombre y selecciona el tipo.
3. Si el tipo es `NUMERO`, el sistema exige unidad de medida.
4. El gestor guarda.
5. Si el tipo es `LISTA`, el sistema invita a agregar valores en S-04.
6. Se muestra S-01 o S-06 con la nueva característica.

### Flujo C — Gestionar valores de tipo LISTA

1. El gestor abre la característica tipo `LISTA` y selecciona Gestionar valores.
2. En S-04 ve el contador X/50 valores activos.
3. Agrega un valor nuevo.
4. Renombra un valor en uso: se propaga por ID a los productos.
5. Da de baja un valor inactivo con confirmación.
6. El contador se actualiza en cada operación.

### Flujo D — Editar característica

1. El gestor abre una característica desde S-01 o S-06.
2. Selecciona Editar.
3. En S-03 modifica el nombre y, si es `NUMERO`, la unidad de medida.
4. Guarda.

### Flujo E — Baja lógica y reactivación

1. El gestor selecciona Desactivar.
2. S-05 explica que dejará de considerarse activa en las asociaciones.
3. El gestor confirma.
4. La característica pasa a Inactivo.
5. Reactivar desde el listado la vuelve a Activo.

### Flujos alternativos

| ID | Condición | Comportamiento esperado | Retorno |
|---|---|---|---|
| ALT-01 | Nombre vacío | Error y guardado bloqueado | S-02/S-03 |
| ALT-02 | Tipo `NUMERO` sin unidad | Error y guardado bloqueado | S-02/S-03 |
| ALT-03 | Tipo `LISTA` sin valores | Permitir guardado e invitar a agregar valores | S-04 |
| ALT-04 | Valor de lista vacío o duplicado | Error en la fila | S-04 |
| ALT-05 | Alcanzar 50 valores activos | Bloquear agregar y explicar el límite | S-04 |
| ALT-06 | Renombrar un valor en uso | Confirmar que se propaga por ID | S-04 |
| ALT-07 | Valor con productos asociados al dar de baja | Registrar decisión pendiente | S-04 |
| ALT-08 | Error al guardar | Conservar datos y permitir reintento | S-02-E |
| ALT-09 | Error al cargar el listado | Mostrar estado no disponible con reintento | S-01-E |
| ALT-10 | Usuario sin permiso | Ocultar o deshabilitar acción y explicar acceso | Estado global |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Ruta/presentación | Obligatoria |
|---|---|---|---|---|
| S-01 | Gestión de características | Consultar y entrar a crear, editar, gestionar valores o desactivar | /productos/caracteristicas propuesta | Sí |
| S-01-E | Vacío o error del listado | Diferenciar ausencia de carga | Variante de S-01 | Sí |
| S-02 | Crear característica | Capturar nombre, tipo y unidad condicional | Ruta propuesta /productos/caracteristicas/nueva | Sí |
| S-02-E | Error de guardado | Conservar datos y recuperar | Variante de S-02/S-03 | Sí |
| S-03 | Editar característica | Actualizar nombre y unidad | Ruta propuesta /productos/caracteristicas/:id/editar | Sí |
| S-04 | Gestionar valores (LISTA) | Agregar, renombrar y dar de baja valores | Diálogo o panel | Sí |
| S-05 | Confirmar desactivación | Evitar baja accidental | Diálogo modal | Sí |
| S-06 | Detalle de característica | Consultar tipo, reglas y estado | /productos/caracteristicas/:id propuesta | Sí |

## 8. Mapa de navegación

~~~mermaid
flowchart TD
    A["S-01 Listado"] --> B["S-02 Crear"]
    A --> C["S-03 Editar"]
    A --> D["S-06 Detalle"]
    D --> C
    D --> E["S-04 Valores"]
    A --> F["S-05 Desactivar"]
    D --> F
    F --> A
~~~

## 9. Especificación por pantalla

### S-01 — Gestión de características

#### Propósito

Dar acceso a consulta, creación, edición, gestión de valores y baja lógica.

#### Jerarquía de contenido

1. Título Gestión de características.
2. Acción Crear característica.
3. Listado de características.
4. Reglas aplicables por tipo y estado.

#### Regiones y componentes

| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + acción | Gestión de características; Crear característica | Acción según permiso |
| Listado | Tabla en escritorio; tarjetas en móvil | Nombre, tipo, unidad o valores, estado | Abre detalle |
| Fila/tarjeta | Acciones contextuales | Ver, Editar, Valores (solo LISTA), Desactivar/Reactivar | Sin Eliminar |
| Estado | Etiqueta textual | Activo, Inactivo | No depender del color |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Crear | Crear característica | Permiso de creación | Abre S-02 |
| Secundaria | Consultar | Ver | Permiso de consulta | Abre S-06 |
| Secundaria | Modificar | Editar | Permiso de edición | Abre S-03 |
| Secundaria | Valores | Valores | Tipo LISTA y permiso | Abre S-04 |
| Destructiva reversible | Desactivar | Desactivar | Activa y permiso | Abre S-05 |
| Reversible | Reactivar | Reactivar | Inactiva y permiso | Reactiva |

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Nombre | Característica | Texto | Alta | No debe faltar |
| Tipo | Característica | TEXTO / NUMERO / LISTA | Alta | Mostrar No disponible |
| Unidad de medida | Característica (NUMERO) | Texto (ej. cm, kg) | Media | Solo si NUMERO |
| Valores activos | Característica (LISTA) | Contador X/50 | Media | Solo si LISTA |
| Estado | Característica | Texto | Alta | Mostrar No disponible |

No agregar búsqueda, filtros, ordenamiento o paginación al prototipo hasta que
la necesidad y reglas estén confirmadas.

#### Navegación y foco

- Foco inicial: título o primera acción.
- El orden recorre Crear, filas y sus acciones.
- Las acciones contextuales deben ser utilizables por teclado.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-01 | Crear característica | Alberga los tres tipos |
| A-02 | Unidad | Se exige solo en tipo NUMERO |
| A-03 | Contador de valores | Máximo 50 activos en LISTA |
| A-04 | Acciones | No incluir eliminación física |
| A-05 | Marcas/Asociación | No aparecen; son WF-011 y WF-010 |

### S-01-E — Vacío o error de listado

- Vacío: Aún no hay características. Acción: Crear primera característica (con
  permiso). No presentar la ausencia como error.
- Error: No pudimos cargar las características. Acción: Reintentar. No mostrar
  datos obsoletos como vigentes.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-06 | Vacío | Ofrece creación solo a usuarios autorizados |
| A-07 | Error | Incluye recuperación y no revela detalles internos |

### S-02 — Crear característica

#### Propósito

Capturar el nombre, el tipo y, cuando corresponde, la unidad de medida.

#### Jerarquía de contenido

1. Nombre.
2. Tipo (TEXTO / NUMERO / LISTA).
3. Unidad de medida (condicional a NUMERO).
4. Acciones Crear característica y Cancelar.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Datos generales | Campos | Nombre | Obligatorio |
| Tipo | Selector radio | TEXTO / NUMERO / LISTA | Cambia campos condicionales |
| Unidad (NUMERO) | Campo | Unidad de medida | Obligatorio si NUMERO |
| Acciones | Botones | Crear; Cancelar | Guardado condicionado |

#### Formulario y validaciones

| Campo | Tipo | Obligatorio | Validación | Mensaje propuesto |
|---|---|---|---|---|
| Nombre | Texto | Sí | Contenido requerido; unicidad pendiente (Q-01) | Ingresa un nombre para la característica. |
| Tipo | Radio | Sí | Uno de los tres | Selecciona un tipo. |
| Unidad de medida | Texto | Sí si NUMERO | Contenido requerido | Ingresa la unidad de medida. |

- Límite TEXTO: 100 caracteres por valor de producto (no aplica a este
  formulario).
- LISTA: el guardado no exige valores previos; se invita a agregarlos en S-04.

#### Navegación y foco

- Foco inicial: campo Nombre.
- Al cambiar tipo a NUMERO, el foco se dirige a la unidad.
- Foco después de error: primer campo inválido.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-08 | Tipo | Define las reglas de validación posteriores |
| A-09 | Unidad | Solo visible y obligatoria en NUMERO |
| A-10 | TEXTO | Los valores de producto se limitan a 100 caracteres |
| A-11 | LISTA | Los valores se gestionan después en S-04 |

### S-02-E — Error de guardado

- Conservar los datos del formulario.
- Mostrar un mensaje accionable y seguro.
- Permitir reintentar sin crear duplicados.
- No exponer stack traces ni nombres de servicios.

### S-03 — Editar característica

#### Propósito

Actualizar el nombre y, si el tipo es `NUMERO`, la unidad de medida.

#### Comportamiento

- El tipo es inmutable desde creación (Q-03 resuelta); no permitir cambiarlo.
- La unidad se edita solo en `NUMERO`.
- Los valores de `LISTA` se editan desde S-04, no aquí.
- Guardar valida las mismas reglas que la creación.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-12 | Tipo inmutable | No existe edición de tipo; crear nueva característica si se requiere otro tipo |
| A-13 | Unidad | Aplica solo a NUMERO |

### S-04 — Gestionar valores (tipo LISTA)

#### Propósito

Agregar, renombrar y dar de baja valores manteniendo el límite de 50 activos y
la integridad por ID.

#### Jerarquía de contenido

1. Nombre de la característica y contador X/50.
2. Campo Agregar valor.
3. Listado de valores con estado.
4. Acciones sobre cada valor.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + contador | Característica y X de 50 activos | Refleja la regla |
| Agregado | Campo + botón | Nuevo valor | Bloqueado al llegar a 50 |
| Valores | Tabla/lista | Valor, estado, uso | Renombrar propaga por ID |
| Acciones | Botones por fila | Renombrar, Desactivar/Reactivar | Confirmación según caso |

#### Reglas de valores

- El contador cuenta solo valores activos (máximo 50).
- Valor vacío o duplicado no se permite.
- Renombrar un valor en uso lo propaga por ID a los productos existentes.
- La baja de valor LISTA es lógica y requiere verificación asíncrona segura; rechazar si lo usa SKU ACTIVO como identidad o producto ACTIVO como valor requerido. Ante falta de respuesta no desactivar.
- La desactivación de un valor activo requiere confirmación.

#### Navegación y foco

- Foco inicial en el campo Agregar valor.
- Al agregar, la lista se refresca y el foco permanece en el campo.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-14 | Contador | Límite estricto de 50 activos |
| A-15 | Renombrar | Se propaga por ID sin romper data |
| A-16 | Baja de valor | Lógica; confirmación requerida |
| A-17 | Límite alcanzado | Agregar se bloquea y explica el límite |

### S-05 — Confirmar desactivación

#### Contenido

- Título Desactivar característica.
- Nombre de la característica.
- Mensaje: La característica dejará de considerarse activa en las asociaciones.
- No afirmar eliminación.
- Acciones Desactivar y Cancelar.

#### Navegación y foco

- Foco dentro del diálogo; Escape o Cancelar cierran sin cambios.
- Al cerrar sin confirmar, el foco vuelve al activador.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-18 | Efecto | Las asociaciones existentes dejan de considerarse activas |
| A-19 | Confirmación | Baja lógica, sin eliminación |

### S-06 — Detalle de característica

#### Jerarquía de contenido

1. Nombre, tipo y estado.
2. Reglas aplicables (unidad o contador de valores).
3. Acciones Editar, Gestionar valores (si LISTA), Desactivar/Reactivar, Volver.

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Nombre | Característica | Texto | Alta | Error de integridad |
| Tipo | Característica | Texto | Alta | No disponible |
| Unidad | Característica | Texto | Media | Solo NUMERO |
| Valores activos | Característica | Contador | Media | Solo LISTA |
| Estado | Característica | Texto | Alta | No disponible |

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-20 | Reglas | Se muestran las restricciones del tipo |
| A-21 | Valores | Enlace a S-04 solo para LISTA |

## 10. Estados de interfaz

| Estado | Aplica | Representación | Acciones | Recuperación |
|---|---|---|---|---|
| Listado cargando | Sí | Skeleton/indicador | Esperar | Reintento si falla |
| Listado vacío | Sí | Mensaje y Crear | Crear con permiso | N/A |
| Listado con datos | Sí | Tabla/tarjetas | Ver, editar, valores, desactivar | N/A |
| Formulario inicial | Sí | Campos vacíos | Completar/cancelar | N/A |
| Tipo NUMERO sin unidad | Sí | Error y guardado bloqueado | Corregir | Corregir |
| Límite de 50 alcanzado | Sí | Agregar bloqueado | Explicar límite | Retirar valor |
| Valor duplicado | Sí | Error asociado a fila | Corregir | Corregir |
| Guardando | Sí | Acción deshabilitada | Evitar duplicado | Esperar |
| Guardado exitoso | Sí | Confirmación + listado | Continuar | N/A |
| Error de guardado | Sí | Mensaje sin perder datos | Reintentar | Repetir envío seguro |
| Característica activa | Sí | Estado Activo | Editar/desactivar | N/A |
| Característica inactiva | Sí | Estado Inactivo | Editar/reactivar | Reactivar |
| Sin permisos | Sí | Explicación segura | Volver | Solicitar acceso fuera del flujo |
| Sesión expirada | Sí | Aviso/autenticación | Iniciar sesión | Recuperar contexto si es posible |

### Reglas para datos remotos

- Consultar el listado vigente al cargar y refrescarlo después de guardar.
- No aplicar guardado optimista a creación ni edición.
- Los valores se sincronizan con las características sin romper vínculos.
- Conservar el formulario ante errores recuperables.

## 11. Comportamiento responsivo

DESIGN.md define 12 columnas en escritorio y 4 en móvil, sin breakpoints
exactos de tablet. El prototipo demuestra adaptación sin fijar los definitivos.

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Completa | Condensada | Patrón global móvil |
| Listado | Tabla | Tabla reducida | Tarjetas |
| Formulario | Campos en columnas relacionadas | Regiones apiladas | Una columna |
| Valores LISTA | Tabla con contador | Contador y lista | Tarjetas |
| Modal de desactivación | Centrado | Margen lateral | Casi completo |
| Anotaciones | Panel lateral | Debajo | Lista/colapsable |
| Contenido omitido | Ninguno | Ninguno | Ninguno; reorganizar |

### Condiciones críticas

- Verificar 320 px sin desplazamiento horizontal.
- Contador de valores visible en móvil.
- El formulario debe funcionar con zoom de 200%.

## 12. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Encabezado principal único por pantalla.
- Campos con etiquetas persistentes y errores asociados.
- El estado Activo/Inactivo se expresa con texto e icono.
- El tipo se comunica textualmente.
- Los diálogos contienen el foco y lo devuelven al activador.
- Acciones móviles de 44 por 44 px.
- Los cambios no dependen del color.
- Anotaciones excluidas del árbol accesible.

## 13. Tono visual y contenido

Aplicar DESIGN.md como única fuente de representación visual.

### Consideraciones específicas

- Densidad: media.
- Sensación buscada: estándar, control y consistencia.
- Elemento dominante en S-01: listado y Crear característica.
- Elemento dominante en S-04: contador 50 y acciones de valores.

### Microcopy crítica

| Contexto | Texto propuesto | Observación |
|---|---|---|
| Acción principal | Crear característica | Resultado concreto |
| Tipo NUMERO | Ingresa la unidad de medida. | Regla de CA-02 |
| TEXTO | Los valores se limitan a 100 caracteres. | Límite CA-01 |
| Límite | Has alcanzado el máximo de 50 valores activos. | Regla CA-03 |
| Renombrar | El cambio se aplicará a los productos que usan este valor. | Propaga por ID |
| Baja de característica | La característica dejará de considerarse activa en las asociaciones. | Efecto claro |
| Error técnico | No pudimos cargar las características. Inténtalo nuevamente. | Recuperación |

## 14. Restricciones técnicas relevantes

- Aplicación objetivo: React, TypeScript y Vite.
- Navegación: React Router; rutas exactas pendientes.
- Estado remoto: TanStack Query.
- Formularios: React Hook Form y Zod.
- Contratos HTTP: OpenAPI/Swagger.
- La librería de componentes y estrategia CSS están pendientes.
- El prototipo es HTML/CSS/JS estático.

### Dependencias o contratos

| Tipo | Operación o referencia | Impacto visible |
|---|---|---|
| HTTP | Listar características; pendiente | Alimenta S-01 |
| HTTP | Crear/editar característica; pendiente | S-02/S-03 |
| HTTP | Gestionar valores LISTA; pendiente | Alimenta S-04 |
| HTTP | Desactivar/reactivar; pendiente | Actualiza S-01 |
| Permiso | Consultar/crear/editar/desactivar; código pendiente | Acciones condicionadas |

## 15. Privacidad, seguridad y acciones sensibles

- Autorizar acciones de escritura en servidor.
- Sanear nombre, unidad y valores.
- Evitar valores duplicados y líneas vacías.
- No exponer stack traces ni nombres de servicios.
- Confirmar la baja lógica.
- El documento no exige reautenticación.

## 16. Criterios de aceptación del wireframe

- [ ] Solo usuarios autorizados ven o ejecutan cada acción.
- [ ] Permite crear los tres tipos de característica.
- [ ] Valida límite TEXTO de 100 caracteres.
- [ ] Exige unidad de medida en NUMERO.
- [ ] Limita a 50 valores activos en LISTA.
- [ ] El renombrado de valores se propaga por ID.
- [ ] Permite baja lógica y reactivación de características.
- [ ] No incluye CRUD de marcas ni asociación Categoría-Característica.
- [ ] Incluye carga, vacío, error, permisos y sesión.
- [ ] Funciona con teclado y no depende del color.
- [ ] Funciona con HTML/CSS/JS estáticos.
- [ ] Es consistente con DESIGN.md.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01 | S-06 y A-10 (límite TEXTO) |
| CA-02 | S-02/S-03, unidad obligatoria y A-09 |
| CA-03 | S-04, contador 50 y A-14/A-17 |
| CA-04 | S-04, A-15 y ALT-06 |
| CA-05 | WF-011 (referencia cruzada) |
| CA-06 | WF-011 (referencia cruzada) |
| CA-07 | WF-010 (referencia cruzada) |
| CA-08 | WF-010 (referencia cruzada) |
| CA-09 | WF-010 (referencia cruzada) |

## 17. Supuestos

| ID | Supuesto | Motivo | Impacto si es incorrecto | Validar |
|---|---|---|---|---|
| SUP-01 | WF-009 es el ID asignado en INDEX.md | Asignación de la rama `lopez` | Renombrar archivo/referencias | Sí |
| SUP-02 | La ruta será /productos/caracteristicas | No se entregó mapa de navegación | Cambiar rutas/entrada | Sí |
| SUP-03 | Escritorio es el dispositivo principal | Gestión de valores | Cambiar prioridad responsive | Sí |
| SUP-04 | Renombrar y desactivar valor son acciones separadas | Regla CA-04 y baja lógica | Ajustar flujo de valores | Sí |

## 18. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea wireframe | Estado |
|---|---|---|---|---|
| Q-01 | ¿El nombre de la característica es único? | Producto | No para flujo base | Abierta |
| Q-02 | Resuelto: baja lógica bloqueada cuando la identidad de SKU ACTIVO o el valor requerido por producto ACTIVO lo utiliza; verificación EDA con barrera y fallo cerrado. | Spec/HU Características | No | Resuelta |
| Q-03 | Resuelto: tipo inmutable desde creación; crear otra característica con ID nuevo. | Spec/HU Características | No | Resuelta |
| Q-04 | ¿Debe advertirse al salir del formulario con cambios sin guardar? | Producto/UX | No | Abierta |
| Q-05 | ¿La unidad de medida es una lista cerrada o texto libre? | Producto | No para wireframe | Abierta |
| Q-06 | ¿Existe búsqueda, filtros u orden en el listado? | Producto | No para flujo base | Abierta |
| D-01 | Selección de librería UI y estrategia CSS | Frontend | No para wireframe; sí para implementación | Pendiente |

### Alineación definitiva de Características

- Este wireframe administra exclusivamente características y valores `TEXTO` (máximo 100 caracteres), `NUMERO` (unidad obligatoria) y `LISTA` (máximo 50 valores activos). La asociación/herencia y el límite de 20 efectivos corresponden al **WF-010**, y el CRUD de marcas al **WF-011**; no incluir pantallas CRUD redundantes.
- Renombrar un valor conserva su ID y no altera SKU. La baja de valores LISTA usados por SKU ACTIVO o producto ACTIVO requerido se rechaza con verificación asíncrona segura; el tipo es inmutable.

### Estados de verificación asíncrona al desactivar valor LISTA
Al solicitar baja mostrar «Comprobando uso en productos», impedir nuevos vínculos bajo barrera y mantener el valor sin confirmar baja hasta recibir resultado. Si lo usa un SKU ACTIVO o producto ACTIVO requerido, mostrar rechazo y conservar valor; si no hay respuesta, informar error recuperable y no dar por exitosa la baja. El histórico conserva IDs y snapshots.

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
- [x] Los criterios CA-01 a CA-04 están cubiertos (CA-05 a CA-09 en WF-011/WF-010).
- [x] Los límites (100, 50 y unidad) están documentados.
- [x] El renombrado por ID está documentado.
- [x] Los supuestos y preguntas están registrados.
- [x] El formato HTML está definido.
- [ ] Confirmar el ID WF-009 contra INDEX.md.
- [x] Q-02 y Q-03 resueltas: baja protegida y tipo inmutable.
- [ ] Confirmar rutas y permisos antes de implementar el frontend.

---
