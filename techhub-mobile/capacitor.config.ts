import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.techhub.mobile',
  appName: 'TechHub',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#121212",
      showSpinner: true,
      spinnerColor: "#FFD700"
    },
    StatusBar: {
      style: 'DARK'
    }
  }
};

export default config;