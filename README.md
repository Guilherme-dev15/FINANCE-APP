Seu conteúdo está **quase perfeito**, mas há alguns pontos de **formatação Markdown quebrados** (principalmente blocos de código). Ajustei para um **README.md profissional**, totalmente válido no GitHub.

Principais correções:

* Fechei corretamente os blocos `bash`
* Corrigi seções que estavam como texto simples
* Padronizei títulos
* Separei melhor os comandos
* Mantive seu conteúdo técnico intacto

---

# 📊 FinanceApp - Core API & Debt Intelligence

> Backend robusto desenvolvido em **NestJS** e **MongoDB** para gestão inteligente de passivos financeiros, projeções de juros compostos e priorização de quitação de dívidas.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge\&logo=nestjs\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge\&logo=typescript\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge\&logo=mongodb\&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge\&logo=jest\&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge\&logo=swagger\&logoColor=black)

---

# 🎯 Sobre o Projeto

O **FinanceApp** não é apenas um CRUD.
É um **motor de inteligência financeira**.

Ele permite que os usuários:

* Cadastrem dívidas
* Analisem o impacto dos juros ao longo do tempo
* Recebam recomendações algorítmicas sobre **qual dívida quitar primeiro**

Tudo baseado no **custo efetivo do passivo**.

---

# 🚀 Principais Features Técnicas

### 🧱 Arquitetura Modular (Domain Driven)

Separação clara de responsabilidades:

* **AuthModule** → autenticação e segurança
* **DatabaseModule** → conexão e abstração do banco
* **DebtsModule** → regras de negócio financeiras

---

### 🧮 Motor de Cálculos Financeiros (`DebtCalculationService`)

Implementa **Strategy Pattern** para calcular projeções financeiras de diferentes tipos de dívida:

* Cartão de crédito
* Empréstimos
* Dívidas pessoais

Sem uso de `any`, garantindo **segurança de tipagem matemática**.

---

### 🤖 Assistente de Priorização (`DebtAssistantService`)

Algoritmo que cruza:

* renda disponível
* taxa de juros
* parcelas restantes

Para recomendar **a melhor estratégia de quitação de passivos**.

---

### 🧪 Testes com Banco em Memória

Testes de **integração e E2E** usando:

```
mongodb-memory-server
```

Isso permite validar o comportamento real do **Mongoose** sem afetar o banco de desenvolvimento.

---

### 🔐 Segurança

* Autenticação **JWT**
* Implementação via **PassportStrategy**
* Rotas protegidas
* Swagger protegido por **Bearer Token**

---

# 🛠️ Como Executar Localmente

## 1️⃣ Clone o repositório

```bash
git clone https://github.com/seu-usuario/finance-app.git
cd finance-app
```

---

## 2️⃣ Instale as dependências

```bash
npm install
```

---

## 3️⃣ Configure o ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/finance-app
JWT_SECRET=sua_chave_secreta_super_segura
```

---

## 4️⃣ Inicie o servidor

```bash
npm run start:dev
```

---

# 📚 Documentação da API (Swagger)

Com a aplicação rodando, acesse:

```
http://localhost:3000/api/docs
```

A interface Swagger permite:

* visualizar endpoints
* testar requisições
* validar contratos de dados

---

# 🧪 Testes

A aplicação possui:

* testes unitários
* testes de integração
* testes End-to-End (E2E)

### Executar testes unitários

```bash
npm run test
```

### Executar testes E2E

```bash
npm run test:e2e
```

---
