/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import type { Request as ExpressRequest } from 'express';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtStrategy } from '../auth/jwt.strategy'; // Ajuste o caminho

@UseGuards(JwtStrategy)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(
    @Request() req: ExpressRequest,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expenseService.createExpense(
      (req.user as any).id,
      createExpenseDto,
    );
  }

  @Get()
  findAll(@Request() req: ExpressRequest) {
    return this.expenseService.findAllByUser((req.user as any).id);
  }

  @Delete(':id')
  remove(@Request() req: ExpressRequest, @Param('id') id: string) {
    return this.expenseService.deleteExpense((req.user as any).id, id);
  }
}
