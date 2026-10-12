import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function OfferRide({ navigation }: any) {
  const [step, setStep] = useState(1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Offer a Ride</Text>
        <Text style={styles.subtitle}>Step {step} of 3</Text>
        
        <View style={styles.box}>
           <Text style={styles.boxText}>
              {step === 1 && "Route Details"}
              {step === 2 && "Vehicle & Seats"}
              {step === 3 && "Confirm & Publish"}
           </Text>
        </View>

        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => {
             if (step < 3) setStep(step + 1);
             else {
                alert("Ride Published!");
                navigation.navigate("Home");
             }
          }}
        >
          <Text style={styles.btnText}>{step < 3 ? 'Next' : 'Publish Ride'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f2e53' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  box: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  boxText: { fontSize: 20, fontWeight: '600', color: '#64748b' },
  btn: { backgroundColor: '#00A859', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
