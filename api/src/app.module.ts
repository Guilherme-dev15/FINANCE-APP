import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ProtectedModule } from './protected/protected.module'; 
import { DebtsModule } from './modules/debts/services/debts.module';
import { PrismaModule } from './prisma/prisma.module'; 

@Module({
  imports: [
    // ConfigModule carrega as variáveis do .env (como a DATABASE_URL)
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    AuthModule,
    DebtsModule,
    ProtectedModule, 
  ],
})
export class AppModule {}