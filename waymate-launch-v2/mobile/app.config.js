import fs from 'node:fs';
import path from 'node:path';

export default ({ config }) => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_FILE || './google-services.json';
  const hasGoogleServices = fs.existsSync(path.resolve(process.cwd(), googleServicesFile));

  return {
    ...config,
    owner: 'waymates',
    name: 'WayMate',
    slug: 'waymate',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'waymate',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#062C45'
    },
    android: {
      ...(config.android || {}),
      package: 'com.waymate.app',
      adaptiveIcon: { foregroundImage: './assets/icon-foreground.png', backgroundColor: '#062C45' },
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
        'CAMERA'
      ],
      usesCleartextTraffic: process.env.APP_ENV === 'development',
      ...(hasGoogleServices ? { googleServicesFile } : {}),
      config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY || '' } }
    },
    plugins: [
      'expo-splash-screen',
      'expo-location',
      ['expo-image-picker', {
        photosPermission: 'WayMate uses photos only when you choose a KYC document.',
        cameraPermission: 'WayMate uses the camera only for KYC selfie verification.'
      }],
      ...(hasGoogleServices ? ['@react-native-firebase/app'] : [])
    ],
    extra: { 
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:3001/api',
      eas: {
        projectId: "3465ba9c-c19d-47a7-9de4-e6456046b997"
      }
    }
  };
};
