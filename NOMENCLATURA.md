# Estándar y Reglas de Nomenclatura del Proyecto

Este documento establece la regla oficial de nomenclatura para todos los artefactos de diseño y especificación del repositorio (**Wireframes**, **Especificaciones Funcionales** e **Historias de Usuario**), tomando como referencia el estándar consolidado en el módulo de wireframes.

---

## 1. Fundamento y Patrón Base (Ejemplo de Wireframes)

En el subsistema de wireframes (`wireframes/`), el estándar adoptado se compone de:

1. **Identificador correlativo fijo de 3 dígitos con prefijo en mayúsculas:** `WF-001` a `WF-016`.
2. **Nombre de archivo y carpeta en kebab-case:** Todo en minúsculas, sin tildes, sin caracteres especiales, separado exclusivamente por guiones medios `-`.
3. **Prefijo en el nombre de archivo:** El identificador precede directamente al nombre descriptivo:
   - *Flow Markdown:* `wireframes/flows/WF-001-carga-exportacion-masiva-productos.md`
   - *Prototipo HTML:* `wireframes/prototipos/WF-001-carga-exportacion-masiva-productos/index.html`
4. **Encabezado Markdown normalizado:**
   `# WF-XXX — [Nombre formal de la funcionalidad]`
5. **Anotaciones y códigos internos:** Formato alfanumérico secuencial en mayúsculas con guion (`A-01`, `A-02`, ...).

---

## 2. Regla General de Nomenclatura

Para garantizar la **trazabilidad 1:1** entre la definición funcional (Spec), la necesidad de usuario (HU) y la representación visual/interactiva (WF), se adopta la misma estructura:

### Sintaxis del Nombre de Archivo

```text
{TIPO}-{NUMERO_3_DIGITOS}-{nombre-funcional-en-kebab-case}.md
```

| Componente | Regla | Ejemplos |
|---|---|---|
| **Tipo (`TIPO`)** | Prefijo estándar de 2 a 4 letras en mayúsculas que identifica el tipo de artefacto: <br>• `WF`: Wireframe (Flow / Prototipo) <br>• `SPEC`: Especificación Técnica / Funcional <br>• `HU`: Historia de Usuario | `WF`, `SPEC`, `HU` |
| **Separador 1** | Guion simple `-` | `-` |
| **Correlativo (`NUMERO`)** | 3 dígitos rellenados con ceros a la izquierda, correlacionado de forma unívoca con la funcionalidad asignada (001 al 016). | `001`, `002`, `014` |
| **Separador 2** | Guion simple `-` | `-` |
| **Slug (`kebab-case`)** | Nombre conciso y semántico en minúsculas, palabras separadas por guiones `-`. Debe ser **estrictamente idéntico** en los tres artefactos de una misma funcionalidad. | `carga-exportacion-masiva-productos`, `gestion-productos-crud` |
| **Extensión** | `.md` para documentos de especificación; carpeta para prototipos interactivos. | `.md`, `/` |

---

## 3. Estructura Interna por Tipo de Artefacto

### 3.1. Historias de Usuario (`hu/`)
- **Ruta:** `hu/HU-XXX-{slug}.md`
- **Título principal:**
  ```markdown
  # HU-XXX — Historia de Usuario: [Nombre de la Funcionalidad]
  ```
- **Metadatos y autoría:**
  ```markdown
  **Responsable:** [Nombre del Autor]
  **Rama:** `[nombre-rama]`
  **Trazabilidad:** Spec [SPEC-XXX](.../specs/SPEC-XXX-{slug}.md) | Flow [WF-XXX](.../wireframes/flows/WF-XXX-{slug}.md)
  ```
- **Criterios de Aceptación:** `CA-01`, `CA-02`, etc.
- **Escenarios de Prueba (BDD):** `Escenario 1: [Nombre]`, `Escenario 2: [Nombre]` con estructura `DADO / CUANDO / ENTONCES`.

### 3.2. Especificaciones Funcionales (`specs/`)
- **Ruta:** `specs/SPEC-XXX-{slug}.md`
- **Título principal:**
  ```markdown
  # SPEC-XXX — Especificación: [Nombre de la Funcionalidad]
  ```
- **Metadatos:**
  ```markdown
  **Responsable:** [Nombre del Autor]
  **Rama:** `[nombre-rama]`
  **Trazabilidad:** HU [HU-XXX](.../hu/HU-XXX-{slug}.md) | Wireframe [WF-XXX](.../wireframes/flows/WF-XXX-{slug}.md)
  ```
- **Requisitos de Sistema:** `Requisito 1: [Nombre]`, `Requisito 2: [Nombre]`.
- **Criterios y NFRs:** `RNF-01` o numeración formal secuencial.

### 3.3. Wireframes (`wireframes/`)
- **Flow:** `wireframes/flows/WF-XXX-{slug}.md`
- **Prototipo:** `wireframes/prototipos/WF-XXX-{slug}/index.html`
- **Título HTML:** `<title>WF-XXX — [Nombre de la Funcionalidad]</title>`
- **Anotaciones:** `A-01`, `A-02`, etc.

---

## 4. Matriz de Homologación Completa (WF vs SPEC vs HU)

A continuación se muestra la equivalencia exacta para las 16 funcionalidades del proyecto:

| ID | Rama | Responsable | Slug Unificado (`kebab-case`) | Archivo HU | Archivo Spec | Archivo Wireframe (Flow) | Carpeta Prototipo HTML |
|:---:|:---:|:---|:---|:---|:---|:---|:---|
| **001** | `castilla` | Marco Renato Castilla Huanca | `carga-exportacion-masiva-productos` | `HU-001-carga-exportacion-masiva-productos.md` | `SPEC-001-carga-exportacion-masiva-productos.md` | `WF-001-carga-exportacion-masiva-productos.md` | `WF-001-carga-exportacion-masiva-productos/` |
| **002** | `castilla` | Marco Renato Castilla Huanca | `gestion-combos-productos` | `HU-002-gestion-combos-productos.md` | `SPEC-002-gestion-combos-productos.md` | `WF-002-gestion-combos-productos.md` | `WF-002-gestion-combos-productos/` |
| **003** | `poma` | Gabriel Poma Gutierrez | `gestion-productos-crud` | `HU-003-gestion-productos-crud.md` | `SPEC-003-gestion-productos-crud.md` | `WF-003-gestion-productos-crud.md` | `WF-003-gestion-productos-crud/` |
| **004** | `poma` | Gabriel Poma Gutierrez | `gestion-variantes-skus` | `HU-004-gestion-variantes-skus.md` | `SPEC-004-gestion-variantes-skus.md` | `WF-004-gestion-variantes-skus.md` | `WF-004-gestion-variantes-skus/` |
| **005** | `cueva` | Axel Andree Cueva Alcalá | `gestion-cupones-descuento` | `HU-005-gestion-cupones-descuento.md` | `SPEC-005-gestion-cupones-descuento.md` | `WF-005-gestion-cupones-descuento.md` | `WF-005-gestion-cupones-descuento/` |
| **006** | `cueva` | Axel Andree Cueva Alcalá | `gestion-ofertas-promociones` | `HU-006-gestion-ofertas-promociones.md` | `SPEC-006-gestion-ofertas-promociones.md` | `WF-006-gestion-ofertas-promociones.md` | `WF-006-gestion-ofertas-promociones/` |
| **007** | `cueva` | Axel Andree Cueva Alcalá | `reglas-venta-cruzada-upselling` | `HU-007-reglas-venta-cruzada-upselling.md` | `SPEC-007-reglas-venta-cruzada-upselling.md` | `WF-007-reglas-venta-cruzada-upselling.md` | `WF-007-reglas-venta-cruzada-upselling/` |
| **008** | `lopez` | Leonardo Lopez | `gestion-categorias` | `HU-008-gestion-categorias.md` | `SPEC-008-gestion-categorias.md` | `WF-008-gestion-categorias.md` | `WF-008-gestion-categorias/` |
| **009** | `lopez` | Leonardo Lopez | `gestion-caracteristicas` | `HU-009-gestion-caracteristicas.md` | `SPEC-009-gestion-caracteristicas.md` | `WF-009-gestion-caracteristicas.md` | `WF-009-gestion-caracteristicas/` |
| **010** | `lopez` | Leonardo Lopez | `asociacion-categoria-caracteristica` | `HU-010-asociacion-categoria-caracteristica.md` | `SPEC-010-asociacion-categoria-caracteristica.md` | `WF-010-asociacion-categoria-caracteristica.md` | `WF-010-asociacion-categoria-caracteristica/` |
| **011** | `lopez` | Leonardo Lopez | `gestion-marcas` | `HU-011-gestion-marcas.md` | `SPEC-011-gestion-marcas.md` | `WF-011-gestion-marcas.md` | `WF-011-gestion-marcas/` |
| **012** | `lopez` | Leonardo Lopez | `seo-metadatos` | `HU-012-seo-metadatos.md` | `SPEC-012-seo-metadatos.md` | `WF-012-seo-metadatos.md` | `WF-012-seo-metadatos/` |
| **013** | `vera` | Leonardo Vera Rodríguez | `gestion-precios-individuales-masivos` | `HU-013-gestion-precios-individuales-masivos.md` | `SPEC-013-gestion-precios-individuales-masivos.md` | `WF-013-gestion-precios-individuales-masivos.md` | `WF-013-gestion-precios-individuales-masivos/` |
| **014** | `vera` | Leonardo Vera Rodríguez | `historial-auditoria-precios` | `HU-014-historial-auditoria-precios.md` | `SPEC-014-historial-auditoria-precios.md` | `WF-014-historial-auditoria-precios.md` | `WF-014-historial-auditoria-precios/` |
| **015** | `taco` | Miguel Ángel Taco Zavala | `gestion-inventario` | `HU-015-gestion-inventario.md` | `SPEC-015-gestion-inventario.md` | `WF-015-gestion-inventario.md` | `WF-015-gestion-inventario/` |
| **016** | `taco` | Miguel Ángel Taco Zavala | `dashboard-alertas-stock` | `HU-016-dashboard-alertas-stock.md` | `SPEC-016-dashboard-alertas-stock.md` | `WF-016-dashboard-alertas-stock.md` | `WF-016-dashboard-alertas-stock/` |

---

## 5. Discrepancias Actuales Resueltas

La homologación resuelve 3 discrepancias históricas identificadas en el repositorio:

1. **WF-007:**
   - Anterior: `hu/hu_reglas_venta_cruzada_upsell.md` vs `specs/spec_reglas_venta_cruzada_upselling.md`
   - Resuelto: Se estandariza como `reglas-venta-cruzada-upselling`.
2. **WF-013:**
   - Anterior: `hu/hu_gestion_precios.md` vs `specs/spec_gestion_precios.md` vs `WF-013-gestion-precios-individuales-masivos`
   - Resuelto: Se estandariza como `gestion-precios-individuales-masivos` para describir con precisión el alcance (individual y masivo).
3. **WF-014:**
   - Anterior: `hu/hu_auditoria_precios.md` vs `specs/spec_auditoria_precios.md` vs `WF-014-historial-auditoria-precios`
   - Resuelto: Se estandariza como `historial-auditoria-precios`.
