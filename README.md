# VigiaApp — Ferramenta Inteligente para Comunicação Proativa com o Segurado

> **InsurMinds — Desafio 5**
> Solução baseada em Inteligência Artificial para prevenção de sinistros e comunicação antecipada com segurados a partir do monitoramento de eventos climáticos extremos.

---

## 👥 Integrantes do Grupo (VIL — Visionary Insurance Lab)

- **Yure Santana** (*Representante*) — yure.s.santana@outlook.com
- **Giovana Arenzano da Palma Martins** — giovana.arenzano@gmail.com
- **Julianna Rosa Del Cielo** — juliannajurdc@gmail.com
- **Karen Mendes Neves de Oliveira** — karenmendes@wiz.co

---

## 📌 Descrição do Projeto

Tradicionalmente, a interação entre seguradoras e clientes ocorre de forma reativa, após a ocorrência de sinistros. O **VigiaApp** transforma essa dinâmica em uma abordagem proativa e preventiva:

1. **Coleta Contínua:** Monitora em tempo real alertas meteorológicos oficiais emitidos pela API pública do **INMET** (Instituto Nacional de Meteorologia).
2. **Filtragem & Regras de Negócio:** Cruza a severidade e o polígono dos avisos meteorológicos (códigos IBGE) com a base cadastral de apólices ativas e coberturas contratadas (ex.: seguro residencial, automóvel, empresarial).
3. **Geração com IA Generativa:** Utiliza Large Language Models (**Google Gemini 3.5 Flash** e fallback opcional via **Groq**) para redigir alertas humanizados, objetivos e com orientações preventivas personalizadas de acordo com o canal (SMS, WhatsApp ou E-mail) e o perfil do segurado.
4. **Simulação e Auditoria de Envio:** Fornece um painel operacional com rastreamento completo de eventos, auditoria de decisões de elegibilidade, histórico de envios simulados e métricas de impacto.

---

## 🏗️ Arquitetura da Solução

O repositório é organizado em um monorepo modular:

```text
vigiaApp/
├── agent/            # Pipeline de coleta e normalização meteorológica (Python)
│   ├── coleta/       # Cliente INMET, normalizador de avisos e testes unitários
│   └── requirements.txt
├── backend/          # API REST, motor de regras, IA e persistência (Node.js/TypeScript/Express)
│   ├── src/          # Rotas, controllers, engine de decisão, integração Gemini/Groq e SQLite
│   ├── data/         # Banco SQLite local persistido
│   └── scripts/      # Utilitários de importação de carteiras
├── front-end/        # Interface do operador de sinistros / mesa de operações (React 19, Vite, TypeScript)
│   ├── src/          # Telas de Dashboard, Eventos, Comunicações, Histórico e Configurações
│   └── public/data/  # Armazenamento de dados estáticos e avisos atualizados
├── docs/             # Documentação técnica, especificações e relatórios de arquitetura
└── .github/workflows # Automação de coleta agendada (GitHub Actions a cada 30 min)
```

---

## 🛠️ Tecnologias Utilizadas

- **Inteligência Artificial & LLMs:**
  - Google Gemini API (`gemini-3.5-flash` via `@google/genai`)
  - Groq Cloud API (fallback de alta performance com modelos abertos)
- **Backend & Regras:**
  - Node.js (>= 24) com TypeScript e Express
  - SQLite para persistência e auditoria de decisões
  - Vitest para testes de regras de negócio
- **Frontend & Visualização:**
  - React 19, TypeScript e Vite
  - Lucide React (ícones) e Recharts (gráficos analíticos)
- **Coleta Meteorológica:**
  - Python 3.10+ (Requests, Unittest)
  - API Pública do INMET (`apiprevmet3.inmet.gov.br`)

---

## 🚀 Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- **Node.js** (versão 20 ou superior, preferencialmente Node 24)
- **npm** (incluso com o Node)
- **Python** (versão 3.10 ou superior, para execução do agente de coleta)
- **Chave de API do Google Gemini** ([Google AI Studio](https://aistudio.google.com/))

---

## ⚙️ Configuração das Variáveis de Ambiente

### 1. Backend

Navegue até a pasta `backend/` e crie o arquivo `.env` a partir do exemplo:

```bash
cd backend
cp .env.example .env   # ou copy .env.example .env no Windows
```

Edite o arquivo `backend/.env` e configure sua chave de API:

```env
PORT=3001
GEMINI_API_KEY=coloque_sua_chave_do_google_ai_studio_aqui
GEMINI_MODEL=gemini-3.5-flash
AI_PROVIDER=gemini

# Opcional (fallback com Groq)
# GROQ_API_KEY=sua_chave_groq
# GROQ_MODEL=openai/gpt-oss-120b
# GROQ_API_BASE_URL=https://api.groq.com/openai/v1
```

### 2. Frontend

Navegue até a pasta `front-end/` e crie o arquivo `.env`:

```bash
cd ../front-end
cp .env.example .env   # ou copy .env.example .env no Windows
```

Conteúdo padrão do `front-end/.env`:

```env
VITE_BACKEND_URL=http://localhost:3001
```

---

## 📦 Instruções de Instalação

A partir da raiz do projeto:

```bash
# 1. Instalar dependências do Backend
cd backend
npm install

# 2. Instalar dependências do Frontend
cd ../front-end
npm install

# 3. (Opcional) Instalar dependências do Agente de Coleta Python
cd ../agent
pip install -r requirements.txt
cd ..
```

---

## ▶️ Instruções de Execução

Recomenda-se rodar o **Backend** e o **Frontend** em terminais separados:

### Terminal 1 — Backend (API & Motor de Regras)

```bash
cd backend
npm run dev
```
> O backend inicializará em `http://localhost:3001`. Na primeira inicialização, ele carrega automaticamente a carteira com os 5 segurados didáticos e sincroniza os avisos ativos do INMET.

### Terminal 2 — Frontend (Interface do Usuário)

```bash
cd front-end
npm run dev
```
> A aplicação web abrirá em `http://localhost:5173`.

### (Opcional) Terminal 3 — Execução manual do Agente de Coleta (Python)

Para atualizar manualmente os avisos meteorológicos do INMET para o arquivo consumido pelo frontend:

```bash
python -m agent.coleta.run --out front-end/public/data/avisos-inmet.json
```

---

## 🧪 Testes Automatizados

Para executar os testes automatizados da solução:

```bash
# Testes do Backend (regras de elegibilidade, rotas e gerador)
cd backend
npm test

# Testes do Frontend (renderização e fluxos)
cd ../front-end
npm test

# Testes do Agente Normalizador (Python)
cd ..
python -m unittest agent.coleta.test_normalizer -v
```

---

## 🌐 Deploy em Produção

O projeto conta com instâncias ativas na Vercel:
- **Aplicação Frontend:** [https://vigia-front-self.vercel.app](https://vigia-front-self.vercel.app)
- **API Backend:** [https://vigia-backend-navy.vercel.app](https://vigia-backend-navy.vercel.app)

---

## 📄 Licença

Este projeto está licenciado sob a licença **MIT** — consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
