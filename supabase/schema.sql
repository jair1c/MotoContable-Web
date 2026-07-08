-- MotoContable Web - Schema v2
-- Ejecutar en el SQL Editor de Supabase
-- (Si ya ejecutaste una versión anterior, borra las tablas antes: drop table if exists
--  weekly_payments, trip_legs, extras, expenses, passengers, profiles cascade;
--  Si SOLO te falta la columna days_of_week en una tabla ya creada, corre en su lugar:
--  alter table passengers add column days_of_week smallint[] not null default '{1,2,3,4,5}';)

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
-- PASAJEROS FIJOS (alumnos, profesor: se cobra por tramo, pagan semanal)
-- =========================================
create table passengers (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  phone text,
  fare_ida numeric(10,2) not null default 0,
  fare_vuelta numeric(10,2) not null default 0,
  -- Días en que normalmente aplica este pasajero (ISO: 1=lunes ... 7=domingo)
  -- Ej: alumno = {1,2,3,4,5}, profesor que a veces va sábado = {1,2,3,4,5,6}
  days_of_week smallint[] not null default '{1,2,3,4,5}',
  active boolean default true,
  notes text,
  created_at timestamptz default now()
);

-- =========================================
-- TRAMOS DIARIOS (check de ida/vuelta por pasajero, como lista de asistencia)
-- =========================================
create table trip_legs (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references profiles(id) on delete cascade not null,
  passenger_id uuid references passengers(id) on delete cascade not null,
  leg_date date not null default current_date,
  leg text not null check (leg in ('ida','vuelta')),
  amount numeric(10,2) not null,
  weekly_payment_id uuid,
  created_at timestamptz default now(),
  unique (passenger_id, leg_date, leg)
);

-- =========================================
-- EXTRAS (carreras sueltas, cobradas al momento, monto variable)
-- =========================================
create table extras (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references profiles(id) on delete cascade not null,
  amount numeric(10,2) not null,
  payment_method text default 'efectivo',
  note text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz default now()
);

-- =========================================
-- PAGOS SEMANALES (liquidación de tramos acumulados por pasajero fijo)
-- =========================================
create table weekly_payments (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references profiles(id) on delete cascade not null,
  passenger_id uuid references passengers(id) on delete cascade not null,
  week_start date not null,
  week_end date not null,
  amount_due numeric(10,2) not null default 0,
  amount_paid numeric(10,2) default 0,
  status text default 'pendiente' check (status in ('pendiente','pagado','parcial')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- trip_legs referencia weekly_payments, así que agregamos el FK después de crearla
alter table trip_legs
  add constraint trip_legs_weekly_payment_fk
  foreign key (weekly_payment_id) references weekly_payments(id) on delete set null;

-- =========================================
-- GASTOS (combustible, mantenimiento, etc.)
-- =========================================
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references profiles(id) on delete cascade not null,
  category text not null,
  amount numeric(10,2) not null,
  description text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz default now()
);

-- =========================================
-- ÍNDICES
-- =========================================
create index idx_legs_driver_date on trip_legs(driver_id, leg_date);
create index idx_legs_passenger on trip_legs(passenger_id, leg_date);
create index idx_extras_driver_date on extras(driver_id, occurred_at);
create index idx_expenses_driver_date on expenses(driver_id, occurred_at);
create index idx_weekly_driver_status on weekly_payments(driver_id, status);
create index idx_passengers_driver on passengers(driver_id);

-- =========================================
-- ROW LEVEL SECURITY
-- =========================================
alter table profiles enable row level security;
alter table passengers enable row level security;
alter table trip_legs enable row level security;
alter table extras enable row level security;
alter table weekly_payments enable row level security;
alter table expenses enable row level security;

create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
create policy "Users manage own passengers" on passengers for all using (auth.uid() = driver_id);
create policy "Users manage own legs" on trip_legs for all using (auth.uid() = driver_id);
create policy "Users manage own extras" on extras for all using (auth.uid() = driver_id);
create policy "Users manage own weekly payments" on weekly_payments for all using (auth.uid() = driver_id);
create policy "Users manage own expenses" on expenses for all using (auth.uid() = driver_id);

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
