import React,{useEffect,useState} from 'react';
import {Alert,ScrollView,StyleSheet,Text,View} from 'react-native';
import AppHeader from '../components/AppHeader';
import {Badge,Button,Card,Loading} from '../components/ui';
import {paymentApi} from '../api/services';
import {useAuth} from '../auth/AuthContext';
import {colors} from '../theme/theme';

const money=(v:any)=>`₹${Math.round(Number(v||0)).toLocaleString('en-IN')}`;
export default function PaymentScreen({route,navigation}:any){
 const {user}=useAuth(); const [payment,setPayment]=useState<any>(); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(false);
 const load=()=>paymentApi.booking(route.params.bookingId).then(setPayment).catch(e=>Alert.alert('Payment unavailable',e.message)).finally(()=>setLoading(false));
 useEffect(()=>{load()},[]);
 
 if(loading)return <Loading/>;
 const gross=Number(payment?.amount||0); const commission=Number(payment?.payout?.platformFee||0); const driverShare=Number(payment?.payout?.payoutAmount||Math.max(0,gross-commission));
 return <View style={s.root}><AppHeader title="Trip Payment" subtitle="Pay directly to driver" navigation={navigation} showBack/><ScrollView contentContainerStyle={s.content}>
  <Card style={s.hero}><Badge text="Zero processing fees" icon="cash-outline"/><Text style={s.title}>Pay your driver directly at the end of the trip</Text><Text style={s.copy}>You do not need to pay WayMate. At the end of your trip, pay the driver directly via Cash or their personal UPI QR code.</Text><View style={s.amount}><Text style={s.amountLabel}>RIDE FARE</Text><Text style={s.amountValue}>{money(gross)}</Text></View></Card>
  <Card><Text style={s.section}>How it works</Text><Row label="You pay directly to the driver" value={money(gross)} strong/><Row label="WayMate commission" value={`-${money(commission)}`}/><View style={s.divider}/><Row label="Driver net earnings" value={money(driverShare)} green strong/><View style={s.driverNote}><Text style={s.driverNoteTitle}>Driver pays commission</Text><Text style={s.driverNoteSub}>The WayMate commission is automatically deducted from the driver's wallet. You only need to pay the total fare directly to the driver.</Text></View></Card>
  <Card><Text style={s.section}>Payment method</Text><Badge text="DIRECT TO DRIVER" tone="green"/><Text style={s.success}>Your seat is confirmed! Please pay the driver directly during the trip.</Text><Button title="View My Rides" icon="car" onPress={()=>navigation.navigate('Tabs',{screen:'MyRides'})}/></Card>
 </ScrollView></View>
}
function Row({label,value,strong,green}:{label:string,value:string,strong?:boolean,green?:boolean}){return <View style={s.row}><Text style={[s.rowLabel,strong&&s.strong]}>{label}</Text><Text style={[s.rowValue,strong&&s.strong,green&&s.green]}>{value}</Text></View>}
const s=StyleSheet.create({root:{flex:1,backgroundColor:colors.bg},content:{padding:16,paddingBottom:30},hero:{padding:18},title:{fontSize:22,fontWeight:'900',color:colors.navy,marginTop:14},copy:{fontSize:11,lineHeight:17,color:colors.muted,marginTop:7},amount:{marginTop:18,padding:16,borderRadius:16,backgroundColor:colors.greenPale,alignItems:'center'},amountLabel:{fontSize:9,fontWeight:'900',color:colors.muted},amountValue:{fontSize:30,fontWeight:'900',color:colors.greenDark,marginTop:2},section:{fontSize:16,fontWeight:'900',color:colors.navy,marginBottom:12},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:7},rowLabel:{fontSize:11,color:colors.muted,flex:1},rowValue:{fontSize:12,fontWeight:'800',color:colors.navy},strong:{fontWeight:'900'},green:{color:colors.greenDark},divider:{height:1,backgroundColor:colors.border,marginVertical:5},driverNote:{marginTop:10,padding:12,borderRadius:12,backgroundColor:colors.greenPale},driverNoteTitle:{fontSize:11,fontWeight:'900',color:colors.greenDark},driverNoteSub:{fontSize:9,lineHeight:14,color:colors.muted,marginTop:3},success:{fontSize:12,lineHeight:18,color:colors.muted,marginTop:12,marginBottom:16},note:{fontSize:9,lineHeight:14,color:colors.muted,textAlign:'center',marginTop:14}});
