import React,{useCallback,useState} from 'react';
import {Alert,ScrollView,Text} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {kycApi} from '../api/services';
import {Button,Card,Loading} from '../components/ui';
import {colors} from '../theme/theme';
export default function KycScreen(){
 const [state,setState]=useState<any>(); const [loading,setLoading]=useState(true); const load=useCallback(()=>{setLoading(true);kycApi.me().then(setState).catch(e=>Alert.alert('KYC',e.message)).finally(()=>setLoading(false))},[]); React.useEffect(load,[]);
 async function upload(type:'IDENTITY'|'SELFIE'|'DRIVING_LICENSE'){
  try{
   let file:any;
   if(type==='SELFIE'){const p=await ImagePicker.requestCameraPermissionsAsync();if(!p.granted)throw new Error('Camera permission is required for selfie verification');const r=await ImagePicker.launchCameraAsync({mediaTypes:['images'] as any,quality:.7});if(r.canceled)return;const a=r.assets[0];file={uri:a.uri,name:`selfie-${Date.now()}.jpg`,type:a.mimeType||'image/jpeg'};}
   else {const r=await DocumentPicker.getDocumentAsync({copyToCacheDirectory:true,type:['image/*','application/pdf']});if(r.canceled)return;const a=r.assets[0];file={uri:a.uri,name:a.name,type:a.mimeType||'application/octet-stream'};}
   await kycApi.upload(type,file);Alert.alert('Uploaded','Your document is now pending review.');load();
  }catch(e:any){Alert.alert('Upload failed',e.message)}
 }
 async function submit(){try{await kycApi.submit();Alert.alert('KYC submitted','WayMate will review your documents.');load()}catch(e:any){Alert.alert('KYC',e.message)}}
 if(loading)return <Loading/>;const docs=state?.documents||[];const status=state?.kycStatus||'UNVERIFIED';
 return <ScrollView style={{backgroundColor:colors.bg}} contentContainerStyle={{padding:18}}><Text style={{fontSize:30,fontWeight:'900',color:colors.navy}}>Identity & KYC</Text><Text style={{color:colors.muted,marginBottom:14}}>Your documents are private and are reviewed by authorized WayMate operations staff.</Text><Card><Text style={{fontWeight:'900'}}>Status: <Text style={{color:status==='VERIFIED'?colors.green:colors.amber}}>{status}</Text></Text></Card>{[['IDENTITY','Government ID'],['SELFIE','Selfie verification'],['DRIVING_LICENSE','Driving licence (required to offer rides)']].map(([type,label])=>{const d=docs.find((x:any)=>x.type===type);return <Card key={type}><Text style={{fontSize:17,fontWeight:'900',color:colors.navy}}>{label}</Text><Text style={{color:colors.muted,marginVertical:6}}>{d?.status||'NOT UPLOADED'}</Text><Button title={d?.status==='VERIFIED'?'Verified':`Upload ${label}`} secondary={d?.status==='VERIFIED'} onPress={()=>upload(type as any)} /></Card>})}<Button title="Submit KYC for review" onPress={submit} disabled={!docs.some((d:any)=>d.type==='IDENTITY')||!docs.some((d:any)=>d.type==='SELFIE')}/><Text style={{fontSize:12,color:colors.muted,marginTop:10}}>WayMate should retain only what is necessary for verification and apply your configured legal retention policy.</Text></ScrollView>
}
