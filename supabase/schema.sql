-- MotoContable Web - Schema inicial
-- Ejecutar en el SQL Editor de Supabase

-- Extensión para UUIDs
create extension if not exists "uuid-ossp";

-- =========================================
-- PERFILES (extiende auth.users de Supabase)
-- =========================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  vehicle_plate text,
  created_at timestamptz default now()
);

-- =========================================
-- RUTAS (rutas frecuentes que maneja el conductor)
-- =========================================
create table routes (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references profiles(id) on delete cascade not null,
  name text not null,           -- ej: "Terminal - Mercado Central"
  origin text,
  destination text,
  default_fare numeric(10,2),   -- tarifa habitual de esa ruta
  created_at timestamptz default now()
);

-- =========================================
-- PASAJEROS (clientes recurrentes, ej. colegiales con pago semanal)
-- =========================================
create table passengers (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  phone text,
  route_id uuid references routes(id) on delete set null,
  weekly_rate numeric(10,2),    -- monto acordado por semana (si aplica)
  active boolean default true,
  notes text,
  created_at timestamptz default now()
);

-- =========================================
-- INGRESOS (cada carrera/viaje registrado)
-- =========================================
create table income_records (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references profiles(id) on delete cascade not null,
  passenger_id uuid references passengers(id) on delete set null, -- null = pasajero ocasional
  route_id uuid references routes(id) on delete set null,
  amount numeric(10,2) not null,
  payment_method text default 'efectivo', -- efectivo, yape, plin, etc.
  occurred_at timestamptz not null default now(),
  notes text,
  created_at timestamptz default now()
);

-- =========================================
-- PAGOS SEMANALES (liquidación de pasajeros con tarifa semanal)
-- =========================================
create table weekly_payments (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references profiles(id) on delete cascade not null,
  passenger_id uuid references passengers(id) on delete cascade not null,
  week_start date not null,
  week_end date not null,
  amount_due numeric(10,2) not null,
  amount_paid numeric(10,2) default 0,
  status text default 'pendiente' check (status in ('pendiente','pagado','parcial')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- =========================================
-- GASTOS (combustible, mantenimiento, etc.)
-- =========================================
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references profiles(id) on delete cascade not null,
  category text not null, -- combustible, mantenimiento, seguro, multa, otro
  amount numeric(10,2) not null,
  description text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz default now()
);

-- =========================================
-- ÍNDICES
-- =========================================
create index idx_income_driver_date on income_records(driver_id, occurred_at);
create index idx_expenses_driver_date on expenses(driver_id, occurred_at);
create index idx_weekly_driver_status on weekly_payments(driver_id, status);
create index idx_passengers_driver on passengers(driver_id);
create index idx_routes_driver on routes(driver_id);

-- =========================================
-- ROW LEVEL SECURITY (cada conductor solo ve sus datos)
-- =========================================
alter table profiles enable row level security;
alter table routes enable row level security;
alter table passengers enable row level security;
alter table income_records enable row level security;
alter table weekly_payments enable row level security;
alter table expenses enable row level security;

create policy "Users manage own profile" on profiles
  for all using (auth.uid() = id);

create policy "Users manage own routes" on routes
  for all using (auth.uid() = driver_id);

create policy "Users manage own passengers" on passengers
  for all using (auth.uid() = driver_id);

create policy "Users manage own income" on income_records
  for all using (auth.uid() = driver_id);

create policy "Users manage own weekly payments" on weekly_payments
  for all using (auth.uid() = driver_id);

create policy "Users manage own expenses" on expenses
  for all using (auth.uid() = driver_id);

-- =========================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- =========================================
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
