import React,{useEffect,useState} from 'react';
import {Alert,Image,KeyboardAvoidingView,Platform,SafeAreaView,ScrollView,StyleSheet,Text,View,Dimensions,StatusBar} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import type {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useAuth} from '../auth/AuthContext';
import {normalizePhoneNumber,phoneAuthErrorMessage} from '../auth/phoneAuth';
import {Button,Card,Input} from '../components/ui';
import {colors, radius, spacing, shadows} from '../theme/theme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen(){const {sendOtp,authError}=useAuth();const [slide,setSlide]=useState(0);const [phone,setPhone]=useState('+91 ');const [confirm,setConfirm]=useState<FirebaseAuthTypes.ConfirmationResult|null>(null);const [sentPhone,setSentPhone]=useState('');const [code,setCode]=useState('');const [loading,setLoading]=useState(false);const [resendAt,setResendAt]=useState(0);const [resendSeconds,setResendSeconds]=useState(0);
useEffect(()=>{if(!confirm)return;const update=()=>setResendSeconds(Math.max(0,Math.ceil((resendAt-Date.now())/1000)));update();const timer=setInterval(update,1000);return()=>clearInterval(timer)},[confirm,resendAt]);
const doOtp=async()=>{const normalized=normalizePhoneNumber(phone);if(!normalized)return Alert.alert('Enter a valid mobile number','Use + followed by the country calling code and number, for example +919876543210.');setLoading(true);try{setConfirm(await sendOtp(normalized));setSentPhone(normalized);setCode('');setResendAt(Date.now()+30000)}catch(e:any){Alert.alert('Could not send OTP',phoneAuthErrorMessage(e))}finally{setLoading(false)}};
const verify=async()=>{const trimmed=code.trim();if(!confirm||!/^\d{6}$/.test(trimmed))return Alert.alert('Enter your OTP','Enter the six-digit code from the latest Firebase SMS.');setLoading(true);try{await confirm.confirm(trimmed)}catch(e:any){Alert.alert('Could not verify code',phoneAuthErrorMessage(e))}finally{setLoading(false)}};
const changeNumber=()=>{setConfirm(null);setCode('');setSentPhone('');setResendSeconds(0)};
return (
  <View style={s.root}>
    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
    
    <Image
      source={require('../../assets/custom_splash.jpg')}
      style={s.bgImage}
      resizeMode="cover"
    />

    {/* Transparent Hero Spacer to push card down */}
    <View style={s.heroSpacer} />

    {slide === 0 ? (
      <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 40, paddingHorizontal: 20 }}>
        <Button title="Get Started" onPress={() => setSlide(1)} />
      </View>
    ) : (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.cardWrapper}>
          {!confirm ? (
            <View style={s.onboardCard}>
              <Text style={s.title}>Welcome back</Text>
              <Text style={s.copy}>Enter your mobile number to get started.</Text>
              
              <Input label="MOBILE NUMBER (INCLUDE COUNTRY CODE)" icon="phone-portrait-outline" keyboardType="phone-pad" autoComplete="tel" autoCapitalize="none" value={phone} onChangeText={setPhone} />
              {authError&&<Text style={{color:colors.red,fontSize:12,marginBottom:12}}>{authError}</Text>}
              
              <Button title={loading?'Sending OTP…':'Continue'} icon="arrow-forward" disabled={loading} onPress={doOtp}/>
              
              <Text style={s.terms}>Firebase will send an SMS verification code. Standard SMS rates may apply. By continuing, you agree to WayMate's Terms, Privacy Policy and safety guidelines.</Text>
              
              <View style={s.bullets}>
                {[['shield-checkmark','Verified identity'],['people','Trusted community'],['navigate','Live trip tracking']].map(([i,t])=><View key={t} style={s.bullet}><Ionicons name={i as any} size={20} color={colors.primary}/><Text style={s.bulletText}>{t}</Text></View>)}
              </View>
            </View>
          ) : (
            <View style={s.onboardCard}>
              <View style={s.backBtnWrap}>
                <Ionicons name="arrow-back" size={24} color={colors.navy} onPress={changeNumber} />
              </View>
              <Text style={s.title}>Verify your number</Text>
              <Text style={s.copy}>Enter the 6-digit OTP sent by Firebase to {sentPhone}.</Text>
              
              <Input label="OTP" icon="keypad-outline" keyboardType="number-pad" autoComplete="sms-otp" textContentType="oneTimeCode" maxLength={6} value={code} onChangeText={setCode}/>
              
              <Button title={loading?'Verifying…':'Verify & continue'} icon="checkmark" disabled={loading||code.length<6} onPress={verify}/>
              <Button secondary title={resendSeconds>0?`Resend code in ${resendSeconds}s`:'Resend OTP'} disabled={loading||resendSeconds>0} onPress={doOtp}/>
              {authError&&<Text style={{color:colors.red,fontSize:12,marginTop:8}}>{authError}</Text>}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    )}
  </View>
)}
const s=StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  bgImage: { position: 'absolute', width: '100%', height: '100%', zIndex: 0 },
  heroSpacer: { height: height * 0.45, alignItems: 'center' },
  content: { flexGrow: 1, justifyContent: 'flex-end' },
  cardWrapper: { paddingHorizontal: 20, zIndex: 10, paddingBottom: 40 },
  onboardCard: { backgroundColor: colors.white, borderRadius: 24, padding: 24, ...shadows.md },
  title: { fontSize: 26, fontWeight: '900', color: colors.navy2, letterSpacing: -0.5, marginBottom: 8 },
  copy: { fontSize: 15, color: colors.muted, marginBottom: 24 },
  terms: { fontSize: 11, lineHeight: 16, color: colors.mutedLight, textAlign: 'center', marginTop: 16, marginBottom: 24, paddingHorizontal: 10 },
  bullets: { gap: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bulletText: { fontSize: 15, fontWeight: '600', color: colors.navy },
  backBtnWrap: { marginBottom: 16, alignSelf: 'flex-start' }
});
