"""Executa o agente de Coleta: busca os avisos ativos do INMET, normaliza
e imprime (ou salva) o resultado.

Uso:
    python -m agents.coleta.run
    python -m agents.coleta.run --out agents/coleta/output/avisos.json
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict
from datetime import datetime
from pathlib import Path

from agents.coleta.inmet_client import ColetaError, buscar_avisos_ativos
from agents.coleta.normalizer import normalizar_avisos


def _json_default(valor: object) -> str:
    if isinstance(valor, datetime):
        return valor.isoformat()
    return str(valor)


def coletar() -> list[dict]:
    dados_brutos = buscar_avisos_ativos()
    avisos = normalizar_avisos(dados_brutos)
    return [asdict(aviso) for aviso in avisos]


def main() -> None:
    parser = argparse.ArgumentParser(description="Agente de Coleta — avisos do INMET")
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Caminho do arquivo JSON de saída. Se omitido, imprime no stdout.",
    )
    args = parser.parse_args()

    try:
        avisos = coletar()
    except ColetaError as erro:
        print(f"Erro na coleta: {erro}", file=sys.stderr)
        raise SystemExit(1) from erro

    saida = json.dumps(avisos, default=_json_default, ensure_ascii=False, indent=2)

    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(saida, encoding="utf-8")
        print(f"{len(avisos)} aviso(s) salvo(s) em {args.out}")
    else:
        print(saida)


if __name__ == "__main__":
    main()
