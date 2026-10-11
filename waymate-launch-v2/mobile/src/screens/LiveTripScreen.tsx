import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { Badge, Button, Loading } from '../components/ui';
import { colors } from '../theme/theme';
import { useAuth } from '../auth/AuthContext';
import { safetyApi, tripApi } from '../api/services';
import { disconnectSocket, joinTrip } from '../services/socket';
import { startLocationPublisher } from '../services/location';

export default function LiveTripScreen({ route, navigation }: any) {
  const { profile } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [locations, setLocations] = useState<Record<string, any>>({});
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const stopRef = useRef<null | (() => Promise<void>)>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let active = true;

    const loadTrip = async () => {
      try {
        const result = await tripApi.get(route.params.tripId);
        if (!active) return;
        setTrip(result);
        (result.locations || []).forEach((location: any) => {
          setLocations(current => ({ ...current, [location.userId]: location }));
        });
        cleanup = await joinTrip(result.id, {
          update: (location: any) => setLocations(current => ({ ...current, [location.userId]: location })),
          snapshot: (items: any[]) => {
            const latest: Record<string, any> = {};
            items.forEach(location => { latest[location.userId] = location; });
            setLocations(latest);
          },
          status: (status: any) => setTrip((current: any) => ({ ...current, status: status.status })),
        });
        setConnected(true);
        if (result.status === 'IN_PROGRESS') stopRef.current = await startLocationPublisher(result.id);
      } catch (error: any) {
        Alert.alert('Live trip unavailable', error.message);
        navigation.goBack();
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadTrip();
    return () => {
      active = false;
      cleanup?.();
      void stopRef.current?.();
      disconnectSocket();
    };
  }, [navigation, route.params.tripId]);

  const runTripAction = async (action: () => Promise<any>) => {
    try {
      const updated = await action();
      setTrip((current: any) => ({ ...current, ...updated }));
      if (updated.status === 'IN_PROGRESS' && !stopRef.current) {
        stopRef.current = await startLocationPublisher(updated.id);
      }
    } catch (error: any) {
      Alert.alert('Trip action failed', error.message);
    }
  };

  const sendSos = async () => {
    try {
      const ownLocation = locations[profile?.id || ''];
      await safetyApi.sos({
        tripId: trip.id,
        latitude: ownLocation?.latitude,
        longitude: ownLocation?.longitude,
        message: 'SOS raised from active WayMate trip',
      });
      Alert.alert('SOS sent', 'WayMate operations have been alerted. If you are in immediate danger, contact local emergency services now.');
    } catch (error: any) {
      Alert.alert('SOS failed', error.message);
    }
  };

  if (loading) return <Loading />;
  if (!trip) return null;

  const points = Object.values(locations);
  const first: any = points[0] || { latitude: 12.9716, longitude: 77.5946 };
  const coordinates = points.map((point: any) => ({ latitude: point.latitude, longitude: point.longitude }));
  const isHost = trip.ride?.hostId === profile?.id;
  const hostIsLive = points.some((point: any) => point.role === 'HOST');
  const riderCount = points.filter((point: any) => point.role === 'RIDER').length;

  return (
    <View style={s.root}>
      <AppHeader title="Live Trip" subtitle={trip.status === 'IN_PROGRESS' ? 'Location sharing active' : trip.status} navigation={navigation} showBack />
      <MapView
        style={s.map}
        initialRegion={{ latitude: first.latitude, longitude: first.longitude, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
        showsUserLocation
      >
        {coordinates.length > 1 && <Polyline coordinates={coordinates} strokeColor={colors.green} strokeWidth={4} />}
        {points.map((point: any) => (
          <Marker
            key={point.userId}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title={point.role === 'HOST' ? 'Driver' : 'Rider'}
          >
            <View style={[s.marker, point.role === 'HOST' ? s.hostMarker : s.riderMarker]}>
              <Ionicons name={point.role === 'HOST' ? 'car' : 'person'} size={17} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>
      <View style={s.sheet}>
        <View style={s.handle} />
        <View style={s.routeRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.route}>{trip.ride?.origin} → {trip.ride?.destination}</Text>
            <Text style={s.sub}>{connected ? 'Live connection' : 'Connecting…'} · {trip.status}</Text>
          </View>
          <Badge text={`${riderCount} rider${riderCount === 1 ? '' : 's'}`} icon="people" />
        </View>
        <View style={s.people}>
          <View style={s.person}><Ionicons name="car" size={18} color={colors.greenDark} /><Text style={s.personText}>{hostIsLive ? 'Driver live' : 'Waiting for driver'}</Text></View>
          <View style={s.person}><Ionicons name="people" size={18} color={colors.greenDark} /><Text style={s.personText}>{riderCount} rider location{riderCount === 1 ? '' : 's'} shared</Text></View>
        </View>
        {trip.status === 'IN_PROGRESS' && (
          <View style={s.quick}>
            <Pressable onPress={() => navigation.navigate('TripChat', { tripId: trip.id })}>
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.navy} /><Text>Chat</Text>
            </Pressable>
            <Pressable onPress={sendSos}>
              <Ionicons name="alert-circle" size={20} color={colors.red} /><Text style={{ color: colors.red }}>SOS</Text>
            </Pressable>
          </View>
        )}
        {isHost && trip.status === 'SCHEDULED' && <Button title="Start Trip & Share Location" icon="navigate" onPress={() => runTripAction(() => tripApi.start(trip.id))} />}
        {isHost && trip.status === 'IN_PROGRESS' && <Button title="Complete Trip" icon="checkmark" onPress={() => runTripAction(() => tripApi.complete(trip.id))} />}
        {!isHost && trip.status === 'IN_PROGRESS' && <Text style={s.notice}>Your live location may be shared with the active trip and WayMate operations while this trip is running.</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  map: { flex: 1 },
  sheet: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#fff', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 15, elevation: 8 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#D6DFDB', alignSelf: 'center', marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  route: { fontSize: 16, fontWeight: '900', color: colors.navy },
  sub: { fontSize: 11, color: colors.muted, marginTop: 3 },
  people: { flexDirection: 'row', gap: 10, marginTop: 12 },
  person: { flex: 1, padding: 11, borderRadius: 13, backgroundColor: colors.greenPale, flexDirection: 'row', alignItems: 'center', gap: 7 },
  personText: { fontSize: 11, fontWeight: '800', color: colors.navy },
  quick: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 12 },
  notice: { fontSize: 10, lineHeight: 15, color: colors.muted, textAlign: 'center', marginTop: 8 },
  marker: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff', elevation: 5 },
  hostMarker: { backgroundColor: colors.green },
  riderMarker: { backgroundColor: colors.navy },
});
