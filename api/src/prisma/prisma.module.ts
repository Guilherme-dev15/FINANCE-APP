import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Deixa o Prisma disponível no projeto todo sem precisar ficar importando o módulo
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}