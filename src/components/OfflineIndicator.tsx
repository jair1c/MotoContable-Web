"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-white/5 text-white/50 text-xs">
      <WifiOff className="h-3.5 w-3.5" />
      Sin conexión — lo que registres se guarda en el celular y se sube solo al volver la señal
    </div>
  );
}
