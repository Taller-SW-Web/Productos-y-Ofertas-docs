# WF-006 — Gestión de ofertas y promociones

> **Fuente normativa de esta revisión:** `specs_consolidado_final.md` y `hu_consolidado_final.md` (18-09-2026). Los nombres/eventos de Ventas y Postventa son contratos **provisionales no homologados**; el prototipo no debe simular pagos realizados ni confirmaciones externas como si estuvieran implementadas. Las anotaciones, supuestos, preguntas y referencias técnicas permanecen en este documento y no se muestran como elementos de la interfaz simulada.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la administración de
promociones descrita en este archivo.

Antes de diseñar:

1. Consulta `../../specs/SPEC-006-gestion-ofertas-promociones.md`.
2. Consulta `../../hu/HU-006-gestion-ofertas-promociones.md`.
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
- No acumules promociones automáticas entre sí, con cupones ni con precio de oferta de Pricing.
- Si hay empate entre promoción automática y cupón, prioriza el cupón.
- Modificar o desactivar no cambia pedidos ya confirmados.
- No muestres criterios CA, endpoints, supuestos, decisiones técnicas ni
  anotaciones `A-xx` dentro de la interfaz simulada; son documentación.
- Usa datos ficticios y no consumas servicios externos.
- Aplica el estilo monocromático de baja fidelidad de `DESIGN.md`.

### Formato del entregable

- Entrada: `../prototipos/WF-006-gestion-ofertas-promociones/index.html`.
- HTML, CSS y JavaScript estáticos y navegables.
- Debe representar listado, alta/edición, detalle y cambio de estado. La evaluación comercial existe como capacidad de API/flujo real y no como pantalla administrativa.
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
| Última actualización | 2026-09-18 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte |
|---|---|---|
| Spec | `SPEC-006-gestion-ofertas-promociones.md`, secciones 3–6 | Alcance, cálculo, selección y restricciones |
| Historia de usuario | `HU-PROM-01`, CA-01 a CA-10 | Necesidad y escenarios verificables |
| Diseño | `DESIGN.md` | Lenguaje visual y reglas responsivas |

### Funcionalidades incluidas

- Consultar, buscar y filtrar promociones.
- Crear y editar condiciones, descuento, vigencia, estado y productos.
- Activar y desactivar promociones.
- Consultar el detalle.

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
| Necesidad | Configurar beneficios válidos y controlar su vigencia, alcance y estado |
| Permisos | Consultar, crear, editar, activar y desactivar |
| Dispositivo | Escritorio, con soporte tablet y móvil |

## 4. Objetivo del flujo

**El usuario debe poder** configurar y administrar una promoción válida **para** que los canales puedan evaluarla dentro de las reglas comerciales definidas, sin convertir esa evaluación en una pantalla administrativa.

### Resultado exitoso

La promoción queda visible con modalidad, tipo, valor, productos/SKUs, vigencia y estado, lista para ser consumida por la lógica de evaluación de los canales.

### Indicador de finalización

Confirmación no bloqueante y listado o detalle actualizado después de crear, editar o cambiar el estado.

## 5. Precondiciones y disparador

### Precondiciones

- Sesión válida y permiso de Gestor Comercial.
- Existen productos activos y precios vigentes consultables.

### Punto de entrada

- Ubicación: Productos y ofertas, sección Promociones.
- Disparadores: `Crear promoción` o `Ver detalle`.

### Salidas

| Resultado | Comportamiento |
|---|---|
| Éxito | Actualiza listado o detalle de la promoción |
| Cancelación | Vuelve sin persistir cambios |
| Validación fallida | Conserva datos e identifica campos |
| Error remoto | Mantiene contexto y permite reintentar |

## 6. Secuencia principal

1. El gestor abre el listado.
2. Selecciona `Crear promoción`.
3. Ingresa nombre, modalidad (AUTOMATICA o CUPON), tipo, valor, estado y vigencia.
4. Selecciona uno o más productos y/o SKUs vendibles activos.
5. El sistema valida y el gestor guarda.
6. La promoción aparece en el listado.
7. El gestor puede consultar, editar o cambiar su estado.

### Flujos alternativos

| ID | Condición | Respuesta | Retorno |
|---|---|---|---|
| `ALT-01` | Porcentaje fuera de rango | Bloquear y mostrar rango válido | Formulario |
| `ALT-02` | Monto fijo no positivo | Bloquear y explicar aplicación única | Formulario |
| `ALT-03` | Fin no posterior al inicio | Asociar error al campo fin | Formulario |
| `ALT-04` | Sin productos | Solicitar al menos uno | Formulario |

## 7. Inventario de pantallas y variantes

| ID | Pantalla o variante | Propósito | Presentación | Obligatoria |
|---|---|---|---|---|
| `S-01` | Listado | Consultar y acceder a acciones | Vista principal | Sí |
| `S-01-E` | Sin resultados | Recuperar filtros | Misma vista | Sí |
| `S-02` | Crear/editar | Configurar promoción | Formulario | Sí |
| `S-02-V` | Validación fallida | Corregir sin perder datos | Misma vista | Sí |
| `S-03` | Detalle | Revisar condiciones y productos | Vista de detalle | Sí |
| `S-04` | Confirmar estado | Evitar cambios accidentales | Diálogo | Sí |

## 8. Especificación por pantalla

### `S-01` — Listado de promociones

1. Título `Ofertas y promociones`.
2. Acción principal `Crear promoción`.
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
| Tipo de descuento | Radio | Sí | Porcentaje o monto fijo | N/A |
| Modalidad | Selector | Sí | `AUTOMATICA` o `CUPON` | `Selecciona la modalidad` |
| Valor | Número | Sí | Porcentaje `(0,100]`; monto `(0,∞)` | Mensaje específico por tipo |
| Estado | Selector | Sí | Activa o inactiva | N/A |
| Inicio | Fecha/hora | Sí | Valor válido | `Indica el inicio` |
| Fin | Fecha/hora | Sí | Posterior al inicio | `El fin debe ser posterior al inicio` |
| Alcance | Selección múltiple | Sí | Al menos un producto y/o SKU vendible activo; deduplicar SKU incluido por producto | `Selecciona al menos un producto o SKU` |

- Cambiar el tipo actualiza la ayuda del valor.
- Conservar datos tras error y la última configuración válida en edición.
- Bloquear envíos duplicados durante el guardado.
- No presentar edición de precios ni stock.

| ID | Elemento | Anotación |
|---|---|---|
| `A-05` | Tipo de descuento | Solo un tipo de descuento; la modalidad AUTOMATICA/CUPON es un campo independiente |
| `A-06` | Ayuda de monto fijo | Aclarar que se aplica una vez al subtotal elegible |
| `A-07` | Productos | Mostrar únicamente productos existentes y activos |
| `A-08` | Guardado inválido | Mantener todos los valores para corregirlos |

### `S-03` — Detalle

- Mostrar nombre, modalidad, tipo de descuento, valor, estado, vigencia y productos/SKUs participantes.
- Acciones `Editar`, `Activar/Desactivar` y `Volver`.
- Mostrar aviso de que cambios futuros no alteran pedidos confirmados.

| ID | Elemento | Anotación |
|---|---|---|
| `A-09` | Resumen | Priorizar descuento, vigencia y estado |
| `A-10` | Productos | Lista solo de lectura en detalle |
| `A-11` | Persistencia histórica | Explicar efecto sin exponer arquitectura |

### `S-04` — Confirmar activación o desactivación

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
| Conflicto de datos | Aviso de precios/estado vigentes | Revisar | Recargar |
| Sin permisos | Mensaje seguro | Volver | Solicitar acceso |
| Sesión expirada | Aviso | Iniciar sesión | Recuperar contexto |

### Reglas para datos remotos

- Refrescar productos, precios, estado y vigencia antes de guardar. La evaluación de beneficios ocurre en los canales/servicios reales, no en una pantalla administrativa de este wireframe.
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
- Dominante: condiciones de la promoción, su alcance, vigencia y estado.
- Permanecen discretos: ayudas, metadatos y efectos históricos.
- Documentación, eventos y contratos nunca aparecen como contenido del producto.

### Microcopy crítica

| Contexto | Texto |
|---|---|
| CTA | `Crear promoción` |
| Porcentaje | `Ingresa un porcentaje mayor que 0 y hasta 100.` |
| Monto fijo | `Se aplica una vez al subtotal elegible.` |
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
- [x] Separa documentación y detalles técnicos de la interfaz.
- [x] Es responsivo y consistente con `DESIGN.md`.

### Cobertura de la historia de usuario

| Criterio | Cobertura |
|---|---|
| CA-01–CA-04 | S-01, S-02, S-03 y permisos |
| CA-05–CA-08 | Reglas de negocio/API en Spec/HU; el backoffice no incorpora pantalla de evaluación |
| CA-09 | S-03/S-04 y mensajes históricos |
| CA-10 | Regla de modalidad y evaluación documentada en Spec/HU; sin simulador administrativo |

## 16. Supuestos

| ID | Supuesto | Impacto | Validar |
|---|---|---|---|
| `SUP-01` | Moneda visible PEN/S/ | Cambiar formato | Sí |
| `SUP-02` | Escritorio es principal | Repriorizar móvil | Sí |

## 17. Preguntas y decisiones pendientes

| ID | Pregunta o decisión | Responsable | Bloquea | Estado |
|---|---|---|---|---|
| `Q-01` | Resuelto: la modalidad `AUTOMATICA` / `CUPON` es obligatoria y visible en formulario y detalle. | Specs/HU definitivos | No | Resuelta |
| `Q-02` | ¿Cuáles son límites de nombre y cantidad de productos? | Producto/Backend | Validaciones finales | Abierta |
| `Q-03` | ¿Qué zona horaria se muestra en fechas? | Producto/Backend | Formato final | Abierta |
| `Q-04` | Resuelto: no existe pantalla administrativa «Evaluar compra»; la evaluación permanece como capacidad de API/flujo real de venta. | Decisión de producto | No | Resuelta |
| `D-01` | Selección de librería UI y estrategia CSS | Frontend | Implementación | Pendiente |

### Alineación definitiva de Promociones

- **Modalidad obligatoria `AUTOMATICA | CUPON`** distinta del tipo de descuento (porcentaje/monto fijo). Una promoción `CUPON` no se ofrece automáticamente: solo entra en la evaluación mediante un código válido. La modalidad solo se edita antes de primera activación, sin cupones asociados ni usos; en los otros casos mostrar control bloqueado y explicación, sin inventar una transición.
- Selector de alcance por **producto completo o SKU vendible específico**: a nivel producto aplica a todos sus SKUs activos; al coincidir producto y SKU, se deduplica el beneficio por unidad elegible.
- La base de los descuentos es el **precio regular vigente por SKU × cantidad**. Comparar el **total final de la misma cesta**, conservando líneas no elegibles. La oferta Pricing es alternativa independiente, no base acumulativa. Empate cupón/automática: cupón; empate con oferta Pricing: oferta Pricing y no se consume cupón. Usar importe monetario final, no porcentaje nominal.
- La evaluación comercial de promociones permanece en la API y en los flujos reales de los canales. **No existe una pantalla administrativa para simularla**; el backoffice se limita a configurar, consultar y cambiar el estado de promociones. Los contratos con Ventas siguen sujetos a homologación.

## 18. Registro de revisiones

| Versión | Fecha | Autor | Cambio | Aprobado por |
|---|---|---|---|---|
| 0.1 | 2026-09-17 | Asistente | Flujo inicial basado en spec, HU, prototipo y `DESIGN.md` | Pendiente |
| 0.3 | 2026-09-18 | Asistente | Alineación de wireframe con Specs/HU definitivos y contratos externos provisionales; ver registro de cambios. | Pendiente de revisión del equipo |

## 19. Lista de control

- [x] Fuentes y alcance identificados.
- [x] Pantallas y variantes inventariadas.
- [x] Criterios CA-01 a CA-10 cubiertos.
- [x] Cálculos y conflictos documentados.
- [x] Información técnica separada de la interfaz.
- [x] Prototipo HTML disponible.
- [ ] Resolver preguntas abiertas antes de implementación productiva.

---
