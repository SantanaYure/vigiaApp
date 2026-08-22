import type { CommunicationStatus } from "./communication";

export interface Customer {
  nome: string;
  apolice: string;
  regiao: string;
  statusComunicacao: CommunicationStatus;
}
