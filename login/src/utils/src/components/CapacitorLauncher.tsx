"use client"; // <--- Esto es lo más importante

import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export default function CapacitorLauncher() {
  useEffect(() => {
    // Solo ejecutamos si estamos en un dispositivo real (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      const initNativeStuff = async () => {
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' }); // Pon tu color aquí
        } catch (e) {
          console.warn("StatusBar no disponible", e);
        }
      };
      initNativeStuff();
    }
  }, []);

  return null; // Este componente no renderiza nada visual
}
