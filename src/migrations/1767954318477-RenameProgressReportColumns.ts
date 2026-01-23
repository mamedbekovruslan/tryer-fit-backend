import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameProgressReportColumns1767954318477 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Переименовываем колонки в таблице progress_reports для соответствия именам в сущности
        await queryRunner.query(`
            ALTER TABLE "progress_reports"
            RENAME COLUMN "body_fat" TO "bodyFat"
        `);

        await queryRunner.query(`
            ALTER TABLE "progress_reports"
            RENAME COLUMN "muscle_mass" TO "muscleMass"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Возвращаем колонки к прежним именам
        await queryRunner.query(`
            ALTER TABLE "progress_reports"
            RENAME COLUMN "bodyFat" TO "body_fat"
        `);

        await queryRunner.query(`
            ALTER TABLE "progress_reports"
            RENAME COLUMN "muscleMass" TO "muscle_mass"
        `);
    }

}