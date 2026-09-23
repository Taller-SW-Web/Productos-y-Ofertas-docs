# WF-011 — Gestión de marcas

> **Fuentes normativas de esta revisión:** `specs/SPEC-011-gestion-marcas.md` y `hu/HU-011-gestion-marcas.md`. Los nombres/eventos de Ventas y Postventa son contratos **provisionales no homologados**; el prototipo no debe simular pagos realizados ni confirmaciones externas como si estuvieran implementadas. Las anotaciones, supuestos, preguntas y referencias técnicas permanecen en este documento y no se muestran como elementos de la interfaz simulada.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la gestión de marcas
descrita en este archivo.

Antes de diseñar:

1. Consulta ../../specs/SPEC-011-gestion-marcas.md.
2. Consulta ../../hu/HU-011-gestion-marcas.md.
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
- El nombre de la marca es único ignorando mayúsculas/minúsculas: si existe
  “Nike”, no se acepta “NIKE” ni “nike”.
- La descripción y el país de origen son opcionales.
- El logo no debe superar los 5 MB; al excederlo se rechaza indicando el
  motivo.
- La desactivación es baja lógica y se completa solo si la verificación asíncrona correlacionada
  contra Catálogo Core (plazo operacional de mensajes por confirmar) confirma que no hay productos activos.
- Si Catálogo Core no devuelve una confirmación confiable, se rechaza la desactivación; no se asume “sin productos” ni un timeout HTTP específico.
- La reactivación de una marca desactivada conserva su ID y comprueba unicidad global del nombre normalizado; no añade comprobaciones comerciales no documentadas.
- NUNCA muestres eliminación física de una marca.
- No elijas una librería de UI ni una estrategia CSS.
- Usa datos ficticios y no consumas APIs reales.
- Numera las anotaciones como A-01, A-02, A-03, etc.
- Mantén visible el efecto de las marcas activas en los filtros de canales.

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

1. Listado/consulta de marcas.
2. Creación de marca con logo y país de origen opcionales.
3. Validación de unicidad del nombre (case-insensitive).
4. Edición de nombre, descripción, logo y país de origen.
5. Rechazo de logo mayor a 5 MB.
6. Confirmación de desactivación (baja lógica) y bloqueo por productos activos.
7. Variante de falta de confirmación en la verificación asíncrona correlacionada.
8. Reactivación de una marca.
9. Estados de carga, vacío, error, permisos y conflicto.
10. Navegación funcional entre los estados simulados.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-011 |
| Nombre del flujo | Gestión de marcas |
| Versión | 0.1 |
| Estado | Borrador |
| Responsable | Leonardo Lopez |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-18 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | SPEC-011-gestion-marcas.md, secciones 1–6 | Alcance, requisitos y NFR |
| Historia de usuario | HU-011-gestion-marcas.md, CA-01 a CA-08 | Criterios y escenarios |
| Diseño | DESIGN.md | Lenguaje visual monocromático de baja fidelidad |
| Backlog | No proporcionado | No se asignan IDs de backlog |

### Funcionalidades incluidas

- Consultar marcas y su estado.
- Crear una marca con nombre único, descripción y logo opcionales y país de
  origen opcional.
- Validar unicidad del nombre ignorando mayúsculas/minúsculas.
- Actualizar nombre, descripción, logo y país de origen.
- Rechazar logos mayores a 5 MB.
- Desactivar (baja lógica) con verificación asíncrona correlacionada de productos activos.
- Bloquear la desactivación ante timeout de la validación.
- Reactivar una marca desactivada.

### Fuera de alcance

- Gestión de categorías: WF-008.
- Gestión de características y valores: WF-009.
- Asociación Tipo de producto–Característica: WF-010.
- Asignación de productos a una marca: Catálogo Core.
- Almacenamiento físico del archivo de logo: servicio externo; aquí se gestiona
  la URL resultante.
- Eliminación física de marcas: prohibida.

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Gestor comercial responsable de la taxonomía del catálogo |
| Rol en el sistema | Gestor comercial autenticado |
| Nivel técnico | No especificado; diseñar para nivel operativo básico/intermedio |
| Contexto de uso | Mantenimiento periódico de la base de marcas |
| Necesidad principal | Clasificar productos y permitir filtrar el catálogo por marca |
| Permisos relevantes | Consultar, crear, editar, desactivar y reactivar marcas; códigos pendientes |
| Dispositivo principal | Escritorio como hipótesis; consulta adaptada a tablet/móvil |

## 4. Objetivo del flujo

El gestor comercial debe poder crear, consultar, actualizar, desactivar y
reactivar las marcas del catálogo, incluido su logo, manteniendo la unicidad
del nombre y sin eliminar físicamente, de modo que los canales de venta puedan
renderizar filtros por marca.

### Resultado exitoso

La marca queda registrada con estado Activo, nombre único y logo válido (≤ 5
MB). La desactivación solo se completa sin productos activos asociados y con
verificación asíncrona correlacionada respondida. La reactivación la vuelve disponible en los
filtros de los canales.

### Indicadores de finalización

- Creación: mensaje Marca creada y presencia en el listado.
- Edición: mensaje Cambios guardados con `updated_at` actualizado.
- Desactivación: estado Inactivo confirmado.
- Reactivación: estado Activo confirmado.

El patrón exacto de notificación debe alinearse con el sistema global.

## 5. Precondiciones y disparador

### Precondiciones

- El usuario tiene una sesión válida.
- El usuario posee el permiso requerido para la acción.

### Puntos de entrada

- Ruta propuesta del listado: /productos/marcas.
- Entrada propuesta: opción Marcas dentro del módulo Productos y ofertas.
- Crear: acción Crear marca desde el listado.
- Consultar/editar: acción sobre una fila o tarjeta.
- Desactivar/reactivar: acciones contextuales sobre el estado.

Las rutas y ubicación exactas son propuestas de wireframe y deben confirmarse.

### Salidas del flujo

| Resultado | Destino o comportamiento |
|---|---|
| Creación exitosa | S-01 con la marca creada |
| Edición exitosa | S-01 con datos actualizados |
| Cancelación sin cambios | Regresa a S-01 o al origen |
| Cancelación con cambios | Comportamiento pendiente; Q-05 |
| Desactivación exitosa | S-01 con estado Inactivo |
| Desactivación bloqueada | S-04-B con productos activos |
| Desactivación por timeout | S-04-T con validación sin respuesta |
| Reactivación exitosa | S-01 con estado Activo |
| Error recuperable | Permanece en la pantalla y conserva los datos |
| Sin permisos | Bloquea la acción y ofrece retorno seguro |

## 6. Secuencia principal

### Flujo A — Consultar marcas

1. El gestor entra a Gestión de marcas.
2. El sistema carga las marcas disponibles.
3. La lista muestra nombre, logo, país, productos activos y estado.
4. El gestor abre el detalle de una marca.
5. El sistema muestra los datos y las acciones disponibles.

### Flujo B — Crear marca

1. Desde S-01, el gestor selecciona Crear marca.
2. En S-02 ingresa nombre (obligatorio), descripción y país de origen
   (opcionales) y sube un logo.
3. El sistema valida unicidad del nombre y tamaño del logo.
4. Si el logo excede 5 MB, se rechaza con motivo en la interfaz.
5. La marca se registra en estado Activo y se muestra S-01 o S-05.

### Flujo C — Editar marca

1. El gestor abre una marca desde S-01 o S-05.
2. Selecciona Editar.
3. En S-03 modifica nombre (validando unicidad), descripción, logo o país.
4. Guarda y confirma con `updated_at` actualizado.

### Flujo D — Desactivar (baja lógica)

1. El gestor selecciona Desactivar desde S-01.
2. S-04 explica que dejará de mostrarse en los filtros de los canales.
3. El gestor confirma.
4. El sistema inicia la verificación asíncrona correlacionada con Catálogo Core; mantiene la solicitud pendiente sin presentar la marca como inactiva.
5. Sin productos activos: pasa a Inactivo.
6. Con productos activos: S-04-B explica el bloqueo.
7. Si no obtiene confirmación confiable, S-04-T rechaza la desactivación y mantiene la marca activa.

### Flujo E — Reactivar marca

1. El gestor selecciona Reactivar sobre una marca inactiva.
2. La marca pasa a Activo y vuelve a los filtros de los canales.

### Flujos alternativos

| ID | Condición | Comportamiento esperado | Retorno |
|---|---|---|---|
| ALT-01 | Nombre vacío | Error y guardado bloqueado | S-02/S-03 |
| ALT-02 | Nombre duplicado (case-insensitive) | Error: ya existe una marca registrada con ese nombre | S-02/S-03 |
| ALT-03 | Logo mayor a 5 MB | Rechazo con motivo del límite | S-02/S-03 |
| ALT-04 | Marca inexistente al editar | Error de no encontrado | S-01 |
| ALT-05 | Desactivar con productos activos | Bloqueo explicando el requisito | S-04-B |
| ALT-06 | Ausencia de confirmación asíncrona | Rechazar desactivación; no asumir resultado | S-04-T |
| ALT-07 | Error al guardar | Conservar datos y permitir reintento | S-02-E |
| ALT-08 | Error al cargar listado | Mostrar estado no disponible con reintento | S-01-E |
| ALT-09 | Usuario sin permiso | Ocultar o deshabilitar acción y explicar acceso | Estado global |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Ruta/presentación | Obligatoria |
|---|---|---|---|---|
| S-01 | Gestión de marcas | Consultar y entrar a crear, editar, desactivar o reactivar | /productos/marcas propuesta | Sí |
| S-01-E | Vacío o error del listado | Diferenciar ausencia de fallo de carga | Variante de S-01 | Sí |
| S-02 | Crear marca | Capturar nombre, descripción, logo y país | Ruta propuesta /productos/marcas/nueva | Sí |
| S-02-E | Error de guardado | Conservar datos y recuperar | Variante de S-02/S-03 | Sí |
| S-03 | Editar marca | Actualizar nombre, descripción, logo y país | Ruta propuesta /productos/marcas/:id/editar | Sí |
| S-04 | Confirmar desactivación | Evitar baja accidental | Diálogo modal | Sí |
| S-04-B | Desactivación bloqueada | Explicar productos activos asociados | Variante de S-04 | Sí |
| S-04-T | Validación sin respuesta | Rechazar por timeout; sin asumir resultado | Variante de S-04 | Sí |
| S-05 | Detalle de marca | Consultar datos, estado y acciones | /productos/marcas/:id propuesta | Sí |

## 8. Mapa de navegación

~~~mermaid
flowchart TD
    A["S-01 Listado"] --> B["S-02 Crear"]
    A --> C["S-03 Editar"]
    A --> D["S-05 Detalle"]
    D --> C
    A --> E["S-04 Desactivar"]
    E --> F["S-04-B Bloqueada"]
    E --> G["S-04-T Timeout"]
    E --> A
    A --> H["Reactivar"]
    H --> A
~~~

## 9. Especificación por pantalla

### S-01 — Gestión de marcas

#### Propósito

Dar acceso a consulta, creación, edición, desactivación y reactivación.

#### Jerarquía de contenido

1. Título Gestión de marcas.
2. Acción Crear marca.
3. Listado de marcas.
4. Estado y productos activos por marca.

#### Regiones y componentes

| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + acción | Gestión de marcas; Crear marca | Acción según permiso |
| Listado | Tabla en escritorio; tarjetas en móvil | Logo, nombre, país, productos, estado | Abre detalle |
| Fila/tarjeta | Acciones contextuales | Ver, Editar, Desactivar/Reactivar | Sin Eliminar |
| Estado | Etiqueta textual | Activo, Inactivo | No depender del color |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Crear | Crear marca | Permiso de creación | Abre S-02 |
| Secundaria | Consultar | Ver | Permiso de consulta | Abre S-05 |
| Secundaria | Modificar | Editar | Permiso de edición | Abre S-03 |
| Destructiva reversible | Desactivar | Desactivar | Activa y permiso | Abre S-04 |
| Reversible | Reactivar | Reactivar | Inactiva y permiso | Reactiva |

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Logo | Marca | Placeholder | Media | Placeholder neutral |
| Nombre | Marca | Texto | Alta | No debe faltar |
| País de origen | Marca | Texto | Baja | Ocultar |
| Productos activos | Catálogo Core | Entero | Media | Mostrar No disponible |
| Estado | Marca | Texto | Alta | Mostrar No disponible |

No agregar búsqueda, filtros, ordenamiento o paginación al prototipo hasta que
la necesidad y reglas estén confirmadas.

#### Navegación y foco

- Foco inicial: título o primera acción.
- El orden recorre Crear, filas y sus acciones.
- Acciones contextuales utilizables por teclado.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-01 | Crear marca | Nombre con unicidad case-insensitive |
| A-02 | Logo | Se representa como placeholder (sin logos reales) |
| A-03 | Productos activos | Dato de Catálogo Core; puede fallar la consulta |
| A-04 | Acciones | No incluir eliminación física |
| A-05 | Estado | Activo/Inactivo expresado con texto |
| A-06 | Canales | Solo las marcas activas aparecen en los filtros |

### S-01-E — Vacío o error de listado

- Vacío: Aún no hay marcas. Acción: Crear primera marca (con permiso). No
  presentar la ausencia como error.
- Error: No pudimos cargar las marcas. Acción: Reintentar.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-07 | Vacío | Ofrece creación solo a usuarios autorizados |
| A-08 | Error | Incluye recuperación sin detalles internos |

### S-02 — Crear marca

#### Propósito

Capturar nombre, descripción, logo y país de origen.

#### Jerarquía de contenido

1. Nombre (obligatorio).
2. Descripción (opcional).
3. Logo (opcional; ≤ 5 MB).
4. País de origen (opcional).
5. Acciones Crear marca y Cancelar.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Datos | Campos | Nombre, descripción, país | Nombre obligatorio |
| Logo | Carga de archivo | Archivo de imagen | Valida tamaño en cliente |
| Acciones | Botones | Crear marca; Cancelar | Guardado condicionado |

#### Formulario y validaciones

| Campo | Tipo | Obligatorio | Validación | Mensaje propuesto |
|---|---|---|---|---|
| Nombre | Texto | Sí | Requerido y único (case-insensitive, activas e inactivas) | Ingresa un nombre para la marca. / Ya existe una marca registrada con ese nombre. |
| Descripción | Texto multilínea | No | Sin regla definida | N/A |
| Logo | Archivo | No | Máximo 5 MB | El logo no debe superar los 5 MB. |
| País de origen | Texto o lista | No | Formato pendiente; Q-03 | N/A |

#### Navegación y foco

- Foco inicial: campo Nombre.
- Foco después de error: primer campo inválido.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-09 | Unicidad | Se valida ignorando mayúsculas/minúsculas |
| A-10 | Logo | Máximo 5 MB; rechazo con motivo |
| A-11 | País de origen | Opcional; formato pendiente |
| A-12 | Estado inicial | La marca se registra Activa |

### S-02-E — Error de guardado

- Conservar los datos del formulario.
- Mensaje accionable y seguro.
- Reintentar sin crear duplicados.

### S-03 — Editar marca

#### Propósito

Actualizar los datos de una marca sin afectar productos ya asociados.

#### Comportamiento

- Nombre: valida unicidad case-insensitive.
- Descripción y país de origen: editables.
- Logo: se reemplaza el anterior; valida 5 MB.
- Al guardar se actualiza `updated_at`.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-13 | Reemplazo de logo | Valida el tamaño del nuevo archivo |
| A-14 | updated_at | Se actualiza con cada modificación |
| A-15 | Productos | Cambiar datos no afecta productos asociados |

### S-04 — Confirmar desactivación

#### Propósito

Evitar una baja accidental y explicar su efecto comercial.

#### Contenido

- Título Desactivar marca.
- Nombre de la marca.
- Mensaje: La marca dejará de mostrarse en los filtros de los canales.
- Indicación: se verificará de forma asíncrona que no tenga productos activos antes de confirmar la baja.
- Acciones Desactivar y Cancelar.

#### Navegación y foco

- Foco contenido dentro del diálogo.
- Escape o Cancelar cierra sin cambios.
- Al confirmar se ejecuta la validación con espera.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-16 | Efecto | Retiro de los filtros de canales |
| A-17 | Validación | Asíncrona con Catálogo; operación correlacionada, sin garantía de timeout HTTP |
| A-18 | Sin eliminación | No existe acción de eliminación física |

### S-04-B — Desactivación bloqueada

- Mensaje: No se puede desactivar la marca.
- Motivo: Tiene productos activos asociados.
- Orientación: Desactiva o reasigna los productos antes de reintentar.
- Sin cambios registrados.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-19 | Bloqueo | Evita productos sin marca válida en los canales |

### S-04-T — Validación sin respuesta

- Mensaje: No pudimos validar los productos asociados.
- Comportamiento: rechazar la desactivación; no asumir “sin productos”.
- Acción: Reintentar.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-20 | Sin confirmación | Si Catálogo no confirma de forma confiable que no hay productos activos, se rechaza la baja; SLA pendiente |

### S-05 — Detalle de marca

#### Jerarquía de contenido

1. Logo o placeholder, nombre y estado.
2. Descripción, país de origen y producto.
3. Acciones Editar, Desactivar/Reactivar y Volver.

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Logo | Marca | Placeholder/image | Media | Placeholder |
| Nombre | Marca | Texto | Alta | Error de integridad |
| Descripción | Marca | Texto | Media | Ocultar |
| País de origen | Marca | Texto | Baja | Ocultar |
| Estado | Marca | Texto | Alta | No disponible |
| Productos activos | Catálogo Core | Entero | Media | No disponible |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Editar | Editar marca | Permiso y estado | Abre S-03 |
| Destructiva reversible | Desactivar | Desactivar | Activa y permiso | Abre S-04 |
| Reversible | Reactivar | Reactivar | Inactiva y permiso | Reactiva |
| Secundaria | Volver | Volver a marcas | Siempre | Abre S-01 |

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-21 | Detalle | Muestra el efecto en canales |
| A-22 | Reactivar | Sin validación adicional documentada |

## 10. Estados de interfaz

| Estado | Aplica | Representación | Acciones | Recuperación |
|---|---|---|---|---|
| Listado cargando | Sí | Skeleton/indicador | Esperar | Reintento si falla |
| Listado vacío | Sí | Mensaje y Crear | Crear con permiso | N/A |
| Listado con datos | Sí | Tabla/tarjetas | Ver, editar, desactivar/reactivar | N/A |
| Formulario inicial | Sí | Campos vacíos | Completar/cancelar | N/A |
| Nombre duplicado | Sí | Error en campo | Corregir | Corregir |
| Logo > 5 MB | Sí | Rechazo con motivo | Reemplazar | Corregir |
| Validación en curso | Sí | Espera en el diálogo | Esperar | Timeout |
| Baja bloqueada | Sí | S-04-B | Volver | Resolver productos |
| Validación sin respuesta | Sí | S-04-T | Reintentar | Nueva consulta |
| Guardando | Sí | Acción deshabilitada | Evitar duplicado | Esperar |
| Guardado exitoso | Sí | Confirmación + listado | Continuar | N/A |
| Error de guardado | Sí | Mensaje sin perder datos | Reintentar | Repetir envío |
| Marca activa | Sí | Estado Activo | Editar/desactivar | N/A |
| Marca inactiva | Sí | Estado Inactivo | Editar/reactivar | Reactivar |
| Sin permisos | Sí | Explicación segura | Volver | Solicitar acceso |
| Sesión expirada | Sí | Aviso/autenticación | Iniciar sesión | Recuperar contexto |

### Reglas para datos remotos

- Consultar marcas vigentes al cargar y refrescar tras guardar.
- La comprobación de productos activos es asíncrona y correlacionada; rechazar la baja si no se obtiene confirmación confiable, sin fijar un timeout HTTP.
- No aplicar guardado optimista.
- Distinguir ausencia de marcas de fallo de carga.

## 11. Comportamiento responsivo

DESIGN.md define 12 columnas en escritorio y 4 en móvil. El prototipo demuestra
adaptación sin fijar breakpoints definitivos.

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Completa | Condensada | Patrón global móvil |
| Listado | Tabla | Tabla reducida | Tarjetas |
| Formulario | Campos en columnas | Regiones apiladas | Una columna |
| Carga de logo | Previsualización | Ajuste | Bloque apilado |
| Modal de desactivación | Centrado | Margen lateral | Casi completo |
| Anotaciones | Panel lateral | Debajo | Lista/colapsable |
| Contenido omitido | Ninguno | Ninguno | Ninguno; reorganizar |

### Condiciones críticas

- Verificar 320 px sin desplazamiento horizontal.
- El nombre largo de marca debe envolver o truncarse con acceso al valor.
- El selector de archivo debe funcionar con zoom de 200%.

## 12. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Encabezado principal único por pantalla.
- Campos con etiquetas persistentes y errores asociados.
- El estado Activo/Inactivo se expresa con texto e icono.
- El error del logo se comunica como texto.
- Diálogos con foco contenido y retorno al activador.
- Acciones móviles de 44 por 44 px.
- Cambios no dependientes del color.
- Anotaciones excluidas del árbol accesible.

## 13. Tono visual y contenido

Aplicar DESIGN.md como única fuente de representación visual.

### Consideraciones específicas

- Densidad: media.
- Sensación buscada: control de catálogo y prevención de duplicados.
- Elemento dominante en S-01: listado y Crear marca.
- Elemento dominante en S-04: validación y bloqueo.

### Microcopy crítica

| Contexto | Texto propuesto | Observación |
|---|---|---|
| Acción principal | Crear marca | Resultado concreto |
| Unicidad | Ya existe una marca registrada con ese nombre. | Case-insensitive (incluye marcas inactivas) |
| Logo | El logo no debe superar los 5 MB. | CA-08 |
| Baja | La marca dejará de mostrarse en los filtros de los canales. | Efecto comercial |
| Bloqueo | No se puede desactivar porque la marca tiene productos activos. | Motivo accionable |
| Sin confirmación | No pudimos verificar los productos asociados. Inténtalo nuevamente. | No asumir resultado |
| Reactivar | La marca vuelve a los filtros de los canales de venta. | CA-05 |

## 14. Restricciones técnicas relevantes

- Aplicación objetivo: React, TypeScript y Vite.
- Navegación: React Router; rutas exactas pendientes.
- Estado remoto: TanStack Query.
- Formularios: React Hook Form y Zod.
- Contratos HTTP: OpenAPI/Swagger.
- Validación de productos: coordinación EDA con Catálogo; sin respuesta confirmada la baja se rechaza.
- La librería de componentes y estrategia CSS están pendientes.
- El prototipo es HTML/CSS/JS estático.

### Dependencias o contratos

| Tipo | Operación o referencia | Impacto visible |
|---|---|---|
| HTTP | Listar/crear/editar marcas; pendiente | S-01/S-02/S-03 |
| EDA | Comando/resultado correlacionado para validar productos activos; contrato en Docs | S-04/S-04-B/S-04-T |
| HTTP | Endpoint de solo lectura de marcas activas | Canales de venta |
| Almacenamiento | URL del logo (externo) | S-02/S-03 |
| Permiso | Consultar/crear/editar/desactivar/reactivar; código pendiente | Acciones condicionadas |

## 15. Privacidad, seguridad y acciones sensibles

- Autorizar acciones de escritura en servidor.
- Validar unicidad en servidor, no solo en cliente.
- Sanear nombre, descripción y país.
- Confirmar la baja lógica.
- No asumir “sin productos” ante timeout.
- Registro automático de `created_at` y `updated_at`.
- El documento no exige reautenticación.

## 16. Criterios de aceptación del wireframe

- [ ] Permite consultar, crear, editar, desactivar y reactivar marcas.
- [ ] El nombre es único ignorando mayúsculas/minúsculas.
- [ ] Descripción y país de origen son opcionales.
- [ ] El logo es opcional y su límite es 5 MB.
- [ ] Rechaza un logo mayor a 5 MB con motivo.
- [ ] La baja lógica comprueba productos activos por coordinación EDA antes de confirmar.
- [ ] Ante ausencia de confirmación de dependencias, rechaza la baja y conserva la marca activa.
- [ ] La reactivación verifica nombre globalmente único y conserva la identidad de la marca.
- [ ] No existe eliminación física.
- [ ] Representa el endpoint de solo lectura para canales.
- [ ] Incluye carga, vacío, error, permisos y sesión.
- [ ] Funciona con teclado y no depende del color.
- [ ] Funciona con HTML/CSS/JS estáticos.
- [ ] Es consistente con DESIGN.md.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01 | S-02 con logo y país opcionales |
| CA-02 | S-02/S-03 y ALT-02 (unidad case-insensitive) |
| CA-03 | S-03, A-13/A-14 |
| CA-04 | Flujo D, S-04/S-04-B |
| CA-05 | Flujo E y acción Reactivar |
| CA-06 | A-04 y A-18 |
| CA-07 | Sección de dependencias, endpoint de solo lectura |
| CA-08 | S-02/S-03, A-10 y microcopy |

## 17. Supuestos

| ID | Supuesto | Motivo | Impacto si es incorrecto | Validar |
|---|---|---|---|---|
| SUP-01 | WF-011 es el ID asignado en INDEX.md | Asignación de la rama `lopez` | Renombrar archivo/referencias | Sí |
| SUP-02 | La ruta será /productos/marcas | No se entregó mapa de navegación | Cambiar rutas/entrada | Sí |
| SUP-03 | Escritorio es el dispositivo principal | Gestión administrativa | Cambiar prioridad responsive | Sí |
| SUP-04 | El endpoint de marcas activas no requiere UI de administración | Alcance de la spec | Añadir vista si aplica | Sí |

## 18. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea wireframe | Estado |
|---|---|---|---|---|
| Q-01 | Resuelto: logo PNG, JPG/JPEG o WebP, máximo 5 MB; SVG no admitido. | Specs/HU definitivos | No | Resuelta |
| Q-02 | Resuelto: país opcional identificado por ISO 3166-1; no texto libre no normalizado. | Specs/HU definitivos | No | Resuelta |
| Q-03 | ¿El país de origen se muestra en el listado o solo en detalle? | Producto/UX | No | Abierta |
| Q-04 | Resuelto: reactivación conserva ID y debe respetar unicidad global del nombre, incluso frente a marcas inactivas. | Specs/HU definitivos | No | Resuelta |
| Q-05 | ¿Debe advertirse al salir con cambios sin guardar? | Producto/UX | No | Abierta |
| Q-06 | ¿Existe búsqueda, filtros u orden en el listado? | Producto | No para flujo base | Abierta |
| D-01 | Selección de librería UI y estrategia CSS | Frontend | No para wireframe; sí para implementación | Pendiente |

### Alineación definitiva de Marcas

- Nombre normalizado es **único globalmente**, incluso en marcas inactivas. Al crear, renombrar o reactivar una marca se comprueba unicidad; la reactivación no puede crear un segundo nombre equivalente.
- Baja lógica: mostrar **Solicitud recibida → Verificando productos activos → Desactivación confirmada / Rechazada**. La comprobación usa coordinación EDA y barrera de escrituras correlacionada en Catálogo; si falla la verificación o existen productos activos, la marca permanece activa. El SLA de la coordinación no está fijado, no mostrar un «timeout HTTP de 15 s» como requisito vigente.
- Logo: PNG/JPG/JPEG/WebP hasta 5 MB; país, cuando se ingrese, es ISO 3166-1; no aceptar SVG. El almacenamiento físico del logo está fuera del dominio de Marcas y el formulario maneja el resultado/URL del servicio de almacenamiento que se acuerde.

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
- [x] Los criterios CA-01 a CA-08 están cubiertos.
- [x] La unicidad global, logos de hasta 5 MB y el flujo EDA de baja segura están documentados.
- [x] La baja lógica y reactivación están documentadas.
- [x] Los supuestos y preguntas están registrados.
- [x] El formato HTML está definido.
- [ ] Confirmar el ID WF-011 contra INDEX.md.
- [ ] Revisar únicamente las preguntas no resueltas en la sección 18 antes de implementar.
- [ ] Confirmar rutas y permisos antes de implementar el frontend.

---
