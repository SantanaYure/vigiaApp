import { describe, expect, it } from "vitest";
import { communicationStatusTone, monitoringTone, severityTone } from "./statusTone";

describe("severityTone", () => {
  it("maps every severity to its tone", () => {
    expect(severityTone("Crítico")).toBe("danger");
    expect(severityTone("Alto")).toBe("warning");
    expect(severityTone("Moderado")).toBe("success");
    expect(severityTone("Baixo")).toBe("success");
  });
});

describe("communicationStatusTone", () => {
  it("maps every communication status to its tone", () => {
    expect(communicationStatusTone("Simulada")).toBe("success");
    expect(communicationStatusTone("Enviada")).toBe("success");
    expect(communicationStatusTone("Revisada")).toBe("info");
    expect(communicationStatusTone("Erro")).toBe("danger");
    expect(communicationStatusTone("Aguardando revisão")).toBe("neutral");
    expect(communicationStatusTone("Preparada")).toBe("neutral");
  });
});

describe("monitoringTone", () => {
  it("maps every monitoring state to its tone", () => {
    expect(monitoringTone("ativo")).toBe("success");
    expect(monitoringTone("atualizando")).toBe("info");
    expect(monitoringTone("indisponivel")).toBe("danger");
  });
});
