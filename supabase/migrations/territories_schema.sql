-- Esquema para la gestión de territorios y programaciones de predicación.
-- Datos fuente: doc/REGISTRO DE ASIGNACION DE TERRITORIO 2026.xlsx

create extension if not exists "pgcrypto";

-- Catálogo de territorios (uno por cada número T-1, T-2, ... T-65)
create table if not exists public.territories (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  last_completed text,
  completed_count int not null default 0,
  assignments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists territories_number_idx on public.territories (number);
create index if not exists territories_last_completed_idx on public.territories (last_completed);

-- Programación semanal de salidas a predicación
create table if not exists public.programaciones (
  id uuid primary key default gen_random_uuid(),
  territory_number int not null,
  dia text not null,
  hora text not null,
  capitan text not null,
  salida text,
  territorio_tipo text,
  created_at timestamptz not null default now()
);

create index if not exists programaciones_dia_idx on public.programaciones (dia);
create index if not exists programaciones_territory_idx on public.programaciones (territory_number);

-- Row Level Security: usuarios autenticados pueden leer y escribir.
alter table public.territories enable row level security;
alter table public.programaciones enable row level security;

drop policy if exists "territories_authenticated_all" on public.territories;
create policy "territories_authenticated_all"
  on public.territories
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "programaciones_authenticated_all" on public.programaciones;
create policy "programaciones_authenticated_all"
  on public.programaciones
  for all
  to authenticated
  using (true)
  with check (true);
