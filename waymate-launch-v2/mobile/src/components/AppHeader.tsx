import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { IconButton } from './ui';
import { useAuth } from '../auth/AuthContext';

export default function AppHeader({ title, subtitle, navigation, showBack = false, showToggle = false }: any) {
  const { appMode, setAppMode, profile } = useAuth();

  const handleToggle = (mode: 'RIDER' | 'DRIVER') => {
    if (mode === 'DRIVER' && profile?.kycStatus !== 'VERIFIED') {
      Alert.alert('Verification Required', 'You must complete your driver KYC verification in your profile before offering rides.');
      navigation.navigate('Profile');
      return;
    }
    setAppMode(mode);
  };

  return <View style={styles.header}>
    {showBack ? <IconButton icon="arrow-back" onPress={() => navigation.goBack()} label="Back" /> : <Image source={require('../../waymate-horizontal.png')} style={styles.logo} />}
    
    {!showToggle && title && <View style={{ flex: 1, marginHorizontal: 10 }}><Text style={styles.title}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>}
    {!showToggle && !title && <View style={{ flex: 1 }} />}

    {showToggle && (
      <View style={styles.toggleContainer}>
        <Pressable onPress={() => handleToggle('RIDER')} style={[styles.toggleBtn, appMode === 'RIDER' && styles.toggleActive]}>
          <Text style={[styles.toggleText, appMode === 'RIDER' && styles.toggleTextActive]}>Ride</Text>
        </Pressable>
        <Pressable onPress={() => handleToggle('DRIVER')} style={[styles.toggleBtn, appMode === 'DRIVER' && styles.toggleActive]}>
          <Text style={[styles.toggleText, appMode === 'DRIVER' && styles.toggleTextActive]}>Drive</Text>
        </Pressable>
      </View>
    )}

    <Pressable onPress={() => navigation.navigate('Profile')} style={styles.profile}><Ionicons name="person-outline" size={19} color={colors.navy} /></Pressable>
  </View>;
}
const styles=StyleSheet.create({header:{height:64,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:colors.white,borderBottomWidth:1,borderBottomColor:colors.border},logo:{width:126,height:44,resizeMode:'contain'},title:{fontSize:18,fontWeight:'900',color:colors.navy},subtitle:{fontSize:11,color:colors.muted,marginTop:2},profile:{width:40,height:40,borderRadius:20,backgroundColor:colors.greenSoft,alignItems:'center',justifyContent:'center'},toggleContainer:{flexDirection:'row',backgroundColor:colors.bg,borderRadius:100,padding:4,marginHorizontal:16,flex:1,maxWidth:180,alignSelf:'center'},toggleBtn:{flex:1,paddingVertical:6,alignItems:'center',borderRadius:100},toggleActive:{backgroundColor:colors.primary},toggleText:{fontSize:13,fontWeight:'700',color:colors.muted},toggleTextActive:{color:colors.white}});
