// 🛡️ O SSOT do Frontend: Tipagem idêntica ao Prisma e ao DTO do NestJS
export type GoalStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalDTO {
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  status?: GoalStatus;
}
