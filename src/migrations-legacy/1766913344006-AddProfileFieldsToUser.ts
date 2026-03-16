/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileFieldsToUser1766913344006 implements MigrationInterface {
  name = 'AddProfileFieldsToUser1766913344006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем существование столбцов перед добавлением
    const tableColumns = await queryRunner.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users'
            AND column_name IN (
                'waist_circumference', 'chest_circumference', 'hip_circumference',
                'arm_circumference', 'leg_circumference', 'fitness_goal',
                'expected_result', 'contraindications', 'diseases', 'limitations',
                'training_experience', 'current_diet', 'photo_urls'
            )
        `);

    const existingColumns = tableColumns.map((col: any) => col.column_name);

    // Добавляем только отсутствующие столбцы
    if (!existingColumns.includes('waist_circumference')) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "waist_circumference" DECIMAL(5,2)`,
      );
    }
    if (!existingColumns.includes('chest_circumference')) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "chest_circumference" DECIMAL(5,2)`,
      );
    }
    if (!existingColumns.includes('hip_circumference')) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "hip_circumference" DECIMAL(5,2)`,
      );
    }
    if (!existingColumns.includes('arm_circumference')) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "arm_circumference" DECIMAL(5,2)`,
      );
    }
    if (!existingColumns.includes('leg_circumference')) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "leg_circumference" DECIMAL(5,2)`,
      );
    }
    if (!existingColumns.includes('fitness_goal')) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "fitness_goal" text CHECK ("fitness_goal" IN ('weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'))`,
      );
    }
    if (!existingColumns.includes('expected_result')) {
      await queryRunner.query(`ALTER TABLE "users" ADD "expected_result" text`);
    }
    if (!existingColumns.includes('contraindications')) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "contraindications" text`,
      );
    }
    if (!existingColumns.includes('diseases')) {
      await queryRunner.query(`ALTER TABLE "users" ADD "diseases" text`);
    }
    if (!existingColumns.includes('limitations')) {
      await queryRunner.query(`ALTER TABLE "users" ADD "limitations" text`);
    }
    if (!existingColumns.includes('training_experience')) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "training_experience" text`,
      );
    }
    if (!existingColumns.includes('current_diet')) {
      await queryRunner.query(`ALTER TABLE "users" ADD "current_diet" text`);
    }
    if (!existingColumns.includes('photo_urls')) {
      await queryRunner.query(`ALTER TABLE "users" ADD "photo_urls" text[]`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "photo_urls"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "current_diet"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "training_experience"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "limitations"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "diseases"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "contraindications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "expected_result"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fitness_goal"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "leg_circumference"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "arm_circumference"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "hip_circumference"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "chest_circumference"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "waist_circumference"`,
    );
  }
}
