import React,{useEffect,useState} from 'react';
import {StatusBar} from 'expo-status-bar';
import {AuthProvider,useAuth} from './src/auth/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import AppNavigator from './src/navigation/AppNavigator';
import {Loading} from './src/components/ui';
function Root(){const {user,profile,loading}=useAuth();if(loading)return <Loading/>;if(!user)return <LoginScreen/>;if(!profile?.firstName||!profile?.lastName||!profile?.gender)return <ProfileSetupScreen/>;return <AppNavigator/>}
export default function App(){return <AuthProvider><StatusBar style="dark"/><Root/></AuthProvider>}
