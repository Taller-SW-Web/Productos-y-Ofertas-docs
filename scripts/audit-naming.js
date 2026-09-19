/**
 * Validador automatizado de nomenclatura y trazabilidad 1:1
 * Ejecución: node scripts/audit-naming.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const wfDir = path.join(rootDir, 'wireframes');
const flowsDir = path.join(wfDir, 'flows');
const protoDir = path.join(wfDir, 'prototipos');
const specsDir = path.join(rootDir, 'specs');
const huDir = path.join(rootDir, 'hu');

console.log('='.repeat(72));
console.log('AUDITORÍA AUTOMATIZADA DE NOMENCLATURA Y TRAZABILIDAD (WF, SPEC, HU)');
console.log('='.repeat(72));

let totalErrors = 0;
let totalChecked = 0;

// Validar que existan los 16 IDs (001 al 016)
for (let i = 1; i <= 16; i++) {
  const numStr = String(i).padStart(3, '0');
  totalChecked++;

  // 1. Buscar archivo en wireframes/flows
  const flowFiles = fs.readdirSync(flowsDir).filter(f => f.startsWith(`WF-${numStr}-`) && f.endsWith('.md'));
  if (flowFiles.length !== 1) {
    console.error(`❌ [${numStr}] Se esperaba 1 archivo en wireframes/flows para WF-${numStr}, encontrados: ${flowFiles.length}`);
    totalErrors++;
    continue;
  }
  const flowFile = flowFiles[0];
  const slug = flowFile.replace(`WF-${numStr}-`, '').replace('.md', '');

  // 2. Validar prototipo
  const expectedProtoFolder = `WF-${numStr}-${slug}`;
  const protoPath = path.join(protoDir, expectedProtoFolder, 'index.html');
  if (!fs.existsSync(protoPath)) {
    console.error(`❌ [${numStr}] Prototipo no encontrado en: ${expectedProtoFolder}/index.html`);
    totalErrors++;
  }

  // 3. Validar Spec
  const expectedSpecFile = `SPEC-${numStr}-${slug}.md`;
  const specPath = path.join(specsDir, expectedSpecFile);
  if (!fs.existsSync(specPath)) {
    console.error(`❌ [${numStr}] Spec no encontrado: specs/${expectedSpecFile}`);
    totalErrors++;
  } else {
    // Validar encabezado de Spec
    const specContent = fs.readFileSync(specPath, 'utf8');
    const firstLine = specContent.split('\n')[0].trim();
    if (!firstLine.startsWith(`# SPEC-${numStr} —`)) {
      console.warn(`⚠ [${numStr}] El encabezado de ${expectedSpecFile} no inicia con '# SPEC-${numStr} —' (encontrado: "${firstLine}")`);
    }
  }

  // 4. Validar HU
  const expectedHuFile = `HU-${numStr}-${slug}.md`;
  const huPath = path.join(huDir, expectedHuFile);
  if (!fs.existsSync(huPath)) {
    console.error(`❌ [${numStr}] HU no encontrada: hu/${expectedHuFile}`);
    totalErrors++;
  } else {
    // Validar encabezado de HU
    const huContent = fs.readFileSync(huPath, 'utf8');
    const firstLine = huContent.split('\n')[0].trim();
    if (!firstLine.startsWith(`# HU-${numStr} —`)) {
      console.warn(`⚠ [${numStr}] El encabezado de ${expectedHuFile} no inicia con '# HU-${numStr} —' (encontrado: "${firstLine}")`);
    }
  }

  // 5. Validar enlaces dentro del flow
  const flowPath = path.join(flowsDir, flowFile);
  const flowContent = fs.readFileSync(flowPath, 'utf8');
  if (!flowContent.includes(expectedSpecFile)) {
    console.error(`❌ [${numStr}] El flow ${flowFile} no referencia a ${expectedSpecFile}`);
    totalErrors++;
  }
  if (!flowContent.includes(expectedHuFile)) {
    console.error(`❌ [${numStr}] El flow ${flowFile} no referencia a ${expectedHuFile}`);
    totalErrors++;
  }

  console.log(`✓ [${numStr}] Slug: ${slug} -> WF, SPEC, HU y Prototipo consistentes`);
}

// 6. Validar enlaces en wireframes/INDEX.md
console.log('\n--- Validando enlaces en wireframes/INDEX.md ---');
const indexPath = path.join(wfDir, 'INDEX.md');
const indexContent = fs.readFileSync(indexPath, 'utf8');
const linkMatches = [...indexContent.matchAll(/\[(.*?)\]\((.*?)\)/g)];

let brokenLinks = 0;
linkMatches.forEach(match => {
  const linkText = match[1];
  const linkTarget = match[2].split('#')[0]; // ignorar fragmentos
  if (linkTarget.startsWith('http') || linkTarget.startsWith('mailto')) return;

  const targetPath = path.resolve(wfDir, linkTarget);
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Enlace roto en INDEX.md: [${linkText}](${linkTarget})`);
    brokenLinks++;
    totalErrors++;
  }
});

if (brokenLinks === 0) {
  console.log('✓ Todos los enlaces en wireframes/INDEX.md son válidos y resuelven.');
}

console.log('='.repeat(72));
if (totalErrors === 0) {
  console.log(`🎉 AUDITORÍA EXITOSA: 16 funcionalidades auditadas, 0 errores detectados.`);
  process.exit(0);
} else {
  console.error(`❌ AUDITORÍA FALLIDA: ${totalErrors} errores encontrados.`);
  process.exit(1);
}
