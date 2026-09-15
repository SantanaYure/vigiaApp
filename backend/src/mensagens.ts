import { GoogleGenAI } from "@google/genai";

export interface ContextoEvento {
  eventoTipo: string;
  severidade: string;
  regiao: string;
}

export interface OpcoesGeracao {
  apiKey?: string;
  regenerado?: boolean;
}

export const INSTRUCAO_SISTEMA = `Você é o redator de comunicações preventivas da Vigia, uma plataforma inteligente para seguradoras.
Sua missão é gerar mensagens claras, humanas e acolhedoras para clientes segurados antes ou durante a vigência de eventos climáticos adversos.
Mantenha o foco em segurança de vidas e proteção patrimonial (residência e veículos).
Oriente com recomendações preventivas práticas compatíveis com o tipo de evento e nível de severidade.
Nunca invente telefones ou URLs fictícias — oriente o segurado a acionar os canais e a assistência 24h da seguradora pelo aplicativo em caso de emergência ou sinistro.`;

export function construirPrompt(contexto: ContextoEvento, regenerado = false): string {
  if (regenerado) {
    return `Gere uma versão alternativa e mais concisa de comunicação preventiva para os segurados da região de ${contexto.regiao}.
Evento climático detectado: ${contexto.eventoTipo} (Severidade: ${contexto.severidade}).
Foque em ações rápidas de prevenção, checklist de segurança imediata e reforço do suporte da seguradora.`;
  }

  return `Gere uma mensagem de comunicação preventiva para os clientes segurados da região de ${contexto.regiao}.
Evento climático: ${contexto.eventoTipo}
Severidade: ${contexto.severidade}

Estrutura recomendada:
1. Alerta amigável e informativo sobre a previsão na região.
2. Orientações preventivas objetivas (cuidados com casa, carro e segurança pessoal).
3. Disponibilidade do time de suporte e assistência 24h da seguradora em caso de imprevistos.`;
}

/**
 * Gera ou regenera o texto de uma comunicação preventiva utilizando o modelo Gemini 2.5 Flash.
 */
export async function gerarMensagemComGemini(
  contexto: ContextoEvento,
  regenerado = false,
  opcoes?: OpcoesGeracao
): Promise<string> {
  const apiKey = opcoes?.apiKey ?? process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "A chave GEMINI_API_KEY não está configurada no backend. Por favor, adicione sua chave ao arquivo .env."
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = construirPrompt(contexto, regenerado);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: INSTRUCAO_SISTEMA,
      temperature: regenerado ? 0.8 : 0.7,
    },
  });

  const texto = response.text?.trim();
  if (!texto) {
    throw new Error("O modelo Gemini não retornou nenhum texto.");
  }

  return texto;
}
