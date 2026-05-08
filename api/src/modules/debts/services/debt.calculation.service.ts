 
/* eslint-disable @typescript-eslint/restrict-template-expressions */
 
 
import { DebtType, CreateDebtDto } from '../dto/create-debt.dto';

export class DebtCalculationService {
  static calculateByDebtType(debtType: DebtType, debtData: Partial<CreateDebtDto>): number {
    switch (debtType) {
      case DebtType.LOAN:
        return this.calculateLoan(debtData);
      case DebtType.CREDIT_CARD:
        return this.calculateCreditCard(debtData);
      case DebtType.PERSONAL:
        return this.calculatePersonal(debtData);
      default:
        throw new Error(`Tipo de dívida inválido para cálculo: ${debtType}`);
    }
  }

  private static calculateLoan(data: Partial<CreateDebtDto>): number {
    const { currentAmount, interestRate, remainingInstallments } = data;
    const monthlyRate = (interestRate ?? 0) / 100;
    return (currentAmount ?? 0) * Math.pow(1 + monthlyRate, remainingInstallments ?? 1);
  }

  private static calculateCreditCard(data: Partial<CreateDebtDto>): number {
    const { currentAmount, interestRate } = data;
    const monthlyRate = (interestRate ?? 0) / 100;
    return (currentAmount ?? 0) * (1 + monthlyRate) * 1.05;
  }

  private static calculatePersonal(data: Partial<CreateDebtDto>): number {
    return (data.currentAmount ?? 0) + 20;
  }
}