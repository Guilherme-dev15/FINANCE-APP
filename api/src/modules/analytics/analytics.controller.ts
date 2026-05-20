import {
  Controller,
  Get,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport'; // 🛡️ Importação padrão de segurança
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

// Reutilizamos a interface de tipagem estrita
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email?: string;
  };
}

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth') // 🔒 Diz pro Swagger que essa rota exige o Token
@UseGuards(AuthGuard('jwt')) // O Leão de Chácara que barra quem não tem token
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('cashflow')
  @ApiOperation({ summary: 'Obter análise de viabilidade financeira (FCF)' })
  getCashflowAnalysis(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new HttpException(
        'Token JWT inválido ou usuário não identificado',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.analyticsService.getFinancialViability(userId);
  }
}
