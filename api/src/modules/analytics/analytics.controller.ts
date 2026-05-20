/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtStrategy } from '../auth/jwt.strategy';

@UseGuards(JwtStrategy)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('cashflow')
  getCashflowAnalysis(@Request() req: ExpressRequest) {
    // Alinhado estritamente com o contrato do seu JwtStrategy
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return this.analyticsService.getFinancialViability(
      (req.user as any).userId,
    );
  }
}
