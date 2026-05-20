/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async createExpense(userId: string, data: CreateExpenseDto) {
    try {
      return await this.prisma.expense.create({
        data: {
          userId,
          description: data.description,
          amount: Number(data.amount),
          type: data.type,
          category: data.category,
          date: new Date(data.date),
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao registrar despesa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByUser(userId: string) {
    return await this.prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async deleteExpense(userId: string, expenseId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id: expenseId, userId },
    });

    if (!expense) {
      throw new HttpException(
        'Despesa não encontrada ou acesso negado',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.expense.delete({ where: { id: expenseId } });
    return { message: 'Despesa deletada com sucesso' };
  }
}
