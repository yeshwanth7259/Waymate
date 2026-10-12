import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, ImageBackground } from 'react-native';
import { ArrowLeft, Phone, MessageCircle, Share2, AlertTriangle, User } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function DriverLiveTrip({ navigation, route }: any) {
  const ride = route.params?.ride || { name: 'Aravind K.', rating: '4.9 (50)', price: 80 };
  const [shareLive, setShareLive] = useState(false);
  const [tripState, setTripState] = useState<'pending' | 'started' | 'ended'>('pending');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <ArrowLeft color="#0f2e53" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driving to Drop-off</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.mapContainer}>
         <MapView 
            provider={PROVIDER_GOOGLE}
            style={styles.mapImage}
            initialRegion={{
              latitude: 12.9716,
              longitude: 77.5946,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
         >
            <Marker coordinate={{ latitude: 12.9716, longitude: 77.5946 }} title="Rider Pickup" pinColor="blue" />
            <Marker coordinate={{ latitude: 12.9200, longitude: 77.6100 }} title="Drop off" pinColor="red" />
         </MapView>
      </View>

      <View style={styles.bottomSheet}>
         {/* Rider Info */}
         <View style={styles.driverInfo}>
            <View style={styles.avatar}><User color="#fff" size={24} /></View>
            <View style={{flex: 1}}>
               <Text style={styles.driverName}>{ride.name} (Rider)</Text>
               <Text style={styles.vehicleInfo}>Rating: {ride.rating}</Text>
            </View>
            <View style={styles.priceContainer}>
               <Text style={styles.priceText}>₹{ride.price}</Text>
            </View>
         </View>

         {/* Actions */}
         <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn}>
               <Phone color="#00A859" size={20} />
               <Text style={styles.actionText}>Call Rider</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
               <MessageCircle color="#00A859" size={20} />
               <Text style={styles.actionText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
               <Share2 color="#00A859" size={20} />
               <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
               <AlertTriangle color="#ff4444" size={20} />
               <Text style={[styles.actionText, {color: '#ff4444'}]}>SOS</Text>
            </TouchableOpacity>
         </View>

         {/* Finish Trip */}
         {tripState === 'pending' ? (
             <TouchableOpacity 
                 style={[styles.finishBtn, {backgroundColor: '#3b82f6'}]} 
                 onPress={() => setTripState('started')}
             >
                <Text style={styles.finishBtnText}>Start Trip (Rider Picked Up)</Text>
             </TouchableOpacity>
         ) : (
             <TouchableOpacity 
                 style={styles.finishBtn} 
                 onPress={() => {
                     setTripState('ended');
                     alert("Trip Ended! Earnings added to Wallet.");
                     navigation.navigate('Home');
                 }}
             >
                <Text style={styles.finishBtnText}>End Trip & Collect Payment</Text>
             </TouchableOpacity>
         )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', zIndex: 10 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f2e53' },
  
  mapContainer: { flex: 1, backgroundColor: '#e5e7eb' },
  mapImage: { width: '100%', height: '100%', justifyContent: 'space-between', paddingVertical: 40, alignItems: 'center' },
  
  overlayPickup: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.1, elevation: 4 },
  overlayDrop: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.1, elevation: 4 },
  pinBlue: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3b82f6', marginRight: 10 },
  pinRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444', marginRight: 10 },
  overlayTextContainer: { },
  overlayLabel: { fontSize: 14, fontWeight: 'bold', color: '#0f2e53' },
  overlaySub: { fontSize: 10, color: '#64748b' },

  bottomSheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  
  driverInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0f2e53', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  driverName: { fontSize: 18, fontWeight: 'bold', color: '#0f2e53', marginBottom: 4 },
  vehicleInfo: { fontSize: 12, color: '#64748b' },
  priceContainer: { backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#00A859' },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24, paddingBottom: 10 },
  actionBtn: { alignItems: 'center' },
  actionText: { fontSize: 12, fontWeight: 'bold', color: '#00A859', marginTop: 8 },

  finishBtn: { backgroundColor: '#00A859', padding: 16, borderRadius: 16, alignItems: 'center' },
  finishBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
