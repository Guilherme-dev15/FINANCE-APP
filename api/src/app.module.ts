 
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ProtectedModule } from './protected/protected.module'; 
import { PrismaModule } from './prisma/prisma.module'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DebtsModule } from './modules/debts/debts.module';
import { IncomeModule } from './modules/income/income.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // ConfigModule carrega as variáveis do .env (como a DATABASE_URL)
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    AuthModule,
    DebtsModule,
    ProtectedModule,
    IncomeModule,
    ExpenseModule,
    AnalyticsModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}