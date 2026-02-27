import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Client } from './users/client.entity';
import { Trainer } from './users/trainer.entity';
import { ProgressReport } from './progress/progress-report.entity';
import { NutritionCategory } from './nutrition/nutrition-category.entity';
import { NutritionDay } from './nutrition/nutrition-day.entity';
import { NutritionPlan } from './nutrition/nutrition-plan.entity';
import { Meal } from './nutrition/meal.entity';
import { ClientNutritionPlan } from './nutrition/client-nutrition-plan.entity';
import { WorkoutCategory } from './workout/workout-category.entity';
import { WorkoutProgram } from './workout/workout-program.entity';
import { WorkoutDay } from './workout/workout-day.entity';
import { Exercise } from './workout/exercise.entity';
import { ClientWorkoutProgram } from './workout/client-workout-program.entity';
import { ClientModule } from './users/client.module';
import { TrainerModule } from './users/trainer.module';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { ProgressReportModule } from './progress/progress-report.module';
import { NutritionCategoryModule } from './nutrition/nutrition-category.module';
import { NutritionDayModule } from './nutrition/nutrition-day.module';
import { NutritionPlanModule } from './nutrition/nutrition-plan.module';
import { MealModule } from './nutrition/meal.module';
import { ClientNutritionPlanModule } from './nutrition/client-nutrition-plan.module';
import { TrainerNutritionModule } from './nutrition/trainer-nutrition.module';
import { TrainerWorkoutModule } from './workout/trainer-workout.module';
import { ChatModule } from './chat/chat.module';
import { ChatMessage } from './chat/chat-message.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: (process.env.DB_HOST as string) || 'localhost',
      port: parseInt(process.env.DB_PORT as string, 10) || 5432,
      username: (process.env.DB_USERNAME as string) || 'postgres',
      password: (process.env.DB_PASSWORD as string) || 'password',
      database: (process.env.DB_NAME as string) || 'tryerfit',
      entities: [Client, Trainer, ProgressReport, NutritionCategory, NutritionDay, NutritionPlan, Meal, ClientNutritionPlan, WorkoutCategory, WorkoutProgram, WorkoutDay, Exercise, ClientWorkoutProgram, ChatMessage],
      synchronize: false,
    }),
    ClientModule,
    TrainerModule,
    AuthModule,
    HomeModule,
    ProgressReportModule,
    NutritionCategoryModule,
    NutritionDayModule,
    NutritionPlanModule,
    MealModule,
    ClientNutritionPlanModule,
    TrainerNutritionModule,
    TrainerWorkoutModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
