import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createIncomeDto: CreateIncomeDto) {
    return this.prisma.income.create({
      data: {
        ...createIncomeDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.income.findMany({
      where: { userId },
      orderBy: { date: 'desc' }, // Traz as receitas mais recentes primeiro
    });
  }

  async findOne(id: string, userId: string) {
    const income = await this.prisma.income.findUnique({
      where: { id, userId },
    });

    if (!income) {
      throw new NotFoundException(
        'Receita não encontrada ou você não tem permissão.',
      );
    }

    return income;
  }

  async update(id: string, userId: string, updateIncomeDto: UpdateIncomeDto) {
    await this.findOne(id, userId); // Trava de segurança

    return this.prisma.income.update({
      where: { id },
      data: updateIncomeDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Trava de segurança

    return this.prisma.income.delete({
      where: { id },
    });
  }
}
