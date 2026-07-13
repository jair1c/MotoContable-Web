// Cola simple en localStorage para los taps de Check diario que no se
// pudieron guardar por falta de señal. Cada item representa el ESTADO
// deseado de un tramo (no un "flip"), así es seguro reintentarlo las
// veces que sea sin duplicar ni desordenar nada.

export interface PendingLegChange {
  key: string; // passengerId|leg|date — único por tramo/día
  passengerId: string;
  leg: "ida" | "vuelta";
  date: string;
  marked: boolean;
  amount: number;
  updatedAt: number;
}

const STORAGE_KEY = "motocontable_pending_legs";

function readQueue(): PendingLegChange[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingLegChange[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: PendingLegChange[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // almacenamiento lleno o no disponible — no es crítico, se reintentará
  }
}

export function getPendingCount(): number {
  return readQueue().length;
}

// Guarda (o reemplaza) el estado deseado de un tramo. Si ya había un
// cambio pendiente para el mismo tramo/día, se sobreescribe con el más
// reciente — no se acumulan duplicados.
export function queueLegChange(change: Omit<PendingLegChange, "key" | "updatedAt">) {
  const key = `${change.passengerId}|${change.leg}|${change.date}`;
  const queue = readQueue().filter((item) => item.key !== key);
  queue.push({ ...change, key, updatedAt: Date.now() });
  writeQueue(queue);
  return queue.length;
}

export function removeFromQueue(key: string) {
  const queue = readQueue().filter((item) => item.key !== key);
  writeQueue(queue);
  return queue.length;
}

export function getQueue(): PendingLegChange[] {
  return readQueue();
}
