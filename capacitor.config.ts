import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stepupacademy.app',
  appName: 'StepUP Academy',
  // Capacitor validates this directory during sync. The native app itself
  // loads the deployed site below rather than these fallback assets.
  webDir: 'public',
  server: {
    url: 'https://stepupacademyofficial.vercel.app',
    cleartext: false
  }
};

export default config;
