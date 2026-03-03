'use client'
import { useState, useEffect, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// --- BASE DE DATOS DE EJEMPLO (Añade aquí los que quieras) ---
const EXERCISES_DATABASE = [
  { id: '1', name: 'Press de Banca', target: 'Pectorales', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXF4Znd4Znd4Znd4Znd4Znd4Znd4Znd4Znd4Znd4Znd4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpx9Y3Z3Zz4Y/giphy.gif' },
  { id: '2', name: 'Sentadilla Libre', target: 'Piernas', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXF4Znd4Znd4Znd4Znd4Znd4Znd4Znd4Znd4Znd4Znd4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpx9Y3Z3Zz4Y/giphy.gif' },
  { id: '3', name: 'Peso Muerto', target: 'Espalda', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXF4Znd4Znd4Znd4Znd4Znd4Znd4Znd4Znd4Znd4Znd4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpx9Y3Z3Zz4Y/giphy.gif' },
];

export function ExerciseSearch({ onSelect }: { onSelect?: (ex: any) => void }) {
  // --- NUEVA LÓGICA DE BÚSQUEDA ---
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setResults([]);
      return;
    }
    const filtered = EXERCISES_DATABASE.filter(ex => 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filtered);
  }, [searchTerm]);

  return (
    <div className="relative w-full">
      <input 
        type="text" 
        placeholder="BUSCAR EJERCICIO..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-[#1e293b] text-white p-4 rounded-2xl border border-slate-800 text-xs font-bold uppercase tracking-widest outline-none focus:border-emerald-500 transition-all shadow-xl"
      />

      {/* RESULTADOS FLOTANTES */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-[#1e293b] mt-2 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden z-[100] max-h-60 overflow-y-auto">
          {results.map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                if (onSelect) onSelect(ex); // ESTO ENVÍA EL EJERCICIO A EDITROUTINE
                setSearchTerm(''); // LIMPIA EL BUSCADOR
              }}
              className="w-full flex items-center gap-4 p-4 hover:bg-slate-800 border-b border-slate-800/50 last:border-0 text-left transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0 p-1">
                <img src={ex.gifUrl} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-white font-bold text-[10px] uppercase italic">{ex.name}</p>
                <p className="text-emerald-500 text-[8px] font-bold uppercase">{ex.target}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- TU LÓGICA DE TIMER (SIN BORRAR NADA) ---
export const useRestTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const endTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null); 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/beep.mp3');
    audioRef.current.load();

    return () => {
      releaseWakeLock();
    };
  }, []);
 
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log("🛡️ Wake Lock Activo");
      } catch (err) {
        console.error("No se pudo activar Wake Lock:", err);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log("🔓 Wake Lock Liberado");
    }
  };

  const handleTimerEnd = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([400, 200, 400]); 
      }
    }
    
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      audioRef.current.play().catch(e => console.warn("Audio bloqueado:", e));
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && secondsLeft > 0) {
      requestWakeLock();

      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + secondsLeft * 1000;
      }

      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.round((endTimeRef.current! - now) / 1000);

        if (remaining <= 0) {
          setSecondsLeft(0);
          setIsActive(false);
          handleTimerEnd();
          clearInterval(interval);
        } else {
          setSecondsLeft(remaining);
        }
      }, 1000);
    } else {
      releaseWakeLock();
      endTimeRef.current = null;
    }

    return () => {
      clearInterval(interval);
      releaseWakeLock();
    };
  }, [isActive, secondsLeft]);

  const startTimer = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current!.pause();
        audioRef.current!.currentTime = 0;
      }).catch(() => {});
    }
    
    setSecondsLeft(seconds);
    setIsActive(true);
  };

  return { secondsLeft, isActive, startTimer };
};
