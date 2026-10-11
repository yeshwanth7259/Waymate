'use strict';

const fs = require('node:fs');
const path = require('node:path');

module.exports = ({ config }) => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_FILE || './google-services.json';
  const hasGoogleServices = fs.existsSync(path.resolve(__dirname, googleServicesFile));
  if (!hasGoogleServices && process.env.APP_ENV === 'production') {
    throw new Error('Set GOOGLE_SERVICES_FILE to the matching Firebase Android app configuration before building a production app.');
  }

  return {
    ...config,
    owner: 'yeshwanthkumar',
    name: 'WayMate',
    slug: 'waymate',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'waymate',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#F8F9FB'
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
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://waymate-backend-g17d.onrender.com/api',
      eas: {
        projectId: '530d5b68-c6ba-4321-a0b7-5786f79dcef4'
      }
    }
  };
};
