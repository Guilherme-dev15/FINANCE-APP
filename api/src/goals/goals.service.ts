import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // ⚠️ Ajuste o caminho se necessário
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createGoalDto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        ...createGoalDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Traz os cofres mais recentes primeiro
    });
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id, userId }, // 🛡️ A trava de segurança: ID exato + Dono exato
    });

    if (!goal) {
      throw new NotFoundException(
        'Cofre não encontrado ou você não tem permissão.',
      );
    }

    return goal;
  }

  async update(id: string, userId: string, updateGoalDto: UpdateGoalDto) {
    await this.findOne(id, userId); // Dispara erro 404/500 se tentar hackear

    return this.prisma.goal.update({
      where: { id },
      data: updateGoalDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Dispara erro 404/500 se tentar hackear

    return this.prisma.goal.delete({
      where: { id },
    });
  }
}
