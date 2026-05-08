/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DebtAssistantService } from '../../services/debts.assistant.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { DebtStatus } from '../../dto/create-debt.dto';

describe('DebtAssistantService', () => {
  let service: DebtAssistantService;
  let prisma: PrismaService;

  // 1. Dados mockados no padrão do schema Prisma
  const mockDebts = [
    {
      id: 'uuid-cartao-123',
      userId: 'user123',
      description: 'Cartão de Crédito',
      originalAmount: 1000,
      currentAmount: 1200,
      interestRate: 10,
      remainingInstallments: 12,
      dueDate: new Date('2025-06-01'),
      status: DebtStatus.PENDING,
      debtType: 'CREDIT_CARD',
      totalAmountPaid: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'uuid-emprestimo-456',
      userId: 'user123',
      description: 'Empréstimo Pessoal',
      originalAmount: 5000,
      currentAmount: 5200,
      interestRate: 5,
      remainingInstallments: 24,
      dueDate: new Date('2025-08-01'),
      status: DebtStatus.PENDING,
      debtType: 'LOAN',
      totalAmountPaid: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 2. Mock do Prisma Service com findMany
  const mockPrismaService = {
    debt: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    // 3. Montagem correta do módulo de teste (Injeção de Dependência real)
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebtAssistantService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DebtAssistantService>(DebtAssistantService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve priorizar corretamente as dívidas com base nos juros', async () => {
    const availableMonthlyAmount = 1000;
    const userId = 'user123';

    // 4. Simulamos a resposta do banco de dados
    mockPrismaService.debt.findMany.mockResolvedValueOnce(mockDebts);

    const result = await service.analyzeDebts(userId, availableMonthlyAmount);

    // 5. Validamos se a chamada ao Prisma está com a sintaxe correta do contrato
    expect(prisma.debt.findMany).toHaveBeenCalledWith({
      where: {
        userId,
        status: { not: DebtStatus.PAID },
      },
    });

    // 6. Validamos a regra de negócio (10% de juros > 5% de juros)
    expect(result.prioritizedDebts[0].name).toBe('Cartão de Crédito');
    expect(result.prioritizedDebts[1].name).toBe('Empréstimo Pessoal');
  });
});