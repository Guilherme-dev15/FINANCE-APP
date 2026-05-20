/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}

  async createIncome(userId: string, data: CreateIncomeDto) {
    try {
      return await this.prisma.income.create({
        data: {
          userId,
          description: data.description,
          amount: Number(data.amount),
          type: data.type,
          date: new Date(data.date),
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao registrar renda',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByUser(userId: string) {
    return await this.prisma.income.findMany({
      where: { userId },
      orderBy: { date: 'desc' }, // Traz os mais recentes primeiro
    });
  }

  async deleteIncome(userId: string, incomeId: string) {
    // Programação Defensiva: Garante que a renda pertence ao usuário que pediu a exclusão
    const income = await this.prisma.income.findFirst({
      where: { id: incomeId, userId },
    });

    if (!income) {
      throw new HttpException(
        'Registro não encontrado ou acesso negado',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.income.delete({ where: { id: incomeId } });
    return { message: 'Renda deletada com sucesso' };
  }
}
