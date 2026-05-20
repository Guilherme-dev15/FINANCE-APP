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
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { JwtStrategy } from '../auth/jwt.strategy'; // Ajuste o caminho se necessário

@UseGuards(JwtStrategy)
@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  create(@Request() req, @Body() createIncomeDto: CreateIncomeDto) {
    return this.incomeService.createIncome(req.user.id, createIncomeDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.incomeService.findAllByUser(req.user.id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.incomeService.deleteIncome(req.user.id, id);
  }
}
