import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, User, Phone, MessageCircle, Share2, AlertTriangle } from 'lucide-react-native';

export default function RideDetails({ navigation, route }: any) {
  const ride = route.params?.ride || { name: 'Rahul S.', rating: '4.8 (120)', price: 80, vehicle: 'Hyundai Creta', seats: 3 };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <ArrowLeft color="#0f2e53" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Driver Card */}
        <View style={styles.driverCard}>
           <View style={styles.driverInfo}>
              <View style={styles.avatar}><User color="#fff" size={24} /></View>
              <View style={{flex: 1}}>
                 <Text style={styles.driverName}>{ride.name}</Text>
                 <Text style={styles.driverRating}>★ {ride.rating}</Text>
              </View>
              <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>Verified</Text></View>
           </View>
           <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleText}>{ride.vehicle} • White • {ride.seats} seats available</Text>
           </View>
        </View>

        {/* Route Details */}
        <View style={styles.routeCard}>
           <Text style={styles.sectionTitle}>Route & Stops</Text>
           <View style={styles.timelineRow}><View style={styles.dotLine}><View style={styles.dot}/><View style={styles.line}/></View><Text style={styles.routePoint}>HSR Layout</Text><Text style={styles.routeTime}>08:30 AM</Text></View>
           <View style={styles.timelineRow}><View style={styles.dotLine}><View style={styles.dotHollow}/><View style={styles.line}/></View><Text style={styles.routePoint}>Bellandur</Text><Text style={styles.routeTime}>08:50 AM</Text></View>
           <View style={styles.timelineRow}><View style={styles.dotLine}><View style={styles.dotHollow}/><View style={styles.line}/></View><Text style={styles.routePoint}>Marathahalli</Text><Text style={styles.routeTime}>09:10 AM</Text></View>
           <View style={styles.timelineRow}><View style={styles.dotLine}><View style={styles.dotRed}/></View><Text style={styles.routePoint}>Whitefield</Text><Text style={styles.routeTime}>09:25 AM</Text></View>
        </View>

        {/* Pricing */}
        <View style={styles.priceRow}>
           <Text style={styles.price}>₹{ride.price}</Text>
           <Text style={styles.perSeat}> per seat</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('LiveTrip', { ride })}>
           <Text style={styles.btnText}>Request Seat</Text>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
           <TouchableOpacity style={styles.actionBtn}><Phone color="#00A859" size={20}/><Text style={styles.actionText}>Call</Text></TouchableOpacity>
           <TouchableOpacity style={styles.actionBtn}><MessageCircle color="#00A859" size={20}/><Text style={styles.actionText}>Chat</Text></TouchableOpacity>
           <TouchableOpacity style={styles.actionBtn}><Share2 color="#00A859" size={20}/><Text style={styles.actionText}>Share</Text></TouchableOpacity>
           <TouchableOpacity style={styles.actionBtn}><AlertTriangle color="#ff4444" size={20}/><Text style={[styles.actionText, {color:'#ff4444'}]}>SOS</Text></TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 5, marginRight: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f2e53' },
  content: { padding: 20 },
  driverCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, elevation:2 },
  driverInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0f2e53', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  driverName: { fontSize: 18, fontWeight: 'bold', color: '#0f2e53' },
  driverRating: { fontSize: 14, color: '#64748b', marginTop: 2 },
  verifiedBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  verifiedText: { color: '#00A859', fontSize: 12, fontWeight: 'bold' },
  vehicleInfo: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  vehicleText: { fontSize: 14, color: '#64748b' },
  
  routeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, elevation:2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f2e53', marginBottom: 20 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dotLine: { width: 30, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#00A859' },
  dotHollow: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#00A859', backgroundColor: '#fff' },
  dotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ff4444' },
  line: { width: 2, height: 30, backgroundColor: '#00A859', marginVertical: 2 },
  routePoint: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#0f2e53' },
  routeTime: { fontSize: 14, color: '#64748b' },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, justifyContent: 'center' },
  price: { fontSize: 32, fontWeight: 'bold', color: '#0f2e53' },
  perSeat: { fontSize: 16, color: '#64748b' },

  btn: { backgroundColor: '#00A859', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 30 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  actionBtn: { alignItems: 'center' },
  actionText: { marginTop: 8, fontSize: 12, color: '#00A859', fontWeight: 'bold' }
});
