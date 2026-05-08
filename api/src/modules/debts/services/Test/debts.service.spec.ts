/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DebtsService } from '../debts.service';
import { HttpException } from '@nestjs/common';
import { CreateDebtDto, DebtStatus, DebtType } from '../../dto/create-debt.dto';
import { PrismaService } from '../../../../prisma/prisma.service';

describe('DebtsService', () => {
  let service: DebtsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    debt: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockDebtData = {
    id: 'mockedId', 
    userId: 'user123',
    description: 'Cartão',
    originalAmount: 1000,
    currentAmount: 1000,
    dueDate: new Date(),
    interestRate: 2,
    remainingInstallments: 10,
    status: DebtStatus.PENDING,
    debtType: 'CREDIT_CARD',
    totalAmountPaid: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebtsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DebtsService>(DebtsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDebt', () => {
    it('deve criar uma dívida com sucesso', async () => {
      const createDto: CreateDebtDto = {
        description: 'Empréstimo',
        originalAmount: 1000,
        currentAmount: 1000,
        dueDate: new Date(),
        interestRate: 1.5,
        remainingInstallments: 5,
        status: DebtStatus.PENDING,
        debtType: DebtType.LOAN,
      };

      mockPrismaService.debt.create.mockResolvedValueOnce(mockDebtData);

      const result = await service.createDebt('user123', createDto);

      expect(result).toEqual(mockDebtData);
      expect(prisma.debt.create).toHaveBeenCalled();
    });

    it('deve lançar exceção se originalAmount <= 0', async () => {
      const createDto: CreateDebtDto = {
        description: 'Dívida inválida',
        originalAmount: 0,
        currentAmount: 0,
        dueDate: new Date(),
        interestRate: 1.5,
        remainingInstallments: 3,
        status: DebtStatus.PENDING,
        debtType: DebtType.LOAN,
      };

      await expect(service.createDebt('user123', createDto)).rejects.toThrow(HttpException);
    });
  });

  describe('listDebts', () => {
    it('deve retornar todas as dívidas do usuário sem filtro de status', async () => {
      const userId = 'user123';
      const mockDebts = [
        { id: 'debt1', userId, description: 'Cartão de crédito', originalAmount: 1000, currentAmount: 900, status: 'pending', interestRate: 0 },
        { id: 'debt2', userId, description: 'Empréstimo pessoal', originalAmount: 2000, currentAmount: 1500, status: 'pending', interestRate: 0 },
      ];

      mockPrismaService.debt.findMany.mockResolvedValueOnce(mockDebts);

      const result = await service.listDebts(userId);

      expect(result).toMatchObject([
        { id: 'debt1', currentAmount: 900, currentBalance: 900 },
        { id: 'debt2', currentAmount: 1500, currentBalance: 1500 }
      ]);
      
      expect(prisma.debt.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId }) }));
    });
  });

  describe('getDebtById', () => {
    it('deve retornar a dívida corretamente se existir', async () => {
      const userId = 'user123';
      const debtId = 'debt456';
      const mockDebt = { ...mockDebtData, id: debtId };

      mockPrismaService.debt.findUnique.mockResolvedValueOnce(mockDebt);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(mockDebt);

      const result = await service.getDebtById(userId, debtId);
      expect(result).toEqual(mockDebt);
    });

    it('deve lançar exceção se a dívida não for encontrada', async () => {
      const userId = 'user123';
      const debtId = 'debt999';

      mockPrismaService.debt.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(null);

      await expect(service.getDebtById(userId, debtId)).rejects.toThrow(HttpException);
    });
  });

  describe('editDebt', () => {
    it('deve atualizar a dívida corretamente quando encontrada', async () => {
      const userId = 'user123';
      const debtId = 'mockedId';
      const updateDto: CreateDebtDto = {
        description: 'Nova descrição',
        originalAmount: 5000,
        dueDate: new Date('2025-08-01'),
        currentAmount: 4500,
        remainingInstallments: 10,
        interestRate: 2,
        status: DebtStatus.PENDING,
        debtType: DebtType.LOAN,
      };

      const mockUpdatedDebt = { id: debtId, userId, ...updateDto };

      mockPrismaService.debt.findUnique.mockResolvedValueOnce(mockDebtData);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(mockDebtData);
      mockPrismaService.debt.update.mockResolvedValueOnce(mockUpdatedDebt);

      const result = await service.editDebt(userId, debtId, updateDto);

      expect(result.description).toBe(updateDto.description);
      expect(prisma.debt.update).toHaveBeenCalled();
    });

    it('deve lançar exceção se a dívida não for encontrada', async () => {
      const userId = 'user123';
      const debtId = 'nonexistentId';
      const updateDto: CreateDebtDto = {
        description: 'Atualização',
        originalAmount: 1000,
        dueDate: new Date(),
        currentAmount: 800,
        remainingInstallments: 4,
        interestRate: 1,
        status: DebtStatus.PENDING,
        debtType: DebtType.LOAN,
      };

      mockPrismaService.debt.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(null);

      await expect(service.editDebt(userId, debtId, updateDto)).rejects.toThrow('Dívida não encontrada');
    });
  });

  describe('deleteDebt', () => {
    it('deve excluir a dívida quando encontrada', async () => {
      const userId = 'user123';
      const debtId = 'mockedId';

      mockPrismaService.debt.findUnique.mockResolvedValueOnce(mockDebtData);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(mockDebtData);
      mockPrismaService.debt.delete.mockResolvedValueOnce({ id: debtId, userId });

      await service.deleteDebt(userId, debtId);
      expect(prisma.debt.delete).toHaveBeenCalled();
    });

    it('deve lançar exceção se a dívida não for encontrada', async () => {
      const userId = 'user123';
      const debtId = 'nonexistentId';

      mockPrismaService.debt.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(null);

      await expect(service.deleteDebt(userId, debtId)).rejects.toThrow('Dívida não encontrada');
    });
  });

  describe('simulatePayment', () => {
    it('deve simular corretamente o pagamento com juros', async () => {
      const userId = 'user123';
      const debtId = 'mockedDebtId';
      const mockDebt = { id: debtId, userId, currentAmount: 1000, interestRate: 12 };

      mockPrismaService.debt.findUnique.mockResolvedValueOnce(mockDebt);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(mockDebt);

      const result = await service.simulatePayment(userId, debtId, 200);

      expect(result.monthsToPay).toBeGreaterThan(0);
      expect(result.remainingAmount).toBe(0);
    });

    it('deve lançar erro se o valor do pagamento for zero ou negativo', async () => {
      const userId = 'user123';
      const debtId = 'mockedDebtId';
      const mockDebt = { id: debtId, userId, currentAmount: 1000, interestRate: 12 };

      mockPrismaService.debt.findUnique.mockResolvedValueOnce(mockDebt);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(mockDebt);

      await expect(service.simulatePayment(userId, debtId, 0)).rejects.toThrow('O valor do pagamento deve ser maior que zero');
    });

    it('deve simular corretamente pagamento com taxa de juros zero', async () => {
      const userId = 'user123';
      const debtId = 'mockedDebtId';
      const mockDebt = { id: debtId, userId, currentAmount: 1000, interestRate: 0 };

      mockPrismaService.debt.findUnique.mockResolvedValueOnce(mockDebt);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(mockDebt);

      const result = await service.simulatePayment(userId, debtId, 250);

      expect(result.monthsToPay).toBe(4);
      expect(result.remainingAmount).toBe(0);
    });
  });

  describe('generateDebtReport', () => {
    it('deve gerar um relatório correto dentro do intervalo de datas', async () => {
      const userId = 'user123';
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      const mockDebts = [
        { id: 'debt1', description: 'Cartão de crédito', originalAmount: 3000, currentAmount: 1000, dueDate: new Date('2025-06-01'), status: DebtStatus.PENDING },
        { id: 'debt2', description: 'Empréstimo pessoal', originalAmount: 5000, currentAmount: 3000, dueDate: new Date('2025-10-01'), status: DebtStatus.PAID },
      ];

      mockPrismaService.debt.findMany.mockResolvedValueOnce(mockDebts);

      const result = await service.generateDebtReport(userId, startDate, endDate);

      expect(result.totalDebt).toBe(8000);
      expect(result.totalPaid).toBe(4000);
      expect(result.debts).toHaveLength(2);
      expect(prisma.debt.findMany).toHaveBeenCalledWith({
        where: { userId, dueDate: { gte: startDate, lte: endDate } }
      });
    });

    it('deve retornar valores zerados se não houver dívidas no intervalo', async () => {
      const userId = 'user123';
      mockPrismaService.debt.findMany.mockResolvedValueOnce([]);

      const result = await service.generateDebtReport(userId, new Date(), new Date());

      expect(result.totalDebt).toBe(0);
      expect(result.totalPaid).toBe(0);
      expect(result.debts).toEqual([]);
    });
  });

  describe('simulatePaymentProjection', () => {
    it('deve retornar a quantidade de meses e o valor restante como 0', async () => {
      const mockDebt = { ...mockDebtData, currentAmount: 1000, interestRate: 2 };
      mockPrismaService.debt.findUnique.mockResolvedValueOnce(mockDebt);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(mockDebt);

      const result = await service.simulatePaymentProjection('user123', 'mockedId', 300, 2);

      expect(result.monthsToPay).toBeGreaterThan(0);
      expect(result.remainingAmount).toBe(0);
    });

    it('deve lançar exceção se a dívida não for encontrada', async () => {
      mockPrismaService.debt.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.simulatePaymentProjection('user123', 'invalidId', 300, 2),
      ).rejects.toThrowError('Dívida não encontrada');
    });

    it('deve retornar projeção correta com pagamento suficiente', async () => {
      mockPrismaService.debt.findUnique.mockResolvedValueOnce(mockDebtData);
      mockPrismaService.debt.findFirst.mockResolvedValueOnce(mockDebtData);

      const result = await service.simulatePaymentProjection('user123', 'mockedId', 150, 2);

      expect(result).toHaveProperty('monthsToPay');
      expect(result).toHaveProperty('remainingAmount');
      expect(result.remainingAmount).toBe(0);
    });
  });
});