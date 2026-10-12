import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { User, Settings, HelpCircle, LogOut, ChevronRight, Star } from 'lucide-react-native';
import { useAuth } from '../lib/AuthContext';

export default function Profile({ navigation }: any) {
  const { user } = useAuth();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
         <View style={styles.profileCard}>
            <View style={styles.avatar}><User color="#fff" size={40} /></View>
            <View style={styles.profileInfo}>
               <Text style={styles.name}>{user?.fullName || 'John Doe'}</Text>
               <Text style={styles.phone}>+91 {user?.phone || '98765 43210'}</Text>
               <Text style={styles.emailText}>{user?.email || 'email@example.com'}</Text>
               <View style={styles.ratingBox}><Star color="#00A859" size={14} fill="#00A859"/><Text style={styles.ratingText}> 4.9 (120 Ratings) • {user?.gender || 'Other'}</Text></View>
            </View>
         </View>

         <Text style={styles.sectionTitle}>Account</Text>
         <View style={styles.menuCard}>
            <MenuRow icon={<User color="#64748b" size={20}/>} title="Personal Information" />
            <View style={styles.divider} />
            <MenuRow icon={<Settings color="#64748b" size={20}/>} title="Preferences" />
         </View>

         <Text style={styles.sectionTitle}>Support</Text>
         <View style={styles.menuCard}>
            <MenuRow icon={<HelpCircle color="#64748b" size={20}/>} title="Help Center" />
         </View>

         <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}>
            <LogOut color="#ff4444" size={20} />
            <Text style={styles.logoutText}>Log Out</Text>
         </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuRow = ({ icon, title }: any) => (
  <TouchableOpacity style={styles.menuRow}>
     <View style={styles.menuIcon}>{icon}</View>
     <Text style={styles.menuTitle}>{title}</Text>
     <ChevronRight color="#cbd5e1" size={20} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f2e53' },
  content: { padding: 20 },
  
  profileCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 30, alignItems: 'center', shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.05, elevation: 2 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0f2e53', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  profileInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#0f2e53', marginBottom: 4 },
  phone: { fontSize: 14, color: '#64748b', marginBottom: 2 },
  emailText: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
  ratingBox: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: '#00A859', fontWeight: 'bold' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f2e53', marginBottom: 12, marginLeft: 4 },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.05, elevation: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#334155' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 68 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', padding: 16, borderRadius: 16, marginTop: 10 },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#ff4444', marginLeft: 8 }
});
