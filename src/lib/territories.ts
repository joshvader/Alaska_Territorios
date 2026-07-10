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

// Genera un programa semanal emparejando:
// - Territorios con cobertura más antigua (last_completed ascendente; null primero).
// - Capitanes con menor cantidad de territorios completados (round-robin).
export function generateWeeklyProgram(
  territories: Territory[],
  ranking: { name: string; count: number }[],
  daysCount: number = 5
): Omit<Programacion, 'id' | 'created_at'>[] {
  const sortedTerritories = [...territories]
    .sort((a, b) => lastCompletedSortKey(a.last_completed) - lastCompletedSortKey(b.last_completed))
    .slice(0, daysCount);

  // Capitanes ordenados por menor carga (los que menos han hecho)
  const sortedCapitanes = [...ranking]
    .sort((a, b) => a.count - b.count)
    .map((r) => r.name);

  if (sortedCapitanes.length === 0) return [];

  const days = DAYS.slice(0, daysCount);
  const times = [...DEFAULT_TIMES];
  const salidas = [...DEFAULT_SALIDAS];
  const tipos = [...DEFAULT_TERRITORY_TYPES];

  return sortedTerritories.map((t, idx) => {
    const capitan = sortedCapitanes[idx % sortedCapitanes.length];
    return {
      territory_number: t.number,
      dia: days[idx % days.length],
      hora: times[idx % times.length],
      capitan,
      salida: salidas[idx % salidas.length],
      territorio_tipo: tipos[idx % tipos.length],
    };
  });
}
