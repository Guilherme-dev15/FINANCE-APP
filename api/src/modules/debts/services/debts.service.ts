/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Debt, Prisma, DebtStatus, DebtType } from '@prisma/client'; // 🛡️ SSOT: Enums vindos DIRETO do Prisma!
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDebtDto } from '../dto/create-debt.dto'; // Apenas o DTO vem daqui agora
import { DebtCalculationService } from './debt.calculation.service';

export interface EvolutionData {
  month: number;
  amount: number;
}

@Injectable()
export class DebtsService {
  private readonly logger = new Logger(DebtsService.name);

  constructor(private prisma: PrismaService) {}

  async createDebt(userId: string, debtData: CreateDebtDto): Promise<Debt> {
    try {
      const debtType = (debtData.debtType || DebtType.LOAN) as DebtType;
      this.validateDebtData(debtData, debtType);

      const totalAmount = DebtCalculationService.calculateByDebtType(
        debtType as any, // Bypass temporário caso o Assistant Service antigo reclame
        debtData,
      );
      console.log('Valor total calculado:', totalAmount);

      return await this.prisma.debt.create({
        data: {
          userId,
          ...debtData,
          debtType,
        } as unknown as Prisma.DebtUncheckedCreateInput,
      });
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error('Error saving debt', errorStack);
      throw new HttpException('Error creating debt', HttpStatus.BAD_REQUEST);
    }
  }

  async findAllPrioritized() {
    const debts = await this.prisma.debt.findMany();

    return debts
      .map((debt) => {
        const originalAmount = Number(debt.originalAmount || 0);
        const currentBalance = Number(debt.currentAmount || originalAmount);

        const rawInterest = Number(debt.interestRate || 0);
        const interestRate = rawInterest > 1 ? rawInterest / 100 : rawInterest;

        const interestScore = interestRate * 100;
        const balanceScore = currentBalance / 1000;
        const totalScore = (interestScore + balanceScore).toFixed(1);

        return {
          ...debt,
          id: debt.id,
          currentBalance,
          originalAmount,
          interestRate,
          priorityScore: totalScore,
          recommendation:
            Number(totalScore) > 15
              ? 'LIQUIDAÇÃO URGENTE: Juros Críticos'
              : 'Pagamento Programado',
        };
      })
      .sort((a, b) => Number(b.priorityScore) - Number(a.priorityScore));
  }

  private validateDebtData(debtData: CreateDebtDto, debtType: DebtType): void {
    if (debtData.originalAmount <= 0) {
      throw new HttpException(
        'Original amount must be positive',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Object.values(DebtType).includes(debtType)) {
      throw new HttpException(
        `Tipo de dívida inválido: ${debtType}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async listDebts(userId: string, status?: DebtStatus) {
    const filter: Prisma.DebtWhereInput = { userId };

    if (status) {
      filter.status = status; // Tipagem correta sem cast desnecessário
    }

    const debts = await this.prisma.debt.findMany({ where: filter });

    return debts.map((debt) => {
      const rawInterest = Number(debt.interestRate || 0);
      return {
        ...debt,
        id: debt.id,
        currentBalance: Number(debt.currentAmount || debt.originalAmount || 0),
        originalAmount: Number(debt.originalAmount || 0),
        interestRate: rawInterest > 1 ? rawInterest / 100 : rawInterest,
      };
    });
  }

  async getDebtById(userId: string, debtId: string): Promise<Debt> {
    const debt = await this.prisma.debt.findFirst({
      where: { id: debtId, userId },
    });
    if (!debt)
      throw new HttpException('Dívida não encontrada', HttpStatus.NOT_FOUND);
    return debt;
  }

  async editDebt(userId: string, debtId: string, debtData: CreateDebtDto) {
    const debtType = debtData.debtType || DebtType.LOAN;
    this.validateDebtData(debtData, debtType as DebtType);

    const existing = await this.getDebtById(userId, debtId);

    return await this.prisma.debt.update({
      where: { id: existing.id },
      data: {
        ...debtData,
        debtType: debtData.debtType as DebtType,
        status: debtData.status as unknown as DebtStatus, // Força a tipagem exata para o update
      },
    });
  }

  async deleteDebt(userId: string, debtId: string) {
    const existing = await this.getDebtById(userId, debtId);
    await this.prisma.debt.delete({ where: { id: existing.id } });
    return { message: 'Dívida deletada com sucesso' };
  }

  async payDebt(userId: string, debtId: string, paymentAmount: number) {
    const debt = await this.getDebtById(userId, debtId);

    if (paymentAmount <= 0) {
      throw new HttpException(
        'O valor do pagamento deve ser maior que zero',
        HttpStatus.BAD_REQUEST,
      );
    }

    let newCurrentAmount = Number(debt.currentAmount) - paymentAmount;
    let newStatus = debt.status;

    if (newCurrentAmount <= 0) {
      newCurrentAmount = 0;
      newStatus = DebtStatus.PAID; // Correção: Sem o prefixo 'Prisma.'
    }

    return await this.prisma.debt.update({
      where: { id: debt.id },
      data: { currentAmount: newCurrentAmount, status: newStatus },
    });
  }

  calculateTotalDebt(
    originalAmount: number,
    interestRate: number,
    periods: number,
    type: 'simple' | 'compound',
  ): number {
    if (interestRate === undefined || isNaN(interestRate)) {
      throw new HttpException(
        'A taxa de juros é obrigatória e deve ser um número',
        HttpStatus.BAD_REQUEST,
      );
    }

    let totalDebt: number;

    if (type === 'simple') {
      totalDebt = originalAmount * (1 + (interestRate / 100) * periods);
    } else if (type === 'compound') {
      totalDebt = originalAmount * Math.pow(1 + interestRate / 100, periods);
    } else {
      throw new HttpException(
        'Tipo de cálculo de juros inválido',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (isNaN(totalDebt)) {
      throw new HttpException(
        'Erro no cálculo da dívida',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return totalDebt;
  }

  async updateDebtInterest(
    userId: string,
    debtId: string,
    debtData: CreateDebtDto,
  ) {
    const debt = await this.getDebtById(userId, debtId);

    const debtType = (debtData.debtType || DebtType.LOAN) as DebtType;
    const periods = debt.remainingInstallments;
    const interestRate: number = debtData.interestRate || 0;

    if (isNaN(interestRate)) {
      throw new HttpException(
        'A taxa de juros deve ser um número válido',
        HttpStatus.BAD_REQUEST,
      );
    }

    let totalDebt: number;

    if (debtType === DebtType.LOAN || debtType === DebtType.FORMAL) {
      totalDebt = this.calculateTotalDebt(
        Number(debt.originalAmount),
        interestRate,
        periods,
        'compound',
      );
    } else if (debtType === DebtType.CREDIT_CARD) {
      totalDebt = this.calculateTotalDebt(
        Number(debt.originalAmount),
        interestRate,
        periods,
        'simple',
      );
    } else {
      throw new HttpException(
        'Tipo de dívida inválido',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.prisma.debt.update({
      where: { id: debt.id },
      data: {
        currentAmount: totalDebt,
        status: (debtData.status as unknown as DebtStatus) || debt.status,
      },
    });
  }

  async simulatePayment(userId: string, debtId: string, paymentAmount: number) {
    const debt = await this.getDebtById(userId, debtId);

    if (paymentAmount <= 0) {
      throw new HttpException(
        'O valor do pagamento deve ser maior que zero',
        HttpStatus.BAD_REQUEST,
      );
    }

    let remainingAmount = Number(debt.currentAmount);
    let monthsToPay = 0;
    const monthlyInterest = (Number(debt.interestRate) || 0) / 100 / 12;

    while (remainingAmount > 0) {
      remainingAmount += remainingAmount * monthlyInterest - paymentAmount;
      monthsToPay++;
      if (remainingAmount < 0) remainingAmount = 0;
    }

    return { monthsToPay, remainingAmount };
  }

  async getDebtEvolution(userId: string, debtId: string) {
    const debt = await this.getDebtById(userId, debtId);

    let remainingAmount = Number(debt.currentAmount);
    const evolutionData: EvolutionData[] = [];

    const months =
      debt.remainingInstallments > 0 ? debt.remainingInstallments : 12;

    const rawInterest = Number(debt.interestRate) || 0;
    const monthlyInterest = rawInterest > 1 ? rawInterest / 100 : rawInterest;

    let monthlyPayment = 0;
    if (monthlyInterest > 0) {
      monthlyPayment =
        remainingAmount *
        (monthlyInterest / (1 - Math.pow(1 + monthlyInterest, -months)));
    } else {
      monthlyPayment = remainingAmount / months;
    }

    evolutionData.push({
      month: 0,
      amount: Number(remainingAmount.toFixed(2)),
    });

    for (let i = 0; i < months; i++) {
      const jurosDoMes = remainingAmount * monthlyInterest;
      remainingAmount = remainingAmount + jurosDoMes - monthlyPayment;
      if (remainingAmount < 0.05) remainingAmount = 0;

      evolutionData.push({
        month: i + 1,
        amount: Number(remainingAmount.toFixed(2)),
      });
    }

    return evolutionData;
  }

  sendDebtNotification(debt: Debt) {
    const currentDate = new Date();
    const dueDate = new Date(debt.dueDate);

    if (currentDate > dueDate && debt.status !== DebtStatus.PAID) {
      console.log(`ALERTA: A dívida com ID ${debt.id} está vencida!`);
    }
  }

  async generateDebtReport(userId: string, startDate: Date, endDate: Date) {
    const debts = await this.prisma.debt.findMany({
      where: {
        userId,
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalDebt = debts.reduce(
      (sum, debt) => sum + Number(debt.originalAmount),
      0,
    );
    const totalPaid = debts.reduce(
      (sum, debt) =>
        sum + (Number(debt.originalAmount) - Number(debt.currentAmount)),
      0,
    );

    return {
      totalDebt,
      totalPaid,
      debts: debts.map((debt) => ({
        id: debt.id,
        description: debt.description,
        originalAmount: debt.originalAmount,
        currentAmount: debt.currentAmount,
        dueDate: debt.dueDate,
        status: debt.status,
      })),
    };
  }

  async simulatePaymentProjection(
    userId: string,
    debtId: string,
    newPaymentAmount: number,
    newInterestRate: number,
  ) {
    const debt = await this.getDebtById(userId, debtId);

    let remainingAmount = Number(debt.currentAmount);
    let monthsToPay = 0;
    const monthlyInterest = newInterestRate / 100 / 12;

    while (remainingAmount > 0) {
      remainingAmount += remainingAmount * monthlyInterest - newPaymentAmount;
      monthsToPay++;
      if (remainingAmount < 0) remainingAmount = 0;
    }

    return { monthsToPay, remainingAmount };
  }
}
