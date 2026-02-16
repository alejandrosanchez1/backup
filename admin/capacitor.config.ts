import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tuempresa.fitness',
  appName: 'Mi App Fitness',
  webDir: 'out',  // ← Cambio aquí
  server: {
    androidScheme: 'https'
  },
};

export default config;
