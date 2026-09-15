const BASE=(import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/,"");
export async function api<T>(path:string,init?:RequestInit):Promise<T> {
  const response=await fetch(BASE+path,{...init,headers:{"Content-Type":"application/json",...init?.headers},signal:AbortSignal.timeout(120000)});
  const data=await response.json();
  if(!response.ok) throw new Error(data.erro || `Falha no servidor (HTTP ${response.status}).`);
  return data as T;
}
