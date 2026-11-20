import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thebitezone.bidar',
  appName: 'The Bite Zone Bidar',
  webDir: 'dist/tbzb-web/browser',
  server: {
    androidScheme: 'https',
    url: 'https://thebitezonebidar.vercel.app',
    cleartext: false
  }
};

export default config;
