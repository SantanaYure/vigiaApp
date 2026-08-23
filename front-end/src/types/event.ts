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
  /** Códigos IBGE dos municípios afetados. Vazio para eventos sem fonte geográfica real. */
  geocodesMunicipios: string[];
}
