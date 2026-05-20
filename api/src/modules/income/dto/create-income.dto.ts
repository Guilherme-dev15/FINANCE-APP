/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreateIncomeDto {
  @ApiProperty({
    example: 'Salário Base',
    description: 'Descrição da entrada de dinheiro',
  })
  @IsString()
  @IsNotEmpty({ message: 'A descrição da renda é obrigatória.' })
  description!: string;

  @ApiProperty({
    example: 3800.0,
    description: 'Valor líquido recebido',
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'O valor da renda deve ser maior que zero.' })
  amount!: number;

  @ApiProperty({
    example: TransactionType.FIXED,
    enum: TransactionType,
    description: 'FIXED (Salário) ou VARIABLE (Bicos/Freelas)',
  })
  @IsEnum(TransactionType, { message: 'O tipo deve ser FIXED ou VARIABLE.' })
  type!: TransactionType;

  @ApiProperty({ example: '2026-05-14', description: 'Data de recebimento' })
  @IsDateString(
    {},
    { message: 'A data deve estar no formato válido (YYYY-MM-DD).' },
  )
  date!: string;
}
