"use client"

import { useEffect, useState } from "react"

interface WorkoutTimerProps {
  routineId: string; // Usamos el ID de la rutina para que cada una tenga su propio timer
}

export function WorkoutTimer({ routineId }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState("0:00")

  useEffect(() => {
    // 1. Intentar recuperar el inicio guardado o crear uno nuevo si no existe
    const storageKey = `workout_start_${routineId}`;
    let startTimeStr = localStorage.getItem(storageKey);
    
    if (!startTimeStr) {
      startTimeStr = Date.now().toString();
      localStorage.setItem(storageKey, startTimeStr);
    }

    const startTime = parseInt(startTimeStr);

    // 2. Intervalo que calcula la diferencia real
    const interval = setInterval(() => {
      const now = Date.now();
      const diffInSeconds = Math.floor((now - startTime) / 1000);
      
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;

      if (hours > 0) {
        setElapsed(`${hours}h ${minutes}m ${seconds.toString().padStart(2, "0")}s`);
      } else {
        setElapsed(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [routineId]);

  return (
    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
      <span className="animate-pulse text-red-500">●</span>
      <span className="font-mono text-sm font-medium text-slate-200">
        {elapsed}
      </span>
    </div>
  );
}

