# WF-010 — Asociación entre categorías y características

> **Fuente normativa de esta revisión:** `specs_consolidado_final.md` y `hu_consolidado_final.md` (18-09-2026). Los nombres/eventos de Ventas y Postventa son contratos **provisionales no homologados**; el prototipo no debe simular pagos realizados ni confirmaciones externas como si estuvieran implementadas. Las anotaciones, supuestos, preguntas y referencias técnicas permanecen en este documento y no se muestran como elementos de la interfaz simulada.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la asociación
Categoría-Característica descrita en este archivo.

Antes de diseñar:

1. Consulta ../../specs/SPEC-010-asociacion-categoria-caracteristica.md.
2. Consulta ../../hu/HU-010-asociacion-categoria-caracteristica.md.
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
- Solo se asocian características y categorías existentes y activas.
- No se permite asociar la misma característica dos veces a la misma categoría.
- No se permiten más de 20 características efectivas (directas + heredadas, sin duplicados) por categoría.
- Las características asociadas a una categoría padre se heredan
  obligatoriamente a sus subcategorías.
- El cambio de opcional a obligatoria no invalida productos preexistentes; se
  exige en la próxima edición/guardado del producto.
- Si una categoría o característica se desactiva, sus asociaciones dejan de
  considerarse activas sin eliminarlas físicamente.
- La desasociación requiere confirmación.
- No elijas una librería de UI ni una estrategia CSS.
- Usa datos ficticios y no consumas APIs reales.
- Numera las anotaciones como A-01, A-02, A-03, etc.
- Distingue en la interfaz el origen de cada característica: Directa o
  Heredada.

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

1. Selección de una categoría con su árbol de dos niveles.
2. Listado de características aplicables: directas y heredadas, con su
   obligatoriedad y origen.
3. Asociación de una característica a la categoría seleccionada marcando su
   condición.
4. Validación de límite de 20 características efectivas (directas + heredadas, sin duplicados).
5. Validación de no duplicado.
6. Cambio de obligatoriedad (opcional ↔ obligatoria) con las reglas resueltas.
7. Desasociación con confirmación.
8. Estados de carga, vacío, error, permisos y conflicto.
9. Navegación funcional entre los estados simulados.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-010 |
| Nombre del flujo | Asociación entre categorías y características |
| Versión | 0.1 |
| Estado | Borrador |
| Responsable | Leonardo Lopez |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-18 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | SPEC-010-asociacion-categoria-caracteristica.md, secciones 1–6 | Requisitos y reglas confirmadas |
| Historia de usuario | HU-010-asociacion-categoria-caracteristica.md, CA-01 a CA-05 | Criterios y escenarios |
| Diseño | DESIGN.md | Lenguaje visual monocromático de baja fidelidad |
| Backlog | No proporcionado | No se asignan IDs de backlog |

### Funcionalidades incluidas

- Seleccionar una categoría (raíz o subcategoría).
- Consultar las características aplicables con obligatoriedad y origen.
- Asociar una característica a una categoría indicando obligatoriedad.
- Cambiar la obligatoriedad de una asociación.
- Desasociar una característica de una categoría.
- Reflejar la herencia automática a subcategorías.
- Aplicar límite de 20 características efectivas (directas + heredadas, sin duplicados) por categoría.
- Aplicar la regla de baja cuando categoría o característica se desactiva.

### Fuera de alcance

- CRUD de categorías: corresponde a WF-008.
- CRUD de características y sus valores: corresponde a WF-009.
- Formulario real de creación/edición de producto: Catálogo Core.
- CRUD de marcas: corresponde a WF-011.
- Eliminación física de asociaciones o entidades.

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Gestor comercial responsable de la taxonomía del catálogo |
| Rol en el sistema | Gestor comercial autenticado |
| Nivel técnico | No especificado; diseñar para nivel operativo básico/intermedio |
| Contexto de uso | Definición de los atributos que aplican a cada categoría |
| Necesidad principal | Construir formularios de producto dinámicos consistentes por categoría |
| Permisos relevantes | Consultar, asociar, cambiar obligatoriedad y desasociar; códigos pendientes |
| Dispositivo principal | Escritorio como hipótesis; consulta adaptada a tablet/móvil |

## 4. Objetivo del flujo

El gestor comercial debe poder definir qué características aplican a cada
categoría, con su condición de obligatoriedad, respetando la herencia a
subcategorías, el límite de 20 características efectivas (directas + heredadas, sin duplicados) y la prohibición de
duplicados, para alimentar al Catálogo Core.

### Resultado exitoso

La asociación queda registrada con su condición. La subcategoría hereda las
características del padre. El límite de 20 características efectivas se respeta. La consulta
por categoría devuelve directas y heredadas con su obligatoriedad.

### Indicadores de finalización

- Asociación: mensaje Característica asociada y actualización del listado.
- Cambio de obligatoriedad: mensaje Condición actualizada.
- Desasociación: mensaje Asociación eliminada.
- El contador de características efectivas se actualiza en cada operación.

El patrón exacto de notificación debe alinearse con el sistema global.

## 5. Precondiciones y disparador

### Precondiciones

- El usuario tiene una sesión válida.
- El usuario posee el permiso requerido.
- Existen categorías y características activas para asociar.

### Puntos de entrada

- Ruta propuesta: /productos/caracteristicas/asociaciones.
- Entrada propuesta: opción Asociaciones dentro del módulo de características.
- Seleccionar categoría: navegador de árbol dentro de S-01.
- Asociar: acción Asociar característica.
- Consultar: selección de categoría muestra su lista aplicable.

Las rutas y ubicación exactas son propuestas de wireframe y deben confirmarse.

### Salidas del flujo

| Resultado | Destino o comportamiento |
|---|---|
| Asociación exitosa | S-01 con la característica en la lista |
| Cambio de obligatoriedad | S-01 con la condición actualizada |
| Desasociación exitosa | S-01 con la lista recalculada |
| Desasociación cancelada | S-01 sin cambios |
| Error recuperable | Permanece en la pantalla y conserva los datos |
| Sin permisos | Bloquea la acción y ofrece retorno seguro |

## 6. Secuencia principal

### Flujo A — Consultar las características de una categoría

1. El gestor entra a Asociaciones.
2. En S-01 selecciona una categoría del árbol.
3. El sistema muestra las características aplicables (directas y heredadas)
   con su obligatoriedad y origen.
4. La consulta es de solo lectura para Catálogo Core (S-05 documental).

### Flujo B — Asociar una característica

1. Con una categoría seleccionada, el gestor elige Asociar característica.
2. En S-02 selecciona una característica activa no asociada.
3. Marca si es obligatoria u opcional.
4. El sistema valida duplicado y límite de 20.
5. Guarda y actualiza S-01.

### Flujo C — Cambiar la obligatoriedad

1. En S-01, sobre una asociación directa, el gestor cambia la condición.
2. Si pasa a obligatoria, el sistema muestra el aviso de regla resuelta
   (productos preexistentes no se invalidan de inmediato).
3. Guarda y actualiza la condición.

### Flujo D — Desasociar

1. En S-01, el gestor selecciona Desasociar sobre una asociación directa.
2. S-04 confirma que la característica dejará de aplicarse.
3. El gestor confirma.
4. La lista se recalcula y el contador de características efectivas baja.

### Flujos alternativos

| ID | Condición | Comportamiento esperado | Retorno |
|---|---|---|---|
| ALT-01 | Sin categoría seleccionada | Deshabilitar acciones y pedir selección | S-01 |
| ALT-02 | Categoría sin asociaciones | Estado vacío sin error | S-01 |
| ALT-03 | Asociación duplicada | Rechazar con mensaje explícito | S-02 |
| ALT-04 | Límite de 20 alcanzado | Bloquear y explicar el límite | S-02 |
| ALT-05 | Categoría inactiva | Sus asociaciones se muestran como no activas | S-01 |
| ALT-06 | Característica inactiva | Sus asociaciones se muestran como no activas | S-01 |
| ALT-07 | Desasociar una heredada | No permitir: la herencia se gestiona en el padre | S-01 |
| ALT-08 | Error al guardar | Conservar datos y permitir reintento | S-02 |
| ALT-09 | Error al cargar | Mostrar estado no disponible con reintento | S-01-E |
| ALT-10 | Usuario sin permiso | Ocultar o deshabilitar acción y explicar acceso | Estado global |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Ruta/presentación | Obligatoria |
|---|---|---|---|---|
| S-01 | Asociaciones por categoría | Seleccionar categoría y ver características aplicables | /productos/caracteristicas/asociaciones propuesta | Sí |
| S-01-E | Vacío o error | Diferenciar ausencia de asociaciones de fallo de carga | Variante de S-01 | Sí |
| S-02 | Asociar característica | Elegir característica y condición | Diálogo o panel | Sí |
| S-02-E | Error de guardado | Conservar datos y recuperar | Variante de S-02 | Sí |
| S-03 | Cambio de obligatoriedad | Editar la condición de una asociación | Control inline o diálogo | Sí |
| S-04 | Confirmar desasociación | Evitar desasociación accidental | Diálogo modal | Sí |
| S-05 | Consulta para Catálogo Core | Representar la exposición de solo lectura | Documental; sin UI de administración | No |

## 8. Mapa de navegación

~~~mermaid
flowchart TD
    A["S-01 Categoría + aplicables"] --> B["S-02 Asociar"]
    B --> A
    A --> C["S-03 Condición"]
    C --> A
    A --> D["S-04 Desasociar"]
    D --> A
    A --> E["S-05 API solo lectura"]
~~~

## 9. Especificación por pantalla

### S-01 — Asociaciones por categoría

#### Propósito

Seleccionar una categoría y comprender exactamente qué características le
aplican, con origen y obligatoriedad.

#### Jerarquía de contenido

1. Selector de categoría (árbol de dos niveles).
2. Resumen: directas y heredadas, contador X/20.
3. Listado de características aplicables.
4. Acciones Asociar característica.

#### Regiones y componentes

| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Selección | Selector árbol | Raíces y subcategorías | Al elegir, se carga la categoría |
| Resumen | Métricas | Efectivas X/20; Directas N; Heredadas M | Calculado en tiempo real |
| Listado | Tabla/tarjetas | Característica, origen, condición, estado | Editable según permiso |
| Acciones | Botones | Asociar característica | Depende de límite y permisos |

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Categoría | Taxonomía | Texto + nivel | Alta | Pedir selección |
| Característica | Taxonomía | Texto | Alta | No debe faltar |
| Origen | Cálculo | Directa / Heredada | Alta | No disponible |
| Condición | Asociación | Obligatoria / Opcional | Alta | No disponible |
| Estado | Categoría/Característica | Activa / No activa | Alta | Mostrar No disponible |
| Contador efectivas | Cálculo | X/20 (efectivas) | Media | — |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Asociar | Asociar característica | Límite no alcanzado y permiso | Abre S-02 |
| Secundaria | Cambiar condición | Obligatoria/Opcional | Asociación directa y permiso | Abre S-03 |
| Destructiva | Desasociar | Desasociar | Asociación directa y permiso | Abre S-04 |
| Secundaria | Consultar | Ver características | Permiso de consulta | S-01 |

#### Navegación y foco

- Foco inicial: selector de categoría.
- El selector funciona por teclado con estructura de árbol.
- El listado refleja el origen de forma textual.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-01 | Selector | Solo categorías existentes; inactivas marcadas |
| A-02 | Origen | Heredada proviene de la categoría padre |
| A-03 | Heredada | No se puede desasociar desde la subcategoría |
| A-04 | Contador | Máximo 20 características efectivas (directas + heredadas, sin duplicados) |
| A-05 | Condición | Obligatoria u opcional por asociación |
| A-06 | No activa | Si categoría o característica se desactiva, la asociación no es activa |

### S-01-E — Vacío o error

- Sin asociaciones (categoría válida): Aún no hay características asociadas.
  Acción: Asociar característica.
- Error de carga: No pudimos cargar las asociaciones. Acción: Reintentar.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-07 | Vacío | Lista vacía sin error por contrato |
| A-08 | Error | Incluye recuperación sin detalles internos |

### S-02 — Asociar característica

#### Propósito

Elegir una característica activa no asociada y marcar su condición.

#### Jerarquía de contenido

1. Categoría destino.
2. Selector de característica.
3. Condición (obligatoria/opcional).
4. Acciones Asociar y Cancelar.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Destino | Resumen | Categoría seleccionada | Solo lectura |
| Característica | Selector | Características activas elegibles | Excluye ya asociadas |
| Condición | Radio | Obligatoria / Opcional | Obligatoria por defecto propuesto |
| Acciones | Botones | Asociar; Cancelar | Validaciones bloqueantes |

#### Validaciones

- La característica no debe estar ya asociada a la categoría.
- La categoría no debe haber alcanzado 20 características efectivas (directas + heredadas, sin duplicados).
- Solo se listan características activas.

#### Navegación y foco

- Foco inicial: selector de característica.
- Foco después de error: campo con el problema.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-09 | Elegibles | Excluye duplicados y características inactivas |
| A-10 | Condición | Define el formulario de producto posterior |
| A-11 | Límite | Si se alcanzaron 20, la acción se bloquea |

### S-02-E — Error de guardado

- Conservar selección y condición.
- Mensaje accionable y seguro.
- Reintentar sin duplicar asociaciones.

### S-03 — Cambio de obligatoriedad

#### Contenido

- Muestra la característica y la categoría.
- Radio Obligatoria / Opcional.
- Si pasa a obligatoria, aviso: los productos preexistentes sin ese dato no se
  invalidan de inmediato; la obligatoriedad se exigirá en la próxima edición.
- Acciones Guardar y Cancelar.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-12 | Aviso | Regla de cambio opcional → obligatoria |
| A-13 | Heredada | La condición se edita en el padre, no aquí |

### S-04 — Confirmar desasociación

#### Contenido

- Título Desasociar característica.
- Nombre de la característica y de la categoría.
- Mensaje: Dejará de aplicarse a esta categoría.
- Acciones Desasociar y Cancelar.

#### Navegación y foco

- Foco contenido en el diálogo.
- Escape o Cancelar cierra sin cambios.
- Al confirmar, la lista se recalcula.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-14 | Advertencia | Efecto claro sobre la categoría |
| A-15 | No cancelable por herencia | Solo se desasocian directas |

### S-05 — Consulta para Catálogo Core (documental)

- Representa el contrato de solo lectura que consume el Catálogo Core.
- Devuelve, para una categoría dada, directas y heredadas con condición.
- No es una pantalla de administración: se documenta como dependencia.

## 10. Estados de interfaz

| Estado | Aplica | Representación | Acciones | Recuperación |
|---|---|---|---|---|
| Cargando | Sí | Skeleton/indicador | Esperar | Reintento |
| Sin categoría seleccionada | Sí | Instrucción de selección | Elegir categoría | N/A |
| Con datos | Sí | Listado de aplicables | Asociar, editar, desasociar | N/A |
| Vacío de aplicables | Sí | Mensaje + Asociar | Asociar con permiso | N/A |
| Duplicado | Sí | Error explícito | Cambiar selección | Corregir |
| Límite 20 alcanzado | Sí | Bloqueo + explicación | Retirar o elegir otra | Corregir |
| Guardando | Sí | Acción deshabilitada | Esperar | N/A |
| Error de guardado | Sí | Mensaje sin perder datos | Reintentar | Repetir envío |
| Asociación no activa | Sí | Etiqueta No activa | Ver motivo | N/A |
| Sin permisos | Sí | Explicación segura | Volver | Solicitar acceso |
| Sesión expirada | Sí | Aviso/autenticación | Iniciar sesión | Recuperar contexto |

### Reglas para datos remotos

- Consultar asociaciones al seleccionar categoría.
- No aplicar guardado optimista.
- La consulta por categoría debe responder en menos de 500 ms.
- Refrescar contador y listado tras cada operación.

## 11. Comportamiento responsivo

DESIGN.md define 12 columnas en escritorio y 4 en móvil. El prototipo demuestra
adaptación sin fijar breakpoints definitivos.

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Completa | Condensada | Patrón global móvil |
| Distribución | Selector y lista en columnas | Regiones apiladas | Una columna |
| Selector de categoría | Árbol lateral | Árbol arriba | Selector de lista |
| Listado | Tabla | Tabla reducida | Tarjetas |
| Acciones | Agrupadas | Ajuste de línea | Ancho completo |
| Anotaciones | Panel lateral | Debajo | Lista/colapsable |

### Condiciones críticas

- Verificar 320 px sin desplazamiento horizontal.
- El selector de categoría debe mantenerse utilizable en móvil.
- Contador principal de características efectivas (directas + heredadas, sin duplicados) visible en todo el flujo.

## 12. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Encabezado principal único por pantalla.
- Selector de categoría navegable por teclado.
- Origen (Directa/Heredada) y condición expresados con texto.
- Diálogos con foco contenido y retorno al activador.
- Acciones móviles de 44 por 44 px.
- Cambios anunciados sin depender del color.
- Anotaciones excluidas del árbol accesible.

## 13. Tono visual y contenido

Aplicar DESIGN.md como única fuente de representación visual.

### Consideraciones específicas

- Densidad: media.
- Sensación buscada: precisión y claridad en la regla de negocio.
- Elemento dominante en S-01: selector de categoría y listado de aplicables.
- Elemento dominante en S-02: validación de duplicado y límite.

### Microcopy crítica

| Contexto | Texto propuesto | Observación |
|---|---|---|
| Acción principal | Asociar característica | Resultado concreto |
| Heredada | Esta característica se hereda de {categoría padre}. | Explica el origen |
| Duplicado | La característica ya está asociada a esta categoría. | Rechazo explícito |
| Límite | Has alcanzado el máximo de 20 características efectivas (incluidas las heredadas). | Regla formalizada |
| Cambio a obligatoria | Los productos preexistentes no se invalidan; se exigirá en la próxima edición. | Regla resuelta |
| Desasociar | La característica dejará de aplicarse a esta categoría. | Efecto claro |
| No activa | La asociación no está activa porque la categoría o característica está inactiva. | Sin tecnicismo |

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
| HTTP | Listar categorías; pendiente | Selector S-01 |
| HTTP | Listar características activas; pendiente | Selector S-02 |
| HTTP | Consultar aplicables por categoría (< 500 ms); pendiente | Alimenta S-01 |
| HTTP | Asociar/cambiar condición/desasociar; pendiente | Escribe S-01 |
| Permiso | Consultar/asociar/desasociar; código pendiente | Acciones condicionadas |

## 15. Privacidad, seguridad y acciones sensibles

- Autorizar las operaciones de escritura en servidor.
- Validar duplicado y límite en servidor, no solo en cliente.
- Sanear los textos mostrados.
- Confirmar la desasociación.
- No exponer detalles internos de Catálogo Core.
- El documento no exige reautenticación.

## 16. Criterios de aceptación del wireframe

- [ ] Permite seleccionar una categoría y consultar sus aplicables.
- [ ] Muestra origen (Directa/Heredada) y condición.
- [ ] Permite asociar indicando obligatoriedad.
- [ ] Rechaza duplicados.
- [ ] Respeta el límite de 20 características efectivas (directas + heredadas, sin duplicados).
- [ ] Refleja la herencia a subcategorías.
- [ ] Representa el cambio de obligatoriedad con su regla resuelta.
- [ ] Permite desasociar con confirmación.
- [ ] Refleja asociaciones no activas cuando la entidad está inactiva.
- [ ] No permite desasociar heredadas desde la subcategoría.
- [ ] Incluye carga, vacío, error, permisos y sesión.
- [ ] Funciona con teclado y no depende del color.
- [ ] Funciona con HTML/CSS/JS estáticos.
- [ ] Es consistente con DESIGN.md.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01 | S-02, condición obligatoria/opcional |
| CA-02 | ALT-03 y validación de duplicado |
| CA-03 | Flujo D, S-04 |
| CA-04 | S-01 y S-05 (API solo lectura) |
| CA-05 | A-06 y estado No activa |

### Reglas resueltas cubiertas

| Regla | Cobertura |
|---|---|
| Herencia a subcategorías | S-01, A-02/A-03 |
| Cambio opcional → obligatoria | S-03, A-12 y microcopy |
| Límite de 20 por categoría | A-04, ALT-04 y validación |

## 17. Supuestos

| ID | Supuesto | Motivo | Impacto si es incorrecto | Validar |
|---|---|---|---|---|
| SUP-01 | WF-010 es el ID asignado en INDEX.md | Asignación de la rama `lopez` | Renombrar archivo/referencias | Sí |
| SUP-02 | La ruta será /productos/caracteristicas/asociaciones | No se entregó mapa de navegación | Cambiar rutas/entrada | Sí |
| SUP-03 | El máximo 20 cuenta características efectivas directas y heredadas, sin duplicados | Specs/HU definitivos | Recalcular también al mover padre | No |
| SUP-04 | La consulta pública es API, representada solo documentalmente | Alcance de la spec | Añadir vista de inspección si aplica | Sí |

## 18. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea wireframe | Estado |
|---|---|---|---|---|
| Q-01 | Resuelto: se hereda; una obligatoriedad heredada no puede relajarse en subcategoría. | Specs/HU definitivos | No | Resuelta |
| Q-02 | Resuelto: máximo 20 características efectivas contando directas + heredadas sin duplicados. | Specs/HU definitivos | No | Resuelta |
| Q-03 | ¿Existe búsqueda o filtro en el selector de características? | Producto | No para flujo base | Abierta |
| Q-04 | ¿Debe advertirse al salir con cambios sin guardar? | Producto/UX | No | Abierta |
| Q-05 | ¿Se permite asociar en cascada entre categorías hermanas? | Producto | No | Abierta |
| D-01 | Selección de librería UI y estrategia CSS | Frontend | No para wireframe; sí para implementación | Pendiente |

### Alineación definitiva de Asociación Categoría–Característica

- El contador principal **X/20** refleja características **efectivas** de la categoría: directas + heredadas, sin duplicados. El desglose «directas / heredadas» es adicional; no se debe presentar `20 directas` como límite autónomo.
- Una obligatoriedad heredada no puede relajarse en la subcategoría; una asociación heredada no se elimina desde la hija. Cambiar opcional a obligatoria no invalida productos preexistentes hasta su siguiente guardado.
- Añadir asociaciones a un padre o mover una categoría requiere comprobar el límite sobre **cada descendiente afectado** antes de confirmar; mostrar error contextual cuando un descendiente excedería el máximo. El flujo debe conservar la ubicación y datos anteriores ante rechazo.

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
- [x] Los criterios CA-01 a CA-05 están cubiertos.
- [x] La herencia, el límite y el cambio de obligatoriedad están documentados.
- [x] Los supuestos y preguntas están registrados.
- [x] El formato HTML está definido.
- [ ] Confirmar el ID WF-010 contra INDEX.md.
- [ ] Resolver Q-01 y Q-02 antes del diseño definitivo.
- [ ] Confirmar rutas y permisos antes de implementar el frontend.

---
