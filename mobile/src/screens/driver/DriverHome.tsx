import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch, Dimensions } from 'react-native';
import { Wallet, CarFront, FileCheck2, Map as MapIcon } from 'lucide-react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../lib/AuthContext';

export default function DriverHome({ navigation }: any) {
  const [isOnline, setIsOnline] = useState(true);
  const { user } = useAuth();
  
  const heatMapPoints = [
    { latitude: 12.9716, longitude: 77.5946, weight: 1 },
    { latitude: 12.9720, longitude: 77.5950, weight: 2 },
    { latitude: 12.9710, longitude: 77.5940, weight: 3 },
    { latitude: 12.9690, longitude: 77.5960, weight: 4 }, // High demand area
    { latitude: 12.9695, longitude: 77.5965, weight: 5 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero Header without Profile Icon */}
        <View style={styles.headerBg}>
            <View style={styles.profileHeader}>
               <View style={{flex: 1, alignItems: 'center'}}>
                  <Text style={styles.greeting}>Good Morning</Text>
                  <Text style={styles.name}>{user?.fullName || 'Aravind K'}</Text>
               </View>
            </View>
            <View style={styles.onlineToggleRow}>
               <Text style={styles.onlineText}>{isOnline ? 'You are Online' : 'You are Offline'}</Text>
               <Switch 
                 value={isOnline} 
                 onValueChange={setIsOnline}
                 trackColor={{ false: '#e0e0e0', true: '#bbf7d0' }}
                 thumbColor={isOnline ? '#00A859' : '#f4f3f4'}
               />
            </View>
        </View>

        <View style={{paddingHorizontal: 20}}>
           {/* Stats */}
           <View style={styles.statsRow}>
              <View style={styles.statBox}>
                 <Text style={styles.statLabel}>Today's Trips</Text>
                 <Text style={styles.statValue}>3</Text>
              </View>
              <View style={styles.statBox}>
                 <Text style={styles.statLabel}>Today's Earnings</Text>
                 <Text style={styles.statValue}>₹720</Text>
              </View>
           </View>

           <TouchableOpacity style={styles.offerBtn} onPress={() => navigation.navigate('Offer')}>
              <CarFront color="#fff" size={20} />
              <Text style={styles.offerBtnText}>Offer a Ride</Text>
           </TouchableOpacity>

           {/* High Demand Heatmap */}
           <View style={styles.upcomingHeader}>
              <Text style={styles.upcomingTitle}>High Demand Areas</Text>
              <Text style={styles.upcomingLink}>Live</Text>
           </View>
           <View style={styles.mapContainer}>
             <MapView 
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: 12.9716,
                  longitude: 77.5946,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
             >
               <Heatmap points={heatMapPoints} radius={40} opacity={0.7} gradient={{ colors: ['transparent', '#00A859', '#ff4444'], startPoints: [0, 0.5, 1], colorMapSize: 256 }} />
             </MapView>
           </View>

           {/* Quick Actions */}
           <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionItem}>
                 <View style={styles.actionIconBox}><Wallet color="#0f2e53" size={20} /></View>
                 <Text style={styles.actionText}>Wallet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('DriverDocs')}>
                 <View style={styles.actionIconBox}><FileCheck2 color="#0f2e53" size={20} /></View>
                 <Text style={styles.actionText}>Documents</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem}>
                 <View style={styles.actionIconBox}><Wallet color="#0f2e53" size={20} /></View>
                 <Text style={styles.actionText}>Payouts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem}>
                 <View style={styles.actionIconBox}><CarFront color="#0f2e53" size={20} /></View>
                 <Text style={styles.actionText}>Vehicle</Text>
              </TouchableOpacity>
           </View>

           {/* Upcoming Ride */}
           <View style={styles.upcomingHeader}>
              <Text style={styles.upcomingTitle}>Upcoming Ride</Text>
              <TouchableOpacity onPress={() => navigation.navigate('DriverLiveTrip')}>
                  <Text style={styles.upcomingLink}>View</Text>
              </TouchableOpacity>
           </View>

           <TouchableOpacity style={styles.upcomingCard} onPress={() => navigation.navigate('DriverLiveTrip')}>
              <View style={styles.upcomingLeftLine} />
              <View style={styles.upcomingContent}>
                 <Text style={styles.upcomingRoute}>HSR <Text style={{color:'#94a3b8'}}>→</Text> Whitefield</Text>
                 <Text style={styles.upcomingTime}>08:30 AM • 3 seats</Text>
              </View>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerBg: { backgroundColor: '#0f2e53', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 20 },
  profileHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 14, color: '#94a3b8' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  onlineToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  onlineText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, marginHorizontal: 4, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.05, elevation: 2 },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#0f2e53' },

  offerBtn: { backgroundColor: '#00A859', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, marginBottom: 30, shadowColor: '#00A859', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  offerBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },

  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  actionItem: { alignItems: 'center' },
  actionIconBox: { width: 56, height: 56, backgroundColor: '#fff', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity: 0.05, elevation:2 },
  actionText: { fontSize: 12, color: '#64748b', fontWeight: '500' },

  upcomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  upcomingTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f2e53' },
  upcomingLink: { fontSize: 14, fontWeight: 'bold', color: '#00A859' },
  upcomingCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  upcomingLeftLine: { width: 4, backgroundColor: '#00A859', borderRadius: 2, marginRight: 16 },
  upcomingContent: { flex: 1 },
  upcomingRoute: { fontSize: 16, fontWeight: 'bold', color: '#0f2e53', marginBottom: 4 },
  upcomingTime: { fontSize: 12, color: '#64748b' },
  mapContainer: { height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 30, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, elevation: 2 },
  map: { width: '100%', height: '100%' }
});
