import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProtectedModule } from '../protected/protected.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { DebtsModule } from './debts/debts.module';
import { ExpenseModule } from './expenses/expense.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GoalsModule } from './goals/goals.module';
import { IncomesModule } from './incomes/incomes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DebtsModule,
    ProtectedModule,
    ExpenseModule,
    AnalyticsModule,
    GoalsModule,
    IncomesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
