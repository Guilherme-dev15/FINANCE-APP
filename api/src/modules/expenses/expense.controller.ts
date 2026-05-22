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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { AuthGuard } from '@nestjs/passport'; // 🛡️ Importação correta

// Tipagem estrita para arrancar o 'any' do código
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email?: string;
  };
}

@UseGuards(AuthGuard('jwt')) // 🚨 CORREÇÃO: O '@' estava faltando!
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    // 🚨 CORREÇÃO: O contrato exige userId
    return this.expenseService.createExpense(req.user.userId, createExpenseDto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.expenseService.findAllByUser(req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.expenseService.deleteExpense(req.user.userId, id);
  }
}
