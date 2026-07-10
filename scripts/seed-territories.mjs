// Vuelca el Excel a la tabla public.territories de Supabase.
// Idempotente: si un territorio ya existe, actualiza sus campos.
// Ejecutar con: node scripts/seed-territories.mjs

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

// Carga manual de .env
function loadEnv(filePath) {
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnv(resolve(process.cwd(), '.env'));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1) Leer Excel
const xlsxPath = resolve(process.cwd(), 'doc', 'REGISTRO DE ASIGNACION DE TERRITORIO 2026.xlsx');
const buf = readFileSync(xlsxPath);
const wb = XLSX.read(buf, { type: 'buffer' });
const ws = wb.Sheets['Table 1'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: false });

const isTerrRow = (r) => r && r[0] != null && /^\d{1,3}$/.test(String(r[0]).trim());

const territories = [];
let i = 0;
while (i < rows.length) {
  if (isTerrRow(rows[i])) {
    const header = rows[i];
    const dates = rows[i + 1] || [];
    const number = Number(header[0]);
    const lastCompleted = header[1] ? String(header[1]).trim() : null;
    const assignments = [];
    for (let c = 2; c < 14; c += 3) {
      const name = header[c];
      if (!name) continue;
      assignments.push({
        name: String(name).trim(),
        assignedDate: dates[c] ? String(dates[c]).trim() : null,
        completedDate: dates[c + 1] ? String(dates[c + 1]).trim() : null,
      });
    }
    const completedCount = assignments.filter((a) => a.completedDate).length;
    territories.push({ number, last_completed: lastCompleted, completed_count: completedCount, assignments });
    i += 2;
  } else {
    i += 1;
  }
}

console.log(`Territorios extraídos del Excel: ${territories.length}`);

// 2) Volcar a Supabase en lotes de 50
const batchSize = 50;
let inserted = 0;
let updated = 0;

for (let start = 0; start < territories.length; start += batchSize) {
  const batch = territories.slice(start, start + batchSize);
  const { data, error } = await supabase
    .from('territories')
    .upsert(batch, { onConflict: 'number', count: 'exact' })
    .select('number');

  if (error) {
    console.error(`Error en lote ${start}-${start + batch.length}:`, error.message);
    process.exit(1);
  }
  // upsert no distingue insert/update; contamos heurísticamente
  inserted += data?.length || 0;
  console.log(`  Lote ${start + 1}-${Math.min(start + batchSize, territories.length)} OK`);
}

console.log(`\nSeed completado. Filas procesadas: ${inserted}`);

// 3) Verificar
const { count, error: countErr } = await supabase
  .from('territories')
  .select('*', { count: 'exact', head: true });

if (countErr) {
  console.error('Error contando:', countErr.message);
} else {
  console.log(`Total filas en public.territories: ${count}`);
}
