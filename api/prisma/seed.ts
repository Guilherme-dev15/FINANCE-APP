/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// prisma/seed.ts
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  DebtType,
  DebtStatus,
  TransactionType,
  ExpenseCategory,
} from '@prisma/client';

// 🚀 O Truque Sênior: Criamos um módulo isolado que carrega APENAS o banco de dados
@Module({
  providers: [PrismaService],
})
class SeedModule {}

async function main() {
  console.log('🚀 Inicializando Motor Nexus (Contexto Isolado)...');

  // Carrega apenas o SeedModule (Ignora JWT, Auth, Controllers, etc)
  const app = await NestFactory.createApplicationContext(SeedModule);
  const prisma = app.get(PrismaService);

  try {
    // 1. Cria usuário base
    const user = await prisma.user.upsert({
      where: { email: 'admin@nexus.finance' },
      update: {},
      create: {
        email: 'admin@nexus.finance',

        password:
          '$2a$15$LsUux2EplAPTcPlzCeezo.he2BhJdCPGX26KyiWSw7ILPloe1iZym',
      },
    });

    // Limpa dados antigos para não duplicar
    await prisma.income.deleteMany({ where: { userId: user.id } });
    await prisma.expense.deleteMany({ where: { userId: user.id } });
    await prisma.debt.deleteMany({ where: { userId: user.id } });

    // 2. Injeta Renda (Income)
    await prisma.income.create({
      data: {
        userId: user.id,
        description: 'Salário Base (CLT)',
        amount: 3800.0,
        type: TransactionType.FIXED,
        date: new Date(),
      },
    });

    // 3. Injeta Custos de Sobrevivência (Expense)
    await prisma.expense.createMany({
      data: [
        {
          userId: user.id,
          description: 'Aluguel + Condomínio',
          amount: 1500.0,
          type: TransactionType.FIXED,
          category: ExpenseCategory.ESSENTIAL,
          date: new Date(),
        },
        {
          userId: user.id,
          description: 'Supermercado',
          amount: 900.0,
          type: TransactionType.VARIABLE,
          category: ExpenseCategory.ESSENTIAL,
          date: new Date(),
        },
        {
          userId: user.id,
          description: 'Ifood (FDS)',
          amount: 250.0,
          type: TransactionType.VARIABLE,
          category: ExpenseCategory.LIFESTYLE,
          date: new Date(),
        },
      ],
    });

    // 4. A Dívida Real (O Consignado da Paketa)
    await prisma.debt.create({
      data: {
        userId: user.id,
        description: 'Consignado Privado',
        originalCreditor: 'Paketa / QI SCD',
        debtType: DebtType.FORMAL,
        status: DebtStatus.ACTIVE,
        originalAmount: 2027.55,
        currentAmount: 2027.55,
        iofAmount: 69.78,
        interestRate: 4.49,
        cetRate: 4.72, // Foco absoluto aqui
        remainingInstallments: 36,
        customInstallment: 126.28,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });

    console.log('✅ Base Financeira semeada com sucesso! FCF e CET mapeados.');
  } catch (error) {
    console.error('❌ Falha ao semear o banco:', error);
  } finally {
    await app.close();
  }
}

void main();
