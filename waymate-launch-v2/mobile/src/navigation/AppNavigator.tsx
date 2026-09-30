import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import {colors, shadows} from '../theme/theme';
import HomeScreen from '../screens/HomeScreen';
import FindRideScreen from '../screens/FindRideScreen';
import RideResultsScreen from '../screens/RideResultsScreen';
import OfferRideScreen from '../screens/OfferRideScreen';
import MyRidesScreen from '../screens/MyRidesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RideDetailsScreen from '../screens/RideDetailsScreen';
import LiveTripScreen from '../screens/LiveTripScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import KycScreen from '../screens/KycScreen';
import SafetyScreen from '../screens/SafetyScreen';
import SupportScreen from '../screens/SupportScreen';
import WalletScreen from '../screens/WalletScreen';

const Stack=createNativeStackNavigator(); const Tabs=createBottomTabNavigator();
function TabsNav(){return <Tabs.Navigator screenOptions={({route})=>({headerShown:false,tabBarActiveTintColor:colors.primary,tabBarInactiveTintColor:colors.mutedLight,tabBarStyle:{height:68,paddingTop:8,paddingBottom:12,borderTopWidth:0,backgroundColor:colors.white,...shadows.glow},tabBarLabelStyle:{fontSize:11,fontWeight:'700',letterSpacing:-0.2,marginTop:-2},tabBarIcon:({color,size,focused})=>{const map:any={Home:focused?'home':'home-outline',FindRide:focused?'search':'search-outline',OfferRide:focused?'add-circle':'add-circle-outline',MyRides:focused?'ticket':'ticket-outline',Profile:focused?'person':'person-outline'};return <Ionicons name={map[route.name]} size={size+2} color={color}/>}})}><Tabs.Screen name="Home" component={HomeScreen}/><Tabs.Screen name="FindRide" component={FindRideScreen} options={{title:'Find Ride'}}/><Tabs.Screen name="OfferRide" component={OfferRideScreen} options={{title:'Offer Ride'}}/><Tabs.Screen name="MyRides" component={MyRidesScreen} options={{title:'My Rides'}}/><Tabs.Screen name="Profile" component={ProfileScreen}/></Tabs.Navigator>}
export default function AppNavigator(){return <NavigationContainer><Stack.Navigator screenOptions={{headerShown:false}}><Stack.Screen name="Tabs" component={TabsNav}/><Stack.Screen name="RideResults" component={RideResultsScreen}/><Stack.Screen name="RideDetails" component={RideDetailsScreen}/><Stack.Screen name="LiveTrip" component={LiveTripScreen}/><Stack.Screen name="Vehicles" component={VehiclesScreen}/><Stack.Screen name="Kyc" component={KycScreen}/><Stack.Screen name="Safety" component={SafetyScreen}/><Stack.Screen name="Support" component={SupportScreen}/><Stack.Screen name="Wallet" component={WalletScreen}/></Stack.Navigator></NavigationContainer>}
