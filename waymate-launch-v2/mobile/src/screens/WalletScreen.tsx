import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { Badge, Button, Card, Input, Loading } from '../components/ui';
import { walletApi } from '../api/services';
import { colors } from '../theme/theme';

const money = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

export default function WalletScreen({ navigation }: any) {
  const [earnings, setEarnings] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [summary, ledger] = await Promise.all([walletApi.earnings(), walletApi.wallet()]);
      setEarnings(summary);
      setWallet(ledger);
    } catch (error: any) {
      Alert.alert('Wallet unavailable', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const submitRemittance = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return Alert.alert('Enter an amount', 'Enter a positive amount you have already paid to WayMate outside this app.');
    if (!reference.trim()) return Alert.alert('Add payment reference', 'Enter the external UPI or bank transfer reference for admin verification.');
    setBusy(true);
    try {
      await walletApi.submitRemittance(value, reference.trim());
      setAmount('');
      setReference('');
      Alert.alert('Submitted for review', 'WayMate operations will verify your external payment reference.');
      await load();
    } catch (error: any) {
      Alert.alert('Could not submit payment', error.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading label="Loading your driver wallet…" />;

  const due = Number(earnings?.pending || 0);
  const weeks = earnings?.weeks || [];

  return (
    <View style={s.root}>
      <AppHeader title="Driver Wallet" subtitle="Cash earnings and platform commission" navigation={navigation} showBack />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={s.content}
      >
        <Card style={s.hero}>
          <Text style={s.kicker}>CASH COLLECTED THIS WEEK</Text>
          <Text style={s.gross}>{money(Number(earnings?.thisWeek?.gross || 0))}</Text>
          <View style={s.breakdown}>
            <View><Text style={s.breakdownLabel}>Driver keeps</Text><Text style={s.breakdownValue}>{money(Number(earnings?.thisWeek?.net || 0))}</Text></View>
            <View><Text style={s.breakdownLabel}>Platform fee · 12%</Text><Text style={s.breakdownValue}>-{money(Number(earnings?.thisWeek?.commission || 0))}</Text></View>
          </View>
        </Card>

        <Card>
          <View style={s.walletHeader}>
            <View style={s.walletIcon}><Ionicons name="wallet-outline" size={22} color={colors.greenDark} /></View>
            <View style={{ flex: 1 }}><Text style={s.title}>Platform balance</Text><Text style={s.copy}>Negative amounts are commission you owe WayMate.</Text></View>
          </View>
          <Text style={[s.balance, due > 0 && s.negative]}>{due > 0 ? `-${money(due)}` : money(0)}</Text>
          <Badge text={`${money(due)} commission due`} tone={due > 0 ? 'amber' : 'green'} />
        </Card>

        <Card style={s.notice}>
          <Text style={s.noticeTitle}>No online payment or payout</Text>
          <Text style={s.copy}>Riders pay you directly in cash or UPI after the ride. WayMate never collects the rider fare. The 12% platform commission is recorded here; settle it outside the app using payment instructions supplied by WayMate, then submit the transfer reference below for admin review.</Text>
        </Card>

        {due > 0 && <Card>
          <Text style={s.title}>Submit an external commission payment</Text>
          <Text style={s.copy}>This records a payment you have already made; it does not move money or initiate a payout.</Text>
          <Input label="AMOUNT PAID (₹)" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder={`Up to ${Math.round(due)}`} />
          <Input label="UPI / BANK TRANSFER REFERENCE" value={reference} onChangeText={setReference} placeholder="Transaction reference" autoCapitalize="characters" />
          <Button title={busy ? 'Submitting…' : 'Submit for admin verification'} disabled={busy} onPress={submitRemittance} />
        </Card>}

        <Text style={s.sectionTitle}>Six-week earnings</Text>
        <Card>
          {weeks.length ? weeks.map((week: any, index: number) => (
            <View key={`${week.label}-${index}`} style={s.weekRow}>
              <Text style={s.weekLabel}>{week.label}</Text>
              <Text style={s.weekSub}>Gross {money(Number(week.gross || 0))} · fee {money(Number(week.commission || 0))}</Text>
              <Text style={s.weekNet}>{money(Number(week.net || 0))}</Text>
            </View>
          )) : <Text style={s.copy}>Completed cash collections will appear here.</Text>}
        </Card>

        <Text style={s.sectionTitle}>Wallet ledger</Text>
        {wallet?.transactions?.length ? wallet.transactions.map((item: any) => (
          <Card key={item.id} style={s.transaction}>
            <View style={{ flex: 1 }}>
              <Text style={s.transactionTitle}>{item.type === 'PLATFORM_COMMISSION' ? '12% platform commission' : 'External commission payment'}</Text>
              <Text style={s.copy}>{item.reference} · {new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
            </View>
            <View style={s.transactionRight}>
              <Text style={[s.transactionAmount, item.amount < 0 && s.negative]}>{item.amount < 0 ? '-' : '+'}{money(Math.abs(Number(item.amount || 0)))}</Text>
              <Badge text={item.status} tone={item.status === 'VERIFIED' ? 'green' : item.status === 'REJECTED' ? 'red' : 'amber'} />
            </View>
          </Card>
        )) : <Card><Text style={s.copy}>No cash collection or commission entries yet.</Text></Card>}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  hero: { backgroundColor: colors.navy, padding: 20 },
  kicker: { color: '#CFE2DB', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  gross: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 5 },
  breakdown: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.18)', marginTop: 15, paddingTop: 13, flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { color: '#CFE2DB', fontSize: 10 },
  breakdownValue: { color: '#fff', fontWeight: '900', fontSize: 15, marginTop: 4 },
  walletHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  walletIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '900', color: colors.navy },
  copy: { fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 4 },
  balance: { fontSize: 30, fontWeight: '900', color: colors.navy, marginVertical: 10 },
  negative: { color: colors.red },
  notice: { backgroundColor: '#F2F8FF' },
  noticeTitle: { fontSize: 14, fontWeight: '900', color: colors.navy },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.navy, marginTop: 12, marginBottom: 8 },
  weekRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  weekLabel: { width: 54, fontWeight: '800', color: colors.navy, fontSize: 11 },
  weekSub: { flex: 1, color: colors.muted, fontSize: 9 },
  weekNet: { fontWeight: '900', color: colors.greenDark, fontSize: 12 },
  transaction: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  transactionTitle: { color: colors.navy, fontWeight: '900', fontSize: 12 },
  transactionRight: { alignItems: 'flex-end', gap: 4 },
  transactionAmount: { color: colors.greenDark, fontWeight: '900', fontSize: 13 },
});
