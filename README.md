# FinTrack | Dashboard Financeiro Premium

O **FinTrack** é um aplicativo web de dashboard financeiro profissional, moderno e responsivo, desenvolvido com uma experiência visual em **Dark Mode** de alta conversão. O sistema é construído exclusivamente com tecnologias web nativas (HTML5, CSS3 e Vanilla JavaScript) e integrado com a biblioteca **Chart.js** via CDN.

## 🚀 Funcionalidades Principais

- **Segregação de Modulos (4 Abas Dinâmicas):**
  - **Dashboard:** Visão geral com cartões de resumo (Receitas, Despesas, Saldo Líquido com status dinâmicos), gráficos analíticos interativos e tabela de transações recentes (últimas 5 entradas).
  - **Nova Transação:** Painel dedicado para inserção de movimentações (Descrição, Tipo, Valor, Categoria e Data) ao lado da tabela de histórico completo com ações de exclusão.
  - **Categorias:** Formulário de cadastro de novas categorias e grid de badges dinâmicos exibindo os nomes e o número de transações vinculadas a cada uma.
  - **Relatórios:** Filtros avançados de busca por descrição, tipo e categoria. Apresenta o detalhamento das transações correspondentes, um compilador de despesas por categoria com barras de progresso percentuais, além de ações de **impressão formatada** e **exportação em lote para CSV**.
- **Persistência de Dados:** Salvamento automático de transações e categorias personalizadas no `localStorage` do navegador.
- **Importação/Exportação JSON:** Utilitários para baixar o backup completo do estado do aplicativo em `.json` e carregá-lo novamente para restaurar dados em qualquer navegador.
- **Gráficos Seguros:** Renderização de gráficos sem conflitos de canvas (as instâncias do Chart.js são destruídas e limpas antes de novas atualizações de filtros).
- **Design Responsivo (Mobile-First):** Layout fluido construído em CSS Grid e Flexbox que se adapta perfeitamente de telas menores (celulares a partir de 320px) até monitores desktop.

---

## 📁 Estrutura do Projeto

O código está estruturado em três arquivos desacoplados e fáceis de manter no diretório principal:

```bash
DashboardFinance/
├── index.html   # Estrutura semântica HTML5 e chamadas CDN
├── style.css    # Variáveis CSS, resets, layouts flex/grid e queries responsivas
├── script.js    # Lógica de estados, persistência, eventos e integrações de gráficos
└── README.md    # Documentação oficial do projeto
```

---

## 🛠️ Como Executar o Projeto

Como o aplicativo é construído com tecnologias puras (Client-Side), **não é necessária nenhuma etapa de build ou instalação complexa**.

### Método 1: Abertura Direta (Rápido)
1. Navegue até a pasta do projeto.
2. Dê um duplo clique no arquivo `index.html` ou clique com o botão direito e escolha **"Abrir com o navegador"**.

### Método 2: Servidor Local Estático (Recomendado para verificar chamadas CDN e otimizações)
Se você preferir executar o projeto em um endereço local de desenvolvimento (ex: `http://localhost`), utilize uma das opções de terminal abaixo na pasta do projeto:

**Usando Node.js (via Terminal / VS Code):**
```bash
npx serve .
```
*O console fornecerá um link como `http://localhost:3000`.*

**Usando Python:**
```bash
# Para Python 3.x
python -m http.server 8000
```
*Abra `http://localhost:8000` em seu navegador de preferência.*

---

## ⚙️ Especificação das Cores & Tokens de Design

O estilo do dashboard foi desenvolvido sob as diretrizes de interfaces premium analíticas:
- **Cor de Fundo Principal:** `#131417` (Main Dark BG)
- **Fundo dos Cards/Menus:** `#1c1d22` (Sleek Dark Gray Card)
- **Inputs & Elementos:** `#25272e` (Contrasted Field BG)
- **Cor de Destaque (Accent):** `#b4ff39` (Verde Neon) para entradas, botões e barras.
- **Cor de Alerta/Perigo:** `#ff5a79` (Coral) para despesas, exclusões e alertas de saldo.
- **Texto Principal:** `#ffffff` (Branco Puro)
- **Texto Secundário:** `#909299` (Cinza Muted)
- **Fonte:** Google Fonts `Inter` (sans-serif) para legibilidade profissional de dados numéricos.

---

## 💾 Modelagem dos Arquivos de Dados

### 1. Estrutura do Backup JSON (Import/Export)
O arquivo de backup de dados gerado pelo botão **"Exportar JSON"** possui o seguinte esquema:

```json
{
  "transactions": [
    {
      "id": "1719827392102",
      "description": "Salário Mensal",
      "type": "receita",
      "value": 7500,
      "category": "Salário",
      "date": "2026-07-05"
    }
  ],
  "categories": [
    "Salário",
    "Investimentos",
    "Alimentação",
    "Moradia",
    "Transporte",
    "Lazer"
  ],
  "version": "1.0",
  "exportedAt": "2026-07-09T22:51:00.000Z"
}
```

### 2. Exportação CSV (Aba de Relatórios)
O arquivo `.csv` baixado ao clicar em **"Exportar CSV"** inclui um cabeçalho e codificação UTF-8 BOM, permitindo abertura direta no Microsoft Excel, Google Sheets ou Apple Numbers sem quebra de acentuação:

```csv
Descrição,Tipo,Categoria,Data,Valor (R$)
"Salário Mensal",Receita,"Salário",05/07/2026,7500.00
"Aluguel Apartamento",Despesa,"Moradia",08/07/2026,2200.00
```

---

## 📱 Responsividade & Impressão

- **Celulares (< 480px):** Os formulários inline se colapsam em bloco de 100% de largura, os cards de resumo se empilham verticalmente e o menu lateral é reposicionado como um seletor fluido no topo.
- **Tabelas Grandes:** As tabelas ganham rolagem horizontal fluida (`overflow-x: auto`) para evitar compressão de layout.
- **Regras de Impressão:** Ao pressionar `Ctrl + P` (ou clicar em **Imprimir** na aba de relatórios), uma folha de estilos limpa é aplicada para esconder barras laterais, filtros e botões, exibindo somente a tabela e os relatórios em fundo branco para economia de tinta e melhor leitura.

