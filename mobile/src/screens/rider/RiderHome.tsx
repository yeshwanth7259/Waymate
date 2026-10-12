import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { Search, MapPin } from 'lucide-react-native';

export default function RiderHome({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header - No Profile Icon */}
        <View style={styles.header}>
           <Text style={styles.headerTitle}>way<Text style={{color: '#00A859'}}>mate</Text></Text>
           <Text style={styles.headerSub}>Your route. Better together.</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroBox}>
           {/* The generated hero illustration */}
           <Image 
              source={require('../../../assets/rider_home_hero.jpg')} 
              style={styles.heroImage} 
              resizeMode="cover" 
           />
           <Text style={styles.heroTitle}>Commute smarter{"\n"}together</Text>
           <Text style={styles.heroSub}>Find trusted people travelling{"\n"}your way.</Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
           <Search color="#94a3b8" size={20} />
           <Text style={styles.searchText}>Where are you going?</Text>
        </TouchableOpacity>

        {/* Recent Searches */}
        <View style={styles.recentBox}>
           <Text style={styles.recentTitle}>Recent Searches</Text>
           
           <TouchableOpacity style={styles.recentItem} onPress={() => navigation.navigate('Search')}>
              <ClockIcon />
              <Text style={styles.recentText}>HSR Layout <ArrowIcon /> Whitefield</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.recentItem} onPress={() => navigation.navigate('Search')}>
              <ClockIcon />
              <Text style={styles.recentText}>Koramangala <ArrowIcon /> Electronic City</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.recentItem} onPress={() => navigation.navigate('Search')}>
              <ClockIcon />
              <Text style={styles.recentText}>Indiranagar <ArrowIcon /> Manyata Tech Park</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ClockIcon = () => (
   <View style={{width: 24, alignItems: 'center'}}><Text style={{color:'#94a3b8', fontSize: 18}}>◷</Text></View>
);
const ArrowIcon = () => (
   <Text style={{color:'#94a3b8', fontSize: 14}}>→</Text>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  header: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#0f2e53' },
  headerSub: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },

  heroBox: { alignItems: 'center', marginBottom: 20 },
  heroImage: { width: '90%', height: 200, borderRadius: 20, marginBottom: 20 },
  
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f2e53', textAlign: 'center', marginBottom: 8 },
  heroSub: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', marginHorizontal: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 30 },
  searchText: { marginLeft: 12, fontSize: 16, color: '#94a3b8', fontWeight: '500' },
  recentBox: { paddingHorizontal: 20, paddingBottom: 40 },
  recentTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f2e53', marginBottom: 16 },
  recentItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  recentText: { marginLeft: 12, fontSize: 14, color: '#334155', fontWeight: '500' }
});
