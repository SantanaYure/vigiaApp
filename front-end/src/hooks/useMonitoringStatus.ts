import {useEffect,useState} from "react";
import {getMonitoringStatus} from "../services/monitoringService";
import type {MonitoringStatus} from "../types/monitoring";
const INITIAL:MonitoringStatus={state:"atualizando",label:"Consultando monitoramento",lastUpdateLabel:"Aguardando resposta do servidor"};
export function useMonitoringStatus():MonitoringStatus {
  const [status,setStatus]=useState<MonitoringStatus>(INITIAL);
  useEffect(()=>{
    let active=true;
    const refresh=()=>getMonitoringStatus().then(result=>{if(active)setStatus(result);}).catch(()=>{if(active)setStatus({state:"indisponivel",label:"Servidor indisponível",lastUpdateLabel:"Não foi possível consultar o monitoramento"});});
    void refresh();const timer=setInterval(()=>void refresh(),30000);
    return ()=>{active=false;clearInterval(timer);};
  },[]);
  return status;
}
