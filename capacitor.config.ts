import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.horimetro.app',
  appName: 'Horimetro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;