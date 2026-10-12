import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, PlusCircle, CreditCard, User, Wallet as WalletIcon } from 'lucide-react-native';

// Screens
import Splash from '../screens/Splash';
import Login from '../screens/Login';
import RoleSelection from '../screens/RoleSelection';
import SearchRide from '../screens/rider/SearchRide';
import RiderHome from '../screens/rider/RiderHome';
import RideResults from '../screens/rider/RideResults';
import RideDetails from '../screens/rider/RideDetails';
import LiveTrip from '../screens/rider/LiveTrip';
import Payment from '../screens/rider/Payment';
import DriverHome from '../screens/driver/DriverHome';
import OfferRide from '../screens/driver/OfferRide';
import DriverDocs from '../screens/driver/DriverDocs';
import DriverLiveTrip from '../screens/driver/DriverLiveTrip';
import Wallet from '../screens/driver/Wallet';

import MyRides from '../screens/rider/MyRides';
import Profile from '../screens/Profile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens for tabs
import { View, Text } from 'react-native';
const Placeholder = () => <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Coming Soon</Text></View>;

function RiderTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={size} />;
          if (route.name === 'Search') return <Search color={color} size={size} />;
          if (route.name === 'My Rides') return <CreditCard color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
        },
        tabBarActiveTintColor: '#00A859',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={RiderHome} />
      <Tab.Screen name="Search" component={SearchRide} />
      <Tab.Screen name="My Rides" component={MyRides} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={size} />;
          if (route.name === 'Offer') return <PlusCircle color={color} size={size} />;
          if (route.name === 'Wallet') return <WalletIcon color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
        },
        tabBarActiveTintColor: '#0f2e53',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={DriverHome} />
      <Tab.Screen name="Offer" component={OfferRide} />
      <Tab.Screen name="Wallet" component={Wallet} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="RoleSelection" component={RoleSelection} />
      <Stack.Screen name="RiderFlow" component={RiderTabs} />
      <Stack.Screen name="DriverFlow" component={DriverTabs} />
      <Stack.Screen name="RideResults" component={RideResults} />
      <Stack.Screen name="RideDetails" component={RideDetails} />
      <Stack.Screen name="LiveTrip" component={LiveTrip} />
      <Stack.Screen name="DriverLiveTrip" component={DriverLiveTrip} />
      <Stack.Screen name="Payment" component={Payment} />
      <Stack.Screen name="DriverDocs" component={DriverDocs} />
    </Stack.Navigator>
  );
}
