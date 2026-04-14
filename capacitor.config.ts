import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aurbit.app',
  appName: 'AurbitApp',
  webDir: 'public', // Placeholder since we are serving remotely
  server: {
    // 10.0.2.2 routes local Android Emulator requests to the PC's localhost
    // Once deployed, this will be your actual live URL e.g., https://aurbit.app
    url: 'http://10.0.2.2:3000',
    cleartext: true
  }
};

export default config;
