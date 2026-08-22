export type CommunicationChannel = "SMS" | "E-mail";
export type CommunicationStatus = "Aguardando revisão" | "Revisada" | "Simulada" | "Erro" | "Enviada" | "Preparada";

export interface Communication {
  id: string;
  eventId: string;
  canal: CommunicationChannel;
  status: CommunicationStatus;
  segurados: number;
  geradoEm: string;
}

export interface CommunicationWithEvent extends Communication {
  eventoTipo: string;
}
