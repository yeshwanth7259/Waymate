import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, ImageBackground } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Splash({ navigation }: any) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[{ flex: 1, width, height }, { opacity }]}>
        <ImageBackground 
          source={require('../../assets/splash_banner.jpg')} 
          style={styles.banner}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  banner: { width: '100%', height: '100%' }
});
