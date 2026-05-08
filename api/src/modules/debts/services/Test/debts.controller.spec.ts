/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DebtsService } from '../debts.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateDebtDto, DebtStatus, DebtType } from '../../dto/create-debt.dto';

describe('DebtsService (Controller/Secundário)', () => {
  let service: DebtsService;
  let prisma: PrismaService;

  // 1. Mock limpo do Prisma focado apenas no método create usado neste teste
  const mockPrismaService = {
    debt: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebtsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // 2. Injetamos o Prisma em vez do Mongoose Model
        },
      ],
    }).compile();

    service = module.get<DebtsService>(DebtsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDebt', () => {
    it('should create a debt and return the correct result', async () => {
      const createDebtDto: CreateDebtDto = {
        originalAmount: 1000,
        description: 'Test debt',
        dueDate: new Date(),
        currentAmount: 1000,
        remainingInstallments: 12,
        status: DebtStatus.PENDING,
        debtType: DebtType.LOAN,
      };

      // 3. O resultado esperado agora reflete a estrutura do Prisma (usando id em vez de _id)
      const expectedResult = { 
        id: 'mocked-id', 
        userId: 'user123',
        ...createDebtDto,
        totalAmountPaid: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaService.debt.create.mockResolvedValueOnce(expectedResult);

      const result = await service.createDebt('user123', createDebtDto);

      // 4. Validamos se o método correto do Prisma foi chamado
      expect(prisma.debt.create).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should throw HttpException if the save fails', async () => {
      // 5. Simulamos a falha do banco de dados no adapter do Prisma
      mockPrismaService.debt.create.mockRejectedValueOnce(
        new HttpException('Error creating debt', HttpStatus.BAD_REQUEST),
      );

      const createDebtDto: CreateDebtDto = {
        originalAmount: 1000,
        description: 'Test debt',
        dueDate: new Date(),
        currentAmount: 1000,
        remainingInstallments: 12,
        status: DebtStatus.PENDING,
        debtType: DebtType.LOAN,
      };

      await expect(service.createDebt('user123', createDebtDto)).rejects.toThrowError(
        new HttpException('Error creating debt', HttpStatus.BAD_REQUEST),
      );
    });
  });
});