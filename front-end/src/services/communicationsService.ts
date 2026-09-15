import type {CommunicationWithEvent} from "../types/communication";
import {api} from "./api";
const url=(id:string)=>`/api/comunicacoes/${encodeURIComponent(id)}`;
export const getAllCommunications=()=>api<CommunicationWithEvent[]>("/api/comunicacoes");
export async function getCommunicationById(id:string):Promise<CommunicationWithEvent|null> {
  const communications=await getAllCommunications();return communications.find(c=>c.id===id)||null;
}
export async function getCommunicationText(id:string):Promise<string> {return (await api<{texto:string}>(url(id))).texto;}
export async function updateCommunicationText(id:string,text:string):Promise<void> {await api(url(id)+"/texto",{method:"PUT",body:JSON.stringify({texto:text})});}
export async function regenerateCommunicationText(id:string):Promise<void> {await api(url(id)+"/regenerar",{method:"POST"});}
export async function simulateCommunicationSend(id:string):Promise<{notificacao?:{mensagem:string}}> {return api(url(id)+"/enviar",{method:"POST"});}
