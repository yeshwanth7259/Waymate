import {adminAuth} from './firebase';
const BASE=(import.meta.env.VITE_API_BASE_URL||'http://localhost:3001/api').replace(/\/$/,'');
async function headers(multipart=false){const token=adminAuth.currentUser?await adminAuth.currentUser.getIdToken():null;const h=new Headers();if(!multipart)h.set('Content-Type','application/json');if(token)h.set('Authorization',`Bearer ${token}`);return h;}
export async function api<T>(path:string,options:RequestInit={}){const h=await headers();const r=await fetch(`${BASE}${path}`,{...options,headers:h});const d=await r.json().catch(()=>null);if(!r.ok)throw new Error(d?.message||`HTTP ${r.status}`);return d as T;}
export async function apiFile(path:string){const h=await headers();const r=await fetch(`${BASE}${path}`,{headers:h});if(!r.ok)throw new Error(`HTTP ${r.status}`);const ct=r.headers.get('content-type')||'';if(ct.includes('application/json')){const d=await r.json();return d.url as string;}const blob=await r.blob();return URL.createObjectURL(blob);}
export {BASE};
