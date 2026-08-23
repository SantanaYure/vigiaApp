export interface ContextoEvento {
  eventoTipo: string;
  severidade: string;
  regiao: string;
}

/**
 * Gera o texto de uma comunicação preventiva.
 *
 * Stub — ainda não existe geração real via IA (depende dos prompts e das
 * regras de negócio da equipe de seguros, Pessoa 2/3 do Desafio 5). Devolve
 * um texto placeholder claramente identificado como tal, para nunca ser
 * confundido com uma mensagem gerada de verdade.
 */
export function gerarMensagemStub(contexto: ContextoEvento, regenerado = false): string {
  const prefixo = regenerado ? "[Mensagem regenerada — stub]" : "[Mensagem gerada — stub]";
  return `${prefixo} Alerta de ${contexto.eventoTipo} (severidade ${contexto.severidade}) na região de ${contexto.regiao}. Este texto é um placeholder — a geração real via IA ainda depende dos prompts e das regras de negócio definidos pela equipe de seguros.`;
}
