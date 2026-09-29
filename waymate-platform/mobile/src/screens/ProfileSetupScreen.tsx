import React,{useState} from 'react';
import {Alert,ScrollView,Text,View} from 'react-native';
import {useAuth} from '../auth/AuthContext';
import {userApi} from '../api/services';
import {Button,Card,Input} from '../components/ui';
import {colors} from '../theme/theme';
export default function ProfileSetupScreen(){
 const {profile,refresh}=useAuth(); const [first,setFirst]=useState(profile?.firstName||''); const [last,setLast]=useState(profile?.lastName||''); const [gender,setGender]=useState(profile?.gender||''); const [email,setEmail]=useState(profile?.email||'');
 async function save(){if(!first.trim()||!last.trim()||!gender)return Alert.alert('Complete your profile','Name and gender are required.');try{await userApi.update({firstName:first.trim(),lastName:last.trim(),gender,email:email.trim()});await refresh();}catch(e:any){Alert.alert('Could not save',e.message)}}
 return <ScrollView style={{flex:1,backgroundColor:colors.bg}} contentContainerStyle={{padding:20}}><Text style={{fontSize:30,fontWeight:'900',color:colors.navy}}>Welcome to WayMate</Text><Text style={{color:colors.muted,marginBottom:20}}>Set up your profile once. You can find rides or offer rides from the same account.</Text><Card><Text style={{fontWeight:'900',fontSize:18,color:colors.navy}}>Basic details</Text><Input label="First name" value={first} onChangeText={setFirst}/><Input label="Last name" value={last} onChangeText={setLast}/><Input label="Email (optional)" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}/><Text style={{fontWeight:'800',color:colors.navy,marginBottom:8}}>Gender</Text><View style={{flexDirection:'row',gap:8}}>{['FEMALE','MALE','OTHER'].map(x=><Button key={x} title={x===gender?'✓ '+x:x} secondary={x!==gender} onPress={()=>setGender(x)}/>)}</View></Card><Button title="Continue" onPress={save}/></ScrollView>
}
