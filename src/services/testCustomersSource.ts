import type { Customer } from "../types/customer";

const SEGURADOS_URL = "/data/segurados-teste.json";

/**
 * Fonte de segurados de TESTE — não é um cadastro real (não existe API real
 * de segurados; depende de integração futura fora do escopo do Desafio 5).
 * Serve para exercitar o cruzamento geográfico evento × segurado com dados
 * estruturados e espalhados por várias capitais, em vez de ficar sempre
 * vazio. Quando uma fonte real existir, troca-se apenas esta função — a
 * interface pública (`customersService`) não muda.
 */
export async function getTestCustomers(): Promise<Customer[]> {
  try {
    const resposta = await fetch(SEGURADOS_URL);
    if (!resposta.ok) return [];

    return await resposta.json();
  } catch (erro) {
    console.warn("Não foi possível carregar os segurados de teste:", erro);
    return [];
  }
}
