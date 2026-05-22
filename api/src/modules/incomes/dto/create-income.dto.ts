import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsEnum,
  IsDateString,
  IsOptional,
  IsIn,
} from 'class-validator';
import { TransactionType, IncomeCategory } from '@prisma/client';

export class CreateIncomeDto {
  @IsString()
  @IsNotEmpty({ message: 'A descrição da receita é obrigatória' })
  description!: string;

  @IsNumber({}, { message: 'O valor deve ser um número válido' })
  @Min(0.01, { message: 'O valor da receita deve ser maior que zero' })
  amount!: number;

  @IsDateString({}, { message: 'A data deve ser válida' })
  date!: string;

  @IsEnum(TransactionType, { message: 'Tipo de transação inválido' })
  @IsOptional()
  type?: TransactionType;

  @IsOptional()
  @IsIn(Object.values(IncomeCategory)) // 🛡️ Avaliação explícita em tempo de execução
  category?: IncomeCategory = undefined;
}
