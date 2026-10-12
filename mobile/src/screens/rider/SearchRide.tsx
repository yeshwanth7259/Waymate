import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, SafeAreaView, Platform } from 'react-native';
import { MapPin, ArrowDownUp, Calendar, Clock, ArrowLeft, Car, Bike } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SearchRide({ navigation }: any) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);
  const [vehicleType, setVehicleType] = useState('any');
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const onChangeTime = (event: any, selectedTime: Date | undefined) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setDate(selectedTime);
  };

  const handleSwap = () => {
     const temp = from;
     setFrom(to);
     setTo(temp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBg}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Ride</Text>
        <Text style={styles.headerSubtitle}>Book a verified seat</Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <View style={styles.locationsWrapper}>
             <View style={styles.timeline}>
                <View style={styles.dotEmpty} />
                <View style={styles.line} />
                <View style={styles.dotFilled}>
                   <MapPin color="#ff4444" size={14} />
                </View>
             </View>
             
             <View style={styles.inputsContainer}>
                <View style={styles.inputBox}>
                   <Text style={styles.label}>FROM</Text>
                   <TextInput style={styles.input} placeholder="Enter pickup location" value={from} onChangeText={setFrom} />
                </View>
                
                <TouchableOpacity style={styles.swapBtn} onPress={handleSwap}>
                   <ArrowDownUp color="#999" size={16} />
                </TouchableOpacity>

                <View style={styles.inputBox}>
                   <Text style={styles.label}>TO</Text>
                   <TextInput style={styles.input} placeholder="Enter drop location" value={to} onChangeText={setTo} />
                </View>
             </View>
          </View>

          <View style={styles.row}>
             <TouchableOpacity style={styles.halfInput} onPress={() => setShowDatePicker(true)}>
                <Calendar color="#666" size={16} />
                <Text style={styles.subInputText}>{date.toLocaleDateString()}</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.halfInput} onPress={() => setShowTimePicker(true)}>
                <Clock color="#666" size={16} />
                <Text style={styles.subInputText}>{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
             </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
          )}
          {showTimePicker && (
            <DateTimePicker value={date} mode="time" display="default" onChange={onChangeTime} />
          )}

          <Text style={styles.sectionLabel}>Vehicle Preference</Text>
          <View style={styles.vehicleOptions}>
            <TouchableOpacity 
              style={[styles.vehicleOption, vehicleType === 'any' && styles.vehicleOptionActive]} 
              onPress={() => setVehicleType('any')}
            >
              <Text style={[styles.vehicleText, vehicleType === 'any' && styles.vehicleTextActive]}>Any</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.vehicleOption, vehicleType === 'car' && styles.vehicleOptionActive]} 
              onPress={() => setVehicleType('car')}
            >
              <Car color={vehicleType === 'car' ? '#00A859' : '#64748b'} size={18} />
              <Text style={[styles.vehicleText, vehicleType === 'car' && styles.vehicleTextActive]}>Car</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.vehicleOption, vehicleType === 'bike' && styles.vehicleOptionActive]} 
              onPress={() => setVehicleType('bike')}
            >
              <Bike color={vehicleType === 'bike' ? '#00A859' : '#64748b'} size={18} />
              <Text style={[styles.vehicleText, vehicleType === 'bike' && styles.vehicleTextActive]}>Bike</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleBox}>
             <View>
                <Text style={styles.toggleTitle}>Women Safety Mode</Text>
                <Text style={styles.toggleSub}>Prioritise women-only rides.</Text>
             </View>
             <Switch 
                value={womenOnly} 
                onValueChange={setWomenOnly}
                trackColor={{ false: '#e0e0e0', true: '#bbf7d0' }}
                thumbColor={womenOnly ? '#00A859' : '#f4f3f4'}
             />
          </View>

          <TouchableOpacity 
             style={[styles.btn, (!from || !to) && {backgroundColor: '#94a3b8'}]} 
             disabled={!from || !to}
             onPress={() => navigation.navigate('RideResults')}
          >
             <Text style={styles.btnText}>Find Rides</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerBg: { backgroundColor: '#00A859', paddingTop: 20, paddingBottom: 60, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { marginBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#d1fae5' },
  cardContainer: { paddingHorizontal: 20, marginTop: -40 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  locationsWrapper: { flexDirection: 'row', marginBottom: 15 },
  timeline: { width: 30, alignItems: 'center', marginTop: 25 },
  dotEmpty: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#00A859', backgroundColor: '#fff' },
  line: { width: 1, flex: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },
  dotFilled: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  inputsContainer: { flex: 1, position: 'relative' },
  inputBox: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 10 },
  label: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', letterSpacing: 1 },
  input: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginTop: 4, padding: 0 },
  swapBtn: { position: 'absolute', right: 20, top: '50%', marginTop: -15, width: 30, height: 30, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, zIndex: 10 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  halfInput: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  subInputText: { fontSize: 14, fontWeight: '500', color: '#0f172a', marginLeft: 8, flex: 1 },
  toggleBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#d1fae5', borderRadius: 16, padding: 16, marginBottom: 20 },
  toggleTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  toggleSub: { fontSize: 12, color: '#64748b' },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 10, marginTop: 5 },
  vehicleOptions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  vehicleOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', gap: 6 },
  vehicleOptionActive: { backgroundColor: '#ecfdf5', borderColor: '#00A859' },
  vehicleText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  vehicleTextActive: { color: '#00A859' },
  btn: { backgroundColor: '#00A859', borderRadius: 16, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
