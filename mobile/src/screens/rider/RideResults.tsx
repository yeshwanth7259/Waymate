import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ArrowLeft, MapPin, User, CheckCircle2 } from 'lucide-react-native';

export default function RideResults({ navigation }: any) {
  const rides = [
    { id: 1, name: 'Rahul S.', rating: '4.8 (120)', price: 80, time: '08:30 AM', seats: 3, vehicle: 'Hyundai Creta' },
    { id: 2, name: 'Priya M.', rating: '4.9 (80)', price: 70, time: '08:15 AM', seats: 2, vehicle: 'Maruti Swift', tags: ['Women only'] },
    { id: 3, name: 'Arjun K.', rating: '4.7 (64)', price: 90, time: '09:00 AM', seats: 2, vehicle: 'Tata Nexon' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <ArrowLeft color="#0f2e53" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Rides Found ({rides.length})</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {rides.map(ride => (
          <TouchableOpacity key={ride.id} style={styles.card} onPress={() => navigation.navigate('RideDetails', { ride })}>
             <View style={styles.cardTop}>
                <View style={styles.driverInfo}>
                   <View style={styles.avatar}><User color="#fff" size={20} /></View>
                   <View>
                      <Text style={styles.driverName}>{ride.name}</Text>
                      <Text style={styles.driverRating}>★ {ride.rating}</Text>
                   </View>
                </View>
                <View style={styles.priceBox}>
                   <Text style={styles.price}>₹{ride.price}</Text>
                   <Text style={styles.perSeat}>per seat</Text>
                </View>
             </View>
             
             <View style={styles.routeBox}>
                <View style={styles.timeline}>
                  <View style={styles.dotEmpty} />
                  <View style={styles.line} />
                  <View style={styles.dotFilled}><MapPin color="#ff4444" size={10} /></View>
                </View>
                <View style={styles.locations}>
                   <Text style={styles.locText}>HSR Layout</Text>
                   <Text style={styles.viaText}>via Bellandur</Text>
                   <Text style={[styles.locText, {marginTop: 10}]}>Whitefield</Text>
                </View>
             </View>
             
             <View style={styles.cardBottom}>
                <View style={styles.tags}>
                   <View style={styles.tag}><CheckCircle2 color="#00A859" size={12} /><Text style={styles.tagText}>Verified</Text></View>
                   {ride.tags?.map(t => <View key={t} style={[styles.tag, {backgroundColor: '#fce7f3'}]}><Text style={[styles.tagText, {color: '#db2777'}]}>{t}</Text></View>)}
                </View>
                <Text style={styles.seatsInfo}>{ride.seats} seats left</Text>
             </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 5 },
  headerTitleBox: { flex: 1, alignItems: 'center', marginRight: 30 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f2e53' },
  list: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  driverInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0f2e53', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  driverName: { fontSize: 16, fontWeight: 'bold', color: '#0f2e53' },
  driverRating: { fontSize: 12, color: '#64748b', marginTop: 2 },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: 24, fontWeight: 'bold', color: '#00A859' },
  perSeat: { fontSize: 10, color: '#64748b' },
  routeBox: { flexDirection: 'row', marginBottom: 16 },
  timeline: { width: 20, alignItems: 'center', marginRight: 10 },
  dotEmpty: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#00A859', backgroundColor: '#fff' },
  line: { width: 1, height: 25, backgroundColor: '#e2e8f0', marginVertical: 2 },
  dotFilled: { width: 10, height: 10, justifyContent: 'center', alignItems: 'center' },
  locations: { flex: 1 },
  locText: { fontSize: 14, fontWeight: '600', color: '#0f2e53' },
  viaText: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  tags: { flexDirection: 'row', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  tagText: { fontSize: 10, color: '#00A859', fontWeight: 'bold' },
  seatsInfo: { fontSize: 12, color: '#64748b', fontWeight: '500' }
});
