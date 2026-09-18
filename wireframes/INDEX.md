# Índice de funcionalidades y wireframes

Este índice registra la asignación de funcionalidades por rama, autor y los
artefactos de documentación asociados del repositorio **Productos y Ofertas**.

## Criterio de asignación

La funcionalidad se asignó según el historial de commits y merges de cada rama,
considerando los archivos de especificación y de historia de usuario que fueron
creados o corregidos desde esa rama. La asignación corresponde a la rama de
trabajo indicada por el equipo, aunque algunos commits de integración aparezcan
firmados por otro usuario o por GitHub Actions.

Las ramas de trabajo se sincronizan posteriormente con `master`; por eso, que
una rama tenga actualmente el mismo contenido que `master` no significa que no
haya sido la rama de origen de una funcionalidad.

## Responsables

| Rama | Autor | Área funcional asignada |
|---|---|---|
| `poma` | Gabriel Poma Gutierrez | Productos y variantes SKU |
| `castilla` | Marco Renato Castilla Huanca | Carga/exportación masiva y combos |
| `cueva` | Axel Andree Cueva Alcalá | Cupones, ofertas/promociones y venta cruzada |
| `lopez` | Leonardo Lopez | Taxonomía, características, marcas y SEO |
| `vera` | Leonardo Vera Rodríguez | Precios y auditoría de precios |
| `taco` | Miguel Ángel Taco Zavala | Inventario, analítica y alertas de stock |

## Inventario

Los identificadores `WF-001` y `WF-002` corresponden a los flows y prototipos
HTML ya existentes. Los identificadores restantes quedan reservados para que cada
responsable cree sus artefactos sin duplicar numeración.

| ID | Funcionalidad | Rama | Responsable | Spec | HU | Flow | Prototipo HTML | Estado |
|---|---|---|---|---|---|---|---|---|
| WF-001 | Carga y exportación masiva de productos | `castilla` | Marco Renato Castilla Huanca | [Spec](../specs/spec_carga_exportacion_masiva_productos.md) | [HU](../hu/hu_carga_exportacion_masiva_productos.md) | [Flow](flows/WF-001-carga-exportacion-masiva-productos.md) | [Prototipo](prototipos/WF-001-carga-exportacion-masiva-productos/index.html) | Completado |
| WF-002 | Gestión de combos de productos | `castilla` | Marco Renato Castilla Huanca | [Spec](../specs/spec_gestion_combos_productos.md) | [HU](../hu/hu_gestion_combos_productos.md) | [Flow](flows/WF-002-gestion-combos-productos.md) | [Prototipo](prototipos/WF-002-gestion-combos-productos/index.html) | Completado |
| WF-003 | Gestión de productos (CRUD principal) | `poma` | Gabriel Poma Gutierrez | [Spec](../specs/spec_gestion_productos_crud.md) | [HU](../hu/hu_gestion_productos_crud.md) | `flows/WF-003-gestion-productos-crud.md` | `prototipos/WF-003-gestion-productos-crud/index.html` | Pendiente |
| WF-004 | Gestión avanzada de variantes (SKUs) | `poma` | Gabriel Poma Gutierrez | [Spec](../specs/spec_gestion_variantes_skus.md) | [HU](../hu/hu_gestion_variantes_skus.md) | `flows/WF-004-gestion-variantes-skus.md` | `prototipos/WF-004-gestion-variantes-skus/index.html` | Pendiente |
| WF-005 | Gestión de cupones de descuento | `cueva` | Axel Andree Cueva Alcalá | [Spec](../specs/spec_gestion_cupones_descuento.md) | [HU](../hu/hu_gestion_cupones_descuento.md) | `flows/WF-005-gestion-cupones-descuento.md` | `prototipos/WF-005-gestion-cupones-descuento/index.html` | Pendiente |
| WF-006 | Gestión de ofertas y promociones | `cueva` | Axel Andree Cueva Alcalá | [Spec](../specs/spec_gestion_ofertas_promociones.md) | [HU](../hu/hu_gestion_ofertas_promociones.md) | `flows/WF-006-gestion-ofertas-promociones.md` | `prototipos/WF-006-gestion-ofertas-promociones/index.html` | Pendiente |
| WF-007 | Reglas de venta cruzada y upselling | `cueva` | Axel Andree Cueva Alcalá | [Spec](../specs/spec_reglas_venta_cruzada_upselling.md) | [HU](../hu/hu_reglas_venta_cruzada_upsell.md) | `flows/WF-007-reglas-venta-cruzada-upselling.md` | `prototipos/WF-007-reglas-venta-cruzada-upselling/index.html` | Pendiente |
| WF-008 | Gestión de categorías y subcategorías | `lopez` | Leonardo Lopez | [Spec](../specs/spec_gestion_categorias.md) | [HU](../hu/hu_gestion_categorias.md) | [Flow](flows/WF-008-gestion-categorias.md) | [Prototipo](prototipos/WF-008-gestion-categorias/index.html) | Borrador |
| WF-009 | Gestión de características y sus valores | `lopez` | Leonardo Lopez | [Spec](../specs/spec_gestion_caracteristicas.md) | [HU](../hu/hu_gestion_caracteristicas.md) | [Flow](flows/WF-009-gestion-caracteristicas.md) | [Prototipo](prototipos/WF-009-gestion-caracteristicas/index.html) | Borrador |
| WF-010 | Asociación entre categorías y características | `lopez` | Leonardo Lopez | [Spec](../specs/spec_asociacion_categoria_caracteristica.md) | [HU](../hu/hu_asociacion_categoria_caracteristica.md) | [Flow](flows/WF-010-asociacion-categoria-caracteristica.md) | [Prototipo](prototipos/WF-010-asociacion-categoria-caracteristica/index.html) | Borrador |
| WF-011 | Gestión de marcas | `lopez` | Leonardo Lopez | [Spec](../specs/spec_gestion_marcas.md) | [HU](../hu/hu_gestion_marcas.md) | [Flow](flows/WF-011-gestion-marcas.md) | [Prototipo](prototipos/WF-011-gestion-marcas/index.html) | Borrador |
| WF-012 | Gestión de SEO y metadatos | `lopez` | Leonardo Lopez | [Spec](../specs/spec_seo_metadatos.md) | [HU](../hu/hu_seo_metadatos.md) | [Flow](flows/WF-012-seo-metadatos.md) | [Prototipo](prototipos/WF-012-seo-metadatos/index.html) | Borrador |
| WF-013 | Gestión de precios individuales y masivos | `vera` | Leonardo Vera Rodríguez | [Spec](../specs/spec_gestion_precios.md) | [HU](../hu/hu_gestion_precios.md) | `flows/WF-013-gestion-precios.md` | `prototipos/WF-013-gestion-precios/index.html` | Pendiente |
| WF-014 | Historial de auditoría de precios | `vera` | Leonardo Vera Rodríguez | [Spec](../specs/spec_auditoria_precios.md) | [HU](../hu/hu_auditoria_precios.md) | `flows/WF-014-auditoria-precios.md` | `prototipos/WF-014-auditoria-precios/index.html` | Pendiente |
| WF-015 | Gestión de inventario (control de stock) | `taco` | Miguel Ángel Taco Zavala | [Spec](../specs/spec_gestion_inventario.md) | [HU](../hu/hu_gestion_inventario.md) | [Flow](flows/WF-015-gestion-inventario.md) | [Prototipo](prototipos/WF-015-gestion-inventario/index.html) | Borrador |
| WF-016 | Dashboard analítico y alertas de stock | `taco` | Miguel Ángel Taco Zavala | [Spec](../specs/spec_dashboard_alertas_stock.md) | [HU](../hu/hu_dashboard_alertas_stock.md) | [Flow](flows/WF-016-dashboard-alertas-stock.md) | [Prototipo](prototipos/WF-016-dashboard-alertas-stock/index.html) | Borrador |

## Evidencia resumida por rama

| Rama | Evidencia principal del historial | Funcionalidades identificadas |
|---|---|---|
| `poma` | Commits de carga/corrección de productos y variantes SKU | WF-003, WF-004 |
| `castilla` | Commits de carga masiva, combos, flows y prototipos HTML de `WF-001`/`WF-002` | WF-001, WF-002 |
| `cueva` | Commits de corrección de cupones, promociones y venta cruzada | WF-005, WF-006, WF-007 |
| `lopez` | Commits de taxonomía, categorías, características, marcas y SEO | WF-008, WF-009, WF-010, WF-011, WF-012 |
| `vera` | Commits de gestión e historial de precios | WF-013, WF-014 |
| `taco` | Commits de inventario/control de stock y analítica | WF-015, WF-016 |

## Convenciones de artefactos

- Los flows Markdown se guardan en `wireframes/flows/`.
- Los prototipos navegables se guardan en `wireframes/prototipos/`.
- Cada prototipo debe tener `index.html` como punto de entrada.
- Los prototipos HTML son estáticos, navegables y sin compilación; no forman
  parte de la implementación productiva del repositorio frontend.
- Las rutas de flow y prototipo de este índice son reservas documentales; si el
  archivo todavía no existe, su estado permanece como `Pendiente`.

## Regla para actualizar el índice

Cada responsable debe conservar el ID asignado y actualizar únicamente el
estado y las rutas de sus artefactos cuando cree el flow o el prototipo. La
integración de cambios de estado en este índice debe realizarse sobre `master`
para evitar conflictos entre ramas.
