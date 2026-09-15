import { useEffect, useRef, useState } from "react";
import { getCommunicationText, regenerateCommunicationText, simulateCommunicationSend, updateCommunicationText } from "../../services/communicationsService";
export function useMessageEditor(communicationId:string|null,onSimulated:()=>void) {
  const [text,setText]=useState("");
  const [isEditing,setIsEditing]=useState(false);
  const [isConfirmOpen,setIsConfirmOpen]=useState(false);
  const [toastMessage,setToastMessage]=useState<string|null>(null);
  const currentIdRef=useRef(communicationId);currentIdRef.current=communicationId;
  const busy=useRef(false);
  const dirty=useRef(false);
  const toastTimeoutRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  function notify(message:string) {
    if(toastTimeoutRef.current)clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);toastTimeoutRef.current=setTimeout(()=>setToastMessage(null),6000);
  }
  useEffect(()=>{
    setText("");setIsEditing(false);setIsConfirmOpen(false);dirty.current=false;
    if(!communicationId)return;
    let active=true;
    getCommunicationText(communicationId).then(value=>{if(active)setText(value);}).catch(error=>{if(active)notify(error instanceof Error?error.message:"Falha ao carregar mensagem.");});
    return ()=>{active=false;};
  },[communicationId]);
  useEffect(()=>()=>{if(toastTimeoutRef.current)clearTimeout(toastTimeoutRef.current);},[]);
  function onTextChange(value:string){setText(value);dirty.current=true;}
  async function save(id:string) {
    if(dirty.current){await updateCommunicationText(id,text);if(currentIdRef.current===id)dirty.current=false;}
  }
  async function onToggleEdit() {
    if(busy.current)return;
    if(!isEditing){setIsEditing(true);return;}
    if(!communicationId)return;
    const id=communicationId;busy.current=true;
    try {await save(id);if(currentIdRef.current===id)setIsEditing(false);}
    catch(e){notify(e instanceof Error?e.message:"Falha ao salvar.");}
    finally{busy.current=false;}
  }
  async function onRegenerate() {
    if(!communicationId||busy.current)return;
    const id=communicationId;busy.current=true;
    try {
      await regenerateCommunicationText(id);const value=await getCommunicationText(id);
      if(currentIdRef.current===id){setText(value);dirty.current=false;}
    } catch(e){if(currentIdRef.current===id)notify(e instanceof Error?e.message:"Falha ao regenerar.");}
    finally{busy.current=false;}
  }
  function onRequestSimulate(){setIsConfirmOpen(true);}
  function onCancelSimulate(){setIsConfirmOpen(false);}
  async function onConfirmSimulate() {
    if(!communicationId||busy.current)return;
    const id=communicationId;busy.current=true;
    try {
      await save(id);const result=await simulateCommunicationSend(id);onSimulated();
      if(currentIdRef.current===id){setIsConfirmOpen(false);setIsEditing(false);notify(result.notificacao?.mensagem || "Envio concluído.");}
    } catch(e){if(currentIdRef.current===id)notify(e instanceof Error?e.message:"Falha ao enviar.");}
    finally{busy.current=false;}
  }
  return {text,isEditing,isConfirmOpen,toastMessage,onToggleEdit,onTextChange,onRegenerate,onRequestSimulate,onCancelSimulate,onConfirmSimulate};
}
