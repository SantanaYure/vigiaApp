import { monitoringStatusMock } from "../mocks/monitoringStatus";
import type { MonitoringStatus } from "../types/monitoring";

export async function getMonitoringStatus(): Promise<MonitoringStatus> {
  return Promise.resolve(monitoringStatusMock);
}
