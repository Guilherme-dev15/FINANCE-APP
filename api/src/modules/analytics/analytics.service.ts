import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getFinancialViability(userId: string) {
    // 1. Processamento de Rendas
    const incomes = await this.prisma.income.findMany({ where: { userId } });
    const totalIncome = incomes.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    );

    // 2. Processamento de Despesas (Separando o joio do trigo)
    const expenses = await this.prisma.expense.findMany({ where: { userId } });

    const essentialExpenses = expenses
      .filter((e) => e.category === 'ESSENTIAL')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const lifestyleExpenses = expenses
      .filter((e) => e.category === 'LIFESTYLE')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const wasteExpenses = expenses
      .filter((e) => e.category === 'WASTE')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    // 3. Impacto das Dívidas ATIVAS no fluxo mensal
    const activeDebts = await this.prisma.debt.findMany({
      where: { userId, status: 'ACTIVE' },
    });

    const totalDebtInstallments = activeDebts.reduce((acc, curr) => {
      // Se houver um acordo repactuado, ele tem prioridade máxima
      if (curr.customInstallment && Number(curr.customInstallment) > 0) {
        return acc + Number(curr.customInstallment);
      }

      // Fallback: Aproximação matemática da parcela pela Tabela Price
      const remaining = Number(curr.currentAmount);
      const months = curr.remainingInstallments || 1;
      const rate = Number(curr.interestRate) / 100;

      if (rate > 0) {
        const pmt = remaining * (rate / (1 - Math.pow(1 + rate, -months)));
        return acc + pmt;
      }

      return acc + remaining / months;
    }, 0);

    // 4. O Veredito Financeiro (Algoritmo de Viabilidade)
    const committedIncome = essentialExpenses + totalDebtInstallments;
    const freeCashFlow = totalIncome - committedIncome;
    const realCashFlow =
      totalIncome -
      (essentialExpenses +
        lifestyleExpenses +
        wasteExpenses +
        totalDebtInstallments);

    const isViable = freeCashFlow > 0;

    return {
      metrics: {
        totalIncome: Number(totalIncome.toFixed(2)),
        essentialExpenses: Number(essentialExpenses.toFixed(2)),
        lifestyleExpenses: Number(lifestyleExpenses.toFixed(2)),
        wasteExpenses: Number(wasteExpenses.toFixed(2)),
        totalDebtInstallments: Number(totalDebtInstallments.toFixed(2)),
      },
      analysis: {
        freeCashFlow: Number(freeCashFlow.toFixed(2)), // Dinheiro livre para pagar dívidas Na Gaveta ou investir
        realCashFlow: Number(realCashFlow.toFixed(2)), // O que sobra de verdade no fim do mês
        isViable,
        alertLevel: isViable ? 'SAFE' : 'CRITICAL',
        targetExtraIncome: isViable
          ? 0
          : Number(Math.abs(freeCashFlow).toFixed(2)), // Meta de "bicos" para não falir
      },
    };
  }
}
