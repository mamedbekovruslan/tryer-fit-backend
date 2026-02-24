import { Controller, Get, UseGuards, Req, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainerWorkoutService } from './trainer-workout.service';
import { ClientWorkoutProgram } from './client-workout-program.entity';

@Controller('workout')
@UseGuards(JwtAuthGuard)
export class WorkoutController {
  constructor(private readonly trainerWorkoutService: TrainerWorkoutService) {}

  @Get('clients/:clientId/active')
  async getActiveClientWorkoutPrograms(
    @Req() req,
    @Param('clientId') clientId: number,
  ): Promise<ClientWorkoutProgram[]> {
    const userId = req.user.userId;
    // Проверяем, что клиент запрашивает свои собственные программы
    if (parseInt(clientId.toString()) !== userId) {
      throw new Error('Unauthorized access to client workout programs');
    }
    return await this.trainerWorkoutService.getActiveClientWorkoutPrograms(clientId);
  }
}
