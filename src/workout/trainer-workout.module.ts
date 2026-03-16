import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerWorkoutController } from './trainer-workout.controller';
import { WorkoutController } from './workout.controller';
import { TrainerWorkoutService } from './trainer-workout.service';
import { WorkoutCategory } from './workout-category.entity';
import { WorkoutProgram } from './workout-program.entity';
import { WorkoutDay } from './workout-day.entity';
import { Exercise } from './exercise.entity';
import { ClientWorkoutProgram } from './client-workout-program.entity';
import { Trainer } from '../users/trainer.entity';
import { Client } from '../users/client.entity';
import { AccessControlModule } from '../auth/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutCategory,
      WorkoutProgram,
      WorkoutDay,
      Exercise,
      ClientWorkoutProgram,
      Trainer,
      Client,
    ]),
    AccessControlModule,
  ],
  controllers: [TrainerWorkoutController, WorkoutController],
  providers: [TrainerWorkoutService],
  exports: [TrainerWorkoutService],
})
export class TrainerWorkoutModule {}
