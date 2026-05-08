import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
// Ajuste os caminhos abaixo se o seu controller e service estiverem em pastas diferentes
import { DebtsController } from './services/debts.controller'; 
import { DebtsService } from './services/debts.service';
import { DebtAssistantService } from './services/debts.assistant.service';

@Module({
  imports: [PrismaModule], // Precisamos do Prisma aqui para o Service acessar o banco
  controllers: [DebtsController],
  providers: [DebtsService, DebtAssistantService],
  exports: [DebtsService],
})
export class DebtsModule {}