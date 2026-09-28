import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE} from '../api/client';
export const LOCATION_TASK='WAYMATE_ACTIVE_TRIP_LOCATION';
const TRIP_KEY='waymate.activeTripId';
TaskManager.defineTask(LOCATION_TASK, async ({data,error}:any)=>{
  if(error||!data?.locations?.length)return;
  const tripId=await AsyncStorage.getItem(TRIP_KEY); if(!tripId)return;
  const token=await auth().currentUser?.getIdToken(); if(!token)return;
  for(const loc of data.locations){
    const p={latitude:loc.coords.latitude,longitude:loc.coords.longitude,accuracy:loc.coords.accuracy??undefined,heading:loc.coords.heading??undefined,speed:loc.coords.speed&&loc.coords.speed>0?loc.coords.speed:undefined,timestamp:new Date(loc.timestamp).toISOString()};
    try{await fetch(`${BASE}/trips/${tripId}/location`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(p)})}catch(e){console.warn('WayMate background location',e)}
  }
});
export async function startLocationPublisher(tripId:string){
  const fg=await Location.requestForegroundPermissionsAsync(); if(fg.status!=='granted')throw new Error('Location permission is required during an active trip');
  const bg=await Location.requestBackgroundPermissionsAsync(); if(bg.status!=='granted')throw new Error('Background location permission is required so live tracking can continue when the screen is locked.');
  await AsyncStorage.setItem(TRIP_KEY,tripId);
  if(!(await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK))) await Location.startLocationUpdatesAsync(LOCATION_TASK,{accuracy:Location.Accuracy.High,distanceInterval:20,timeInterval:5000,pausesUpdatesAutomatically:false,showsBackgroundLocationIndicator:false,foregroundService:{notificationTitle:'WayMate live trip',notificationBody:'Live location sharing is active for this trip.',notificationColor:'#13A85F'}} as any);
  return async()=>{await AsyncStorage.removeItem(TRIP_KEY);if(await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK))await Location.stopLocationUpdatesAsync(LOCATION_TASK);};
}
