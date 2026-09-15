import type {MonitoringStatus} from "../types/monitoring";
import {api} from "./api";
export const getMonitoringStatus=()=>api<MonitoringStatus>("/api/monitoramento");
