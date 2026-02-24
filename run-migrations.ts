import { DataSource } from 'typeorm';
import { NutritionPlan } from './src/nutrition/nutrition-plan.entity';
import { NutritionCategory } from './src/nutrition/nutrition-category.entity';
import { NutritionDay } from './src/nutrition/nutrition-day.entity';
import { Meal } from './src/nutrition/meal.entity';
import { ClientNutritionPlan } from './src/nutrition/client-nutrition-plan.entity';
import { Client } from './src/users/client.entity';
import { Trainer } from './src/users/trainer.entity';
import { ProgressReport } from './src/progress/progress-report.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT as string, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'tryerfit',
  entities: [
    NutritionCategory,
    NutritionDay,
    NutritionPlan,
    Meal,
    ClientNutritionPlan,
    Client,
    Trainer,
    ProgressReport,
  ],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});

async function runMigrations() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
    
    console.log('Running migrations...');
    await AppDataSource.runMigrations();
    console.log('Migrations have been run successfully!');
    
    await AppDataSource.destroy();
  } catch (err) {
    console.error('Error during migration:', err);
  }
}

runMigrations();