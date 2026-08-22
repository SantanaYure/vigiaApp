export type Severity = "Crítico" | "Alto" | "Moderado" | "Baixo";
export type EventStatus = "Ativo" | "Monitorando" | "Encerrado";

export interface WeatherEvent {
  id: string;
  tipo: string;
  severidade: Severity;
  regiao: string;
  status: EventStatus;
  detectadoEm: string;
  previsao: string;
  segurados: number;
  regra: string;
  tipoSeguro: string;
}
