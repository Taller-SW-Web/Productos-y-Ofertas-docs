# WF-006 — Gestión de ofertas y promociones

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la administración y
evaluación de promociones descrita en este archivo.

Antes de diseñar:

1. Consulta `../../specs/spec_gestion_ofertas_promociones.md`.
2. Consulta `../../hu/hu_gestion_ofertas_promociones.md`.
3. Consulta `../DESIGN.md`.
4. Usa este documento para composición, navegación y estados del flujo.

Prioridad: especificación, historia de usuario, este documento y `DESIGN.md`.
Ante una contradicción, registra una pregunta y no inventes una resolución.

Reglas de producción:

- Permite descuentos por porcentaje o monto fijo, nunca ambos a la vez.
- El porcentaje debe ser mayor que 0 y menor o igual que 100.
- El monto fijo debe ser mayor que 0 y aplicarse una sola vez al subtotal
  elegible, no por unidad.
- Ningún descuento puede producir un importe resultante negativo.
- Exige al menos un producto activo, inicio anterior al fin y estado inicial.
- No acumules promociones automáticas entre sí ni con cupones.
- Si hay empate entre promoción automática y cupón, prioriza el cupón.
- Modificar o desactivar no cambia pedidos ya confirmados.
- No muestres criterios CA, endpoints, supuestos, decisiones técnicas ni
  anotaciones `A-xx` dentro de la interfaz simulada; son documentación.
- Usa datos ficticios y no consumas servicios externos.
- Aplica el estilo monocromático de baja fidelidad de `DESIGN.md`.

### Formato del entregable

- Entrada: `../prototipos/WF-006-gestion-ofertas-promociones/index.html`.
- HTML, CSS y JavaScript estáticos y navegables.
- Debe representar listado, alta/edición, detalle, cambio de estado y evaluación.
- Responsividad por CSS real, sin controles internos de dispositivo.

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID | `WF-006` |
| Nombre | Gestión de ofertas y promociones |
| Versión | 0.1 |
| Estado | En revisión |
| Responsable | Axel Andree Cueva Alcalá |
| Fecha | 2026-09-17 |
| Última actualización | 2026-09-17 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte |
|---|---|---|
| Spec | `spec_gestion_ofertas_promociones.md`, secciones 3–6 | Alcance, cálculo, selección y restricciones |
| Historia de usuario | `HU-PROM-01`, CA-01 a CA-10 | Necesidad y escenarios verificables |
| Diseño | `DESIGN.md` | Lenguaje visual y reglas responsivas |

### Funcionalidades incluidas

- Consultar, buscar y filtrar promociones.
- Crear y editar condiciones, descuento, vigencia, estado y productos.
- Activar y desactivar promociones.
- Consultar el detalle.
- Simular la evaluación de beneficios aplicables.

### Fuera de alcance

- Administrar códigos y usos de cupones.
- Gestionar precios base, catálogo, stock, checkout, pedidos o pagos.
- Exponer contratos técnicos o persistencia dentro de la interfaz.

## 3. Usuario objetivo

| Aspecto | Definición |
|---|---|
| Persona | Gestor comercial |
| Nivel técnico | Intermedio |
| Contexto | Planificación y control de campañas comerciales |
| Necesidad | Configurar beneficios válidos y comprobar su efecto |
| Permisos | Consultar, crear, editar, activar y desactivar |
| Dispositivo | Escritorio, con soporte tablet y móvil |

## 4. Objetivo del flujo

**El usuario debe poder** configurar una promoción válida y revisar el resultado
de su evaluación **para** ofrecer el mejor beneficio aplicable sin acumulaciones.

### Resultado exitoso

La promoción queda visible con tipo, valor, productos, vigencia y estado. La
evaluación identifica un único beneficio y desglosa importes.

### Indicador de finalización

Confirmación no bloqueante y listado actualizado, o panel de resultado de la
evaluación con importe original, descuento e importe resultante.

## 5. Precondiciones y disparador

### Precondiciones

- Sesión válida y permiso de Gestor Comercial.
- Existen productos activos y precios vigentes consultables.

### Punto de entrada

- Ubicación: Productos y ofertas, sección Promociones.
- Disparadores: `Crear promoción`, `Ver detalle` o `Evaluar compra`.

### Salidas

| Resultado | Comportamiento |
|---|---|
| Éxito | Actualiza listado o muestra resultado de evaluación |
| Cancelación | Vuelve sin persistir cambios |
| Validación fallida | Conserva datos e identifica campos |
| Error remoto | Mantiene contexto y permite reintentar |

## 6. Secuencia principal

1. El gestor abre el listado.
2. Selecciona `Crear promoción`.
3. Ingresa nombre, tipo, valor, estado y vigencia.
4. Selecciona uno o más productos activos.
5. El sistema valida y el gestor guarda.
6. La promoción aparece en el listado.
7. El gestor puede consultar, editar o cambiar su estado.
8. Opcionalmente evalúa una compra para revisar el beneficio seleccionado.

### Flujos alternativos

| ID | Condición | Respuesta | Retorno |
|---|---|---|---|
| `ALT-01` | Porcentaje fuera de rango | Bloquear y mostrar rango válido | Formulario |
| `ALT-02` | Monto fijo no positivo | Bloquear y explicar aplicación única | Formulario |
| `ALT-03` | Fin no posterior al inicio | Asociar error al campo fin | Formulario |
| `ALT-04` | Sin productos | Solicitar al menos uno | Formulario |
| `ALT-05` | Descuento supera subtotal | Limitar descuento al subtotal | Evaluación |
| `ALT-06` | Varias promociones | Elegir la que deja menor importe | Resultado |
| `ALT-07` | Empate con cupón | Seleccionar el cupón | Resultado |
| `ALT-08` | Ninguna promoción aplicable | Informar motivo | Resultado |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Presentación | Obligatoria |
|---|---|---|---|---|
| `S-01` | Listado | Consultar y acceder a acciones | Vista principal | Sí |
| `S-01-E` | Sin resultados | Recuperar filtros | Misma vista | Sí |
| `S-02` | Crear/editar | Configurar promoción | Formulario | Sí |
| `S-02-V` | Validación fallida | Corregir sin perder datos | Misma vista | Sí |
| `S-03` | Detalle | Revisar condiciones y productos | Vista de detalle | Sí |
| `S-04` | Evaluar compra | Probar selección del mejor beneficio | Vista funcional | Sí |
| `S-04-R` | Resultado de evaluación | Mostrar beneficio y desglose | Panel en S-04 | Sí |
| `S-05` | Confirmar estado | Evitar cambios accidentales | Diálogo | Sí |

## 8. Especificación por pantalla

### `S-01` — Listado de promociones

1. Título `Ofertas y promociones`.
2. Acciones `Evaluar compra` y `Crear promoción`.
3. Búsqueda y filtros por estado y tipo.
4. Tabla con nombre, descuento, productos, vigencia, estado y detalle.

| ID | Elemento | Anotación |
|---|---|---|
| `A-01` | Descuento | Diferenciar porcentaje y monto fijo con texto/formato |
| `A-02` | Vigencia | Mostrar inicio y fin sin inferir estado solo por fechas |
| `A-03` | Estado | Usar texto e indicador, nunca solo color |
| `A-04` | Filtros | No modificar datos; solo reducir resultados visibles |

### `S-02` — Crear o editar promoción

#### Campos y validaciones

| Campo | Tipo | Obligatorio | Validación | Error |
|---|---|---|---|---|
| Nombre | Texto | Sí | No vacío | `Ingresa un nombre` |
| Tipo | Radio | Sí | Porcentaje o monto fijo | N/A |
| Valor | Número | Sí | Porcentaje `(0,100]`; monto `(0,∞)` | Mensaje específico por tipo |
| Estado | Selector | Sí | Activa o inactiva | N/A |
| Inicio | Fecha/hora | Sí | Valor válido | `Indica el inicio` |
| Fin | Fecha/hora | Sí | Posterior al inicio | `El fin debe ser posterior al inicio` |
| Productos | Selección múltiple | Sí | Al menos uno, todos activos | `Selecciona al menos un producto` |

- Cambiar el tipo actualiza la ayuda del valor.
- Conservar datos tras error y la última configuración válida en edición.
- Bloquear envíos duplicados durante el guardado.
- No presentar edición de precios ni stock.

| ID | Elemento | Anotación |
|---|---|---|
| `A-05` | Tipo de descuento | Solo una modalidad por promoción |
| `A-06` | Ayuda de monto fijo | Aclarar que se aplica una vez al subtotal elegible |
| `A-07` | Productos | Mostrar únicamente productos existentes y activos |
| `A-08` | Guardado inválido | Mantener todos los valores para corregirlos |

### `S-03` — Detalle

- Mostrar nombre, tipo, valor, estado, vigencia y productos participantes.
- Acciones `Editar`, `Activar/Desactivar` y `Volver`.
- Mostrar aviso de que cambios futuros no alteran pedidos confirmados.

| ID | Elemento | Anotación |
|---|---|---|
| `A-09` | Resumen | Priorizar descuento, vigencia y estado |
| `A-10` | Productos | Lista solo de lectura en detalle |
| `A-11` | Persistencia histórica | Explicar efecto sin exponer arquitectura |

### `S-04` — Evaluar compra

#### Regiones

| Región | Contenido | Comportamiento |
|---|---|---|
| Datos | Producto, subtotal y cupón opcional | Captura ficticia para probar flujo |
| Acción | `Evaluar beneficios` | Compara resultados sin acumular |
| Resultado | Beneficio, original, descuento y resultante | Aparece después de evaluar |

#### Reglas visibles

- Mostrar un único beneficio seleccionado.
- Si el descuento supera el subtotal, el resultado es cero, nunca negativo.
- Si no aplica ninguno, mostrar el motivo.
- Si hay empate con cupón, identificar el cupón como seleccionado.
- La evaluación no ofrece consumir cupones ni confirmar pedidos.

| ID | Elemento | Anotación |
|---|---|---|
| `A-12` | Cupón opcional | Permite probar convivencia, no administrarlo |
| `A-13` | Resultado | Desglosar importes para que la decisión sea verificable |
| `A-14` | Selección | Mayor beneficio equivale al menor importe resultante |

### `S-05` — Confirmar activación o desactivación

- Mensaje explica participación en nuevas evaluaciones.
- Desactivar no altera descuentos de pedidos ya confirmados.
- Acciones `Confirmar` y `Cancelar`; foco contenido y retorno al activador.

| ID | Elemento | Anotación |
|---|---|---|
| `A-15` | Confirmación | El cambio es reversible pero comercialmente relevante |
| `A-16` | Mensaje histórico | No prometer modificación de pedidos existentes |

## 9. Estados de interfaz

| Estado | Representación | Acciones | Recuperación |
|---|---|---|---|
| Cargando | Estructura o indicador | Esperar | Reintentar |
| Con datos | Tabla | Filtrar/crear/ver | N/A |
| Vacío inicial | Mensaje + crear | Crear | Formulario |
| Sin resultados | Mensaje de filtros | Cambiar filtros | Listado |
| Formulario inválido | Errores por campo | Corregir | Datos conservados |
| Guardando | Acción deshabilitada | Esperar | Reintentar |
| Éxito | Confirmación | Continuar | N/A |
| Evaluación con beneficio | Panel con desglose | Revisar o cambiar datos | Nueva evaluación |
| Evaluación sin beneficio | Motivo explícito | Cambiar datos | Nueva evaluación |
| Conflicto de datos | Aviso de precios/estado vigentes | Revisar | Recargar |
| Sin permisos | Mensaje seguro | Volver | Solicitar acceso |
| Sesión expirada | Aviso | Iniciar sesión | Recuperar contexto |

### Reglas para datos remotos

- Refrescar productos, precios, estado y vigencia antes de guardar o evaluar.
- No usar guardado optimista para alta, edición o cambio de estado.
- Distinguir ausencia de beneficio de error de consulta.
- Conservar el formulario ante errores recuperables.

## 10. Comportamiento responsivo

| Aspecto | Escritorio | Tablet | Móvil |
|---|---|---|---|
| Navegación | Completa | Condensada | Patrón global móvil |
| Encabezado | Acciones en fila | Ajuste | Acciones apiladas |
| Filtros | Tres columnas | Dos columnas | Una columna |
| Listado | Tabla completa | Scroll contenido | Scroll contenido |
| Formulario | Dos columnas | Ajustable | Una columna |
| Resultado | Tres métricas | Apilado parcial | Una columna |
| Modal | Centrado | Adaptable | Ancho disponible |

Verificar 320 px, zoom 200 %, nombres largos, importes y fechas completas.

## 11. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Encabezado principal único, campos etiquetados y errores asociados.
- Radios agrupados con leyenda y selección operable por teclado.
- Resultado y mensajes de éxito anunciados mediante región viva.
- Estados expresados textualmente.
- Foco gestionado en errores y diálogos.
- Controles táctiles de al menos 44 × 44 px.

## 12. Tono visual y contenido

- Densidad media/alta en listado y media en formularios.
- Sensación: control comercial y cálculo transparente.
- Dominante: condiciones de la promoción; en evaluación, importe resultante.
- Permanecen discretos: ayudas, metadatos y efectos históricos.
- Documentación, eventos y contratos nunca aparecen como contenido del producto.

### Microcopy crítica

| Contexto | Texto |
|---|---|
| CTA | `Crear promoción` |
| Porcentaje | `Ingresa un porcentaje mayor que 0 y hasta 100.` |
| Monto fijo | `Se aplica una vez al subtotal elegible.` |
| Selección | `Se aplicó la opción con el menor importe resultante.` |
| Desactivar | `Dejará de participar en nuevas evaluaciones.` |

## 13. Restricciones técnicas relevantes

- Prototipo estático; no prescribe librería de UI ni estrategia CSS.
- Rutas, endpoints y permisos concretos están pendientes.
- El backend vuelve a validar fechas, estado, productos y valores.
- La referencia temporal debe ser consistente, aunque no se expone al usuario.
- El precio vigente proviene de Gestión de Precios.
- El cupón solo podría consumirse fuera de este flujo si fue seleccionado y el
  pedido se confirmó.

## 14. Privacidad, seguridad y acciones sensibles

- Autorizar en servidor todas las acciones administrativas.
- Confirmar el cambio de estado.
- No exponer stack traces, tablas, servicios ni datos de pedidos.
- Evitar envíos duplicados.
- Sanear nombres y textos mostrados.

## 15. Criterios de aceptación del wireframe

- [x] Permite consultar, crear, editar, activar y desactivar promociones.
- [x] Exige nombre, productos, tipo, valor, fechas y estado.
- [x] Valida porcentaje, monto fijo y orden de fechas.
- [x] Mantiene la configuración previa tras un rechazo.
- [x] Representa monto fijo aplicado una sola vez y límite en cero.
- [x] Selecciona una única promoción automática.
- [x] Compara promoción y cupón sin acumularlos.
- [x] Prioriza el cupón en empate.
- [x] Muestra beneficio, original, descuento, resultante o motivo.
- [x] Separa documentación y detalles técnicos de la interfaz.
- [x] Es responsivo y consistente con `DESIGN.md`.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01–CA-04 | S-01, S-02, S-03 y permisos |
| CA-05–CA-08 | S-04 y variantes de resultado |
| CA-09 | S-03/S-05 y mensajes históricos |
| CA-10 | S-04, ALT-07 y A-12 a A-14 |

## 16. Supuestos

| ID | Supuesto | Impacto | Validar |
|---|---|---|---|
| `SUP-01` | Moneda visible PEN/S/ | Cambiar formato | Sí |
| `SUP-02` | Escritorio es principal | Repriorizar móvil | Sí |
| `SUP-03` | La evaluación administrativa usa un producto y subtotal de prueba | Cambiar composición | Sí |

## 17. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea | Estado |
|---|---|---|---|---|
| `Q-01` | ¿La promoción tiene modalidad automática/cupón como campo administrable aquí? | Producto | Formulario definitivo | Abierta |
| `Q-02` | ¿Cuáles son límites de nombre y cantidad de productos? | Producto/Backend | Validaciones finales | Abierta |
| `Q-03` | ¿Qué zona horaria se muestra en fechas? | Producto/Backend | Formato final | Abierta |
| `Q-04` | ¿La evaluación administrativa forma parte del producto final o solo del prototipo? | Producto | S-04 final | Abierta |
| `D-01` | Selección de librería UI y estrategia CSS | Frontend | Implementación | Pendiente |

## 18. Registro de revisiones

| Versión | Fecha | Autor | Cambio | Aprobado por |
|---|---|---|---|---|
| 0.1 | 2026-09-17 | Asistente | Flujo inicial basado en spec, HU, prototipo y `DESIGN.md` | Pendiente |

## 19. Lista de control

- [x] Fuentes y alcance identificados.
- [x] Pantallas y variantes inventariadas.
- [x] Criterios CA-01 a CA-10 cubiertos.
- [x] Cálculos y conflictos documentados.
- [x] Información técnica separada de la interfaz.
- [x] Prototipo HTML disponible.
- [ ] Resolver preguntas abiertas antes de implementación productiva.
