import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Animated, ScrollView } from 'react-native';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../lib/AuthContext';
import auth from '@react-native-firebase/auth';
import { NativeModules } from 'react-native';

export default function Login({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirm, setConfirm] = useState<any>(null);
  
  // New details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (nextStep: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true })
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true })
      ]).start();
    });
  };

  const isFormValid = () => {
     return name.length > 2 && email.includes('@') && gender !== '' && dob.length > 0;
  };

  const { setUser } = useAuth();

  const handleNext = async () => {
    if (step === 1 && phone.length > 9) {
      try {
        if (!NativeModules.RNFBAppModule) {
           alert("CRITICAL ERROR: You are running this inside Expo Go! Expo Go CANNOT send Real SMS. You must delete Expo Go and install the actual APK file from the Downloads folder.");
           return;
        }
        
        // Ensure auth is callable
        const firebaseAuth = typeof auth === 'function' ? auth() : auth;
        const confirmation = await firebaseAuth.signInWithPhoneNumber(`+91${phone}`);
        setConfirm(confirmation);
        animateTransition(2);
      } catch (error: any) {
        console.error("SMS Error:", error);
        alert(`Failed: ${error.message || 'Unknown Error'}`);
      }
    }
    else if (step === 2 && otp.length === 4) {
      try {
        if (confirm) {
          await confirm.confirm(otp);
        }
        animateTransition(3);
      } catch (error) {
        console.error("OTP Error:", error);
        alert("Invalid OTP");
      }
    }
    else if (step === 3 && isFormValid()) {
       setUser({
         fullName: name,
         phone: phone,
         email: email,
         dateOfBirth: dob,
         gender: gender
       });
       navigation.navigate('RoleSelection');
    }
  };

  const handleBack = () => {
    if (step > 1) animateTransition(step - 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <View style={styles.topBar}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
               <ArrowLeft color="#0f2e53" size={24} />
            </TouchableOpacity>
          ) : <View style={styles.backBtn} />}
          <Text style={styles.stepIndicator}>Step {step} of 3</Text>
        </View>

        <Animated.View style={[styles.animContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
               <Text style={styles.title}>
                 {step === 1 ? "What's your number?" : step === 2 ? "Verify OTP" : "Complete your profile"}
               </Text>
               <Text style={styles.subtitle}>
                 {step === 1 ? "We'll text a code to verify your phone." : step === 2 ? `Sent to +91 ${phone}` : "Help us know you better."}
               </Text>
            </View>
            
            {step === 1 && (
               <View style={styles.inputContainer}>
                 <Text style={styles.prefix}>+91</Text>
                 <TextInput 
                    style={styles.input} 
                    keyboardType="number-pad" 
                    placeholder="00000 00000"
                    placeholderTextColor="#cbd5e1"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                    autoFocus
                 />
               </View>
            )}

            {step === 2 && (
               <View style={styles.inputContainer}>
                 <TextInput 
                    style={[styles.input, {textAlign: 'center', letterSpacing: 15}]} 
                    keyboardType="number-pad" 
                    placeholder="----"
                    placeholderTextColor="#cbd5e1"
                    value={otp}
                    onChangeText={setOtp}
                    maxLength={4}
                    autoFocus
                 />
               </View>
            )}

            {step === 3 && (
               <View style={styles.formContainer}>
                 <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    <TextInput style={styles.fieldInput} placeholder="e.g. Aravind K" value={name} onChangeText={setName} />
                 </View>
                 <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>Email Address</Text>
                    <TextInput style={styles.fieldInput} placeholder="aravind@example.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                 </View>
                 <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>Date of Birth</Text>
                    <TextInput style={styles.fieldInput} placeholder="DD/MM/YYYY" value={dob} onChangeText={setDob} />
                 </View>
                 <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>Gender</Text>
                    <View style={styles.genderRow}>
                       {['Male', 'Female', 'Other'].map(g => (
                         <TouchableOpacity key={g} style={[styles.genderBtn, gender === g && styles.genderActive]} onPress={() => setGender(g)}>
                            <Text style={[styles.genderText, gender === g && {color: '#fff'}]}>{g}</Text>
                         </TouchableOpacity>
                       ))}
                    </View>
                 </View>
               </View>
            )}
          </ScrollView>
        </Animated.View>

        <TouchableOpacity 
          style={[styles.btn, ((step===1 && phone.length>9) || (step===2 && otp.length===4) || (step===3 && isFormValid())) ? styles.btnActive : styles.btnInactive]} 
          onPress={handleNext}
        >
          <Text style={styles.btnText}>{step === 3 ? "Complete Profile" : "Continue"}</Text>
          <ArrowRight color="#fff" size={20} />
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, paddingBottom: 10 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  stepIndicator: { fontSize: 14, color: '#94a3b8', fontWeight: 'bold' },
  animContainer: { flex: 1 },
  header: { marginTop: 10, marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0f2e53', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#64748b', lineHeight: 24 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#00A859', paddingBottom: 12, marginTop: 30 },
  prefix: { fontSize: 28, fontWeight: 'bold', color: '#0f2e53', marginRight: 12 },
  input: { flex: 1, fontSize: 28, fontWeight: 'bold', color: '#0f2e53' },
  
  formContainer: { gap: 20 },
  formField: {},
  fieldLabel: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 },
  fieldInput: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, fontSize: 16, color: '#0f2e53', borderWidth: 1, borderColor: '#f1f5f9' },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  genderActive: { backgroundColor: '#00A859', borderColor: '#00A859' },
  genderText: { fontSize: 14, fontWeight: 'bold', color: '#64748b' },

  btn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 16, marginTop: 10, shadowColor: '#00A859', shadowOffset:{width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnActive: { backgroundColor: '#00A859' },
  btnInactive: { backgroundColor: '#cbd5e1', shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 10 }
});
