"""Cliente HTTP para a API pública de avisos meteorológicos do INMET.

Fonte: https://apiprevmet3.inmet.gov.br/avisos/ativos (avisos ativos, sem
necessidade de autenticação). Cada aviso já vem com severidade, período de
vigência e a lista de municípios (por código IBGE) afetados.
"""

from __future__ import annotations

import requests

BASE_URL = "https://apiprevmet3.inmet.gov.br"
AVISOS_ATIVOS_PATH = "/avisos/ativos"


class ColetaError(RuntimeError):
    """Erro ao coletar dados da API do INMET."""


def buscar_avisos_ativos(timeout: float = 15.0) -> dict:
    """Busca os avisos meteorológicos ativos no INMET.

    Retorna o JSON bruto da API, no formato ``{"hoje": [ ... ]}``.
    Levanta ``ColetaError`` se a API estiver indisponível ou responder
    com erro — a rede é um limite externo, então a falha é tratada aqui
    em vez de propagar uma exceção genérica de rede.
    """
    url = f"{BASE_URL}{AVISOS_ATIVOS_PATH}"
    try:
        resposta = requests.get(url, timeout=timeout)
        resposta.raise_for_status()
    except requests.RequestException as erro:
        raise ColetaError(f"Falha ao buscar avisos do INMET ({url}): {erro}") from erro

    return resposta.json()
