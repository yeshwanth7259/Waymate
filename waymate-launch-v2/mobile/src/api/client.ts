import auth from '@react-native-firebase/auth';
const BASE = 'https://dog-segment-microwave-lip.trycloudflare.com/api';
async function token(){const u=auth().currentUser;return u?await u.getIdToken():null;}
export async function api<T>(path:string,options:RequestInit={}){const t=await token();const headers=new Headers(options.headers);headers.set('Bypass-Tunnel-Reminder','true');if(!(options.body instanceof FormData))headers.set('Content-Type','application/json');if(t)headers.set('Authorization',`Bearer ${t}`);const r=await fetch(`${BASE}${path}`,{...options,headers});const raw=await r.text();let d:any=null;try{d=raw?JSON.parse(raw):null}catch{d=raw}if(!r.ok)throw Object.assign(new Error(d?.message||`Request failed ${r.status}`),{code:d?.code,status:r.status});return d as T;}
export async function apiMultipart<T>(path:string,file:{uri:string,name:string,type:string},fields:Record<string,string>){const form=new FormData();Object.entries(fields).forEach(([k,v])=>form.append(k,v));form.append('file',{uri:file.uri,name:file.name,type:file.type} as any);return api<T>(path,{method:'POST',body:form});}
export {BASE};
