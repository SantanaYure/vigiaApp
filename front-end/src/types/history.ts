import type { CommunicationChannel, CommunicationStatus } from "./communication";

export interface HistoryEntry {
  id: string;
  eventoTipo: string;
  regiao: string;
  segurados: number;
  canal: CommunicationChannel;
  status: CommunicationStatus;
  horario: string;
}
