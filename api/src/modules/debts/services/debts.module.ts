import { Module } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { DebtsController } from './debts.controller';
import { DebtAssistantService } from './debts.assistant.service';

// 1. Injetamos o Prisma (ajuste os pontos '../' conforme a pasta do seu PrismaModule, se necessário)
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [
    // 2. MongooseModule removido, PrismaModule entra no lugar
    PrismaModule
  ],
  providers: [
    DebtsService,
    DebtAssistantService
  ],
  controllers: [DebtsController],
  exports: [DebtsService, DebtAssistantService],
})
export class DebtsModule { }