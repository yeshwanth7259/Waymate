import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, ChevronRight } from 'lucide-react-native';

export default function Wallet() {
  const balance = 1250.00;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Wallet</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.iconCircle}><ArrowDownLeft color="#fff" size={20} /></View>
              <Text style={styles.actionText}>Add Funds</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.iconCircle, {backgroundColor: '#3b82f6'}]}>
                <ArrowUpRight color="#fff" size={20} />
              </View>
              <Text style={styles.actionText}>Payout directly to Bank</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
           <CheckCircle color="#00A859" size={24} />
           <View style={{flex: 1, marginLeft: 12}}>
              <Text style={styles.infoTitle}>Instant Payouts Enabled</Text>
              <Text style={styles.infoDesc}>Earnings from your riders pay directly to driver wallet. Withdraw to your linked bank account anytime.</Text>
           </View>
        </View>

        {/* Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        <TransactionRow title="Ride Earning - Rahul" date="Today, 09:30 AM" amount="+₹80.00" isCredit={true} />
        <TransactionRow title="Payout directly to Bank" date="Yesterday, 06:00 PM" amount="-₹500.00" isCredit={false} />
        <TransactionRow title="Ride Earning - Anita" date="Yesterday, 08:15 AM" amount="+₹120.00" isCredit={true} />
        <TransactionRow title="Ride Earning - Sunil" date="2 Days ago, 10:00 AM" amount="+₹150.00" isCredit={true} />

      </ScrollView>
    </SafeAreaView>
  );
}

const TransactionRow = ({ title, date, amount, isCredit }: any) => (
  <View style={styles.txRow}>
    <View style={[styles.txIcon, {backgroundColor: isCredit ? '#ecfdf5' : '#fef2f2'}]}>
       {isCredit ? <ArrowDownLeft color="#00A859" size={20} /> : <ArrowUpRight color="#ef4444" size={20} />}
    </View>
    <View style={{flex: 1, marginLeft: 16}}>
       <Text style={styles.txTitle}>{title}</Text>
       <Text style={styles.txDate}>{date}</Text>
    </View>
    <Text style={[styles.txAmount, {color: isCredit ? '#00A859' : '#0f2e53'}]}>{amount}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f2e53' },
  content: { padding: 20, paddingBottom: 100 },
  
  balanceCard: { backgroundColor: '#0f2e53', padding: 24, borderRadius: 24, shadowColor: '#000', shadowOffset:{width:0,height:10}, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, marginBottom: 24 },
  balanceLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  balanceAmount: { color: '#fff', fontSize: 40, fontWeight: 'bold', marginBottom: 24 },
  
  actionRow: { flexDirection: 'row', gap: 16 },
  actionBtn: { flex: 1, backgroundColor: '#1e3a8a', padding: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#00A859', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  
  infoBanner: { flexDirection: 'row', backgroundColor: '#ecfdf5', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#d1fae5', marginBottom: 24, alignItems: 'center' },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f2e53', marginBottom: 4 },
  infoDesc: { fontSize: 12, color: '#64748b', lineHeight: 18 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f2e53', marginBottom: 16 },
  
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12 },
  txIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  txTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f2e53', marginBottom: 4 },
  txDate: { fontSize: 12, color: '#64748b' },
  txAmount: { fontSize: 16, fontWeight: 'bold' }
});
