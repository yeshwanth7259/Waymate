import React,{useEffect,useState} from 'react';
import {Alert,ScrollView,StyleSheet,Text,View,Pressable,Switch} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import {Button,Card,Input,SectionTitle,Badge} from '../components/ui';
import {colors} from '../theme/theme';
import {rideApi} from '../api/services';
import { KARNATAKA_CITIES } from '../data/karnataka';

export default function FindRideScreen({navigation,route}:any){
 const [origin,setOrigin]=useState(route.params?.origin||'');const [destination,setDestination]=useState(route.params?.destination||'');const [date,setDate]=useState('');const [womenOnly,setWomenOnly]=useState(false);
 const recent=[['HSR Layout','Whitefield'],['Koramangala','Electronic City'],['Indiranagar','Manyata Tech Park']];
 const search=()=>{if(!origin.trim()||!destination.trim())return Alert.alert('Add your route','Enter pickup and destination to continue.');navigation.navigate('RideResults',{origin:origin.trim(),destination:destination.trim(),date,womenOnly});};
 return <View style={s.root}><AppHeader navigation={navigation} showBack showToggle/><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
   <View style={s.intro}><Badge text="Verified commute matching" icon="shield-checkmark"/><Text style={s.title}>Find a ride that fits your route.</Text><Text style={s.copy}>Search real WayMate rides, compare verified hosts and choose the seat that works for you.</Text></View>
   <Card style={s.searchCard}>
     <View style={s.timelineContainer}>
       <View style={s.timeline}>
         <Ionicons name="location" size={16} color={colors.primary}/>
         <View style={s.timelineLine}/>
         <Ionicons name="location" size={16} color={colors.primary}/>
       </View>
       <View style={{flex: 1}}>
         <Input label="From" placeholder="HSR Layout, Bengaluru" value={origin} onChangeText={setOrigin}/>
         <View style={{height: 12}} />
         <Input label="To" placeholder="Whitefield, Bengaluru" value={destination} onChangeText={setDestination}/>
       </View>
     </View>

     <View style={{height: 16}} />
     <Input icon="calendar-outline" placeholder="Thu, 18 Sep" value={date} onChangeText={setDate}/>
     <View style={{height: 12}} />
     <Input icon="time-outline" placeholder="08:00 AM - 09:00 AM" />

     <View style={s.safetyRow}><View style={{flex:1}}><Text style={s.safetyTitle}>Women Safety Mode</Text><Text style={s.safetyCopy}>Prioritise women-only rides and safety checks.</Text></View><Switch value={womenOnly} onValueChange={setWomenOnly} trackColor={{true:colors.green}} thumbColor="#fff"/></View>
     <Button title="Find Rides" onPress={search}/>
   </Card>
   <SectionTitle title="Karnataka locations" subtitle="Search Bengaluru, Mysuru, Tumakuru, Kolar, KGF and other cities"/><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight:16}}>{KARNATAKA_CITIES.slice(0,18).map(city=><Pressable key={city} onPress={()=>{if(!origin)setOrigin(city);else setDestination(city)}} style={s.cityChip}><Ionicons name="location-outline" size={14} color={colors.greenDark}/><Text style={s.chipText}>{city}</Text></Pressable>)}</ScrollView><SectionTitle title="Recent searches"/>
   <ScrollView horizontal showsHorizontalScrollIndicator={false}>{recent.map(([a,b])=><Pressable key={a+b} onPress={()=>{setOrigin(a);setDestination(b)}} style={s.chip}><Ionicons name="time-outline" size={14} color={colors.greenDark}/><Text style={s.chipText}>{a} → {b}</Text></Pressable>)}</ScrollView>
   <SectionTitle title="Before you book" subtitle="WayMate checks identity, vehicle and safety signals."/>
   {[["shield-checkmark","Verified identity","KYC status is visible before you request a seat."],["car-outline","Verified vehicle","RC and active insurance are required for hosts."],["location-outline","Live trip","Confirmed trips can share live location with riders and operations."]].map(([icon,t,d])=><Card key={t}><View style={{flexDirection:'row',gap:12}}><View style={s.infoIcon}><Ionicons name={icon as any} size={20} color={colors.greenDark}/></View><View style={{flex:1}}><Text style={s.infoTitle}>{t}</Text><Text style={s.infoCopy}>{d}</Text></View></View></Card>)}
 </ScrollView></View>
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:colors.bg},content:{paddingBottom:30},intro:{padding:20,paddingBottom:8},title:{fontSize:27,lineHeight:33,fontWeight:'900',color:colors.navy,marginTop:13},copy:{fontSize:13,lineHeight:20,color:colors.muted,marginTop:8},searchCard:{margin:16,marginTop:10},timelineContainer:{flexDirection:'row'},timeline:{width:30,alignItems:'center',paddingTop:12,paddingBottom:12,marginRight:8},timelineLine:{width:1,flex:1,backgroundColor:colors.border,marginVertical:4},safetyRow:{marginTop:12,marginBottom:16,padding:12,borderRadius:14,backgroundColor:colors.greenPale,flexDirection:'row',alignItems:'center'},safetyTitle:{fontWeight:'900',color:colors.navy},safetyCopy:{fontSize:11,color:colors.muted,marginTop:3},chip:{marginLeft:16,paddingHorizontal:13,paddingVertical:10,borderRadius:20,borderWidth:1,borderColor:colors.border,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',gap:6},chipText:{fontSize:11,color:colors.text,fontWeight:'700'},cityChip:{marginLeft:16,marginBottom:6,paddingHorizontal:12,paddingVertical:9,borderRadius:18,borderWidth:1,borderColor:colors.border,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',gap:5},infoIcon:{width:42,height:42,borderRadius:13,backgroundColor:colors.greenSoft,alignItems:'center',justifyContent:'center'},infoTitle:{fontWeight:'900',color:colors.navy},infoCopy:{fontSize:12,lineHeight:18,color:colors.muted,marginTop:3}});
