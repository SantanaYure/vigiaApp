import type { Communication } from "../types/communication";

export const communicationsMock: Communication[] = [
  { id: "c1", eventId: "ev1", canal: "SMS", status: "Simulada", segurados: 1248, geradoEm: "14:11" },
  { id: "c2", eventId: "ev2", canal: "E-mail", status: "Aguardando revisão", segurados: 642, geradoEm: "13:55" },
  { id: "c3", eventId: "ev3", canal: "SMS", status: "Revisada", segurados: 210, geradoEm: "12:40" },
  { id: "c4", eventId: "ev4", canal: "SMS", status: "Erro", segurados: 58, geradoEm: "09:20" },
];
