import { Injectable, NotFoundException } from '@nestjs/common';
import { Debt } from '@prisma/client'; 
import { PrismaService } from '../../../prisma/prisma.service'; 
import { DebtStatus } from '../dto/create-debt.dto';
import { PrioritizedDebt } from '../interfaces/prioritized-debt.interface';

@Injectable()
export class DebtAssistantService {
  constructor(private prisma: PrismaService) {}

  async analyzeDebts(userId: string, availableMonthlyAmount: number): Promise<{
    message: string;
    totalDebts: number;
    availableMonthlyAmount: number;
    prioritizedDebts: PrioritizedDebt[];
  }> {
    const debts = await this.prisma.debt.findMany({
      where: {
        userId,
        status: { not: DebtStatus.PAID },
      },
    });

    if (!debts || debts.length === 0) {
      throw new NotFoundException('Nenhuma dívida ativa encontrada para este usuário.');
    }

    const prioritized = this.prioritizeDebts(debts);

    return {
      message: 'Dívidas priorizadas com base em juros, parcelas e vencimento.',
      totalDebts: prioritized.length,
      availableMonthlyAmount,
      prioritizedDebts: prioritized.map(debt => ({
        id: String(debt.id), 
        name: debt.description, 
        interestRate: Number(debt.interestRate || 0), 
        remainingInstallments: debt.remainingInstallments,
        dueDate: debt.dueDate,
        monthlyInstallment: Number(debt.currentAmount || 0) / (debt.remainingInstallments || 1),
      })),
    };
  }

  analyzeDebtFeasibility(
    totalDebt: number,
    monthlyInstallment: number,
    userIncome: number,
  ): string {
    const percentageUsed = (monthlyInstallment / userIncome) * 100;

    if (percentageUsed > 50) {
      return '⚠️ Alta: Mais de 50% da renda será comprometida com essa dívida.';
    } else if (percentageUsed > 30) {
      return '🟡 Moderada: Entre 30% e 50% da sua renda será comprometida.';
    } else {
      return '🟢 Baixa: Essa dívida é viável dentro do seu orçamento.';
    }
  }

  private prioritizeDebts(debts: Debt[]): Debt[] {
    return debts.sort((a, b) => {
      const interestDiff = Number(b.interestRate || 0) - Number(a.interestRate || 0);
      if (interestDiff !== 0) return interestDiff;

      const installmentDiff = a.remainingInstallments - b.remainingInstallments;
      if (installmentDiff !== 0) return installmentDiff;

      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }
}