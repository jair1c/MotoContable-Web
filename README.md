# MotoContable Web

Migración web de MotoContable (Android) a Next.js 14 + Supabase.
Modelo pensado para tu caso real: pasajeros fijos que pagas por tramo
(ida/vuelta) y liquidas a la semana, más carreras extra que cobras al toque.

## Módulos

- **Check diario**: lista tus pasajeros fijos (alumnos, profesor) con botones
  Ida/Vuelta. Tocas cuando los recoges/dejas — si no lo marcas, no se cuenta
  (faltó ese día). El total del día se calcula solo.
- **Extras**: carreras sueltas, monto libre, se cobran al momento — no entran
  a la liquidación semanal.
- **Gastos**: combustible, mantenimiento, seguro, multas.
- **Pasajeros**: alumnos y profesor con su tarifa de ida y de vuelta
  (pueden ser distintas, ej. alumno S/2+S/2, profesor S/6+S/6).
- **Pagos semanales**: botón "Generar liquidaciones" suma automáticamente
  todos los tramos marcados esa semana por cada pasajero (solo lo que
  realmente pasó, no un monto fijo) y genera su liquidación. Marcas "pagado"
  cuando te pagan.
- **Panel**: resumen de hoy / semana / mes + gráfico de últimos 7 días
  (tramos + extras).

## Setup

### 1. Crear proyecto en Supabase

1. Ve a https://supabase.com y crea un proyecto nuevo
2. Entra a **SQL Editor** y ejecuta el contenido completo de `supabase/schema.sql`
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`

### 2. Variables de entorno

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

Abre http://localhost:3000 → redirige a `/login`. Regístrate, luego ve a
**Pasajeros** y agrega a tus 4 alumnos (S/2 ida, S/2 vuelta) y al profesor
(S/6 ida, S/6 vuelta).

### 4. Uso diario

1. Cada mañana/tarde entra a **Check diario** y toca "Ida"/"Vuelta" de cada
   uno según los recojas o dejes.
2. Las carreras sueltas (extras) las registras en **Extras**, con el monto
   que cobraste.
3. El domingo (o cuando cierres semana) ve a **Pagos semanales** y presiona
   "Generar liquidaciones" — suma automáticamente lo que cada pasajero
   consumió esa semana. Cuando te paguen, marca "Pagado".

### 5. Deploy a Vercel

```bash
npx vercel
```

Agrega las mismas dos variables de entorno en Project Settings →
Environment Variables.

## Notas de arquitectura

- **trip_legs**: un registro por tramo (ida o vuelta) por pasajero por día,
  con restricción única `(passenger_id, leg_date, leg)` — evita marcar dos
  veces el mismo tramo el mismo día.
- **weekly_payments.amount_due** ya no es un monto fijo: se calcula sumando
  los `trip_legs` de esa semana al generar la liquidación, y esos tramos
  quedan ligados (`weekly_payment_id`) para no volver a contarlos.
- **extras**: tabla separada porque se cobran de inmediato, no se acumulan
  para pago semanal.
- **RLS**: cada tabla tiene Row Level Security — un conductor solo ve sus
  propios datos.
- **Compartir con Android**: la app Android puede apuntar al mismo proyecto
  Supabase y usar las mismas tablas.

## Próximos pasos sugeridos

- Editar/corregir un tramo marcado por error un día anterior desde el mismo
  Check diario (hoy se puede cambiando la fecha, ya soportado)
- Exportar reporte semanal en PDF para mostrarle al padre de familia/profesor
  el detalle de lo cobrado
- PWA (`next-pwa`) para instalar como app en el celular
