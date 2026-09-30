import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input, Badge } from '../components/ui';
import { colors, shadows, radius } from '../theme/theme';
import { api } from '../api/client';

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [bankInfo, setBankInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api<any>('/wallet');
      setBalance(res.balance || 0);
      setBankInfo(res.bankInfo || '');
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
    if (balance <= 0) return Alert.alert('Error', 'Insufficient balance for payout.');
    setLoading(true);
    try {
      await api('/wallet/payout', { method: 'POST', body: JSON.stringify({ amount: balance }) });
      Alert.alert('Payout Initiated', 'The amount will be credited to your linked bank account shortly.');
      fetchWallet();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}>
          <Ionicons name="wallet" size={32} color={colors.primary} style={{marginBottom: 8}} />
          <Text style={s.title}>Driver Earnings</Text>
          <Text style={s.subtitle}>Instant spot payouts to your bank</Text>
        </View>

        <View style={s.balanceCard}>
          <Text style={s.label}>AVAILABLE BALANCE</Text>
          <Text style={s.balance}>₹{balance.toFixed(2)}</Text>
          <View style={s.payoutInfo}>
            <Ionicons name="flash" size={16} color={colors.amber} />
            <Text style={s.payoutText}>Eligible for Instant Spot Payout</Text>
          </View>
          <Button 
            title={loading ? 'Processing...' : 'Withdraw to Bank'} 
            onPress={processPayout} 
            disabled={loading || balance <= 0 || !bankInfo}
            icon="cash-outline"
          />
          {!bankInfo && <Text style={s.warning}>Link a bank account to withdraw funds.</Text>}
        </View>

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
  content: { padding: 20, gap: 20 },
  header: { marginBottom: 10, marginTop: 10 },
  title: { fontSize: 32, fontWeight: '900', color: colors.navy2, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4, fontWeight: '500' },
  balanceCard: { backgroundColor: colors.primary, borderRadius: 24, padding: 24, gap: 12, ...shadows.md },
  label: { fontSize: 13, color: colors.primarySoft, fontWeight: '700', letterSpacing: 1 },
  balance: { fontSize: 48, fontWeight: '900', color: colors.white, marginBottom: 4, letterSpacing: -1 },
  payoutInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, alignSelf: 'flex-start', marginBottom: 12 },
  payoutText: { color: colors.white, fontSize: 13, fontWeight: '600', marginLeft: 6 },
  card: { padding: 20, gap: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.navy2, marginBottom: 4 },
  bankHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  desc: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  warning: { color: colors.amberSoft, fontSize: 13, marginTop: 4, textAlign: 'center', fontWeight: '600' }
});
