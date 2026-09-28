import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { IconButton } from './ui';

export default function AppHeader({ title, subtitle, navigation, showBack = false }: any) {
  return <View style={styles.header}>
    {showBack ? <IconButton icon="arrow-back" onPress={() => navigation.goBack()} label="Back" /> : <Image source={require('../../waymate-horizontal.png')} style={styles.logo} />}
    {title && <View style={{ flex: 1, marginHorizontal: 10 }}><Text style={styles.title}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>}
    {!title && <View style={{ flex: 1 }} />}
    <Pressable onPress={() => navigation.navigate('Profile')} style={styles.profile}><Ionicons name="person-outline" size={19} color={colors.navy} /></Pressable>
  </View>;
}
const styles=StyleSheet.create({header:{height:64,paddingHorizontal:18,flexDirection:'row',alignItems:'center',backgroundColor:colors.white,borderBottomWidth:1,borderBottomColor:colors.border},logo:{width:126,height:44,resizeMode:'contain'},title:{fontSize:18,fontWeight:'900',color:colors.navy},subtitle:{fontSize:11,color:colors.muted,marginTop:2},profile:{width:40,height:40,borderRadius:20,backgroundColor:colors.greenSoft,alignItems:'center',justifyContent:'center'}});
