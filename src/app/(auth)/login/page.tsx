import { login, signup } from "./actions";
import { Gauge } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const isSignup = params.mode === "registro";

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center">
            <Gauge className="h-5 w-5 text-petrol-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold text-xl tracking-tight">
            MotoContable
          </span>
        </div>

        <div className="bg-petrol-900 border border-petrol-700 rounded-2xl p-7">
          <h1 className="font-display text-2xl font-semibold mb-1">
            {isSignup ? "Crea tu cuenta" : "Inicia tu turno"}
          </h1>
          <p className="text-sm text-white/50 mb-6">
            {isSignup
              ? "Registra tus carreras desde hoy mismo."
              : "Ingresa para ver tus carreras y liquidaciones."}
          </p>

          {params.message && (
            <div className="mb-4 rounded-lg bg-teal/10 border border-teal/30 px-3 py-2 text-sm text-teal">
              {decodeURIComponent(params.message)}
            </div>
          )}

          {params.error && (
            <div className="mb-4 rounded-lg bg-signal/10 border border-signal/30 px-3 py-2 text-sm text-signal">
              {decodeURIComponent(params.error)}
            </div>
          )}

          <form action={isSignup ? signup : login} className="space-y-4">
            {isSignup && (
              <div>
                <label className="text-xs text-white/50 mb-1 block">
                  Nombre completo
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  placeholder="Juan Pérez"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-white/50 mb-1 block">Correo</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full rounded-lg bg-petrol-800 border border-petrol-700 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-amber-400 hover:bg-amber-500 transition-colors text-petrol-950 font-semibold py-2.5 text-sm"
            >
              {isSignup ? "Crear cuenta" : "Ingresar"}
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-5">
            {isSignup ? "¿Ya tienes cuenta? " : "¿Aún no tienes cuenta? "}
            <a
              href={isSignup ? "/login" : "/login?mode=registro"}
              className="text-amber-400 hover:underline"
            >
              {isSignup ? "Inicia sesión" : "Regístrate"}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
