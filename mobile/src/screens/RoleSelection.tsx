import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function RoleSelection({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How would you like to travel?</Text>
        
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RiderFlow')}>
          <Text style={styles.cardTitle}>Find a Ride</Text>
          <Text style={styles.cardSub}>Book a verified seat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, {borderColor: '#0f2e53'}]} onPress={() => navigation.navigate('DriverFlow')}>
          <Text style={styles.cardTitle}>Offer a Ride</Text>
          <Text style={styles.cardSub}>Share your empty seats</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f2e53', marginBottom: 30, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 16, marginBottom: 16, borderWidth: 2, borderColor: '#00A859' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f2e53' },
  cardSub: { fontSize: 14, color: '#666', marginTop: 4 }
});
