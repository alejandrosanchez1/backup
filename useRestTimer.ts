import { useState, useEffect, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useRestTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const endTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Inicializar Audio y WakeLock al cargar
  useEffect(() => {
    // Pre-carga del audio
    audioRef.current = new Audio('/sounds/beep.mp3');
    audioRef.current.load();

    return () => {
      releaseWakeLock();
    };
  }, []);

  // FUNCIÓN: Bloqueo de pantalla (Wake Lock)
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.error("Wake Lock error:", err);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  // 2. Lógica del Timer
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

  // 3. Función para iniciar (con truco de audio para Android)
  const startTimer = (seconds: number) => {
    // Desbloqueamos el audio para más tarde
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current!.pause();
        audioRef.current!.currentTime = 0;
      }).catch(() => {});
    }
    
    setSecondsLeft(seconds);
    setIsActive(true);
  };

  // 4. Feedback final (Vibración + Sonido)
  const handleTimerEnd = async () => {
    // VIBRACIÓN: Intentamos Haptics (Capacitor) y si falla, Navigator (Web)
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate([400, 200, 400]);
    }
    
    // AUDIO
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.warn("Audio bloqueado:", e));
    }
  };

  return { secondsLeft, isActive, startTimer };
};
