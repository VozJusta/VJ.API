# 🎯 VozJusta - API (Back-End)

<div align="center">

### **Núcleo de Inteligência e Orquestração Jurídica**

API REST de alta performance desenvolvida para democratizar o acesso à justiça através de IA e arquitetura escalável.

</div>

---

# 📋 Sobre a API

A **API do VozJusta** é o *cérebro da plataforma*. Construída sob o framework **NestJS**, ela gerencia desde a persistência de dados críticos e autenticação segura até a orquestração de fluxos complexos de **RAG (Retrieval-Augmented Generation)** para tradução de linguagem jurídica.

---

# 🏗️ Arquitetura Técnica

O projeto utiliza uma **arquitetura modular**, onde cada domínio (Usuários, Casos, IA, Documentos) é isolado em módulos independentes.

Isso garante:

- **Escalabilidade**: Facilidade para adicionar novas funcionalidades sem acoplamento.
- **Testabilidade**: Estrutura pronta para **TDD (Test-Driven Development)**.
- **Segurança**: Tipagem estática rigorosa para manipulação de dados sensíveis.

---

# 🛠️ Stack Tecnológica

## Core & Persistência

- **NestJS** – Framework Node.js progressivo para aplicações eficientes  
- **PostgreSQL** – Banco de dados relacional robusto e confiável  
- **Prisma ORM** – Query builder tipado com segurança em tempo de compilação  
- **Class Validator / Zod** – Validação rigorosa e coerção de dados (Schema-first)

---

## Inteligência Artificial (Pipeline RAG)

- **LangChain.js** – Orquestração de prompts e contexto de IA  
- **OpenRouter** – Proxy unificado para acesso a LLMs (GPT-4o / LLaMA 3)  
- **Qdrant** – Banco vetorial para busca semântica de jurisprudências  
- **Transformers.js** – Geração de embeddings local para classificação de texto

---

## Infraestrutura & Serviços

- **Microsoft Azure** – Hospedagem via Docker/Container Apps e Key Vault para segredos  
- **Resend** – Serviço de alta entregabilidade para notificações transacionais  
- **Azure Storage** – Armazenamento seguro de documentos e dossiês

---

# 🚀 Como Iniciar

## Pré-requisitos

- Node.js **>= 20.x**
- PostgreSQL **15**
- pnpm **>= 8.x**

---

# 1️⃣ Instalação

```bash
git clone https://github.com/xsalles/vozjusta-backend.git
cd vozjusta-backend
pnpm install
```

---

# 2️⃣ Configuração do Ambiente

Crie um arquivo `.env` seguindo o modelo abaixo:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/vozjusta?schema=public"

# IA & LLM
OPENROUTER_API_KEY="your_key"
QDRANT_URL="your_qdrant_url"

# Email
RESEND_API_KEY="re_your_key"

# Azure
AZURE_STORAGE_CONNECTION_STRING="your_connection"
```

---

# 3️⃣ Banco de Dados

```bash
# Executar migrations
npx prisma migrate dev

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

---

# 4️⃣ Execução

```bash
# Desenvolvimento
pnpm start:dev

# Produção
pnpm build
pnpm start:prod
```

---

# 📁 Estrutura do Projeto

```
src/
├── modules/
│   ├── auth/           # Estratégias JWT e 2FA
│   ├── users/          # Gestão de perfis (Cidadão/Advogado)
│   ├── cases/          # Fluxo de processos e status
│   ├── ai/             # Engine RAG, LangChain e Prompts
│   └── documents/      # Integração com Storage e OCR
│
├── common/
│   ├── decorators/     # Decorators customizados
│   ├── filters/        # Tratamento global de exceções
│   └── guards/         # Proteção de rotas (Roles/Auth)
│
├── infra/
│   ├── database/       # Prisma Service e Repositórios
│   └── mail/           # Integração com Resend
│
└── main.ts             # Entry point da aplicação
```

---

# 🧪 Estratégia de Testes

A API foi desenhada para suportar uma **pirâmide de testes sólida**:

- **Unitários** – Testes de serviços e lógica de negócio isolada  
- **Integração** – Validação do fluxo entre Controllers, Services e Banco de Dados  
- **E2E** – Simulação de fluxos completos de API (via Supertest)

```bash
pnpm test          # Testes unitários
pnpm test:e2e      # Testes end-to-end
```

---

# 🔌 WebSocket da Simulação

O front end inicia o fluxo em duas etapas:

1. Cria a simulação via HTTP em `POST /simulation` e guarda o `simulationId` retornado.
2. Abre a conexão Socket.IO com o namespace `/simulation` e dispara o evento `simulation:start` com esse `simulationId`.

## Conexão

Use o mesmo host da API e conecte no namespace:

```ts
import { io } from 'socket.io-client';

const socket = io('http://link-api/simulation', {
	transports: ['websocket'],
});
```

## Eventos do cliente

- `simulation:start` com payload `{ simulationId: string, citizenId: string }`
- `simulation:stop` com payload `{ simulationId: string }`

## Eventos do servidor

- `simulation:started` com `{ simulationId }`
- `simulation:warning` com `{ message, remainingSecs }`
- `simulation:end` com `{ simulationId, status }`
- `simulation:report` com `{ simulationId, reportId }`

## Exemplo

```ts
socket.on('connect', () => {
	socket.emit('simulation:start', { simulationId });
});

socket.on('simulation:warning', (data) => {
	console.log('Aviso da audiência:', data);
});

socket.on('simulation:report', (data) => {
	console.log('Report pronto:', data);
});
```

---

# 🛡️ Segurança e Compliance

- **Criptografia** – Senhas hasheadas com **Argon2**  
- **Segredos** – Uso de **Azure Key Vault** para evitar exposição de chaves  
- **Observabilidade** – Monitoramento via **Azure Application Insights**  
- **Validação** – Entradas sanitizadas via **Zod** para prevenir *injections*

---

# 📝 Roadmap Back-End

- [x] Arquitetura base **NestJS + Prisma**
- [x] Módulo de **Autenticação JWT**
- [ ] Integração com **OpenRouter e Pipeline RAG**
- [ ] **WebSockets** para notificações em tempo real
- [ ] **Dashboards de Analytics** para advogados (Plano Master)

---

# 🤝 Equipe e Orientação

**Desenvolvedor:** Cauã Alves
**Orientação:** Prof. Lucas Correa  
**Instituição:** SENAI Suíço Brasileiro (TCC 2026)

---

<div align="center">

### 📄 Documentação

Swagger API • Repositório Web

</div>
