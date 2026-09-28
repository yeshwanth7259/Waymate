import 'react-native-gesture-handler';
import React,{useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider,useAuth } from './src/auth/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { Loading, Card, Button } from './src/components/ui';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from './src/theme/theme';

SplashScreen.preventAutoHideAsync().catch(()=>{});

function StartupError({message}:{message:string}){return <View style={s.errorRoot}><Text style={s.brand}>way<Text style={{color:colors.green}}>mate</Text></Text><Card><Text style={s.title}>WayMate needs one setup step</Text><Text style={s.copy}>{message}</Text><Text style={s.copy}>For an Android release build, add google-services.json from Firebase and rebuild with EAS. For local development, also configure EXPO_PUBLIC_API_BASE_URL.</Text></Card></View>}
function Root(){const {user,profile,loading,authError}=useAuth();useEffect(()=>{if(!loading)SplashScreen.hideAsync().catch(()=>{});},[loading]);if(loading)return <Loading label="Starting WayMate…"/>;if(authError)return <StartupError message={authError}/>;if(!user)return <LoginScreen/>;if(!profile?.firstName||!profile?.lastName||!profile?.gender)return <ProfileSetupScreen/>;return <AppNavigator/>}
export default function App(){return <AuthProvider><StatusBar style="dark" backgroundColor="#F7FAF8"/><Root/></AuthProvider>}
const s=StyleSheet.create({errorRoot:{flex:1,backgroundColor:colors.bg,padding:20,justifyContent:'center'},brand:{fontSize:38,fontWeight:'900',color:colors.navy,marginBottom:24},title:{fontSize:20,fontWeight:'900',color:colors.navy},copy:{fontSize:13,lineHeight:20,color:colors.muted,marginTop:10}});
