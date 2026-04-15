# QualityControl — Empeno Pro

Sistema de Gestão de Qualidade desenvolvido em Vue 3 para controlo de inspeções de empeno, dimensional, coeficiente de atrito e relatórios de turno em ambiente de fábrica.

---

## Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Perfis de Acesso](#perfis-de-acesso)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Instalação e Configuração](#instalação-e-configuração)
- [PWA](#pwa)
- [Otimizações de Performance](#otimizações-de-performance)

---

## Visão Geral

O QualityControl centraliza o controlo de qualidade de produção cerâmica, substituindo relatórios manuais em papel e WhatsApp por um sistema web instalável (PWA), acessível no chão de fábrica via celular ou desktop.

O sistema cobre quatro tipos de análise:

- **Empeno** — medições laterais (A, B, C, D) e centrais (1, 2) por peça, com tolerância por formato
- **Dimensional** — espessura (por pontos e cavidade), tamanho e esquadro
- **Coeficiente de Atrito** — medidas ilimitadas com média calculada, validadas por classe AD (AD, AD2, AD3, AD4, AD4+)
- **Relatório Final de Turno** — situação de cada lote por linha de produção, exportável para WhatsApp

---

## Tecnologias

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Vue 3 (Composition API) | 3.5 |
| Build | Vite | 8.0 |
| Estilo | Tailwind CSS | 4.2 |
| Estado | Pinia | 3.0 |
| Roteamento | Vue Router | 5.0 |
| Backend / DB | Firebase Firestore | 12.11 |
| Autenticação | Firebase Auth | 12.11 |
| Gráficos | ApexCharts + vue3-apexcharts | 5.10 |
| Ícones | Phosphor Icons | Web CDN |
| Alertas | SweetAlert2 | 11.26 |
| PWA | vite-plugin-pwa + Workbox | 1.2 |

---

## Estrutura do Projeto

```
src/
├── App.vue                        # Root — auth listener + redirect por perfil
├── main.js                        # Bootstrap Vue + Pinia + Router
├── firebase.js                    # Configuração Firebase (Firestore + Auth)
├── index.css                      # Tailwind base
│
├── router/
│   └── index.js                   # Rotas com meta.roles para controlo de acesso
│
├── stores/
│   ├── auth.js                    # Sessão do utilizador (perfil + email)
│   └── referencias.js             # Cache de formatos/produtos/linhas/configAtrito
│
├── components/
│   ├── Sidebar.vue                # Navegação lateral (oculta para inspetor)
│   ├── StatusBadge.vue            # Badge OK/Fora/Aguardando
│   └── PwaInstallPrompt.vue       # Banner de instalação PWA (Android + iOS)
│
└── views/
    ├── Login.vue                  # Autenticação com migração de contas legadas
    ├── InspetorHome.vue           # Hub de navegação exclusivo do inspetor
    ├── Dashboard.vue              # Dashboard com abas: Gráficos | Medições
    ├── NovaInspecao.vue           # Formulário de medição de Empeno
    ├── NovaInspecaoDimensional.vue# Formulário de medição Dimensional
    ├── NovaInspecaoAtrito.vue     # Formulário de Coeficiente de Atrito
    ├── RelatorioFinalTurno.vue    # Criação de relatório de turno
    └── Admin.vue                  # Administração (formatos, produtos, linhas, usuários, atrito)
```

---

## Funcionalidades

### Dashboard (Admin / Analista)

**Aba Gráficos**
- Cards de KPIs em tempo real: Total de Lotes, Lotes Hoje, Pós Folga, Reprovados
- Gráfico donut de Taxa de Aprovação Geral
- Gráfico de barras horizontais de Inspeções por Linha
- Gráficos de linha de Range Lateral e Central (Picos e Vales) com filtro por formato e linhas de limite tracejadas

**Aba Medições** — sub-abas:
- **Empeno** — tabela das últimas 24h com filtros avançados (texto, data, status, linha, pós folga, formato), gaveta lateral de filtros, badges de pós folga e tratativa
- **Dimensional** — tabela dos últimos 7 dias com modal de detalhe (espessura por ponto, tamanho/esquadro com destaque de tolerância)
- **Atrito** — tabela dos últimos 7 dias com classe AD e média em destaque
- **Rel. Turno** — tabela dos últimos 7 dias com emojis de situação por lote

**Funcionalidades transversais**
- Sino de pendências (admin) com gaveta lateral listando inspeções sem tratativa
- Modal de detalhe de inspeção com edição e exclusão (admin)
- Seção de tratativa diretamente no modal (Normal / Documento / Restrição / Comercial)

### Formulários de Inspeção

**Empeno** (`/nova-inspecao`)
- Seleção de linha, formato, produto (autocomplete), lote, pós folga
- Lançamento de valores por peça com badges de status em tempo real
- Validação contra limites latMin/latMax e centMin/centMax do formato

**Dimensional** (`/dimensional`)
- Espessura por peça: múltiplos pontos, prensa e cavidade
- Tamanho e esquadro por retífica
- Tolerância de espessura calculada automaticamente (±5%)

**Coeficiente de Atrito** (`/atrito`)
- Seleção de classe AD com range configurado no Admin
- Medidas ilimitadas com botões + e −
- Média calculada ao vivo com barra visual de posição no range

**Relatório Final de Turno** (`/relatorio-turno`)
- Responsável e data/hora preenchidos automaticamente
- Seleção de equipe (1 / 2 / 3 / 4 / ADM)
- Múltiplas linhas, cada uma com produto (autocomplete), formato e lotes ilimitados
- Situação por lote: 🟢 Liberado / 🟡 Ponto de Melhora / 🟠 Com Documento / 🔴 Com Restrição
- Exportação como texto formatado para WhatsApp (cópia ou abertura direta)

### Administração (`/admin`) — apenas Admin

- **Formatos e Limites** — CRUD de formatos com limites de empeno, tamanho e esquadro; soft delete com arquivamento
- **Produtos e Linhas** — CRUD com busca obrigatória antes de exibir lista completa
- **Usuários** — CRUD com busca por nome/login/matrícula; ativar/desativar sem apagar; perfis Admin / Inspetor / Analista
- **Coef. Atrito** — Configuração de ranges Mín/Máx para cada classe AD (AD, AD2, AD3, AD4, AD4+)

---

## Perfis de Acesso

| Rota | Admin | Analista | Inspetor |
|---|:-:|:-:|:-:|
| `/dashboard` | ✅ | ✅ (só leitura) | ❌ |
| `/home` (hub) | ❌ | ❌ | ✅ |
| `/nova-inspecao` | ✅ | ❌ | ✅ |
| `/dimensional` | ✅ | ❌ | ✅ |
| `/atrito` | ✅ | ❌ | ✅ |
| `/relatorio-turno` | ✅ | ❌ | ✅ |
| `/admin` | ✅ | ❌ | ❌ |

**Admin** — acesso total: editar, apagar, tratar pendências, gerir utilizadores e configurações.

**Analista** — apenas visualização no Dashboard: não vê botões de editar/apagar, não regista tratativas, não acede ao Admin nem cria análises.

**Inspetor** — interface simplificada sem sidebar; acede ao hub de navegação e a todos os formulários de criação; não vê o Dashboard.

---

## Estrutura do Banco de Dados

### Coleções Firestore

```
inspecoes/           # Medições de empeno (real-time, filtro 30d)
  ├── produto, lote, linha, inspetor, formatoNome, formatoId
  ├── pecas[]        # { laterais: {A,B,C,D}, centrais: {'1','2'} }
  ├── limitesSnapshot: { latMin, latMax, centMin, centMax, ... }
  ├── resultado      # "Aprovado" | "Reprovado"
  ├── posFolga       # "Sim" | "Não"
  ├── tratativa      # "Normal" | "Documento" | "Restrição" | "Comercial"
  └── dataHora       # Timestamp

dimensionais/        # Medições dimensionais (getDocs, filtro 7d)
  ├── pecasEspessura[] # { prensa, cavidade, pontos[] }
  ├── medicoesTE[]     # { retifica, tamanho, esquadro }
  ├── espessuraDeclarada, limitesSnapshot
  └── dataHora

atrito/              # Medições de coeficiente de atrito (getDocs, filtro 7d)
  ├── classeAD, medidas[], media
  ├── limitesSnapshot: { classeAD, min, max }
  └── dataHora

relatorios_turno/    # Relatórios finais de turno (getDocs, filtro 7d)
  ├── responsavel, equipe, data
  ├── linhas[]: { linha, referencia, formato, lotes[]: { lote, situacao, observacao } }
  ├── textoExportado # Texto pré-formatado para WhatsApp
  └── dataHora

formatos/            # Configurações de tolerância por formato
  ├── nome, ativo
  ├── latMin, latMax, centMin, centMax
  └── tamanhoMin, tamanhoMax, esquadroMin, esquadroMax

produtos/            # Catálogo de produtos (nome, ativo)
linhas/              # Linhas de produção (nome, ativo)

usuarios/            # Perfis de utilizadores
  ├── nome, login, matricula
  ├── perfil          # "admin" | "inspetor" | "analista"
  ├── admin           # boolean (legacy)
  └── ativo

configuracoes/       # Configurações globais
  └── tipo: "atrito" → classes: { AD: {min,max}, AD2: {min,max}, ... }
```

---

## Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- Conta Firebase com Firestore e Authentication habilitados

### Passos

```bash
# 1. Clonar e instalar dependências
npm install --legacy-peer-deps

# 2. Configurar Firebase
# Editar src/firebase.js com as credenciais do seu projeto

# 3. Criar o domínio de email no Login.vue
# Alterar a constante DOMINIO_PADRAO em src/views/Login.vue
const DOMINIO_PADRAO = '@seudominio.com.br'

# 4. Desenvolvimento
npm run dev

# 5. Build para produção
npm run build

# 6. Preview do build
npm run preview
```

### Autenticação

O sistema usa Firebase Auth com email/senha. O login aceita:
- Email completo: `nome.sobrenome@dominio.com.br`
- Ou apenas o username: `nome.sobrenome` (o domínio é adicionado automaticamente)
- A senha é a matrícula do utilizador (padding automático se < 6 caracteres)

O perfil (`admin` / `inspetor` / `analista`) é carregado da coleção `usuarios` pelo campo `login`.

---

## PWA

A aplicação é instalável como Progressive Web App em Android, iOS e Desktop.

**Capacidades offline:** todos os assets estáticos (JS, CSS, ícones) são cacheados pelo Service Worker. A navegação básica funciona sem internet; as leituras do Firestore usam estratégia `NetworkFirst` com fallback para cache de 24h.

**Instalação Android/Desktop:** um banner aparece automaticamente 3 segundos após a primeira visita.

**Instalação iOS:** instruções passo a passo são exibidas (Compartilhar → Adicionar à Tela de Início).

**Atualização:** ao deployar uma nova versão, o Service Worker atualiza silenciosamente em background.

---

## Otimizações de Performance

| Otimização | Impacto |
|---|---|
| Store `referencias.js` — `formatos/produtos/linhas` carregados 1x por sessão | Elimina 9+ leituras redundantes ao Firestore |
| Coleções secundárias (`dimensionais`, `atrito`, `relatorios`) via `getDocs` com filtro de 7 dias server-side | Substitui 3 `onSnapshot` permanentes; reduz dados transferidos em ~95% |
| `inspecoes` com filtro server-side de 30 dias | Evita transferir coleções inteiras |
| `onUnmounted` em todos os listeners do Admin | Cancela streams ao sair da tela, sem vazamentos |
| PWA Service Worker com cache `CacheFirst` para assets estáticos | Elimina re-downloads a cada visita |
| Busca obrigatória nas abas Usuários e Produtos do Admin | Evita renderizar listas completas no DOM |