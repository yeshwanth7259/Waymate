import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { Badge, Card, Button } from '../components/ui';
import { colors } from '../theme/theme';

const SUPPORT = '+91 7259335286';

export default function SupportScreen({ navigation }: any) {
  const call = () => Linking.openURL('tel:+917259335286');
  return <View style={s.root}>
    <AppHeader title="Help & Support" subtitle="WayMate support and safety" navigation={navigation} showBack />
    <ScrollView contentContainerStyle={s.content}>
      <Card style={s.hero}>
        <View style={s.icon}><Ionicons name="headset" size={28} color={colors.greenDark}/></View>
        <Text style={s.title}>We're here when you need us.</Text>
        <Text style={s.copy}>For booking issues, verification help, trip safety or urgent support, contact WayMate support.</Text>
        <Button title="Call WayMate Support" icon="call" onPress={call} />
        <Text style={s.number}>{SUPPORT}</Text>
      </Card>
      <Card>
        <Badge text="Emergency" tone="red" icon="alert-circle"/>
        <Text style={s.sectionTitle}>If you feel unsafe during a trip</Text>
        <Text style={s.copy}>Use the SOS button in the active-trip screen and contact local emergency services when there is immediate danger. WayMate support is not a substitute for emergency services.</Text>
        <Pressable style={s.linkRow} onPress={() => navigation.navigate('Safety')}>
          <Ionicons name="shield-checkmark" size={20} color={colors.greenDark}/><Text style={s.link}>Open Safety Centre</Text><Ionicons name="chevron-forward" size={18} color={colors.muted}/>
        </Pressable>
      </Card>
      <Card>
        <Text style={s.sectionTitle}>Common help</Text>
        {['Booking or cancellation','KYC and document verification','Vehicle RC / insurance verification','Live trip or location sharing','Women Safety Mode'].map(x => <View key={x} style={s.item}><Ionicons name="checkmark-circle" size={18} color={colors.green}/><Text style={s.itemText}>{x}</Text></View>)}
      </Card>
    </ScrollView>
  </View>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:colors.bg},content:{padding:16,paddingBottom:40},hero:{padding:20},icon:{width:56,height:56,borderRadius:18,backgroundColor:colors.greenSoft,alignItems:'center',justifyContent:'center'},title:{fontSize:25,fontWeight:'900',color:colors.navy,marginTop:16},copy:{fontSize:13,lineHeight:20,color:colors.muted,marginTop:8},number:{textAlign:'center',fontWeight:'900',color:colors.navy,marginTop:8},sectionTitle:{fontSize:18,fontWeight:'900',color:colors.navy,marginTop:12},linkRow:{marginTop:16,padding:13,borderRadius:14,backgroundColor:colors.greenPale,flexDirection:'row',alignItems:'center',gap:9},link:{flex:1,color:colors.greenDark,fontWeight:'900'},item:{flexDirection:'row',alignItems:'center',gap:9,marginTop:13},itemText:{color:colors.text,fontWeight:'700'}});
