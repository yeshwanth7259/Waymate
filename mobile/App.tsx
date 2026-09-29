import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  // Pointing to the local network IP where the Vite dev server runs.
  // Make sure your Vite server is accessible over the network (e.g. npm run dev -- --host)
  const WEB_APP_URL = 'http://192.168.0.103:3000';

  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        startInLoadingState={true}
        scalesPageToFit={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // Add margin top for Android to avoid overlapping with status bar
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  webview: {
    flex: 1,
  },
});
