"""Normaliza a resposta bruta do INMET para o formato interno do pipeline.

Esta é a fronteira entre "o que o INMET manda" e "o que as próximas etapas
do pipeline (identificação de eventos, regras de negócio) esperam receber".
Só este módulo conhece o formato bruto da API.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class AvisoClimatico:
    """Um aviso meteorológico já normalizado, pronto para as próximas etapas."""

    id: int
    tipo: str
    severidade: str
    cor: str
    inicio: datetime
    fim: datetime
    estados: list[str]
    geocodes_municipios: list[str]
    riscos: list[str]
    instrucoes: list[str]
    fonte: str = "INMET"
    coletado_em: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


def _combinar_data_hora(data_iso: str, hora: str) -> datetime:
    """Combina os campos separados de data (ISO) e hora ("HH:MM") do INMET."""
    data = data_iso[:10]
    return datetime.fromisoformat(f"{data}T{hora}:00+00:00")


def _dividir_csv(valor: str) -> list[str]:
    if not valor:
        return []
    return [item.strip() for item in valor.split(",") if item.strip()]


def normalizar_avisos(dados_brutos: dict) -> list[AvisoClimatico]:
    """Converte o JSON bruto de ``/avisos/ativos`` em uma lista de ``AvisoClimatico``."""
    avisos_brutos = dados_brutos.get("hoje", [])

    return [
        AvisoClimatico(
            id=aviso["id"],
            tipo=aviso["descricao"],
            severidade=aviso["severidade"],
            cor=aviso["aviso_cor"],
            inicio=_combinar_data_hora(aviso["data_inicio"], aviso["hora_inicio"]),
            fim=_combinar_data_hora(aviso["data_fim"], aviso["hora_fim"]),
            estados=_dividir_csv(aviso.get("estados", "")),
            geocodes_municipios=_dividir_csv(aviso.get("geocodes", "")),
            riscos=list(aviso.get("riscos") or []),
            instrucoes=list(aviso.get("instrucoes") or []),
        )
        for aviso in avisos_brutos
    ]
