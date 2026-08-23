# Vigia — Front-end

Aplicação Vigia (React 19 + Vite + TypeScript) — dashboard, eventos climáticos, comunicações preventivas e histórico para o time de operações de seguros.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173` (ou a próxima porta livre).

Para o botão "Regenerar" (nas telas de Eventos/Comunicações) funcionar de verdade, o `../backend/` precisa estar rodando também — veja [`backend/README.md`](../backend/README.md). Sem ele, o front-end continua funcionando normalmente (a chamada falha silenciosamente e o texto atual é mantido).

## Comandos

- `npm run dev` — servidor de desenvolvimento com HMR.
- `npm run build` — build de produção em `dist/`.
- `npm run preview` — serve o build de produção localmente.
- `npm test` — roda os testes (Vitest).
- `npm run typecheck` — checagem de tipos sem emitir.
- `npm run lint` — Oxlint.

## Variáveis de ambiente

- `VITE_BACKEND_URL` (opcional) — URL do backend. Padrão: `http://localhost:3001`.

## React + Vite

Este projeto usa o template padrão do Vite com React + TypeScript e Oxlint.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) usa [Oxc](https://oxc.rs)

O React Compiler não está habilitado (impacto em performance de dev/build). Para adicionar, veja [a documentação oficial](https://react.dev/learn/react-compiler/installation).
