import type { CommunicationStatus } from "./communication";

export interface Customer {
  nome: string;
  apolice: string;
  regiao: string;
  statusComunicacao: CommunicationStatus;
  /** Código IBGE do município do segurado, usado para cruzar com eventos climáticos reais. */
  codigoIbge: string;
}
