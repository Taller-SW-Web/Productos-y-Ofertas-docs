# WF-002 — Gestión de combos de productos

> **Fuente normativa de esta revisión:** `specs_consolidado_final.md` y `hu_consolidado_final.md` (18-09-2026). Los nombres/eventos de Ventas y Postventa son contratos **provisionales no homologados**; el prototipo no debe simular pagos realizados ni confirmaciones externas como si estuvieran implementadas. Las anotaciones, supuestos, preguntas y referencias técnicas permanecen en este documento y no se muestran como elementos de la interfaz simulada.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la gestión de combos de
productos descrita en este archivo.

Antes de diseñar:

1. Consulta ../../specs/SPEC-002-gestion-combos-productos.md.
2. Consulta ../../hu/HU-002-gestion-combos-productos.md.
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
- Solo permite componentes que sean SKU/variantes o productos simples.
- Nunca permita seleccionar un combo como componente de otro combo.
- Exige al menos dos SKUs vendibles distintos, según el Spec y la HU; no hay decisión pendiente sobre este límite.
- La cantidad de cada componente debe ser un entero positivo.
- El precio del combo debe ser mayor que cero y estrictamente menor tanto que la suma
  de los precios regulares vigentes de sus SKUs como que la suma de sus precios públicos vigentes
  (considerando precios de oferta propios de Pricing cuando existan) multiplicados por sus cantidades.
- No permitas guardar mientras exista un error bloqueante.
- No conviertas los eventos order.confirmed, order.cancelled, order.returned o
  catalog.sku.deactivated en acciones manuales de esta interfaz.
- No muestres controles de stock editables dentro del combo.
- No elijas una librería de UI ni una estrategia CSS.
- Usa datos ficticios y no consumas APIs reales.
- Numera las anotaciones como A-01, A-02, A-03, etc.
- Mantén visibles las relaciones entre componente, cantidad, precios vigentes (regular y oferta si existe) y
  disponibilidad proporcional.

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

1. Listado/consulta de combos.
2. Creación y edición del combo.
3. Selección de SKU/variantes sin anidamiento.
4. Configuración de cantidades.
5. Cálculo y validación visible del precio.
6. Disponibilidad calculada del combo, informativa y sujeta a revalidación al confirmar consumo.
7. Desactivación manual con confirmación.
8. Variante de desactivación automática por componente inactivo.
9. Estados de carga, vacío, error, permisos y conflicto.
10. Navegación funcional entre los estados simulados.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-002 |
| Nombre del flujo | Gestión de combos de productos |
| Versión | 0.1 |
| Estado | Borrador |
| Responsable | Por asignar |
| Fecha | 2026-09-16 |
| Última actualización | 2026-09-18 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | SPEC-002-gestion-combos-productos.md, secciones 1–6 | Alcance, reglas, eventos, disponibilidad y restricciones |
| Historia de usuario | HU-002-gestion-combos-productos.md, CA-01 a CA-10 | Permisos, datos obligatorios y escenarios |
| Diseño | DESIGN.md | Lenguaje visual monocromático de baja fidelidad |
| Backlog | No proporcionado | No se asignan IDs de backlog |

### Funcionalidades incluidas

- Consultar combos y su estado.
- Crear un combo.
- Editar nombre, descripción, componentes, cantidades y precio.
- Añadir SKU/variantes o productos simples como componentes.
- Retirar componentes antes de guardar.
- Impedir el anidamiento de combos.
- Calcular la suma de precios regulares y la suma de precios públicos vigentes de componentes.
- Validar el precio promocional frente a ambas referencias.
- Mostrar la disponibilidad proporcional calculada.
- Desactivar manualmente un combo.
- Mostrar la desactivación automática causada por un componente inactivo.
- Comunicar que un SKU agotado deja el combo sin disponibilidad.

### Fuera de alcance

- Facturación, cobro o administración del pedido.
- Despacho y costos logísticos del paquete.
- Decidir políticas comerciales de devolución total o parcial (responsabilidad de Ventas y Postventa; Inventario solo procesa las líneas devueltas que el contrato comunique).
- Edición manual de stock desde el combo.
- Activación/desactivación manual de SKU individuales.
- Ejecución manual de compensaciones order.cancelled u order.returned.
- Combos dentro de combos.
- Eliminación permanente del combo.
- Reactivación del combo, porque las fuentes no definen sus reglas.
- Historial de movimientos de inventario o auditoría detallada del combo.

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Gestor comercial responsable de productos y promociones |
| Rol en el sistema | Gestor comercial autorizado |
| Nivel técnico | No especificado; diseñar para nivel operativo básico/intermedio |
| Contexto de uso | Configuración periódica de ofertas con productos complementarios |
| Necesidad principal | Crear una oferta agrupada válida sin comprometer precio ni stock |
| Permisos relevantes | Consultar, crear, editar y desactivar combos; códigos exactos pendientes |
| Dispositivo principal | Escritorio como hipótesis; consulta y revisión deben adaptarse a tablet/móvil |

## 4. Objetivo del flujo

El gestor comercial debe poder crear, consultar, modificar y desactivar combos
compuestos por al menos dos SKUs vendibles distintos, asignar
cantidades y un precio promocional válido, y comprender su disponibilidad
calculada.

### Resultado exitoso

El combo queda registrado con sus componentes directos y cantidades. El precio
es mayor que cero y menor tanto que la suma de precios regulares como que la suma de precios
públicos vigentes de sus componentes. En creación, el
combo queda activo para la venta según la spec. La interfaz confirma el
resultado y presenta la disponibilidad calculada.

### Indicadores de finalización

- Creación: mensaje Combo creado y acceso al detalle.
- Edición: mensaje Cambios guardados con datos recalculados.
- Desactivación manual: estado Inactivo confirmado.
- Desactivación automática: estado Inactivo por componente y alerta de revisión.

El patrón exacto de notificación debe alinearse con el sistema global.

## 5. Precondiciones y disparador

### Precondiciones

- El usuario tiene una sesión válida.
- El usuario posee el permiso requerido para la acción.
- Existen productos simples o SKU/variantes activos que puedan seleccionarse.
- Los servicios de catálogo, precios e inventario proporcionan estado, precio
  vigente y stock de los componentes.

### Puntos de entrada

- Ruta propuesta del listado: /productos/combos.
- Entrada propuesta: opción Combos dentro del módulo Productos y ofertas.
- Crear: acción Crear combo desde el listado.
- Consultar/editar: acción sobre una fila o tarjeta de combo.
- Revisar desactivación automática: notificación que dirige al detalle.

Las rutas y ubicación exactas son propuestas de wireframe y deben confirmarse.

### Salidas del flujo

| Resultado | Destino o comportamiento |
|---|---|
| Creación exitosa | S-05 con el combo activo |
| Edición exitosa | S-05 con datos actualizados |
| Cancelación sin cambios | Regresa a S-01 o S-05 |
| Cancelación con cambios | Comportamiento pendiente; Q-08 |
| Desactivación manual | S-05-I con estado Inactivo |
| Desactivación automática | S-05-A con alerta y componente causante |
| Error recuperable | Permanece en la pantalla y conserva los datos |
| Sin permisos | Bloquea la acción y ofrece retorno seguro |

## 6. Secuencia principal

### Flujo A — Consultar combos

1. El gestor entra a Gestión de combos.
2. El sistema carga los combos disponibles para su administración.
3. La lista muestra nombre, precio, número de componentes, disponibilidad y
   estado.
4. El gestor abre el detalle de un combo.
5. El sistema muestra composición, cálculo de precio, disponibilidad y estado.

### Flujo B — Crear combo

1. Desde S-01, el gestor selecciona Crear combo.
2. En S-02 ingresa nombre y descripción.
3. Selecciona Añadir componentes.
4. En S-03 busca y selecciona productos simples o SKU/variantes elegibles.
5. El sistema impide incluir combos.
6. El gestor define una cantidad entera positiva para cada componente.
7. Al existir al menos dos SKUs vendibles distintos, el sistema muestra la suma de precios
   regulares y la suma de precios públicos vigentes, y calcula la disponibilidad proporcional.
8. El gestor ingresa un precio de combo mayor que cero.
9. El sistema valida que el precio sea estrictamente menor que la suma de precios regulares y menor que la suma de precios públicos vigentes.
10. El gestor selecciona Crear combo.
11. El sistema revalida reglas de creación y precios con la proyección conocida; la confirmación de venta se valida exclusivamente en Inventario.
12. El combo se registra activo y se muestra S-05.

### Flujo C — Editar combo

1. El gestor abre un combo desde S-01 o S-05.
2. Selecciona Editar.
3. El sistema carga datos, componentes, precios y disponibilidad vigentes.
4. El gestor modifica campos, cantidades o composición.
5. El sistema recalcula suma, precio permitido y disponibilidad.
6. El gestor guarda.
7. El sistema vuelve a validar datos vigentes y confirma la edición.

### Flujo D — Desactivar combo

1. El gestor selecciona Desactivar combo desde S-01 o S-05.
2. S-04 explica que dejará de estar disponible en los canales de venta.
3. El gestor confirma.
4. El sistema marca el combo como inactivo.
5. S-05-I confirma la desactivación.

### Flujo E — Desactivación automática

1. Un SKU componente se desactiva en Catálogo.
2. El sistema recibe catalog.sku.deactivated.
3. El combo se inhabilita y oculta en los canales de venta.
4. El gestor recibe una notificación.
5. La notificación abre S-05-A con el componente causante.

### Flujos alternativos

| ID | Condición | Comportamiento esperado | Retorno |
|---|---|---|---|
| ALT-01 | Menos de dos SKUs distintos | Mostrar error y bloquear guardado | S-02 |
| ALT-02 | Cantidad vacía, cero, negativa o decimal | Error en la fila y bloqueo de guardado | S-02 |
| ALT-03 | Intento de añadir otro combo | Impedir selección y explicar prohibición de anidamiento | S-03 |
| ALT-04 | Precio menor o igual a cero | Error en precio y bloqueo de guardado | S-02 |
| ALT-05 | Precio igual o superior a la suma | Error con límite vigente y bloqueo de guardado | S-02 |
| ALT-06 | Un componente queda agotado | Disponibilidad calculada pasa a 0; el combo se muestra agotado | S-05 |
| ALT-07 | Precio de un componente cambia antes de guardar | Recalcular y solicitar corrección si el precio deja de ser válido | S-02-C |
| ALT-08 | Proyección de stock o estado cambia antes de guardar | Revalidar estado, refrescar estimación y evitar presentar saldos desactualizados | S-02-C |
| ALT-09 | Un componente se desactiva | Inhabilitar combo y notificar | S-05-A |
| ALT-10 | Error al guardar | Conservar datos y mostrar recuperación | S-02-E |
| ALT-11 | Error al cargar disponibilidad | Mostrar estado no disponible sin asumir stock 0 | S-05-E |
| ALT-12 | Usuario sin permiso | Ocultar o deshabilitar acción y explicar acceso insuficiente | Estado global |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Ruta/presentación | Obligatoria |
|---|---|---|---|---|
| S-01 | Gestión de combos | Consultar y entrar a crear, ver, editar o desactivar | /productos/combos propuesta | Sí |
| S-01-E | Error o vacío del listado | Diferenciar ausencia de combos de fallo de carga | Variante de S-01 | Sí |
| S-02 | Crear/editar combo | Capturar datos, componentes, cantidades y precio | Ruta propuesta /productos/combos/nuevo o /:id/editar | Sí |
| S-02-C | Conflicto de datos vigentes | Resolver cambios de precio, stock o estado antes de guardar | Variante de S-02 | Sí |
| S-02-E | Error de guardado | Conservar datos y permitir recuperación | Variante de S-02 | Sí |
| S-03 | Seleccionar componentes | Elegir SKU/variantes o productos simples elegibles | Diálogo o panel | Sí |
| S-04 | Confirmar desactivación | Evitar desactivación accidental | Diálogo modal | Sí |
| S-05 | Detalle del combo | Consultar composición, precio, disponibilidad y estado | /productos/combos/:id propuesta | Sí |
| S-05-I | Combo inactivo manualmente | Confirmar que ya no se vende | Variante de S-05 | Sí |
| S-05-A | Combo inactivo automáticamente | Identificar componente causante y pedir revisión | Variante de S-05 | Sí |
| S-05-E | Disponibilidad no consultable | No confundir error técnico con stock 0 | Variante de S-05 | Sí |

## 8. Mapa de navegación

~~~mermaid
flowchart TD
    A["S-01 Gestión"] --> B["S-02 Crear o editar"]
    B --> C["S-03 Componentes"]
    B --> D["S-05 Detalle"]
    A --> D
    D --> E["S-04 Desactivar"]
    E --> F["S-05-I Inactivo"]
    D --> G["S-05-A Baja automática"]
~~~

## 9. Especificación por pantalla

### S-01 — Gestión de combos

#### Propósito

Dar acceso a consulta, creación, edición y desactivación según permisos.

#### Jerarquía de contenido

1. Título Gestión de combos.
2. Acción Crear combo.
3. Listado de combos.
4. Estado de cada combo y disponibilidad actual.

#### Regiones y componentes

| Región | Componente neutral | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + acción | Gestión de combos; Crear combo | La acción depende de permiso |
| Listado | Tabla en escritorio; tarjetas adaptables | Nombre, precio, componentes, disponibilidad, estado | Cada elemento abre detalle |
| Fila/tarjeta | Acciones contextuales | Ver, Editar, Desactivar | No mostrar Eliminar |
| Estado | Etiqueta textual | Activo, Inactivo, Agotado o revisión requerida | No depender del color |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Crear | Crear combo | Permiso de creación | Abre S-02 |
| Secundaria | Consultar | Ver detalle | Permiso de consulta | Abre S-05 |
| Secundaria | Modificar | Editar | Permiso de edición | Abre S-02 |
| Destructiva reversible | Desactivar | Desactivar | Combo activo y permiso | Abre S-04 |

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Nombre | Combo | Texto | Alta | No debe faltar |
| Precio del combo | Pricing/Combo | Moneda | Alta | Mostrar no disponible |
| Componentes | Combo | Cantidad de componentes | Media | Mostrar error de integridad |
| Disponibilidad | Proyección eventual | Estimación o No verificable | Alta | No asumir cero |
| Estado | Combo/catálogo | Texto | Alta | Mostrar No disponible |

No agregar búsqueda, filtros, ordenamiento o paginación al prototipo hasta que
la necesidad y reglas estén confirmadas.

#### Navegación y foco

- Foco inicial: título o primera acción según convención global.
- El orden recorre Crear combo, elementos del listado y sus acciones.
- Las acciones contextuales deben ser utilizables por teclado.
- El foco no debe saltar al actualizar disponibilidad.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-01 | Crear combo | Visible solo con permiso de creación |
| A-02 | Disponibilidad | Estimación desde proyección de stock; mostrar fecha de cálculo y estado, nunca prometer disponibilidad garantizada |
| A-03 | Estado | Activo/Inactivo/Agotado debe expresarse con texto |
| A-04 | Acciones | No incluir eliminación permanente ni reactivación |
| A-05 | Componente total | Representa filas de componentes, no suma de unidades |

### S-01-E — Vacío o error de listado

#### Estado vacío

- Mensaje: Aún no hay combos.
- Acción: Crear primer combo, si el usuario tiene permiso.
- No presentar la ausencia de datos como error.

#### Error de carga

- Mensaje: No pudimos cargar los combos.
- Acción: Reintentar.
- No mostrar datos obsoletos como vigentes sin identificarlos.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-06 | Estado vacío | Ofrece creación solo a usuarios autorizados |
| A-07 | Error | Incluye recuperación y no revela detalles internos |

### S-02 — Crear o editar combo

#### Propósito

Capturar los datos obligatorios, configurar componentes directos y validar
precio y disponibilidad antes de guardar.

#### Jerarquía de contenido

1. Datos generales: nombre y descripción.
2. Componentes y cantidades.
3. Resumen de precios regulares y precios públicos vigentes de componentes.
4. Precio del combo y validación.
5. Disponibilidad calculada.
6. Acción Crear combo o Guardar cambios.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Datos generales | Campos | Nombre, descripción | Ambos obligatorios según CA-02 |
| Componentes | Tabla/lista editable | SKU, producto/variante, precios vigentes (regular y oferta si existe), stock, cantidad, disponibilidad proporcional | Mínimo dos SKUs distintos |
| Selección | Botón | Añadir componentes | Abre S-03 |
| Precio | Resumen + campo | Suma regular, suma pública vigente y precio del combo | Validación bloqueante |
| Disponibilidad | Resultado calculado | Unidades disponibles del combo y componente limitante | Solo lectura |
| Acciones | Botones | Crear/Guardar; Cancelar | Guardar condicionado |

#### Campos generales

| Campo | Tipo | Obligatorio | Validación confirmada | Mensaje propuesto |
|---|---|---|---|---|
| Nombre | Texto | Sí | Contenido requerido; longitud pendiente | Ingresa un nombre para el combo. |
| Descripción | Texto multilínea | Sí | Contenido requerido; longitud pendiente | Ingresa una descripción. |
| Precio del combo | Moneda/decimal | Sí | Mayor que 0 y menor que suma regular y suma pública vigente | El precio debe ser mayor que cero y menor que la suma de los componentes. |

#### Tabla de componentes

| Columna | Contenido | Editable | Regla |
|---|---|---|---|
| SKU | Código del SKU o producto simple | No | Debe ser componente directo |
| Producto/variante | Nombre descriptivo | No | No puede ser combo |
| Precios vigentes | Precio regular y precio oferta si existe por SKU | No | Participan en las sumas multiplicados por cantidad |
| Stock | Último saldo conocido en proyección y fecha de cálculo | No | Dato informativo, no reserva ni garantía |
| Cantidad | Unidades requeridas por combo | Sí | Entero mayor que 0 |
| Aporte de disponibilidad | floor(stock/cantidad) | No | Determina el mínimo |
| Acción | Quitar | Sí | No permitir guardar con menos de dos SKUs distintos |

La suma regular se calcula como `SUM(precio_regular * cantidad)` y la suma pública vigente como `SUM(min(precio_regular, precio_oferta) * cantidad)`.
La disponibilidad del combo es el mínimo entero de stock dividido entre la
cantidad requerida de cada componente.

#### Ejemplo obligatorio para el prototipo

| Componente | Stock | Cantidad | Disponibilidad proporcional |
|---|---:|---:|---:|
| Camiseta Talla M — SKU-CAM-M | 10 | 1 | 10 |
| Medias Blancas — SKU-MED-W | 15 | 2 | 7 |

Resultado: 7 combos disponibles, limitados por SKU-MED-W.

#### Validaciones y guardado

- Validar campos requeridos al salir y al intentar guardar.
- Recalcular sumas y disponibilidad al añadir/quitar un componente o cambiar
  una cantidad.
- Validar el precio después de cada cambio relevante.
- Revalidar precio y estado en servidor al guardar; mostrar stock proyectado como información, sin garantía de consumo.
- Evitar envíos duplicados mientras la solicitud está en curso.
- Conservar datos después de un error recuperable.
- Llevar el foco al primer error o al resumen de errores.

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Crear | Crear combo | Formulario nuevo válido | Guarda y abre S-05 |
| Primaria | Actualizar | Guardar cambios | Edición válida | Guarda y abre/actualiza S-05 |
| Secundaria | Seleccionar | Añadir componentes | Permiso de edición | Abre S-03 |
| Secundaria | Cancelar | Cancelar | Siempre | Regresa según origen; Q-08 si hay cambios |

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-08 | Nombre y descripción | Ambos son obligatorios; límites pendientes |
| A-09 | Añadir componentes | Solo SKU/variantes o productos simples |
| A-10 | Cantidad | Entero positivo por componente |
| A-11 | Precios vigentes | Usar precios vigentes (regular y oferta si existe) del SKU y multiplicarlos por cantidad |
| A-12 | Sumas de referencia | Se recalculan ante cambios de componentes, cantidades o precios |
| A-13 | Precio del combo | Debe cumplir 0 < precio_combo < suma_regular y precio_combo < suma_publica_vigente |
| A-14 | Disponibilidad | min(floor(stock_i/cantidad_i)) |
| A-15 | Componente limitante | Identificar qué SKU determina la disponibilidad |
| A-16 | Guardar | Bloqueado con menos de dos SKUs distintos o cualquier error |

### S-02-C — Conflicto con datos vigentes

#### Propósito

Evitar que el gestor guarde con precios, stock o estado obsoletos.

#### Comportamiento

- Informar qué componentes cambiaron desde la última consulta.
- Actualizar los valores vigentes.
- Recalcular suma, validación de precio y disponibilidad.
- Si un SKU fue desactivado, impedir el guardado hasta retirarlo o resolver la
  regla correspondiente.
- No sobrescribir silenciosamente los datos.
- Conservar nombre, descripción, cantidades y precio ingresados cuando sigan
  siendo válidos.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-17 | Aviso de actualización | Explica que cambiaron datos de componentes |
| A-18 | Precio inválido posterior | Solicita un nuevo precio si dejó de representar descuento |
| A-19 | SKU desactivado | Debe retirarse; no puede formar un combo vendible |

### S-02-E — Error de guardado

- Mantener todos los datos del formulario.
- Mostrar un mensaje accionable y seguro.
- Permitir reintentar sin crear un combo duplicado.
- Separar errores de validación de errores temporales.
- No mostrar stack traces, nombres de servicios o eventos.

### S-03 — Seleccionar componentes

#### Propósito

Encontrar y añadir exclusivamente componentes directos elegibles.

#### Jerarquía de contenido

1. Título Añadir componentes.
2. Búsqueda por nombre o SKU como propuesta necesaria para selección.
3. Resultados con tipo, variante, precio, stock y estado.
4. Selección actual y acción Añadir.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Búsqueda | Campo de texto | Nombre o SKU | Consulta con estado de carga |
| Resultados | Lista/tabla seleccionable | SKU, nombre, variante, precio, stock, estado | Excluye o bloquea combos |
| Selección | Contador/lista | Componentes marcados | Evita duplicados según Q-04 |
| Acciones | Botones | Añadir seleccionados; Cancelar | Devuelve a S-02 |

#### Elegibilidad

- Producto simple activo, o SKU/variante específica activa.
- No debe ser un combo.
- La creación exitosa descrita por la spec usa componentes con stock; debe
  confirmarse si un SKU agotado puede seleccionarse para un combo nuevo.
- Un componente ya añadido no debe duplicarse sin una regla explícita.

#### Estados

- Inicial: instrucción de búsqueda o resultados iniciales según contrato.
- Cargando: indicador sin bloquear el cierre.
- Sin resultados: mensaje y posibilidad de cambiar consulta.
- Resultados no elegibles: explicar por qué están bloqueados.
- Error: permitir reintentar.

#### Navegación y foco

- Al abrir, el foco se ubica en el título o búsqueda.
- El diálogo/panel contiene el foco.
- Las filas seleccionables funcionan con teclado.
- Al cerrar, el foco regresa a Añadir componentes.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-20 | Búsqueda | Patrón propuesto; contrato exacto pendiente |
| A-21 | Tipo de resultado | Distinguir producto simple de SKU/variante |
| A-22 | Combo | No seleccionable; mostrar No se permiten combos dentro de combos |
| A-23 | Stock | Mostrar existencia como ayuda, no permitir editarla |
| A-24 | Añadir | Devuelve componentes a S-02 para asignar cantidades |

### S-04 — Confirmar desactivación

#### Propósito

Evitar una desactivación accidental y explicar su efecto comercial.

#### Contenido

- Título Desactivar combo.
- Nombre del combo.
- Mensaje: El combo dejará de estar disponible en los canales de venta.
- No afirmar que se elimina ni que se modifican los SKU componentes.
- Acciones Desactivar combo y Cancelar.

#### Navegación y foco

- Foco contenido dentro del diálogo.
- Escape o Cancelar cierra sin cambios.
- Confirmar se bloquea después del primer envío.
- Al cerrar sin confirmar, el foco vuelve al activador.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-25 | Advertencia | Desactivar el combo no desactiva sus componentes |
| A-26 | Confirmación | Acción explícita y sin eliminación permanente |
| A-27 | Reactivación | No agregar control; sus reglas no están definidas |

### S-05 — Detalle del combo

#### Propósito

Consultar el estado comercial, composición, precio y disponibilidad calculada.

#### Jerarquía de contenido

1. Nombre, estado y precio.
2. Disponibilidad del combo.
3. Componentes y cantidades.
4. Suma de precios regulares, suma de precios públicos vigentes y validación del descuento.
5. Acciones Editar y Desactivar según permisos.

#### Regiones y componentes

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título, estado y acciones | Nombre; Activo/Inactivo/Agotado | Acciones por permiso/estado |
| Comercial | Resumen | Precio del combo, suma regular y suma pública vigente | Solo lectura |
| Disponibilidad | Métrica + explicación | Unidades disponibles y componente limitante | Cálculo dinámico |
| Componentes | Tabla/lista | SKU, variante, cantidad, precios vigentes (regular/oferta), stock, aporte | No editable en detalle |
| Alerta | Mensaje contextual | Baja automática o error | Visible cuando aplica |

#### Datos mostrados

| Dato | Fuente | Formato | Prioridad | Ausencia |
|---|---|---|---|---|
| Nombre/Descripción | Combo | Texto | Alta | Mostrar error de integridad |
| Estado | Combo | Texto | Alta | No disponible |
| Precio del combo | Combo/Pricing | Moneda | Alta | No disponible |
| Suma regular | Pricing vigente | Moneda | Alta | No disponible |
| Suma pública vigente | Pricing vigente | Moneda | Alta | No disponible |
| Disponibilidad | Inventario + cantidades | Entero | Alta | No disponible; nunca 0 por defecto |
| Componente limitante | Cálculo | SKU/nombre | Media | Omitir si no calculable |
| Componentes | Combo/Catálogo | Lista | Alta | Mostrar error |

#### Acciones

| Prioridad | Acción | Etiqueta | Disponibilidad | Resultado |
|---|---|---|---|---|
| Primaria | Editar | Editar combo | Permiso y política de estado | Abre S-02 |
| Destructiva reversible | Desactivar | Desactivar combo | Combo activo y permiso | Abre S-04 |
| Secundaria | Volver | Volver a combos | Siempre | Abre S-01 |

#### Variantes

S-05-I — Inactivo manualmente:

- Etiqueta Inactivo.
- Mensaje Ya no está disponible en los canales de venta.
- No mostrar Desactivar.
- Reactivación no disponible hasta definir reglas.

S-05-A — Inactivo automáticamente:

- Etiqueta Inactivo — requiere revisión.
- Identificar el SKU desactivado cuando el evento/contrato lo permita.
- Explicar que el combo fue retirado de los canales.
- Ofrecer Editar combo si el permiso y la política lo permiten.
- No reactivar automáticamente al retirar el componente.

S-05-E — Disponibilidad no consultable:

- Mostrar No pudimos calcular la disponibilidad.
- No mostrar 0 ni Agotado como sustituto.
- Permitir reintentar.
- Conservar visible la composición previamente confirmada.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| A-28 | Precio | Comparar precio del combo con suma vigente |
| A-29 | Disponibilidad | Leer proyección informativa con objetivo < 200 ms; incluir calculated_at y estado, sin reserva |
| A-30 | Agotado | Si un componente tiene stock 0, el combo tiene disponibilidad 0 |
| A-31 | Componentes | Mostrar cantidades requeridas por cada combo |
| A-32 | Baja automática | Identificar causa sin exponer el nombre técnico del evento |
| A-33 | Error técnico | No debe representarse como stock 0 |

## 10. Estados de interfaz

| Estado | Aplica | Representación | Acciones | Recuperación |
|---|---|---|---|---|
| Listado cargando | Sí | Skeleton/indicador | Esperar | Reintento si falla |
| Listado vacío | Sí | Mensaje y Crear combo | Crear con permiso | N/A |
| Listado con datos | Sí | Tabla/tarjetas | Ver, editar, desactivar | N/A |
| Formulario inicial | Sí | Campos vacíos y componentes vacíos | Completar/cancelar | N/A |
| Edición cargando | Sí | Estructura de formulario bloqueada | Cancelar según contrato | Reintentar |
| Menos de dos SKUs distintos | Sí | Error y guardado bloqueado | Añadir componentes | Corregir |
| Cantidad inválida | Sí | Error asociado a fila | Corregir | Corregir |
| Precio inválido | Sí | Error con suma vigente | Corregir precio | Corregir |
| Selección de combo anidado | Sí | Control bloqueado + explicación | Elegir SKU directo | Corregir |
| Conflicto de datos | Sí | Aviso y valores refrescados | Revisar/corregir | Revalidar |
| Guardando | Sí | Acción deshabilitada | Evitar duplicado | Esperar |
| Guardado exitoso | Sí | Confirmación + detalle | Continuar | N/A |
| Error de guardado | Sí | Mensaje sin perder datos | Reintentar | Repetir envío seguro |
| Combo activo disponible | Sí | Estado Activo + stock positivo | Editar/desactivar | N/A |
| Combo activo agotado | Sí | Estado Agotado + disponibilidad 0 | Editar/desactivar | Se actualiza con stock |
| Combo inactivo manual | Sí | Estado Inactivo | Editar según política | Reactivación pendiente |
| Combo inactivo automático | Sí | Alerta de componente desactivado | Revisar/editar | Regla pendiente |
| Disponibilidad no calculable | Sí | No disponible | Reintentar | Nueva consulta |
| Sin permisos | Sí | Explicación segura | Volver | Solicitar acceso fuera del flujo |
| Sesión expirada | Sí | Aviso/autenticación | Iniciar sesión | Recuperar contexto si es posible |

### Reglas para datos remotos

- Consultar precios y proyección de stock al cargar y antes de guardar; el débito definitivo se valida solo con `order.confirmed` en Inventario.
- No aplicar guardado optimista a creación, edición ni desactivación.
- Recalcular en cliente para feedback inmediato, pero validar en servidor.
- Invalidar/refrescar lista, detalle, precio y disponibilidad después de guardar.
- Distinguir stock 0 de fallo de consulta.
- Conservar el formulario ante errores recuperables.
- Evitar creaciones o actualizaciones duplicadas.
- No simular eventos de pedidos como controles de la interfaz.

## 11. Comportamiento responsivo

DESIGN.md define 12 columnas en escritorio y 4 en móvil, pero no especifica
tablet ni breakpoints exactos. El prototipo debe demostrar adaptación sin fijar
los breakpoints definitivos.

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Completa | Condensada | Patrón global móvil |
| Listado | Tabla | Tabla reducida o tarjetas | Tarjetas |
| Formulario | Datos y resumen en regiones relacionadas | Regiones apiladas parcialmente | Una columna |
| Componentes | Tabla completa | Ocultar datos secundarios mediante detalle | Tarjetas por componente |
| Selector | Diálogo/panel amplio | Diálogo adaptable | Pantalla o diálogo completo |
| Precio/disponibilidad | Resumen lateral o inferior | Bloque inferior | Bloque apilado |
| Acciones | Agrupadas por prioridad | Ajuste de línea | Ancho disponible; 44 px mínimo |
| Modal de desactivación | Centrado | Margen lateral | Casi completo sin desbordar |
| Anotaciones | Panel lateral | Debajo | Lista debajo/colapsable |
| Contenido omitido | Ninguno | Ninguno | Ninguno; reorganizar |

### Condiciones críticas

- Verificar 320 px sin desplazamiento horizontal de toda la página.
- Nombres de producto, variante y SKU largos deben envolver o truncarse con
  acceso al valor completo.
- Las tablas de componentes deben transformarse sin perder cantidad, precio,
  stock ni disponibilidad.
- El selector y formulario deben funcionar con zoom de 200%.

## 12. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Cada pantalla tiene un encabezado principal único.
- Campos con etiquetas persistentes y errores asociados.
- El resumen de errores recibe foco al intentar guardar.
- Los cambios de suma, precio válido y disponibilidad se anuncian sin
  interrumpir la escritura.
- El estado Activo, Inactivo o Agotado se expresa con texto e icono.
- El componente limitante se comunica textualmente.
- Las filas seleccionables funcionan por teclado.
- Los diálogos contienen el foco y lo devuelven al activador.
- Las acciones móviles respetan 44 por 44 px según DESIGN.md.
- Los cambios no dependen exclusivamente del color.
- Las anotaciones del prototipo se excluyen del árbol accesible de la interfaz.

## 13. Tono visual y contenido

Aplicar DESIGN.md como única fuente de representación visual.

### Consideraciones específicas

- Densidad: media/alta en componentes; progresiva en el resto.
- Sensación buscada: control comercial, claridad y prevención de errores.
- Elemento dominante en S-01: listado y Crear combo.
- Elemento dominante en S-02: componentes y validación de precio.
- Elemento dominante en S-05: estado y disponibilidad.
- Los detalles de Saga, ACID, Kardex y nombres técnicos de eventos no se
  exponen como lenguaje de usuario.

### Microcopy crítica

| Contexto | Texto propuesto | Observación |
|---|---|---|
| Acción principal | Crear combo | Resultado concreto |
| Añadir | Añadir componentes | Componentes directos |
| Mínimo | Añade al menos 2 componentes. | Regla bloqueante |
| Anidamiento | No se permiten combos dentro de otros combos. | Explica el bloqueo |
| Cantidad | Ingresa una cantidad entera mayor que cero. | Error accionable |
| Precio inválido | El precio debe ser mayor que cero y menor que la suma de los componentes. | Regla completa |
| Disponibilidad | 7 combos disponibles, limitados por Medias Blancas. | Explica el cálculo |
| Agotado | Este combo no está disponible porque uno de sus componentes no tiene stock. | Sin tecnicismo |
| Desactivar | El combo dejará de estar disponible en los canales de venta. | Efecto comercial |
| Baja automática | El combo fue desactivado porque uno de sus componentes dejó de estar activo. | Solicita revisión |
| Error técnico | No pudimos calcular la disponibilidad. Inténtalo nuevamente. | No asumir stock 0 |

## 14. Restricciones técnicas relevantes

- Aplicación objetivo: React, TypeScript y Vite.
- Navegación productiva: React Router; rutas exactas pendientes.
- Estado remoto: TanStack Query para listado, detalle, búsqueda, precios, stock,
  guardado, desactivación e invalidación.
- Estado local: Zustand únicamente si la composición debe compartirse entre
  rutas; no es obligatorio desde el wireframe.
- Formularios: React Hook Form y Zod.
- Validación monetaria y cantidades: reglas compartidas con el backend.
- Contratos HTTP: OpenAPI/Swagger.
- Eventos: AsyncAPI para order.confirmed, order.cancelled, order.returned y
  catalog.sku.deactivated.
- La librería de componentes y estrategia CSS están pendientes.
- El prototipo es HTML/CSS/JS estático y no prescribe la implementación.

### Dependencias o contratos

| Tipo | Operación o referencia | Impacto visible |
|---|---|---|
| HTTP | Listar combos; método/ruta pendientes | Alimenta S-01 |
| HTTP | Consultar detalle; método/ruta pendientes | Alimenta S-05 |
| HTTP | Buscar componentes elegibles; método/ruta pendientes | Alimenta S-03 |
| HTTP | Consultar precios y stock; método/ruta pendientes | Suma y disponibilidad |
| HTTP | Crear combo; método/ruta pendientes | Confirma S-05 |
| HTTP | Editar combo; método/ruta pendientes | Actualiza S-05 |
| HTTP | Desactivar combo; método/ruta pendientes | Actualiza S-05-I |
| Evento | order.confirmed | Descuento atómico; no es acción UI |
| Evento | order.cancelled | Compensación atómica; no es acción UI |
| Evento | order.returned | Reposición integral; no es acción UI |
| Evento | catalog.sku.deactivated | Desactiva combo y genera alerta |
| Permiso | Consultar combos; código pendiente | Acceso a S-01/S-05 |
| Permiso | Crear combos; código pendiente | Acción Crear |
| Permiso | Editar combos; código pendiente | Acción Editar |
| Permiso | Desactivar combos; código pendiente | Acción Desactivar |

## 15. Privacidad, seguridad y acciones sensibles

- Autorizar consultar, crear, editar y desactivar en servidor.
- No confiar solo en la visibilidad de controles del frontend.
- Sanear nombre, descripción y textos mostrados.
- No exponer stack traces, nombres de servicios, tablas ni eventos técnicos.
- Confirmar la desactivación manual.
- Evitar guardados duplicados.
- Revalidar componentes, precio y estado al guardar.
- No permitir cantidades fraccionarias o no positivas.
- No aceptar identificadores manipulados de componentes no elegibles.
- El documento no exige reautenticación para estas acciones.

## 16. Criterios de aceptación del wireframe

- [ ] Solo usuarios autorizados ven o ejecutan cada acción.
- [ ] Permite consultar, crear, editar y desactivar combos.
- [ ] Nombre y descripción son obligatorios.
- [ ] Exige al menos dos SKUs vendibles distintos.
- [ ] Cada componente tiene una cantidad entera positiva.
- [ ] Solo permite SKU/variantes o productos simples directos.
- [ ] Bloquea combos como componentes.
- [ ] Muestra precios regulares y precios públicos vigentes y sus sumas.
- [ ] Bloquea precio menor o igual a cero.
- [ ] Bloquea precio igual o superior a la suma regular o a la suma pública vigente.
- [ ] Recalcula ante cambios de componentes o cantidades.
- [ ] Muestra disponibilidad proporcional y componente limitante.
- [ ] Representa disponibilidad 0 cuando un componente se agota.
- [ ] No confunde error técnico con stock 0.
- [ ] Confirma la desactivación manual.
- [ ] Representa desactivación automática y alerta de revisión.
- [ ] Respeta que la política de devolución parcial o total pertenece a Ventas/Postventa e Inventario solo repone lo aceptado.
- [ ] No expone controles para eventos o movimientos de Kardex.
- [ ] Incluye carga, vacío, error, conflicto, permisos y sesión.
- [ ] Funciona con teclado y no depende del color.
- [ ] El prototipo funciona con HTML/CSS/JS estáticos.
- [ ] No elige una librería UI no aprobada.
- [ ] Es consistente con DESIGN.md.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01 | S-01/S-02/S-04/S-05 y estados de permisos |
| CA-02 | S-02, campos generales y tabla de componentes |
| CA-03 | A-11 a A-13 y ALT-04/ALT-05 |
| CA-04 | S-03, A-22 y ALT-03 |
| CA-05 | S-02/S-05, fórmula y componente limitante |
| CA-06 | ALT-06, S-05 y microcopy de agotado |
| CA-07 | Restricción/evento documentado sin control manual |
| CA-08 | Restricción/evento documentado sin control manual |
| CA-09 | Restricción/evento documentado; reposición idempotente de devoluciones aceptadas por Postventa |
| CA-10 | Flujo E, S-05-A y notificación |

## 17. Supuestos

| ID | Supuesto | Motivo | Impacto si es incorrecto | Validar |
|---|---|---|---|---|
| SUP-01 | WF-002 es el identificador en este consolidado | Archivo incluido en consolidado de 16 WF | Renombrar archivo/referencias | Sí |
| SUP-02 | La ruta será /productos/combos | No se entregó mapa de navegación | Cambiar rutas/entrada | Sí |
| SUP-03 | Escritorio es el dispositivo principal | Configuración de múltiples componentes | Cambiar prioridad responsive | Sí |
| SUP-04 | La moneda visible será PEN/S/ | Ejemplos de la spec usan S/ | Ajustar formato/multimoneda | Sí |
| SUP-05 | El gestor puede buscar componentes por nombre o SKU | Necesidad operativa del selector | Cambiar patrón de selección | Sí |
| SUP-06 | El detalle identifica el componente limitante | Se deriva del cálculo y ayuda a comprenderlo | Omitir si contrato no lo provee | Sí |

## 18. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea wireframe | Estado |
|---|---|---|---|---|
| Q-01 | ¿Cuáles son longitud, formato y unicidad de nombre y descripción? | Producto/Backend | Sí para validaciones definitivas | Abierta |
| Q-02 | Resuelto: al menos dos SKUs distintos; suma de cantidades no sustituye esta regla. | Specs/HU definitivos | No | Resuelta |
| Q-03 | Creación activa descrita en Spec/HU usa SKUs con stock; si un SKU queda en 0 posteriormente, el combo se muestra agotado. La creación de combos agotados no está autorizada por el escenario de alta. | Specs/HU definitivos | No | Resuelta para alcance actual |
| Q-04 | No se permiten filas duplicadas de un SKU; la cantidad se edita en una única fila por SKU. | Decisión de representación sin duplicar componentes | No | Resuelta para wireframe |
| Q-05 | ¿El sistema usa una sola moneda o debe soportar multimoneda? | Producto/Pricing | Sí para formato | Abierta |
| Q-06 | ¿Cómo se redondean precios y qué precisión decimal se admite? | Pricing | Sí para validación | Abierta |
| Q-07 | ¿Puede editarse un combo inactivo y bajo qué condición vuelve a activarse? | Producto | Sí para S-05-A/S-05-I | Abierta |
| Q-08 | ¿Debe advertirse al salir del formulario con cambios sin guardar? | Producto/UX | No | Abierta |
| Q-09 | ¿Qué canal notifica una desactivación automática y a qué vista dirige? | Producto/Frontend | No | Abierta |
| Q-10 | ¿Se requiere búsqueda, filtros, orden y paginación en el listado? | Producto | No para flujo base | Abierta |
| Q-11 | ¿Los precios y disponibilidad se actualizan por consulta, polling o evento visible para el frontend? | Arquitectura/Frontend | Sí para actualización | Abierta |
| Q-12 | ¿Qué debe hacer el gestor si falla una operación atómica de stock durante una venta? | Ventas/Inventario/Producto | No para gestión; sí para canal de venta | Abierta |
| D-01 | Selección de librería UI y estrategia CSS | Frontend | No para wireframe; sí para implementación | Pendiente |

### Alineación definitiva de Combos (Specs/HU definitivos)

- Dos o más **SKUs vendibles distintos**, cantidades enteras positivas y ningún combo anidado. Precios de comparación = suma de **precios regulares vigentes** y suma de **precios públicos vigentes de compra individual** (`min(precio_regular, precio_oferta)`), ambas estrictamente superiores al precio del combo. La combinabilidad del precio del combo con promociones o cupones se determina mediante la política de combinación homologada del motor de Promociones; el MVP puede configurarlo como exclusivo por defecto.
- Solo `order.confirmed` de Ventas/Postventa inicia el débito definitivo **en Inventario**. `order.created` no genera reserva ni consumo. La confirmación/rechazo del consumo es provisional y se debe homologar con Ventas; el wireframe de administración nunca confirma ni descuenta una venta.
- Reposición por devolución: Inventario repone de forma idempotente las cantidades y SKUs devueltos comunicados por Postventa (`order.returned`), sin decidir si la política comercial permitía devolución parcial o total.
- Disponibilidad mostrada es una lectura informativa, potencialmente atrasada si usa eventos: **no prometer stock garantizado hasta el débito atómico**. Tras `catalog.sku.deactivated` la baja comercial se refleja por eventos y puede tener latencia de propagación; evitar «instantáneamente» como garantía temporal.
- La reactivación de un combo no está definida por sus fuentes y no se agrega un botón. Las preguntas genuinas de diseño y condiciones no normadas permanecen señaladas como pendientes.

### Precisión vinculante de disponibilidad (revisión 0.4)
La cifra y el componente limitante se calculan con la última proyección recibida, no mediante una transacción de Inventario al consultar. Mostrar «Estimación», `calculated_at` y aviso de que la compra se confirma según existencias verificadas; si la proyección está ausente u obsoleta, mostrar «Disponibilidad no verificable» y no «Agotado». El objetivo de 200 ms se refiere a la consulta informativa. Inventario verifica en `order.confirmed`; crear combo con proyección positiva no reserva unidades.

## 19. Registro de revisiones

| Versión | Fecha | Autor | Cambio | Aprobado por |
|---|---|---|---|---|
| 0.1 | 2026-09-16 | Asistente | Borrador inicial basado en spec, HU, template y DESIGN.md | Pendiente |
| 0.3 | 2026-09-18 | Asistente | Alineación de wireframe con Specs/HU definitivos y contratos externos provisionales; ver registro de cambios. | Pendiente de revisión del equipo |

---

## Lista de control antes de generar el HTML

- [x] Las fuentes funcionales están identificadas.
- [x] El alcance y fuera de alcance están claros.
- [x] Las pantallas y variantes están inventariadas.
- [x] Los criterios CA-01 a CA-10 están cubiertos.
- [x] Las fórmulas de precio y disponibilidad están documentadas.
- [x] Los eventos se separaron de las acciones de interfaz.
- [x] Los supuestos y preguntas están registrados.
- [x] El formato HTML está definido.
- [ ] Confirmar el ID WF-002 contra INDEX.md.
- [ ] Resolver Q-02, Q-03, Q-04, Q-06 y Q-07 antes del diseño definitivo.
- [ ] Confirmar rutas y permisos antes de implementar el frontend.

---
