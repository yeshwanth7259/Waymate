import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input, Badge } from '../components/ui';
import { colors, shadows, radius } from '../theme/theme';
import { api } from '../api/client';

export default function WalletScreen() {
  const [data, setData] = useState<any>(null);
  const [bankInfo, setBankInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res = await api<any>('/wallet/earnings');
      setData(res);
      
      // Fetch actual wallet details to get bank info
      const walletRes = await api<any>('/wallet');
      setBankInfo(walletRes.bankInfo || '');
    } catch (e) {
      console.error(e);
    }
  };

  const saveBankInfo = async () => {
    setLoading(true);
    try {
      await api('/wallet/bank', { method: 'PUT', body: JSON.stringify({ bankInfo }) });
      Alert.alert('Success', 'Bank account details updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const processPayout = async () => {
    if (!data || data.available <= 0) return Alert.alert('Error', 'Insufficient balance for payout.');
    setLoading(true);
    try {
      await api('/wallet/payout', { method: 'POST', body: JSON.stringify({ amount: data.available }) });
      Alert.alert('Payout Initiated', 'The amount will be credited to your linked bank account shortly.');
      fetchEarnings();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <SafeAreaView style={s.root}></SafeAreaView>;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}>
          <Text style={s.title}>Driver Center</Text>
          <Text style={s.subtitle}>Earnings, wallet & payouts</Text>
        </View>

        <View style={s.balanceCard}>
          <Text style={s.label}>THIS WEEK</Text>
          <Text style={s.balance}>₹{data.thisWeek.net.toLocaleString()}</Text>
          <Text style={s.payoutText}>estimated driver earnings after commission</Text>
          
          <View style={s.breakdownRow}>
            <View style={s.breakdownItem}>
              <Text style={s.breakdownLabel}>Gross fares</Text>
              <Text style={s.breakdownValue}>₹{data.thisWeek.gross}</Text>
            </View>
            <View style={s.breakdownItem}>
              <Text style={s.breakdownLabel}>Commission</Text>
              <Text style={[s.breakdownValue, {color: colors.amberSoft}]}>-₹{data.thisWeek.commission}</Text>
            </View>
            <View style={s.breakdownItem}>
              <Text style={s.breakdownLabel}>Pending</Text>
              <Text style={s.breakdownValue}>₹{data.pending}</Text>
            </View>
          </View>
        </View>

        <Card style={s.card}>
          <Text style={s.cardTitle}>Weekly payout cycle</Text>
          <Text style={s.desc}>Eligible driver earnings are scheduled for the weekly settlement cycle.</Text>
          <View style={s.payoutRow}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <View>
              <Text style={s.payoutLabel}>Next scheduled payout</Text>
              <Text style={s.payoutDate}>05 Oct 2026</Text>
            </View>
          </View>
        </Card>

        <Card style={s.card}>
          <Text style={s.cardTitle}>Weekly earnings</Text>
          <Text style={s.desc}>Last 6 weeks</Text>
          <View style={s.graph}>
            {data.weeks.map((val: number, i: number) => {
              const max = Math.max(...data.weeks);
              const height = (val / max) * 100;
              return (
                <View key={i} style={s.barContainer}>
                  <View style={[s.bar, {height: `${Math.max(10, height)}%`}]} />
                </View>
              );
            })}
          </View>
          <View style={s.graphLabels}>
            {['Aug','Sep','Sep','Sep','Oct','Oct'].map((lbl, i) => <Text key={i} style={s.graphLabel}>{lbl}</Text>)}
          </View>
        </Card>

        <Card style={s.card}>
          <Text style={s.cardTitle}>Wallet</Text>
          <View style={s.walletRow}>
            <View>
              <Text style={s.walletLabel}>Available</Text>
              <Text style={s.walletValue}>₹{data.available.toLocaleString()}</Text>
            </View>
            <View>
              <Text style={s.walletLabel}>Pending</Text>
              <Text style={s.walletValue}>₹{data.pending.toLocaleString()}</Text>
            </View>
          </View>
          
          <Button 
            title={loading ? 'Processing...' : 'Withdraw to Bank'} 
            onPress={processPayout} 
            disabled={loading || data.available <= 0 || !bankInfo}
          />
          {!bankInfo && <Text style={s.warning}>Link a bank account to withdraw funds.</Text>}
        </Card>

        <Card style={s.card}>
          <View style={s.bankHeader}>
            <View style={s.iconWrap}>
              <Ionicons name="business" size={24} color={colors.primary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={s.cardTitle}>Payout Account</Text>
              <Text style={s.desc}>Link your UPI or Bank Account for instant withdrawals.</Text>
            </View>
          </View>
          
          <Input 
            label="ACCOUNT NUMBER / UPI ID" 
            value={bankInfo} 
            onChangeText={setBankInfo}
            placeholder="e.g. 1234567890 or user@upi"
          />
          <Button 
            title={loading ? 'Saving...' : 'Save Bank Details'} 
            onPress={saveBankInfo} 
            disabled={loading || !bankInfo}
            secondary
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 16 },
  header: { marginBottom: 10, marginTop: 10 },
  title: { fontSize: 32, fontWeight: '900', color: colors.navy2, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: 4, fontWeight: '600' },
  balanceCard: { backgroundColor: colors.primary, borderRadius: 24, padding: 24, gap: 8, ...shadows.md },
  label: { fontSize: 13, color: colors.primarySoft, fontWeight: '800', letterSpacing: 1 },
  balance: { fontSize: 44, fontWeight: '900', color: colors.white, letterSpacing: -1 },
  payoutText: { color: colors.primarySoft, fontSize: 13, fontWeight: '500', marginBottom: 16 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 16 },
  breakdownItem: { alignItems: 'flex-start' },
  breakdownLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  breakdownValue: { color: colors.white, fontSize: 16, fontWeight: '800' },
  card: { padding: 20, gap: 16 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.navy2, marginBottom: 4 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.primarySoft, padding: 16, borderRadius: 16, marginTop: 8 },
  payoutLabel: { color: colors.navy, fontSize: 12, fontWeight: '600', marginBottom: 2 },
  payoutDate: { color: colors.primary, fontSize: 16, fontWeight: '800' },
  graph: { flexDirection: 'row', height: 120, alignItems: 'flex-end', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10, marginTop: 10 },
  barContainer: { width: '12%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 14, backgroundColor: colors.primary, borderRadius: 4 },
  graphLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  graphLabel: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.bg, padding: 16, borderRadius: 16, marginBottom: 8 },
  walletLabel: { fontSize: 12, color: colors.muted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  walletValue: { fontSize: 22, fontWeight: '900', color: colors.navy2 },
  bankHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  desc: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  warning: { color: colors.amberSoft, fontSize: 13, marginTop: 4, textAlign: 'center', fontWeight: '600' }
});
