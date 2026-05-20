/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  Put,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Query,
  Patch,
  Logger,
} from '@nestjs/common';
import { DebtsService } from './debts.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateDebtDto } from '../dto/create-debt.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PayDebtDto } from '../dto/pay.debt.dto';
import { SimulatePaymentDto } from '../dto/simulate-payment.dto';
import { DebtAssistantService } from './debts.assistant.service';
import { DebtStatus } from '@prisma/client';

// 🛡️ Tipagem estrita para a requisição autenticada (Mata o erro TS7006)
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email?: string;
  };
}

// Função auxiliar para validar o userId
function validateUserId(req: AuthenticatedRequest): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new HttpException('User ID is required', HttpStatus.UNAUTHORIZED);
  }
  return userId;
}

@ApiTags('Dívidas')
@ApiBearerAuth('JWT-auth')
@Controller('debts')
@UseGuards(AuthGuard('jwt')) // Protege todas as rotas com JWT
export class DebtsController {
  private readonly logger = new Logger(DebtsController.name);

  constructor(
    private readonly debtsService: DebtsService,
    private readonly debtAssistantService: DebtAssistantService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova dívida' })
  @ApiResponse({ status: 201, description: 'Dívida criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao criar dívida' })
  async createDebt(
    @Request() req: AuthenticatedRequest,
    @Body() debtData: CreateDebtDto,
  ) {
    const userId = validateUserId(req);
    this.logger.log(`Iniciando criação de dívida para o usuário ${userId}`);

    try {
      const result = await this.debtsService.createDebt(userId, debtData);
      this.logger.log('Dívida criada com sucesso');
      return result;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : 'Unknown error';
      this.logger.error('Erro ao criar dívida', errorStack);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create debt';
      throw new HttpException(
        errorMessage || 'Failed to create debt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('prioritized')
  async getPrioritized() {
    // Atenção: Esta rota não estava usando userId. Dependendo da lógica, deveria!
    return this.debtsService.findAllPrioritized();
  }

  @Get()
  @ApiOperation({ summary: 'Listar dívidas' })
  @ApiResponse({ status: 200, description: 'Listagem de dívidas' })
  @ApiResponse({ status: 500, description: 'Erro ao listar dívidas' })
  async listDebts(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: string, // Recebemos como string da URL
  ) {
    const userId = validateUserId(req);
    try {
      // 🚀 O pulo do gato: Convertemos a string para o Enum do Prisma
      return await this.debtsService.listDebts(userId, status as DebtStatus);
    } catch (error) {
      throw new HttpException(
        'Falha ao listar dívidas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'ID da dívida' })
  @ApiBody({ type: CreateDebtDto })
  @ApiOperation({ summary: 'Editar uma dívida' })
  async editDebt(
    @Request() req: AuthenticatedRequest,
    @Param('id') debtId: string,
    @Body() debtData: CreateDebtDto,
  ) {
    const userId = validateUserId(req);
    try {
      return await this.debtsService.editDebt(userId, debtId, debtData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to edit debt';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'ID da dívida' })
  @ApiOperation({ summary: 'Deletar uma dívida' })
  async deleteDebt(
    @Request() req: AuthenticatedRequest,
    @Param('id') debtId: string,
  ) {
    const userId = validateUserId(req);
    try {
      return await this.debtsService.deleteDebt(userId, debtId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete debt';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Realizar pagamento de dívida' })
  @ApiBody({ type: PayDebtDto })
  @ApiResponse({ status: 200, description: 'Pagamento realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Valor de pagamento inválido' })
  async payDebt(
    @Request() req: AuthenticatedRequest,
    @Param('id') debtId: string,
    @Body() paymentData: PayDebtDto,
  ) {
    const userId = validateUserId(req);
    if (paymentData.paymentAmount <= 0) {
      throw new HttpException(
        'O valor do pagamento deve ser maior que zero',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.debtsService.payDebt(
        userId,
        debtId,
        paymentData.paymentAmount,
      );
      if (!result) {
        throw new HttpException(
          'Pagamento não realizado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return {
        message: 'Pagamento realizado com sucesso!',
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Falha ao processar o pagamento';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/simulate-payment')
  @ApiOperation({ summary: 'Simular pagamento da dívida' })
  @ApiResponse({
    status: 200,
    description: 'Simulação de pagamento realizada com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Valor de pagamento inválido.' })
  @ApiResponse({
    status: 500,
    description: 'Falha interna ao simular o pagamento.',
  })
  async simulatePayment(
    @Request() req: AuthenticatedRequest,
    @Param('id') debtId: string,
    @Body() { paymentAmount }: SimulatePaymentDto,
  ) {
    const userId = validateUserId(req);

    if (paymentAmount <= 0) {
      throw new HttpException(
        'O valor do pagamento deve ser maior que zero',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const simulation = await this.debtsService.simulatePayment(
        userId,
        debtId,
        paymentAmount,
      );
      return { message: 'Simulação realizada com sucesso!', data: simulation };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Falha ao simular o pagamento';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/evolution')
  @ApiParam({ name: 'id', description: 'ID da dívida' })
  @ApiOperation({ summary: 'Obter evolução da dívida' })
  async getDebtEvolution(
    @Request() req: AuthenticatedRequest,
    @Param('id') debtId: string,
  ) {
    const userId = validateUserId(req);

    try {
      const evolution = await this.debtsService.getDebtEvolution(
        userId,
        debtId,
      );
      return evolution;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to retrieve debt evolution';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('report')
  @ApiOperation({ summary: 'Gerar relatório de dívidas' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Data de início (formato: yyyy-mm-dd)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'Data de término (formato: yyyy-mm-dd)',
  })
  async generateReport(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const userId = validateUserId(req);

    try {
      const report = await this.debtsService.generateDebtReport(
        userId,
        new Date(startDate),
        new Date(endDate),
      );
      return report;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate report';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id/project-payment')
  @ApiParam({ name: 'id', type: String, description: 'ID da dívida' })
  @ApiBody({
    description: 'Projeção de pagamento da dívida',
    type: Object,
    schema: {
      type: 'object',
      properties: {
        newPaymentAmount: {
          type: 'number',
          example: 150,
          description: 'Novo valor de pagamento',
        },
        newInterestRate: {
          type: 'number',
          example: 5,
          description: 'Nova taxa de juros',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Simular projeção de pagamento de dívida' })
  async simulatePaymentProjection(
    @Request() req: AuthenticatedRequest,
    @Param('id') debtId: string,
    @Body()
    projectionData: { newPaymentAmount: number; newInterestRate: number },
  ) {
    const userId = validateUserId(req);

    try {
      const projection = await this.debtsService.simulatePaymentProjection(
        userId,
        debtId,
        projectionData.newPaymentAmount,
        projectionData.newInterestRate,
      );
      return projection;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to simulate payment projection';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =========================================================
  // 🚨 CORREÇÃO DE SEGURANÇA: NUNCA RECEBA userId POR QUERY SE TEM JWT
  // =========================================================

  @Get('assistente/analisar')
  async analisarDividas(
    @Request() req: AuthenticatedRequest,
    @Query('renda') renda: number,
  ) {
    const userId = validateUserId(req);
    return this.debtAssistantService.analyzeDebts(userId, renda);
  }

  @Get('analyze')
  analyzeDebts(
    @Request() req: AuthenticatedRequest,
    @Query('amount') amount: string,
  ) {
    const userId = validateUserId(req);
    return this.debtAssistantService.analyzeDebts(userId, parseFloat(amount));
  }
}
