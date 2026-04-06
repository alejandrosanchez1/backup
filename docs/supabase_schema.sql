-- Tabla workouts: rutinas guardadas por usuario
-- Ejecutar en el SQL Editor de tu proyecto Supabase

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Índice para listar rutinas por usuario
create index if not exists workouts_user_id_idx on public.workouts (user_id);
create index if not exists workouts_created_at_idx on public.workouts (created_at desc);

-- RLS: cada usuario solo ve y modifica sus propias rutinas
alter table public.workouts enable row level security;

create policy "Users can read own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workouts"
  on public.workouts for update
  using (auth.uid() = user_id);

create policy "Users can delete own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- Migración: agregar columna water_goal a nutrition_plans
-- Ejecutar en el SQL Editor de Supabase si la tabla ya existe
alter table public.nutrition_plans
  add column if not exists water_goal integer not null default 8;

-- Limpieza de filas duplicadas en nutrition_plans (mantiene la más reciente por user_id)
-- Ejecutar UNA VEZ en el SQL Editor de Supabase
DELETE FROM public.nutrition_plans
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.nutrition_plans
  ORDER BY user_id, created_at DESC
);

-- Prevenir duplicados futuros (ejecutar después de la limpieza)
ALTER TABLE public.nutrition_plans
  ADD CONSTRAINT nutrition_plans_user_id_unique UNIQUE (user_id);
