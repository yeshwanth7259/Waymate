import React,{createContext,useContext,useEffect,useState} from 'react';
import auth,{FirebaseAuthTypes} from '@react-native-firebase/auth';
import {userApi} from '../api/services';

type C={user:FirebaseAuthTypes.User|null;profile:any;loading:boolean;authError:string|null;refresh:()=>Promise<any>;sendOtp:(phone:string)=>Promise<FirebaseAuthTypes.ConfirmationResult>;logout:()=>Promise<void>;appMode:'RIDER'|'DRIVER';setAppMode:(m:'RIDER'|'DRIVER')=>void};
const AuthContext=createContext<C>({user:null,profile:null,loading:true,authError:null,refresh:async()=>null,sendOtp:async()=>{throw new Error('Authentication is not configured')},logout:async()=>{},appMode:'RIDER',setAppMode:()=>{}});

 export function AuthProvider({children}:{children:React.ReactNode}){
 const [user,setUser]=useState<FirebaseAuthTypes.User|null>(null); const [profile,setProfile]=useState<any>(null); const [loading,setLoading]=useState(true); const [authError,setAuthError]=useState<string|null>(null);
 const [appMode, setAppMode] = useState<'RIDER'|'DRIVER'>('RIDER');
 async function refresh(){const p=await userApi.me();setProfile(p);return p;}
 useEffect(()=>{
   let unsub:undefined|(()=>void);
   try {
     unsub=auth().onAuthStateChanged(async u=>{setUser(u); if(u){try{await refresh();}catch(e:any){setProfile(null);}} else setProfile(null); setLoading(false);});
   } catch(e:any) {
     setAuthError(e?.message || 'Firebase Authentication is not configured in this Android build.');
     setLoading(false);
   }
   return ()=>{ if(unsub) unsub(); };
 },[]);
 const sendOtp=async(phone:string)=>{try{return await auth().signInWithPhoneNumber(phone);}catch(e:any){throw e;}};
 return <AuthContext.Provider value={{user,profile,loading,authError,refresh,sendOtp,logout:()=>auth().signOut(),appMode,setAppMode}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
