# MotoContable Web

Migración web de MotoContable (Android) a Next.js 14 + Supabase.
Comparte backend con la app Android — ambas apuntan al mismo proyecto de Supabase.

## Módulos

- **Ingresos**: registro de carreras (monto, método de pago, pasajero, ruta)
- **Gastos**: combustible, mantenimiento, seguro, multas
- **Pasajeros**: clientes frecuentes, tarifa semanal opcional
- **Rutas**: rutas habituales con tarifa de referencia
- **Pagos semanales**: liquidación automática de pasajeros con tarifa fija
- **Panel**: resumen de hoy / semana / mes + gráfico de últimos 7 días

## Setup

### 1. Crear proyecto en Supabase

1. Ve a https://supabase.com y crea un proyecto nuevo
2. Entra a **SQL Editor** y ejecuta el contenido completo de `supabase/schema.sql`
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`

### 2. Variables de entorno

Copia `.env.local.example` a `.env.local` y completa con tus credenciales:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Instalar y correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — te redirige a `/login`. Regístrate con el botón
"Regístrate" (crea usuario + perfil automáticamente vía trigger de Postgres).

### 4. Deploy a Vercel

```bash
npx vercel
```

O conecta el repo desde el dashboard de Vercel. Agrega las mismas dos
variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
en Project Settings → Environment Variables.

## Notas de arquitectura

- **Auth**: Supabase Auth (email/password), sesión manejada con cookies vía
  `@supabase/ssr` + middleware que protege las rutas del dashboard.
- **RLS**: cada tabla tiene Row Level Security activado — un conductor
  solo puede leer/escribir sus propios registros (`driver_id = auth.uid()`).
- **Server Actions**: todas las mutaciones (crear ingreso, marcar pago, etc.)
  son Server Actions de Next.js, sin API routes intermedias.
- **Compartir con Android**: la app Android puede apuntar al mismo proyecto
  Supabase (misma URL/anon key) y usar las mismas tablas — no hace falta
  duplicar backend.

## Próximos pasos sugeridos

- Exportar reportes (PDF/Excel) de ingresos y gastos por rango de fechas
- Notificación (email o push) cuando un pago semanal queda pendiente varios días
- PWA (`next-pwa`) para instalar la web como app en el celular
- Dashboard de "dueño de flota" si en el futuro manejas varios conductores
