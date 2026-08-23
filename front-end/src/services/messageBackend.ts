const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001";

export interface ContextoEvento {
  eventoTipo: string;
  severidade: string;
  regiao: string;
}

/**
 * Pede ao backend (../../backend) para regenerar o texto de uma comunicação.
 * O backend ainda devolve um stub (não há geração real via IA), mas a
 * chamada em si é real — prova a integração front-end → backend. Retorna
 * `null` se o backend não estiver acessível, para o chamador decidir o
 * fallback (hoje: manter o texto atual).
 */
export async function regenerarMensagem(contexto: ContextoEvento): Promise<string | null> {
  try {
    const resposta = await fetch(`${BACKEND_URL}/api/regenerar-mensagem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contexto),
    });
    if (!resposta.ok) return null;

    const corpo = (await resposta.json()) as { texto: string };
    return corpo.texto;
  } catch (erro) {
    console.warn("Não foi possível contatar o backend para regenerar a mensagem:", erro);
    return null;
  }
}
