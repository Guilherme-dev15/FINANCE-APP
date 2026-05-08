/* eslint-disable @typescript-eslint/no-require-imports */
import request = require('supertest');
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../../app.module'; 
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../prisma/prisma.service';
import { DebtType, DebtStatus } from '../../dto/create-debt.dto';
import { App } from 'supertest/types';

describe('DebtsController (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let prisma: PrismaService;
  let validToken: string;
  const testUserId = 'user-e2e-123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // 1. Replicamos o comportamento do main.ts para o teste capturar os erros de DTO (400 Bad Request)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // 2. Limpamos a base de testes para evitar conflitos de restrição única (email/id)
    await prisma.debt.deleteMany();
    await prisma.user.deleteMany();

    // 3. Criamos um usuário real no banco para satisfazer a chave estrangeira (Relation) do Prisma
    await prisma.user.create({
      data: {
        id: testUserId,
        email: 'e2e@test.com',
        password: 'hashed-password',
      },
    });

    // 4. Geramos um token JWT real, assinado pelo módulo de Auth da aplicação
    validToken = jwtService.sign({ sub: testUserId, email: 'e2e@test.com' });
  });

  afterAll(async () => {
    // Limpamos o banco após os testes
    await prisma.debt.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('POST /debts - success', async () => {
    return request(app.getHttpServer())
      .post('/debts')
      .set('Authorization', `Bearer ${validToken}`) // 👈 Usa o token real
      .send({
        description: 'Test debt',
        originalAmount: 1000,
        currentAmount: 1000, // 👈 Corrigido: era paidAmount
        dueDate: '2025-12-31',
        remainingInstallments: 12,
        interestRate: 2,
        debtType: DebtType.LOAN,
        status: DebtStatus.PENDING,
      })
      .expect(201); // Sucesso
  });

  it('POST /debts - fail (missing required fields)', async () => {
    return request(app.getHttpServer())
      .post('/debts')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        originalAmount: 1000,
        dueDate: '2025-12-31',
        currentAmount: 1000,
        remainingInstallments: 12,
        // 👈 Falta o campo 'description' que é obrigatório
      })
      .expect(400); // 👈 Espera 400 Bad Request retornado pelo ValidationPipe
  });
  
  it('POST /debts - fail (unauthorized without token)', async () => {
    return request(app.getHttpServer())
      .post('/debts')
      .send({
        description: 'Test debt',
        originalAmount: 1000,
        currentAmount: 1000,
        dueDate: '2025-12-31',
        remainingInstallments: 12,
      })
      .expect(401); // 👈 Espera 401 Unauthorized do JwtAuthGuard
  });
});