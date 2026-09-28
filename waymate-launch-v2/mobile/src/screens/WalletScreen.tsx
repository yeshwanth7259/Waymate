import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '../components/ui';
import { colors } from '../theme/theme';
import { api } from '../services/api';

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
          <Text style={s.title}>Wallet & Payouts</Text>
        </View>

        <Card style={s.card}>
          <Text style={s.label}>Available Balance</Text>
          <Text style={s.balance}>₹{balance.toFixed(2)}</Text>
          <Button 
            title={loading ? 'Processing...' : 'Withdraw to Bank'} 
            onPress={processPayout} 
            disabled={loading || balance <= 0 || !bankInfo}
          />
          {!bankInfo && <Text style={s.warning}>Link a bank account to withdraw funds.</Text>}
        </Card>

        <Card style={s.card}>
          <View style={s.bankHeader}>
            <Ionicons name="business" size={24} color={colors.navy} />
            <Text style={s.cardTitle}>Bank Account Verification</Text>
          </View>
          <Text style={s.desc}>Link your bank account to receive direct payouts from your rides.</Text>
          
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
  header: { marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '800', color: colors.navy },
  card: { padding: 20, gap: 12 },
  label: { fontSize: 14, color: colors.muted, textTransform: 'uppercase', fontWeight: '700' },
  balance: { fontSize: 40, fontWeight: '900', color: colors.greenDark, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
  bankHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  desc: { fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 10 },
  warning: { color: 'red', fontSize: 12, marginTop: 4, textAlign: 'center' }
});
