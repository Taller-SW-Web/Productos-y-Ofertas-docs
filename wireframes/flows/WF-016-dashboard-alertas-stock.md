# WF-016 — Dashboard analítico y alertas de stock

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para el dashboard analítico y
las alertas de stock descritas en este archivo.

Antes de diseñar:

1. Consulta ../../specs/SPEC-016-dashboard-alertas-stock.md.
2. Consulta ../../hu/HU-016-dashboard-alertas-stock.md.
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

- La unidad primaria de inventario es el **SKU vendible**. El producto es solo
  un agrupador comercial y no tiene stock independiente.
- Los indicadores mínimos son: total de SKUs vendibles, total de unidades
  disponibles y cantidad de SKUs por estado (Disponible, Stock bajo, Agotado).
- El estado de cada SKU se calcula con las reglas deterministas usando el
  `umbral_stock_bajo` configurado por SKU: `0 < stock <= umbral → Stock bajo`;
  `stock = 0 → Agotado`. No asumas un valor global de umbral.
- Las alertas se generan para SKUs en estado Stock bajo o Agotado.
- El dashboard se actualiza de forma **reactiva** ante el evento
  `inventory.stock.changed`; no usa intervalos fijos ni otro mecanismo en
  tiempo real.
- Después de un consumo, el estado mostrado debe reflejar el estado calculado
  resultante (Disponible → Stock bajo, o Stock bajo → Agotado).
- El **Top 5 es de Productos**: solo considera ventas confirmadas, agrupa las
  unidades de las variantes de un mismo producto y lo ordena de mayor a menor.
  Excluye ajustes, mermas o reservas.
- El período del Top 5 es **seleccionable**; por defecto se usan los
  **últimos 30 días** y el mismo rango se aplica a las ventas confirmadas.
- Filtros permitidos: producto, categoría, marca, SKU y estado de inventario.
- No elijas una librería de UI ni una estrategia CSS.
- Usa datos ficticios y no consumas APIs reales.
- Numera las anotaciones como A-01, A-02, A-03, etc.
- No agregues gráficos de librerías externas; usa barras neutrales en escala de
  grises para la representación de datos.

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

1. Tarjetas de indicadores de inventario (SKUs vendibles, unidades disponibles
   y SKUs por estado).
2. Tabla o listado de variantes/SKUs con su estado y alertas.
3. Alertas de stock bajo y agotado.
4. Top 5 de productos más vendidos con período seleccionable (30 días por
   defecto).
5. Actualización reactiva de indicadores y alertas ante `inventory.stock.changed`.
6. Filtros por producto, categoría, marca, SKU y estado.
7. Estados de carga, vacío, error, permisos y conflicto.
8. Navegación funcional entre los estados simulados.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-016 |
| Nombre del flujo | Dashboard analítico y alertas de stock |
| Versión | 0.1 |
| Estado | Borrador |
| Responsable | Miguel Ángel Taco Zavala |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-17 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | SPEC-016-dashboard-alertas-stock.md, secciones 1–5 | Indicadores, alertas, visualización, Top 5 y actualización |
| Historia de usuario | HU-016-dashboard-alertas-stock.md, CA-01 a CA-09 | Criterios y escenarios |
| Diseño | DESIGN.md | Lenguaje visual monocromático de baja fidelidad |
| Backlog | No proporcionado | No se asignan IDs de backlog |

### Funcionalidades incluidas

- Mostrar indicadores generales del inventario a nivel de SKU vendible.
- Mostrar cantidad de variantes por estado (Disponible, Stock bajo, Agotado).
- Identificar SKUs con stock bajo según su umbral configurado por variante.
- Mostrar alertas para SKUs en Stock bajo o Agotado.
- Mostrar el Top 5 de productos más vendidos del período, con período
  seleccionable (30 días por defecto).
- Filtrar por producto, categoría, marca, SKU y estado de inventario.
- Actualizar indicadores y alertas de forma reactiva ante
  `inventory.stock.changed`.
- Agrupar la información por producto cuando se requiera una vista comercial.

### Fuera de alcance

- Registro o edición de stock, consumos y ajustes: WF-015 (Gestión de
  inventario).
- Operaciones masivas de inventario: WF-001.
- Generación de SKUs y variantes: Gestión de variantes/SKUs.
- Precios: WF-013, WF-014.
- Venta cruzada, ofertas y promociones: WF-005, WF-006, WF-007.
- Definición de categorías, marcas y carpeta SEO: WF-008 a WF-012.
- El cálculo del Top 5 usa ventas confirmadas que provienen de Ventas/Postventa;
  el dashboard solo las consume para su análisis.

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Responsable de inventario del marketplace |
| Rol en el sistema | Gestor autenticado con permisos de consulta analítica |
| Nivel técnico | Operativo básico/intermedio |
| Contexto de uso | Monitoreo periódico del estado del inventario |
| Necesidad principal | Detectar variantes con bajo stock o agotadas y analizar el Top 5 |
| Permisos relevantes | Consultar el dashboard y sus alertas; códigos pendientes |
| Dispositivo principal | Escritorio como hipótesis; consulta adaptada a tablet/móvil |

## 4. Objetivo del flujo

El responsable de inventario debe poder visualizar indicadores consolidados,
niveles de stock y alertas sobre el inventario, así como el Top 5 de productos
más vendidos del período, para identificar oportunamente las variantes que
requieren atención.

### Resultado exitoso

La pantalla muestra los indicadores de inventario, el listado de SKUs con su
estado y alertas calculadas según el umbral configurado, y el Top 5 de productos
más vendidos del período seleccionado. Ante cada `inventory.stock.changed`, los
indicadores y alertas se recalculan con el saldo y estado vigentes.

### Indicadores de finalización

- Indicadores, alertas y Top 5 visibles y coherentes con los datos vigentes.
- Cambio de stock notificado reflejado en los valores del dashboard.
- Período del Top 5 aplicado y visible.

## 5. Precondiciones y disparador

### Precondiciones

- El usuario tiene una sesión válida y permiso de consulta.
- Existen SKUs vendibles con stock controlado (WF-015).
- Los `umbral_stock_bajo` están configurados por SKU.

### Puntos de entrada

- Ruta propuesta: /inventario/dashboard.
- Entrada propuesta: opción Dashboard dentro del módulo Productos y ofertas.
- Filtros y período del Top 5: controles sobre la propia pantalla.

Las rutas y ubicación exactas son propuestas de wireframe y deben confirmarse.

### Salidas del flujo

| Resultado | Destino o comportamiento |
|---|---|
| Consulta exitosa | Panel con indicadores, alertas y Top 5 |
| Filtro aplicado | Panel recalculado según el filtro |
| Período cambiado | Top 5 recalculado con el nuevo rango |
| Evento de stock | Panel recalculado de forma reactiva |
| Error recuperable | Permanece en la pantalla y conserva los filtros |
| Sin permisos | Bloquea la consulta y ofrece retorno seguro |

## 6. Secuencia principal

1. El responsable entra al dashboard.
2. El sistema carga los indicadores, alertas y Top 5.
3. El responsable aplica filtros, si desea, y ajusta el período del Top 5.
4. El sistema recalcula las secciones según filtros y período.
5. Ante un `inventory.stock.changed`, el sistema actualiza indicadores y
   alertas de forma reactiva.

### Flujos alternativos

| ID | Condición | Comportamiento esperado | Retorno |
|---|---|---|---|
| ALT-01 | Sin SKUs con inventario | Estado vacío con orientación | Panel con mensaje |
| ALT-02 | Sin ventas confirmadas en el período | Top 5 vacío con mensaje | Sección Top 5 |
| ALT-03 | Filtro sin resultados | Mensaje contextual y opción de limpiar | Panel filtrado |
| ALT-04 | Error al cargar indicadores o alertas | Error con reintento | Estado de carga |
| ALT-05 | Error al cargar el Top 5 | Error con reintento | Sección Top 5 |
| ALT-06 | Usuario sin permiso | Explicación segura | Estado global |
| ALT-07 | Evento `inventory.stock.changed` | Recalcular indicadores y alertas | Panel actualizado |
| ALT-08 | Sesión expirada | Aviso de autenticación | Retorno al flujo |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Ruta/presentación | Obligatoria |
|---|---|---|---|---|
| S-01 | Dashboard analítico y alertas | Panel con indicadores, alertas y Top 5 | /inventario/dashboard propuesta | Sí |
| S-01-E | Vacío o error del panel | Diferenciar ausencia de datos de fallo de carga | Variante de S-01 | Sí |
| S-01-T | Error del Top 5 | Recuperar la sección de productos más vendidos | Variante de S-01 | No |

## 8. Mapa de navegación

~~~mermaid
flowchart TD
    A["S-01 Dashboard"] --> F["Filtros"]
    A --> P["Selector de período (Top 5)"]
    A --> E["Evento inventory.stock.changed"]
    E --> A
    A --> V["S-01-E Vacío / error"]
~~~

## 9. Especificación por pantalla

### S-01 — Dashboard analítico y alertas

#### Propósito

Mostrar una visión general del inventario y facilitar la identificación de
variantes que requieren atención.

#### Jerarquía de contenido

1. Título Dashboard de inventario.
2. Tarjetas de indicadores.
3. Alertas de stock (Stock bajo y Agotado).
4. Top 5 de productos más vendidos del período.

#### Regiones y componentes

| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + resumen | Dashboard de inventario | Información general |
| Filtros | Selectores | Producto, categoría, marca, SKU, estado | Recalcula el panel |
| Indicadores | Tarjetas | SKUs vendibles, unidades disponibles, SKUs por estado | Valores vigentes |
| Alertas | Listado/tabla | SKUs con Stock bajo o Agotado | Se pueden filtrar |
| Top 5 | Lista con selector de período | Productos más vendidos | Período seleccionable, 30 días por defecto |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Limpiar filtros | Limpiar | Filtros activos | Resetea el panel |
| Secundaria | Cambiar período | Selector de fechas | Siempre | Recalcula el Top 5 |
| Secundaria | Actualizar | Actualizar (simulado) | Solo prototipo | Emite un `inventory.stock.changed` de prueba |

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Total SKUs vendibles | Inventario | Entero | Alta | 0 o No disponible |
| Total unidades disponibles | Inventario | Entero | Alta | No disponible |
| SKUs disponibles | Inventario | Entero | Alta | 0 |
| SKUs con stock bajo | Inventario | Entero | Alta | 0 |
| SKUs agotados | Inventario | Entero | Alta | 0 |
| Variantes con alerta | Inventario | Listado | Alta | Vacío |
| Top 5 productos | Ventas confirmadas | Listado | Media | Vacío o error |

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-01 | Indicadores | Unidad primaria: SKU vendible; el producto es agrupador comercial |
| A-02 | Estado | Calculado con stock y `umbral_stock_bajo` por SKU |
| A-03 | Alertas | Solo para estados Stock bajo y Agotado |
| A-04 | Reactividad | Se recalcula con `inventory.stock.changed`, sin intervalo fijo |
| A-05 | Top 5 | De productos, solo ventas confirmadas, agrupando variantes |
| A-06 | Período | Seleccionable; 30 días por defecto; mismo rango para las ventas |
| A-07 | Filtros | Por producto, categoría, marca, SKU y estado |
| A-08 | Sin inventario | La ausencia de SKUs no debe presentarse como error |

### S-01-E — Vacío o error del panel

- Vacío: Aún no hay variantes con inventario. El dashboard mostrará indicadores
  en cero y orientará a cargar variantes/SKUs.
- Error: No pudimos cargar el dashboard. Acción: Reintentar.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-09 | Vacío | Depende de Gestión de variantes e Inventario |
| A-10 | Error | Recuperación sin detalles internos |

### S-01-T — Error del Top 5

- Mensaje: No pudimos cargar los productos más vendidos.
- Acción: Reintentar. No bloquea el resto del panel.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-11 | Aislamiento | La falla del Top 5 no deshabilita indicadores ni alertas |

## 10. Estados de interfaz

| Estado | Aplica | Representación | Acciones | Recuperación |
|---|---|---|---|---|
| Cargando inicial | Sí | Skeleton/indicador | Esperar | Reintento si falla |
| Con datos | Sí | Panel normal | Filtrar, cambiar período | N/A |
| Vacío inicial | Sí | Indicadores en cero + orientación | Reintentar/consultar | Crear/agregar |
| Sin ventas en el período | Sí | Top 5 vacío con mensaje | Cambiar período | N/A |
| Sin resultados por filtros | Sí | Mensaje contextual | Limpiar filtros | N/A |
| Error recuperable | Sí | Mensaje | Reintentar | Acción |
| Error del Top 5 | Sí | Mensaje aislado | Reintentar | Acción |
| Actualización reactiva | Sí | Valores recalculados | N/A | N/A |
| Sin permisos | Sí | Explicación segura | Volver/solicitar acceso | Destino |
| Sesión expirada | Sí | Aviso | Iniciar sesión | Retorno al flujo |

### Reglas para datos remotos

- Refrescar indicadores y alertas al recibir `inventory.stock.changed`.
- El Top 5 se recalcula al cambiar el período o aplicarse filtros.
- No aplicar actualización optimista; el panel refleja estados confirmados.
- Distinguir ausencia de SKUs de fallo de carga.

## 11. Comportamiento responsivo

DESIGN.md define 12 columnas en escritorio y 4 en móvil. El prototipo demuestra
adaptación sin fijar breakpoints definitivos.

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Completa | Condensada | Patrón global móvil |
| Indicadores | Tarjetas en fila | 2 columnas | Apiladas en una columna |
| Filtros | Selectores en línea | Apilados | Apilados |
| Alertas | Tabla | Tabla reducida | Tarjetas |
| Top 5 | Lista numerada | Lista numerada | Lista apilada |
| Anotaciones | Panel lateral | Debajo | Lista/colapsable |
| Contenido omitido | Ninguno | Ninguno | Ninguno; reorganizar |

### Condiciones críticas

- Verificar 320 px sin desplazamiento horizontal.
- Los SKU largos deben envolver o truncarse con acceso al valor.
- Los selectores y el selector de período deben funcionar con zoom de 200%.

## 12. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Encabezado principal único por pantalla.
- Los estados (Disponible, Stock bajo, Agotado) se expresan con texto e icono,
  no solo con color.
- Los gráficos son barras neutrales con valor textual asociado.
- Cambios dinámicos (evento de stock) se anuncian a usuarios de lectores de
  pantalla.
- Anotaciones excluidas del árbol accesible.
- Acciones móviles de 44 por 44 px.

## 13. Tono visual y contenido

Aplicar DESIGN.md como única fuente de representación visual.

### Consideraciones específicas

- Densidad: media.
- Sensación buscada: monitoreo claro y oportuno del inventario.
- Elemento dominante en S-01: indicadores y alertas.
- Elemento dominante del Top 5: la lista numerada con su período.

### Microcopy crítica

| Contexto | Texto propuesto | Observación |
|---|---|---|
| Acción principal | Actualizar | Solo simulación reactiva |
| Alertas | Este SKU requiere atención por su nivel de stock. | CA-04 |
| Top 5 | Productos más vendidos en el período seleccionado. | CA-05 |
| Período | Últimos 30 días (por defecto). | CA-09 |
| Vacío | Aún no hay variantes con inventario. | Orientación |
| Error | No pudimos cargar el dashboard. | Reintento seguro |

## 14. Restricciones técnicas relevantes

- Aplicación objetivo: React, TypeScript y Vite.
- Navegación: React Router; rutas exactas pendientes.
- Estado remoto: TanStack Query.
- Formularios: React Hook Form y Zod (no aplica formularios críticos).
- Contratos HTTP: OpenAPI/Swagger.
- Eventos: AsyncAPI (`inventory.stock.changed`, ventas confirmadas de
  Ventas/Postventa).
- La librería de componentes y estrategia CSS están pendientes.
- El prototipo es HTML/CSS/JS estático.

### Dependencias o contratos

| Tipo | Operación o referencia | Impacto visible |
|---|---|---|
| HTTP | Indicadores y alertas (inventario); pendiente | S-01 |
| HTTP | Top 5 por período (ventas confirmadas); pendiente | S-01 |
| Evento | `inventory.stock.changed` (inventario) | Recalcular indicadores y alertas |
| Permiso | Consultar dashboard; código pendiente | Contenido condicionado |

## 15. Privacidad, seguridad y acciones sensibles

- El dashboard es de consulta; las escrituras ocurren en otros módulos.
- No exponer en mensajes de error detalle de contratos o servicios internos.
- No permitir que los filtros revelen datos de otros clientes o canales.
- Las ventas del Top 5 provienen de ventas confirmadas autorizadas.
- El documento no exige reautenticación para el prototipo.

## 16. Criterios de aceptación del wireframe

- [ ] Muestra los indicadores mínimos (SKUs vendibles, unidades disponibles y
      SKUs por estado).
- [ ] Identifica SKUs con stock bajo según el umbral configurado por SKU.
- [ ] Muestra alertas para SKUs en Stock bajo o Agotado.
- [ ] Muestra el Top 5 de productos con unidades vendidas de ventas confirmadas.
- [ ] El período del Top 5 es seleccionable y usa 30 días por defecto.
- [ ] Los indicadores y alertas se actualizan con `inventory.stock.changed`.
- [ ] Expone filtros por producto, categoría, marca, SKU y estado.
- [ ] Incluye carga, vacío, error, permisos y sesión.
- [ ] Funciona con teclado y no depende del color.
- [ ] Funciona con HTML/CSS/JS estáticos.
- [ ] Es consistente con DESIGN.md.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01 | S-01, sección de indicadores |
| CA-02 | S-01, tarjetas de indicadores |
| CA-03 | S-01, alertas (A-02, A-03) |
| CA-04 | S-01, sección de alertas |
| CA-05 | S-01, Top 5 (A-05, A-06) |
| CA-06 | S-01, estados calculados |
| CA-07 | S-01, A-04 y ALT-07 |
| CA-08 | S-01, transición de estados tras consumo |
| CA-09 | S-01, selector de período |

## 17. Supuestos

| ID | Supuesto | Motivo | Impacto si es incorrecto | Validar |
|---|---|---|---|---|
| SUP-01 | WF-016 es el ID asignado en INDEX.md | Asignación de la rama `taco` | Renombrar archivo/referencias | Sí |
| SUP-02 | La ruta será /inventario/dashboard | No se entregó mapa de navegación | Cambiar rutas/entrada | Sí |
| SUP-03 | Escritorio es el dispositivo principal | Gestión administrativa | Cambiar prioridad responsive | Sí |
| SUP-04 | El Top 5 obtiene sus ventas por integración con Ventas/Postventa | Lo indica la spec | Ajustar el origen del dato | Sí |
| SUP-05 | Los filtros y períodos se comportan como selectores de formulario | Regla consolidada de filtros y CA-09 | Ajustar el control | Sí |

## 18. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea wireframe | Estado |
|---|---|---|---|---|
| Q-01 | ¿El período del Top 5 usa presets o un selector de rango libre? | Producto/UX | No para wireframe base | Abierta |
| Q-02 | ¿La vista comercial por producto es una agrupación alterna o la predeterminada? | Producto | No para wireframe base | Abierta |
| Q-03 | ¿Los filtros por categoría y marca afectan también al Top 5? | Producto | No para wireframe base | Abierta |
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
- [x] El Top 5, los filtros y la reactividad están documentados.
- [x] Los supuestos y preguntas están registrados.
- [x] El formato HTML está definido.
- [ ] Confirmar el ID WF-016 contra INDEX.md.
- [ ] Resolver Q-01 y Q-02 antes del diseño definitivo.
- [ ] Confirmar rutas y permisos antes de implementar el frontend.