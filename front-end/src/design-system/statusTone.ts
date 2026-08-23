import type { CommunicationStatus } from "../types/communication";
import type { Severity } from "../types/event";
import type { MonitoringState } from "../types/monitoring";
import type { SemanticTone } from "./tokens";

export function severityTone(severity: Severity): SemanticTone {
  switch (severity) {
    case "Crítico":
      return "danger";
    case "Alto":
      return "warning";
    case "Moderado":
    case "Baixo":
      return "success";
  }
}

export function communicationStatusTone(status: CommunicationStatus): SemanticTone {
  switch (status) {
    case "Simulada":
    case "Enviada":
      return "success";
    case "Revisada":
      return "info";
    case "Erro":
      return "danger";
    case "Aguardando revisão":
    case "Preparada":
      return "neutral";
  }
}

export function monitoringTone(state: MonitoringState): SemanticTone {
  switch (state) {
    case "ativo":
      return "success";
    case "atualizando":
      return "info";
    case "indisponivel":
      return "danger";
  }
}
