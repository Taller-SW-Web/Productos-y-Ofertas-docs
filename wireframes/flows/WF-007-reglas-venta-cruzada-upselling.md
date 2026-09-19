# WF-007 — Reglas de venta cruzada y upselling

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para administrar reglas de
Cross-sell y Upsell descritas en este archivo.

Antes de diseñar:

1. Consulta `../../specs/SPEC-007-reglas-venta-cruzada-upselling.md`.
2. Consulta `../../hu/HU-007-reglas-venta-cruzada-upselling.md`.
3. Consulta `../DESIGN.md`.
4. Usa este documento para composición, interacción y estados.

Prioridad: especificación, historia de usuario, este flujo y `DESIGN.md`.
No inventes una resolución cuando las fuentes no definan una regla.

Reglas de producción:

- Diferencia Cross-sell, que representa complementos, de Upsell, que representa
  alternativas clasificadas manualmente como superiores.
- Permite origen por producto o por categoría.
- Exige prioridad de regla y orden por producto recomendado.
- Prioridad 1 es mayor que prioridad 2; ordenar ascendentemente.
- No permitas recomendar el producto origen ni duplicar un producto en la regla.
- Para cada recomendado Upsell exige una justificación comercial concreta.
- No infieras superioridad por precio ni intentes verificar automáticamente la
  justificación.
- Las recomendaciones no agregan ni reemplazan productos automáticamente.
- El filtrado por actividad/stock y la deduplicación entre reglas son contexto
  de la consulta; no deben convertirse en controles manuales de publicación.
- Las anotaciones `A-xx`, supuestos, preguntas, contratos y criterios de revisión
  son documentación y no deben renderizarse en la interfaz HTML.
- Usa datos ficticios y el lenguaje monocromático de `DESIGN.md`.

### Formato del entregable

- Entrada: `../prototipos/WF-007-reglas-venta-cruzada-upselling/index.html`.
- HTML, CSS y JavaScript estáticos, navegables y sin servicios externos.
- Listado, alta/edición, detalle, cambio de estado y prueba de recomendaciones.
- Responsividad real mediante CSS, sin simulador de dispositivo interno.

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID | `WF-007` |
| Nombre | Reglas de venta cruzada y upselling |
| Versión | 0.1 |
| Estado | En revisión |
| Responsable | Axel Andree Cueva Alcalá |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-17 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte |
|---|---|---|
| Spec | `SPEC-007-reglas-venta-cruzada-upselling.md`, secciones 3–7 | Modelo, prioridad, orden, filtros y alcance |
| Historia de usuario | `HU-REC-01`, CA-01 a CA-12 | Necesidad y escenarios verificables |
| Diseño | `DESIGN.md` | Jerarquía y representación de baja fidelidad |

### Funcionalidades incluidas

- Consultar, buscar y filtrar reglas.
- Crear y editar reglas Cross-sell o Upsell.
- Elegir origen producto/categoría y productos recomendados.
- Definir prioridad, orden, vigencia y estado.
- Registrar justificación por producto Upsell.
- Activar/desactivar y probar recomendaciones resultantes.

### Fuera de alcance

- Inteligencia artificial, aprendizaje automático o personalización histórica.
- Determinar o verificar automáticamente que un producto sea superior.
- Agregar o sustituir artículos en una compra.
- Editar catálogo, precios o stock desde este flujo.

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Gestor comercial |
| Nivel técnico | Intermedio |
| Contexto | Curación de recomendaciones para Marketplace, Chatbot y Retail |
| Necesidad | Controlar qué se recomienda, por qué y en qué orden |
| Permisos | Crear, editar, activar y desactivar reglas |
| Dispositivo | Escritorio, con soporte tablet y móvil |

## 4. Objetivo del flujo

**El usuario debe poder** configurar relaciones comerciales ordenadas y vigentes
**para** que los canales reciban complementos o alternativas disponibles sin
duplicados y sin alterar automáticamente la compra.

### Resultado exitoso

La regla aparece con tipo, origen, prioridad, estado y cantidad de recomendados;
su detalle conserva orden y justificaciones Upsell.

### Indicador de finalización

Confirmación de guardado y retorno al listado actualizado.

## 5. Precondiciones y disparador

### Precondiciones

- Sesión válida y permiso de Gestor Comercial.
- Existen productos y categorías activas.
- Precios y disponibilidad pueden consultarse para la prueba.

### Punto de entrada

- Ubicación: Productos y ofertas, sección Reglas.
- Disparadores: `Crear regla`, `Ver detalle` o `Probar recomendaciones`.

### Salidas

| Resultado | Comportamiento |
|---|---|
| Éxito | Listado actualizado y confirmación |
| Cancelación | Regreso sin guardar |
| Validación fallida | Permanencia con datos y errores |
| Error remoto | Contexto conservado y reintento |

## 6. Secuencia principal

1. El gestor abre el listado de reglas.
2. Selecciona `Crear regla`.
3. Ingresa nombre y elige Cross-sell o Upsell.
4. Selecciona tipo de origen y origen específico.
5. Define prioridad, estado y vigencia.
6. Añade uno o más productos y define su orden.
7. Si es Upsell, justifica cada recomendado.
8. Guarda; el sistema valida y confirma.
9. Desde el listado consulta, edita, cambia el estado o prueba resultados.

### Flujos alternativos

| ID | Condición | Respuesta | Retorno |
|---|---|---|---|
| `ALT-01` | Sin recomendados | Bloquear y solicitar al menos uno | Formulario |
| `ALT-02` | Origen incluido como recomendado | Identificar conflicto | Formulario |
| `ALT-03` | Recomendado duplicado | Impedir segunda selección | Selector |
| `ALT-04` | Upsell sin justificación | Señalar el producto afectado | Formulario |
| `ALT-05` | Prioridad u orden inválido | Solicitar entero positivo | Formulario |
| `ALT-06` | Fin no posterior al inicio | Asociar error al fin | Formulario |
| `ALT-07` | Recomendado sin stock en consulta | Excluirlo del resultado | Prueba |
| `ALT-08` | Duplicado entre reglas | Conservar primera aparición | Prueba |
| `ALT-09` | Sin coincidencias válidas | Mostrar lista vacía | Prueba |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Presentación | Obligatoria |
|---|---|---|---|---|
| `S-01` | Listado de reglas | Consultar y entrar a acciones | Vista principal | Sí |
| `S-01-E` | Sin resultados | Recuperar filtros | Misma vista | Sí |
| `S-02` | Crear/editar regla | Configurar relación y recomendados | Formulario | Sí |
| `S-02-U` | Upsell | Exigir justificaciones por producto | Variante de S-02 | Sí |
| `S-02-V` | Validación fallida | Corregir sin perder datos | Misma vista | Sí |
| `S-03` | Seleccionar producto | Añadir un recomendado activo | Diálogo | Sí |
| `S-04` | Detalle | Revisar configuración y orden | Vista de detalle | Sí |
| `S-05` | Probar recomendaciones | Revisar salida ordenada | Vista funcional | Sí |
| `S-05-E` | Sin recomendaciones | Comunicar lista vacía | Misma vista | Sí |
| `S-06` | Confirmar estado | Evitar cambios accidentales | Diálogo | Sí |

## 8. Especificación por pantalla

### `S-01` — Listado de reglas

1. Título `Venta cruzada y upselling`.
2. Acciones `Probar recomendaciones` y `Crear regla`.
3. Búsqueda y filtros por tipo y estado.
4. Tabla con regla, tipo, origen, prioridad, recomendados, estado y detalle.

| ID | Elemento | Anotación |
|---|---|---|
| `A-01` | Tipo | Mostrar Cross-sell/Upsell en texto explícito |
| `A-02` | Origen | Distinguir producto de categoría |
| `A-03` | Prioridad | Indicar que 1 es la prioridad mayor |
| `A-04` | Estado | No depender solo del color |

### `S-02` — Crear o editar regla

#### Campos y validaciones

| Campo | Tipo | Obligatorio | Validación | Error |
|---|---|---|---|---|
| Nombre | Texto | Sí | No vacío | `Ingresa un nombre` |
| Tipo | Radio | Sí | Cross-sell o Upsell | N/A |
| Tipo de origen | Selector | Sí | Producto o categoría | N/A |
| Origen | Selector | Sí | Existente y activo | `Selecciona un origen` |
| Prioridad | Entero | Sí | Mayor o igual que 1 | `Ingresa un entero mayor o igual a 1` |
| Estado | Selector | Sí | Activa o inactiva | N/A |
| Inicio/fin | Fecha/hora | Sí | Inicio anterior al fin | Mensajes específicos |
| Recomendados | Lista | Sí | Al menos uno, activos, sin origen ni duplicados | Error contextual |
| Orden | Entero | Sí | Mayor o igual que 1 | Error por producto |
| Justificación | Texto | Solo Upsell | No vacía y describe mejora concreta | `Explica la mejora concreta de [producto]` |

- Al cambiar a Upsell aparecen justificaciones por producto.
- No borrar datos al detectar un error.
- Bloquear envíos duplicados.
- La interfaz exige texto, pero no verifica automáticamente su veracidad.

| ID | Elemento | Anotación |
|---|---|---|
| `A-05` | Tipo | Cambia la semántica y campos requeridos |
| `A-06` | Origen | Producto y categoría son mutuamente excluyentes |
| `A-07` | Prioridad | Ordena reglas, no productos internos |
| `A-08` | Orden | Ordena productos dentro de una regla |
| `A-09` | Justificación | Una por recomendado Upsell; precio mayor no basta |
| `A-10` | Guardado | Conserva datos e identifica cada producto incompleto |

### `S-03` — Seleccionar producto recomendado

- Mostrar únicamente productos existentes y activos.
- Excluir el producto origen cuando el origen sea un producto.
- Impedir seleccionar un producto ya añadido.
- Añadir devuelve al formulario y asigna el siguiente orden disponible.
- Stock puede mostrarse como información, pero no editarse.

| ID | Elemento | Anotación |
|---|---|---|
| `A-11` | Lista elegible | Filtrar origen, inactivos y duplicados |
| `A-12` | Añadir | No guarda la regla; solo actualiza el formulario |

### `S-04` — Detalle de la regla

- Mostrar tipo, origen, prioridad, estado, vigencia y recomendados ordenados.
- Para Upsell, mostrar justificación por recomendado en consulta administrativa.
- Mostrar precio vigente y disponibilidad como datos consultados.
- Acciones `Editar`, `Activar/Desactivar` y `Volver`.

| ID | Elemento | Anotación |
|---|---|---|
| `A-13` | Orden | Representar el orden interno explícitamente |
| `A-14` | Justificación | Visible en detalle administrativo, no obligatoria para canales |
| `A-15` | Disponibilidad | Solo lectura; una falla no equivale a stock cero |
| `A-16` | Nota | Recomendaciones no modifican la compra automáticamente |

### `S-05` — Probar recomendaciones

#### Secuencia

1. El gestor elige un producto consultado.
2. Selecciona `Consultar recomendaciones`.
3. El sistema considera reglas activas, vigentes y coincidentes.
4. Excluye productos inexistentes, inactivos o sin stock.
5. Ordena por prioridad y orden interno.
6. Elimina duplicados conservando la primera aparición.
7. Muestra producto, tipo, precio y disponibilidad, o lista vacía.

| ID | Elemento | Anotación |
|---|---|---|
| `A-17` | Ranking | Es resultado de prioridad y orden; no se edita aquí |
| `A-18` | Tipo | Mantener Cross-sell/Upsell por resultado |
| `A-19` | Disponibilidad | No mostrar productos sin stock |
| `A-20` | Vacío | Lista vacía es un resultado válido, no un error técnico |

### `S-06` — Confirmar cambio de estado

- Explicar participación en nuevas consultas.
- Acciones `Confirmar` y `Cancelar`.
- Conservar configuración y orden al desactivar.
- Gestionar foco como diálogo modal accesible.

| ID | Elemento | Anotación |
|---|---|---|
| `A-21` | Mensaje | Describe el efecto sin eliminar la regla |
| `A-22` | Confirmación | Evita cambios comerciales accidentales |

## 9. Estados de interfaz

| Estado | Representación | Acciones | Recuperación |
|---|---|---|---|
| Listado cargando | Estructura o indicador | Esperar | Reintentar |
| Con datos | Tabla y conteo | Filtrar, crear, ver | N/A |
| Vacío inicial | Mensaje + crear | Crear | Formulario |
| Sin resultados | Mensaje contextual | Cambiar filtros | Listado |
| Formulario inicial | Campos y lista vacía | Completar/cancelar | N/A |
| Upsell incompleto | Errores por justificación | Corregir | Datos conservados |
| Origen/recomendado inválido | Error contextual | Quitar/cambiar | Formulario |
| Guardando | Acción bloqueada | Esperar | Reintentar |
| Éxito | Confirmación | Continuar | N/A |
| Prueba con resultados | Lista ordenada | Revisar/nueva prueba | N/A |
| Prueba vacía | Mensaje de lista vacía | Cambiar producto | Nueva prueba |
| Disponibilidad fallida | Mensaje distinto de sin stock | Reintentar | Nueva consulta |
| Dato desactualizado | Aviso | Recargar y revisar | Revalidar |
| Sin permisos | Mensaje seguro | Volver | Solicitar acceso |
| Sesión expirada | Aviso | Iniciar sesión | Recuperar contexto |

### Reglas para datos remotos

- Refrescar productos, categorías, precios y stock antes de guardar/probar.
- No usar guardado optimista para cambios administrativos.
- Distinguir stock cero, producto inactivo y error de consulta.
- Conservar el formulario ante errores recuperables.

## 10. Comportamiento responsivo

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Completa | Condensada | Patrón móvil global |
| Encabezado | Título + acciones | Ajuste de línea | Acciones apiladas |
| Filtros | Tres columnas | Dos columnas | Una columna |
| Listado | Tabla completa | Scroll contenido | Scroll contenido |
| Formulario | Dos columnas | Ajustable | Una columna |
| Recomendados | Tarjetas con dos columnas internas | Tarjetas | Campos apilados |
| Resultado | Lista ordenada | Lista | Lista |
| Modal | Centrado | Adaptable | Ancho disponible |

Verificar 320 px, zoom 200 %, nombres y justificaciones largas, y teclado móvil.

## 11. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Encabezado principal único y landmarks claros.
- Radios agrupados, campos etiquetados y errores asociados.
- El producto con justificación faltante se identifica por nombre.
- Cambios dinámicos y resultados se anuncian sin interrumpir.
- Orden visual y de lectura coherentes.
- Diálogos contienen foco y lo devuelven al activador.
- Estados no dependen del color; controles táctiles mínimo 44 × 44 px.

## 12. Tono visual y contenido

- Densidad alta en reglas y recomendados, progresiva en formularios.
- Sensación: control editorial, trazabilidad y orden.
- Dominante en formulario: origen y lista ordenada.
- Dominante en prueba: orden final de recomendaciones.
- No mostrar IA, scoring, eventos, endpoints, criterios CA ni anotaciones como UI.

### Microcopy crítica

| Contexto | Texto |
|---|---|
| CTA | `Crear regla` |
| Prioridad | `1 representa la mayor prioridad.` |
| Upsell | `Describe una mejora concreta de su ficha.` |
| Error | `Explica la mejora concreta de [producto].` |
| Vacío | `Ninguna regla activa y vigente produjo productos disponibles.` |
| Desactivar | `Dejará de participar en nuevas consultas.` |

## 13. Restricciones técnicas relevantes

- Prototipo estático; no prescribe implementación ni librería UI.
- Rutas, endpoints y códigos de permiso están pendientes.
- Productos, categoría, estado, precio y stock se validan en servidor.
- El orden final es prioridad de regla ascendente y orden interno ascendente.
- La deduplicación conserva la primera aparición según ese orden.
- La justificación se guarda para consulta administrativa; no es obligatorio
  exponerla a los canales.

## 14. Privacidad, seguridad y acciones sensibles

- Autorizar todas las mutaciones en servidor.
- Confirmar cambios de estado.
- Sanear nombre y justificaciones.
- No exponer detalles internos o datos personales.
- Evitar envíos duplicados e identificadores manipulados.
- No permitir edición de precio o stock desde este flujo.

## 15. Criterios de aceptación del wireframe

- [x] Permite consultar, crear, editar, activar y desactivar reglas.
- [x] Exige nombre, tipo, origen, prioridad, fechas, estado y recomendados.
- [x] Admite origen producto o categoría.
- [x] Bloquea origen como recomendado y duplicados internos.
- [x] Exige justificación por cada recomendado Upsell.
- [x] No infiere superioridad por precio ni verifica su veracidad.
- [x] Permite definir orden interno.
- [x] Prueba reglas activas, vigentes y coincidentes.
- [x] Excluye inactivos y sin stock.
- [x] Ordena y deduplica determinísticamente.
- [x] Representa lista vacía sin agregar productos a la compra.
- [x] Separa documentación y detalles técnicos de la interfaz.
- [x] Es responsivo y consistente con `DESIGN.md`.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01–CA-04 | S-01, S-02, S-03 y permisos |
| CA-05/CA-12 | S-02-U, S-04 y errores por producto |
| CA-06 | Orden en S-02 y detalle S-04 |
| CA-07–CA-10 | S-05, reglas de filtrado, orden y deduplicación |
| CA-11 | S-05-E y nota de no modificación automática |

## 16. Supuestos

| ID | Supuesto | Impacto | Validar |
|---|---|---|---|
| `SUP-01` | Escritorio es el dispositivo principal | Repriorizar experiencia móvil | Sí |
| `SUP-02` | Moneda visible PEN/S/ | Cambiar formato | Sí |
| `SUP-03` | El selector permite búsqueda por nombre/SKU | Cambiar patrón | Sí |
| `SUP-04` | La prueba de recomendaciones es administrativa | Retirar o reubicar S-05 | Sí |

## 17. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea | Estado |
|---|---|---|---|---|
| `Q-01` | ¿Las prioridades deben ser únicas o pueden repetirse? | Producto | Orden definitivo | Abierta |
| `Q-02` | ¿Se permiten órdenes repetidos dentro de una regla? | Producto | Validación final | Abierta |
| `Q-03` | ¿Cuál es la longitud máxima de la justificación? | Producto/Backend | Validación final | Abierta |
| `Q-04` | ¿Se permite cambiar el tipo de una regla existente? | Producto | Edición final | Abierta |
| `Q-05` | ¿La prueba administrativa debe mostrar la justificación Upsell? | Producto | S-05 | Abierta |
| `D-01` | Selección de librería UI y estrategia CSS | Frontend | Implementación | Pendiente |

## 18. Registro de revisiones

| Versión | Fecha | Autor | Cambio | Aprobado por |
|---|---|---|---|---|
| 0.1 | 2026-09-17 | Asistente | Flujo inicial basado en spec, HU, prototipo y `DESIGN.md` | Pendiente |

## 19. Lista de control

- [x] Fuentes, alcance y pantallas identificados.
- [x] Criterios CA-01 a CA-12 cubiertos.
- [x] Reglas de prioridad, orden y deduplicación documentadas.
- [x] Justificación Upsell representada sin verificación automática.
- [x] Datos técnicos y documentación excluidos de la interfaz visible.
- [x] Prototipo HTML disponible.
- [ ] Resolver preguntas abiertas antes de implementación productiva.
