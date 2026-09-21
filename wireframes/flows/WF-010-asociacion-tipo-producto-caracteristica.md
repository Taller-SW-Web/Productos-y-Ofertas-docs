# WF-010 — Asociación entre tipos de producto y características

> **Fuente normativa de esta revisión:** `SPEC-010-asociacion-tipo-producto-caracteristica.md` y `HU-010-asociacion-tipo-producto-caracteristica.md` (21-09-2026). Las categorías se utilizan para navegación y NO definen características; el esquema de atributos pertenece a `tipo_producto_id`.

## 0. Instrucciones para el agente

Genera un wireframe detallado, anotado y navegable para la asociación entre **Tipos de Producto y Características** descrita en este archivo.

Antes de diseñar:
1. Consulta ../../specs/SPEC-010-asociacion-tipo-producto-caracteristica.md.
2. Consulta ../../hu/HU-010-asociacion-tipo-producto-caracteristica.md.
3. Consulta ../../DESIGN.md.
4. Usa este documento para la composición, interacción y estados del flujo.

Reglas de producción:
- Solo se asocian características activas a tipos de producto existentes y activos.
- No se permite asociar la misma característica dos veces al mismo tipo de producto.
- Límite operativo configurable: máximo 20 características activas asociadas por tipo de producto (`MAX_PRODUCT_TYPE_ATTRIBUTES = 20`).
- No existe herencia de características por categorías; las asociaciones son directas al tipo de producto.
- Cambio de obligatoriedad (opcional ↔ obligatoria) sin invalidar inmediatamente productos existentes (se exige en siguiente edición).
- Desasociación requiere confirmación y verificación de no afectación a variantes activas.
- No renderizar anotaciones A-xx en el DOM visible.
- Aplicar el estilo monocromático y de baja fidelidad de DESIGN.md.

---

## 1. Metadatos

| Campo | Valor |
|---|---|
| ID del wireframe | WF-010 |
| Nombre del flujo | Asociación entre tipos de producto y características |
| Versión | 1.0 (Consolidada) |
| Estado | Completado |
| Responsable | Leonardo Lopez (`lopez`) |
| Fecha | 2026-09-21 |

## 2. Trazabilidad

| Fuente | Identificador o sección | Aporte al flujo |
|---|---|---|
| Spec | SPEC-010-asociacion-tipo-producto-caracteristica.md, secciones 1–6 | Requisitos técnicos, límites y reglas de negocio |
| Historia de usuario | HU-010-asociacion-tipo-producto-caracteristica.md, CA-01 a CA-12 | Criterios de aceptación y escenarios BDD |
| Diseño | DESIGN.md | Lenguaje visual monocromático y accesible |

---

## 3. Matriz de Pantallas y Estados

| ID Pantalla | Nombre de Pantalla | Tipo | Descripción |
|---|---|---|---|
| `S-01` | Catálogo de Tipos de Producto | Principal | Listado de tipos de producto con contador de atributos asociados y estado. |
| `S-01-E` | Error / Vacío de Tipos | Estado alterno | Pantalla ante fallo de carga o cuando no existen tipos de producto registrados. |
| `S-02` | Detalle del Tipo y Esquema de Atributos | Principal | Vista detallada con la tabla de características asignadas (Nombre, Tipo, Obligatoriedad, Acciones). |
| `S-02-E` | Error de Asociación / Límite de 20 | Modal / Estado | Alerta ante intento de superar 20 atributos o desasociar atributo con variantes activas. |
| `S-03` | Modal Asociar Característica | Modal interactivo | Diálogo para seleccionar característica activa, fijar obligatoriedad y guardar. |

---

## 4. Descripción Detallada de Flujos

### Flujo Principal A: Consulta y Gestión del Esquema de un Tipo de Producto
1. El gestor accede a `S-01` y visualiza la lista de tipos de producto (ej. Calzado Deportivo, Ropa de Entrenamiento, Balones y Accesorios).
2. Selecciona un tipo de producto y navega a `S-02`.
3. En `S-02` visualiza las características actualmente vinculadas, su tipo de dato (`LISTA`, `TEXTO`, `NUMERO`) y su condición (`Obligatoria` / `Opcional`).
4. Puede conmutar la obligatoriedad mediante acción directa, registrando el cambio de versión del esquema.

### Flujo Principal B: Asociar Nueva Característica al Tipo
1. En `S-02`, el gestor pulsa el botón **Asociar característica**.
2. Se despliega el modal `S-03`.
3. Selecciona una característica activa del catálogo (no asociada previamente).
4. Define si será **Obligatoria** u **Opcional**.
5. Al pulsar **Guardar asociación**, el sistema valida que no se superen las 20 características activas. Si es válido, se agrega al listado; si se alcanza el límite, se muestra `S-02-E`.

### Flujo Alterno C: Desasociación Segura
1. En `S-02`, el gestor selecciona la acción **Desasociar** en una característica.
2. El sistema valida si existen variantes activas que utilicen dicha característica como identificadora. Si no hay conflicto, solicita confirmación y desasocia. Si hay conflicto, muestra alerta explicativa.
