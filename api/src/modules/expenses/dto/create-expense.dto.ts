import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  IsIn,
  IsOptional, // 👈 Importação adicionada
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, ExpenseCategory } from '@prisma/client';

export class CreateExpenseDto {
  @ApiProperty({
    example: 'Aluguel + Condomínio',
    description: 'Descrição da saída de dinheiro',
  })
  @IsString()
  @IsNotEmpty({ message: 'A descrição da despesa é obrigatória.' })
  description!: string;

  @ApiProperty({ example: 1500.0, description: 'Valor gasto', minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'O valor da despesa deve ser maior que R$ 0,00.' })
  amount!: number;

  @ApiProperty({
    example: TransactionType.FIXED,
    enum: TransactionType,
    description: 'FIXED (Fixo/Recorrente) ou VARIABLE (Avulso)',
  })
  // 🛡️ Vacina aplicada no TransactionType
  @IsIn(Object.values(TransactionType), {
    message: 'O tipo deve ser FIXED ou VARIABLE.',
  })
  type!: TransactionType;

  @ApiProperty({
    example: ExpenseCategory.ESSENTIAL,
    enum: ExpenseCategory,
    description: 'Nível de necessidade do gasto',
  })
  // 🛡️ Vacina aplicada no ExpenseCategory + IsOptional adicionado
  @IsOptional()
  @IsIn(Object.values(ExpenseCategory), {
    message: 'A categoria deve ser ESSENTIAL, LIFESTYLE ou WASTE.',
  })
  category?: ExpenseCategory = undefined;

  @ApiProperty({ example: '2026-05-14', description: 'Data do gasto' })
  @IsDateString(
    {},
    { message: 'A data deve estar no formato válido (YYYY-MM-DD).' },
  )
  date!: string;
}
