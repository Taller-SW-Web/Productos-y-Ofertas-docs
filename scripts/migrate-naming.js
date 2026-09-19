const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const mappings = [
  {
    id: '001',
    slug: 'carga-exportacion-masiva-productos',
    oldSpec: 'specs/spec_carga_exportacion_masiva_productos.md',
    newSpec: 'specs/SPEC-001-carga-exportacion-masiva-productos.md',
    oldHu: 'hu/hu_carga_exportacion_masiva_productos.md',
    newHu: 'hu/HU-001-carga-exportacion-masiva-productos.md',
  },
  {
    id: '002',
    slug: 'gestion-combos-productos',
    oldSpec: 'specs/spec_gestion_combos_productos.md',
    newSpec: 'specs/SPEC-002-gestion-combos-productos.md',
    oldHu: 'hu/hu_gestion_combos_productos.md',
    newHu: 'hu/HU-002-gestion-combos-productos.md',
  },
  {
    id: '003',
    slug: 'gestion-productos-crud',
    oldSpec: 'specs/spec_gestion_productos_crud.md',
    newSpec: 'specs/SPEC-003-gestion-productos-crud.md',
    oldHu: 'hu/hu_gestion_productos_crud.md',
    newHu: 'hu/HU-003-gestion-productos-crud.md',
  },
  {
    id: '004',
    slug: 'gestion-variantes-skus',
    oldSpec: 'specs/spec_gestion_variantes_skus.md',
    newSpec: 'specs/SPEC-004-gestion-variantes-skus.md',
    oldHu: 'hu/hu_gestion_variantes_skus.md',
    newHu: 'hu/HU-004-gestion-variantes-skus.md',
  },
  {
    id: '005',
    slug: 'gestion-cupones-descuento',
    oldSpec: 'specs/spec_gestion_cupones_descuento.md',
    newSpec: 'specs/SPEC-005-gestion-cupones-descuento.md',
    oldHu: 'hu/hu_gestion_cupones_descuento.md',
    newHu: 'hu/HU-005-gestion-cupones-descuento.md',
  },
  {
    id: '006',
    slug: 'gestion-ofertas-promociones',
    oldSpec: 'specs/spec_gestion_ofertas_promociones.md',
    newSpec: 'specs/SPEC-006-gestion-ofertas-promociones.md',
    oldHu: 'hu/hu_gestion_ofertas_promociones.md',
    newHu: 'hu/HU-006-gestion-ofertas-promociones.md',
  },
  {
    id: '007',
    slug: 'reglas-venta-cruzada-upselling',
    oldSpec: 'specs/spec_reglas_venta_cruzada_upselling.md',
    newSpec: 'specs/SPEC-007-reglas-venta-cruzada-upselling.md',
    oldHu: 'hu/hu_reglas_venta_cruzada_upsell.md',
    newHu: 'hu/HU-007-reglas-venta-cruzada-upselling.md',
  },
  {
    id: '008',
    slug: 'gestion-categorias',
    oldSpec: 'specs/spec_gestion_categorias.md',
    newSpec: 'specs/SPEC-008-gestion-categorias.md',
    oldHu: 'hu/hu_gestion_categorias.md',
    newHu: 'hu/HU-008-gestion-categorias.md',
  },
  {
    id: '009',
    slug: 'gestion-caracteristicas',
    oldSpec: 'specs/spec_gestion_caracteristicas.md',
    newSpec: 'specs/SPEC-009-gestion-caracteristicas.md',
    oldHu: 'hu/hu_gestion_caracteristicas.md',
    newHu: 'hu/HU-009-gestion-caracteristicas.md',
  },
  {
    id: '010',
    slug: 'asociacion-categoria-caracteristica',
    oldSpec: 'specs/spec_asociacion_categoria_caracteristica.md',
    newSpec: 'specs/SPEC-010-asociacion-categoria-caracteristica.md',
    oldHu: 'hu/hu_asociacion_categoria_caracteristica.md',
    newHu: 'hu/HU-010-asociacion-categoria-caracteristica.md',
  },
  {
    id: '011',
    slug: 'gestion-marcas',
    oldSpec: 'specs/spec_gestion_marcas.md',
    newSpec: 'specs/SPEC-011-gestion-marcas.md',
    oldHu: 'hu/hu_gestion_marcas.md',
    newHu: 'hu/HU-011-gestion-marcas.md',
  },
  {
    id: '012',
    slug: 'seo-metadatos',
    oldSpec: 'specs/spec_seo_metadatos.md',
    newSpec: 'specs/SPEC-012-seo-metadatos.md',
    oldHu: 'hu/hu_seo_metadatos.md',
    newHu: 'hu/HU-012-seo-metadatos.md',
  },
  {
    id: '013',
    slug: 'gestion-precios-individuales-masivos',
    oldSpec: 'specs/spec_gestion_precios.md',
    newSpec: 'specs/SPEC-013-gestion-precios-individuales-masivos.md',
    oldHu: 'hu/hu_gestion_precios.md',
    newHu: 'hu/HU-013-gestion-precios-individuales-masivos.md',
  },
  {
    id: '014',
    slug: 'historial-auditoria-precios',
    oldSpec: 'specs/spec_auditoria_precios.md',
    newSpec: 'specs/SPEC-014-historial-auditoria-precios.md',
    oldHu: 'hu/hu_auditoria_precios.md',
    newHu: 'hu/HU-014-historial-auditoria-precios.md',
  },
  {
    id: '015',
    slug: 'gestion-inventario',
    oldSpec: 'specs/spec_gestion_inventario.md',
    newSpec: 'specs/SPEC-015-gestion-inventario.md',
    oldHu: 'hu/hu_gestion_inventario.md',
    newHu: 'hu/HU-015-gestion-inventario.md',
  },
  {
    id: '016',
    slug: 'dashboard-alertas-stock',
    oldSpec: 'specs/spec_dashboard_alertas_stock.md',
    newSpec: 'specs/SPEC-016-dashboard-alertas-stock.md',
    oldHu: 'hu/hu_dashboard_alertas_stock.md',
    newHu: 'hu/HU-016-dashboard-alertas-stock.md',
  },
];

console.log('--- Ejecutando migración mediante git mv ---');

mappings.forEach(m => {
  const oldSpecPath = path.join(rootDir, m.oldSpec);
  const newSpecPath = path.join(rootDir, m.newSpec);
  if (fs.existsSync(oldSpecPath)) {
    execSync(`git mv "${m.oldSpec}" "${m.newSpec}"`, { cwd: rootDir, stdio: 'inherit' });
    console.log(`✓ Spec renombrado: ${m.oldSpec} -> ${m.newSpec}`);
  } else if (fs.existsSync(newSpecPath)) {
    console.log(`ℹ Spec ya renombrado: ${m.newSpec}`);
  } else {
    console.warn(`⚠ Spec no encontrado: ${m.oldSpec}`);
  }

  const oldHuPath = path.join(rootDir, m.oldHu);
  const newHuPath = path.join(rootDir, m.newHu);
  if (fs.existsSync(oldHuPath)) {
    execSync(`git mv "${m.oldHu}" "${m.newHu}"`, { cwd: rootDir, stdio: 'inherit' });
    console.log(`✓ HU renombrado: ${m.oldHu} -> ${m.newHu}`);
  } else if (fs.existsSync(newHuPath)) {
    console.log(`ℹ HU ya renombrado: ${m.newHu}`);
  } else {
    console.warn(`⚠ HU no encontrado: ${m.oldHu}`);
  }
});

console.log('--- Migración de archivos completada ---');
