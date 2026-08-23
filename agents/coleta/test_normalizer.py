"""Testes do normalizador — usam uma amostra fixa, sem chamar a API real."""

from __future__ import annotations

import unittest
from datetime import datetime, timezone

from agents.coleta.normalizer import normalizar_avisos

AMOSTRA_BRUTA = {
    "hoje": [
        {
            "id": 55456,
            "descricao": "Chuvas Intensas",
            "severidade": "Perigo Potencial",
            "aviso_cor": "#FFFF00",
            "data_inicio": "2026-08-22T00:00:00.000Z",
            "hora_inicio": "08:17",
            "data_fim": "2026-08-22T00:00:00.000Z",
            "hora_fim": "23:59",
            "estados": "RR,AM",
            "geocodes": "1400100,1400308",
            "riscos": ["Alagamentos", "Deslizamentos"],
            "instrucoes": ["Evite áreas de risco"],
        }
    ]
}


class NormalizarAvisosTests(unittest.TestCase):
    def test_mapeia_campos_basicos(self) -> None:
        avisos = normalizar_avisos(AMOSTRA_BRUTA)

        self.assertEqual(len(avisos), 1)
        aviso = avisos[0]
        self.assertEqual(aviso.id, 55456)
        self.assertEqual(aviso.tipo, "Chuvas Intensas")
        self.assertEqual(aviso.severidade, "Perigo Potencial")
        self.assertEqual(aviso.fonte, "INMET")

    def test_combina_data_e_hora_em_datetime(self) -> None:
        aviso = normalizar_avisos(AMOSTRA_BRUTA)[0]

        self.assertEqual(
            aviso.inicio, datetime(2026, 8, 22, 8, 17, tzinfo=timezone.utc)
        )
        self.assertEqual(
            aviso.fim, datetime(2026, 8, 22, 23, 59, tzinfo=timezone.utc)
        )

    def test_divide_geocodes_em_lista(self) -> None:
        aviso = normalizar_avisos(AMOSTRA_BRUTA)[0]

        self.assertEqual(aviso.geocodes_municipios, ["1400100", "1400308"])

    def test_divide_estados_em_lista(self) -> None:
        aviso = normalizar_avisos(AMOSTRA_BRUTA)[0]

        self.assertEqual(aviso.estados, ["RR", "AM"])

    def test_dados_sem_avisos_retorna_lista_vazia(self) -> None:
        self.assertEqual(normalizar_avisos({"hoje": []}), [])


if __name__ == "__main__":
    unittest.main()
