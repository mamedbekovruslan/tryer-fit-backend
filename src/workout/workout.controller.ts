import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainerWorkoutService } from './trainer-workout.service';
import {
  ClientWorkoutProgramResponse,
  toClientWorkoutProgramResponse,
} from './workout-response';
import { AccessControlService } from '../auth/access-control.service';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('workout')
@UseGuards(JwtAuthGuard)
export class WorkoutController {
  constructor(
    private readonly trainerWorkoutService: TrainerWorkoutService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get('clients/:clientId/active')
  async getActiveClientWorkoutPrograms(
    @Req() req: AuthenticatedRequest,
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<ClientWorkoutProgramResponse[]> {
    this.accessControlService.assertOwnClient(
      req.user,
      clientId,
      'You can only access your own workout programs',
    );
    const programs =
      await this.trainerWorkoutService.getActiveClientWorkoutPrograms(clientId);
    return programs.map(toClientWorkoutProgramResponse);
  }
}
