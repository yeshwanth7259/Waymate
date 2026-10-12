import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { ArrowLeft, CheckCircle2, UploadCloud, FileText } from 'lucide-react-native';

export default function DriverDocs({ navigation }: any) {
  const [docs, setDocs] = useState({
    license: false,
    rc: false,
    insurance: false
  });

  const allDone = docs.license && docs.rc && docs.insurance;

  const simulateUpload = (key: keyof typeof docs) => {
    alert('Uploading document...');
    setTimeout(() => {
      setDocs(prev => ({ ...prev, [key]: true }));
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Verification</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
           <Text style={styles.infoTitle}>Complete your profile</Text>
           <Text style={styles.infoText}>We need these documents to verify you as a trusted driver on Waymate. Your data is encrypted and secure.</Text>
        </View>

        <DocCard 
           title="Driving License" 
           subtitle="Front and Back" 
           isDone={docs.license} 
           onPress={() => simulateUpload('license')} 
        />
        <DocCard 
           title="Vehicle RC" 
           subtitle="Registration Certificate" 
           isDone={docs.rc} 
           onPress={() => simulateUpload('rc')} 
        />
        <DocCard 
           title="Vehicle Insurance" 
           subtitle="Valid insurance policy" 
           isDone={docs.insurance} 
           onPress={() => simulateUpload('insurance')} 
        />

        <View style={{flex: 1, minHeight: 100}} />

        <TouchableOpacity 
           style={[styles.submitBtn, allDone ? styles.submitBtnActive : styles.submitBtnInactive]}
           disabled={!allDone}
           onPress={() => {
              alert('Documents submitted for verification successfully!');
              navigation.goBack();
           }}
        >
           <Text style={styles.submitBtnText}>Submit for Verification</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const DocCard = ({ title, subtitle, isDone, onPress }: any) => (
  <TouchableOpacity style={[styles.docCard, isDone && styles.docCardDone]} onPress={isDone ? undefined : onPress} disabled={isDone}>
     <View style={[styles.iconBox, isDone && {backgroundColor: '#d1fae5'}]}>
        {isDone ? <CheckCircle2 color="#00A859" size={24}/> : <FileText color="#64748b" size={24}/>}
     </View>
     <View style={styles.docInfo}>
        <Text style={styles.docTitle}>{title}</Text>
        <Text style={styles.docSub}>{subtitle}</Text>
     </View>
     {!isDone && (
       <View style={styles.uploadBtn}>
          <UploadCloud color="#00A859" size={20} />
          <Text style={styles.uploadText}>Upload</Text>
       </View>
     )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f2e53', paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { padding: 5, marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { padding: 20, flexGrow: 1 },
  infoBox: { backgroundColor: '#e6f4ea', padding: 20, borderRadius: 16, marginBottom: 30 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#00A859', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#334155', lineHeight: 22 },
  
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 15, shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, elevation:2, borderWidth: 1, borderColor: '#f1f5f9' },
  docCardDone: { borderColor: '#00A859', backgroundColor: '#f8fafc' },
  iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f2e53', marginBottom: 4 },
  docSub: { fontSize: 12, color: '#64748b' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  uploadText: { fontSize: 14, fontWeight: 'bold', color: '#00A859', marginLeft: 6 },

  submitBtn: { padding: 18, borderRadius: 16, alignItems: 'center' },
  submitBtnActive: { backgroundColor: '#0f2e53' },
  submitBtnInactive: { backgroundColor: '#cbd5e1' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
