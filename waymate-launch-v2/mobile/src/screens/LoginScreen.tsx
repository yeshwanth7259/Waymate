import React,{useState} from 'react';
import {Alert,Image,KeyboardAvoidingView,Platform,SafeAreaView,ScrollView,StyleSheet,Text,View,Dimensions,StatusBar} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../auth/AuthContext';
import {Button,Card,Input} from '../components/ui';
import {colors, radius, spacing, shadows} from '../theme/theme';

const { width } = Dimensions.get('window');

export default function LoginScreen(){const {sendOtp}=useAuth();const [phone,setPhone]=useState('+91 ');const [confirm,setConfirm]=useState<any>(null);const [code,setCode]=useState('');const [loading,setLoading]=useState(false);const doOtp=async()=>{if(phone.replace(/\D/g,'').length<10)return Alert.alert('Enter your mobile number','Use a valid Indian mobile number.');setLoading(true);try{setConfirm(await sendOtp(phone.replace(/\s/g,'')))}catch(e:any){Alert.alert('Could not send OTP',e.message)}finally{setLoading(false)}};const verify=async()=>{setLoading(true);try{await confirm.confirm(code)}catch(e:any){Alert.alert('Invalid OTP','Check the code and try again.')}finally{setLoading(false)}};return (
  <View style={s.root}>
    <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
    
    {/* Beautiful Top Hero Section */}
    <View style={s.hero}>
      <View style={s.heroContent}>
        <View style={s.brandBadge}>
          <Ionicons name="car-sport" size={24} color={colors.primary} />
          <Text style={s.brandName}>WAYMATE</Text>
        </View>
        <Text style={s.heroTitle}>Carpooling has never been more exciting & simple</Text>
        <Text style={s.heroSubtitle}>Safe carpool rides with verified professionals only</Text>
      </View>
      <View style={s.heroCurve} />
    </View>

    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.cardWrapper}>
          {!confirm ? (
            <View style={s.onboardCard}>
              <Text style={s.title}>Welcome back</Text>
              <Text style={s.copy}>Enter your mobile number to get started.</Text>
              
              <Input label="MOBILE NUMBER" icon="phone-portrait-outline" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              
              <Button title={loading?'Sending OTP…':'Continue'} icon="arrow-forward" disabled={loading} onPress={doOtp}/>
              
              <Text style={s.terms}>By continuing, you agree to WayMate's Terms, Privacy Policy and safety guidelines.</Text>
              
              <View style={s.bullets}>
                {[['shield-checkmark','Verified identity'],['people','Trusted community'],['navigate','Live trip tracking']].map(([i,t])=><View key={t} style={s.bullet}><Ionicons name={i as any} size={20} color={colors.primary}/><Text style={s.bulletText}>{t}</Text></View>)}
              </View>
            </View>
          ) : (
            <View style={s.onboardCard}>
              <View style={s.backBtnWrap}>
                <Ionicons name="arrow-back" size={24} color={colors.navy} onPress={()=>setConfirm(null)} />
              </View>
              <Text style={s.title}>Verify your number</Text>
              <Text style={s.copy}>Enter the 6-digit OTP sent to {phone}.</Text>
              
              <Input label="OTP" icon="keypad-outline" keyboardType="number-pad" maxLength={6} value={code} onChangeText={setCode}/>
              
              <Button title={loading?'Verifying…':'Verify & continue'} icon="checkmark" disabled={loading||code.length<6} onPress={verify}/>
              <Button secondary title="Resend OTP" onPress={()=>setConfirm(null)}/>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
)}
const s=StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: { backgroundColor: colors.primary, paddingTop: 60, paddingBottom: 60, alignItems: 'center' },
  heroContent: { paddingHorizontal: 30, alignItems: 'center', zIndex: 2 },
  brandBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 30, marginBottom: 24, ...shadows.sm },
  brandName: { color: colors.primary, fontSize: 16, fontWeight: '900', letterSpacing: 1.5, marginLeft: 8 },
  heroTitle: { color: colors.white, fontSize: 32, fontWeight: '900', textAlign: 'center', lineHeight: 38, marginBottom: 12 },
  heroSubtitle: { color: colors.primarySoft, fontSize: 15, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },
  heroCurve: { position: 'absolute', bottom: -30, width: width * 1.5, height: 100, backgroundColor: colors.primary, borderRadius: width * 0.75, zIndex: 1 },
  content: { flexGrow: 1 },
  cardWrapper: { paddingHorizontal: 20, marginTop: -40, zIndex: 10, paddingBottom: 40 },
  onboardCard: { backgroundColor: colors.white, borderRadius: 24, padding: 24, ...shadows.md },
  title: { fontSize: 26, fontWeight: '900', color: colors.navy2, letterSpacing: -0.5, marginBottom: 8 },
  copy: { fontSize: 15, color: colors.muted, marginBottom: 24 },
  terms: { fontSize: 11, lineHeight: 16, color: colors.mutedLight, textAlign: 'center', marginTop: 16, marginBottom: 24, paddingHorizontal: 10 },
  bullets: { gap: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bulletText: { fontSize: 15, fontWeight: '600', color: colors.navy },
  backBtnWrap: { marginBottom: 16, alignSelf: 'flex-start' }
});
