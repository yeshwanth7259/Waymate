export default ({config}) => ({
  ...config,
  name:'WayMate',slug:'waymate',version:'1.0.0',orientation:'portrait',scheme:'waymate',
  android:{...(config.android||{}),googleServicesFile:"./google-services.json",package:'com.waymate.app',permissions:['ACCESS_COARSE_LOCATION','ACCESS_FINE_LOCATION','ACCESS_BACKGROUND_LOCATION','FOREGROUND_SERVICE','FOREGROUND_SERVICE_LOCATION','CAMERA'],config:{googleMaps:{apiKey:process.env.GOOGLE_MAPS_API_KEY||''}}},
  plugins:['expo-location','expo-image-picker','@react-native-firebase/app','@react-native-firebase/auth']
});
