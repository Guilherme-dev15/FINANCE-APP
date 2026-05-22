/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { AuthGuard } from '@nestjs/passport';

// 🛡️ Tipagem estrita e padronizada do seu ecossistema
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email?: string;
  };
}

// 🛡️ Validador implacável de Tenant
function validateUserId(req: AuthenticatedRequest): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new HttpException('User ID is required', HttpStatus.UNAUTHORIZED);
  }
  return userId;
}

@Controller('incomes')
@UseGuards(AuthGuard('jwt')) // 🚀 Proteção total ativada
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  create(@Request() req: any, @Body() body: CreateIncomeDto) {
    // 👈 Tipagem obrigatória aqui
    return this.incomesService.create(req.user.userId, body);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    const userId = validateUserId(req);
    return this.incomesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = validateUserId(req);
    return this.incomesService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = validateUserId(req);
    return this.incomesService.update(id, userId, updateIncomeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = validateUserId(req);
    return this.incomesService.remove(id, userId);
  }
}
