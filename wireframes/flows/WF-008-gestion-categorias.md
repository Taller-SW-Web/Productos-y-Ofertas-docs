# WF-008 — Gestión de categorías y subcategorías

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la gestión de categorías
y subcategorías descrita en este archivo.

Antes de diseñar:

1. Consulta ../../specs/spec_gestion_categorias.md.
2. Consulta ../../hu/hu_gestion_categorias.md.
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
- La jerarquía se limita a dos niveles: raíz y subcategoría.
- Una categoría no puede asignarse como su propia categoría padre.
- El nombre de categoría NO es único; no se debe rechazar por duplicidad de
  nombre.
- `categoria_padre_id` SIEMPRE es editable al actualizar una categoría.
- Al cambiar el padre, valida que el nuevo padre esté activo y que no se
  superen los dos niveles.
- La desactivación es baja lógica y solo se completa si la validación síncrona
  confirma que no hay productos activos asociados.
- La reactivación exige que el padre (si lo hay) esté activo.
- NUNCA muestres eliminación física de una categoría.
- No incluyas controles de SEO/slugs ni de asociación de características:
  corresponden a WF-012 y WF-010.
- No elijas una librería de UI ni una estrategia CSS.
- Usa datos ficticios y no consumas APIs reales.
- Numera las anotaciones como A-01, A-02, A-03, etc.
- Mantén visible la relación jerárquica padre → subcategorías en todo el flujo.

### Formato del entregable

Genera un prototipo navegable con HTML, CSS y JavaScript estáticos:

- El punto de entrada debe ser index.html.
- Debe funcionar sin proceso de compilación.
- Usa rutas y recursos relativos.
- No uses React ni dependencias del frontend productivo.
- No requieras conexión a servicios externos.
- Simula únicamente las interacciones necesarias para validar el flujo.
- Incluye vistas de escritorio, tablet y móvil o controles para inspeccionarlas.
- Incluye las anotaciones visibles definidas en cada pantalla.
- Aplica el estilo monocromático y de baja fidelidad de DESIGN.md.

### Entregables esperados

1. Árbol de categorías con dos niveles y estados.
2. Creación de categoría con padre opcional.
3. Creación de subcategoría preseleccionando el padre.
4. Edición completa, incluida la reasignación de `categoria_padre_id`.
5. Confirmación de desactivación (baja lógica).
6. Variante de desactivación bloqueada por productos activos.
7. Reactivación con validación del estado del padre.
8. Estados de carga, vacío, error, permisos y conflicto.
9. Navegación funcional entre los estados simulados.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-008 |
| Nombre del flujo | Gestión de categorías y subcategorías |
| Versión | 0.1 |
| Estado | Borrador |
| Responsable | Leonardo Lopez |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-17 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | spec_gestion_categorias.md, secciones 1–9 | Alcance, requisitos y reglas de baja/reactivación |
| Historia de usuario | hu_gestion_categorias.md, CA-01 a CA-09 | Criterios de aceptación y escenarios |
| Diseño | DESIGN.md | Lenguaje visual monocromático de baja fidelidad |
| Backlog | No proporcionado | No se asignan IDs de backlog |

### Funcionalidades incluidas

- Consultar el árbol jerárquico de categorías.
- Crear una categoría con nombre, descripción, imagen, orden y padre opcional.
- Crear una subcategoría vinculada a una raíz.
- Editar nombre, descripción, imagen, orden y `categoria_padre_id`.
- Validar los dos niveles máximos y la referencia circular.
- Desactivar (baja lógica) con validación síncrona de productos activos.
- Reactivar una categoría exigiendo padre activo.
- Exponer el árbol jerárquico completo para canales externos.

### Fuera de alcance

- Eliminación física de categorías: prohibida por especificación.
- Configuración de slugs y metadatos SEO: corresponde a WF-012.
- Asociación de características a categorías: corresponde a WF-010.
- Gestión de productos dentro de la categoría: catálogo Core / WF-003.
- Gestión de marcas: corresponde a WF-011.

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Gestor comercial responsable de la taxonomía del catálogo |
| Rol en el sistema | Gestor comercial autenticado |
| Nivel técnico | No especificado; diseñar para nivel operativo básico/intermedio |
| Contexto de uso | Creación y mantenimiento periódico de la estructura de navegación |
| Necesidad principal | Mantener una jerarquía de dos niveles sin productos huérfanos |
| Permisos relevantes | Consultar, crear, editar, desactivar y reactivar categorías; códigos exactos pendientes |
| Dispositivo principal | Escritorio como hipótesis; consulta debe adaptarse a tablet/móvil |

## 4. Objetivo del flujo

El gestor comercial debe poder crear, consultar, reordenar y mantener la
jerarquía de categorías (máximo dos niveles), reasignar categorías de padre,
y aplicar bajas lógicas y reactivaciones sin dejar productos huérfanos en los
canales de venta.

### Resultado exitoso

La categoría queda registrada o actualizada con su padre correcto dentro de
los dos niveles permitidos. La baja lógica se confirma solo cuando no existen
productos activos asociados. La reactivación se completa solo con un padre
activo. El árbol refleja los cambios y permanece disponible para los canales.

### Indicadores de finalización

- Creación: mensaje Categoría creada y el nodo aparece en el árbol.
- Edición: mensaje Cambios guardados con la nueva ubicación en el árbol.
- Reasignación de padre: el nodo se mueve respetando los dos niveles y la
  validación del nuevo padre.
- Desactivación: estado inactivo confirmado.
- Reactivación: estado activo confirmado.

El patrón exacto de notificación debe alinearse con el sistema global.

## 5. Precondiciones y disparador

### Precondiciones

- El usuario tiene una sesión válida.
- El usuario posee el permiso requerido para la acción.
- Existen categorías raíz para usar como padre al crear una subcategoría.

### Puntos de entrada

- Ruta propuesta del listado: /productos/categorias.
- Entrada propuesta: opción Categorías dentro del módulo Productos y ofertas.
- Crear raíz: acción Crear categoría desde el árbol.
- Crear subcategoría: acción Añadir subcategoría sobre una categoría raíz.
- Consultar/editar: acción sobre una fila o tarjeta del árbol.
- Desactivar/reactivar: acciones contextuales sobre un nodo activo/inactivo.

Las rutas y ubicación exactas son propuestas de wireframe y deben confirmarse.

### Salidas del flujo

| Resultado | Destino o comportamiento |
|---|---|
| Creación exitosa | S-01 con el nodo creado |
| Edición exitosa | S-01 con el nodo actualizado |
| Cancelación sin cambios | Regresa a S-01 |
| Cancelación con cambios | Comportamiento pendiente; Q-06 |
| Desactivación exitosa | S-01 con el nodo inactivo |
| Desactivación bloqueada | S-04-B con explicación de productos activos |
| Reactivación exitosa | S-01 con el nodo activo |
| Reactivación con padre inactivo | S-05-R explicando que debe reactivarse el padre |
| Error recuperable | Permanece en la pantalla y conserva los datos |
| Sin permisos | Bloquea la acción y ofrece retorno seguro |

## 6. Secuencia principal

### Flujo A — Consultar el árbol

1. El gestor entra a Gestión de categorías.
2. El sistema carga el árbol jerárquico con raíces y subcategorías.
3. El árbol muestra nombre, descripción, orden, imagen, estado y cantidad de
   productos cuando el contrato lo permita.
4. El gestor abre el detalle de una categoría.
5. El sistema muestra datos, padre, estado y acciones disponibles.

### Flujo B — Crear categoría raíz

1. Desde S-01, el gestor selecciona Crear categoría.
2. En S-02 ingresa nombre (obligatorio) y descripción, imagen y orden
   (opcionales).
3. Deja el campo Categoría padre vacío.
4. El sistema valida los datos y crea la raíz.
5. Se muestra S-01 con el nodo creado.

### Flujo C — Crear subcategoría

1. Desde S-01, el gestor selecciona Añadir subcategoría sobre una raíz.
2. En S-02 el campo Categoría padre llega preseleccionado con esa raíz.
3. El gestor completa nombre, descripción, imagen y orden.
4. El sistema valida que el padre esté activo y que no se excedan los dos
   niveles.
5. Se muestra S-01 con la subcategoría bajo su raíz.

### Flujo D — Editar y reasignar padre

1. El gestor abre una categoría desde S-01.
2. Selecciona Editar.
3. En S-03 el sistema carga todos los campos, incluido `categoria_padre_id`.
4. El gestor modifica nombre, descripción, imagen, orden y/o categoría padre.
5. El sistema valida que el nuevo padre esté activo, que no sea la misma
   categoría y que no se superen los dos niveles.
6. El gestor guarda.
7. El árbol muestra la nueva ubicación sin afectar productos ya asociados.

### Flujo E — Desactivar (baja lógica)

1. El gestor selecciona Desactivar desde S-01.
2. S-04 explica que la categoría dejará de mostrarse en los canales.
3. El gestor confirma.
4. El sistema realiza la validación síncrona de productos activos.
5. Si no hay productos activos, la categoría pasa a inactiva y S-01 lo refleja.
6. Si hay productos activos, S-04-B explica que la baja fue bloqueada.

### Flujo F — Reactivar

1. El gestor selecciona Reactivar sobre una categoría inactiva.
2. El sistema valida que su padre (si lo tiene) esté activo.
3. Si es válido, reactiva y S-01 refleja el estado activo.
4. Si el padre está inactivo, S-05-R solicita reactivar primero el padre.

### Flujos alternativos

| ID | Condición | Comportamiento esperado | Retorno |
|---|---|---|---|
| ALT-01 | Nombre vacío | Error en el campo y guardado bloqueado | S-02/S-03 |
| ALT-02 | Seleccionar la misma categoría como su padre | Impedir selección y explicar referencia circular | S-03 |
| ALT-03 | Padre inactivo al crear o reasignar | Error y bloqueo del guardado | S-02/S-03 |
| ALT-04 | Asignar un padre a una categoría que ya es raíz de subcategorías | Rechazar para no exceder los dos niveles | S-03 |
| ALT-05 | Intentar añadir una subcategoría a una subcategoría | Bloquear la acción: no hay tercer nivel | S-01 |
| ALT-06 | Desactivar con productos activos | Bloquear la baja y explicar el requisito | S-04-B |
| ALT-07 | Timeout en la validación síncrona de productos | No asumir resultado; bloquear baja y permitir reintento | S-04-E |
| ALT-08 | Reactivar con padre inactivo | Error explicando el orden de reactivación | S-05-R |
| ALT-09 | Error al cargar el árbol | Mostrar estado no disponible con reintento | S-01-E |
| ALT-10 | Usuario sin permiso | Ocultar o deshabilitar acción y explicar acceso insuficiente | Estado global |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Ruta/presentación | Obligatoria |
|---|---|---|---|---|
| S-01 | Gestión de categorías | Consultar el árbol y entrar a crear, editar, desactivar o reactivar | /productos/categorias propuesta | Sí |
| S-01-E | Vacío o error del árbol | Diferenciar ausencia de categorías de fallo de carga | Variante de S-01 | Sí |
| S-02 | Crear categoría | Capturar nombre, descripción, imagen, orden y padre opcional | Ruta propuesta /productos/categorias/nueva | Sí |
| S-03 | Editar categoría | Actualizar todos los campos, incluido `categoria_padre_id` | Ruta propuesta /productos/categorias/:id/editar | Sí |
| S-04 | Confirmar desactivación | Evitar bajas accidentales y explicar el efecto | Diálogo modal | Sí |
| S-04-B | Desactivación bloqueada | Explicar que existen productos activos asociados | Variante de S-04 | Sí |
| S-04-E | Validación indisponible | No asumir resultado ante timeout en la validación síncrona | Variante de S-04 | Sí |
| S-05 | Detalle de categoría | Consultar datos, padre, estado y acciones | /productos/categorias/:id propuesta | Sí |
| S-05-R | Reactivación con padre inactivo | Explicar que primero debe activarse el padre | Variante de S-05 | Sí |

## 8. Mapa de navegación

~~~mermaid
flowchart TD
    A["S-01 Árbol"] --> B["S-02 Crear"]
    A --> C["S-03 Editar"]
    C --> A
    A --> D["S-05 Detalle"]
    D --> C
    A --> E["S-04 Desactivar"]
    E --> F["S-04-B Bloqueada"]
    E --> A
    D --> G["S-05-R Reactivar"]
    G --> A
~~~

## 9. Especificación por pantalla

### S-01 — Gestión de categorías

#### Propósito

Dar acceso a consulta, creación, edición, desactivación y reactivación según
permisos, manteniendo visible la jerarquía de dos niveles.

#### Jerarquía de contenido

1. Título Gestión de categorías.
2. Acción Crear categoría.
3. Árbol de raíces y subcategorías.
4. Estado de cada nodo y acciones contextuales.

#### Regiones y componentes

| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + acción | Gestión de categorías; Crear categoría | La acción depende de permiso |
| Árbol | Tabla indentada en escritorio; tarjetas adaptables | Raíz con sus subcategorías; nombre, orden, estado | Cada elemento abre detalle |
| Nodo raíz | Fila/tarjeta | Nombre, descripción, imagen, orden, estado | Acciones: Ver, Editar, Desactivar, Añadir subcategoría |
| Nodo subcategoría | Fila/tarjeta anidada | Nombre, descripción, imagen, orden, estado | Acciones: Ver, Editar, Desactivar |
| Estado | Etiqueta textual | Activo, Inactivo | No depender del color |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Crear raíz | Crear categoría | Permiso de creación | Abre S-02 sin padre |
| Primaria | Crear subcategoría | Añadir subcategoría | Nodo raíz activo y permiso | Abre S-02 con padre preseleccionado |
| Secundaria | Consultar | Ver | Permiso de consulta | Abre S-05 |
| Secundaria | Modificar | Editar | Permiso de edición | Abre S-03 |
| Destructiva reversible | Desactivar | Desactivar | Nodo activo y permiso | Abre S-04 |
| Reversible | Reactivar | Reactivar | Nodo inactivo y permiso | Valida padre y reactiva |

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Nombre | Categoría | Texto | Alta | No debe faltar |
| Descripción | Categoría | Texto | Media | Ocultar |
| Imagen | Categoría | Placeholder | Baja | Ocultar |
| Orden | Categoría | Entero | Media | Mostrar no disponible |
| Estado | Categoría | Texto | Alta | Mostrar No disponible |
| Nivel | Derivado del árbol | Raíz / Subcategoría | Media | Ocultar si el indizado lo expresa |

No agregar búsqueda, filtros, ordenamiento o paginación al prototipo hasta que
la necesidad y reglas estén confirmadas.

#### Navegación y foco

- Foco inicial: título o primera acción según convención global.
- El orden recorre Crear categoría, nodos raíz, sus subcategorías y acciones.
- Las acciones contextuales deben ser utilizables por teclado.
- El foco no debe saltar al actualizar el árbol.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-01 | Crear categoría | Crea una raíz sin padre |
| A-02 | Añadir subcategoría | Disponible solo sobre raíces activas |
| A-03 | Jerarquía | Máximo dos niveles: raíz y subcategoría |
| A-04 | Nombre | No se valida unicidad: puede repetirse en distintas ramas |
| A-05 | Estado | Activo/Inactivo expresado con texto |
| A-06 | Acciones | No incluir eliminación permanente ni controles SEO/características |

### S-01-E — Vacío o error de árbol

#### Estado vacío

- Mensaje: Aún no hay categorías.
- Acción: Crear primera categoría, si el usuario tiene permiso.
- No presentar la ausencia de datos como error.

#### Error de carga

- Mensaje: No pudimos cargar las categorías.
- Acción: Reintentar.
- No mostrar datos obsoletos como vigentes sin identificarlos.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-07 | Estado vacío | Ofrece creación solo a usuarios autorizados |
| A-08 | Error | Incluye recuperación y no revela detalles internos |

### S-02 — Crear categoría

#### Propósito

Capturar los datos de una categoría nueva, con padre opcional.

#### Jerarquía de contenido

1. Nombre (obligatorio).
2. Descripción, imagen y orden (opcionales).
3. Categoría padre (opcional).
4. Acciones Crear categoría y Cancelar.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Datos generales | Campos | Nombre, descripción, imagen, orden | Nombre obligatorio |
| Jerarquía | Selector | Categoría padre (opcional) | Solo raíces activas elegibles |
| Acciones | Botones | Crear categoría; Cancelar | Guardado condicionado |

#### Formulario y validaciones

| Campo | Tipo | Obligatorio | Validación | Mensaje propuesto |
|---|---|---|---|---|
| Nombre | Texto | Sí | Contenido requerido; sin unicidad | Ingresa un nombre para la categoría. |
| Descripción | Texto multilínea | No | Sin regla definida | N/A |
| Imagen | Carga de archivo | No | Formato/tamaño pendientes; Q-04 | N/A |
| Orden | Entero | No | Valores y obligatoriedad pendientes; Q-03 | N/A |
| Categoría padre | Selector | No | Raíz activa; respetar dos niveles | Selecciona una raíz activa. |

#### Navegación y foco

- Foco inicial: campo Nombre.
- Foco después de error: primer campo inválido o resumen.
- El selector de padre solo lista categorías raíz activas que no excedan el
  límite de niveles.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-09 | Nombre | Obligatorio y no único |
| A-10 | Categoría padre | Vacío crea una raíz |
| A-11 | Padre | Solo raíces activas; sin tercer nivel |
| A-12 | Guardar | Bloqueado si el nombre está vacío o el padre es inválido |

### S-03 — Editar categoría

#### Propósito

Actualizar todos los campos editables, incluido `categoria_padre_id`, y
reubicar la categoría en el árbol respetando las reglas.

#### Jerarquía de contenido

1. Estados y campos generales (nombre, descripción, imagen, orden).
2. Categoría padre editable.
3. Validaciones de niveles y estado del padre.
4. Acciones Guardar cambios y Cancelar.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Datos generales | Campos | Nombre, descripción, imagen, orden | Igual que creación |
| Jerarquía | Selector | Categoría padre editable | Incluye opción Sin padre |
| Estado | Selector de estado | Activo/Inactivo según diseño de detalle | No editar estado aquí salvo requerimiento |
| Acciones | Botones | Guardar cambios; Cancelar | Validaciones bloqueantes |

#### Validaciones de jerarquía

- El nuevo padre no puede ser la propia categoría.
- El nuevo padre debe estar activo.
- El nuevo padre no debe generar más de dos niveles.
- Los productos ya asociados no se ven afectados por el cambio de padre.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-13 | Categoría padre | Campo siempre editable (CA-04) |
| A-14 | Referencia circular | No permitir asignarse a sí misma |
| A-15 | Nuevo padre | Debe estar activo y respetar dos niveles |
| A-16 | Productos | El cambio de padre no afecta productos ya asociados |

### S-04 — Confirmar desactivación

#### Propósito

Evitar una baja accidental y explicar su efecto comercial.

#### Contenido

- Título Desactivar categoría.
- Nombre de la categoría.
- Mensaje: La categoría dejará de mostrarse en los canales de venta.
- Advertencia: la baja depende de la validación de productos activos.
- Acciones Desactivar y Cancelar.

#### Navegación y foco

- Foco contenido dentro del diálogo.
- Escape o Cancelar cierra sin cambios.
- Al confirmar se ejecuta la validación síncrona con indicador de espera.
- Al cerrar sin confirmar, el foco vuelve al activador.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-17 | Advertencia | Efecto comercial; no se elimina la categoría |
| A-18 | Validación | Se consulta síncronamente si existen productos activos |
| A-19 | No Eliminar | No existe acción de eliminación permanente |

### S-04-B — Desactivación bloqueada

- Mensaje: No se puede desactivar la categoría.
- Motivo: Tiene productos activos asociados.
- Orientación: Desactiva o reasigna los productos antes de reintentar.
- Acciones: Volver (sin cambios).

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-20 | Bloqueo | Evita productos huérfanos en canales de venta |
| A-21 | Retorno | No se registró ningún cambio |

### S-04-E — Validación indisponible

- Mensaje: No pudimos validar los productos asociados.
- Comportamiento: no asumir resultado; reintentar.
- No permitir la baja en este estado.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-22 | Timeout | La baja se bloquea si la validación no responde |

### S-05 — Detalle de categoría

#### Propósito

Consultar el estado, los datos y las acciones de una categoría.

#### Jerarquía de contenido

1. Nombre, nivel y estado.
2. Datos generales (descripción, imagen, orden).
3. Padre y ubicación en el árbol.
4. Acciones Editar, Desactivar/Reactivar y Volver.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título, estado y acciones | Nombre; Raíz/Subcategoría; Activo/Inactivo | Acciones por permiso/estado |
| Datos | Lista de definiciones | Descripción, imagen, orden | Solo lectura |
| Jerarquía | Bloque de árbol | Padre y posición | Navega al padre si aplica |
| Acciones | Botones | Editar; Desactivar/Reactivar; Volver | Según estado y permiso |

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Nombre | Categoría | Texto | Alta | Error de integridad |
| Nivel | Derivado | Raíz / Subcategoría | Media | No disponible |
| Estado | Categoría | Texto | Alta | No disponible |
| Descripción | Categoría | Texto | Media | Ocultar |
| Imagen | Categoría | Placeholder | Baja | Ocultar |
| Orden | Categoría | Entero | Media | No disponible |
| Padre | Categoría | Enlace al nodo | Media | “Categoría raíz” |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Editar | Editar categoría | Permiso y estado | Abre S-03 |
| Destructiva reversible | Desactivar | Desactivar | Activa y permiso | Abre S-04 |
| Reversible | Reactivar | Reactivar | Inactiva y permiso | Valida padre y reactiva |
| Secundaria | Volver | Volver a categorías | Siempre | Abre S-01 |

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-23 | Nivel | Determina acciones disponibles (ej. sin subcategoría en tercer nivel) |
| A-24 | Reactivar | Exige padre activo (S-05-R) |
| A-25 | SEO/Asociación | No aparecen aquí; son WF-012 y WF-010 |

### S-05-R — Reactivación con padre inactivo

- Mensaje: La categoría no se puede reactivar.
- Motivo: Su categoría padre está inactiva.
- Orientación: Reactiva primero la categoría padre.
- Acciones: Ir al padre / Volver.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-26 | Orden | La reactivación respeta la cadena de estados |

## 10. Estados de interfaz

| Estado | Aplica | Representación | Acciones | Recuperación |
|---|---|---|---|---|
| Árbol cargando | Sí | Skeleton/indicador | Esperar | Reintento si falla |
| Árbol vacío | Sí | Mensaje y Crear categoría | Crear con permiso | N/A |
| Árbol con datos | Sí | Tabla indentada/tarjetas | Ver, editar, desactivar, reactivar | N/A |
| Formulario inicial | Sí | Campos vacíos | Completar/cancelar | N/A |
| Edición cargando | Sí | Estructura bloqueada | Cancelar según contrato | Reintentar |
| Nombre vacío | Sí | Error y guardado bloqueado | Corregir | Corregir |
| Padre inválido | Sí | Error con motivo (circular, inactivo, niveles) | Corregir | Corregir |
| Guardando | Sí | Acción deshabilitada | Evitar duplicado | Esperar |
| Guardado exitoso | Sí | Confirmación + árbol | Continuar | N/A |
| Error de guardado | Sí | Mensaje sin perder datos | Reintentar | Repetir envío seguro |
| Validación síncrona en curso | Sí | Indicador de espera no bloqueante al árbol | Esperar | Tiempo de espera |
| Baja bloqueada | Sí | S-04-B con productos activos | Volver | Resolver productos |
| Validación indisponible | Sí | S-04-E | Reintentar | Nueva consulta |
| Nodo activo | Sí | Estado Activo | Editar/desactivar | N/A |
| Nodo inactivo | Sí | Estado Inactivo | Editar/reactivar | Reactivar con padre activo |
| Sin permisos | Sí | Explicación segura | Volver | Solicitar acceso fuera del flujo |
| Sesión expirada | Sí | Aviso/autenticación | Iniciar sesión | Recuperar contexto si es posible |

### Reglas para datos remotos

- Consultar el árbol vigente al cargar y refrescarlo después de guardar.
- La validación de productos activos es síncrona y bloqueante; no asumir
  resultado ante timeout.
- No aplicar guardado optimista a creación, edición, baja ni reactivación.
- Distinguir ausencia de categorías de fallo de carga.
- Conservar el formulario ante errores recuperables.

## 11. Comportamiento responsivo

DESIGN.md define 12 columnas en escritorio y 4 en móvil, pero no especifica
tablet ni breakpoints exactos. El prototipo debe demostrar adaptación sin fijar
los breakpoints definitivos.

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Completa | Condensada | Patrón global móvil |
| Árbol | Tabla indentada en dos niveles | Table reducida u ocultar columnas | Tarjetas anidadas |
| Formulario | Campos en columnas relacionadas | Regiones apiladas parcialmente | Una columna |
| Acciones | Agrupadas por prioridad | Ajuste de línea | Ancho disponible; 44 px mínimo |
| Modal de desactivación | Centrado | Margen lateral | Casi completo sin desbordar |
| Anotaciones | Panel lateral | Debajo | Lista debajo/colapsable |
| Contenido omitido | Ninguno | Ninguno | Ninguno; reorganizar |

### Condiciones críticas

- Verificar 320 px sin desplazamiento horizontal de toda la página.
- La indentación del segundo nivel debe mantenerse legible en móvil.
- El selector de padre y formulario deben funcionar con zoom de 200%.

## 12. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Cada pantalla tiene un encabezado principal único.
- Campos con etiquetas persistentes y errores asociados.
- El estado Activo/Inactivo se expresa con texto e icono.
- El nivel (Raíz/Subcategoría) se comunica textualmente.
- Las filas del árbol funcionan por teclado.
- Los diálogos contienen el foco y lo devuelven al activador.
- Las acciones móviles respetan 44 por 44 px según DESIGN.md.
- Los cambios no dependen exclusivamente del color.
- Las anotaciones del prototipo se excluyen del árbol accesible de la interfaz.

## 13. Tono visual y contenido

Aplicar DESIGN.md como única fuente de representación visual.

### Consideraciones específicas

- Densidad: media; el árbol concentra la información.
- Sensación buscada: orden, control estructural y prevención de errores.
- Elemento dominante en S-01: árbol y Crear categoría.
- Elemento dominante en S-03: selector de padre y validaciones.
- Los detalles técnicos de Catálogo Core, Kardex, Saga y ACID no se exponen
  como lenguaje de usuario.

### Microcopy crítica

| Contexto | Texto propuesto | Observación |
|---|---|---|
| Acción principal | Crear categoría | Resultado concreto |
| Subcategoría | Añadir subcategoría | Contextual sobre una raíz |
| Nombre | Ingresa un nombre para la categoría. | Obligatorio, no único |
| Referencia circular | Una categoría no puede ser su propia categoría padre. | Explica el bloqueo |
| Padre inactivo | El padre debe estar activo para asignarlo. | Regla de jerarquía |
| Niveles | La jerarquía tiene máximo dos niveles. | Límite estructural |
| Baja bloqueada | No se puede desactivar porque la categoría tiene productos activos. | Motivo accionable |
| Reactivación | Reactiva primero la categoría padre. | Orden requerido |
| Error técnico | No pudimos cargar las categorías. Inténtalo nuevamente. | Recuperación |

## 14. Restricciones técnicas relevantes

- Aplicación objetivo: React, TypeScript y Vite.
- Navegación productiva: React Router; rutas exactas pendientes.
- Estado remoto: TanStack Query para árbol, detalle, guardado y estados.
- Estado local: Zustand únicamente si el árbol debe compartirse entre rutas.
- Formularios: React Hook Form y Zod.
- Contratos HTTP: OpenAPI/Swagger.
- La librería de componentes y estrategia CSS están pendientes.
- El prototipo es HTML/CSS/JS estático y no prescribe la implementación.

### Dependencias o contratos

| Tipo | Operación o referencia | Impacto visible |
|---|---|---|
| HTTP | Obtener árbol de categorías; método/ruta pendientes | Alimenta S-01 |
| HTTP | Obtener detalle; método/ruta pendientes | Alimenta S-05 |
| HTTP | Crear categoría; método/ruta pendientes | Actualiza S-01 |
| HTTP | Editar categoría (con `categoria_padre_id`); pendiente | Actualiza S-01 |
| HTTP | Desactivar/reactivar; método/ruta pendientes | Actualiza S-01 |
| Síncrono | Validar productos activos con Catálogo Core | Bloquea la baja |
| Permiso | Consultar categorías; código pendiente | Acceso a S-01/S-05 |
| Permiso | Crear/editar/desactivar/reactivar; código pendiente | Acciones del árbol |

## 15. Privacidad, seguridad y acciones sensibles

- Autorizar cada acción de escritura en servidor.
- No confiar solo en la visibilidad de controles del frontend.
- Sanear nombre, descripción y textos mostrados.
- No exponer stack traces, nombres de servicios ni tablas técnicas.
- Confirmar la baja lógica.
- Validar en servidor la referencia circular, el estado del padre y los niveles.
- No asumir “sin productos” ante un timeout de la validación síncrona.
- El documento no exige reautenticación para estas acciones.

## 16. Criterios de aceptación del wireframe

- [ ] Solo usuarios autorizados ven o ejecutan cada acción.
- [ ] Permite consultar, crear, editar, desactivar y reactivar categorías.
- [ ] La jerarquía se limita a dos niveles.
- [ ] El nombre no se rechaza por duplicidad.
- [ ] `categoria_padre_id` es editable al actualizar.
- [ ] Bloquea asignarse a sí misma como padre.
- [ ] Valida el estado activo del nuevo padre.
- [ ] La baja lógica se confirma solo sin productos activos.
- [ ] La reactivación exige padre activo.
- [ ] No existe eliminación física.
- [ ] Representa el árbol completo para canales.
- [ ] No incluye controles SEO, de características ni de marcas.
- [ ] Incluye carga, vacío, error, conflicto, permisos y sesión.
- [ ] Funciona con teclado y no depende del color.
- [ ] El prototipo funciona con HTML/CSS/JS estáticos.
- [ ] No elige una librería UI no aprobada.
- [ ] Es consistente con DESIGN.md.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01 | S-02, campo padre opcional |
| CA-02 | S-01/S-03, A-03, ALT-05 |
| CA-03 | S-03, A-14, ALT-02 |
| CA-04 | S-03, A-13 |
| CA-05 | S-03, A-15, ALT-03/ALT-04 |
| CA-06 | Flujo E, S-04/S-04-B, A-18/A-20 |
| CA-07 | Flujo F, S-05-R, A-26 |
| CA-08 | A-19, acciones sin Eliminar |
| CA-09 | Flujo A, árbol completo |

## 17. Supuestos

| ID | Supuesto | Motivo | Impacto si es incorrecto | Validar |
|---|---|---|---|---|
| SUP-01 | WF-008 es el ID asignado en INDEX.md | Asignación de la rama `lopez` | Renombrar archivo/referencias | Sí |
| SUP-02 | La ruta será /productos/categorias | No se entregó mapa de navegación | Cambiar rutas/entrada | Sí |
| SUP-03 | Escritorio es el dispositivo principal | Configuración estructural | Cambiar prioridad responsive | Sí |
| SUP-04 | El árbol externo es solo lectura y no requiere UI de administración | Requisito 9 | Añadir vista de exportación si aplica | Sí |
| SUP-05 | La imagen de categoría se muestra con placeholder | DESIGN.md | Ajustar representación | Sí |

## 18. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea wireframe | Estado |
|---|---|---|---|---|
| Q-01 | ¿Desactivar una raíz inactiva automáticamente a sus subcategorías? | Producto | Sí para estados del árbol | Abierta |
| Q-02 | ¿Reactivar una raíz reactiva a sus subcategorías? | Producto | Sí para estados del árbol | Abierta |
| Q-03 | ¿El orden es obligatorio o solo de presentación y qué valores admite? | Producto | No para flujo base | Abierta |
| Q-04 | ¿Formato y tamaño máximo de la imagen de categoría? | Producto | No para wireframe | Abierta |
| Q-05 | ¿Se permite reasignar una raíz a un padre (dejar de ser raíz) y viceversa? | Producto | Sí para S-03 | Abierta |
| Q-06 | ¿Debe advertirse al salir del formulario con cambios sin guardar? | Producto/UX | No | Abierta |
| Q-07 | ¿El árbol público incluye solo activas o el árbol completo? | Producto | No para administración | Abierta |
| Q-08 | ¿La validación síncrona de productos activos tiene timeout definido? | Backend | Sí para S-04-E | Abierta |
| Q-09 | ¿Existe búsqueda, filtros, orden o paginación del árbol? | Producto | No para flujo base | Abierta |
| D-01 | Selección de librería UI y estrategia CSS | Frontend | No para wireframe; sí para implementación | Pendiente |

## 19. Registro de revisiones

| Versión | Fecha | Autor | Cambio | Aprobado por |
|---|---|---|---|---|
| 0.1 | 2026-09-17 | Asistente | Borrador inicial basado en spec, HU, template y DESIGN.md | Pendiente |

---

## Lista de control antes de generar el HTML

- [x] Las fuentes funcionales están identificadas.
- [x] El alcance y fuera de alcance están claros.
- [x] Las pantallas y variantes están inventariadas.
- [x] Los criterios CA-01 a CA-09 están cubiertos.
- [x] Las reglas de jerarquía, baja y reactivación están documentadas.
- [x] El SEO y la asociación quedaron separados a WF-012/WF-010.
- [x] Los supuestos y preguntas están registrados.
- [x] El formato HTML está definido.
- [ ] Confirmar el ID WF-008 contra INDEX.md.
- [ ] Resolver Q-01, Q-02, Q-05 y Q-08 antes del diseño definitivo.
- [ ] Confirmar rutas y permisos antes de implementar el frontend.