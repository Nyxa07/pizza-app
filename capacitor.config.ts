/// <reference types="@capawesome/capacitor-android-edge-to-edge-support" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pizzamaker.app',
  appName: 'pizza-app',
  webDir: 'www',
  plugins: {
    SystemBars: {
      insetsHandling: 'disable',
      style: 'DARK',
    },
    EdgeToEdge: {
      statusBarColor: '#1a1a24',
      navigationBarColor: '#1a1a24',
    },
    Keyboard: {
      resizeOnFullScreen: false,
    },
  },
};

export default config;
