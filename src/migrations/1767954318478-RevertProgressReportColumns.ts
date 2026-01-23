import { MigrationInterface, QueryRunner } from "typeorm";

export class RevertProgressReportColumns1767954318478 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Возвращаем колонки к именам в snake_case
        await queryRunner.query(`
            ALTER TABLE "progress_reports" 
            RENAME COLUMN "bodyFat" TO "body_fat"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "progress_reports" 
            RENAME COLUMN "muscleMass" TO "muscle_mass"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Возвращаем колонки к именам в camelCase
        await queryRunner.query(`
            ALTER TABLE "progress_reports" 
            RENAME COLUMN "body_fat" TO "bodyFat"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "progress_reports" 
            RENAME COLUMN "muscle_mass" TO "muscleMass"
        `);
    }

}