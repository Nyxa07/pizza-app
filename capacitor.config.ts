import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pizza.maker',
  appName: 'pizza-app',
  webDir: 'www',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#ff9860',
    },
    EdgeToEdge: {
      backgroundColor: '#ff9860',
    },
  },
};

export default config;
