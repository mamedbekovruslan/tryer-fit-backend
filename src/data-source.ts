import 'dotenv/config';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Client } from './users/client.entity';
import { Trainer } from './users/trainer.entity';
import { ProgressReport } from './progress/progress-report.entity';
import { ProgressReportComment } from './progress/progress-report-comment.entity';
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
import { ChatMessage } from './chat/chat-message.entity';

export const appEntities = [
  Client,
  Trainer,
  ProgressReport,
  ProgressReportComment,
  NutritionCategory,
  NutritionDay,
  NutritionPlan,
  Meal,
  ClientNutritionPlan,
  WorkoutCategory,
  WorkoutProgram,
  WorkoutDay,
  Exercise,
  ClientWorkoutProgram,
  ChatMessage,
];

export const appDataSourceOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT as string, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'tryerfit',
  entities: appEntities,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
  migrationsTableName: 'typeorm_migrations',
};

const AppDataSource = new DataSource(appDataSourceOptions as DataSourceOptions);

export default AppDataSource;
