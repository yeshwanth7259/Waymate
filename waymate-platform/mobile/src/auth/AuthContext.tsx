import React,{createContext,useContext,useEffect,useState} from 'react';
import auth,{FirebaseAuthTypes} from '@react-native-firebase/auth';
import {userApi} from '../api/services';
type C={user:FirebaseAuthTypes.User|null;profile:any;loading:boolean;refresh:()=>Promise<any>;sendOtp:(phone:string)=>Promise<FirebaseAuthTypes.ConfirmationResult>;logout:()=>Promise<void>};
const AuthContext=createContext<C>({user:null,profile:null,loading:true,refresh:async()=>null,sendOtp:async()=>{throw new Error('not ready')},logout:async()=>{}});
export function AuthProvider({children}:{children:React.ReactNode}){
 const [user,setUser]=useState<FirebaseAuthTypes.User|null>(null); const [profile,setProfile]=useState<any>(null); const [loading,setLoading]=useState(true);
 async function refresh(){const p=await userApi.me();setProfile(p);return p;}
 useEffect(()=>{const unsub=auth().onAuthStateChanged(async u=>{setUser(u);if(u){try{await refresh()}catch{}}else setProfile(null);setLoading(false)});return unsub},[]);
 return <AuthContext.Provider value={{user,profile,loading,refresh,sendOtp:(phone)=>auth().signInWithPhoneNumber(phone),logout:()=>auth().signOut()}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
