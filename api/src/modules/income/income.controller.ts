import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { AuthGuard } from '@nestjs/passport'; // 🛡️ Importação correta do porteiro

// Tipagem estrita para o TypeScript parar de reclamar do req.user
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email?: string;
  };
}

@UseGuards(AuthGuard('jwt')) // 🚨 CORREÇÃO 1: Usa-se o Guard do Passport
@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createIncomeDto: CreateIncomeDto,
  ) {
    // 🚨 CORREÇÃO 2: req.user.userId (Contrato estabelecido na JwtStrategy)
    return this.incomeService.createIncome(req.user.userId, createIncomeDto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.incomeService.findAllByUser(req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.incomeService.deleteIncome(req.user.userId, id);
  }
}
