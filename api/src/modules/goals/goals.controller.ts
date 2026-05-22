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
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { AuthGuard } from '@nestjs/passport';

// 🛡️ Tipagem estrita padronizada com o resto do sistema
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email?: string;
  };
}

// 🛡️ Função validadora clonada do DebtsController (Padronização)
function validateUserId(req: AuthenticatedRequest): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new HttpException('User ID is required', HttpStatus.UNAUTHORIZED);
  }
  return userId;
}

@Controller('goals')
@UseGuards(AuthGuard('jwt')) // 🚀 O Guard correto do seu sistema
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createGoalDto: CreateGoalDto,
  ) {
    const userId = validateUserId(req);
    return this.goalsService.create(userId, createGoalDto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    const userId = validateUserId(req);
    return this.goalsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = validateUserId(req);
    return this.goalsService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = validateUserId(req);
    return this.goalsService.update(id, userId, updateGoalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = validateUserId(req);
    return this.goalsService.remove(id, userId);
  }
}
