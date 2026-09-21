# WF-005 — Gestión de cupones de descuento

> **Fuente normativa de esta revisión:** `specs_consolidado_final.md` y `hu_consolidado_final.md` (18-09-2026). Los nombres/eventos de Ventas y Postventa son contratos **provisionales no homologados**; el prototipo no debe simular pagos realizados ni confirmaciones externas como si estuvieran implementadas. Las anotaciones, supuestos, preguntas y referencias técnicas permanecen en este documento y no se muestran como elementos de la interfaz simulada.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la administración de
cupones descrita en este archivo.

Antes de diseñar:

1. Consulta `../../specs/SPEC-005-gestion-cupones-descuento.md`.
2. Consulta `../../hu/HU-005-gestion-cupones-descuento.md`.
3. Consulta `../DESIGN.md`.
4. Usa este documento para la composición, interacción y estados del flujo.

Prioridad de fuentes:

1. La especificación define reglas de negocio y restricciones globales.
2. La historia de usuario define criterios de aceptación y escenarios.
3. Este documento define navegación y comportamiento de interfaz.
4. `DESIGN.md` define la representación visual.

Reglas de producción:

- No dupliques en el cupón el descuento, los productos elegibles ni la vigencia;
  esos datos pertenecen a la promoción asociada.
- Solo permite asociar promociones configuradas en modalidad cupón.
- Normaliza el código quitando espacios extremos y convirtiéndolo a mayúsculas.
- Permite configurar límite máximo global opcional, límite máximo por cliente opcional (`max_usos_por_cliente`) y política de restitución (`RESTAURAR_EN_CANCELACION | NO_RESTAURAR`).
- No permitas reducir el límite global por debajo de los usos consumidos, ni que el límite por cliente supere al global.
- La validación de una compra no consume usos.
- La confirmación de pedidos, la idempotencia y la concurrencia son contexto del
  sistema; no deben transformarse en controles administrativos.
- Numera las anotaciones `A-01`, `A-02`, etc. Estas anotaciones, los supuestos,
  las preguntas y los criterios de revisión pertenecen a la documentación y no
  deben renderizarse dentro de la interfaz del prototipo HTML.
- Usa datos ficticios y no consumas APIs reales.
- Mantén el estilo monocromático y de baja fidelidad de `DESIGN.md`.

### Formato del entregable

- Punto de entrada: `../prototipos/WF-005-gestion-cupones-descuento/index.html`.
- HTML, CSS y JavaScript estáticos, sin compilación ni servicios externos.
- Navegación funcional entre listado, formulario, detalle y confirmación.
- Comportamiento responsivo real; sin selector interno de dispositivo.

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | `WF-005` |
| Nombre del flujo | Gestión de cupones de descuento |
| Versión | 0.1 |
| Estado | En revisión |
| Responsable | Axel Andree Cueva Alcalá |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-18 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | `SPEC-005-gestion-cupones-descuento.md`, secciones 3–7 | Modelo, validaciones, límites, restitución, uso, concurrencia y alcance |
| Historia de usuario | `HU-CUP-01`, CA-01 a CA-13 | Necesidad, reglas y escenarios verificables |
| Diseño | `DESIGN.md` | Escala de grises, jerarquía, controles y accesibilidad táctil |

### Funcionalidades incluidas

- Consultar, buscar y filtrar cupones.
- Crear y modificar un cupón con límites global y por cliente.
- Configurar política de restitución ante cancelación (`RESTAURAR_EN_CANCELACION` / `NO_RESTAURAR`).
- Asociar una promoción de modalidad cupón y reflejar su política de combinación.
- Consultar estado, compra mínima y disponibilidad de usos (globales y por cliente).
- Activar o desactivar un cupón con confirmación.

### Fuera de alcance

- Configurar el descuento, productos elegibles o vigencia de la promoción.
- Procesar pagos o confirmaciones manuales de pedidos.
- Exponer idempotencia, concurrencia, eventos o contratos como controles de UI.

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Gestor comercial |
| Nivel técnico | Intermedio |
| Contexto | Administración periódica desde escritorio o tablet |
| Necesidad | Publicar códigos controlados y revisar su disponibilidad operativa |
| Permiso | Crear, modificar, activar y desactivar cupones |
| Dispositivo principal | Escritorio, con soporte móvil |

## 4. Objetivo del flujo

**El usuario debe poder** crear y administrar un código asociado a una promoción
de modalidad cupón **para** habilitar un beneficio sujeto a estado, compra mínima
y disponibilidad de usos.

### Resultado exitoso

El cupón aparece en el listado con su código normalizado, promoción, estado y
contadores; la interfaz confirma la creación o modificación.

### Indicador de finalización

Mensaje de éxito y retorno al listado actualizado.

## 5. Precondiciones y disparador

### Precondiciones

- Sesión válida y permiso de Gestor Comercial.
- Existe al menos una promoción configurada en modalidad cupón.

### Punto de entrada

- Ubicación propuesta: módulo Productos y ofertas, sección Cupones.
- Disparador: navegación principal o acción `Crear cupón`.
- Contexto conservado: filtros al volver desde detalle; pendiente de contrato.

### Salidas

| Resultado | Destino o comportamiento |
|---|---|
| Éxito | Listado actualizado y confirmación no bloqueante |
| Cancelación | Retorno al listado sin cambios |
| Error de validación | Permanencia en formulario con datos conservados |
| Error remoto | Mensaje recuperable y opción de reintentar |

## 6. Secuencia principal

1. El gestor abre el listado de cupones.
2. Selecciona `Crear cupón`.
3. Ingresa código, promoción, estado y condiciones opcionales.
4. El sistema normaliza y valida los datos.
5. El gestor guarda.
6. El sistema confirma y muestra el cupón en el listado.
7. Desde el listado puede abrir el detalle, editar o cambiar el estado.

### Flujos alternativos

| ID | Condición | Comportamiento | Retorno |
|---|---|---|---|
| `ALT-01` | Código duplicado ignorando mayúsculas | Bloquear guardado e identificar el campo | Formulario |
| `ALT-02` | Compra mínima no positiva | Bloquear guardado y conservar datos | Formulario |
| `ALT-03` | Límite inválido o menor que usos consumidos | Mostrar el mínimo permitido | Formulario |
| `ALT-04` | Promoción no elegible | Solicitar otra promoción | Formulario |
| `ALT-05` | Desactivación cancelada | Cerrar diálogo sin cambios | Detalle |
| `ALT-06` | Filtros sin coincidencias | Mostrar estado sin resultados | Listado |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Presentación | Obligatoria |
|---|---|---|---|---|
| `S-01` | Listado de cupones | Consultar, buscar y entrar a acciones | Vista principal | Sí |
| `S-01-E` | Sin resultados | Recuperarse de filtros sin coincidencias | Misma vista | Sí |
| `S-02` | Crear/editar cupón | Capturar datos propios del cupón | Vista de formulario | Sí |
| `S-02-V` | Errores de validación | Corregir datos sin perderlos | Misma vista | Sí |
| `S-03` | Detalle del cupón | Consultar condiciones y uso operacional | Vista de detalle | Sí |
| `S-04` | Confirmar cambio de estado | Evitar activación o desactivación accidental | Diálogo modal | Sí |

## 8. Especificación por pantalla

### `S-01` — Listado de cupones

#### Jerarquía y regiones

1. Título `Cupones de descuento` y acción `Crear cupón`.
2. Búsqueda por código/promoción y filtro por estado.
3. Tabla con código, promoción, estado, uso, compra mínima y acción de detalle.

| Región | Componente | Contenido | Comportamiento |
|---|---|---|---|
| Encabezado | Título + botón | Contexto y creación | Acción visible con permiso |
| Filtros | Campo + selector | Texto y estado | Actualización inmediata |
| Resultados | Tabla | Datos administrativos | Desplazamiento horizontal en móvil |
| Vacío | Mensaje | Sin coincidencias | Orienta a cambiar filtros |

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| `A-01` | Código | Mostrar el valor normalizado en tipografía monoespaciada |
| `A-02` | Uso | Mostrar consumidos, límite y disponibles cuando exista límite |
| `A-03` | Estado | Combinar texto e indicador; no depender solo del color |
| `A-04` | Sin resultados | No confundir con ausencia total de cupones |

### `S-02` — Crear o editar cupón

#### Campos y validaciones

| Campo | Tipo | Obligatorio | Validación | Mensaje esperado |
|---|---|---|---|---|
| Código | Texto | Sí | `trim`, mayúsculas, `A-Z`, números, `-`, `_`, unicidad | `Este código ya existe` o `Ingresa un código válido` |
| Promoción | Selector | Sí | Debe existir y ser modalidad cupón (muestra política de combinación) | `Selecciona una promoción mediante cupón` |
| Compra mínima | Moneda | No | Mayor que 0 cuando exista | `Ingresa un monto mayor que 0` |
| Límite global | Entero | No | Mayor que 0 y no menor a consumidos | `El límite no puede ser menor que N` |
| Límite por cliente | Entero | No | Mayor que 0 y no mayor al límite global | `El límite por cliente no puede superar el límite global` |
| Política de restitución | Selector | Sí | `RESTAURAR_EN_CANCELACION` o `NO_RESTAURAR` | N/A |
| Estado | Interruptor | Sí | Activo o inactivo | N/A |

- Validar al enviar; normalizar el código al salir del campo y al guardar.
- Conservar todos los datos tras un error.
- Deshabilitar el envío mientras se guarda para evitar duplicados.
- En edición, mostrar usos consumidos globales y por cliente como solo lectura.

#### Anotaciones

| ID | Elemento | Anotación |
|---|---|---|
| `A-05` | Ayuda del código | Explicar formato y normalización antes del error |
| `A-06` | Promoción | El selector no configura el beneficio; asocia la promoción y muestra su política de combinación |
| `A-07` | Límites | Límite global no menor a consumidos; límite por cliente no mayor al global |
| `A-08` | Política restitución | Determina si ante cancelación de pedido se restituye el uso del cupón |

### `S-03` — Detalle del cupón

- Mostrar código, promoción (con su política de combinación), estado, compra mínima, límite global, límite por cliente, política de restitución, usos consumidos y usos disponibles.
- Explicar de forma breve que validar una compra no consume usos.
- Enlazar conceptualmente a la promoción para consultar beneficio y vigencia;
  la navegación exacta queda pendiente.
- Acciones: `Editar`, `Activar/Desactivar` y `Volver al listado`.

| ID | Elemento | Anotación |
|---|---|---|
| `A-09` | Resumen | Priorizar estado y disponibilidad operacional |
| `A-10` | Condiciones | No repetir descuento, productos ni vigencia como datos del cupón |
| `A-11` | Uso | La consulta administrativa no ofrece consumir ni reponer usos |

### `S-04` — Confirmar cambio de estado

- Título específico: `Activar cupón` o `Desactivar cupón`.
- Explicar el efecto en nuevas validaciones.
- Aclarar que usos consumidos no cambian.
- Acciones `Confirmar` y `Cancelar`; foco contenido y devuelto al activador.

| ID | Elemento | Anotación |
|---|---|---|
| `A-12` | Mensaje | Describe efecto comercial sin detalles técnicos |
| `A-13` | Confirmación | Evita cambios de estado accidentales |

## 9. Estados de interfaz

| Estado | Representación | Acciones | Recuperación |
|---|---|---|---|
| Cargando listado | Estructura o indicador | Esperar | Reintentar si falla |
| Con datos | Tabla y conteo | Filtrar, crear, ver | N/A |
| Vacío inicial | Mensaje y `Crear cupón` | Crear | Nuevo formulario |
| Sin resultados | Mensaje contextual | Limpiar filtros | Restablecer listado |
| Formulario inválido | Errores asociados | Corregir/cancelar | Datos conservados |
| Guardando | Acción bloqueada | Esperar | Reintentar si falla |
| Éxito | Mensaje no bloqueante | Continuar | N/A |
| Conflicto de código | Error en código | Cambiar código | Revalidar |
| Dato desactualizado | Aviso de usos actuales | Revisar límite | Recargar datos |
| Sin permisos | Mensaje seguro | Volver | Solicitar acceso fuera del flujo |
| Sesión expirada | Aviso | Iniciar sesión | Retornar si es posible |

## 10. Comportamiento responsivo

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Completa | Condensada | Navegación global móvil |
| Encabezado | Título y CTA en fila | Ajuste de línea | CTA a ancho completo |
| Filtros | Tres columnas | Dos columnas | Una columna |
| Tabla | Completa | Scroll contenido | Scroll contenido sin desbordar página |
| Formulario | Dos columnas | Dos/una columna | Una columna |
| Modal | Centrado | Margen lateral | Ancho disponible |
| Acciones | En fila | Ajustables | Apiladas, mínimo 44 px |

Verificar 320 px, zoom 200 %, códigos largos y mensajes de error multilínea.

## 11. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Un encabezado principal por vista y etiquetas persistentes en campos.
- Errores asociados programáticamente y foco en el primer campo inválido.
- Mensajes de éxito en región viva no intrusiva.
- Diálogo con foco contenido y retorno al activador.
- Estado expresado con texto; áreas táctiles mínimas de 44 × 44 px.
- Flujo completo operable con teclado.

## 12. Tono visual y contenido

- Densidad media/alta en el listado y media en formularios.
- Sensación: control, claridad y prevención de errores.
- Elemento dominante: código y disponibilidad de usos.
- No mostrar criterios CA, nombres de eventos, idempotencia, concurrencia,
  endpoints, supuestos ni anotaciones dentro de la interfaz.

### Microcopy crítica

| Contexto | Texto |
|---|---|
| Acción principal | `Crear cupón` |
| Duplicado | `Este código ya existe. Prueba con uno diferente.` |
| Límite inválido | `El límite no puede ser menor que los usos consumidos.` |
| Ayuda | `La validación de una compra no consume usos.` |
| Desactivación | `El cupón dejará de participar en nuevas validaciones.` |

## 13. Restricciones técnicas relevantes

- El prototipo es HTML/CSS/JS estático y no prescribe la implementación final.
- Los contratos HTTP, permisos concretos y rutas productivas están pendientes.
- Las validaciones críticas deben repetirse en servidor.
- El consumo es idempotente por pedido y cupón, y seguro ante concurrencia; la
  interfaz solo comunica el resultado cuando corresponda.
- No hay actualizaciones optimistas para creación, edición o cambio de estado.

## 14. Privacidad, seguridad y acciones sensibles

- Autorizar todas las operaciones administrativas en servidor.
- No exponer pedidos, datos personales, stack traces ni detalles internos.
- Confirmar cambios de estado.
- No permitir edición directa de usos consumidos.
- No revelar si un recurso restringido existe mediante errores detallados.

## 15. Criterios de aceptación del wireframe

- [x] Representa listado, alta, edición, detalle y cambio de estado.
- [x] Normaliza y valida el código.
- [x] Evita promociones no elegibles.
- [x] Valida compra mínima, límite global y límite por cliente opcionales.
- [x] Configura política de restitución (`RESTAURAR_EN_CANCELACION` / `NO_RESTAURAR`).
- [x] Impide reducir el límite global por debajo de consumidos o que el límite por cliente supere al global.
- [x] Distingue validación de consumo.
- [x] Incluye vacío, filtros, errores, éxito, permisos y sesión.
- [x] Es responsivo, operable por teclado y consistente con `DESIGN.md`.
- [x] Separa documentación del wireframe de la interfaz simulada.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01–CA-06 | S-01, S-02, S-03 y estados de permisos |
| CA-07–CA-08 | Contexto de detalle y restricciones; validación sin consumo |
| CA-09–CA-12 | Restricciones técnicas, sin controles administrativos |
| CA-13 | Dependencia documentada con promociones y política de combinación |

## 16. Supuestos

| ID | Supuesto | Impacto si es incorrecto | Validar |
|---|---|---|---|
| `SUP-01` | Escritorio es el dispositivo principal | Repriorizar diseño móvil | Sí |
| `SUP-02` | Moneda visible PEN/S/ | Ajustar formato monetario | Sí |
| `SUP-03` | El listado admite búsqueda por código o promoción | Cambiar filtros | Sí |

## 17. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea | Estado |
|---|---|---|---|---|
| `Q-01` | ¿Cuál es la longitud máxima del código? | Producto/Backend | Validación final | Abierta |
| `Q-02` | ¿Puede cambiarse la promoción asociada después de existir usos? | Producto | Edición final | Abierta |
| `Q-03` | ¿Cómo se navega desde cupón hacia la promoción asociada? | Producto/Frontend | No | Abierta |
| `Q-04` | ¿Deben preservarse filtros al volver del detalle? | UX/Frontend | No | Abierta |
| `D-01` | Selección de librería UI y estrategia CSS | Frontend | Implementación | Pendiente |

### Alineación definitiva de Cupones

- El selector **solo** muestra promociones de modalidad `CUPON`; mostrar nombre, vigencia, política de combinación y estado de la promoción en el detalle del cupón sin duplicar descuento, productos elegibles ni fechas dentro de la edición del código.
- Configurar límites globales y por cliente (`max_usos_por_cliente`), además de la política de restitución (`RESTAURAR_EN_CANCELACION` / `NO_RESTAURAR`) ante cancelación.
- La evaluación de promociones y cupones sigue la política de combinación configurada en la promoción asociada. La validación no consume usos; solo el cupón elegido consume en la confirmación contractual del pedido.
- En el detalle administrativo los usos deben diferenciar «validaciones» de «usos consumidos». Cupones protege límite e idempotencia por `order_id + cupon_id`.
- El contrato externo de confirmación/rechazo del consumo sigue **provisional**: no simular confirmación de pago ni recuperación automática de un rechazo como si Ventas ya lo hubiera aprobado. Longitud del código y edición de asociación tras usos siguen pendientes si no se encuentran formalizados.

## 18. Registro de revisiones

| Versión | Fecha | Autor | Cambio | Aprobado por |
|---|---|---|---|---|
| 0.1 | 2026-09-17 | Asistente | Flujo inicial basado en spec, HU, prototipo y `DESIGN.md` | Pendiente |
| 0.3 | 2026-09-18 | Asistente | Alineación de wireframe con Specs/HU definitivos y contratos externos provisionales; ver registro de cambios. | Pendiente de revisión del equipo |

## 19. Lista de control

- [x] Fuentes, alcance y pantallas identificados.
- [x] Criterios CA-01 a CA-13 cubiertos.
- [x] Reglas técnicas separadas de controles de interfaz.
- [x] Anotaciones y documentación excluidas del HTML visible.
- [x] Prototipo HTML disponible en la ruta asignada.
- [ ] Resolver preguntas abiertas antes de la implementación productiva.

---
