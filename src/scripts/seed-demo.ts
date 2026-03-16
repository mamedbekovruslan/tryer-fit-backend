import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import AppDataSource from '../data-source';
import { Trainer } from '../users/trainer.entity';
import { Client, FitnessGoal } from '../users/client.entity';
import { ProgressReport } from '../progress/progress-report.entity';
import { ProgressReportComment } from '../progress/progress-report-comment.entity';
import { NutritionCategory } from '../nutrition/nutrition-category.entity';
import { NutritionPlan } from '../nutrition/nutrition-plan.entity';
import { NutritionDay } from '../nutrition/nutrition-day.entity';
import { Meal } from '../nutrition/meal.entity';
import { ClientNutritionPlan } from '../nutrition/client-nutrition-plan.entity';
import { WorkoutCategory } from '../workout/workout-category.entity';
import { WorkoutProgram } from '../workout/workout-program.entity';
import { WorkoutDay } from '../workout/workout-day.entity';
import { Exercise } from '../workout/exercise.entity';
import { ClientWorkoutProgram } from '../workout/client-workout-program.entity';
import { ChatMessage, SenderType } from '../chat/chat-message.entity';

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  try {
    await AppDataSource.transaction(async (manager) => {
      await manager.query(`
        TRUNCATE TABLE
          "progress_report_comments",
          "progress_reports",
          "client_nutrition_plans",
          "meals",
          "nutrition_days",
          "nutrition_plans",
          "nutrition_categories",
          "client_workout_programs",
          "exercises",
          "workout_days",
          "workout_programs",
          "workout_categories",
          "chat_messages",
          "clients",
          "trainers"
        RESTART IDENTITY CASCADE
      `);

      const passwordHash = await bcrypt.hash('Password123!', 10);

      const trainer = manager.create(Trainer, {
        username: 'trainer_demo',
        email: 'trainer@example.com',
        password_hash: passwordHash,
        first_name: 'Иван',
        last_name: 'Тренер',
        middle_name: 'Сергеевич',
        gender: 'male',
        height: 182.5,
        weight: 86.2,
        phone: '+79990000001',
        birth_date: new Date('1990-05-14'),
        education: 'Высшее спортивное образование',
        institution: 'РГУФКСМиТ',
        degree: 'Магистр',
        specialization: 'Силовая подготовка и снижение веса',
        certificate_number: 'TR-2026-0001',
        photo_urls: ['https://images.example.com/trainer-demo.jpg'],
      });
      await manager.save(trainer);

      const client = manager.create(Client, {
        username: 'client_demo',
        email: 'client@example.com',
        password_hash: passwordHash,
        first_name: 'Анна',
        last_name: 'Клиент',
        waist_circumference: 74.5,
        chest_circumference: 92.0,
        hip_circumference: 98.5,
        arm_circumference: 29.0,
        leg_circumference: 56.0,
        fitness_goal: FitnessGoal.WEIGHT_LOSS,
        expected_result: 'Снижение веса на 6 кг за 3 месяца',
        contraindications: 'Нет',
        diseases: 'Нет хронических заболеваний',
        limitations: 'Избегать ударной нагрузки на колени',
        training_experience: '1 год занятий в зале',
        current_diet: 'Умеренный дефицит калорий',
        photo_urls: ['https://images.example.com/client-demo.jpg'],
        weight: 68.4,
        body_fat: 24.3,
        muscle_mass: 27.8,
        trainer,
      });
      await manager.save(client);

      const progressReport = manager.create(ProgressReport, {
        date: new Date('2026-03-10T10:00:00.000Z'),
        weight: 68.4,
        waist: 74.5,
        hips: 98.5,
        chest: 92.0,
        arms: 29.0,
        thighs: 56.0,
        bodyFat: 24.3,
        muscleMass: 27.8,
        notes: 'Чувствую себя лучше, восстановление хорошее.',
        photoUrls: [
          'https://images.example.com/progress-front.jpg',
          'https://images.example.com/progress-side.jpg',
        ],
        client,
      });
      await manager.save(progressReport);

      const progressComment = manager.create(ProgressReportComment, {
        comment: 'Отличная динамика. Продолжаем текущий план и добавим 1 кардио-сессию.',
        report: progressReport,
        trainer,
      });
      await manager.save(progressComment);

      const nutritionCategory = manager.create(NutritionCategory, {
        name: 'Снижение веса',
        description: 'Рацион с дефицитом калорий и высоким содержанием белка.',
      });
      await manager.save(nutritionCategory);

      const nutritionPlan = manager.create(NutritionPlan, {
        name: 'Базовый план питания на сушку',
        description: 'Пятиразовое питание с акцентом на белок и овощи.',
        nutritionCategory,
        trainer,
      });
      await manager.save(nutritionPlan);

      const nutritionDay = manager.create(NutritionDay, {
        name: 'День 1',
        description: 'Тренировочный день с повышенным белком.',
        nutritionCategoryId: nutritionCategory.id,
        nutritionPlan,
      });
      await manager.save(nutritionDay);

      const meal = manager.create(Meal, {
        name: 'Завтрак',
        description: 'Овсянка, яйца и ягоды.',
        nutritionDay,
      });
      await manager.save(meal);

      const clientNutritionPlan = manager.create(ClientNutritionPlan, {
        client,
        nutritionPlan,
        is_active: true,
      });
      await manager.save(clientNutritionPlan);

      const workoutCategory = manager.create(WorkoutCategory, {
        name: 'Силовые тренировки',
        description: 'Базовые силовые тренировки для всего тела.',
      });
      await manager.save(workoutCategory);

      const workoutProgram = manager.create(WorkoutProgram, {
        name: 'Full Body Start',
        description: 'Стартовая программа на 3 тренировки в неделю.',
        workoutCategory,
        trainer,
      });
      await manager.save(workoutProgram);

      const workoutDay = manager.create(WorkoutDay, {
        name: 'День A',
        description: 'Ноги, спина, жим.',
        dayOrder: 1,
        workoutProgram,
      });
      await manager.save(workoutDay);

      const exercise = manager.create(Exercise, {
        name: 'Приседания со штангой',
        description: 'Базовое упражнение на ноги и корпус.',
        sets: 4,
        reps: '10-12',
        weight: '30 кг',
        restTime: '90 сек',
        exerciseOrder: 1,
        workoutDay,
      });
      await manager.save(exercise);

      const clientWorkoutProgram = manager.create(ClientWorkoutProgram, {
        client,
        workoutProgram,
        isActive: true,
      });
      await manager.save(clientWorkoutProgram);

      const chatMessage = manager.create(ChatMessage, {
        senderId: trainer.id,
        receiverId: client.id,
        senderType: SenderType.TRAINER,
        message: 'Добро пожаловать в программу. Завтра начинаем по плану.',
        isRead: false,
      });
      await manager.save(chatMessage);
    });

    console.log('Demo seed completed successfully.');
    console.log('Trainer: trainer@example.com / Password123!');
    console.log('Client: client@example.com / Password123!');
  } finally {
    await AppDataSource.destroy();
  }
}

void seed();
