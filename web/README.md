# Project: FinanceApp - Debt Management System

## 1. Architecture Overview
Sistema full-stack para gestão, simulação e priorização de dívidas pessoais. 
O sistema é dividido em uma API RESTful robusta e um cliente SPA (Single Page Application).

## 2. Technology Stack
**Backend:**
- Framework: NestJS (Node.js)
- Database: MongoDB via Prisma ORM
- Auth: JWT (JSON Web Tokens)
- Testing: Jest (Unitário, Integração e E2E)

**Frontend:**
- Framework: React 18 + Vite
- Styling: TailwindCSS + PostCSS
- State Management: Zustand (via hooks customizados)
- HTTP Client: Axios / Fetch API (`api.ts`)

## 3. Directory Structure
```text
/backend
  /src
    /auth       # Autenticação e Guards
    /debts      # Regras de negócio core (Cálculos, Assistente, CRUD)
    /database   # Prisma Module e Schema
/frontend
  /src
    /components # Modais e Formulários (UI)
    /pages      # Views principais (Login, Dashboard)
    /hooks      # Lógica de estado e requisições (useAuth, useDebts)