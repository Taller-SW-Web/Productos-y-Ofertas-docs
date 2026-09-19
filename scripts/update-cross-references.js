const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const items = [
  {
    id: '001',
    wfId: 'WF-001',
    specId: 'SPEC-001',
    huId: 'HU-001',
    title: 'Carga y exportación masiva de productos',
    slug: 'carga-exportacion-masiva-productos',
    oldSpecName: 'spec_carga_exportacion_masiva_productos.md',
    oldHuName: 'hu_carga_exportacion_masiva_productos.md',
    newSpecFile: 'SPEC-001-carga-exportacion-masiva-productos.md',
    newHuFile: 'HU-001-carga-exportacion-masiva-productos.md',
    wfFlowFile: 'WF-001-carga-exportacion-masiva-productos.md'
  },
  {
    id: '002',
    wfId: 'WF-002',
    specId: 'SPEC-002',
    huId: 'HU-002',
    title: 'Gestión de combos de productos',
    slug: 'gestion-combos-productos',
    oldSpecName: 'spec_gestion_combos_productos.md',
    oldHuName: 'hu_gestion_combos_productos.md',
    newSpecFile: 'SPEC-002-gestion-combos-productos.md',
    newHuFile: 'HU-002-gestion-combos-productos.md',
    wfFlowFile: 'WF-002-gestion-combos-productos.md'
  },
  {
    id: '003',
    wfId: 'WF-003',
    specId: 'SPEC-003',
    huId: 'HU-003',
    title: 'Gestión de productos (CRUD principal)',
    slug: 'gestion-productos-crud',
    oldSpecName: 'spec_gestion_productos_crud.md',
    oldHuName: 'hu_gestion_productos_crud.md',
    newSpecFile: 'SPEC-003-gestion-productos-crud.md',
    newHuFile: 'HU-003-gestion-productos-crud.md',
    wfFlowFile: 'WF-003-gestion-productos-crud.md'
  },
  {
    id: '004',
    wfId: 'WF-004',
    specId: 'SPEC-004',
    huId: 'HU-004',
    title: 'Gestión avanzada de variantes (SKUs)',
    slug: 'gestion-variantes-skus',
    oldSpecName: 'spec_gestion_variantes_skus.md',
    oldHuName: 'hu_gestion_variantes_skus.md',
    newSpecFile: 'SPEC-004-gestion-variantes-skus.md',
    newHuFile: 'HU-004-gestion-variantes-skus.md',
    wfFlowFile: 'WF-004-gestion-variantes-skus.md'
  },
  {
    id: '005',
    wfId: 'WF-005',
    specId: 'SPEC-005',
    huId: 'HU-005',
    title: 'Gestión de cupones de descuento',
    slug: 'gestion-cupones-descuento',
    oldSpecName: 'spec_gestion_cupones_descuento.md',
    oldHuName: 'hu_gestion_cupones_descuento.md',
    newSpecFile: 'SPEC-005-gestion-cupones-descuento.md',
    newHuFile: 'HU-005-gestion-cupones-descuento.md',
    wfFlowFile: 'WF-005-gestion-cupones-descuento.md'
  },
  {
    id: '006',
    wfId: 'WF-006',
    specId: 'SPEC-006',
    huId: 'HU-006',
    title: 'Gestión de ofertas y promociones',
    slug: 'gestion-ofertas-promociones',
    oldSpecName: 'spec_gestion_ofertas_promociones.md',
    oldHuName: 'hu_gestion_ofertas_promociones.md',
    newSpecFile: 'SPEC-006-gestion-ofertas-promociones.md',
    newHuFile: 'HU-006-gestion-ofertas-promociones.md',
    wfFlowFile: 'WF-006-gestion-ofertas-promociones.md'
  },
  {
    id: '007',
    wfId: 'WF-007',
    specId: 'SPEC-007',
    huId: 'HU-007',
    title: 'Reglas de venta cruzada y upselling',
    slug: 'reglas-venta-cruzada-upselling',
    oldSpecName: 'spec_reglas_venta_cruzada_upselling.md',
    oldHuName: 'hu_reglas_venta_cruzada_upsell.md',
    newSpecFile: 'SPEC-007-reglas-venta-cruzada-upselling.md',
    newHuFile: 'HU-007-reglas-venta-cruzada-upselling.md',
    wfFlowFile: 'WF-007-reglas-venta-cruzada-upselling.md'
  },
  {
    id: '008',
    wfId: 'WF-008',
    specId: 'SPEC-008',
    huId: 'HU-008',
    title: 'Gestión de categorías y subcategorías',
    slug: 'gestion-categorias',
    oldSpecName: 'spec_gestion_categorias.md',
    oldHuName: 'hu_gestion_categorias.md',
    newSpecFile: 'SPEC-008-gestion-categorias.md',
    newHuFile: 'HU-008-gestion-categorias.md',
    wfFlowFile: 'WF-008-gestion-categorias.md'
  },
  {
    id: '009',
    wfId: 'WF-009',
    specId: 'SPEC-009',
    huId: 'HU-009',
    title: 'Gestión de características y sus valores',
    slug: 'gestion-caracteristicas',
    oldSpecName: 'spec_gestion_caracteristicas.md',
    oldHuName: 'hu_gestion_caracteristicas.md',
    newSpecFile: 'SPEC-009-gestion-caracteristicas.md',
    newHuFile: 'HU-009-gestion-caracteristicas.md',
    wfFlowFile: 'WF-009-gestion-caracteristicas.md'
  },
  {
    id: '010',
    wfId: 'WF-010',
    specId: 'SPEC-010',
    huId: 'HU-010',
    title: 'Asociación entre categorías y características',
    slug: 'asociacion-categoria-caracteristica',
    oldSpecName: 'spec_asociacion_categoria_caracteristica.md',
    oldHuName: 'hu_asociacion_categoria_caracteristica.md',
    newSpecFile: 'SPEC-010-asociacion-categoria-caracteristica.md',
    newHuFile: 'HU-010-asociacion-categoria-caracteristica.md',
    wfFlowFile: 'WF-010-asociacion-categoria-caracteristica.md'
  },
  {
    id: '011',
    wfId: 'WF-011',
    specId: 'SPEC-011',
    huId: 'HU-011',
    title: 'Gestión de marcas',
    slug: 'gestion-marcas',
    oldSpecName: 'spec_gestion_marcas.md',
    oldHuName: 'hu_gestion_marcas.md',
    newSpecFile: 'SPEC-011-gestion-marcas.md',
    newHuFile: 'HU-011-gestion-marcas.md',
    wfFlowFile: 'WF-011-gestion-marcas.md'
  },
  {
    id: '012',
    wfId: 'WF-012',
    specId: 'SPEC-012',
    huId: 'HU-012',
    title: 'Gestión de SEO y metadatos',
    slug: 'seo-metadatos',
    oldSpecName: 'spec_seo_metadatos.md',
    oldHuName: 'hu_seo_metadatos.md',
    newSpecFile: 'SPEC-012-seo-metadatos.md',
    newHuFile: 'HU-012-seo-metadatos.md',
    wfFlowFile: 'WF-012-seo-metadatos.md'
  },
  {
    id: '013',
    wfId: 'WF-013',
    specId: 'SPEC-013',
    huId: 'HU-013',
    title: 'Gestión de precios individuales y masivos',
    slug: 'gestion-precios-individuales-masivos',
    oldSpecName: 'spec_gestion_precios.md',
    oldHuName: 'hu_gestion_precios.md',
    newSpecFile: 'SPEC-013-gestion-precios-individuales-masivos.md',
    newHuFile: 'HU-013-gestion-precios-individuales-masivos.md',
    wfFlowFile: 'WF-013-gestion-precios-individuales-masivos.md'
  },
  {
    id: '014',
    wfId: 'WF-014',
    specId: 'SPEC-014',
    huId: 'HU-014',
    title: 'Historial de auditoría de precios',
    slug: 'historial-auditoria-precios',
    oldSpecName: 'spec_auditoria_precios.md',
    oldHuName: 'hu_auditoria_precios.md',
    newSpecFile: 'SPEC-014-historial-auditoria-precios.md',
    newHuFile: 'HU-014-historial-auditoria-precios.md',
    wfFlowFile: 'WF-014-historial-auditoria-precios.md'
  },
  {
    id: '015',
    wfId: 'WF-015',
    specId: 'SPEC-015',
    huId: 'HU-015',
    title: 'Gestión de inventario',
    slug: 'gestion-inventario',
    oldSpecName: 'spec_gestion_inventario.md',
    oldHuName: 'hu_gestion_inventario.md',
    newSpecFile: 'SPEC-015-gestion-inventario.md',
    newHuFile: 'HU-015-gestion-inventario.md',
    wfFlowFile: 'WF-015-gestion-inventario.md'
  },
  {
    id: '016',
    wfId: 'WF-016',
    specId: 'SPEC-016',
    huId: 'HU-016',
    title: 'Dashboard analítico y alertas de stock',
    slug: 'dashboard-alertas-stock',
    oldSpecName: 'spec_dashboard_alertas_stock.md',
    oldHuName: 'hu_dashboard_alertas_stock.md',
    newSpecFile: 'SPEC-016-dashboard-alertas-stock.md',
    newHuFile: 'HU-016-dashboard-alertas-stock.md',
    wfFlowFile: 'WF-016-dashboard-alertas-stock.md'
  }
];

// 1. Actualizar wireframes/INDEX.md
console.log('--- Actualizando wireframes/INDEX.md ---');
const indexPath = path.join(rootDir, 'wireframes', 'INDEX.md');
let indexContent = fs.readFileSync(indexPath, 'utf8');

items.forEach(item => {
  // Reemplazar enlaces viejos de specs y hu
  const escapedOldSpec = item.oldSpecName.replace(/\./g, '\\.');
  const escapedOldHu = item.oldHuName.replace(/\./g, '\\.');

  indexContent = indexContent.replace(
    new RegExp(`\\[Spec\\]\\(\\.\\./specs/${escapedOldSpec}\\)`, 'g'),
    `[Spec](../specs/${item.newSpecFile})`
  );
  indexContent = indexContent.replace(
    new RegExp(`\\[HU\\]\\(\\.\\./hu/${escapedOldHu}\\)`, 'g'),
    `[HU](../hu/${item.newHuFile})`
  );
});

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✓ INDEX.md actualizado.');

// 2. Actualizar referencias en wireframes/flows/WF-*.md
console.log('--- Actualizando referencias en wireframes/flows/ ---');
const flowsDir = path.join(rootDir, 'wireframes', 'flows');
const flowFiles = fs.readdirSync(flowsDir).filter(f => f.endsWith('.md'));

flowFiles.forEach(file => {
  const filePath = path.join(flowsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  items.forEach(item => {
    // Buscar referencias a archivos viejos con o sin ../../ o con backslash escapado
    // Ej: spec_carga_exportacion_masiva_productos.md o spec\_carga\_exportacion\_masiva\_productos.md
    const patternSpecOld = item.oldSpecName.replace(/_/g, '(\\\\_|_)');
    const patternHuOld = item.oldHuName.replace(/_/g, '(\\\\_|_)');

    const regSpec = new RegExp(patternSpecOld, 'g');
    if (regSpec.test(content)) {
      content = content.replace(regSpec, item.newSpecFile);
      modified = true;
    }

    const regHu = new RegExp(patternHuOld, 'g');
    if (regHu.test(content)) {
      content = content.replace(regHu, item.newHuFile);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Flow actualizado: ${file}`);
  }
});

// 3. Normalizar encabezados en specs/
console.log('--- Normalizando encabezados en specs/ ---');
items.forEach(item => {
  const specPath = path.join(rootDir, 'specs', item.newSpecFile);
  if (!fs.existsSync(specPath)) return;
  let content = fs.readFileSync(specPath, 'utf8');

  // Actualizar referencias internas a hu viejas si existen
  items.forEach(other => {
    content = content.replace(new RegExp(other.oldHuName, 'g'), other.newHuFile);
    content = content.replace(new RegExp(other.oldSpecName, 'g'), other.newSpecFile);
  });

  // Asegurar que el título principal comience con # SPEC-XXX — Especificación:
  const lines = content.split('\n');
  let firstHeaderIndex = lines.findIndex(l => l.trim().startsWith('# '));
  const newHeader = `# ${item.specId} — Especificación: ${item.title}`;

  if (firstHeaderIndex !== -1) {
    lines[firstHeaderIndex] = newHeader;
  } else {
    lines.unshift(newHeader, '');
  }

  fs.writeFileSync(specPath, lines.join('\n'), 'utf8');
  console.log(`✓ Spec actualizado: ${item.newSpecFile}`);
});

// 4. Normalizar encabezados en hu/
console.log('--- Normalizando encabezados en hu/ ---');
items.forEach(item => {
  const huPath = path.join(rootDir, 'hu', item.newHuFile);
  if (!fs.existsSync(huPath)) return;
  let content = fs.readFileSync(huPath, 'utf8');

  // Actualizar referencias internas a specs viejas si existen
  items.forEach(other => {
    content = content.replace(new RegExp(other.oldHuName, 'g'), other.newHuFile);
    content = content.replace(new RegExp(other.oldSpecName, 'g'), other.newSpecFile);
  });

  const lines = content.split('\n');
  const targetHeader = `# ${item.huId} — Historia de Usuario: ${item.title}`;

  // Si ya tiene un encabezado H1 (# )
  let firstHeaderIndex = lines.findIndex(l => l.trim().startsWith('# '));
  if (firstHeaderIndex !== -1) {
    lines[firstHeaderIndex] = targetHeader;
  } else {
    // Insertar al inicio
    lines.unshift(targetHeader, '');
  }

  fs.writeFileSync(huPath, lines.join('\n'), 'utf8');
  console.log(`✓ HU actualizado: ${item.newHuFile}`);
});

console.log('--- Proceso de actualización de contenido y referencias completado ---');
