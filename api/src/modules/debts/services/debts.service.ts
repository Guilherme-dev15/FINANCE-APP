/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, HttpException, HttpStatus, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Debt } from '../schemas/debts.model';
import { CreateDebtDto, DebtStatus, DebtType } from '../dto/create-debt.dto';
import { DebtCalculationService } from './debt.calculation.service';

// Exportando a interface
export interface EvolutionData {
  month: number;
  amount: number;
}

@Injectable()
export class DebtsService {
  private readonly logger = new Logger(DebtsService.name);
  
  constructor(@InjectModel(Debt.name) private debtModel: Model<Debt>) {}

  async createDebt(userId: string, debtData: CreateDebtDto): Promise<Debt> {
    try {
      const debtType = debtData.debtType || DebtType.LOAN; // valor padrão

      this.validateDebtData(debtData, debtType);

      const totalAmount = DebtCalculationService.calculateByDebtType(debtType, debtData);
      console.log('Valor total calculado:', totalAmount); // Log do total calculado

      const newDebt = new this.debtModel({ userId, ...debtData, totalAmount });
      return await newDebt.save();

    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error('Error saving debt', errorStack);
      throw new HttpException('Error creating debt', HttpStatus.BAD_REQUEST);
    }
  }

  // 🔥 ADAPTER APLICADO: Motor Nexus (Priorização)
  async findAllPrioritized() {
    const debts = await this.debtModel.find().exec();

    return debts
      .map(debt => {
        const d = debt.toObject();

        // 1. Defesa contra NaN e Nulos
        const originalAmount = Number(d.originalAmount || 0);
        const currentBalance = Number(d.currentAmount || originalAmount);

        // 2. Normalização de Juros (Defesa contra 1000%)
        // Se no banco está salvo '10', converte para '0.10'. Se já é '0.10', mantém.
        const rawInterest = Number(d.interestRate || 0);
        const interestRate = rawInterest > 1 ? rawInterest / 100 : rawInterest;

        // 3. Cálculo do Score de Risco (Nexus Engine)
        const interestScore = interestRate * 100;
        const balanceScore = currentBalance / 1000;
        const totalScore = (interestScore + balanceScore).toFixed(1);

        return {
          ...d,
          id: d._id, // Adaptação do Mongo para o React
          currentBalance, // Envia com a chave exata que o Front-end espera
          originalAmount,
          interestRate, // Envia o decimal correto para o Front-end
          priorityScore: totalScore,
          recommendation: Number(totalScore) > 15
            ? 'LIQUIDAÇÃO URGENTE: Juros Críticos'
            : 'Pagamento Programado',
        };
      })
      // Ordena do maior score para o menor
      .sort((a, b) => Number(b.priorityScore) - Number(a.priorityScore));
  }

  private validateDebtData(debtData: CreateDebtDto, debtType: DebtType): void {
    if (debtData.originalAmount <= 0) {
      throw new HttpException('Original amount must be positive', HttpStatus.BAD_REQUEST);
    }

    if (!Object.values(DebtType).includes(debtType)) {
      throw new HttpException(`Tipo de dívida inválido: ${debtType}`, HttpStatus.BAD_REQUEST);
    }
  }

  // 🔥 ADAPTER APLICADO: Listagem Simples
  async listDebts(userId: string, status?: string) {
    const filter: any = { userId };
    if (status) {
      filter['status'] = status;
    }
    const debts = await this.debtModel.find(filter).exec();

    return debts.map(debt => {
      const d = debt.toObject();
      const rawInterest = Number(d.interestRate || 0);

      return {
        ...d,
        id: d._id, // Adaptação do Mongo para o React
        currentBalance: Number(d.currentAmount || d.originalAmount || 0), // Previne NaN
        originalAmount: Number(d.originalAmount || 0),
        interestRate: rawInterest > 1 ? rawInterest / 100 : rawInterest, // Previne 1000%
      };
    });
  }

  async getDebtById(userId: string, debtId: string): Promise<Debt> {
    const debt = await this.debtModel.findOne({ _id: debtId, userId }).exec();
    if (!debt) {
      throw new HttpException('Debt not found', 404);
    }
    return debt;
  }

  async editDebt(userId: string, debtId: string, debtData: CreateDebtDto) {
    const debtType = debtData.debtType || DebtType.LOAN;
    this.validateDebtData(debtData, debtType);
    
    const updatedDebt = await this.debtModel.findOneAndUpdate(
      { userId, _id: debtId },
      { ...debtData },
      { new: true }
    );
    
    if (!updatedDebt) {
      throw new NotFoundException('Dívida não encontrada');
    }
    return updatedDebt;
  }

  async deleteDebt(userId: string, debtId: string) {
    const debt = await this.debtModel.findOneAndDelete({ userId, _id: debtId });
    if (!debt) {
      throw new NotFoundException('Dívida não encontrada');
    }
    return { message: 'Dívida deletada com sucesso' };
  }

  async payDebt(userId: string, debtId: string, paymentAmount: number) {
    const debt = await this.debtModel.findOne({ userId, _id: debtId });

    if (!debt) {
      throw new NotFoundException('Dívida não encontrada');
    }

    if (paymentAmount <= 0) {
      throw new HttpException('O valor do pagamento deve ser maior que zero', HttpStatus.BAD_REQUEST);
    }

    debt.currentAmount -= paymentAmount;

    if (debt.currentAmount <= 0) {
      debt.currentAmount = 0;
      debt.status = DebtStatus.PAID; 
    }

    await debt.save();
    return debt;
  }

  calculateTotalDebt(originalAmount: number, interestRate: number, periods: number, type: 'simple' | 'compound'): number {
    if (interestRate === undefined || isNaN(interestRate)) {
      throw new HttpException('A taxa de juros é obrigatória e deve ser um número', HttpStatus.BAD_REQUEST);
    }

    let totalDebt: number;

    if (type === 'simple') {
      totalDebt = originalAmount * (1 + (interestRate / 100) * periods);
    } else if (type === 'compound') {
      totalDebt = originalAmount * Math.pow(1 + (interestRate / 100), periods);
    } else {
      throw new HttpException('Tipo de cálculo de juros inválido', HttpStatus.BAD_REQUEST);
    }

    if (isNaN(totalDebt)) {
      throw new HttpException('Erro no cálculo da dívida', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return totalDebt;
  }

  async updateDebtInterest(userId: string, debtId: string, debtData: CreateDebtDto) {
    const debt = await this.debtModel.findOne({ userId, _id: debtId });

    if (!debt) {
      throw new NotFoundException('Dívida não encontrada');
    }

    const debtType: DebtType = debtData.debtType || DebtType.LOAN;
    const periods = debt.remainingInstallments;
    let interestRate: number = debtData.interestRate || 0;

    if (isNaN(interestRate)) {
      throw new HttpException('A taxa de juros deve ser um número válido', HttpStatus.BAD_REQUEST);
    }

    let totalDebt: number;

    if (debtType === DebtType.LOAN) {
      totalDebt = this.calculateTotalDebt(debt.originalAmount, interestRate, periods, 'compound');
    } else if (debtType === DebtType.CREDIT_CARD) {
      totalDebt = this.calculateTotalDebt(debt.originalAmount, interestRate, periods, 'simple');
    } else {
      throw new HttpException('Tipo de dívida inválido', HttpStatus.BAD_REQUEST);
    }

    debt.currentAmount = totalDebt;
    debt.status = debtData.status || debt.status;

    await debt.save();
    return debt;
  }

  async simulatePayment(userId: string, debtId: string, paymentAmount: number) {
    const debt = await this.debtModel.findOne({ userId, _id: debtId });

    if (!debt) {
      throw new NotFoundException('Dívida não encontrada');
    }

    if (paymentAmount <= 0) {
      throw new HttpException('O valor do pagamento deve ser maior que zero', HttpStatus.BAD_REQUEST);
    }

    let remainingAmount = debt.currentAmount;
    let monthsToPay = 0;
    const monthlyInterest = (debt.interestRate || 0) / 100 / 12;

    while (remainingAmount > 0) {
      remainingAmount += remainingAmount * monthlyInterest - paymentAmount;
      monthsToPay++;

      if (remainingAmount < 0) {
        remainingAmount = 0;
      }
    }

    return { monthsToPay, remainingAmount };
  }

  async getDebtEvolution(userId: string, debtId: string) {
    const debt = await this.debtModel.findOne({ userId, _id: debtId });

    if (!debt) {
      throw new NotFoundException('Dívida não encontrada');
    }

    let remainingAmount = debt.currentAmount;
    const evolutionData: EvolutionData[] = [];
    const months = debt.remainingInstallments;
    const monthlyInterest = (debt.interestRate || 0) / 100 / 12;

    for (let i = 0; i < months; i++) {
      remainingAmount += remainingAmount * monthlyInterest;
      evolutionData.push({ month: i + 1, amount: remainingAmount });
    }

    return evolutionData;
  }

  async sendDebtNotification(debt: Debt) {
    const currentDate = new Date();
    const dueDate = new Date(debt.dueDate);

    if (currentDate > dueDate && debt.status !== DebtStatus.PAID) {
      console.log(`ALERTA: A dívida com ID ${debt._id} está vencida!`);
    }
  }

  async generateDebtReport(userId: string, startDate: Date, endDate: Date) {
    const debts = await this.debtModel.find({
      userId,
      dueDate: { $gte: startDate, $lte: endDate },
    }).exec();

    const totalDebt = debts.reduce((sum, debt) => sum + debt.originalAmount, 0);
    const totalPaid = debts.reduce((sum, debt) => sum + (debt.originalAmount - debt.currentAmount), 0);

    return {
      totalDebt,
      totalPaid,
      debts: debts.map(debt => ({
        id: debt._id,
        description: debt.description,
        originalAmount: debt.originalAmount,
        currentAmount: debt.currentAmount,
        dueDate: debt.dueDate,
        status: debt.status,
      })),
    };
  }

  async simulatePaymentProjection(userId: string, debtId: string, newPaymentAmount: number, newInterestRate: number) {
    const debt = await this.debtModel.findOne({ userId, _id: debtId });

    if (!debt) {
      throw new NotFoundException('Dívida não encontrada');
    }

    let remainingAmount = debt.currentAmount;
    let monthsToPay = 0;
    const monthlyInterest = newInterestRate / 100 / 12;

    while (remainingAmount > 0) {
      remainingAmount += remainingAmount * monthlyInterest - newPaymentAmount;
      monthsToPay++;

      if (remainingAmount < 0) {
        remainingAmount = 0;
      }
    }

    return { monthsToPay, remainingAmount };
  }
}