export type MonitoringState = "ativo" | "atualizando" | "indisponivel";

export interface MonitoringStatus {
  state: MonitoringState;
  label: string;
  lastUpdateLabel: string;
}
