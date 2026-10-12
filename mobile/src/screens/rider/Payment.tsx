import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react-native';

export default function Payment({ navigation, route }: any) {
  const ride = route.params?.ride || { price: 80 };
  const [method, setMethod] = useState('upi');

  const handlePay = () => {
     alert('Payment Successful!');
     navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <ArrowLeft color="#0f2e53" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.fareCard}>
           <Text style={styles.fareLabel}>Trip Fare</Text>
           <Text style={styles.fareAmount}>₹{ride.price}</Text>
           <Text style={styles.fareSub}>per seat</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>

        <TouchableOpacity style={[styles.methodCard, method === 'upi' && styles.methodActive]} onPress={() => setMethod('upi')}>
           <View style={styles.methodIcon}><Smartphone color={method === 'upi' ? '#00A859' : '#64748b'} size={20} /></View>
           <Text style={[styles.methodName, method === 'upi' && {color:'#00A859'}]}>UPI (GPay, PhonePe, etc.)</Text>
           {method === 'upi' && <CheckCircle2 color="#00A859" size={20} />}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.methodCard, method === 'card' && styles.methodActive]} onPress={() => setMethod('card')}>
           <View style={styles.methodIcon}><CreditCard color={method === 'card' ? '#00A859' : '#64748b'} size={20} /></View>
           <Text style={[styles.methodName, method === 'card' && {color:'#00A859'}]}>Credit / Debit Card</Text>
           {method === 'card' && <CheckCircle2 color="#00A859" size={20} />}
        </TouchableOpacity>

        <View style={styles.infoBox}>
           <Text style={styles.infoText}>Your payment goes directly to the driver. You only pay for your seat.</Text>
        </View>

        <View style={{flex: 1, minHeight: 100}} />

        <TouchableOpacity style={styles.btn} onPress={handlePay}>
           <Text style={styles.btnText}>Pay ₹{ride.price}</Text>
        </TouchableOpacity>

        <Text style={styles.secureText}>🔒 100% secure payments</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 5, marginRight: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f2e53' },
  content: { padding: 20, flexGrow: 1 },
  
  fareCard: { backgroundColor: '#fff', padding: 30, borderRadius: 16, alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, elevation:2 },
  fareLabel: { fontSize: 16, color: '#64748b', marginBottom: 8 },
  fareAmount: { fontSize: 48, fontWeight: 'bold', color: '#0f2e53' },
  fareSub: { fontSize: 14, color: '#64748b' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f2e53', marginBottom: 16 },
  
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  methodActive: { borderColor: '#00A859', backgroundColor: '#ecfdf5' },
  methodIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  methodName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0f2e53' },

  infoBox: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, marginTop: 10 },
  infoText: { fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 18 },

  btn: { backgroundColor: '#00A859', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  secureText: { textAlign: 'center', fontSize: 12, color: '#94a3b8' }
});
