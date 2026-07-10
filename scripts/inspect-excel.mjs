// Inspección profunda del Excel: agrupa filas por territorio y resume asignaciones.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import * as XLSX from 'xlsx';

const filePath = resolve(process.cwd(), 'doc', 'REGISTRO DE ASIGNACION DE TERRITORIO 2026.xlsx');
const outDir = resolve(process.cwd(), 'tmp');
mkdirSync(outDir, { recursive: true });

const buf = readFileSync(filePath);
const wb = XLSX.read(buf, { type: 'buffer' });

const ws = wb.Sheets['Table 1'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: false });

// Detectar filas de territorio: la primera celda es un número positivo <= 3 dígitos.
const isTerrRow = (r) => r && r[0] != null && /^\d{1,3}$/.test(String(r[0]).trim());

const territories = [];
let i = 0;
while (i < rows.length) {
  if (isTerrRow(rows[i])) {
    const header = rows[i];
    const dates = rows[i + 1] || [];
    const num = String(header[0]).trim();
    const lastCompleted = header[1] || null;
    // Columnas 2..13 contienen 6 "Asignado a" (pares: nombre, fecha asignación, fecha completado)
    const assignments = [];
    for (let c = 2; c < 14; c += 3) {
      const name = header[c];
      const assignedDate = dates[c] || null;
      const completedDate = dates[c + 1] || null;
      if (name) assignments.push({ name, assignedDate, completedDate });
    }
    territories.push({ number: num, lastCompleted, assignments });
    i += 2; // saltar también la fila de fechas
  } else {
    i += 1;
  }
}

console.log(`Total territorios detectados: ${territories.length}`);
console.log('\n=== PRIMEROS 8 TERRITORIOS ===');
for (const t of territories.slice(0, 8)) {
  console.log(JSON.stringify(t, null, 2));
}

console.log('\n=== ÚLTIMOS 5 TERRITORIOS ===');
for (const t of territories.slice(-5)) {
  console.log(JSON.stringify(t, null, 2));
}

// Frecuencia: contar cuántos territorios completó cada capitán
const capitanCount = {};
let totalCompletions = 0;
for (const t of territories) {
  for (const a of t.assignments) {
    if (a.completedDate) {
      capitanCount[a.name] = (capitanCount[a.name] || 0) + 1;
      totalCompletions += 1;
    }
  }
}
const ranking = Object.entries(capitanCount).sort((a, b) => b[1] - a[1]);
console.log(`\nTotal completions registradas: ${totalCompletions}`);
console.log('\n=== RANKING DE CAPITANES POR TERRITORIOS COMPLETADOS ===');
for (const [name, count] of ranking) {
  console.log(`  ${name.padEnd(28)} ${count}`);
}

const report = {
  totalTerritories: territories.length,
  totalCompletions,
  capitanRanking: ranking.map(([name, count]) => ({ name, count })),
  territories: territories.map((t) => ({
    number: t.number,
    lastCompleted: t.lastCompleted,
    completedCount: t.assignments.filter((a) => a.completedDate).length,
    capitanes: t.assignments.map((a) => a.name),
  })),
};

writeFileSync(resolve(outDir, 'territories-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`\nReporte completo guardado en tmp/territories-report.json`);
