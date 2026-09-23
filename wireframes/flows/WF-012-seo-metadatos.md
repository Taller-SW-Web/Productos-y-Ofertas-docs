# WF-012 — Gestión de SEO y metadatos

> **Fuentes normativas:** SPEC individual de esta funcionalidad (`../../specs/SPEC-012-seo-metadatos.md`), HU individual de esta funcionalidad (`../../hu/HU-012-seo-metadatos.md`), `../DESIGN.md` y `../INDEX.md`. Ante contradicción, prevalece SPEC → HU → WF. Los nombres/eventos de Ventas y Postventa son contratos **provisionales no homologados**; el prototipo no debe simular pagos realizados ni confirmaciones externas como si estuvieran implementadas. Las anotaciones, supuestos, preguntas y referencias técnicas permanecen en este documento y no se muestran como elementos de la interfaz simulada.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la gestión de SEO y
metadatos descrita en este archivo.

Antes de diseñar:

1. Consulta ../../specs/SPEC-012-seo-metadatos.md.
2. Consulta ../../hu/HU-012-seo-metadatos.md.
3. Consulta ../DESIGN.md.
4. Consulta ../INDEX.md.
5. Usa este documento para la composición, interacción y estados del flujo.

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
- El slug se normaliza automáticamente en minúsculas, sin tildes ni espacios.
- Política de duplicados y traspaso con WF-008: en la creación o regeneración automática se aplica un
  sufijo numérico incremental (ej. `futbol-2`), el cual se muestra visible en el formulario antes de confirmar para que el usuario no descubra el cambio tras guardar; en la edición manual
  el sistema RECHAZA el duplicado con el error “El slug indicado ya está en
  uso” y no autogenera sufijos.
- Meta-título: límite recomendado 70 caracteres. Meta-descripción: límite
  recomendado 160 caracteres. Superar el límite PERMITE guardar pero muestra
  una advertencia visible.
- Si el slug de una categoría indexada cambia, se guarda el historial y se
  expone la resolución permanente `old_slug -> new_slug`; el canal Marketplace es el responsable de ejecutar la respuesta HTTP 301 en su capa pública.
- El endpoint público de metadatos SEO retorna título y descripción por slug
  activo.
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
- Aplica el estilo monocromático y de baja fidelidad de DESIGN.md.

### Entregables esperados

1. Consulta del estado SEO por categoría.
2. Editor de slug con regeneración automática desde el nombre.
3. Política de duplicados visible: sufijo incremental autogenerado visible antes de confirmar/publicar y
   error explícito en edición manual.
4. Contadores vivos y advertencias de 70/160 caracteres.
5. Vista previa del snippet de búsqueda.
6. Historial de slugs con resolución permanente de redirecciones (HTTP 301 en Marketplace).
7. Simulación del endpoint público por slug activo.
8. Estados de carga, vacío, error, permisos y conflicto.
9. Navegación funcional entre los estados simulados.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-012 |
| Nombre del flujo | Gestión de SEO y metadatos |
| Versión | 0.1 |
| Estado | Borrador |
| Responsable | Leonardo Lopez |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-18 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | SPEC-012-seo-metadatos.md, secciones 1–5 | Reglas SEO, política de duplicados y resolución de slugs |
| Historia de usuario | HU-012-seo-metadatos.md, CA-01 a CA-06 | Criterios de aceptación SEO |
| Diseño | DESIGN.md | Lenguaje visual monocromático de baja fidelidad |
| Backlog | No proporcionado | No se asignan IDs de backlog |

### Funcionalidades incluidas

- Consultar el estado de configuración SEO por categoría.
- Generar automáticamente el slug normalizado desde el nombre.
- Editar manualmente el slug de una categoría.
- Aplicar sufijo incremental autogenerado visible antes de confirmar/guardar en caso de duplicado.
- Rechazar duplicados en la edición manual con error explícito.
- Editar meta-título y meta-descripción con límites 70/160 y advertencias.
- Mantener historial de slugs y exponer resolución permanente `old_slug -> new_slug`.
- Simular el endpoint público de metadatos por slug activo.

### Fuera de alcance

- Gráfico del rendimiento SEO, sugerencias u otras herramientas de buscador.
- Cambios en URLs canónicas del frontend.
- Ejecución de la redirección HTTP 301 en la capa pública: corresponde a Marketplace (este módulo solo expone la resolución permanente `old_slug -> new_slug`).
- Delimitación y handoff con WF-008: WF-012 es propietario de las reglas de generación, colisión, edición e historial del slug. Durante la creación de una categoría, WF-008 consume la generación automática y muestra el slug final antes de confirmar. La edición posterior del slug y metadatos se realiza en WF-012.
- Traducción de metadatos a varios idiomas.

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Gestor comercial responsable de la taxonomía del catálogo |
| Rol en el sistema | Gestor comercial autenticado |
| Nivel técnico | No especificado; diseñar para nivel operativo básico/intermedio |
| Contexto de uso | Configuración periódica del posicionamiento del catálogo |
| Necesidad principal | Mejorar el posicionamiento del Marketplace en buscadores |
| Permisos relevantes | Consultar y editar SEO de categorías; códigos pendientes |
| Dispositivo principal | Escritorio como hipótesis; consulta adaptada a tablet/móvil |

## 4. Objetivo del flujo

El gestor comercial debe poder configurar, por cada categoría, el slug y los
metadatos SEO (meta-título y meta-descripción) con control de duplicados e
historial de slugs, de modo que el Marketplace pueda generar URLs legibles y
optimizar la navegación, resolviendo redirecciones para mantener el posicionamiento previo.

### Resultado exitoso

La categoría queda con slug único y activo, metadatos dentro o sobre los
límites recomendados con advertencia visible, historial de slugs con resolución permanente de redirección, y el endpoint público retorna el título y la
descripción por el slug activo.

### Indicadores de finalización

- Configuración inicial: mensaje Metadatos guardados y estado Configurado.
- Cambio de slug: historial actualizado y resolución de redirección registrada.
- Endpoint: respuesta simulada 200 con título y descripción.

El patrón exacto de notificación debe alinearse con el sistema global.

## 5. Precondiciones y disparador

### Precondiciones

- El usuario tiene una sesión válida.
- El usuario posee el permiso requerido para la acción.
- Existen categorías en el sistema.

### Puntos de entrada

- Ruta propuesta del listado: /productos/seo.
- Entrada propuesta: opción SEO dentro del módulo Productos y ofertas.
- Configurar: acción sobre una categoría sin SEO.
- Editar: acción sobre una categoría configurada.
- Historial: acción sobre el historial de slugs de una categoría.

Las rutas y ubicación exactas son propuestas de wireframe y deben confirmarse.

### Salidas del flujo

| Resultado | Destino o comportamiento |
|---|---|
| Guardado exitoso | S-01 con estado Configurado actualizado |
| Slug duplicado en edición manual | Error en S-02 sin guardar |
| Slug duplicado en auto-generación | Sufijo autogenerado visible antes de confirmar/guardar |
| Cambio de slug | S-03 actualizado con resolución de redirección |
| Cancelación | Regresa a S-01 o al origen |
| Endpoint consultado | Simulación de respuesta de metadatos o resolución permanente |
| Sin permisos | Bloquea la acción y ofrece retorno seguro |

## 6. Secuencia principal

### Flujo A — Consultar estado SEO

1. El gestor entra a SEO por categoría.
2. El listado muestra cada categoría, su slug, su estado de configuración y las
   acciones disponibles.

### Flujo B — Configurar SEO (primera vez)

1. El gestor abre una categoría sin configurar.
2. En S-02 el sistema sugiere el slug normalizado desde el nombre.
3. El gestor rellena o confirma meta-título y meta-descripción.
4. Valida duplicados según origen (automático con sufijo visible; manual con error).
5. Guarda; la categoría pasa a estado Configurado.

### Flujo C — Editar slug manualmente

1. El gestor edita el slug de una categoría configurada.
2. Si el slug ya existe en otra categoría, el sistema muestra “El slug indicado
   ya está en uso” y bloquea el guardado.
3. Si es válido y distinto del anterior, el sistema registra el historial y la
   resolución permanente `old_slug -> new_slug` (para ejecución 301 en Marketplace).

### Flujo D — Regenerar slug desde el nombre

1. El gestor elige Regenerar desde el nombre.
2. El sistema normaliza y, ante duplicado, genera un sufijo numérico visible en el formulario antes de confirmar.
3. El gestor guarda; se registran historial y resolución si aplica.

### Flujo E — Consultar historial y endpoint

1. El gestor abre el historial de slugs de una categoría.
2. Ve los slugs anteriores con su resolución hacia el nuevo slug y prueba el endpoint público de metadatos.

### Flujos alternativos

| ID | Condición | Comportamiento esperado | Retorno |
|---|---|---|---|
| ALT-01 | Slug manual vacío | Error y guardado bloqueado | S-02 |
| ALT-02 | Slug manual duplicado | Error: El slug indicado ya está en uso | S-02 |
| ALT-03 | Meta-título > 70 | Advertencia; se permite guardar | S-02 |
| ALT-04 | Meta-descripción > 160 | Advertencia; se permite guardar | S-02 |
| ALT-05 | Categoría inexistente al editar | Error de no encontrado | S-01 |
| ALT-06 | Error al guardar | Conservar datos y permitir reintento | S-02-E |
| ALT-07 | Error al cargar listado | Mostrar estado no disponible con reintento | S-01-E |
| ALT-08 | Endpoint sin slug activo | Simulación 404 | S-03 |
| ALT-09 | Usuario sin permiso | Ocultar o deshabilitar acción y explicar acceso | Estado global |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Ruta/presentación | Obligatoria |
|---|---|---|---|---|
| S-01 | SEO por categoría | Consultar estado y entrar a configurar o editar | /productos/seo propuesta | Sí |
| S-01-E | Vacío o error del listado | Diferenciar ausencia de fallo de carga | Variante de S-01 | Sí |
| S-02 | Configurar/Editar SEO | Slug, meta-título, meta-descripción y vista previa | Ruta propuesta /productos/seo/:id | Sí |
| S-02-E | Error de guardado | Conservar datos y recuperar | Variante de S-02 | Sí |
| S-03 | Historial y endpoint | Slugs anteriores, resolución de redirecciones y prueba del endpoint | Ruta propuesta /productos/seo/:id/historial | Sí |

## 8. Mapa de navegación

~~~mermaid
flowchart TD
    A["S-01 SEO por categoría"] --> B["S-02 Editar/Configurar"]
    A --> C["S-03 Historial y endpoint"]
    B --> A
    B --> C
~~~

## 9. Especificación por pantalla

### S-01 — SEO por categoría

#### Propósito

Dar acceso a la configuración SEO de cada categoría y su estado.

#### Jerarquía de contenido

1. Título SEO por categoría.
2. Acción de ayuda contextual (no obligatoria).
3. Listado de categorías con su estado SEO.

#### Regiones y componentes

| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título | SEO por categoría | N/A |
| Listado | Tabla en escritorio; tarjetas en móvil | Categoría, slug, configuración | Abre S-02 |
| Fila/tarjeta | Acciones contextuales | Configurar/Editar, Historial | Abre S-02/S-03 |
| Estado | Etiqueta textual | Configurado, Pendiente | No depender del color |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Configurar | Configurar SEO | Estado Pendiente y permiso | Abre S-02 |
| Secundaria | Modificar | Editar SEO | Estado Configurado y permiso | Abre S-02 |
| Secundaria | Historial | Ver historial | Siempre con permiso | Abre S-03 |

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Categoría | Categoría | Texto | Alta | No debe faltar |
| Slug | SEO de categoría | Texto | Alta | Mostrar Pendiente |
| Estado SEO | SEO de categoría | Texto | Alta | Mostrar No disponible |
| Meta-título | SEO de categoría | Texto + contador | Media | Mostrar Pendiente |
| Meta-descripción | SEO de categoría | Texto + contador | Media | Mostrar Pendiente |

No agregar búsqueda, filtros, ordenamiento o paginación al prototipo hasta que
la necesidad y reglas estén confirmadas.

#### Navegación y foco

- Foco inicial: título o primera acción.
- El orden recorre filas y sus acciones.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-01 | Estado SEO | Configurado/Pendiente expresado con texto |
| A-02 | Acciones | La fila abre S-02; el historial abre S-03 |
| A-03 | Slug | Activo y único por categoría |

### S-01-E — Vacío o error de listado

- Vacío: Aún no hay categorías. Acción: la gestión de categorías ocurre en
  WF-008.
- Error: No pudimos cargar las categorías. Acción: Reintentar.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-04 | Vacío | Remite al flujo WF-008 |
| A-05 | Error | Recuperación sin detalles internos |

### S-02 — Configurar/Editar SEO

#### Propósito

Configurar slug, meta-título, meta-descripción y previsualizar el resultado de
búsqueda.

#### Jerarquía de contenido

1. Categoría y estado.
2. Slug (actual, edición manual, regeneración automática).
3. Meta-título con contador.
4. Meta-descripción con contador.
5. Vista previa del snippet de búsqueda.
6. Acciones Guardar y Cancelar.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Cabecera | Título + estado | Categoría | Indica Configurado/Pendiente |
| Slug | Campo + acciones | Campo editable; Regenerar desde el nombre | Validación de duplicados diferenciada |
| Metadatos | Campos + contadores | Título y descripción | Advierte 70/160 |
| Vista previa | Tarjeta de snippet | Título, URL y descripción | Se actualiza en vivo |
| Acciones | Botones | Guardar; Cancelar | Guardado condicionado |

#### Formulario y validaciones

| Campo | Tipo | Obligatorio | Validación | Mensaje propuesto |
|---|---|---|---|---|
| Slug | Texto | Sí | Requerido; único; origen decide duplicado | El slug indicado ya está en uso. |
| Meta-título | Texto | No | Advertencia si > 70 | Superaste el límite recomendado de 70 caracteres. |
| Meta-descripción | Texto multilínea | No | Advertencia si > 160 | Superaste el límite recomendado de 160 caracteres. |

- Slug de origen automático con duplicado: se aplica un sufijo incremental
  (ej. `futbol-2`), el cual se muestra visible en el formulario antes de confirmar para que el usuario no descubra el cambio tras guardar.
- Slug de origen manual con duplicado: error visible y guardado bloqueado; no
  se autogeneran sufijos.

#### Vista previa del snippet

- Título: texto del meta-título truncado a ~60 caracteres.
- URL: dominio ficticio + slug actual.
- Descripción: texto del meta-descripción truncado.

#### Navegación y foco

- Foco inicial: campo Slug.
- Foco después de error: primer campo inválido.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-06 | Slug | Normalización: minúsculas, sin tildes ni espacios |
| A-07 | Auto-generación | Duplicado recibe sufijo numérico visible antes de confirmar |
| A-08 | Edición manual | Duplicado rechazado; sin auto-sufijo |
| A-09 | Contadores | Límite recomendado 70/160; guardado permitido |
| A-10 | Cambio de slug | Genera historial y resolución permanente (Marketplace ejecutará HTTP 301) |
| A-11 | Vista previa | Simula el snippet de los buscadores |

### S-02-E — Error de guardado

- Conservar los datos del formulario.
- Mensaje accionable y seguro.
- Reintentar sin crear duplicados.

### S-03 — Historial y endpoint público

#### Propósito

Mostrar los slugs históricos con su resolución permanente hacia el slug actual y probar el endpoint público de metadatos.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Historial | Tabla | Slug actual; slugs anteriores; fecha | Tabla en escritorio/tarjetas en móvil |
| Redirección | Etiqueta | Resolución permanente → slug actual | Indica la nueva ruta (ejecutada como 301 en Marketplace) |
| Endpoint | Panel de simulación | Slug de consulta; respuesta | Devuelve 200 (metadatos vigentes), resolución de slug anterior, o 404 ficticio |

#### Comportamiento de la simulación

- Slug activo: 200 con `{slug, meta_title, meta_description}`.
- Slug antiguo con historial: Resolución que indica reemplazo permanente hacia el nuevo slug (Marketplace responde 301 con `Location`).
- Slug inexistente o categoría inactiva: 404.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-12 | Historial | Cada slug anterior expone resolución permanente `old_slug -> new_slug` |
| A-13 | Endpoint | Público de solo lectura, retorna metadatos por slug activo |

## 10. Estados de interfaz

| Estado | Aplica | Representación | Acciones | Recuperación |
|---|---|---|---|---|
| Listado cargando | Sí | Skeleton/indicador | Esperar | Reintento si falla |
| Listado vacío | Sí | Mensaje; remite a WF-008 | N/A | Crear categorías |
| Listado con datos | Sí | Tabla/tarjetas | Configurar, editar, historial | N/A |
| Formulario inicial | Sí | Campos con o sin valores | Completar/guardar/cancelar | N/A |
| Slug manual duplicado | Sí | Error en campo | Corregir | Corregir |
| Slug automático duplicado | Sí | Sufijo visible antes de confirmar | Revisar | Guardar |
| Meta-título > 70 | Sí | Advertencia visible | Guardar o acortar | Guardado permitido |
| Meta-descripción > 160 | Sí | Advertencia visible | Guardar o acortar | Guardado permitido |
| Guardando | Sí | Acción deshabilitada | Evitar duplicado | Esperar |
| Guardado exitoso | Sí | Confirmación + listado | Continuar | N/A |
| Error de guardado | Sí | Mensaje sin perder datos | Reintentar | Repetir envío |
| Slugs sin historial | Sí | Mensaje informativo | N/A | N/A |
| Endpoint 200 | Sí | JSON ficticio de metadatos vigentes | Probar otro slug | N/A |
| Endpoint resolución | Sí | JSON ficticio de resolución `old_slug -> new_slug` | Probar otro slug | N/A |
| Endpoint 404 | Sí | JSON ficticio | Probar otro slug | N/A |
| Sin permisos | Sí | Explicación segura | Volver | Solicitar acceso |
| Sesión expirada | Sí | Aviso/autenticación | Iniciar sesión | Recuperar contexto |

### Reglas para datos remotos

- Consultar las categorías y su SEO al cargar y tras guardar.
- No aplicar guardado optimista.
- El endpoint público es de solo lectura y no requiere autenticación.

## 11. Comportamiento responsivo

DESIGN.md define 12 columnas en escritorio y 4 en móvil. El prototipo demuestra
adaptación sin fijar breakpoints definitivos.

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Completa | Condensada | Patrón global móvil |
| Listado | Tabla | Tabla reducida | Tarjetas |
| Formulario | Campos en columnas | Regiones apiladas | Una columna |
| Vista previa | Lateral | Debajo | Debajo |
| Historial | Tabla | Tabla reducida | Tarjetas |
| Anotaciones | Panel lateral | Debajo | Lista/colapsable |
| Contenido omitido | Ninguno | Ninguno | Ninguno; reorganizar |

### Condiciones críticas

- Verificar 320 px sin desplazamiento horizontal.
- Los contadores deben leerse junto al campo en todas las anchuras.
- El panel de endpoint debe permitir pegar slugs largos sin romperse.

## 12. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Encabezado principal único por pantalla.
- Campos con etiquetas persistentes y errores asociados.
- El estado Configurado/Pendiente se expresa con texto e icono.
- Las advertencias de longitud se comunican como texto junto al campo.
- Diálogos con foco contenido y retorno al activador.
- Acciones móviles de 44 por 44 px.
- Cambios no dependientes del color.
- Anotaciones excluidas del árbol accesible.

## 13. Tono visual y contenido

Aplicar DESIGN.md como única fuente de representación visual.

### Consideraciones específicas

- Densidad: media.
- Sensación buscada: control de posicionamiento y prevención de colisiones.
- Elemento dominante en S-02: el editor con su vista previa.
- Elemento dominante en S-03: el panel de simulación del endpoint.

### Microcopy crítica

| Contexto | Texto propuesto | Observación |
|---|---|---|
| Duplicado manual | El slug indicado ya está en uso. | Escenario 2 |
| Auto-generación | Se aplicó “-2” porque ese slug ya estaba en uso. | Escenario 1 |
| Título | Superaste el límite recomendado de 70 caracteres. | Requisito 1 |
| Descripción | Superaste el límite recomendado de 160 caracteres. | Requisito 1 |
| Cambio de slug | Se registró la redirección 301 del slug anterior. | Requisito 3 |
| Endpoint | Endpoint público por slug activo. | Requisito 4 / CA-06 |

## 14. Restricciones técnicas relevantes

- Aplicación objetivo: React, TypeScript y Vite.
- Navegación: React Router; rutas exactas pendientes.
- Estado remoto: TanStack Query.
- Formularios: React Hook Form y Zod.
- Contratos HTTP: OpenAPI/Swagger.
- El prototipo es HTML/CSS/JS estático.

### Dependencias o contratos

| Tipo | Operación o referencia | Impacto visible |
|---|---|---|
| HTTP | Leer/guardar SEO por categoría; pendiente | S-01/S-02 |
| HTTP | Endpoint público por slug activo | S-03 (simulado) |
| Búsqueda | Caché de la red de distribución/semana | Redirección 301 propagada |
| Permiso | Consultar/editar SEO; código pendiente | Acciones condicionadas |

## 15. Privacidad, seguridad y acciones sensibles

- Autorizar acciones de escritura en servidor.
- Validar duplicados en servidor, no solo en cliente.
- Sanear slug, título y descripción.
- Registrar historial y resoluciones permanentes `old_slug -> new_slug` al cambiar slug.
- El endpoint público expone solamente título y descripción.
- El documento no exige reautenticación.

## 16. Criterios de aceptación del wireframe

- [ ] Genera slug normalizado desde el nombre en la configuración inicial.
- [ ] Aplica sufijo incremental visible antes de confirmar ante duplicado automático.
- [ ] Rechaza el duplicado manual con “El slug indicado ya está en uso”.
- [ ] Advierte longitudes superiores a 70 y 160 caracteres permitiendo guardar.
- [ ] Registra el historial y la resolución permanente `old_slug -> new_slug` al cambiar el slug.
- [ ] Simula consulta de slug activo (200), resolución `old_slug -> new_slug` para un slug histórico y ausencia/inactividad (404); Marketplace transforma la resolución histórica en HTTP 301.
- [ ] Incluye carga, vacío, error, permisos y sesión.
- [ ] Funciona con teclado y no depende del color.
- [ ] Funciona con HTML/CSS/JS estáticos.
- [ ] Es consistente con DESIGN.md.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01 | S-02 y Flujo B |
| CA-02 | Flujo D y ALT-02 |
| CA-03 | Flujo C y ALT-02 |
| CA-04 | Contadores y advertencias (ALT-03/ALT-04) |
| CA-05 | Flujo E y sección de historial |
| CA-06 | Panel de endpoint en S-03 |

## 17. Supuestos

| ID | Supuesto | Motivo | Impacto si es incorrecto | Validar |
|---|---|---|---|---|
| SUP-01 | WF-012 es el ID asignado en INDEX.md | Asignación de la rama `lopez` | Renombrar archivo/referencias | Sí |
| SUP-02 | La ruta será /productos/seo | No se entregó mapa de navegación | Cambiar rutas/entrada | Sí |
| SUP-03 | Escritorio es el dispositivo principal | Gestión administrativa | Cambiar prioridad responsive | Sí |
| SUP-04 | El endpoint público no requiere autenticación | Enunciado del requisito | Ajustar simulación | Sí |

## 18. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea wireframe | Estado |
|---|---|---|---|---|
| Q-01 | ¿El slug admite números, guiones o solo letras? | Producto | No para wireframe | Abierta |
| Q-02 | ¿Dónde se gestiona el slug al crear la categoría además de WF-012? | Producto | No | Abierta |
| Q-03 | ¿Hay límite de cantidad de slugs en el historial? | Producto | No | Abierta |
| Q-04 | ¿Debe advertirse al salir con cambios sin guardar? | Producto/UX | No | Abierta |
| D-01 | Selección de librería UI y estrategia CSS | Frontend | No para wireframe; sí para implementación | Pendiente |

### Alineación definitiva de SEO

- Se conserva el flujo de SEO descrito por `SPEC-012-seo-metadatos.md` y `HU-012-seo-metadatos.md`, que no necesitaron cambios funcionales en la consolidación definitiva. Los identificadores, unicidad de slug y tratamiento de URLs anteriores deben seguir la especificación SEO; no inferir reglas nuevas de una pantalla de Categorías o Productos.

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
- [x] Los criterios CA-01 a CA-06 están cubiertos.
- [x] La política dual de duplicados está documentada.
- [x] Los límites 70/160 y la resolución de redirecciones (Marketplace 301) están documentados.
- [x] Los supuestos y preguntas están registrados.
- [x] El formato HTML está definido.
- [ ] Confirmar el ID WF-012 contra INDEX.md.
- [ ] Resolver Q-01 antes de implementar el frontend.
- [ ] Confirmar rutas y permisos antes de implementar el frontend.

---
