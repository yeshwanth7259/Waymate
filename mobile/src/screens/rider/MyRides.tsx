import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react-native';

export default function MyRides() {
  const rides = [
    { id: 1, from: 'HSR Layout', to: 'Whitefield', date: '18 Sep', time: '08:30 AM', driver: 'Rahul S.', status: 'Completed', price: 80 },
    { id: 2, from: 'Koramangala', to: 'Electronic City', date: '15 Sep', time: '09:00 AM', driver: 'Arjun K.', status: 'Completed', price: 65 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Rides</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {rides.map(ride => (
           <View key={ride.id} style={styles.card}>
              <View style={styles.cardHeader}>
                 <Text style={styles.dateText}><Calendar size={14} color="#64748b" /> {ride.date}   <Clock size={14} color="#64748b" /> {ride.time}</Text>
                 <View style={styles.statusBadge}><Text style={styles.statusText}>{ride.status}</Text></View>
              </View>
              
              <View style={styles.routeBox}>
                 <View style={styles.timeline}>
                    <View style={styles.dotEmpty} />
                    <View style={styles.line} />
                    <View style={styles.dotFilled}><MapPin color="#ff4444" size={10} /></View>
                 </View>
                 <View style={styles.locations}>
                    <Text style={styles.locText}>{ride.from}</Text>
                    <Text style={[styles.locText, {marginTop: 15}]}>{ride.to}</Text>
                 </View>
              </View>
              
              <View style={styles.cardFooter}>
                 <Text style={styles.driverText}>Driver: {ride.driver}</Text>
                 <Text style={styles.priceText}>₹{ride.price}</Text>
              </View>
           </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f2e53' },
  content: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.05, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12, marginBottom: 16 },
  dateText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  statusBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#00A859', fontSize: 12, fontWeight: 'bold' },
  routeBox: { flexDirection: 'row', marginBottom: 16 },
  timeline: { width: 20, alignItems: 'center', marginRight: 10 },
  dotEmpty: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#00A859', backgroundColor: '#fff' },
  line: { width: 1, height: 25, backgroundColor: '#e2e8f0', marginVertical: 2 },
  dotFilled: { width: 10, height: 10, justifyContent: 'center', alignItems: 'center' },
  locations: { flex: 1 },
  locText: { fontSize: 16, fontWeight: '600', color: '#0f2e53' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  driverText: { fontSize: 14, color: '#64748b' },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#0f2e53' }
});
