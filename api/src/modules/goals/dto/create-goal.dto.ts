import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  IsDateString,
} from 'class-validator';
import { GoalStatus } from '@prisma/client';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty({ message: 'O título da meta é obrigatório' })
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'O valor alvo deve ser um número válido' })
  @Min(0.01)
  targetAmount!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentAmount?: number;

  @IsDateString({}, { message: 'O prazo deve ser uma data válida' })
  @IsOptional()
  deadline?: string;

  @IsEnum(GoalStatus, { message: 'Status inválido' })
  @IsOptional()
  status?: GoalStatus;
}
