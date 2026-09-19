/**
 * Validador automatizado de consistencia y diseño para prototipos Wireframe
 * Ejecución: node scripts/audit-wireframes.js
 */

const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..', 'wireframes', 'prototipos');

if (!fs.existsSync(baseDir)) {
  console.error(`Error: No se encontró el directorio ${baseDir}`);
  process.exit(1);
}

const expectedPrototypes = [
  { id: 'WF-001', name: 'Carga y exportación masiva de productos', folder: 'WF-001-carga-exportacion-masiva-productos' },
  { id: 'WF-002', name: 'Gestión de combos de productos', folder: 'WF-002-gestion-combos-productos' },
  { id: 'WF-003', name: 'Gestión de productos', folder: 'WF-003-gestion-productos-crud' },
  { id: 'WF-004', name: 'Gestión avanzada de variantes (SKUs)', folder: 'WF-004-gestion-variantes-skus' },
  { id: 'WF-005', name: 'Gestión de cupones de descuento', folder: 'WF-005-gestion-cupones-descuento' },
  { id: 'WF-006', name: 'Gestión de ofertas y promociones', folder: 'WF-006-gestion-ofertas-promociones' },
  { id: 'WF-007', name: 'Reglas de venta cruzada y upselling', folder: 'WF-007-reglas-venta-cruzada-upselling' },
  { id: 'WF-008', name: 'Gestión de categorías y subcategorías', folder: 'WF-008-gestion-categorias' },
  { id: 'WF-009', name: 'Gestión de características y sus valores', folder: 'WF-009-gestion-caracteristicas' },
  { id: 'WF-010', name: 'Asociación entre categorías y características', folder: 'WF-010-asociacion-categoria-caracteristica' },
  { id: 'WF-011', name: 'Gestión de marcas', folder: 'WF-011-gestion-marcas' },
  { id: 'WF-012', name: 'Gestión de SEO y metadatos', folder: 'WF-012-seo-metadatos' },
  { id: 'WF-013', name: 'Gestión de precios individuales y masivos', folder: 'WF-013-gestion-precios-individuales-masivos' },
  { id: 'WF-014', name: 'Historial de auditoría de precios', folder: 'WF-014-historial-auditoria-precios' },
  { id: 'WF-015', name: 'Gestión de inventario', folder: 'WF-015-gestion-inventario' },
  { id: 'WF-016', name: 'Dashboard analítico y alertas de stock', folder: 'WF-016-dashboard-alertas-stock' }
];

const allowedGrays = new Set([
  '#fff', '#ffffff', '#000', '#000000',
  '#f3f4f6', '#e5e7eb', '#d1d5db', '#6b7280', '#374151', '#111827',
  '#1f2937', '#4b5563', '#9ca3af', '#f9fafb'
]);

let totalErrors = 0;
let totalWarnings = 0;

console.log('='.repeat(72));
console.log('AUDITORÍA AUTOMATIZADA DE CONSISTENCIA Y RESPONSIVIDAD DE WIREFRAMES');
console.log('='.repeat(72));

expectedPrototypes.forEach(proto => {
  const filePath = path.join(baseDir, proto.folder, 'index.html');
  const issues = [];
  const warnings = [];

  if (!fs.existsSync(filePath)) {
    console.log(`❌ [${proto.id}] Archivo index.html no encontrado`);
    totalErrors++;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Validar Título
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  if (!title.startsWith(`${proto.id} —`)) {
    issues.push(`Título inválido: "${title}". Debe comenzar con "${proto.id} —"`);
  }

  // 2. Validar Viewport
  if (!content.includes('name="viewport"') || !content.includes('width=device-width')) {
    issues.push('Falta meta tag de viewport para diseño responsivo');
  }

  // 3. Validar Escala de Grises en CSS
  const styles = [];
  const styleTags = content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  for (const m of styleTags) styles.push(m[1]);
  const inlineStyles = content.matchAll(/style=[\"']([^\"']+)[\"']/gi);
  for (const m of inlineStyles) styles.push(m[1]);
  const cssText = styles.join('\n');

  const hexColors = [...cssText.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m => m[0].toLowerCase());
  const invalidHex = [...new Set(hexColors.filter(h => {
    if (/^#([0-9a-f])\1\1$/i.test(h)) return false;
    if (/^#([0-9a-f]{2})\1\1$/i.test(h)) return false;
    if (allowedGrays.has(h)) return false;
    return true;
  }))];

  if (invalidHex.length > 0) {
    issues.push(`Colores fuera de escala de grises: ${invalidHex.join(', ')}`);
  }

  // 4. Validar Ausencia de Sombras
  if (/box-shadow|drop-shadow/i.test(cssText)) {
    issues.push('Uso prohibido de sombras detectado (box-shadow o drop-shadow)');
  }

  // 5. Validar Marca Oficial
  const brandMatch = content.match(/class=[\"'][^\"']*brand[^\"']*[\"'][\s\S]*?<\/div>/i);
  const brandText = brandMatch ? brandMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  if (!brandText.includes('PO') || (!brandText.toLowerCase().includes('productos y ofertas') && !brandText.toLowerCase().includes('productos y ofertas'))) {
    issues.push(`Marca disonante en cabecera: "${brandText}". Debe ser "PO Productos y ofertas"`);
  }

  // 6. Validar Ausencia de Anotaciones Visibles en UI
  if (content.includes('class="ann"') && !cssText.includes('.ann{display:none') && !cssText.includes('.ann { display: none') && !cssText.includes('.ann{display: none')) {
    issues.push('Anotaciones técnicas visibles en la UI (encontrada clase "ann" no oculta)');
  }

  // 7. Validar Breakpoints Responsivos Canónicos (900px y 600px)
  const hasMedia900 = /@media[^{]*max-width:\s*900px/i.test(cssText);
  const hasMedia600 = /@media[^{]*max-width:\s*600px/i.test(cssText);

  if (!hasMedia900) {
    warnings.push('Falta media query canónica para tablets: @media (max-width: 900px)');
  }
  if (!hasMedia600) {
    issues.push('Falta media query canónica para móviles: @media (max-width: 600px)');
  }

  // 8. Validar Accesibilidad: focus-visible y accent-color
  if (!/focus-visible/i.test(cssText)) {
    warnings.push('No define indicador accesible :focus-visible');
  }
  if (!/accent-color/i.test(cssText)) {
    warnings.push('No define accent-color para checkboxes y radio buttons en escala de grises');
  }

  // Reporte individual
  if (issues.length === 0 && warnings.length === 0) {
    console.log(`✅ [${proto.id}] APROBADO (${proto.name})`);
  } else {
    console.log(`⚠️ [${proto.id}] ${proto.name}:`);
    issues.forEach(err => console.log(`   ❌ ERROR: ${err}`));
    warnings.forEach(warn => console.log(`   🔸 AVISO: ${warn}`));
    totalErrors += issues.length;
    totalWarnings += warnings.length;
  }
});

console.log('='.repeat(72));
if (totalErrors === 0 && totalWarnings === 0) {
  console.log('🎉 Todos los 16 prototipos cumplen al 100% las especificaciones.');
  process.exit(0);
} else {
  console.log(`Resumen: ${totalErrors} errores y ${totalWarnings} advertencias detectadas.`);
  process.exit(totalErrors > 0 ? 1 : 0);
}
