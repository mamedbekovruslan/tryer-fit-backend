import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { appDataSourceOptions } from './data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot(appDataSourceOptions),
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
