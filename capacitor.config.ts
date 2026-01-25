import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pizza.maker',
  appName: 'pizza-app',
  webDir: 'www',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#1a1a24', // Matches Original theme toolbar (space-bg-elevated)
      style: 'DARK', // Light icons for dark background
    },
    EdgeToEdge: {
      backgroundColor: '#1a1a24',
    },
  },
};

export default config;
