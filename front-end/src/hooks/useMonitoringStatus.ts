import { useEffect, useState } from "react";
import { getMonitoringStatus } from "../services/monitoringService";
import type { MonitoringStatus } from "../types/monitoring";

const FALLBACK: MonitoringStatus = {
  state: "ativo",
  label: "Monitoramento ativo",
  lastUpdateLabel: "Última atualização há 2 min",
};

export function useMonitoringStatus(): MonitoringStatus {
  const [status, setStatus] = useState<MonitoringStatus>(FALLBACK);

  useEffect(() => {
    let active = true;
    getMonitoringStatus().then((result) => {
      if (active) setStatus(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return status;
}
