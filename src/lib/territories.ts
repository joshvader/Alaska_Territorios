// Tipos y helpers para territorios y programaciones.
import { createClient } from '@/lib/supabase/client';

export type Assignment = {
  name: string;
  assignedDate: string | null;
  completedDate: string | null;
};

export type Territory = {
  id: string;
  number: number;
  last_completed: string | null;
  completed_count: number;
  assignments: Assignment[];
};

export type Programacion = {
  id: string;
  territory_number: number;
  dia: string;
  hora: string;
  capitan: string;
  salida: string | null;
  territorio_tipo: string | null;
  created_at?: string;
};

export const DAYS = [
  'Lunes',
  'Miércoles',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export const DEFAULT_TIMES = ['09:00 AM', '09:30 AM', '10:30 AM', '11:00 AM', '16:00 PM'] as const;

export const DEFAULT_SALIDAS = [
  'Parque Central',
  'Calle 45 esq. 10',
  'Estación Metro Sur',
  'Centro Cultural',
  'Plaza de la Libertad',
  'Terminal de Buses',
  'Plaza Italia',
  'Parque de las Flores',
  'Calle del Sol',
  'Iglesia Central',
  'Paseo del Prado',
  'Avenida Bolivar',
] as const;

export const DEFAULT_TERRITORY_TYPES = [
  'Zona Norte',
  'Zona Sur',
  'Zona Este',
  'Zona Oeste',
  'Residencial',
  'Comercial',
  'Industrial',
  'Casco Viejo',
  'Periferia',
] as const;

// ----- Acceso a datos (cliente) -----
export async function fetchTerritories(): Promise<Territory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('territories')
    .select('*')
    .order('number', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Territory[];
}

export async function fetchProgramaciones(): Promise<Programacion[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('programaciones')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Programacion[];
}

export async function insertProgramaciones(rows: Omit<Programacion, 'id' | 'created_at'>[]): Promise<Programacion[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('programaciones')
    .insert(rows)
    .select('*');
  if (error) throw error;
  return (data ?? []) as Programacion[];
}

export async function updateProgramacion(id: string, patch: Partial<Programacion>): Promise<Programacion> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('programaciones')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Programacion;
}

export async function deleteProgramacion(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('programaciones').delete().eq('id', id);
  if (error) throw error;
}

// ----- Helpers -----
// Convierte una fecha tipo "19-Mar" a un valor comparable (mes-año). Null si no parsea.
const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

export function lastCompletedSortKey(value: string | null | undefined): number {
  if (!value) return -Infinity; // nunca completado va primero
  const m = String(value).trim().match(/^(\d{1,2})-([A-Za-z]{3})$/);
  if (!m) return -Infinity;
  const day = Number(m[1]);
  const mon = MONTHS[m[2][0].toUpperCase() + m[2].slice(1).toLowerCase()];
  if (mon == null) return -Infinity;
  // Año base 2026 (dato del Excel). Pesamos por año*1000 + mes*31 + día.
  return mon * 31 + day;
}

// Ranking de capitanes por cantidad de territorios completados.
export function buildCapitanRanking(territories: Territory[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const t of territories) {
    for (const a of t.assignments ?? []) {
      if (!a.completedDate) continue;
      counts.set(a.name, (counts.get(a.name) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Capitán "punto fijo": se deriva de la última asignación S-13 del territorio
// (la más reciente sin fecha de completado; si no hay, la última asignación).
export function derivarCapitanDeTerritorio(t: Territory): string {
  const list = t.assignments ?? [];
  if (list.length === 0) return 'Sin Capitán';
  const pendiente = [...list].reverse().find((a) => !a.completedDate);
  return (pendiente ?? list[list.length - 1])?.name?.trim() || 'Sin Capitán';
}

// Genera un programa semanal emparejando:
// - Territorios con cobertura más antigua (last_completed ascendente; null primero).
// - Capitanes con menor cantidad de territorios completados (round-robin).
export function generateWeeklyProgram(
  territories: Territory[],
  ranking: { name: string; count: number }[],
  daysCount: number = 30
): Omit<Programacion, 'id' | 'created_at'>[] {
  if (territories.length === 0) return [];

  const sortedTerritories = [...territories]
    .sort((a, b) => lastCompletedSortKey(a.last_completed) - lastCompletedSortKey(b.last_completed));

  // Capitanes ordenados por menor carga (los que menos han hecho)
  const sortedCapitanes = [...ranking]
    .sort((a, b) => a.count - b.count)
    .map((r) => r.name);

  const capitanesList = sortedCapitanes.length > 0 ? sortedCapitanes : ['Sin Capitán'];

  const times = [...DEFAULT_TIMES];
  const salidas = [...DEFAULT_SALIDAS];
  const tipos = [...DEFAULT_TERRITORY_TYPES];

  return Array.from({ length: daysCount }, (_, idx) => {
    const t = sortedTerritories[idx % sortedTerritories.length];
    const capitan = capitanesList[idx % capitanesList.length];
    const dayNum = String(idx + 1).padStart(2, '0');

    return {
      territory_number: t.number,
      dia: `Día ${dayNum}`,
      hora: times[idx % times.length],
      capitan,
      salida: salidas[idx % salidas.length],
      territorio_tipo: tipos[idx % tipos.length],
    };
  });
}

// ----- Funciones S-13: Importación, Exportación y Guardado en Supabase -----
import * as XLSX from 'xlsx';

function formatExcelVal(v: unknown): string | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number' && v > 30000 && v < 60000) {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d.d}-${months[d.m - 1]}`;
    }
  }
  return String(v).trim();
}

export type ParsedS13Result = {
  number: number;
  last_completed: string | null;
  completed_count: number;
  assignments: Assignment[];
};

export function parseS13Buffer(buffer: ArrayBuffer): ParsedS13Result[] {
  const data = new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

  const results: ParsedS13Result[] = [];

  // 1. Detectar si es el formato de Tarjetas Matrix S-13 (oficial JW)
  let isMatrixFormat = false;
  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const rStr = JSON.stringify(rows[r] ?? '');
    if (rStr.includes('REGISTRO DE ASIGNACIÓN DE TERRITORIO') || rStr.includes('Asignado a')) {
      isMatrixFormat = true;
      break;
    }
  }

  if (isMatrixFormat) {
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;
      const tNum = Number(row[0]);
      if (!isNaN(tNum) && tNum > 0) {
        const lastComp = formatExcelVal(row[1]);
        const assignments: Assignment[] = [];
        const nextRow = rows[r + 1] || [];

        for (let c = 2; c < Math.max(row.length, nextRow.length); c++) {
          const name = row[c];
          if (
            typeof name === 'string' &&
            name.trim().length > 0 &&
            !['Asignado a', 'Fecha en que se asignó', 'Fecha en que se completó', 'Terr', 'Última fecha en que se completó*'].includes(name.trim())
          ) {
            const assignedDate = formatExcelVal(nextRow[c]);
            const completedDate = formatExcelVal(nextRow[c + 1]);
            assignments.push({
              name: name.trim(),
              assignedDate,
              completedDate,
            });
          }
        }

        const completed_count = assignments.filter((a) => a.completedDate).length;
        results.push({
          number: tNum,
          last_completed: lastComp,
          completed_count,
          assignments,
        });
      }
    }
  } else {
    // 2. Formato de Tabla plana (CSV/Excel con encabezados Territorio, Publicador, Asignado, Completado)
    const objects = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
    const map = new Map<number, { last_completed: string | null; assignments: Assignment[] }>();

    for (const item of objects) {
      const num = Number(item['Territorio'] ?? item['Terr'] ?? item['number'] ?? item['Numero']);
      if (isNaN(num)) continue;

      const pub = String(item['Publicador'] ?? item['Asignado a'] ?? item['name'] ?? '').trim();
      const asigDate = formatExcelVal(item['Fecha Asignación'] ?? item['Fecha Asignado'] ?? item['assignedDate']);
      const compDate = formatExcelVal(item['Fecha Completado'] ?? item['Fecha Devolución'] ?? item['completedDate']);
      const lastComp = formatExcelVal(item['Última fecha en que se completó'] ?? item['last_completed']);

      if (!map.has(num)) {
        map.set(num, { last_completed: lastComp, assignments: [] });
      }

      const entry = map.get(num)!;
      if (lastComp && !entry.last_completed) {
        entry.last_completed = lastComp;
      }

      if (pub) {
        entry.assignments.push({
          name: pub,
          assignedDate: asigDate,
          completedDate: compDate,
        });
      }
    }

    map.forEach((val, num) => {
      const completed_count = val.assignments.filter((a) => a.completedDate).length;
      results.push({
        number: num,
        last_completed: val.last_completed,
        completed_count,
        assignments: val.assignments,
      });
    });
  }

  results.sort((a, b) => a.number - b.number);
  return results;
}

export function exportS13ToExcel(territories: Territory[], filename: string = 'REGISTRO_S13_TERRITORIOS.xlsx') {
  // Construir matriz estilo S-13 oficial
  const rows: any[][] = [
    ['REGISTRO DE ASIGNACIÓN DE TERRITORIO'],
    ['Año de servicio: 2026'],
    ['Terr', 'Última fecha en que se completó*', 'Asignado a', null, null, 'Asignado a', null, null, 'Asignado a'],
    [null, null, 'Fecha en que se asignó', 'Fecha en que se completó', null, 'Fecha en que se asignó', 'Fecha en que se completó', null, 'Fecha en que se asignó', 'Fecha en que se completó'],
  ];

  for (const t of territories) {
    const row1: any[] = [t.number, t.last_completed ?? ''];
    const row2: any[] = [null, null];

    (t.assignments ?? []).forEach((a) => {
      row1.push(a.name, null, null);
      row2.push(a.assignedDate ?? '', a.completedDate ?? '', null);
    });

    rows.push(row1);
    rows.push(row2);
    rows.push([]); // fila vacía separadora
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Hoja1');
  XLSX.writeFile(workbook, filename);
}

export async function updateTerritoryInSupabase(
  id: string,
  patch: Partial<Territory>
): Promise<Territory> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('territories')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Territory;
}

export async function upsertTerritoriesInSupabase(
  territoriesData: ParsedS13Result[]
): Promise<void> {
  const supabase = createClient();
  const rows = territoriesData.map((t) => ({
    number: t.number,
    last_completed: t.last_completed,
    completed_count: t.completed_count,
    assignments: t.assignments,
  }));

  const { error } = await supabase
    .from('territories')
    .upsert(rows, { onConflict: 'number' });

  if (error) throw error;
}

